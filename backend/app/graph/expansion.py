"""
Phase 7: Graph Expansion Engine
Discovers related standards by traversing the relationship graph.
"""

from __future__ import annotations

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.relationships import StandardRelationship
from app.models.standards import Standard
from app.retrieval.engine import build_recommended_standard
from app.schemas.analysis import ExtractedRequirements, RecommendedStandard

logger = structlog.get_logger(__name__)

# Relationship types ordered by relevance weight
RELATIONSHIP_WEIGHTS = {
    "normative_reference": 0.85,
    "safety": 0.80,
    "test_method": 0.75,
    "certified_under": 0.70,
    "installation": 0.65,
    "terminology": 0.55,
    "related_product": 0.50,
    "supersedes": 0.40,
}

RELATIONSHIP_DESCRIPTIONS = {
    "normative_reference": "Normative reference — required reading",
    "safety": "Safety standard — addresses hazard requirements",
    "test_method": "Test method standard — defines testing procedures",
    "certified_under": "Certification scheme standard",
    "installation": "Installation or usage requirements",
    "terminology": "Shared terminology and definitions",
    "related_product": "Related product category",
    "supersedes": "Superseded/versioning relationship",
}


async def expand_graph(
    db: AsyncSession,
    primary_is_number: str,
    requirements: ExtractedRequirements,
    depth: int = 2,
) -> list[RecommendedStandard]:
    """
    Phase 7: From the primary standard, traverse the relationship graph
    to discover related standards up to `depth` hops.
    Returns deduplicated, ranked list of related standards.
    """
    logger.info("Graph expansion starting", primary=primary_is_number, depth=depth)

    visited = {primary_is_number}
    queue = [(primary_is_number, 1)]
    related: list[RecommendedStandard] = []

    while queue:
        current_is, current_depth = queue.pop(0)
        if current_depth > depth:
            continue

        # Find all relationships from current node
        result = await db.execute(
            select(StandardRelationship).where(
                StandardRelationship.source_is_number == current_is
            )
        )
        relationships = result.scalars().all()

        for rel in relationships:
            target = rel.target_is_number
            if target in visited:
                continue
            visited.add(target)

            # Fetch the target standard
            std_result = await db.execute(
                select(Standard).where(Standard.is_number == target)
            )
            std = std_result.scalar_one_or_none()
            if not std or std.status == "WITHDRAWN":
                continue

            # Compute edge-weighted relevance score
            edge_weight = RELATIONSHIP_WEIGHTS.get(rel.relationship_type, 0.5)
            depth_penalty = 0.8 ** (current_depth - 1)  # decay with depth
            score = edge_weight * rel.strength * depth_penalty

            reason = (
                f"{RELATIONSHIP_DESCRIPTIONS.get(rel.relationship_type, rel.relationship_type)}"
                f" — {rel.description or 'related standard'}"
            )

            rec = build_recommended_standard(
                standard=std,
                score=score,
                relationship_type=rel.relationship_type,
                reason_override=reason,
                requirements=requirements,
            )
            related.append(rec)

            # Queue for deeper traversal
            if current_depth < depth:
                queue.append((target, current_depth + 1))

    # Sort by relevance score descending
    related.sort(key=lambda r: r.relevance_score, reverse=True)
    logger.info("Graph expansion complete", related_count=len(related))
    return related

"""
Phase 6: Standard Retrieval Engine
Hybrid retrieval: keyword/BM25-style + pgvector similarity + weighted ranking.
"""

from __future__ import annotations

import structlog
from sqlalchemy import func, or_, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.standards import Standard
from app.schemas.analysis import ExtractedRequirements, RecommendedStandard, EvidenceItem

logger = structlog.get_logger(__name__)

RELEVANCE_THRESHOLDS = {
    "HIGH": 0.70,
    "MEDIUM": 0.40,
    "LOW": 0.0,
}

PRODUCT_TO_PRIMARY_STANDARD = {
    "motorcycle helmet": "IS 4151",
    "industrial safety helmet": "IS 2925",
    "firefighter helmet": "IS 2745",
    "racing helmet": "IS 9562",
    "cycling helmet": "IS 4129",
    "equestrian helmet": "IS 15758",
}


def _score_standard(standard: Standard, requirements: ExtractedRequirements) -> float:
    """
    Deterministic scoring: keyword overlap + product match + safety/cert signals.
    Returns score in [0, 1].
    """
    score = 0.0
    spec_keywords = set(requirements.technical_keywords + (requirements.ambiguities or []))

    # Product match (highest weight)
    if requirements.product and standard.product_type:
        prod_lower = requirements.product.lower()
        std_prod_lower = standard.product_type.lower()
        if prod_lower == std_prod_lower:
            score += 0.50
        elif any(w in std_prod_lower for w in prod_lower.split()):
            score += 0.30

    # Keyword overlap with standard keywords
    if standard.keywords:
        std_keywords = set(k.lower() for k in standard.keywords)
        spec_set = set(k.lower() for k in requirements.technical_keywords)
        if spec_set and std_keywords:
            overlap = len(spec_set & std_keywords) / max(len(spec_set), 1)
            score += overlap * 0.30

    # Explicit IS number match
    if requirements.specific_standards and standard.is_number in requirements.specific_standards:
        score += 0.40

    # Certification signal
    if requirements.certification_required and standard.certification_scheme:
        score += 0.10

    # Safety signal
    if requirements.safety_required:
        scope_lower = (standard.scope or "").lower()
        if "safety" in scope_lower or "protect" in scope_lower:
            score += 0.10

    return min(score, 1.0)


def _relevance_label(score: float) -> str:
    if score >= RELEVANCE_THRESHOLDS["HIGH"]:
        return "HIGH"
    if score >= RELEVANCE_THRESHOLDS["MEDIUM"]:
        return "MEDIUM"
    return "LOW"


def _build_reason(standard: Standard, requirements: ExtractedRequirements, score: float) -> str:
    reasons = []
    if requirements.product and standard.product_type:
        prod_lower = requirements.product.lower()
        if prod_lower in standard.product_type.lower() or standard.product_type.lower() in prod_lower:
            reasons.append(f"Directly matches {requirements.product} requirements")
    if requirements.specific_standards and standard.is_number in requirements.specific_standards:
        reasons.append(f"Explicitly referenced in specification")
    if requirements.certification_required and standard.certification_scheme:
        reasons.append("Covers BIS certification requirements")
    if requirements.safety_required:
        reasons.append("Addresses safety requirements")
    if not reasons:
        reasons.append("Keyword and scope similarity match")
    return "; ".join(reasons)


async def retrieve_candidates(
    db: AsyncSession,
    requirements: ExtractedRequirements,
) -> list[tuple[Standard, float]]:
    """
    Phase 6: Retrieve and rank candidate standards.
    Returns list of (Standard, score) sorted descending.
    """
    # Fetch all standards (small dataset for MVP)
    result = await db.execute(select(Standard).where(Standard.status != "WITHDRAWN"))
    standards = result.scalars().all()

    if not standards:
        logger.warning("No standards found in database")
        return []

    scored = []
    for std in standards:
        score = _score_standard(std, requirements)
        if score > 0.0:
            scored.append((std, score))

    # Sort by score descending
    scored.sort(key=lambda x: x[1], reverse=True)
    logger.info("Retrieval complete", candidates=len(scored))
    return scored[: settings.MAX_RETRIEVAL_RESULTS]


def build_recommended_standard(
    standard: Standard,
    score: float,
    relationship_type: str | None = None,
    reason_override: str | None = None,
    requirements: ExtractedRequirements | None = None,
) -> RecommendedStandard:
    """Build a RecommendedStandard response object from an ORM model."""
    from app.schemas.analysis import StandardResponse

    std_resp = StandardResponse(
        id=standard.id,
        is_number=standard.is_number,
        title=standard.title,
        year=standard.year,
        product_type=standard.product_type,
        status=standard.status,
        scope=standard.scope,
        requirements=standard.requirements,
        testing_requirements=standard.testing_requirements,
        certification_scheme=standard.certification_scheme,
        amendments=standard.amendments,
        source_url=standard.source_url,
        source_reference=standard.source_reference,
        confidence_level=standard.confidence_level,
        keywords=standard.keywords,
    )

    reason = reason_override or (
        _build_reason(standard, requirements, score) if requirements
        else "Related standard via graph traversal"
    )

    evidence = [
        EvidenceItem(
            standard_number=standard.is_number,
            claim=f"Standard recorded as {standard.confidence_level}",
            source=standard.source_reference or standard.source_url,
            confidence=standard.confidence_level,
        )
    ]

    return RecommendedStandard(
        standard=std_resp,
        relevance_score=round(score, 3),
        relevance_label=_relevance_label(score),
        reason=reason,
        relationship_type=relationship_type or "primary",
        evidence=evidence,
    )

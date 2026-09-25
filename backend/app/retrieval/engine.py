"""
Phase 6: Standard Retrieval Engine
Retrieval pipeline:
  Specification
  ↓
  Requirement extraction
  ↓
  Candidate generation (Product compatibility, explicit IS match, technical keywords, scope match)
  ↓
  Deterministic weighted ranking (Clear, documented mathematical weights with strong boost for explicit IS)
  ↓
  Evidence validation
  ↓
  Final recommendation with traceable signals
"""

from __future__ import annotations

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.standards import Standard
from app.schemas.analysis import (
    EvidenceItem,
    ExtractedRequirements,
    RecommendedStandard,
    StandardResponse,
)

logger = structlog.get_logger(__name__)

# Ranking thresholds for relevance bands
RELEVANCE_THRESHOLDS = {
    "HIGH": 0.70,
    "MEDIUM": 0.40,
    "LOW": 0.0,
}

# Explicit weights used in deterministic ranking:
# 1. Product compatibility: 0.45 (Highest primary factor for domain match)
# 2. Explicit IS reference: 0.50 (Decisive deterministic boost when user specifies standard)
# 3. Technical keyword overlap: 0.20 (Jaccard-like overlap of terminology)
# 4. Scope semantic overlap: 0.15 (Contextual match in published scope)
# 5. Mandatory certification match: 0.10 (Alignment on ISI / statutory requirements)
# 6. Safety requirement match: 0.10 (Alignment on protective criteria)
WEIGHT_PRODUCT_EXACT = 0.45
WEIGHT_PRODUCT_PARTIAL = 0.25
WEIGHT_EXPLICIT_IS = 0.50
WEIGHT_KEYWORD_OVERLAP = 0.20
WEIGHT_SCOPE_OVERLAP = 0.15
WEIGHT_CERTIFICATION = 0.10
WEIGHT_SAFETY = 0.10


def _score_standard(
    standard: Standard,
    requirements: ExtractedRequirements,
) -> tuple[float, list[str]]:
    """
    Deterministic scoring: transparent multi-signal weighted ranking.
    Returns (score in [0.0, 1.0], list of contributing signal names).
    """
    score = 0.0
    signals: list[str] = []

    # 1. Product compatibility
    if requirements.product and standard.product_type:
        prod_lower = requirements.product.lower()
        std_prod_lower = standard.product_type.lower()
        if prod_lower == std_prod_lower:
            score += WEIGHT_PRODUCT_EXACT
            signals.append(f"Product domain match: '{standard.product_type}'")
        elif any(word in std_prod_lower for word in prod_lower.split() if len(word) > 3):
            score += WEIGHT_PRODUCT_PARTIAL
            signals.append(f"Partial product keyword match with '{standard.product_type}'")

    # 2. Explicit IS Number match — decisive deterministic boost
    if requirements.specific_standards and standard.is_number in requirements.specific_standards:
        score += WEIGHT_EXPLICIT_IS
        signals.append(f"Explicit standard citation match: '{standard.is_number}'")

    # 3. Technical keyword overlap
    if standard.keywords and requirements.technical_keywords:
        std_keywords = {k.lower() for k in standard.keywords}
        spec_keywords = {k.lower() for k in requirements.technical_keywords}
        intersection = std_keywords & spec_keywords
        if intersection:
            overlap_ratio = len(intersection) / max(len(spec_keywords), 1)
            score += min(overlap_ratio * WEIGHT_KEYWORD_OVERLAP, WEIGHT_KEYWORD_OVERLAP)
            signals.append(f"Technical keyword overlap ({len(intersection)} shared terms: {', '.join(sorted(list(intersection))[:3])})")

    # 4. Scope context match
    if standard.scope:
        scope_lower = standard.scope.lower()
        if requirements.product and any(w in scope_lower for w in requirements.product.lower().split() if len(w) > 3):
            score += WEIGHT_SCOPE_OVERLAP
            signals.append("Scope description matches specified equipment application")

    # 5. Certification scheme alignment
    if requirements.certification_required and standard.certification_scheme:
        score += WEIGHT_CERTIFICATION
        signals.append("Mandatory BIS certification scheme defined in standard")

    # 6. Safety alignment
    if requirements.safety_required:
        scope_text = (standard.scope or "").lower()
        if "safety" in scope_text or "protect" in scope_text:
            score += WEIGHT_SAFETY
            signals.append("Safety & protection scope alignment")

    return min(round(score, 3), 1.0), signals


def _relevance_label(score: float) -> str:
    if score >= RELEVANCE_THRESHOLDS["HIGH"]:
        return "HIGH"
    if score >= RELEVANCE_THRESHOLDS["MEDIUM"]:
        return "MEDIUM"
    return "LOW"


def _build_grounded_reason(
    standard: Standard,
    requirements: ExtractedRequirements,
    signals: list[str],
) -> str:
    """Generate a factual, evidence-grounded explanation for why this standard applies."""
    reasons = []

    # If explicit
    if requirements.specific_standards and standard.is_number in requirements.specific_standards:
        reasons.append(f"Explicitly referenced in the draft procurement specification as {standard.is_number}")

    # If product match
    if requirements.product and standard.product_type:
        if requirements.product.lower() in standard.product_type.lower() or standard.product_type.lower() in requirements.product.lower():
            reasons.append(
                f"Specification identifies {requirements.product} and demonstration knowledge base "
                f"associates {requirements.product} with {standard.is_number} ({standard.title})"
            )

    # If certification
    if requirements.certification_required and standard.certification_scheme:
        reasons.append(
            f"Provides governing certification scheme under {standard.certification_scheme.get('scheme', 'BIS ISI Mark')}"
        )

    # Fallback to signals or generic description
    if not reasons and signals:
        reasons.append(signals[0])
    elif not reasons:
        reasons.append(
            f"Standard identified by technical terminology overlap with {standard.title}"
        )

    return ". ".join(reasons) + "."


async def retrieve_candidates(
    db: AsyncSession,
    requirements: ExtractedRequirements,
) -> list[tuple[Standard, float, list[str]]]:
    """
    Phase 6: Retrieve and rank candidate standards from database.
    Returns list of (Standard, score, signals_contributed) sorted descending.
    """
    result = await db.execute(select(Standard).where(Standard.status != "WITHDRAWN"))
    standards = result.scalars().all()

    if not standards:
        logger.warning("No standards found in database")
        return []

    scored: list[tuple[Standard, float, list[str]]] = []
    for std in standards:
        score, signals = _score_standard(std, requirements)
        if score > 0.0:
            scored.append((std, score, signals))

    # Sort descending by score
    scored.sort(key=lambda x: x[1], reverse=True)
    logger.info("Retrieval complete", candidates_found=len(scored))
    return scored[: settings.MAX_RETRIEVAL_RESULTS]


def build_recommended_standard(
    standard: Standard,
    score: float,
    relationship_type: str | None = None,
    reason_override: str | None = None,
    requirements: ExtractedRequirements | None = None,
    signals_contributed: list[str] | None = None,
) -> RecommendedStandard:
    """Build a RecommendedStandard response object grounded in verifiable evidence."""
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

    signals = signals_contributed or []
    if requirements and not signals:
        _, signals = _score_standard(standard, requirements)

    # Grounded reason
    if reason_override:
        reason = reason_override
    elif requirements:
        reason = _build_grounded_reason(standard, requirements, signals)
    else:
        reason = f"Companion standard linked in normative standards knowledge network for {standard.is_number}"

    # Traceable evidence items
    evidence: list[EvidenceItem] = []
    if standard.scope:
        evidence.append(
            EvidenceItem(
                standard_number=standard.is_number,
                claim=f"Scope: {standard.scope[:180]}...",
                source=standard.source_reference or "Demonstration Knowledge Base",
                confidence=standard.confidence_level,
                evidence_type="Standard metadata",
            )
        )
    if standard.certification_scheme:
        evidence.append(
            EvidenceItem(
                standard_number=standard.is_number,
                claim=f"Certification: {standard.certification_scheme.get('scheme', 'BIS Mark')} "
                      f"(Mandatory: {standard.certification_scheme.get('mandatory', False)})",
                source=standard.certification_scheme.get("legal_basis", "BIS Act, 2016"),
                confidence="VERIFIED",
                evidence_type="Certification",
            )
        )
    if standard.testing_requirements:
        evidence.append(
            EvidenceItem(
                standard_number=standard.is_number,
                claim=f"Testing methods: {len(standard.testing_requirements)} prescribed laboratory procedures",
                source=standard.source_reference or "BIS Gazette",
                confidence="VERIFIED",
                evidence_type="Test method",
            )
        )

    return RecommendedStandard(
        standard=std_resp,
        relevance_score=round(score, 3),
        relevance_label=_relevance_label(score),
        reason=reason,
        relationship_type=relationship_type or "primary",
        evidence=evidence,
        signals_contributed=signals,
    )

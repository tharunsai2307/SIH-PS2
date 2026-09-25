"""
Phase 12: Core Analysis API — POST /api/v1/analyze
The full ISense pipeline orchestrated in one endpoint.
"""

from __future__ import annotations

import structlog
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.graph.expansion import expand_graph
from app.retrieval.engine import build_recommended_standard, retrieve_candidates
from app.schemas.analysis import AnalyzeRequest, AnalyzeResponse, ExtractedRequirements
from app.services.coverage import analyze_coverage
from app.services.explanation import generate_explanation
from app.services.extraction import extract_requirements

router = APIRouter()
logger = structlog.get_logger(__name__)


@router.post("/analyze", response_model=AnalyzeResponse, summary="Analyze procurement specification")
async def analyze_specification(
    request: AnalyzeRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Full ISense pipeline:
    1. Extract requirements from specification (Explicit vs Inferred vs Ambiguities)
    2. Retrieve candidate standards with deterministic multi-signal ranking
    3. Graph-expand related normative standards
    4. Analyze evidence-grounded coverage gaps
    5. Generate factual explanation with decision-support notice
    """
    logger.info("Analysis request received", spec_length=len(request.specification))

    try:
        # ── Phase 5: Requirement Extraction ──────────────────────────────────
        requirements = await extract_requirements(request.specification)

        # ── Phase 6: Standard Retrieval ──────────────────────────────────────
        candidates = await retrieve_candidates(db, requirements)

        primary = None
        related = []
        processing_status = "NOT_FOUND"

        if requirements.unknown_standards and not requirements.specific_standards:
            # Explicit standard reference detected, but no matching standard exists in demonstration KB
            primary = None
            processing_status = "MANUAL_REVIEW"
        elif candidates:
            top_std, top_score, top_signals = candidates[0]

            if top_score >= 0.20:
                primary = build_recommended_standard(
                    standard=top_std,
                    score=top_score,
                    relationship_type="primary",
                    requirements=requirements,
                    signals_contributed=top_signals,
                )
                processing_status = "FOUND"

                # ── Phase 7: Graph Expansion ──────────────────────────────────
                related = await expand_graph(db, top_std.is_number, requirements)

                # Append lower-ranked candidates (not already in graph expansion)
                graph_is_numbers = {r.standard.is_number for r in related}
                for std, score, signals in candidates[1:]:
                    if std.is_number not in graph_is_numbers and score >= 0.15:
                        related.append(build_recommended_standard(
                            standard=std,
                            score=score,
                            relationship_type="related_product",
                            requirements=requirements,
                            signals_contributed=signals,
                        ))

                related.sort(key=lambda r: r.relevance_score, reverse=True)
            else:
                processing_status = "MANUAL_REVIEW"

        # ── Phase 8: Coverage Gap Engine ─────────────────────────────────────
        coverage, gaps = analyze_coverage(requirements, primary, related)

        # ── Phase 10: AI / Deterministic Explanation ─────────────────────────
        explanation = await generate_explanation(
            specification=request.specification,
            requirements=requirements,
            primary=primary,
            gaps=gaps,
            related=related,
        )

        # Build specification summary
        summary_parts = []
        if requirements.product:
            summary_parts.append(f"Product: {requirements.product}")
        if requirements.application:
            summary_parts.append(f"Application: {requirements.application}")
        if requirements.unknown_standards:
            summary_parts.append(f"Unknown Standards: {', '.join(requirements.unknown_standards)}")
        spec_summary = " | ".join(summary_parts) if summary_parts else "Specification analysis complete"

        return AnalyzeResponse(
            specification_summary=spec_summary,
            extracted_requirements=requirements,
            primary_standard=primary,
            related_standards=related,
            coverage=coverage,
            gaps=gaps,
            explanation=explanation,
            processing_status=processing_status,
            unknown_standards_detected=requirements.unknown_standards,
            specification_needs_clarification=requirements.specification_needs_clarification,
            clarification_prompt=requirements.clarification_prompt,
        )

    except Exception as e:
        logger.error("Analysis failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

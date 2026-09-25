"""
Phase 10: AI Explanation Layer
Generates human-readable explanations AFTER deterministic processing.
AI can explain but cannot override database evidence or invent IS numbers.
"""

from __future__ import annotations

import structlog

from app.core.config import settings
from app.schemas.analysis import (
    AnalyzeResponse,
    ExtractedRequirements,
    GapItem,
    RecommendedStandard,
)

logger = structlog.get_logger(__name__)


def _build_fallback_explanation(
    requirements: ExtractedRequirements,
    primary: RecommendedStandard | None,
    gaps: list[GapItem],
) -> str:
    """Deterministic fallback explanation when Gemini is not available."""
    parts = []

    if requirements.product:
        parts.append(f"Based on the specification, the procurement is for **{requirements.product}**.")
    else:
        parts.append("The product type could not be clearly identified from the specification.")

    if primary:
        parts.append(
            f"\n\n**{primary.standard.is_number}** (*{primary.standard.title}*) is the primary "
            f"applicable Indian Standard with **{primary.relevance_label}** relevance. "
            f"{primary.reason}."
        )

    if gaps:
        high_gaps = [g for g in gaps if g.severity == "HIGH"]
        if high_gaps:
            parts.append(f"\n\n⚠️ **Critical gaps identified:** {', '.join(g.category for g in high_gaps)}.")
            parts.append("These should be addressed before finalising the procurement specification.")

    if not primary:
        parts.append(
            "\n\nISense could not identify a primary applicable standard from the prototype "
            "knowledge base. This specification may require **manual review** by a standards expert."
        )

    parts.append(
        "\n\n*Note: This analysis uses a curated prototype knowledge base and is for "
        "demonstration purposes only.*"
    )

    return " ".join(parts)


async def generate_explanation(
    specification: str,
    requirements: ExtractedRequirements,
    primary: RecommendedStandard | None,
    gaps: list[GapItem],
    related: list[RecommendedStandard],
) -> str:
    """
    Phase 10: Generate human-readable explanation using Gemini AI.
    Falls back to deterministic text if API key not configured.
    AI is called AFTER all deterministic processing — it cannot change results.
    """
    if not settings.GEMINI_API_KEY:
        logger.info("No Gemini API key — using deterministic explanation")
        return _build_fallback_explanation(requirements, primary, gaps)

    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL)

        context = {
            "product": requirements.product,
            "application": requirements.application,
            "primary_standard": (
                f"{primary.standard.is_number} — {primary.standard.title}" if primary else "Not found"
            ),
            "gaps": [f"{g.category}: {g.description}" for g in gaps],
            "related_standards": [
                f"{r.standard.is_number} ({r.relationship_type})" for r in related[:3]
            ],
        }

        prompt = f"""You are ISense, an AI-powered Indian Standards (BIS) procurement assistant.

A procurement officer submitted this specification:
"{specification[:500]}"

The deterministic ISense engine has already completed its analysis:
- Product identified: {context['product']}
- Primary standard: {context['primary_standard']}
- Gaps found: {'; '.join(context['gaps']) if context['gaps'] else 'None'}
- Related standards: {', '.join(context['related_standards'])}

Write a concise, professional explanation (3-4 sentences) of:
1. Why the primary standard applies (or doesn't)
2. What the key gaps mean for procurement
3. What the officer should do next

RULES:
- Do NOT invent IS numbers not mentioned above
- Do NOT override the deterministic results
- Use plain English suitable for a procurement officer
- Be specific about the identified standard(s)
"""

        response = model.generate_content(prompt)
        return response.text.strip()

    except Exception as e:
        logger.warning("Gemini explanation failed, using fallback", error=str(e))
        return _build_fallback_explanation(requirements, primary, gaps)

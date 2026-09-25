"""
Phase 5: Requirement Extraction Service
Converts natural-language procurement specification into structured requirements.
Uses Gemini AI for NLU; AI cannot invent IS numbers.
"""

from __future__ import annotations

import json
import re
import structlog

from app.core.config import settings
from app.schemas.analysis import ExtractedRequirements

logger = structlog.get_logger(__name__)

# Keywords → requirement categories
SAFETY_KEYWORDS = [
    "safety", "safe", "protect", "protective", "crash", "impact", "hazard",
    "injury", "risk", "shield", "guard",
]
TESTING_KEYWORDS = [
    "test", "testing", "tested", "lab", "laboratory", "performance test",
    "quality test", "type test", "routine test",
]
CERTIFICATION_KEYWORDS = [
    "certif", "isi mark", "bis mark", "license", "approved", "compliant",
    "comply", "conforming", "marked", "certification", "certified",
]
PRODUCT_KEYWORDS = {
    "motorcycle helmet": ["motorcycle", "motorcycl", "two-wheel", "moped", "scooter", "bike rider"],
    "industrial safety helmet": ["industrial", "construction", "mining", "factory", "hard hat"],
    "firefighter helmet": ["fire", "firefight", "fire brigade", "heat"],
    "racing helmet": ["racing", "motorsport", "rally", "car driver"],
    "cycling helmet": ["cycl", "bicycle", "cyclist"],
    "equestrian helmet": ["horse", "equestrian", "rider"],
}


def _keyword_extraction(spec: str) -> ExtractedRequirements:
    """Fast deterministic extraction using keyword matching."""
    spec_lower = spec.lower()

    # Product detection
    product = None
    for product_name, keywords in PRODUCT_KEYWORDS.items():
        if any(kw in spec_lower for kw in keywords):
            product = product_name
            break

    # Application context
    application = None
    if "motorcycle" in spec_lower or "moped" in spec_lower:
        application = "motorcycle riding"
    elif "construction" in spec_lower or "industrial" in spec_lower:
        application = "industrial / construction site"
    elif "fire" in spec_lower:
        application = "firefighting"
    elif "racing" in spec_lower:
        application = "motorsport racing"

    safety_required = any(kw in spec_lower for kw in SAFETY_KEYWORDS)
    testing_required = any(kw in spec_lower for kw in TESTING_KEYWORDS)
    certification_required = any(kw in spec_lower for kw in CERTIFICATION_KEYWORDS)

    # Detect explicitly mentioned IS numbers
    is_pattern = re.compile(r"\bIS\s*(\d{3,6})\b", re.IGNORECASE)
    specific_standards = [f"IS {m.group(1)}" for m in is_pattern.finditer(spec)]

    # Extract technical keywords
    technical_keywords = []
    tech_terms = [
        "helmet", "head protection", "impact", "shock absorption", "chin strap",
        "retention", "penetration", "visor", "ISI", "BIS", "certification",
    ]
    for term in tech_terms:
        if term.lower() in spec_lower:
            technical_keywords.append(term)

    # Ambiguity detection
    ambiguities = []
    if not product:
        ambiguities.append("Product type is unclear — please specify helmet application (motorcycle, industrial, etc.)")
    if not certification_required and not testing_required:
        ambiguities.append("No certification or testing requirements mentioned")

    return ExtractedRequirements(
        product=product,
        application=application,
        safety_required=safety_required,
        testing_required=testing_required,
        certification_required=certification_required,
        specific_standards=list(set(specific_standards)),
        technical_keywords=technical_keywords,
        ambiguities=ambiguities,
    )


async def _gemini_extraction(spec: str) -> ExtractedRequirements | None:
    """Enhanced extraction using Gemini AI for complex/ambiguous specs."""
    if not settings.GEMINI_API_KEY:
        return None

    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL)

        prompt = f"""You are an expert in Indian Standards (BIS) procurement analysis.
Analyze this procurement specification and extract structured requirements.

SPECIFICATION:
{spec}

Extract and return a JSON object with these fields:
- product: string (the specific product type, e.g. "motorcycle helmet")
- application: string (intended use context)
- safety_required: boolean
- testing_required: boolean
- certification_required: boolean
- technical_keywords: array of strings (technical terms found)
- ambiguities: array of strings (unclear or missing requirements)

RULES:
- Do NOT invent IS standard numbers
- Do NOT add requirements not mentioned in the specification
- If uncertain about a field, use null

Return only valid JSON, no markdown."""

        response = model.generate_content(prompt)
        text = response.text.strip()

        # Strip markdown code fences if present
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\n?", "", text)
            text = re.sub(r"\n?```$", "", text)

        data = json.loads(text)
        return ExtractedRequirements(**data)

    except Exception as e:
        logger.warning("Gemini extraction failed, falling back to keyword", error=str(e))
        return None


async def extract_requirements(specification: str) -> ExtractedRequirements:
    """
    Phase 5 entry point: Extract structured requirements from specification text.
    First tries Gemini AI, falls back to deterministic keyword matching.
    AI cannot invent IS numbers — only deterministic parsing detects those.
    """
    logger.info("Extracting requirements from specification", length=len(specification))

    # Try AI-enhanced extraction first
    ai_result = await _gemini_extraction(specification)

    if ai_result:
        # Merge: deterministic IS number detection always overrides AI
        keyword_result = _keyword_extraction(specification)
        ai_result.specific_standards = keyword_result.specific_standards
        # Merge ambiguities
        for amb in keyword_result.ambiguities:
            if amb not in ai_result.ambiguities:
                ai_result.ambiguities.append(amb)
        logger.info("Used AI extraction", product=ai_result.product)
        return ai_result

    # Fallback: deterministic
    result = _keyword_extraction(specification)
    logger.info("Used keyword extraction", product=result.product)
    return result

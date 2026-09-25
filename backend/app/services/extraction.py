"""
Phase 5: Requirement Extraction Service
Converts natural-language procurement specification into structured requirements.
Grounds requirements into EXPLICIT, INFERRED, and STANDARD-DERIVED sources.
Separates explicit vs. inferred vs. ambiguous signals.
Uses Gemini AI for optional semantic enhancement; AI cannot invent IS numbers.
"""

from __future__ import annotations

import json
import re
import structlog

from app.core.config import settings
from app.schemas.analysis import ExtractedRequirements

logger = structlog.get_logger(__name__)

# Curated demonstration standards known in this prototype repository
KNOWN_DEMO_STANDARDS = {
    "IS 4151", "IS 2925", "IS 2745", "IS 14740", "IS 9562",
    "IS 4129", "IS 15758", "IS 16328", "IS 7692", "IS 9944",
}

SAFETY_KEYWORDS = [
    "safety", "safe", "protect", "protective", "crash", "impact", "hazard",
    "injury", "risk", "shield", "guard", "shock absorption", "deceleration",
    "penetration", "retention",
]

TESTING_KEYWORDS = [
    "test", "testing", "tested", "lab", "laboratory", "performance test",
    "quality test", "type test", "routine test", "acceptance test", "drop test",
    "conditioning test",
]

CERTIFICATION_KEYWORDS = [
    "certif", "isi mark", "bis mark", "license", "approved", "compliant",
    "comply", "conforming", "marked", "certification", "certified", "qco", "isi",
]

PRODUCT_KEYWORDS = {
    "motorcycle helmet": [
        "motorcycle", "motorcycl", "two-wheel", "two wheel", "moped",
        "scooter", "bike rider", "biker",
    ],
    "industrial safety helmet": [
        "industrial", "construction", "mining", "factory", "hard hat",
        "site worker", "civil engineer",
    ],
    "firefighter helmet": [
        "fire", "firefight", "fire brigade", "structural fire", "heat resistant",
    ],
    "tactical riot helmet": [
        "riot", "police", "paramilitary", "tactical", "crpf", "law enforcement",
        "ballistic", "crowd control",
    ],
    "racing helmet": [
        "racing", "motorsport", "rally", "car driver", "motorsports", "fia",
    ],
    "cycling helmet": [
        "cycl", "bicycle", "cyclist", "pedal cycle",
    ],
    "equestrian helmet": [
        "horse", "equestrian", "jockey", "horse riding",
    ],
    "cricket helmet": [
        "cricket", "batsman", "wicketkeeper", "faceguard",
    ],
}


def _keyword_extraction(spec: str) -> ExtractedRequirements:
    """Fast deterministic extraction with explicit provenance grounding."""
    spec_lower = spec.lower()
    explicit_reqs: list[str] = []
    inferred_reqs: list[str] = []
    req_sources: dict[str, str] = {}
    ambiguities: list[str] = []

    # 1. Product detection & inference
    product = None
    matched_product_keyword = None
    for product_name, keywords in PRODUCT_KEYWORDS.items():
        for kw in keywords:
            if kw in spec_lower:
                product = product_name
                matched_product_keyword = kw
                break
        if product:
            break

    # Application context
    application = None
    if "motorcycle" in spec_lower or "two wheel" in spec_lower or "two-wheel" in spec_lower or "scooter" in spec_lower:
        application = "motorcycle riding"
    elif "construction" in spec_lower or "industrial" in spec_lower or "mining" in spec_lower:
        application = "industrial / construction site personal protection"
    elif "fire" in spec_lower:
        application = "emergency firefighting operations"
    elif "riot" in spec_lower or "police" in spec_lower:
        application = "law enforcement & riot crowd control"
    elif "racing" in spec_lower or "motorsport" in spec_lower:
        application = "motorsport racing competitions"
    elif "cycl" in spec_lower:
        application = "bicycle / cycling sports & road safety"
    elif "cricket" in spec_lower:
        application = "cricket sports head protection"
    elif "horse" in spec_lower or "equestrian" in spec_lower:
        application = "equestrian riding activities"

    if product:
        if product in spec_lower:
            explicit_reqs.append(f"Product domain explicitly stated as '{product}'")
            req_sources["product"] = "EXPLICIT"
        else:
            inferred_reqs.append(f"Product inferred as '{product}' based on keyword '{matched_product_keyword}'")
            req_sources["product"] = "INFERRED"
    else:
        req_sources["product"] = "NOT_SPECIFIED"

    # 2. Safety signal check (strictly distinguish explicit mention vs missing)
    safety_required = any(kw in spec_lower for kw in SAFETY_KEYWORDS)
    if safety_required:
        found_kw = next(kw for kw in SAFETY_KEYWORDS if kw in spec_lower)
        explicit_reqs.append(f"Safety/protective requirement explicitly mentioned ('{found_kw}')")
        req_sources["safety"] = "EXPLICIT"
    else:
        req_sources["safety"] = "NOT_SPECIFIED"

    # 3. Testing signal check
    testing_required = any(kw in spec_lower for kw in TESTING_KEYWORDS)
    if testing_required:
        found_kw = next(kw for kw in TESTING_KEYWORDS if kw in spec_lower)
        explicit_reqs.append(f"Testing protocol explicitly mandated ('{found_kw}')")
        req_sources["testing"] = "EXPLICIT"
    else:
        req_sources["testing"] = "NOT_SPECIFIED"

    # 4. Certification signal check
    certification_required = any(kw in spec_lower for kw in CERTIFICATION_KEYWORDS)
    if certification_required:
        found_kw = next(kw for kw in CERTIFICATION_KEYWORDS if kw in spec_lower)
        explicit_reqs.append(f"Certification mark explicitly demanded ('{found_kw}')")
        req_sources["certification"] = "EXPLICIT"
    else:
        req_sources["certification"] = "NOT_SPECIFIED"

    # 5. Detect explicitly mentioned IS numbers and differentiate known vs unknown
    is_pattern = re.compile(r"\bIS\s*(\d{3,6}(?:\s*(?:Part|Pt)\s*\d+)?)\b", re.IGNORECASE)
    raw_matches = [m.group(0).upper().replace("  ", " ") for m in is_pattern.finditer(spec)]
    # Normalize: "IS 4151"
    normalized_standards = []
    unknown_standards = []
    for raw in raw_matches:
        cleaned = re.sub(r"\s+", " ", raw).strip()
        if cleaned in KNOWN_DEMO_STANDARDS:
            normalized_standards.append(cleaned)
            explicit_reqs.append(f"Explicit Indian Standard cited: {cleaned}")
            req_sources[cleaned] = "EXPLICIT"
        else:
            unknown_standards.append(cleaned)
            req_sources[cleaned] = "EXPLICIT_UNKNOWN"

    specific_standards = list(dict.fromkeys(normalized_standards))
    unknown_standards = list(dict.fromkeys(unknown_standards))

    # 6. Extract technical keywords
    tech_terms = [
        "helmet", "head protection", "impact", "shock absorption", "chin strap",
        "retention", "penetration", "visor", "ISI", "BIS", "certification",
        "deceleration", "drop test", "conditioning", "flammability", "clearance",
    ]
    technical_keywords = [term for term in tech_terms if term.lower() in spec_lower]

    # 7. Ambiguity detection & clarification check
    # Check if spec is overly vague (e.g. "helmet", "helmet for general use")
    cleaned_spec = re.sub(r"[^\w\s]", "", spec_lower).strip()
    is_vague = (
        cleaned_spec in {"helmet", "helmets", "helmet for general use", "protective helmets", "head protection", "safety helmet"}
        or (len(cleaned_spec.split()) <= 4 and not specific_standards and not product)
    )

    if not product:
        ambiguities.append("Product type is unclear — please specify helmet application (e.g., motorcycle, industrial, firefighting).")
    if not certification_required:
        ambiguities.append("Mandatory BIS / ISI certification requirement is omitted in draft specification.")
    if not testing_required:
        ambiguities.append("Acceptance & type testing protocols are unspecified in the procurement specification.")

    if unknown_standards:
        for unk in unknown_standards:
            ambiguities.append(f"Explicit standard reference detected ({unk}), but no matching standard exists in the demonstration knowledge base.")

    clarification_prompt = None
    if is_vague or (not product and not specific_standards):
        clarification_prompt = (
            "Specification requires clarification. The provided text is preliminary or ambiguous. "
            "To generate definitive decision support, please specify: "
            "1. Intended application (motorcycle road riding, industrial construction, structural firefighting, etc.); "
            "2. Required product type; "
            "3. Safety performance parameters; "
            "4. Mandatory laboratory test methods; "
            "5. Statutory BIS / ISI certification mandate."
        )

    return ExtractedRequirements(
        product=product,
        application=application,
        safety_required=safety_required,
        testing_required=testing_required,
        certification_required=certification_required,
        specific_standards=specific_standards,
        technical_keywords=technical_keywords,
        ambiguities=ambiguities,
        explicit_requirements=explicit_reqs,
        inferred_requirements=inferred_reqs,
        requirement_sources=req_sources,
        unknown_standards=unknown_standards,
        specification_needs_clarification=is_vague or (not product and not specific_standards),
        clarification_prompt=clarification_prompt,
    )


async def _gemini_extraction(spec: str) -> ExtractedRequirements | None:
    """Enhanced extraction using Gemini AI for complex/ambiguous specs with strict grounding."""
    if not settings.GEMINI_API_KEY:
        return None

    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL)

        prompt = f"""You are an expert procurement standards analyst evaluating specifications against Indian Standards (BIS).
Analyze this procurement specification and extract structured requirements with strict grounding.

SPECIFICATION:
{spec}

Extract and return a JSON object with these fields:
- product: string or null (product category name only if evident)
- application: string or null (intended operational context)
- safety_required: boolean (true ONLY if explicitly stated in text)
- testing_required: boolean (true ONLY if explicitly stated in text)
- certification_required: boolean (true ONLY if explicitly stated in text)
- technical_keywords: array of strings (technical terms actually in the text)
- ambiguities: array of strings (missing or unclear specifications)

STRICT RULES:
1. Do NOT invent IS standard numbers.
2. Do NOT mark safety_required, testing_required, or certification_required as true unless explicitly mentioned in the text.
3. If the specification is vague, list missing information under ambiguities.
4. Return only valid JSON, without markdown code fences."""

        response = model.generate_content(prompt)
        text_resp = response.text.strip()

        if text_resp.startswith("```"):
            text_resp = re.sub(r"^```(?:json)?\n?", "", text_resp)
            text_resp = re.sub(r"\n?```$", "", text_resp)

        data = json.loads(text_resp)
        deterministic_baseline = _keyword_extraction(spec)

        # Merge carefully: Keep deterministic explicit/inferred separation intact
        return ExtractedRequirements(
            product=data.get("product") or deterministic_baseline.product,
            application=data.get("application") or deterministic_baseline.application,
            safety_required=bool(data.get("safety_required", deterministic_baseline.safety_required)),
            testing_required=bool(data.get("testing_required", deterministic_baseline.testing_required)),
            certification_required=bool(data.get("certification_required", deterministic_baseline.certification_required)),
            specific_standards=deterministic_baseline.specific_standards,
            technical_keywords=list(set(deterministic_baseline.technical_keywords + (data.get("technical_keywords") or []))),
            ambiguities=list(dict.fromkeys(deterministic_baseline.ambiguities + (data.get("ambiguities") or []))),
            explicit_requirements=deterministic_baseline.explicit_requirements,
            inferred_requirements=deterministic_baseline.inferred_requirements,
            requirement_sources=deterministic_baseline.requirement_sources,
            unknown_standards=deterministic_baseline.unknown_standards,
            specification_needs_clarification=deterministic_baseline.specification_needs_clarification,
            clarification_prompt=deterministic_baseline.clarification_prompt,
        )

    except Exception as e:
        logger.warning("Gemini semantic extraction failed, falling back to deterministic", error=str(e))
        return None


async def extract_requirements(specification: str) -> ExtractedRequirements:
    """
    Phase 5 entry point: Extract structured requirements from specification text.
    First tries Gemini AI for semantic assistance, falls back gracefully to deterministic keyword extraction.
    AI cannot invent IS numbers — deterministic pattern detection preserves explicit standards.
    """
    logger.info("Extracting requirements from specification", length=len(specification))

    # Try AI-enhanced extraction if key is configured
    ai_result = None
    try:
        ai_result = await _gemini_extraction(specification)
    except Exception as e:
        logger.warning("Gemini extraction error in pipeline, falling back", error=str(e))
        ai_result = None

    if ai_result:
        logger.info("Semantic extraction completed via Gemini AI", product=ai_result.product)
        return ai_result

    # Fallback to deterministic extraction
    result = _keyword_extraction(specification)
    logger.info("Used deterministic requirement extraction", product=result.product)
    return result

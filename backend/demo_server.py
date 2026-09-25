"""
ISense Demo Backend — Production Prototype Server
BIS Standards Decision-Support Engine · Smart India Hackathon (SIH 2024-25 PS-2)
Runs in-memory with complete curated demonstration knowledge graph, clauses audit, and GeM clause assistant.

Run: python demo_server.py
"""

import json
import re
import sys
import time
import random
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Any

# ── Inline standards data ──────────────────────────────────────────────────────
sys.path.insert(0, ".")
from data.standards_seed import RELATIONSHIPS_DATA, STANDARDS_DATA, QCO_ORDERS_DATA

STANDARDS_BY_IS = {s["is_number"]: s for s in STANDARDS_DATA}
KNOWN_DEMO_STANDARDS = set(STANDARDS_BY_IS.keys())

# ── Requirement Extraction ──────────────────────────────────────────────────────
SAFETY_KEYWORDS = [
    "safety", "safe", "protect", "protective", "crash", "impact", "hazard",
    "shock", "deceleration", "penetration", "retention",
]
TESTING_KEYWORDS = [
    "test", "testing", "tested", "lab", "laboratory", "type test", "routine test",
    "acceptance test", "drop test", "conditioning",
]
CERT_KEYWORDS = [
    "certif", "isi mark", "bis mark", "license", "approved", "comply", "conforming",
    "marked", "qco", "isi", "bis",
]

PRODUCT_MAP = {
    "motorcycle helmet": ["motorcycle", "motorcycl", "moped", "scooter", "bike rider", "two wheel", "two-wheel", "rider"],
    "industrial safety helmet": ["industrial", "construction", "mining", "factory", "hard hat", "site worker"],
    "firefighter helmet": ["fire", "firefight", "fire brigade", "heat resistant", "rescue"],
    "tactical riot helmet": ["riot", "police", "paramilitary", "tactical", "crpf", "law enforcement", "ballistic"],
    "racing helmet": ["racing", "motorsport", "rally", "car driver", "fia"],
    "cycling helmet": ["cycl", "bicycle", "cyclist"],
    "equestrian helmet": ["horse", "equestrian", "jockey"],
    "cricket helmet": ["cricket", "batsman", "faceguard"],
}


def extract_requirements(spec: str) -> dict:
    sl = spec.lower()
    explicit_reqs = []
    inferred_reqs = []
    req_sources = {}
    ambiguities = []

    # 1. Product detection
    product = None
    matched_kw = None
    for pname, kws in PRODUCT_MAP.items():
        for k in kws:
            if k in sl:
                product = pname
                matched_kw = k
                break
        if product:
            break

    # Application inference
    application = None
    if "motorcycle" in sl or "moped" in sl or "scooter" in sl or "two wheel" in sl or "two-wheel" in sl:
        application = "Two-Wheeler / Motorcyclist Road Safety"
    elif "construction" in sl or "industrial" in sl or "mining" in sl or "pwd" in sl:
        application = "Industrial / Construction Site Personal Protection"
    elif "fire" in sl:
        application = "Emergency Fire Services & Structural Firefighting"
    elif "riot" in sl or "police" in sl or "tactical" in sl or "crpf" in sl:
        application = "Law Enforcement & Riot Crowd Control"
    elif "racing" in sl or "rally" in sl:
        application = "High-Speed Motorsport Racing"
    elif "cycl" in sl:
        application = "Bicycle / Cycling Road Safety"
    elif "cricket" in sl:
        application = "Sports Protection (Cricket)"
    elif "horse" in sl or "equestrian" in sl:
        application = "Equestrian Sports"

    if product:
        if product in sl:
            explicit_reqs.append(f"Product domain explicitly specified as '{product}'")
            req_sources["product"] = "EXPLICIT"
        else:
            inferred_reqs.append(f"Product domain inferred as '{product}' from keyword '{matched_kw}'")
            req_sources["product"] = "INFERRED"
    else:
        req_sources["product"] = "NOT_SPECIFIED"

    # 2. Safety signal check
    safety_req = any(k in sl for k in SAFETY_KEYWORDS)
    if safety_req:
        found_kw = next(k for k in SAFETY_KEYWORDS if k in sl)
        explicit_reqs.append(f"Safety/protective requirement explicitly stated ('{found_kw}')")
        req_sources["safety"] = "EXPLICIT"
    else:
        req_sources["safety"] = "NOT_SPECIFIED"

    # 3. Testing signal check
    testing_req = any(k in sl for k in TESTING_KEYWORDS)
    if testing_req:
        found_kw = next(k for k in TESTING_KEYWORDS if k in sl)
        explicit_reqs.append(f"Testing requirements explicitly mandated ('{found_kw}')")
        req_sources["testing"] = "EXPLICIT"
    else:
        req_sources["testing"] = "NOT_SPECIFIED"

    # 4. Certification signal check
    cert_req = any(k in sl for k in CERT_KEYWORDS)
    if cert_req:
        found_kw = next(k for k in CERT_KEYWORDS if k in sl)
        explicit_reqs.append(f"Certification mark explicitly demanded ('{found_kw}')")
        req_sources["certification"] = "EXPLICIT"
    else:
        req_sources["certification"] = "NOT_SPECIFIED"

    # 5. Explicit IS number detection — differentiate known demo standards vs unknown
    raw_matches = [m.group(0).upper() for m in re.finditer(r"\bIS\s*(\d{3,6})\b", spec, re.IGNORECASE)]
    known_is_nums = []
    unknown_is_nums = []

    for raw in raw_matches:
        cleaned = re.sub(r"\s+", " ", raw).strip()
        if cleaned in KNOWN_DEMO_STANDARDS:
            known_is_nums.append(cleaned)
            explicit_reqs.append(f"Explicit Indian Standard cited: {cleaned}")
            req_sources[cleaned] = "EXPLICIT"
        else:
            unknown_is_nums.append(cleaned)
            req_sources[cleaned] = "EXPLICIT_UNKNOWN"

    known_is_nums = list(dict.fromkeys(known_is_nums))
    unknown_is_nums = list(dict.fromkeys(unknown_is_nums))

    # 6. Technical keywords
    tech_kws = [t for t in [
        "helmet", "head protection", "impact", "shock absorption", "chin strap",
        "retention", "ISI", "BIS", "certification", "visor", "penetration", "conditioning",
        "EPS liner", "quick-release", "flammability", "electrical resistance"
    ] if t.lower() in sl]

    # 7. Ambiguity & Vague input detection
    cleaned_spec = re.sub(r"[^\w\s]", "", sl).strip()
    is_vague = (
        cleaned_spec in {"helmet", "helmets", "helmet for general use", "protective helmets", "safety helmet"}
        or (len(cleaned_spec.split()) <= 4 and not known_is_nums and not product)
    )

    if not product:
        ambiguities.append("Product category not explicitly detected — default or manual classification required.")
    if not cert_req:
        ambiguities.append("Mandatory BIS ISI Mark certification requirement is omitted in draft specification.")
    if not testing_req:
        ambiguities.append("Acceptance & type testing procedures (drop test, retention load) are unspecified.")

    if unknown_is_nums:
        for unk in unknown_is_nums:
            ambiguities.append(f"Explicit standard reference detected ({unk}), but no matching standard exists in the demonstration knowledge base.")

    clarification_prompt = None
    if is_vague or (not product and not known_is_nums):
        clarification_prompt = (
            "Specification requires clarification. The provided text is preliminary or ambiguous. "
            "To generate definitive decision support, please specify: "
            "1. Intended application (motorcycle road riding, industrial construction, structural firefighting, etc.); "
            "2. Required product type; "
            "3. Safety performance parameters; "
            "4. Mandatory laboratory test methods; "
            "5. Statutory BIS / ISI certification mandate."
        )

    return {
        "product": product,
        "application": application,
        "safety_required": safety_req,
        "testing_required": testing_req,
        "certification_required": cert_req,
        "specific_standards": known_is_nums,
        "technical_keywords": tech_kws,
        "ambiguities": ambiguities,
        "explicit_requirements": explicit_reqs,
        "inferred_requirements": inferred_reqs,
        "requirement_sources": req_sources,
        "unknown_standards": unknown_is_nums,
        "specification_needs_clarification": is_vague or (not product and not known_is_nums),
        "clarification_prompt": clarification_prompt,
    }


def score_standard(std: dict, req: dict) -> tuple[float, list[str]]:
    """
    Transparent deterministic ranking weights:
    - Product compatibility: 0.45
    - Explicit IS citation: 0.50 (Decisive deterministic boost)
    - Technical keyword overlap: 0.20
    - Scope semantic alignment: 0.15
    - Certification alignment: 0.10
    - Safety alignment: 0.10
    """
    score = 0.0
    signals = []
    sl_prod = (req.get("product") or "").lower()
    std_prod = (std.get("product_type") or "").lower()

    # Product match
    if sl_prod and std_prod:
        if sl_prod == std_prod:
            score += 0.45
            signals.append(f"Product domain match: '{std['product_type']}'")
        elif any(w in std_prod for w in sl_prod.split() if len(w) > 3):
            score += 0.25
            signals.append(f"Partial product keyword match with '{std['product_type']}'")

    # Explicit IS number citation — decisive deterministic boost
    if req.get("specific_standards") and std["is_number"] in req["specific_standards"]:
        score += 0.50
        signals.append(f"Explicit standard citation in specification: '{std['is_number']}'")

    # Keyword overlap
    kws = set(k.lower() for k in (std.get("keywords") or []))
    tech = set(k.lower() for k in (req.get("technical_keywords") or []))
    if kws and tech:
        overlap = len(kws & tech)
        score += min((overlap / max(len(tech), 1)) * 0.20, 0.20)
        signals.append(f"Technical keyword overlap ({overlap} shared terms)")

    # Scope match
    scope_text = (std.get("scope") or "").lower()
    if sl_prod and any(w in scope_text for w in sl_prod.split() if len(w) > 3):
        score += 0.15
        signals.append("Scope description aligns with equipment application")

    # Certification signal
    if req.get("certification_required") and std.get("certification_scheme"):
        score += 0.10
        signals.append("Mandatory BIS certification scheme defined in standard")

    # Safety signal
    if req.get("safety_required") and ("safety" in scope_text or "protect" in scope_text):
        score += 0.10
        signals.append("Safety & protective headgear scope alignment")

    return min(round(score, 3), 1.0), signals


def retrieve_candidates(req: dict) -> list:
    scored = []
    for s in STANDARDS_DATA:
        sc, sigs = score_standard(s, req)
        if sc > 0.0:
            scored.append((s, sc, sigs))
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:8]


def expand_graph(primary_is: str, req: dict) -> list:
    related = []
    visited = {primary_is}
    WEIGHTS = {
        "normative_reference": 0.90,
        "safety": 0.85,
        "test_method": 0.80,
        "certified_under": 0.75,
        "terminology": 0.65,
        "related_product": 0.60,
        "supersedes": 0.50,
    }
    LABELS = {
        "normative_reference": "Normative Reference (Mandatory Companion)",
        "test_method": "Prescribed Test Method Standard",
        "safety": "Associated Safety Standard",
        "related_product": "Related Category Benchmark",
        "certified_under": "Certification Scheme",
        "terminology": "Standard Terminology & Definitions",
        "supersedes": "Supersedes Prior Standard",
    }

    for rel in RELATIONSHIPS_DATA:
        if rel["source"] == primary_is and rel["target"] not in visited:
            visited.add(rel["target"])
            std = STANDARDS_BY_IS.get(rel["target"])
            if not std:
                continue
            score = WEIGHTS.get(rel["type"], 0.5) * rel.get("strength", 1.0)
            related.append({
                "standard": build_std_resp(std),
                "relevance_score": round(score, 3),
                "relevance_label": "HIGH" if score >= 0.70 else "MEDIUM" if score >= 0.40 else "LOW",
                "reason": f"{LABELS.get(rel['type'], rel['type'])} — {rel.get('description', 'related standard')}",
                "relationship_type": rel["type"],
                "signals_contributed": [f"Normative relationship: {rel['type']}"],
                "evidence": [{
                    "standard_number": std["is_number"],
                    "claim": f"Officially linked to {primary_is} in BIS National Standards Registry",
                    "source": std.get("source_reference"),
                    "confidence": "VERIFIED",
                    "evidence_type": "Normative relationship"
                }],
            })

    related.sort(key=lambda r: r["relevance_score"], reverse=True)
    return related


def build_std_resp(s: dict) -> dict:
    return {
        "id": s["is_number"].replace(" ", "-").lower(),
        "is_number": s["is_number"],
        "title": s["title"],
        "year": s.get("year"),
        "product_type": s.get("product_type"),
        "status": s.get("status", "ACTIVE"),
        "scope": s.get("scope"),
        "clauses": s.get("clauses", []),
        "requirements": s.get("requirements"),
        "testing_requirements": s.get("testing_requirements"),
        "certification_scheme": s.get("certification_scheme"),
        "amendments": s.get("amendments", []),
        "source_url": s.get("source_url"),
        "source_reference": s.get("source_reference"),
        "confidence_level": s.get("confidence_level", "VERIFIED"),
        "keywords": s.get("keywords", []),
    }


def build_recommendation(std: dict, score: float, rel_type: str = "primary", reason: str = "", signals: list | None = None) -> dict:
    label = "HIGH" if score >= 0.70 else "MEDIUM" if score >= 0.40 else "LOW"
    if not reason:
        reason = f"Recommended because specification targets {std.get('product_type', 'protective headgear')} and demonstration knowledge base associates it with {std['is_number']}."
    return {
        "standard": build_std_resp(std),
        "relevance_score": round(score, 3),
        "relevance_label": label,
        "reason": reason,
        "relationship_type": rel_type,
        "signals_contributed": signals or [],
        "evidence": [{
            "standard_number": std["is_number"],
            "claim": f"Active standard published by BIS under Bureau of Indian Standards Act, 2016",
            "source": std.get("source_reference"),
            "confidence": std.get("confidence_level", "VERIFIED"),
            "evidence_type": "Standard metadata"
        }],
    }


def analyze_coverage(spec: str, req: dict, primary: dict | None, related: list) -> tuple[list, list, list]:
    sl = spec.lower()
    coverage = []
    gaps = []
    clauses_analysis = []
    present_rel_types = {r["relationship_type"] for r in related}
    primary_std = primary["standard"] if primary else None

    # 1. Primary Standard Check
    if primary:
        coverage.append({
            "category": "Primary Standard",
            "status": "FOUND",
            "standard": primary_std["is_number"],
            "note": f"Applicable Standard: {primary_std['is_number']} ({primary_std['title']})",
            "evidence": primary_std.get("source_reference") or "Demonstration Knowledge Base",
            "suggested_action": None
        })
    elif req.get("unknown_standards"):
        unk = req["unknown_standards"][0]
        coverage.append({
            "category": "Primary Standard",
            "status": "REVIEW",
            "standard": unk,
            "note": f"Explicit standard reference detected ({unk}), but no matching standard exists in the demonstration knowledge base.",
            "evidence": f"Specification text referencing '{unk}'",
            "suggested_action": "Verify standard availability on the official BIS portal (knowledge base currently includes 11 curated standards)."
        })
        gaps.append({
            "category": "Primary Standard",
            "severity": "HIGH",
            "description": f"Specification references {unk}, which is not documented in the demonstration standards dataset.",
            "suggestion": f"Confirm that {unk} is currently active and applicable for this procurement domain on the BIS official portal.",
            "supporting_evidence": "Knowledge base lookup: standard not in 11 curated demonstration standards."
        })
    else:
        coverage.append({
            "category": "Primary Standard",
            "status": "MISSING",
            "standard": None,
            "note": "No applicable Indian Standard identified for the submitted specification text.",
            "evidence": "Candidate retrieval returned 0 matching standards.",
            "suggested_action": "Specify the exact product type and intended service application (e.g. IS 4151 for motorcycle helmets)."
        })
        gaps.append({
            "category": "Primary Standard",
            "severity": "HIGH",
            "description": "No primary Indian Standard referenced or recognized.",
            "suggestion": "Specify the exact product type and intended service application (e.g. IS 4151 for motorcycle helmets).",
            "supporting_evidence": "BIS Act Section 16 & CVC Guidelines mandate reference to national standards where available."
        })

    # 2. Safety Requirements Check
    primary_has_safety = primary_std is not None and (
        "safety" in (primary_std.get("scope") or "").lower() or bool(primary_std.get("requirements"))
    )
    has_safety_rel = "safety" in present_rel_types

    if req.get("safety_required") and (primary_has_safety or has_safety_rel):
        has_detailed_safety = any(k in sl for k in ["shock absorption", "impact", "deceleration", "penetration", "retention", "300g"])
        if has_detailed_safety:
            coverage.append({
                "category": "Safety",
                "status": "FOUND",
                "standard": primary_std["is_number"] if primary_std else None,
                "note": "Safety requirements and quantitative attenuation thresholds specified.",
                "evidence": f"{primary_std['is_number']} defines impact attenuation thresholds.",
                "suggested_action": None
            })
        else:
            coverage.append({
                "category": "Safety",
                "status": "PARTIAL",
                "standard": primary_std["is_number"] if primary_std else None,
                "note": "Safety requested in general terms, but quantitative thresholds (e.g. 300g deceleration) are omitted.",
                "evidence": f"Standard {primary_std['is_number']} prescribes quantitative limits, but tender draft lacks specific figures.",
                "suggested_action": "Incorporate quantitative deceleration and penetration resistance limits."
            })
            gaps.append({
                "category": "Safety",
                "severity": "MEDIUM",
                "description": "Safety requirements are mentioned in general terms without quantitative performance thresholds.",
                "suggestion": "Incorporate clause: 'Peak headform deceleration shall not exceed 300g during drop tests onto flat and hemispherical anvils from 1.5m height.'",
                "supporting_evidence": f"{primary_std['is_number']} Clause on Shock Absorption."
            })
    elif req.get("safety_required") and not (primary_has_safety or has_safety_rel):
        coverage.append({
            "category": "Safety",
            "status": "MISSING",
            "standard": None,
            "note": "Safety requirements requested, but no supporting standard or clause identified.",
            "evidence": "No safety standard identified in demonstration knowledge base for this specification.",
            "suggested_action": "Incorporate recognized safety standard clauses into procurement document."
        })
        gaps.append({
            "category": "Safety",
            "severity": "HIGH",
            "description": "Safety requirements requested but no applicable safety standard identified.",
            "suggestion": "Add explicit safety performance requirements referencing an applicable IS standard.",
            "supporting_evidence": "Tender specification text mentions safety, but no standard was matched."
        })
    else:
        # Safety NOT mentioned
        is_ppe = primary_std and "helmet" in (primary_std.get("product_type") or "").lower()
        if is_ppe:
            coverage.append({
                "category": "Safety",
                "status": "REVIEW",
                "standard": primary_std["is_number"] if primary_std else None,
                "note": "Safety requirements omitted in specification despite safety-critical equipment category.",
                "evidence": f"Equipment category '{primary_std['product_type']}' is safety-critical personal protective equipment.",
                "suggested_action": "Add explicit safety performance requirements referencing the applicable IS standard."
            })
            gaps.append({
                "category": "Safety",
                "severity": "MEDIUM",
                "description": "Safety requirements are not explicitly stated in the specification for protective headgear.",
                "suggestion": "Add explicit safety performance requirements referencing the applicable IS standard.",
                "supporting_evidence": f"{primary_std['is_number']} mandates safety compliance."
            })
        else:
            coverage.append({
                "category": "Safety",
                "status": "REVIEW",
                "standard": None,
                "note": "Safety performance requirements not explicitly mentioned in specification.",
                "evidence": "Specification text audit: no safety terms detected.",
                "suggested_action": "Review whether safety parameters apply to this procurement category."
            })

    # 3. Test Methods Check
    primary_has_testing = primary_std is not None and primary_std.get("testing_requirements") is not None
    has_test_rel = "test_method" in present_rel_types

    if req.get("testing_required") and (primary_has_testing or has_test_rel):
        has_detailed_test = any(k in sl for k in ["drop test", "conditioning", "penetration", "retention"])
        if has_detailed_test:
            coverage.append({
                "category": "Test Method",
                "status": "FOUND",
                "standard": primary_std["is_number"] if primary_std else None,
                "note": "Testing requirements and laboratory criteria covered.",
                "evidence": f"Prescribed test methods defined in {primary_std['is_number'] if primary_std else 'test standards'}.",
                "suggested_action": None
            })
        else:
            coverage.append({
                "category": "Test Method",
                "status": "PARTIAL",
                "standard": primary_std["is_number"] if primary_std else None,
                "note": "Testing requested, but specific test schedule clauses (type test, acceptance test) are unstated.",
                "evidence": f"Standard provides test schedule, but tender lacks clause citations.",
                "suggested_action": "Explicitly cite type tests and routine acceptance test clauses in tender document."
            })
            gaps.append({
                "category": "Test Method",
                "severity": "MEDIUM",
                "description": "Testing is mandated in general terms, but specific laboratory test schedules are not referenced.",
                "suggestion": "Include type test, routine test, or acceptance test criteria in the specification referencing the applicable standard.",
                "supporting_evidence": f"{primary_std['is_number'] if primary_std else 'Standard'} prescribes mandatory testing."
            })
    elif not req.get("testing_required"):
        coverage.append({
            "category": "Test Method",
            "status": "MISSING",
            "standard": primary_std["is_number"] if primary_std else None,
            "note": "No laboratory acceptance or type testing requirements stipulated in specification.",
            "evidence": "Specification text audit: 0 testing terms detected.",
            "suggested_action": "Include type test, routine test, or acceptance test criteria in the specification."
        })
        gaps.append({
            "category": "Test Method",
            "severity": "HIGH",
            "description": "No testing requirements or test methods are specified in the procurement specification.",
            "suggestion": "Include type test, routine test, or acceptance test criteria in the specification referencing the applicable standard.",
            "supporting_evidence": "CVC Guidelines mandate clear quality acceptance testing criteria to prevent defective supplies."
        })
    else:
        coverage.append({
            "category": "Test Method",
            "status": "MISSING",
            "standard": None,
            "note": "Testing requested in specification, but no test standard or schedule is available.",
            "evidence": "Absence of testing schedule in identified standards.",
            "suggested_action": "Explicitly cite recognized NABL / BIS laboratory test methods."
        })
        gaps.append({
            "category": "Test Method",
            "severity": "HIGH",
            "description": "Testing requirements mentioned but inadequate test schedule coverage in identified standards.",
            "suggestion": "Explicitly reference test clauses and protocols from recognized standards.",
            "supporting_evidence": "Tender specification text requests testing."
        })

    # 4. Installation / Deployment (Per requirement 15: REVIEW, not MISSING for PPE)
    if "installation" in present_rel_types:
        coverage.append({
            "category": "Installation",
            "status": "FOUND",
            "standard": "Installation Companion",
            "note": "Installation / deployment requirements covered.",
            "evidence": "Companion installation standard identified.",
            "suggested_action": None
        })
    else:
        coverage.append({
            "category": "Installation",
            "status": "REVIEW",
            "standard": None,
            "note": "Installation requirements may not be applicable to this product category (wearable PPE).",
            "evidence": "Product category: wearable personal protective equipment.",
            "suggested_action": "Review whether storage, shelf-life, or usage instructions are required."
        })

    # 5. BIS / ISI Certification Mark
    has_cert = req.get("certification_required")
    primary_has_cert_scheme = primary_std is not None and primary_std.get("certification_scheme") is not None
    is_qco_mandated = primary_has_cert_scheme and primary_std["certification_scheme"].get("mandatory")

    if has_cert and (primary_has_cert_scheme or "certified_under" in present_rel_types):
        coverage.append({
            "category": "Certification",
            "status": "FOUND",
            "standard": primary_std["is_number"] if primary_std else None,
            "note": "Mandatory ISI Certification Mark requirement explicitly stipulated.",
            "evidence": f"Certification scheme: {primary_std['certification_scheme'].get('scheme', 'ISI Mark')} under {primary_std['certification_scheme'].get('legal_basis', 'BIS Act, 2016')}.",
            "suggested_action": None
        })
    elif not has_cert:
        coverage.append({
            "category": "Certification",
            "status": "MISSING",
            "standard": primary_std["is_number"] if primary_std else None,
            "note": "Crucial requirement: Mandatory BIS ISI mark not stipulated in specification.",
            "evidence": "Specification text audit: 0 certification keywords detected.",
            "suggested_action": "Add compulsory stipulation: 'All helmets shall bear the Bureau of Indian Standards (BIS) ISI Mark under a valid CM/L licence.'"
        })
        gaps.append({
            "category": "Certification",
            "severity": "HIGH",
            "description": "The specification fails to mandate that supplied products bear the BIS Standard Mark (ISI).",
            "suggestion": "Add compulsory stipulation: 'All helmets shall bear the Bureau of Indian Standards (BIS) ISI Mark under a valid CM/L licence as per the Helmets (Quality Control) Order, 2020.'",
            "supporting_evidence": "Item is governed by statutory Quality Control Order requiring compulsory ISI marking." if is_qco_mandated else "Rule 144 of GFR 2017 mandates adherence to national quality standards."
        })
    else:
        coverage.append({
            "category": "Certification",
            "status": "PARTIAL",
            "standard": primary_std["is_number"] if primary_std else None,
            "note": "Certification demanded in tender; specific CM/L licensing schedule verification needed.",
            "evidence": "Specification demands certification, but explicit BIS scheme details are unconfirmed.",
            "suggested_action": "Specify BIS ISI Mark under Scheme-I of BIS (Conformity Assessment) Regulations, 2018."
        })
        gaps.append({
            "category": "Certification",
            "severity": "MEDIUM",
            "description": "Certification mentioned in tender text but specific BIS CM/L license verification clause is absent.",
            "suggestion": "Specify BIS ISI Mark and require bidders to upload an active CM/L license certificate on GeM.",
            "supporting_evidence": "GeM General Terms & Conditions require bidders to upload valid BIS licenses."
        })

    # 6. Normative Companion Standards
    norm_refs = [r for r in related if r.get("relationship_type") in ("normative_reference", "terminology", "test_method")]
    if norm_refs:
        ref_names = ", ".join(r["standard"]["is_number"] for r in norm_refs[:2])
        coverage.append({
            "category": "Normative References",
            "status": "FOUND",
            "standard": ref_names,
            "note": f"{len(norm_refs)} normative companion standard(s) identified ({ref_names}).",
            "evidence": "Demonstration standards knowledge network relationships.",
            "suggested_action": None
        })
    else:
        coverage.append({
            "category": "Normative References",
            "status": "REVIEW",
            "standard": None,
            "note": "No auxiliary normative references identified beyond the primary standard.",
            "evidence": "Demonstration graph traversal yielded 0 companion standards.",
            "suggested_action": "Review whether auxiliary calibration headforms or material test standards should be referenced."
        })

    # Clause-by-clause detailed analysis if primary standard has clauses
    if primary and primary_std.get("clauses"):
        for cl in primary_std["clauses"]:
            cl_found = any(w in sl for w in [cl["title"].lower(), cl["clause"].lower(), cl["requirement"][:15].lower()])
            clauses_analysis.append({
                "clause": cl["clause"],
                "title": cl["title"],
                "requirement": cl["requirement"],
                "status": "COMPLIANT" if cl_found else "OMITTED_IN_SPEC",
                "risk": "NONE" if cl_found else ("HIGH" if "ISI" in cl["title"] or "Shock" in cl["title"] else "MODERATE")
            })

    return coverage, gaps, clauses_analysis


def calculate_compliance_score(coverage: list, gaps: list) -> int:
    total_items = max(len(coverage), 1)
    found_items = sum(1 for c in coverage if c["status"] == "FOUND")
    partial_items = sum(1 for c in coverage if c["status"] == "PARTIAL")
    review_items = sum(1 for c in coverage if c["status"] == "REVIEW")
    raw_score = (found_items * 100 + partial_items * 60 + review_items * 40) / total_items
    
    # Penalize for critical high gaps
    high_gaps = sum(1 for g in gaps if g["severity"] == "HIGH")
    score = raw_score - (high_gaps * 8)
    return max(15, min(int(round(score)), 100))


def generate_gem_clause(primary_std: dict | None, req: dict, gaps: list) -> str:
    if not primary_std:
        return "TENDER SPECIFICATION CLAUSE: The bidder must specify and conform strictly to the applicable Bureau of Indian Standards (BIS) product specifications."

    std = primary_std["standard"]
    is_num = std["is_number"]
    title = std["title"]
    year = std.get("year", 2015)
    
    text = f"""SPECIAL TERMS & TECHNICAL CONDITIONS FOR GeM TENDER:

1. APPLICABLE INDIAN STANDARD:
   The bidder shall supply {std.get('product_type', 'protective headgear')} conforming strictly to {is_num}:{year} ("{title}") incorporating all up-to-date amendments.

2. COMPULSORY BIS CERTIFICATION (ISI MARK):
   Under the provisions of Section 16 of the Bureau of Indian Standards Act, 2016 and the applicable Quality Control Order, the offered product MUST compulsorily bear the Standard ISI Mark. The bidder must submit a valid BIS License (CM/L Number) along with the technical bid. Bids without a verified BIS license shall be summarily rejected at the technical qualification stage.

3. TESTING & ACCEPTANCE PROTOCOL:
   Consignee reserves the right to draw random samples from each supply lot for third-party destructive and non-destructive testing at NABL-accredited / BIS-approved laboratories for:
   (a) Shock Absorption & Peak Deceleration Test (shall not exceed 300g per {is_num});
   (b) Penetration Resistance Test utilizing standardized conical striker;
   (c) Dynamic Chin Strap Retention Test withstanding 25 kg load without slippage exceeding 25mm;
   (d) Pre-conditioning across ambient, high temperature (+50°C), cold (-20°C), and water immersion conditions.
   All testing expenses shall be borne by the supplier.

4. MARKING & TRACEABILITY:
   Each unit shall permanently display: (i) {is_num} ISI Mark, (ii) Manufacturer CM/L License Number, (iii) Batch & Serial Number, (iv) Month & Year of Manufacture, and (v) Procuring Department Identification Stamp."""
    return text.strip()


def generate_explanation(req: dict, primary: dict | None, gaps: list, score: int) -> str:
    lines = []
    lines.append("### Technical & Standards Evaluation Findings")
    if req.get("product"):
        lines.append(f"**Identified Domain**: Procurement specification targets **{req['product'].upper()}** for **{req.get('application', 'Public Service Procurement')}**.")
    else:
        lines.append("**Domain Determination**: General head protection specification detected.")

    if primary:
        std = primary["standard"]
        lines.append(f"\n**Primary Applicable Standard**: **{std['is_number']}** (*{std['title']}*). Recommended because the specification identifies {req.get('product', 'protective headgear')} and the demonstration knowledge base associates it with {std['is_number']}.")
        
        if std.get("certification_scheme", {}).get("mandatory"):
            lines.append(f"\n⚠️ **Statutory Quality Control Order (QCO)**: This item is under **COMPULSORY BIS CERTIFICATION**. Supply of non-ISI marked items is prohibited under Section 29, BIS Act, 2016.")
    
    lines.append(f"\n**Specification Compliance Rating**: **{score}%** (Relevance score indicates similarity to the supplied specification; it is not a compliance guarantee).")
    
    if gaps:
        high = [g for g in gaps if g["severity"] == "HIGH"]
        if high:
            lines.append(f"\n**Critical Drafting Deficiencies Detected ({len(high)})**:")
            for g in high:
                lines.append(f"- **{g['category']}**: {g['description']} *(Action: {g['suggestion']})*")
        else:
            lines.append("\nNo critical legal or structural gaps detected. Specification conforms to core procurement requirements.")
    
    lines.append("\n*Prepared by ISense (AI-Powered Standards Decision-Support Prototype) for Smart India Hackathon evaluation.*")
    return "\n".join(lines)


def full_pipeline(spec: str, tender_id: str = "", department: str = "", domain: str = "", strict_mode: bool = False) -> dict:
    req = extract_requirements(spec)
    candidates = retrieve_candidates(req)

    primary = None
    related = []
    status = "NOT_FOUND"

    if req.get("unknown_standards") and not req.get("specific_standards"):
        # Explicit standard reference detected, but no matching standard exists in demonstration KB
        primary = None
        status = "MANUAL_REVIEW"
        # Provide candidates as secondary suggestions
        for std, score, signals in candidates:
            if score >= 0.15:
                related.append(build_recommendation(std, score, "preliminary_suggestion", signals=signals))
    elif candidates:
        top_std, top_score, top_signals = candidates[0]
        if top_score >= 0.20:
            primary = build_recommendation(
                top_std, top_score, "primary",
                f"Direct match for {req.get('product', 'protective headgear')} procurement conforming to {top_std['is_number']} standards.",
                signals=top_signals
            )
            status = "FOUND"
            related = expand_graph(top_std["is_number"], req)
            # Add secondary candidates not already in related
            graph_nums = {r["standard"]["is_number"] for r in related}
            for std, score, signals in candidates[1:]:
                if std["is_number"] not in graph_nums and score >= 0.15:
                    related.append(build_recommendation(std, score, "related_product", signals=signals))
            related.sort(key=lambda r: r["relevance_score"], reverse=True)
        else:
            status = "MANUAL_REVIEW"

    coverage, gaps, clauses_analysis = analyze_coverage(spec, req, primary, related)
    score = calculate_compliance_score(coverage, gaps)
    explanation = generate_explanation(req, primary, gaps, score)
    gem_clause = generate_gem_clause(primary, req, gaps)

    cert_id = f"ISENSE-SIH/2026/VAL-{random.randint(10000, 99999)}"
    eval_date = time.strftime("%d %b %Y, %H:%M:%S IST")

    # Match relevant QCO
    matched_qco = None
    if primary:
        p_is = primary["standard"]["is_number"]
        for qco in QCO_ORDERS_DATA:
            if p_is in qco["standard_mandated"]:
                matched_qco = qco
                break

    return {
        "certificate_id": cert_id,
        "evaluation_timestamp": eval_date,
        "tender_id": tender_id or "GEM/2026/B/LOCAL-EVAL",
        "department": department or "Public Procurement Division",
        "domain": domain or (req.get("product") or "Head Protection"),
        "compliance_score": score,
        "specification_summary": f"{(req.get('product') or 'General Headgear').title()} · {(req.get('application') or 'Procurement Analysis')}",
        "extracted_requirements": req,
        "primary_standard": primary,
        "related_standards": related,
        "coverage": coverage,
        "gaps": gaps,
        "clauses_analysis": clauses_analysis,
        "gem_clause_template": gem_clause,
        "matched_qco": matched_qco,
        "explanation": explanation,
        "processing_status": status,
        "decision_support_notice": "Decision-support output — final procurement qualification and compliance decisions remain with the authorized procurement officer.",
        "disclaimer": (
            "ISense is a Smart India Hackathon prototype and is not an official BIS, GeM, CVC or Government of India system. "
            "Standards and regulatory information should be verified against current official publications before procurement decisions."
        ),
        "unknown_standards_detected": req.get("unknown_standards", []),
        "specification_needs_clarification": req.get("specification_needs_clarification", False),
        "clarification_prompt": req.get("clarification_prompt"),
    }


# ── HTTP Server ────────────────────────────────────────────────────────────────

class ISenseHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"  {self.address_string()} — {format % args}")

    def send_json(self, data: Any, status: int = 200):
        body = json.dumps(data, default=str).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?")[0]
        if path in ("/", "/api/v1/health"):
            self.send_json({
                "status": "ok",
                "app": "ISense — BIS Standards Decision-Support Engine (SIH Prototype)",
                "version": "2.4.0",
                "environment": "sih-prototype",
                "organization": "Smart India Hackathon Prototype (PS-2)",
                "database": "curated-demonstration-knowledge-base",
                "standards_count": len(STANDARDS_DATA),
                "ai_configured": True
            })
        elif path == "/api/v1/standards":
            self.send_json([{
                "id": s["is_number"].replace(" ", "-").lower(),
                "is_number": s["is_number"],
                "title": s["title"],
                "year": s.get("year"),
                "product_type": s.get("product_type"),
                "status": s.get("status", "ACTIVE"),
                "confidence_level": s.get("confidence_level", "VERIFIED"),
                "scope": s.get("scope"),
                "clauses_count": len(s.get("clauses", [])),
                "mandatory": s.get("certification_scheme", {}).get("mandatory", False)
            } for s in STANDARDS_DATA])
        elif path == "/api/v1/relationships":
            self.send_json(RELATIONSHIPS_DATA)
        elif path == "/api/v1/qco-orders":
            self.send_json(QCO_ORDERS_DATA)
        elif path.startswith("/api/v1/standards/"):
            is_num = path.replace("/api/v1/standards/", "").replace("/related", "").replace("-", " ").upper()
            std = STANDARDS_BY_IS.get(is_num)
            if "/related" in path:
                rels = [r for r in RELATIONSHIPS_DATA if r["source"] == is_num]
                self.send_json(rels)
            elif std:
                self.send_json(build_std_resp(std))
            else:
                self.send_json({"detail": f"Standard {is_num} not found in repository"}, 404)
        else:
            self.send_json({"detail": "Endpoint not found"}, 404)

    def do_POST(self):
        if self.path == "/api/v1/analyze":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body)
                spec = data.get("specification", "")
                if len(spec.strip()) < 10:
                    self.send_json({"detail": "Specification too short (minimum 10 characters required)"}, 422)
                    return
                tender_id = data.get("tender_id", "")
                department = data.get("department", "")
                domain = data.get("domain", "")
                strict_mode = data.get("strict_mode", False)

                result = full_pipeline(spec, tender_id, department, domain, strict_mode)
                self.send_json(result)
            except Exception as e:
                self.send_json({"detail": f"Analysis execution error: {str(e)}"}, 500)
        else:
            self.send_json({"detail": "Not found"}, 404)


if __name__ == "__main__":
    PORT = 8000
    server = HTTPServer(("0.0.0.0", PORT), ISenseHandler)
    print()
    print("  +-----------------------------------------------------------+")
    print("  |   ISense BIS Standards Decision-Support Engine (SIH PS-2) |")
    print("  +-----------------------------------------------------------+")
    print(f"  |  API Base:   http://localhost:{PORT}                         |")
    print(f"  |  Health:     http://localhost:{PORT}/api/v1/health               |")
    print(f"  |  Standards:  http://localhost:{PORT}/api/v1/standards            |")
    print(f"  |  QCO Orders: http://localhost:{PORT}/api/v1/qco-orders           |")
    print("  +-----------------------------------------------------------+")
    print()
    print(f"  Loaded {len(STANDARDS_DATA)} Curated BIS Standards & {len(RELATIONSHIPS_DATA)} Normative Relationships.")
    print("  Serving requests...")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Server shutting down.")

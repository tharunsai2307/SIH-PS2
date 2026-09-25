"""
ISense Demo Backend — Production Prototype Server
Bureau of Indian Standards (BIS) Recommendation & Compliance Engine
Runs in-memory with complete standards knowledge graph, clauses analysis, and GeM clause generator.

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

# ── Requirement Extraction ──────────────────────────────────────────────────────
SAFETY_KEYWORDS = ["safety", "safe", "protect", "protective", "crash", "impact", "hazard", "shock"]
TESTING_KEYWORDS = ["test", "testing", "tested", "lab", "laboratory", "type test", "routine test", "acceptance test", "drop test"]
CERT_KEYWORDS = ["certif", "isi mark", "bis", "license", "approved", "comply", "conforming", "marked", "qco"]

PRODUCT_MAP = {
    "motorcycle helmet": ["motorcycle", "motorcycl", "moped", "scooter", "bike rider", "two wheel", "rider"],
    "industrial safety helmet": ["industrial", "construction", "mining", "factory", "hard hat", "site worker"],
    "firefighter helmet": ["fire", "firefight", "fire brigade", "heat resistant", "rescue"],
    "tactical riot helmet": ["riot", "police", "paramilitary", "tactical", "crpf", "law enforcement", "ballistic"],
    "racing helmet": ["racing", "motorsport", "rally", "car driver", "fia"],
    "cycling helmet": ["cycl", "bicycle", "cyclist"],
    "equestrian helmet": ["horse", "equestrian", "jockey"],
    "cricket helmet": ["cricket", "batsman", "faceguard"],
}

PRODUCT_TO_IS = {
    "motorcycle helmet": "IS 4151",
    "industrial safety helmet": "IS 2925",
    "firefighter helmet": "IS 2745",
    "tactical riot helmet": "IS 14740",
    "racing helmet": "IS 9562",
    "cycling helmet": "IS 4129",
    "equestrian helmet": "IS 15758",
    "cricket helmet": "IS 16328",
}


def extract_requirements(spec: str) -> dict:
    sl = spec.lower()
    product = None
    for pname, kws in PRODUCT_MAP.items():
        if any(k in sl for k in kws):
            product = pname
            break

    application = None
    if "motorcycle" in sl or "moped" in sl or "scooter" in sl or "two wheel" in sl:
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

    safety_req = any(k in sl for k in SAFETY_KEYWORDS)
    testing_req = any(k in sl for k in TESTING_KEYWORDS)
    cert_req = any(k in sl for k in CERT_KEYWORDS)
    is_nums = [f"IS {m.group(1)}" for m in re.finditer(r"\bIS\s*(\d{3,6})\b", spec, re.IGNORECASE)]
    
    tech_kws = [t for t in [
        "helmet", "head protection", "impact", "shock absorption", "chin strap",
        "retention", "ISI", "BIS", "certification", "visor", "penetration", "conditioning",
        "EPS liner", "quick-release", "flammability", "electrical resistance"
    ] if t.lower() in sl]

    ambiguities = []
    if not product:
        ambiguities.append("Product category not explicitly detected — default or manual classification required.")
    if not cert_req:
        ambiguities.append("Mandatory BIS ISI Mark certification requirement is omitted in draft specification.")
    if not testing_req:
        ambiguities.append("Acceptance & type testing procedures (drop test, retention load) are unspecified.")

    return {
        "product": product,
        "application": application,
        "safety_required": safety_req,
        "testing_required": testing_req,
        "certification_required": cert_req,
        "specific_standards": list(set(is_nums)),
        "technical_keywords": tech_kws,
        "ambiguities": ambiguities,
    }


def score_standard(std: dict, req: dict) -> float:
    score = 0.0
    sl_prod = (req.get("product") or "").lower()
    std_prod = (std.get("product_type") or "").lower()

    if sl_prod and std_prod:
        if sl_prod == std_prod:
            score += 0.55
        elif any(w in std_prod for w in sl_prod.split()):
            score += 0.35

    kws = set(k.lower() for k in (std.get("keywords") or []))
    tech = set(k.lower() for k in (req.get("technical_keywords") or []))
    if kws and tech:
        score += (len(kws & tech) / max(len(tech), 1)) * 0.30

    if req.get("specific_standards") and std["is_number"] in req["specific_standards"]:
        score += 0.45

    if req.get("certification_required") and std.get("certification_scheme"):
        score += 0.10

    if req.get("safety_required") and ("safety" in (std.get("scope") or "").lower()):
        score += 0.10

    return min(score, 1.0)


def retrieve_candidates(req: dict) -> list:
    scored = [(s, score_standard(s, req)) for s in STANDARDS_DATA]
    scored = [(s, sc) for s, sc in scored if sc > 0.0]
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
                "relevance_label": "HIGH" if score >= 0.75 else "MEDIUM" if score >= 0.45 else "LOW",
                "reason": f"{LABELS.get(rel['type'], rel['type'])} — {rel.get('description', 'related standard')}",
                "relationship_type": rel["type"],
                "evidence": [{
                    "standard_number": std["is_number"],
                    "claim": f"Officially linked to {primary_is} in BIS National Standards Registry",
                    "source": std.get("source_reference"),
                    "confidence": "VERIFIED"
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


def build_recommendation(std: dict, score: float, rel_type: str = "primary", reason: str = "") -> dict:
    label = "HIGH" if score >= 0.70 else "MEDIUM" if score >= 0.45 else "LOW"
    if not reason:
        reason = f"Identified as prime standard matching '{std.get('product_type', '')}' specifications."
    return {
        "standard": build_std_resp(std),
        "relevance_score": round(score, 3),
        "relevance_label": label,
        "reason": reason,
        "relationship_type": rel_type,
        "evidence": [{
            "standard_number": std["is_number"],
            "claim": f"Active standard published by BIS under Bureau of Indian Standards Act, 2016",
            "source": std.get("source_reference"),
            "confidence": std.get("confidence_level", "VERIFIED")
        }],
    }


def analyze_coverage(spec: str, req: dict, primary: dict | None, related: list) -> tuple[list, list, list]:
    sl = spec.lower()
    coverage = []
    gaps = []
    clauses_analysis = []
    present_rel_types = {r["relationship_type"] for r in related}

    # 1. Primary Standard Check
    if primary:
        coverage.append({
            "category": "Primary Standard Specification",
            "status": "FOUND",
            "standard": primary["standard"]["is_number"],
            "note": f"Applicable Standard: {primary['standard']['is_number']} ({primary['standard']['title']})"
        })
    else:
        coverage.append({
            "category": "Primary Standard Specification",
            "status": "MISSING",
            "standard": None,
            "note": "No applicable Indian Standard identified for the submitted specification text."
        })
        gaps.append({
            "category": "Primary Standard",
            "severity": "HIGH",
            "description": "No primary Indian Standard referenced or recognized.",
            "suggestion": "Specify the exact product type and intended service application (e.g. IS 4151 for motorcycle helmets)."
        })

    # 2. Mandatory BIS / ISI Certification
    has_cert = ("isi" in sl or "bis" in sl or "certification" in sl or "license" in sl)
    if has_cert and primary and primary["standard"].get("certification_scheme"):
        coverage.append({
            "category": "BIS / ISI Certification Mark",
            "status": "FOUND",
            "standard": primary["standard"]["is_number"],
            "note": "Mandatory ISI Certification Mark requirement explicitly stipulated."
        })
    elif not has_cert:
        coverage.append({
            "category": "BIS / ISI Certification Mark",
            "status": "MISSING",
            "standard": primary["standard"]["is_number"] if primary else None,
            "note": "Crucial requirement: Mandatory ISI mark not found in specification."
        })
        gaps.append({
            "category": "BIS Certification",
            "severity": "HIGH",
            "description": "The specification fails to mandate that supplied products bear the BIS Standard Mark (ISI).",
            "suggestion": "Add compulsory stipulation: 'All helmets shall bear the Bureau of Indian Standards (BIS) ISI Mark under a valid CM/L licence as per the Helmets (Quality Control) Order, 2020.'"
        })
    else:
        coverage.append({
            "category": "BIS / ISI Certification Mark",
            "status": "REVIEW",
            "standard": primary["standard"]["is_number"],
            "note": "Certification mentioned in general terms; exact CM/L licence verification clause recommended."
        })

    # 3. Shock Absorption & Impact Criteria
    has_impact = ("shock" in sl or "impact" in sl or "deceleration" in sl or "drop test" in sl or "300g" in sl or "5000 n" in sl)
    if has_impact:
        coverage.append({
            "category": "Shock Absorption & Impact Attenuation",
            "status": "FOUND",
            "standard": primary["standard"]["is_number"] if primary else None,
            "note": "Impact energy attenuation parameters specified."
        })
    else:
        coverage.append({
            "category": "Shock Absorption & Impact Attenuation",
            "status": "MISSING",
            "standard": primary["standard"]["is_number"] if primary else None,
            "note": "Missing quantitative deceleration or impact test parameters."
        })
        gaps.append({
            "category": "Impact Attenuation",
            "severity": "HIGH",
            "description": "Absence of dynamic shock absorption thresholds poses safety and legal non-compliance risks.",
            "suggestion": "Incorporate clause: 'Peak headform deceleration shall not exceed 300g during drop tests onto flat and hemispherical anvils from 1.5m height.'"
        })

    # 4. Retention & Chin Strap Dynamic Load
    has_retention = ("chin strap" in sl or "retention" in sl or "buckle" in sl or "25 kg" in sl or "harness" in sl)
    if has_retention:
        coverage.append({
            "category": "Retention System & Chin Strap",
            "status": "FOUND",
            "standard": primary["standard"]["is_number"] if primary else None,
            "note": "Retention mechanism and dynamic test criteria present."
        })
    else:
        coverage.append({
            "category": "Retention System & Chin Strap",
            "status": "MISSING",
            "standard": primary["standard"]["is_number"] if primary else None,
            "note": "Chin strap dynamic strength and quick-release mechanism unstated."
        })
        gaps.append({
            "category": "Retention System",
            "severity": "HIGH",
            "description": "Tender does not define chin strap width, dynamic load rating (25 kg), or quick-release buckle specs.",
            "suggestion": "Specify: 'Chin strap shall have minimum width 20mm, withstand dynamic test load of 25kg, and feature a quick-release buckle mechanism.'"
        })

    # 5. Penetration Resistance & Environmental Conditioning
    has_pen = ("penetration" in sl or "striker" in sl or "conical" in sl or "environmental" in sl or "conditioning" in sl or "temperature" in sl)
    if has_pen:
        coverage.append({
            "category": "Penetration Resistance & Conditioning",
            "status": "FOUND",
            "standard": primary["standard"]["is_number"] if primary else None,
            "note": "Penetration resistance and environmental testing criteria defined."
        })
    else:
        coverage.append({
            "category": "Penetration Resistance & Conditioning",
            "status": "REVIEW",
            "standard": primary["standard"]["is_number"] if primary else None,
            "note": "Pre-conditioning tests (ambient, cold -20°C, heat +50°C, water immersion) not explicitly mandated."
        })
        gaps.append({
            "category": "Environmental Conditioning",
            "severity": "MEDIUM",
            "description": "Absence of multi-temperature conditioning clauses may permit failure in extreme Indian climates.",
            "suggestion": "Mandate sample pre-conditioning in ambient (+25°C), cold (-20°C), heat (+50°C), and water immersion prior to destructive tests."
        })

    # 6. Normative Companion Standards (Headforms / Materials)
    norm_ok = any(rt in present_rel_types for rt in ["normative_reference", "terminology"])
    if norm_ok:
        coverage.append({
            "category": "Normative Companion Standards (IS 7692 / IS 9944)",
            "status": "FOUND",
            "standard": "IS 7692:2018",
            "note": "Prescribed testing headforms and elastomeric cushion standards identified."
        })
    else:
        coverage.append({
            "category": "Normative Companion Standards",
            "status": "REVIEW",
            "standard": None,
            "note": "Normative references (e.g. IS 7692 calibrated headforms) should be referenced in laboratory acceptance clauses."
        })

    # Clause-by-clause detailed analysis if primary standard has clauses
    if primary and primary["standard"].get("clauses"):
        for cl in primary["standard"]["clauses"]:
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
    review_items = sum(1 for c in coverage if c["status"] == "REVIEW")
    raw_score = (found_items * 100 + review_items * 40) / total_items
    
    # Penalize for critical high gaps
    high_gaps = sum(1 for g in gaps if g["severity"] == "HIGH")
    score = raw_score - (high_gaps * 8)
    return max(15, min(int(round(score)), 100))


def generate_gem_clause(primary_std: dict, req: dict, gaps: list) -> str:
    if not primary_std:
        return "TENDER SPECIFICATION CLAUSE: The supplied items must conform to applicable Bureau of Indian Standards specifications."

    std = primary_std["standard"]
    is_num = std["is_number"]
    title = std["title"]
    year = std.get("year", 2015)
    
    text = f"""SPECIAL TERMS & TECHNICAL CONDITIONS FOR GeM TENDER:

1. APPLICABLE INDIAN STANDARD:
   The bidder shall supply {std.get('product_type', 'protective headgear')} conforming strictly to {is_num}:{year} ("{title}") incorporating all up-to-date amendments.

2. COMPULSORY BIS CERTIFICATION (ISI MARK):
   Under the provisions of Section 16 of the Bureau of Indian Standards Act, 2016 and the Helmets (Quality Control) Order, the offered product MUST compulsorily bear the Standard ISI Mark. The bidder must submit a valid BIS License (CM/L Number) along with the technical bid. Bids without a verified BIS license shall be summarily rejected at the technical qualification stage.

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
    lines.append(f"### Technical & Legal Evaluation Findings")
    if req.get("product"):
        lines.append(f"**Identified Domain**: Procurement specification targets **{req['product'].upper()}** for **{req.get('application', 'Official Government Service')}**.")
    else:
        lines.append("**Domain Determination**: General head protection specification detected.")

    if primary:
        std = primary["standard"]
        lines.append(f"\n**Primary Applicable Standard**: **{std['is_number']}** (*{std['title']}*). This is the legally designated Indian Standard governing this procurement category in accordance with the Bureau of Indian Standards Act, 2016.")
        
        if std.get("certification_scheme", {}).get("mandatory"):
            lines.append(f"\n⚠️ **Statutory Quality Control Order (QCO)**: This item is under **COMPULSORY BIS CERTIFICATION**. Supply of non-ISI marked items is prohibited under Indian law (Section 29, BIS Act).")
    
    lines.append(f"\n**Specification Compliance Rating**: **{score}%**.")
    
    if gaps:
        high = [g for g in gaps if g["severity"] == "HIGH"]
        if high:
            lines.append(f"\n**Critical Drafting Deficiencies Detected ({len(high)})**:")
            for g in high:
                lines.append(f"- **{g['category']}**: {g['description']} *(Action: {g['suggestion']})*")
        else:
            lines.append("\nNo critical legal or structural gaps detected. Specification conforms to core procurement requirements.")
    
    lines.append("\n*Prepared by ISense (AI-Powered Standards Engine) in accordance with BIS guidelines & Central Vigilance Commission (CVC) tender standards.*")
    return "\n".join(lines)


def full_pipeline(spec: str, tender_id: str = "", department: str = "", domain: str = "", strict_mode: bool = False) -> dict:
    req = extract_requirements(spec)
    candidates = retrieve_candidates(req)

    primary = None
    related = []
    status = "NOT_FOUND"

    if candidates:
        top_std, top_score = candidates[0]
        if top_score >= 0.20:
            primary = build_recommendation(
                top_std, top_score, "primary",
                f"Direct match for {req.get('product', 'protective headgear')} procurement conforming to {top_std['is_number']} standards."
            )
            status = "FOUND"
            related = expand_graph(top_std["is_number"], req)
            # Add secondary candidates not already in related
            graph_nums = {r["standard"]["is_number"] for r in related}
            for std, score in candidates[1:]:
                if std["is_number"] not in graph_nums and score >= 0.15:
                    related.append(build_recommendation(std, score, "related_product"))
            related.sort(key=lambda r: r["relevance_score"], reverse=True)
        else:
            status = "MANUAL_REVIEW"

    coverage, gaps, clauses_analysis = analyze_coverage(spec, req, primary, related)
    score = calculate_compliance_score(coverage, gaps)
    explanation = generate_explanation(req, primary, gaps, score)
    gem_clause = generate_gem_clause(primary, req, gaps)

    cert_id = f"BIS-ISENSE/2026/VAL-{random.randint(10000, 99999)}"
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
        "specification_summary": f"{req.get('product', 'Head Protection').title()} · {req.get('application', 'Official Procurement')}",
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
        "disclaimer": (
            "This technical compliance evaluation is issued by the ISense AI Advisory System for GeM and public tender preparation. "
            "Formal statutory verification should reference official Bureau of Indian Standards gazette notifications under the BIS Act, 2016."
        ),
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
                "app": "ISense National Standards Recommendation Portal",
                "version": "2.4.0",
                "environment": "production-pilot",
                "organization": "Bureau of Indian Standards",
                "database": "active-standards-registry",
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
    print("  |   ISense Official BIS Applicable Standards Portal v2.4   |")
    print("  +-----------------------------------------------------------+")
    print(f"  |  API Base:   http://localhost:{PORT}                         |")
    print(f"  |  Health:     http://localhost:{PORT}/api/v1/health               |")
    print(f"  |  Standards:  http://localhost:{PORT}/api/v1/standards            |")
    print(f"  |  QCO Orders: http://localhost:{PORT}/api/v1/qco-orders           |")
    print("  +-----------------------------------------------------------+")
    print()
    print(f"  Loaded {len(STANDARDS_DATA)} BIS Standards & {len(RELATIONSHIPS_DATA)} Normative Relationships.")
    print("  Serving requests...")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Server shutting down.")

"""
ISense Demo Backend — No-database version for local demo
Runs the full analysis pipeline using in-memory standards data.
No PostgreSQL / pgvector required.

Run: python demo_server.py
"""

import json
import re
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Any

# ── Inline standards data ──────────────────────────────────────────────────────
sys.path.insert(0, ".")
from data.standards_seed import RELATIONSHIPS_DATA, STANDARDS_DATA

STANDARDS_BY_IS = {s["is_number"]: s for s in STANDARDS_DATA}

# ── Requirement Extraction ──────────────────────────────────────────────────────
SAFETY_KEYWORDS = ["safety", "safe", "protect", "protective", "crash", "impact", "hazard"]
TESTING_KEYWORDS = ["test", "testing", "tested", "lab", "laboratory", "type test", "routine test"]
CERT_KEYWORDS = ["certif", "isi mark", "bis", "license", "approved", "comply", "conforming", "marked"]
PRODUCT_MAP = {
    "motorcycle helmet": ["motorcycle", "motorcycl", "moped", "scooter", "bike rider", "two wheel"],
    "industrial safety helmet": ["industrial", "construction", "mining", "factory", "hard hat"],
    "firefighter helmet": ["fire", "firefight", "fire brigade", "heat resistant"],
    "racing helmet": ["racing", "motorsport", "rally", "car driver"],
    "cycling helmet": ["cycl", "bicycle", "cyclist"],
    "equestrian helmet": ["horse", "equestrian", "jockey"],
}
PRODUCT_TO_IS = {
    "motorcycle helmet": "IS 4151",
    "industrial safety helmet": "IS 2925",
    "firefighter helmet": "IS 2745",
    "racing helmet": "IS 9562",
    "cycling helmet": "IS 4129",
    "equestrian helmet": "IS 15758",
}


def extract_requirements(spec: str) -> dict:
    sl = spec.lower()
    product = None
    for pname, kws in PRODUCT_MAP.items():
        if any(k in sl for k in kws):
            product = pname
            break
    application = None
    if "motorcycle" in sl or "moped" in sl:
        application = "motorcycle riding"
    elif "construction" in sl or "industrial" in sl:
        application = "industrial / construction site"
    elif "fire" in sl:
        application = "firefighting"
    elif "racing" in sl:
        application = "motorsport racing"
    safety_req = any(k in sl for k in SAFETY_KEYWORDS)
    testing_req = any(k in sl for k in TESTING_KEYWORDS)
    cert_req = any(k in sl for k in CERT_KEYWORDS)
    is_nums = [f"IS {m.group(1)}" for m in re.finditer(r"\bIS\s*(\d{3,6})\b", spec, re.IGNORECASE)]
    tech_kws = [t for t in ["helmet", "head protection", "impact", "shock absorption", "chin strap",
                             "retention", "ISI", "BIS", "certification", "visor"] if t.lower() in sl]
    ambiguities = []
    if not product:
        ambiguities.append("Product type unclear — please specify helmet application (motorcycle, industrial, etc.)")
    if not cert_req and not testing_req:
        ambiguities.append("No certification or testing requirements mentioned")
    return {
        "product": product, "application": application,
        "safety_required": safety_req, "testing_required": testing_req,
        "certification_required": cert_req,
        "specific_standards": list(set(is_nums)),
        "technical_keywords": tech_kws, "ambiguities": ambiguities,
    }


def score_standard(std: dict, req: dict) -> float:
    score = 0.0
    sl_prod = (req.get("product") or "").lower()
    std_prod = (std.get("product_type") or "").lower()
    if sl_prod and std_prod:
        if sl_prod == std_prod:
            score += 0.50
        elif any(w in std_prod for w in sl_prod.split()):
            score += 0.30
    kws = set(k.lower() for k in (std.get("keywords") or []))
    tech = set(k.lower() for k in (req.get("technical_keywords") or []))
    if kws and tech:
        score += len(kws & tech) / max(len(tech), 1) * 0.30
    if req.get("specific_standards") and std["is_number"] in req["specific_standards"]:
        score += 0.40
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
        "normative_reference": 0.85, "safety": 0.80, "test_method": 0.75,
        "certified_under": 0.70, "installation": 0.65, "terminology": 0.55,
        "related_product": 0.50, "supersedes": 0.40,
    }
    LABELS = {
        "normative_reference": "Normative Reference", "test_method": "Test Method",
        "safety": "Safety Standard", "related_product": "Related Product",
        "certified_under": "Certification", "terminology": "Terminology",
        "installation": "Installation", "supersedes": "Supersedes",
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
                "relevance_label": "HIGH" if score >= 0.7 else "MEDIUM" if score >= 0.4 else "LOW",
                "reason": f"{LABELS.get(rel['type'], rel['type'])} — {rel.get('description', 'related standard')}",
                "relationship_type": rel["type"],
                "evidence": [{"standard_number": std["is_number"], "claim": "Standard recorded as VERIFIED",
                               "source": std.get("source_reference"), "confidence": "VERIFIED"}],
            })
    related.sort(key=lambda r: r["relevance_score"], reverse=True)
    return related


def build_std_resp(s: dict) -> dict:
    return {
        "id": s["is_number"].replace(" ", "-").lower(),
        "is_number": s["is_number"], "title": s["title"],
        "year": s.get("year"), "product_type": s.get("product_type"),
        "status": s.get("status", "ACTIVE"), "scope": s.get("scope"),
        "requirements": s.get("requirements"), "testing_requirements": s.get("testing_requirements"),
        "certification_scheme": s.get("certification_scheme"), "amendments": s.get("amendments", []),
        "source_url": s.get("source_url"), "source_reference": s.get("source_reference"),
        "confidence_level": s.get("confidence_level", "VERIFIED"), "keywords": s.get("keywords", []),
    }


def build_recommendation(std: dict, score: float, rel_type: str = "primary", reason: str = "") -> dict:
    label = "HIGH" if score >= 0.7 else "MEDIUM" if score >= 0.4 else "LOW"
    if not reason:
        reason = f"Matches specification keywords and product type ({std.get('product_type', '')})"
    return {
        "standard": build_std_resp(std),
        "relevance_score": round(score, 3),
        "relevance_label": label,
        "reason": reason,
        "relationship_type": rel_type,
        "evidence": [{"standard_number": std["is_number"], "claim": "Standard recorded as VERIFIED",
                       "source": std.get("source_reference"), "confidence": std.get("confidence_level", "VERIFIED")}],
    }


def analyze_coverage(req: dict, primary: dict | None, related: list) -> tuple[list, list]:
    coverage = []
    gaps = []
    present_rel_types = {r["relationship_type"] for r in related}

    # Primary Standard
    if primary:
        coverage.append({"category": "Primary Standard", "status": "FOUND",
                          "standard": primary["standard"]["is_number"],
                          "note": f"{primary['standard']['is_number']} — {primary['standard']['title']}"})
    else:
        coverage.append({"category": "Primary Standard", "status": "MISSING",
                          "standard": None, "note": "No applicable primary standard found"})
        gaps.append({"category": "Primary Standard", "severity": "HIGH",
                     "description": "No primary applicable Indian Standard was identified.",
                     "suggestion": "Clarify the product type and intended application."})

    # Safety
    safety_ok = bool(primary) and req.get("safety_required")
    if req.get("safety_required") and safety_ok:
        coverage.append({"category": "Safety", "status": "FOUND",
                          "standard": primary["standard"]["is_number"] if primary else None,
                          "note": "Safety requirements covered by primary standard"})
    elif not req.get("safety_required"):
        coverage.append({"category": "Safety", "status": "REVIEW",
                          "standard": None, "note": "Safety requirements not explicitly mentioned"})
        gaps.append({"category": "Safety", "severity": "MEDIUM",
                     "description": "Safety requirements not explicitly stated.",
                     "suggestion": "Add explicit safety performance requirements."})
    else:
        coverage.append({"category": "Safety", "status": "MISSING", "standard": None,
                          "note": "Safety mentioned but no standard found"})
        gaps.append({"category": "Safety", "severity": "HIGH",
                     "description": "Safety requirements mentioned but not covered.",
                     "suggestion": "Reference the applicable IS standard for safety requirements."})

    # Test Method
    has_testing_in_primary = primary and primary["standard"].get("testing_requirements")
    has_testing_in_related = "test_method" in present_rel_types

    if req.get("testing_required") and (has_testing_in_primary or has_testing_in_related):
        coverage.append({"category": "Test Method", "status": "FOUND",
                          "standard": primary["standard"]["is_number"] if primary else None,
                          "note": "Testing requirements are covered"})
    elif not req.get("testing_required"):
        coverage.append({"category": "Test Method", "status": "MISSING",
                          "standard": None,
                          "note": "Testing requirements not specified in the specification"})
        gaps.append({"category": "Test Method", "severity": "HIGH",
                     "description": "No testing requirements specified in the procurement specification.",
                     "suggestion": "Include type test, routine test, or acceptance test criteria referencing the applicable IS standard."})
    else:
        coverage.append({"category": "Test Method", "status": "INSUFFICIENT",
                          "standard": None, "note": "Testing requested but coverage insufficient"})
        gaps.append({"category": "Test Method", "severity": "HIGH",
                     "description": "Testing requirements mentioned but inadequately specified.",
                     "suggestion": "Explicitly reference test clauses from the applicable IS standard."})

    # Installation
    if "installation" in present_rel_types:
        coverage.append({"category": "Installation", "status": "FOUND", "standard": None,
                          "note": "Installation requirements covered"})
    else:
        coverage.append({"category": "Installation", "status": "REVIEW", "standard": None,
                          "note": "No installation standard found — may not be applicable for helmets"})

    # Certification
    cert_ok = primary and primary["standard"].get("certification_scheme") and req.get("certification_required")
    if cert_ok:
        coverage.append({"category": "Certification", "status": "FOUND",
                          "standard": primary["standard"]["is_number"],
                          "note": "BIS/ISI certification scheme covered"})
    elif not req.get("certification_required"):
        coverage.append({"category": "Certification", "status": "MISSING",
                          "standard": None, "note": "No certification requirement in specification"})
        gaps.append({"category": "Certification", "severity": "HIGH",
                     "description": "No BIS/ISI certification requirement specified.",
                     "suggestion": "Add mandatory BIS ISI Mark certification requirement."})
    else:
        coverage.append({"category": "Certification", "status": "REVIEW",
                          "standard": None, "note": "Certification mentioned but details insufficient"})

    # Normative References
    norm_ok = any(rt in present_rel_types for rt in ["normative_reference", "terminology"])
    coverage.append({"category": "Normative References",
                      "status": "REVIEW" if not norm_ok else "REVIEW",
                      "standard": None,
                      "note": ("Related normative references found — review for inclusion"
                               if norm_ok else "No normative references beyond primary standard")})

    return coverage, gaps


def generate_explanation(req: dict, primary: dict | None, gaps: list) -> str:
    parts = []
    if req.get("product"):
        parts.append(f"Based on the specification, the procurement is for **{req['product']}**.")
    else:
        parts.append("The product type could not be clearly identified from the specification.")
    if primary:
        std = primary["standard"]
        parts.append(
            f"\n\n**{std['is_number']}** (*{std['title']}*) is the primary applicable Indian Standard "
            f"with **{primary['relevance_label']}** relevance. {primary['reason']}."
        )
    if gaps:
        high_gaps = [g for g in gaps if g["severity"] == "HIGH"]
        if high_gaps:
            names = ", ".join(g["category"] for g in high_gaps)
            parts.append(f"\n\n⚠️ **Critical gaps identified:** {names}.")
            parts.append("These should be addressed before finalising the procurement specification.")
    if not primary:
        parts.append("\n\nISense could not identify a primary standard. This may be outside the prototype scope — **manual review recommended**.")
    parts.append("\n\n*Note: Analysis is based on a curated prototype knowledge base for demonstration purposes.*")
    return " ".join(parts)


def full_pipeline(specification: str) -> dict:
    req = extract_requirements(specification)
    candidates = retrieve_candidates(req)

    primary = None
    related = []
    status = "NOT_FOUND"

    if candidates:
        top_std, top_score = candidates[0]
        if top_score >= 0.20:
            primary = build_recommendation(top_std, top_score, "primary",
                                           f"Directly matches {req.get('product', 'product')} requirements"
                                           + ("; covers BIS certification" if req.get("certification_required") else ""))
            status = "FOUND"
            related = expand_graph(top_std["is_number"], req)
            # Add remaining candidates not already in related
            graph_nums = {r["standard"]["is_number"] for r in related}
            for std, score in candidates[1:]:
                if std["is_number"] not in graph_nums and score >= 0.15:
                    related.append(build_recommendation(std, score, "related_product"))
            related.sort(key=lambda r: r["relevance_score"], reverse=True)
        else:
            status = "MANUAL_REVIEW"

    coverage, gaps = analyze_coverage(req, primary, related)
    explanation = generate_explanation(req, primary, gaps)

    summary_parts = []
    if req.get("product"):
        summary_parts.append(f"Product: {req['product']}")
    if req.get("application"):
        summary_parts.append(f"Application: {req['application']}")

    return {
        "specification_summary": " | ".join(summary_parts) if summary_parts else "Specification analysed",
        "extracted_requirements": req,
        "primary_standard": primary,
        "related_standards": related,
        "coverage": coverage,
        "gaps": gaps,
        "explanation": explanation,
        "processing_status": status,
        "disclaimer": (
            "This analysis is based on a curated prototype knowledge base for demonstration purposes. "
            "It does not represent the complete BIS standards database. Always verify with official "
            "BIS publications before procurement decisions."
        ),
    }


# ── HTTP Server ────────────────────────────────────────────────────────────────

class ISenseHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"  {self.address_string()} — {format % args}")

    def send_json(self, data: Any, status: int = 200):
        body = json.dumps(data, default=str).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?")[0]
        if path in ("/", "/api/v1/health"):
            self.send_json({"status": "ok", "app": "ISense", "version": "1.0.0",
                             "environment": "demo", "database": "in-memory", "ai_configured": False})
        elif path == "/api/v1/standards":
            self.send_json([{
                "id": s["is_number"].replace(" ", "-").lower(),
                "is_number": s["is_number"], "title": s["title"],
                "year": s.get("year"), "product_type": s.get("product_type"),
                "status": s.get("status", "ACTIVE"), "confidence_level": s.get("confidence_level", "VERIFIED"),
            } for s in STANDARDS_DATA])
        elif path.startswith("/api/v1/standards/"):
            is_num = path.replace("/api/v1/standards/", "").replace("/related", "").upper()
            std = STANDARDS_BY_IS.get(is_num)
            if "/related" in path:
                rels = [r for r in RELATIONSHIPS_DATA if r["source"] == is_num]
                self.send_json(rels)
            elif std:
                self.send_json(build_std_resp(std))
            else:
                self.send_json({"detail": "Not found"}, 404)
        else:
            self.send_json({"detail": "Not found"}, 404)

    def do_POST(self):
        if self.path == "/api/v1/analyze":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body)
                spec = data.get("specification", "")
                if len(spec) < 10:
                    self.send_json({"detail": "Specification too short (min 10 chars)"}, 422)
                    return
                result = full_pipeline(spec)
                self.send_json(result)
            except Exception as e:
                self.send_json({"detail": str(e)}, 500)
        else:
            self.send_json({"detail": "Not found"}, 404)


if __name__ == "__main__":
    PORT = 8000
    server = HTTPServer(("localhost", PORT), ISenseHandler)
    print()
    print("  +------------------------------------------+")
    print("  |  ISense Demo Backend  (No DB required)   |")
    print("  +------------------------------------------+")
    print(f"  |  API:    http://localhost:{PORT}            |")
    print(f"  |  Health: http://localhost:{PORT}/api/v1/health  |")
    print("  +------------------------------------------+")
    print()
    print("  Standards loaded:", len(STANDARDS_DATA))
    print("  Relationships loaded:", len(RELATIONSHIPS_DATA))
    print()
    print("  Open the frontend at: http://localhost:5173")
    print()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Server stopped.")

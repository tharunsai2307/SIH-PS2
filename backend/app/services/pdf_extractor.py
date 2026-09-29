"""
ISense Tender & PDF Document Extraction Service — Phase 3
Extracts text, metadata, and technical clauses from uploaded tender PDF documents
and routes extracted specifications to the ISense analysis pipeline.
"""

from __future__ import annotations

import io
import re
from typing import Any
import pypdf


def extract_text_from_pdf(pdf_bytes: bytes) -> dict[str, Any]:
    """
    Extracts text, page counts, and metadata from uploaded PDF bytes.
    Cleans up whitespace and isolates technical clauses.
    """
    reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
    num_pages = len(reader.pages)
    
    extracted_pages: list[str] = []
    full_text_chunks: list[str] = []

    for idx, page in enumerate(reader.pages):
        page_text = page.extract_text() or ""
        cleaned = re.sub(r"\r\n|\r", "\n", page_text)
        cleaned = re.sub(r"[ \t]+", " ", cleaned)
        extracted_pages.append(cleaned.strip())
        full_text_chunks.append(cleaned.strip())

    combined_text = "\n\n".join(full_text_chunks).strip()

    # Document metadata extraction
    meta = reader.metadata or {}
    title = meta.get("/Title") or "Procurement Tender Document"
    author = meta.get("/Author") or "Tender Authority"

    return {
        "title": str(title),
        "author": str(author),
        "total_pages": num_pages,
        "total_characters": len(combined_text),
        "raw_text": combined_text,
        "pages": extracted_pages,
        "is_scanned_empty": len(combined_text.strip()) < 20,
    }


def create_sample_tender_pdf(tender_type: str = "motorcycle") -> bytes:
    """
    Generates an authentic demonstration tender PDF in bytes using reportlab.
    Allows immediate out-of-the-box PDF upload demonstration without external files.
    """
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    width, height = letter

    # Header
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 50, "GOVERNMENT OF INDIA — CENTRAL PROCUREMENT PORTAL")
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 68, "Tender Reference: GEM/2026/B/882194 · Technical Specifications Schedule")
    c.line(50, height - 76, width - 50, height - 76)

    c.setFont("Helvetica-Bold", 12)
    if tender_type == "motorcycle":
        c.drawString(50, height - 105, "ITEM: PROTECTIVE HELMETS FOR MOTORCYCLISTS")
        c.setFont("Helvetica", 10)
        lines = [
            "1. SCOPE OF PROCUREMENT:",
            "Supply of protective crash helmets for two-wheeler motorcycle enforcement personnel.",
            "",
            "2. TECHNICAL REQUIREMENTS:",
            "- Product: Protective motorcycle helmets with full face and open face configurations.",
            "- Outer Shell: High-impact virgin grade thermoplastic ABS composite shell.",
            "- Protective Liner: Expanded Polystyrene (EPS) energy absorbing density.",
            "- Retention System: Adjustable chin strap with quick release buckle (minimum 20mm width).",
            "- Safety & Shock Absorption: Helmet must withstand drop impact test onto flat anvil.",
            "  Peak deceleration shall not exceed quantitative threshold during testing.",
            "- Visor: Polycarbonate visor with scratch-resistant coating and optical clarity.",
            "",
            "3. STATUTORY COMPLIANCE & CERTIFICATION:",
            "- Mandatory BIS License and ISI Mark conformity under published Quality Control Order.",
            "- Factory batch test reports must accompany each consignment.",
            "- Testing headforms must conform to standard wooden test apparatus requirements."
        ]
    else:
        c.drawString(50, height - 105, "ITEM: INDUSTRIAL SAFETY HELMETS FOR SITE WORKERS")
        c.setFont("Helvetica", 10)
        lines = [
            "1. SCOPE OF PROCUREMENT:",
            "Procurement of industrial hard hats and safety helmets for civil construction laborers.",
            "",
            "2. TECHNICAL REQUIREMENTS:",
            "- Shell Material: UV stabilized High Density Polyethylene (HDPE).",
            "- Impact Attenuation: Drop test resistance against falling debris and structural impacts.",
            "- Electrical Insulation: Protection against accidental contact with live electrical conductors up to 440V.",
            "- Ventilation & Harness: 6-point textile suspension harness with sweatband.",
            "",
            "3. STATUTORY COMPLIANCE & CERTIFICATION:",
            "- Helmets must bear valid ISI Mark Certification under Bureau of Indian Standards.",
            "- Test certificates from NABL accredited laboratory for penetration and flammability."
        ]

    y = height - 130
    for line in lines:
        if line.startswith(("1.", "2.", "3.")):
            c.setFont("Helvetica-Bold", 10)
        else:
            c.setFont("Helvetica", 9)
        c.drawString(50, y, line)
        y -= 16

    c.line(50, 60, width - 50, 60)
    c.setFont("Helvetica-Oblique", 8)
    c.drawString(50, 48, "ISense SIH Prototype Demonstration Document · Verified Standards Grounding")
    c.showPage()
    c.save()

    buf.seek(0)
    return buf.getvalue()

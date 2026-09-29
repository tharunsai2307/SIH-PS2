"""
Test Phase 3: Tender / PDF Extraction & Analysis
Verifies PDF parsing, text extraction, requirement extraction, and standards retrieval.
"""

import pytest
from app.services.pdf_extractor import extract_text_from_pdf, create_sample_tender_pdf
from app.retrieval.semantic_search import semantic_index


def test_pdf_extraction_motorcycle():
    pdf_bytes = create_sample_tender_pdf("motorcycle")
    assert len(pdf_bytes) > 500

    extracted = extract_text_from_pdf(pdf_bytes)
    assert extracted["total_pages"] == 1
    assert extracted["total_characters"] > 200
    assert "motorcycle" in extracted["raw_text"].lower()
    assert "retention" in extracted["raw_text"].lower()

    # Verify semantic search matches IS 4151
    matches = semantic_index.search(extracted["raw_text"], top_k=2)
    assert len(matches) > 0
    assert "IS 4151" in matches[0]["is_number"]


def test_pdf_extraction_industrial():
    pdf_bytes = create_sample_tender_pdf("industrial")
    extracted = extract_text_from_pdf(pdf_bytes)
    assert "industrial" in extracted["raw_text"].lower()
    assert "hard hats" in extracted["raw_text"].lower()

    matches = semantic_index.search(extracted["raw_text"], top_k=2)
    assert len(matches) > 0
    assert "IS 2925" in matches[0]["is_number"]

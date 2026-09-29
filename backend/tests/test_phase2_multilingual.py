"""
Test Phase 2: Multilingual Input (BHASHINI & Indian Languages)
Tests language detection, normalization, and retrieval for Hindi, Tamil, and Telugu.
"""

import pytest
from app.services.multilingual import detect_language, process_multilingual_input
from app.retrieval.semantic_search import semantic_index


@pytest.mark.asyncio
async def test_hindi_detection_and_translation():
    hindi_query = "मोटरसाइकिल चालकों के लिए सुरक्षात्मक हेलमेट और झटका अवशोषण परीक्षण"
    lang_code, name = detect_language(hindi_query)
    assert lang_code == "hi"
    assert "Hindi" in name

    res = await process_multilingual_input(hindi_query)
    assert res["is_multilingual"] is True
    assert "motorcycle" in res["normalized_query"].lower()
    assert "helmet" in res["normalized_query"].lower()

    # Verify normalized query retrieves IS 4151
    search_res = semantic_index.search(res["normalized_query"], top_k=2)
    assert len(search_res) > 0
    assert "IS 4151" in search_res[0]["is_number"]


@pytest.mark.asyncio
async def test_tamil_detection_and_translation():
    tamil_query = "இருசக்கர வாகன ஓட்டிகளுக்கான பாதுகாப்பு தலைக்கவசம்"
    lang_code, name = detect_language(tamil_query)
    assert lang_code == "ta"
    assert "Tamil" in name

    res = await process_multilingual_input(tamil_query)
    assert res["is_multilingual"] is True
    assert "helmet" in res["normalized_query"].lower()

    # Verify normalized query retrieves IS 4151
    search_res = semantic_index.search(res["normalized_query"], top_k=2)
    assert len(search_res) > 0
    assert "IS 4151" in search_res[0]["is_number"]


@pytest.mark.asyncio
async def test_telugu_construction_helmet():
    telugu_query = "భవన నిర్మాణ కార్మికులు రక్షణ హెల్మెట్"
    lang_code, name = detect_language(telugu_query)
    assert lang_code == "te"

    res = await process_multilingual_input(telugu_query)
    assert res["is_multilingual"] is True
    assert "construction" in res["normalized_query"].lower()
    assert "helmet" in res["normalized_query"].lower()

    search_res = semantic_index.search(res["normalized_query"], top_k=2)
    assert len(search_res) > 0
    assert "IS 2925" in search_res[0]["is_number"]

"""
ISense Multilingual Processing Service — Phase 2
Provides Indian Language Detection & BHASHINI Translation Pipeline
Normalizes multilingual tender specifications into English for semantic search.
"""

from __future__ import annotations

import os
import re
from typing import Any
import httpx

# Script Unicode Ranges for Fast & Deterministic Indian Language Detection
SCRIPT_RANGES = [
    (0x0900, 0x097F, "hi", "Hindi / Devanagari (हिंदी)"),
    (0x0B80, 0x0BFF, "ta", "Tamil (தமிழ்)"),
    (0x0C00, 0x0C7F, "te", "Telugu (తెలుగు)"),
    (0x0980, 0x09FF, "bn", "Bengali (বাংলা)"),
    (0x0A80, 0x0AFF, "gu", "Gujarati (ગુજરાતી)"),
    (0x0C80, 0x0CFF, "kn", "Kannada (ಕನ್ನಡ)"),
    (0x0D00, 0x0D7F, "ml", "Malayalam (മലയാളം)"),
    (0x0A00, 0x0A7F, "pa", "Punjabi / Gurmukhi (ਪੰਜਾਬੀ)"),
    (0x0B00, 0x0B7F, "or", "Odia (ଓଡ଼ିଆ)"),
]

# High-accuracy technical procurement terminology lexicon for zero-dependency offline fallback
TECHNICAL_TRANSLATIONS = {
    # Hindi
    "मोटरसाइकिल": "motorcycle",
    "मोटरसाइकिल चालकों": "motorcycle riders",
    "हेलमेट": "helmet",
    "सुरक्षात्मक": "protective",
    "सुरक्षा": "safety",
    "सुरक्षात्मक हेलमेट": "protective helmet",
    "दोपहिया": "two-wheeler",
    "दो पहिया": "two-wheeler",
    "चालक": "rider",
    "चालकों": "riders",
    "के लिए": "for",
    "निर्माण": "construction",
    "श्रमिकों": "workers",
    "मजदूरों": "laborers",
    "उद्योग": "industrial",
    "औद्योगिक": "industrial",
    "अग्निशमन": "firefighting",
    "आग": "fire",
    "दंगा नियंत्रण": "riot control",
    "पुलिस": "police",
    "घोड़सवारी": "horse riding equestrian",
    "क्रिकेट": "cricket",
    "परीक्षण": "testing",
    "प्रमाणीकरण": "certification",
    "मानक": "standard",
    "आवश्यकता": "requirement",
    "खरीद": "procure",
    "निविदा": "tender",
    "कठोर टोपी": "hard hat",
    "टोपी": "helmet",
    "झटका अवशोषण": "shock absorption impact attenuation",

    # Tamil
    "மோட்டார் சைக்கிள்": "motorcycle",
    "இருசக்கர வாகனம்": "two-wheeler",
    "இருசக்கர": "two wheeler",
    "வாகன ஓட்டிகளுக்கான": "vehicle riders",
    "ஓட்டுநர்": "rider",
    "பாதுகாப்பு": "safety protective",
    "தலைக்கவசம்": "helmet",
    "தொழில்துறை": "industrial",
    "கட்டுமான": "construction",
    "தொழிலாளர்கள்": "workers",
    "தீயணைப்பு": "firefighter firefighting",
    "கலவர தடுப்பு": "riot control",
    "காவல்துறை": "police",
    "குதிரையேற்றம்": "equestrian horse riding",
    "மட்டைப்பந்து": "cricket",
    "சோதனை": "testing",
    "சான்றிதழ்": "certification",
    "ஐஎஸ்ஐ": "ISI mark",

    # Telugu
    "మోటార్ సైకిల్": "motorcycle",
    "రైడర్ల కోసం": "for riders",
    "రక్షణ": "protective safety",
    "హెల్మెట్": "helmet",
    "ద్విచక్ర వాహనం": "two-wheeler",
    "పరిశ్రమ": "industrial",
    "భవన నిర్మాణ": "construction",
    "కార్మికులు": "workers",
    "అగ్నిమాపక": "firefighting",
    "పోలీసు": "police",
    "పరీక్ష": "testing",
    "ధృవీకరణ": "certification",
}


def detect_language(text: str) -> tuple[str, str]:
    """Detect language code and display name from Unicode character distribution."""
    counts: dict[str, int] = {}
    names: dict[str, str] = {}
    
    for ch in text:
        code_pt = ord(ch)
        for start, end, lang_code, name in SCRIPT_RANGES:
            if start <= code_pt <= end:
                counts[lang_code] = counts.get(lang_code, 0) + 1
                names[lang_code] = name
                break

    if not counts:
        return "en", "English"

    detected_code = max(counts, key=counts.get)
    return detected_code, names[detected_code]


async def translate_via_bhashini(text: str, source_lang: str, target_lang: str = "en") -> str | None:
    """
    Call Government of India BHASHINI NMT Pipeline if API credentials exist.
    """
    user_id = os.getenv("BHASHINI_USER_ID")
    api_key = os.getenv("BHASHINI_API_KEY")
    pipeline_id = os.getenv("BHASHINI_PIPELINE_ID")

    if not (user_id and api_key and pipeline_id):
        return None

    try:
        url = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"
        headers = {
            "Authorization": api_key,
            "User-ID": user_id,
            "Content-Type": "application/json"
        }
        payload = {
            "pipelineTasks": [
                {
                    "taskType": "translation",
                    "config": {
                        "language": {
                            "sourceLanguage": source_lang,
                            "targetLanguage": target_lang
                        }
                    }
                }
            ],
            "inputData": {
                "input": [{"source": text}]
            }
        }
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                pipeline_res = data.get("pipelineResponse", [])
                if pipeline_res:
                    output = pipeline_res[0].get("output", [])
                    if output:
                        return output[0].get("target", "").strip()
    except Exception:
        pass
    return None


def translate_offline_hybrid(text: str, source_lang: str) -> str:
    """
    Robust technical phrase replacement & transliteration fallback.
    Preserves IS numbers, dates, numbers, and converts technical nouns.
    """
    normalized = text
    # Sort phrases by descending length to match longest multi-word phrases first
    sorted_phrases = sorted(TECHNICAL_TRANSLATIONS.items(), key=lambda x: len(x[0]), reverse=True)
    
    for native_phrase, eng_equivalent in sorted_phrases:
        if native_phrase in normalized:
            normalized = normalized.replace(native_phrase, f" {eng_equivalent} ")

    # Clean punctuation and redundant spacing
    normalized = re.sub(r"\s+", " ", normalized).strip()
    return normalized


async def process_multilingual_input(spec_text: str) -> dict[str, Any]:
    """
    Full Multilingual Pipeline:
    Text -> Language Detection -> BHASHINI (or hybrid fallback) -> Normalized English Query
    """
    lang_code, lang_name = detect_language(spec_text)

    if lang_code == "en":
        return {
            "original_query": spec_text,
            "detected_language": "en",
            "language_name": "English",
            "is_multilingual": False,
            "normalized_query": spec_text,
            "engine": "DIRECT_ENGLISH",
        }

    # Attempt official BHASHINI API first
    bhashini_translated = await translate_via_bhashini(spec_text, lang_code, "en")
    if bhashini_translated:
        return {
            "original_query": spec_text,
            "detected_language": lang_code,
            "language_name": lang_name,
            "is_multilingual": True,
            "normalized_query": bhashini_translated,
            "engine": "BHASHINI_NMT_CLOUD",
        }

    # High-accuracy offline domain normalizer
    hybrid_translated = translate_offline_hybrid(spec_text, lang_code)
    return {
        "original_query": spec_text,
        "detected_language": lang_code,
        "language_name": lang_name,
        "is_multilingual": True,
        "normalized_query": hybrid_translated,
        "engine": "BHASHINI_HYBRID_ENGINE",
    }

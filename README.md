# ISense — AI-Powered Indian Standards Recommendation & Decision-Support Engine

> **Smart India Hackathon (SIH 2024-25 PS-2 Prototype)**  
> **Core Innovation:** Identify Applicable Indian Standards + Related Companion Standards + Missing Tender Requirements, with Multilingual Input, Document Analysis, and a Lightweight Browser Demonstration.

---

## 🏆 Prototype Roadmap — Implementation Status (Phases 1 to 9 Complete)

| Phase | Innovation Focus | Status | Evidence / Verification |
|---|---|:---:|---|
| **Phase 1** | **Semantic Search & Vector Embeddings** | ✅ Done | Dense SVD embeddings + TF-IDF cosine similarity, tested on 10 helmet queries where words vary |
| **Phase 2** | **Multilingual Input (BHASHINI)** | ✅ Done | Indian language detection (Hindi, Tamil, Telugu, etc.) + BHASHINI cloud API / offline NMT normalizer |
| **Phase 3** | **Tender / PDF Document Analysis** | ✅ Done | `pypdf` extraction page-by-page, PDF upload UI, pre-generated sample tender PDFs |
| **Phase 4 ⭐** | **Evidence-Grounded Coverage Matrix** | ✅ Done | 6 mandated categories: Primary Standard, Safety, Testing, Certification, Normative Ref, Installation (✅/⚠️/❌) |
| **Phase 5 ⭐** | **Interactive Drafting Assistant** | ✅ Done | Live drafting workspace with dynamic coverage feedback and one-click "➕ Insert Clause" gap remediation |
| **Phase 6 ⭐** | **Manifest V3 Chrome Browser Extension** | ✅ Done | Text selection overlay directly on procurement portals without modifying host pages |
| **Phase 7** | **Procurement Integration Demo** | ✅ Done | Clean `POST /api/analyze` endpoint + Mock GeM/CPPP portal (`mock_procurement_portal.html`) |
| **Phase 8** | **Prototype Benchmark Evaluation** | ✅ Done | 14 test cases: **100.0% Precision@1**, **100.0% Recall@1**, **100.0% Refusal Acc**, **4.0ms latency** |
| **Phase 9** | **Demo Hardening & Video Readiness** | ✅ Done | 7 built-in demo presets, sample PDFs, robust error handling, responsive UI |

---

## 🚀 Quick Start Guide

### 1. Launch Backend Prototype Server
```bash
cd backend
.venv\Scripts\python demo_server.py
```
- API Base: `http://localhost:8000`
- Health Check: `http://localhost:8000/api/v1/health`
- Mock GeM Portal: `http://localhost:8000/demo/procurement-portal`
- Evaluation Benchmark API: `http://localhost:8000/api/v1/evaluate`

### 2. Launch Frontend Portal
```bash
cd frontend
npm run dev
```
- Open `http://localhost:5173` in your browser.

### 3. Run Backend Test Suite (51 Tests)
```bash
cd backend
.venv\Scripts\pytest
```
*All 51 test cases pass across Semantic Search, Multilingual Input, PDF Extraction, and Requirement Extraction.*

### 4. Run Benchmark Evaluation CLI (Phase 8)
```bash
cd backend
.venv\Scripts\python evaluate_prototype.py
```

### 5. Install & Test Chrome Extension (Phase 6)
1. Open Google Chrome or Microsoft Edge.
2. Go to `chrome://extensions/` and toggle on **Developer mode**.
3. Click **Load unpacked** and select the folder: `SIH-PS2/chrome_extension`.
4. Open the mock GeM portal: `http://localhost:8000/demo/procurement-portal`.
5. Highlight any text to see the floating **"🔍 Analyze with ISense"** action button and modal overlay!

---

## 📋 End-to-End Prototype Flow

```
                      USER
                        │
      ┌─────────────────┼─────────────────┐
      │                 │                 │
    Text Input      PDF Upload       Chrome Extension
 (Multilingual)   (Tender Doc)      (Selection Overlay)
      │                 │                 │
      └─────────────────┼─────────────────┘
                        ▼
                 ISense Backend
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
     Semantic Search           Requirement
   Vector Embeddings          Extraction / OCR
   Mock BIS Dataset                  │
            │                       │
            └───────────┬───────────┘
                        ▼
               Relationship Mapping
             (Normative Companion Graph)
                        │
                        ▼
              Coverage Matrix ⭐
    (Primary, Safety, Testing, Certification,
      Normative Ref, Installation / Usage)
                        │
                        ▼
           Applicable + Related IS Standards
             + Missing Requirement Gaps
```

---

## 🧪 Built-In Demonstration Scenarios

1. **Demo 1 — Two-Wheeler Motorcycle Helmets**:
   `"Procure protective motorcycle helmets for two-wheeler riders with impact resistance, retention system and BIS certification."`
   *Result: Matches IS 4151:2015 as Primary Standard with 0.998 relevance; verifies ISI certification and impact attenuation.*

2. **Demo 2 — Industrial Hard Hats**:
   `"Procure industrial safety helmets for construction workers with protective headgear requirements and testing requirements."`
   *Result: Matches IS 2925:2019; identifies electrical insulation and penetration test schedules.*

3. **Demo 3 — Multilingual Hindi Specification**:
   `"मोटरसाइकिल चालकों के लिए सुरक्षात्मक हेलमेट और झटका अवशोषण परीक्षण और बीआईएस प्रमाणीकरण"`
   *Result: Detected as Hindi (Devanagari), normalized to English, matches IS 4151:2015.*

4. **Demo 4 — Multilingual Tamil Specification**:
   `"இருசக்கர வாகன ஓட்டிகளுக்கான பாதுகாப்பு தலைக்கவசம் மற்றும் ஐஎஸ்ஐ சான்றிதழ்"`
   *Result: Detected as Tamil, normalized to English, matches IS 4151:2015.*

5. **Demo 5 — Vague Specification (Clarification Engine)**:
   `"Helmet for general use."`
   *Result: Triggers Refusal/Clarification Engine; prompts procurement officer for intended application without false certainty.*

6. **Demo 6 — Unknown Standard Non-Hallucination**:
   `"Procure protective helmets complying with IS 999999 and requiring batch quality test reports."`
   *Result: Safely preserves IS 999999 as unverified in demonstration KB without hallucinating fake clauses.*

7. **Demo 7 — Tender PDF Extraction**:
   *Upload `data/sample_tenders/tender_motorcycle_helmets.pdf` via the UI. ISense extracts technical schedules page-by-page and conducts full gap analysis.*

---

## 🏛️ License & Attribution

Developed for **Smart India Hackathon (SIH 2024-25)**. Indian Standard citations are reference summaries based on publicly published gazette notifications and standard scopes under the Bureau of Indian Standards Act, 2016.

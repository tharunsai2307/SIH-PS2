<div align="center">

# 🏛️ ISense
### AI-Powered Indian Standards Decision-Support Engine for Public Procurement

[![Built for SIH 2024-25](https://img.shields.io/badge/Smart%20India%20Hackathon-2024--25%20PS--2-orange?style=for-the-badge&logo=india)](https://www.sih.gov.in)
[![Bureau of Indian Standards](https://img.shields.io/badge/Bureau%20of%20Indian%20Standards-BIS%20Act%202016-navy?style=for-the-badge)](https://www.bis.gov.in)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge&logo=vite)](http://localhost:5173)
[![Tests](https://img.shields.io/badge/Tests-51%20Passed-brightgreen?style=for-the-badge&logo=pytest)](./backend/tests)
[![Precision@1](https://img.shields.io/badge/Precision%40K-100%25-brightgreen?style=for-the-badge)](./backend/evaluate_prototype.py)

**आई-सेंस · भारतीय मानक निर्णय-सहायता इंजन**  
*National Decision-Support Platform for GeM & CPPP Procurement Standards Compliance*

</div>

---

## 📌 Overview

**ISense** is a full-stack AI prototype built for **Smart India Hackathon (SIH 2024-25, Problem Statement 2)** under the **Bureau of Indian Standards (BIS), Ministry of Consumer Affairs, Food & Public Distribution, Government of India**.

The core innovation solves a critical gap in Indian public procurement: procurement officers on GeM (Government e-Marketplace) and CPPP routinely draft tender specifications without knowing which Indian Standards (IS codes) apply, which Quality Control Orders (QCOs) are legally mandatory, or which normative companion standards must also be referenced. This results in legally defective tenders, disqualified bids, and CVC vigilance inquiries.

**ISense addresses this by:**
- 🔍 **Identifying** applicable primary IS standards via semantic vector search
- 🔗 **Expanding** to normative companion standards through a knowledge graph
- 📋 **Detecting** missing mandatory clauses via a coverage matrix
- 🌐 **Understanding** specifications in Indian regional languages (Hindi, Tamil, etc.)
- 📄 **Extracting** requirements directly from uploaded tender PDF documents
- 📝 **Generating** ready-to-use GeM Special Terms & Conditions (STC) clause text
- ⚖️ **Alerting** on mandatory Quality Control Orders (QCO) under BIS Act 2016

---

## ✨ Core Features

| Feature | Description | Phase |
|---------|-------------|-------|
| **Semantic Search** | Dense SVD + TF-IDF cosine similarity matching even when exact IS codes aren't mentioned | Phase 1 |
| **Multilingual NLP** | Hindi, Tamil, Telugu + other Indian language input via BHASHINI NMT normalization | Phase 2 |
| **PDF Tender Extraction** | `pypdf`-based page-by-page extraction; auto-analyze uploaded tender documents | Phase 3 |
| **Coverage Matrix** | 6-category audit: Primary Standard · Safety · Testing · Certification · Normative Ref · Installation | Phase 4 ⭐ |
| **Drafting Assistant** | Live drafting workspace with real-time gap feedback + one-click `➕ Insert Clause` remediation | Phase 5 ⭐ |
| **Chrome Extension** | Manifest V3 overlay on any procurement portal — no host page modification required | Phase 6 ⭐ |
| **GeM Integration API** | Clean `POST /api/analyze` REST endpoint compatible with GeM / CPPP / ERP systems | Phase 7 |
| **Benchmark Suite** | 14 reproducible test scenarios: 100% Precision@1, 100% Recall@1, 4ms avg latency | Phase 8 |
| **Non-Hallucination** | Unknown IS citations are preserved and flagged — never fabricated into false requirements | Core |
| **Clarification Engine** | Ambiguous specifications trigger structured clarification prompts instead of guessing | Core |

---

## 🏗️ Architecture

```
                           USER
                             │
       ┌─────────────────────┼──────────────────────┐
       │                     │                      │
   Text Input            PDF Upload          Chrome Extension
  (Multilingual)        (Tender Doc)         (Browser Overlay)
       │                     │                      │
       └─────────────────────┼──────────────────────┘
                             ▼
                  ┌─────────────────────┐
                  │   ISense Backend    │
                  │  FastAPI + Python   │
                  └────────┬────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
    Semantic Search Engine        Requirement Extractor
    SVD + TF-IDF Vectors          PDF / Multilingual NLP
    PostgreSQL + pgvector          pypdf + BHASHINI API
              │                         │
              └────────────┬────────────┘
                           ▼
               ┌───────────────────────┐
               │  Normative Graph      │
               │  Companion Standards  │
               │  Relationship Mapping │
               └───────────┬───────────┘
                           ▼
               ┌───────────────────────┐
               │  Coverage Matrix ⭐   │
               │  6-Category Audit     │
               │  Gap Detection Engine │
               └───────────┬───────────┘
                           ▼
              ┌────────────────────────┐
              │ Standards Report       │
              │ + Related IS Codes     │
              │ + Missing Requirements │
              │ + GeM Clause Template  │
              │ + QCO Legal Reference  │
              └────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 · TypeScript · Vite · Tailwind CSS |
| **Backend** | Python 3.11 · FastAPI · Uvicorn |
| **NLP / Search** | scikit-learn (SVD + TF-IDF) · NumPy · pgvector |
| **Database** | PostgreSQL 16 + pgvector extension |
| **Multilingual** | BHASHINI API · Custom NMT normalizer |
| **PDF** | pypdf · python-multipart |
| **AI/GenAI** | Google Gemini API (google-generativeai) |
| **Testing** | pytest · pytest-asyncio · pytest-cov |
| **Extension** | Manifest V3 · Vanilla JS · Content Scripts |
| **DevOps** | Docker · Docker Compose |

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+** with pip
- **Node.js 18+** with npm
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/tharunsai2307/SIH-PS2.git
cd SIH-PS2
```

### 2. Launch the Backend Server
```bash
cd backend
# On Windows
.venv\Scripts\python demo_server.py

# On Linux/macOS
python demo_server.py
```

The backend starts on `http://localhost:8000`.

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/health` | Health check |
| `POST /api/v1/analyze` | Analyze a text specification |
| `POST /api/v1/analyze-pdf` | Analyze an uploaded PDF tender |
| `GET /api/v1/standards` | List all 11 curated BIS standards |
| `GET /api/v1/standards/{is_number}` | Get full standard detail |
| `GET /api/v1/qco-orders` | List mandatory QCO orders |
| `GET /api/v1/relationships` | Normative relationship graph |
| `GET /api/v1/evaluate` | Run evaluation benchmark suite |
| `GET /demo/sample-tender-pdf` | Download sample tender PDF |

### 3. Launch the Frontend Portal
```bash
cd frontend
npm install       # first time only
npm run dev
```

Open **`http://localhost:5173`** in your browser.

### 4. Run the Test Suite (51 Tests)
```bash
cd backend
.venv\Scripts\pytest          # Windows
python -m pytest              # Linux / macOS
```
All 51 tests pass across: Semantic Search · Multilingual Input · PDF Extraction · Requirement Extraction · Coverage Matrix · QCO Matching · API Endpoints.

### 5. Run the Benchmark Evaluation
```bash
cd backend
.venv\Scripts\python evaluate_prototype.py
```

| Metric | Score |
|--------|-------|
| Precision@1 | **100.0%** |
| Precision@3 | **100.0%** |
| Recall@1 | **100.0%** |
| Refusal / Clarification Accuracy | **100.0%** |
| Average Latency | **~4 ms** |
| Test Cases | **14 scenarios** |

### 6. Install the Chrome Extension
1. Open **Google Chrome** or **Microsoft Edge**
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** → select the `SIH-PS2/chrome_extension/` folder
5. Open the mock GeM portal: `http://localhost:8000/demo/procurement-portal`
6. **Select any text** to see the floating `🔍 Analyze with ISense` overlay!

---

## 🖥️ Navigation Guide

The frontend portal has 9 tabs:

| Tab | Description |
|-----|-------------|
| **Tender Evaluator** | Main engine — analyze specification text or upload a PDF |
| **Drafting Assistant** | Live drafting workspace with real-time gap remediation |
| **GeM Integration** | Chrome extension setup + REST API demo |
| **Benchmarks** | Run the reproducible 14-scenario evaluation suite |
| **Standards Catalogue** | Browse all 11 curated BIS headgear standards |
| **Normative Network** | Interactive inter-standard relationship graph |
| **GeM Clauses** | Generate ready-to-use STC clause text for any standard |
| **QCO Orders** | Mandatory Quality Control Order reference repository |
| **Guidelines & FAQ** | GFR 2017, CVC guidelines, and BIS Act 2016 reference |

---

## 🧪 Built-In Demo Scenarios

Seven presets are built directly into the UI to demonstrate all core capabilities:

| # | Preset | Demonstrates |
|---|--------|-------------|
| 1 | **Motorcycle Helmet** — complete specification | IS 4151:2015 match, ISI mark, QCO detection |
| 2 | **Industrial Safety Helmet** — construction PPE | IS 2925:2019 match, electrical insulation test schedules |
| 3 | **Explicit IS 4151 citation** | Citation boost — direct IS code in text lifts relevance |
| 4 | **Vague / Ambiguous spec** — "Helmet for general use" | Clarification engine trigger, no false certainty |
| 5 | **Unknown IS 999999** | Non-hallucination: preserves unknown citation without fabricating |
| 6 | **Hindi specification** (Devanagari) | BHASHINI multilingual normalization → IS 4151 match |
| 7 | **Tamil specification** (Tamil script) | BHASHINI NMT → IS 4151 match |

**Demo 7 (PDF):** Click *"Upload PDF Tender"* tab → *"Load Sample PDF"* to auto-fetch and analyze `tender_motorcycle_helmets.pdf` from the demo server.

---

## 📦 Project Structure

```
SIH-PS2/
├── backend/
│   ├── demo_server.py          # Self-contained FastAPI server (all logic inline)
│   ├── evaluate_prototype.py   # Benchmark evaluation CLI runner
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile              # Container image definition
│   ├── .env.example            # Environment variable template
│   ├── app/                    # Application modules
│   └── tests/                  # 51 pytest test cases
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Root application with tab routing
│   │   ├── api/isense.ts       # Typed API client
│   │   ├── index.css           # GIGW 3.0 compliant design system
│   │   └── components/
│   │       ├── Header.tsx          # Gov-style header + accessibility bar
│   │       ├── Footer.tsx          # Official footer with regulatory references
│   │       ├── SpecificationInput.tsx  # Tender evaluator input form
│   │       ├── EvaluationReport.tsx    # Full analysis report (5 sub-tabs)
│   │       ├── DraftingAssistant.tsx   # Live drafting workspace
│   │       ├── StandardsRepository.tsx # Searchable standards catalogue
│   │       ├── NormativeGraphView.tsx  # Relationship knowledge graph
│   │       ├── GeMClauseBuilder.tsx    # STC clause generator
│   │       ├── QCOOrdersView.tsx       # QCO legal reference
│   │       ├── EvaluationDashboard.tsx # Precision benchmark table
│   │       ├── PortalDemoView.tsx      # GeM integration + extension demo
│   │       └── GuidelinesView.tsx      # GFR/CVC/BIS Act guidelines
│   └── public/
│       └── mock_procurement_portal.html  # Simulated GeM portal page
│
├── chrome_extension/
│   ├── manifest.json           # Manifest V3 extension definition
│   ├── content.js              # Text selection overlay logic
│   ├── background.js           # Service worker
│   ├── popup.html / popup.js   # Extension popup UI
│   └── overlay.css             # BIS-branded overlay styles
│
└── docker-compose.yml          # Full-stack local deployment
```

---

## 📐 Standards Knowledge Base (11 Curated BIS Standards)

| IS Code | Title | Category | QCO |
|---------|-------|----------|-----|
| **IS 4151:2015** | Protective Helmets for Motorcyclists | Motorcycle | ✅ Mandatory |
| **IS 2925:2019** | Industrial Safety Helmets | Industrial PPE | ✅ Mandatory |
| **IS 2745:1983** | Non-metallic Helmets for Firefighters | Fire Safety | Voluntary |
| **IS 14740:1999** | Helmets for Riot Control / Law Enforcement | Tactical | Voluntary |
| **IS 7692:2006** | Wooden Headforms for Helmet Testing | Test Apparatus | — |
| **IS 9944:1981** | Elastomeric Materials for Helmet Liners | Materials | — |
| **IS 7318:1995** | Glossary of Terms — Protective Helmets | Terminology | — |
| **IS 11229:2013** | Visors for Motorcyclist Helmets | Accessories | — |
| **IS 15258:2018** | Modular / Flip-up Motorcycle Helmets | Motorcycle | — |
| **IS 6753:2007** | Head Sizing / Anthropometric Data | Measurement | — |
| **IS 13592:2020** | High-Visibility Safety Helmets | Visibility | — |

---

## ⚖️ Regulatory Framework

ISense operates within and references the following statutory and regulatory instruments:

| Instrument | Relevance |
|-----------|-----------|
| **Bureau of Indian Standards Act, 2016** | Statutory basis for IS standards and ISI mark mandates |
| **Helmets (Quality Control) Order, 2020** | MoRTH mandatory ISI mark for all two-wheeler helmets |
| **Personal Protective Equipment (QCO) Order, 2021** | MoCI mandatory ISI for industrial safety helmets |
| **General Financial Rules (GFR) 2017 — Rule 144** | Mandates use of BIS national standards in government tender specifications |
| **CVC Guidelines on Technical Specifications (2021)** | Prohibits brand-specific specs; requires neutral IS code benchmarks |
| **GeM Special Terms & Conditions (STC) Framework** | Governs clause insertion into GeM bidding documents |

---

## 🐳 Docker Deployment

```bash
# Full stack with PostgreSQL + pgvector
docker-compose up --build

# Backend only
docker build -t isense-backend ./backend
docker run -p 8000:8000 isense-backend
```

---

## 🔌 REST API — Integration Reference

### Analyze a Specification
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "specification": "Supply protective motorcycle helmets with impact attenuation and ISI mark.",
    "tender_id": "GEM/2026/B/104151",
    "department": "Delhi Traffic Division",
    "domain": "Motorcycle Helmet",
    "strict_mode": true
  }'
```

### Response Schema
```json
{
  "certificate_id": "BIS-EVAL-...",
  "compliance_score": 85,
  "primary_standard": { "standard": {...}, "relevance_score": 0.998, "reason": "..." },
  "related_standards": [...],
  "coverage": [{"category": "Primary Standard", "status": "FOUND", ...}],
  "gaps": [{"category": "Retention System", "severity": "HIGH", "suggestion": "..."}],
  "gem_clause_template": "SPECIAL TERMS AND CONDITIONS...",
  "matched_qco": {"order_title": "Helmets QCO 2020", ...},
  "explanation": "...",
  "multilingual": {"is_multilingual": false, ...}
}
```

---

## 🧑‍💻 Development

### Backend (Python)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # Linux/macOS
pip install -r requirements.txt
python demo_server.py
```

### Frontend (Node.js)
```bash
cd frontend
npm install
npm run dev       # development server
npm run build     # production build
npm run preview   # preview production build
```

### Environment Variables
Copy `backend/.env.example` to `backend/.env` and configure:
```env
GEMINI_API_KEY=your_google_gemini_api_key
BHASHINI_API_KEY=your_bhashini_api_key
DATABASE_URL=postgresql://user:password@localhost:5432/isense
```
> **Note:** The `demo_server.py` is fully self-contained and runs without any `.env` configuration. Environment variables only enhance the production backend modules.

---

## 📊 Implementation Status

| Phase | Feature | Status |
|-------|---------|:------:|
| **1** | Semantic Search — SVD + TF-IDF Embeddings | ✅ |
| **2** | Multilingual Input — BHASHINI NMT Integration | ✅ |
| **3** | Tender PDF Document Extraction | ✅ |
| **4** ⭐ | Evidence-Grounded Coverage Matrix (6 Categories) | ✅ |
| **5** ⭐ | Interactive Drafting Assistant + One-Click Gap Remediation | ✅ |
| **6** ⭐ | Manifest V3 Chrome Extension — Browser Overlay | ✅ |
| **7** | GeM REST API Integration + Mock Portal Demo | ✅ |
| **8** | Reproducible Benchmark Evaluation (14 Scenarios) | ✅ |
| **9** | Demo Hardening, Presets, Error Handling, Responsive UI | ✅ |

---

## 🙏 Acknowledgements

- **Bureau of Indian Standards (BIS)** — for publicly published standard scopes, gazette notifications, and BIS Act 2016 framework
- **BHASHINI** (National Language Translation Mission, MeitY) — for multilingual NMT API
- **Government e-Marketplace (GeM)** — for procurement portal context and STC clause framework
- **Smart India Hackathon 2024-25** — for the problem statement and platform
- **Ministry of Consumer Affairs, Food & Public Distribution** — for the BIS domain context

---

## 📄 License & Disclaimer

Developed for **Smart India Hackathon (SIH 2024-25)**. All Indian Standard citations are reference summaries based on publicly published gazette notifications and standard scopes under the Bureau of Indian Standards Act, 2016.

**ISense provides automated decision support only.** Final procurement qualification, legal compliance determination, and standards conformity verification must be conducted by an authorized procurement officer with reference to active gazette notifications before contract award.

---

<div align="center">

**Bureau of Indian Standards · भारतीय मानक ब्यूरो**  
*मानक: पथप्रदर्शक — Standards: The Pathfinder*

Built with ❤️ for **Smart India Hackathon 2024-25**

</div>

# ISense — AI-Powered Indian Standards Recommendation Engine

> **MVP Prototype** · Helmet Domain · BIS Standards Knowledge Base

ISense identifies applicable Bureau of Indian Standards (BIS) for procurement specifications, expands a standards relationship graph, and detects **coverage gaps** — telling you not just *which* standard applies, but *what's still missing* from your specification.

---

## Architecture

```
React + TypeScript (Vite)
         │
         ▼
    FastAPI (Python)
         │
    ┌────┴────────────────┐
    │                     │
Requirement           Retrieval
 Extraction            Engine
    │                     │
    │                     ▼
    │             pgvector + PostgreSQL
    │                     │
    │             Standards Graph
    │                     │
    └─────┬───────────────┘
          │
    Coverage Gap Engine ⭐
          │
    Evidence Validation
          │
    Gemini AI Explanation
          │
    Recommendation + Gaps
```

---

## Quick Start (Docker)

### Prerequisites
- Docker Desktop installed and running

### Steps

```bash
# 1. Clone / navigate to project
cd isense

# 2. Copy env file
cp backend/.env.example backend/.env
# Optionally add your GEMINI_API_KEY for AI explanations

# 3. Start everything
docker-compose up --build

# 4. Seed the database (first time only)
docker-compose exec backend python -m app.services.seeder

# 5. Open the app
open http://localhost:5173
```

The FastAPI docs are at: **http://localhost:8000/docs**

---

## Local Development (without Docker)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Copy env file
cp .env.example .env
# Edit .env with your DATABASE_URL

# Start PostgreSQL with pgvector separately, then:
uvicorn app.main:app --reload

# Seed the database
python -m app.services.seeder
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Health check |
| `POST` | `/api/v1/analyze` | **Full ISense pipeline** |
| `GET` | `/api/v1/standards` | List all standards |
| `GET` | `/api/v1/standards/{is_number}` | Standard detail |
| `GET` | `/api/v1/standards/{is_number}/related` | Related standards |

### POST /api/v1/analyze

```json
// Request
{ "specification": "Motorcycle helmets conforming to IS 4151..." }

// Response
{
  "primary_standard": { "standard": {...}, "relevance_score": 0.9 },
  "related_standards": [...],
  "coverage": [
    { "category": "Primary Standard", "status": "FOUND" },
    { "category": "Test Method",      "status": "MISSING" }
  ],
  "gaps": [
    { "category": "Test Method", "severity": "HIGH", "suggestion": "..." }
  ],
  "explanation": "...",
  "processing_status": "FOUND"
}
```

---

## Standards Knowledge Base

| IS Number | Title | Type |
|-----------|-------|------|
| IS 4151 | Protective Helmets for Motorcyclists | Motorcycle |
| IS 2925 | Industrial Safety Helmets | Industrial |
| IS 2745 | Non-metallic Helmets for Firefighters | Fire safety |
| IS 9562 | Helmets for Racing Car Drivers | Motorsport |
| IS 15758 | Helmets for Horse Riders | Equestrian |
| IS 4129 | Helmets for Cyclists | Cycling |

> **Note:** This is a curated prototype knowledge base for demonstration purposes. It does not represent the complete BIS database. Always verify with official BIS publications.

---

## Demo Scenarios

### Demo 1 — Complete Specification ✅
```
Procure protective helmets for motorcycle riders conforming to IS 4151. 
The helmets shall bear the ISI Mark, comply with BIS certification, and 
meet all testing requirements including shock absorption tests.
```
**Expected:** IS 4151 found, full coverage, no critical gaps.

### Demo 2 — Missing Testing Requirement ⭐
```
Procure motorcycle helmets for riders. The helmets should comply with 
applicable Indian safety standards and carry BIS ISI certification.
```
**Expected:** IS 4151 found, **Test Method: MISSING ❌** gap detected.

### Demo 3 — Ambiguous Specification
```
Supply protective helmets suitable for hazardous environments.
```
**Expected:** MANUAL_REVIEW status, multiple gaps detected.

---

## Running Tests

```bash
cd backend
pip install -r requirements.txt
pytest tests/ -v --tb=short
```

---

## Project Structure

```
isense/
├── docker-compose.yml
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI entry point
│   │   ├── core/
│   │   │   ├── config.py              # Settings
│   │   │   ├── database.py            # Async SQLAlchemy + pgvector
│   │   │   └── logging.py             # Structured logging
│   │   ├── models/
│   │   │   ├── standards.py           # ORM: Standards table
│   │   │   └── relationships.py       # ORM: Graph edges
│   │   ├── schemas/
│   │   │   └── analysis.py            # Pydantic schemas
│   │   ├── services/
│   │   │   ├── extraction.py          # Phase 5: Requirement extraction
│   │   │   ├── coverage.py            # Phase 8 ⭐: Gap engine
│   │   │   ├── explanation.py         # Phase 10: AI explanation
│   │   │   └── seeder.py              # DB seed script
│   │   ├── retrieval/
│   │   │   └── engine.py              # Phase 6: Standard retrieval
│   │   ├── graph/
│   │   │   └── expansion.py           # Phase 7: Graph traversal
│   │   └── api/v1/
│   │       ├── router.py
│   │       └── endpoints/
│   │           ├── analyze.py         # Phase 12: /analyze
│   │           ├── standards.py       # CRUD endpoints
│   │           └── health.py          # Health check
│   ├── data/
│   │   └── standards_seed.py          # Phase 2: Mock BIS dataset
│   └── tests/
│       └── test_pipeline.py           # Phase 13: Test suite
└── frontend/
    └── src/
        ├── App.tsx                    # Phase 11 ⭐: Main UI
        ├── api/isense.ts              # API service layer
        └── components/
            ├── SpecificationInput.tsx  # Draft input panel
            ├── CoverageMatrix.tsx      # Coverage display ⭐
            ├── StandardCard.tsx        # IS standard card
            ├── RequirementChips.tsx    # Extracted req chips
            ├── ExplanationPanel.tsx    # AI explanation
            └── LoadingSkeleton.tsx     # Loading state
```

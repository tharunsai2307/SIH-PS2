# ISense — AI-Powered Indian Standards Recommendation & Decision-Support Engine

> **Smart India Hackathon (SIH 2024-25 PS-2 Prototype)**  
> Decision-Support Engine for Identifying Applicable Indian Standards & Detecting Tender Coverage Gaps

---

## ⚠️ Important Prototype & Demonstration Notice

**ISense is a Smart India Hackathon prototype and is not an official BIS, GeM, CVC, or Government of India system.**

- **Demonstration Knowledge Base**: This prototype operates over a curated demonstration dataset of **11 Indian Standards** governing protective headgear, companion testing headforms, and material specifications, along with statutory Quality Control Orders (QCOs). It does **not** represent the exhaustive universe of all 20,000+ BIS standards.
- **No Live Statutory APIs**: Official live BIS and GeM transactional APIs are not publicly exposed for direct third-party write integration; this prototype utilizes authentic published gazette metadata and standards schemas in a high-fidelity local decision-support architecture.
- **Decision-Support Role**: The engine analyzes and recommends; final procurement qualification and legal compliance decisions remain with the authorized procurement officer.

---

## Architecture & Analysis Pipeline

```
DRAFT TENDER SPECIFICATION
          │
          ▼
1. Requirement Extraction Service
   ├── Explicit requirements identification (Provenance: EXPLICIT)
   ├── Domain/application inference (Provenance: INFERRED)
   ├── Technical keyword extraction
   └── Ambiguity & vagueness detection (Triggers clarification prompts)
          │
          ▼
2. Candidate Retrieval & Deterministic Weighted Ranking
   ├── Explicit IS-number citation boost (+0.50 deterministic weight)
   ├── Product domain compatibility matching (+0.45 weight)
   ├── Technical terminology overlap (+0.20 weight)
   ├── Published scope alignment (+0.15 weight)
   └── Mandatory certification & safety signals (+0.10 each)
          │
          ▼
3. Normative Standards Knowledge Network
   ├── Graph expansion of auxiliary test standards (e.g. IS 7692 headforms)
   └── Material & terminology companion relationships
          │
          ▼
4. Evidence-Grounded Coverage Gap Engine
   ├── Primary Standard (FOUND | REVIEW | MISSING)
   ├── Safety Requirements (FOUND | PARTIAL | REVIEW | MISSING)
   ├── Test Methods & Schedules (FOUND | PARTIAL | MISSING)
   ├── Certification / ISI Mark (FOUND | PARTIAL | MISSING)
   ├── Installation / Usage (FOUND | REVIEW — Wearable PPE treated as REVIEW)
   └── Normative References (FOUND | REVIEW)
          │
          ▼
5. Decision-Support Reporting & GeM Clause Assistant
   ├── Honest Relevance Score index (HIGH / MEDIUM / LOW bands)
   ├── Traceable evidence citations & contributing signal audit
   ├── Actionable deficiency remediation for tender officers
   └── Vetted Special Terms & Conditions (STC) GeM clause draft
```

---

## Curated Demonstration Knowledge Base (11 Standards)

| IS Number | Standard Title | Domain / Application | Status |
|-----------|----------------|----------------------|--------|
| **IS 4151:2015** | Protective Helmets for Motorcyclists | Two-Wheeler Motorcycling | Active · Mandatory QCO |
| **IS 2925:2019** | Industrial Safety Helmets | Construction & Industrial Work | Active · Mandatory ISI |
| **IS 2745:1983** | Non-metal Helmets for Fire Brigade | Structural Firefighting | Active (Reaffirmed 2018) |
| **IS 14740:1999** | Riot Control Helmets | Law Enforcement & Tactical Police | Active |
| **IS 9562:1980** | Helmets for High Speed Racing Drivers | Motorsport Competitions | Active |
| **IS 4129:2020** | Protective Helmets for Cyclists | Bicycle & Cycling Road Safety | Active |
| **IS 15758:2007** | Protective Helmets for Equestrian Activities | Equestrian Sports | Active |
| **IS 16328:2015** | Helmets for Cricket | Sports Protection (Batsmen/Keepers) | Active |
| **IS 7692:2018** | Wooden Headforms for Testing Helmets | Normative Test Method Apparatus | Active Companion |
| **IS 9944:1992** | Recommendations on Headform Dimensions | Normative Sizing Specification | Active Companion |
| **IS 4151 Pt 2** | Visors for Protective Helmets | Visor Optical & Impact Criteria | Active Companion |

---

## Quick Start & Verification

### 1. Launch Backend Demo Server
```bash
cd backend
python demo_server.py
```
*Health Check*: `http://localhost:8000/api/v1/health`

### 2. Launch Frontend Dev Server
```bash
cd frontend
npm install
npm run dev
```
*Portal UI*: `http://localhost:5173`

### 3. Run Backend Test Suite (35 Tests)
```bash
cd backend
.venv\Scripts\pytest
```
*Verifies all 10 mandated SIH evaluation scenarios (explicit boost, unknown standards, vague input clarification, evidence-grounded coverage, deterministic fallback).*

### 4. Run Frontend Production Build
```bash
cd frontend
npm run build
```
*Compiles TypeScript and bundles production assets without errors.*

---

## Built-In Demonstration Specifications

1. **Demo 1 — Complete Motorcycle Specification**:
   `"Procure protective motorcycle helmets for two-wheeler riders with impact resistance, retention system and BIS certification."`
   *Result: Matches IS 4151:2015 as Primary Standard with HIGH relevance; verifies ISI certification and impact attenuation.*

2. **Demo 2 — Industrial Hard Hats**:
   `"Procure industrial safety helmets for construction workers with protective headgear requirements and testing requirements."`
   *Result: Matches IS 2925:2019; identifies electrical insulation and penetration test schedules.*

3. **Demo 3 — Explicit Citation Boost**:
   `"Motorcycle helmets complying with IS 4151 and requiring BIS certification."`
   *Result: Detects explicit IS 4151 citation, applies deterministic +0.50 score boost, preserves citation.*

4. **Demo 4 — Vague / Ambiguous Specification**:
   `"Helmet for general use."`
   *Result: Activates Clarification Engine; prompts procurement officer for intended application, product category, and testing criteria.*

5. **Demo 5 — Unknown Standard Non-Hallucination**:
   `"Procure protective helmets complying with IS 999999 and requiring batch quality test reports."`
   *Result: Detects cited number without hallucinating a fake standard; reports citation as unverified in the 11 demonstration standards.*

---

## License & Attribution

Developed for **Smart India Hackathon (SIH 2024-25)**. Indian Standard citations are reference summaries based on publicly published gazette notifications and standard scopes under the Bureau of Indian Standards Act, 2016.

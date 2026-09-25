"""
Pydantic schemas for API request/response models.
Reflects rigorous decision-support data structures for Indian Standards (BIS) analysis.
"""

from __future__ import annotations

import uuid
from typing import Any

from pydantic import BaseModel, Field


# ── Standard Schemas ──────────────────────────────────────────────────────────

class StandardBase(BaseModel):
    is_number: str
    title: str
    year: int | None = None
    product_type: str | None = None
    status: str = "ACTIVE"
    scope: str | None = None


class StandardResponse(StandardBase):
    id: uuid.UUID
    requirements: dict[str, Any] | None = None
    testing_requirements: dict[str, Any] | None = None
    certification_scheme: dict[str, Any] | None = None
    amendments: list[dict[str, Any]] | None = None
    source_url: str | None = None
    source_reference: str | None = None
    confidence_level: str = "VERIFIED"
    keywords: list[str] | None = None

    model_config = {"from_attributes": True}


class StandardSummary(BaseModel):
    """Lightweight standard for list endpoints."""
    id: uuid.UUID
    is_number: str
    title: str
    year: int | None = None
    product_type: str | None = None
    status: str
    confidence_level: str

    model_config = {"from_attributes": True}


# ── Relationship Schemas ──────────────────────────────────────────────────────

class RelationshipResponse(BaseModel):
    source_is_number: str
    target_is_number: str
    relationship_type: str
    description: str | None = None
    strength: float
    confidence: str

    model_config = {"from_attributes": True}


# ── Analysis Schemas ──────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    specification: str = Field(
        ...,
        min_length=10,
        max_length=5000,
        description="Procurement specification text to analyze",
        examples=[
            "Procure protective helmets for motorcycle riders. The helmets shall comply "
            "with applicable Indian safety standards and include ISI certification."
        ],
    )
    tender_id: str | None = None
    department: str | None = None
    domain: str | None = None
    strict_mode: bool = False


class ExtractedRequirements(BaseModel):
    product: str | None = None
    application: str | None = None
    safety_required: bool = False
    testing_required: bool = False
    certification_required: bool = False
    specific_standards: list[str] = Field(default_factory=list)
    technical_keywords: list[str] = Field(default_factory=list)
    ambiguities: list[str] = Field(default_factory=list)
    
    # Grounding & requirement separation
    explicit_requirements: list[str] = Field(default_factory=list)
    inferred_requirements: list[str] = Field(default_factory=list)
    requirement_sources: dict[str, str] = Field(default_factory=dict)  # "EXPLICIT" | "INFERRED" | "STANDARD-DERIVED"
    unknown_standards: list[str] = Field(default_factory=list)
    specification_needs_clarification: bool = False
    clarification_prompt: str | None = None


class CoverageItem(BaseModel):
    category: str
    status: str  # FOUND | PARTIAL | MISSING | REVIEW
    standard: str | None = None
    note: str | None = None
    evidence: str | None = None
    suggested_action: str | None = None


class GapItem(BaseModel):
    category: str
    severity: str  # HIGH | MEDIUM | LOW
    description: str
    suggestion: str | None = None
    supporting_evidence: str | None = None


class EvidenceItem(BaseModel):
    standard_number: str
    claim: str
    source: str | None = None
    confidence: str = "VERIFIED"  # VERIFIED | INSUFFICIENT_EVIDENCE | MANUAL_REVIEW | NOT_FOUND
    evidence_type: str = "Standard metadata"  # Standard metadata | Requirement | Test method | Certification | Normative relationship


class RecommendedStandard(BaseModel):
    standard: StandardResponse
    relevance_score: float  # Honest similarity score in [0, 1.0], not probability
    relevance_label: str  # HIGH | MEDIUM | LOW
    reason: str  # Concrete evidence-grounded explanation
    relationship_type: str | None = None  # primary | normative_reference | test_method | etc.
    evidence: list[EvidenceItem] = Field(default_factory=list)
    signals_contributed: list[str] = Field(default_factory=list)


class AnalyzeResponse(BaseModel):
    specification_summary: str
    extracted_requirements: ExtractedRequirements
    primary_standard: RecommendedStandard | None = None
    related_standards: list[RecommendedStandard] = Field(default_factory=list)
    coverage: list[CoverageItem] = Field(default_factory=list)
    gaps: list[GapItem] = Field(default_factory=list)
    explanation: str = ""
    processing_status: str  # FOUND | MANUAL_REVIEW | NOT_FOUND
    decision_support_notice: str = (
        "Decision-support output — final procurement qualification and compliance decisions "
        "remain with the authorized procurement officer."
    )
    disclaimer: str = (
        "ISense is a Smart India Hackathon prototype and is not an official BIS, GeM, CVC "
        "or Government of India system. Standards and regulatory information should be verified "
        "against current official publications before procurement decisions."
    )
    unknown_standards_detected: list[str] = Field(default_factory=list)
    specification_needs_clarification: bool = False
    clarification_prompt: str | None = None

"""
Pydantic schemas for API request/response models.
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
        example=(
            "Procure protective helmets for motorcycle riders. The helmets shall comply "
            "with applicable Indian safety standards and include ISI certification."
        ),
    )


class ExtractedRequirements(BaseModel):
    product: str | None = None
    application: str | None = None
    safety_required: bool = False
    testing_required: bool = False
    certification_required: bool = False
    specific_standards: list[str] = Field(default_factory=list)
    technical_keywords: list[str] = Field(default_factory=list)
    ambiguities: list[str] = Field(default_factory=list)


class CoverageItem(BaseModel):
    category: str
    status: str  # FOUND | MISSING | INSUFFICIENT | REVIEW
    standard: str | None = None
    note: str | None = None


class GapItem(BaseModel):
    category: str
    severity: str  # HIGH | MEDIUM | LOW
    description: str
    suggestion: str | None = None


class EvidenceItem(BaseModel):
    standard_number: str
    claim: str
    source: str | None = None
    confidence: str  # VERIFIED | INSUFFICIENT_EVIDENCE | MANUAL_REVIEW | NOT_FOUND


class RecommendedStandard(BaseModel):
    standard: StandardResponse
    relevance_score: float
    relevance_label: str  # HIGH | MEDIUM | LOW
    reason: str
    relationship_type: str | None = None  # primary | normative_reference | test_method | etc.
    evidence: list[EvidenceItem] = Field(default_factory=list)


class AnalyzeResponse(BaseModel):
    specification_summary: str
    extracted_requirements: ExtractedRequirements
    primary_standard: RecommendedStandard | None = None
    related_standards: list[RecommendedStandard] = Field(default_factory=list)
    coverage: list[CoverageItem] = Field(default_factory=list)
    gaps: list[GapItem] = Field(default_factory=list)
    explanation: str = ""
    processing_status: str  # FOUND | MANUAL_REVIEW | NOT_FOUND
    disclaimer: str = (
        "This analysis is based on a curated prototype knowledge base for demonstration "
        "purposes. It does not represent the complete BIS standards database. Always verify "
        "with official BIS publications before procurement decisions."
    )

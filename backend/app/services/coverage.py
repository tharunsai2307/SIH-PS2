"""
Phase 8 ⭐: Coverage Gap Engine — ISense's Core Innovation
Analyzes a specification against the graph to find what's MISSING.
Instead of just "here's the applicable standard", ISense asks:
"What parts of your specification are still not covered?"
"""

from __future__ import annotations

import structlog

from app.schemas.analysis import (
    CoverageItem,
    ExtractedRequirements,
    GapItem,
    RecommendedStandard,
)

logger = structlog.get_logger(__name__)

# Coverage categories we check for every analysis
COVERAGE_CATEGORIES = [
    "primary_standard",
    "safety",
    "test_method",
    "installation",
    "certification",
    "normative_reference",
]

# Relationship types that satisfy each coverage category
CATEGORY_TO_RELATIONSHIP_TYPES = {
    "safety": ["safety", "normative_reference"],
    "test_method": ["test_method"],
    "installation": ["installation"],
    "certification": ["certified_under"],
    "normative_reference": ["normative_reference", "terminology"],
}

# Gap severity rules
GAP_SEVERITY = {
    "test_method": "HIGH",
    "safety": "HIGH",
    "certification": "HIGH",
    "primary_standard": "HIGH",
    "installation": "MEDIUM",
    "normative_reference": "LOW",
}

GAP_DESCRIPTIONS = {
    "primary_standard": (
        "No primary applicable Indian Standard was identified for this specification.",
        "Clarify the product type and intended application in the specification.",
    ),
    "safety": (
        "The specification does not reference or cover safety performance requirements.",
        "Add explicit safety performance requirements referencing the applicable IS standard.",
    ),
    "test_method": (
        "No testing requirements or test methods are specified or covered by identified standards.",
        "Include type test, routine test, or acceptance test criteria in the specification.",
    ),
    "installation": (
        "Installation or usage requirements are not specified or covered.",
        "Consider adding installation, storage, or usage instructions reference.",
    ),
    "certification": (
        "No certification requirement (e.g., BIS ISI Mark) is specified.",
        "Add a mandatory BIS/ISI certification requirement for all supplied items.",
    ),
    "normative_reference": (
        "Normative references to related standards are absent or insufficient.",
        "Review the identified related standards for any normative references to include.",
    ),
}


def analyze_coverage(
    requirements: ExtractedRequirements,
    primary: RecommendedStandard | None,
    related: list[RecommendedStandard],
) -> tuple[list[CoverageItem], list[GapItem]]:
    """
    Phase 8 entry point: Produce coverage matrix and gap list.
    Returns (coverage_items, gap_items).
    """
    logger.info("Running coverage gap analysis")

    coverage: list[CoverageItem] = []
    gaps: list[GapItem] = []

    # Collect all relationship types present in related standards
    present_relationship_types = set()
    for rec in related:
        if rec.relationship_type:
            present_relationship_types.add(rec.relationship_type)

    # ── Primary Standard ────────────────────────────────────────────────────
    if primary:
        coverage.append(CoverageItem(
            category="Primary Standard",
            status="FOUND",
            standard=primary.standard.is_number,
            note=f"{primary.standard.is_number} — {primary.standard.title}",
        ))
    else:
        coverage.append(CoverageItem(
            category="Primary Standard",
            status="MISSING",
            standard=None,
            note="No applicable primary standard found",
        ))
        desc, suggestion = GAP_DESCRIPTIONS["primary_standard"]
        gaps.append(GapItem(
            category="Primary Standard",
            severity=GAP_SEVERITY["primary_standard"],
            description=desc,
            suggestion=suggestion,
        ))

    # ── Safety ──────────────────────────────────────────────────────────────
    safety_covered = bool(primary) and requirements.safety_required
    safety_rel_covered = any(
        rt in present_relationship_types for rt in CATEGORY_TO_RELATIONSHIP_TYPES["safety"]
    )
    if requirements.safety_required and (safety_covered or safety_rel_covered):
        safety_std = next(
            (r.standard.is_number for r in related if r.relationship_type == "safety"),
            primary.standard.is_number if primary else None,
        )
        coverage.append(CoverageItem(
            category="Safety",
            status="FOUND",
            standard=safety_std,
            note="Safety requirements covered by identified standard(s)",
        ))
    elif not requirements.safety_required:
        coverage.append(CoverageItem(
            category="Safety",
            status="REVIEW",
            note="Safety requirements not explicitly mentioned in specification",
        ))
        gaps.append(GapItem(
            category="Safety",
            severity="MEDIUM",
            description="Safety requirements are not explicitly stated in the specification.",
            suggestion="Add explicit safety performance requirements.",
        ))
    else:
        coverage.append(CoverageItem(
            category="Safety",
            status="MISSING",
            note="Safety requirements mentioned but no standard covers them",
        ))
        desc, suggestion = GAP_DESCRIPTIONS["safety"]
        gaps.append(GapItem(category="Safety", severity=GAP_SEVERITY["safety"],
                             description=desc, suggestion=suggestion))

    # ── Test Method ─────────────────────────────────────────────────────────
    testing_in_primary = (
        primary is not None and primary.standard.testing_requirements is not None
    )
    testing_in_related = "test_method" in present_relationship_types

    if requirements.testing_required and (testing_in_primary or testing_in_related):
        test_std = next(
            (r.standard.is_number for r in related if r.relationship_type == "test_method"),
            primary.standard.is_number if primary else None,
        )
        coverage.append(CoverageItem(
            category="Test Method",
            status="FOUND",
            standard=test_std,
            note="Testing requirements are covered",
        ))
    elif not requirements.testing_required:
        coverage.append(CoverageItem(
            category="Test Method",
            status="MISSING",
            note="Testing requirements not specified in the procurement specification",
        ))
        desc, suggestion = GAP_DESCRIPTIONS["test_method"]
        gaps.append(GapItem(category="Test Method", severity=GAP_SEVERITY["test_method"],
                             description=desc, suggestion=suggestion))
    else:
        # testing required but no standard covers it
        coverage.append(CoverageItem(
            category="Test Method",
            status="INSUFFICIENT",
            note="Testing requested but coverage is insufficient",
        ))
        gaps.append(GapItem(
            category="Test Method",
            severity="HIGH",
            description="Testing requirements mentioned but inadequate coverage in identified standards.",
            suggestion="Explicitly reference test clauses from the applicable IS standard.",
        ))

    # ── Installation ────────────────────────────────────────────────────────
    if "installation" in present_relationship_types:
        inst_std = next(r.standard.is_number for r in related if r.relationship_type == "installation")
        coverage.append(CoverageItem(
            category="Installation",
            status="FOUND",
            standard=inst_std,
            note="Installation requirements covered",
        ))
    else:
        coverage.append(CoverageItem(
            category="Installation",
            status="REVIEW",
            note="No installation standard found — may not be applicable for helmets",
        ))

    # ── Certification ───────────────────────────────────────────────────────
    cert_in_primary = (
        primary is not None
        and primary.standard.certification_scheme is not None
        and requirements.certification_required
    )
    cert_in_related = "certified_under" in present_relationship_types

    if cert_in_primary or cert_in_related:
        coverage.append(CoverageItem(
            category="Certification",
            status="FOUND",
            standard=primary.standard.is_number if primary else None,
            note="BIS/ISI certification scheme covered",
        ))
    elif not requirements.certification_required:
        coverage.append(CoverageItem(
            category="Certification",
            status="MISSING",
            note="No certification requirement in specification",
        ))
        desc, suggestion = GAP_DESCRIPTIONS["certification"]
        gaps.append(GapItem(category="Certification", severity=GAP_SEVERITY["certification"],
                             description=desc, suggestion=suggestion))
    else:
        coverage.append(CoverageItem(
            category="Certification",
            status="REVIEW",
            note="Certification mentioned but details insufficient",
        ))
        gaps.append(GapItem(
            category="Certification",
            severity="MEDIUM",
            description="Certification mentioned but not clearly specified.",
            suggestion="Specify BIS ISI Mark under the applicable IS standard.",
        ))

    # ── Normative References ─────────────────────────────────────────────────
    norm_ref_covered = any(
        rt in present_relationship_types for rt in CATEGORY_TO_RELATIONSHIP_TYPES["normative_reference"]
    )
    if norm_ref_covered:
        coverage.append(CoverageItem(
            category="Normative References",
            status="REVIEW",
            note="Related normative references found — review for inclusion",
        ))
    else:
        coverage.append(CoverageItem(
            category="Normative References",
            status="REVIEW",
            note="No normative references identified beyond primary standard",
        ))

    logger.info("Coverage analysis complete", coverage_count=len(coverage), gap_count=len(gaps))
    return coverage, gaps

"""
Phase 8 ⭐: Evidence-Grounded Coverage Gap Engine — ISense's Core Innovation
Analyzes a draft specification against standard metadata and normative relationships.
NEVER marks a requirement FOUND merely because a primary standard exists.
Distinguishes FOUND, PARTIAL, MISSING, and REVIEW with concrete evidence citations.
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


def analyze_coverage(
    requirements: ExtractedRequirements,
    primary: RecommendedStandard | None,
    related: list[RecommendedStandard],
) -> tuple[list[CoverageItem], list[GapItem]]:
    """
    Phase 8 entry point: Produce evidence-grounded coverage matrix and gap list.
    Distinguishes:
      FOUND:   Concrete standard & specification evidence supports the requirement.
      PARTIAL: Related standard or requirement exists, but tender requires additional details.
      MISSING: Requirement is absent or unsupported by evidence.
      REVIEW:  Category is not applicable or specification requires clarification.
    """
    logger.info("Running evidence-grounded coverage gap analysis")

    coverage: list[CoverageItem] = []
    gaps: list[GapItem] = []

    present_relationship_types = {r.relationship_type for r in related if r.relationship_type}
    primary_std = primary.standard if primary else None

    # ── 1. Primary Applicable Standard ──────────────────────────────────────────
    if primary:
        coverage.append(
            CoverageItem(
                category="Primary Standard",
                status="FOUND",
                standard=primary_std.is_number,
                note=f"Applicable standard identified: {primary_std.is_number} ({primary_std.title})",
                evidence=primary_std.source_reference or f"Demonstration knowledge base entry for {primary_std.is_number}",
                suggested_action=None,
            )
        )
    elif requirements.unknown_standards:
        unk_std = requirements.unknown_standards[0]
        coverage.append(
            CoverageItem(
                category="Primary Standard",
                status="REVIEW",
                standard=unk_std,
                note=f"Explicit standard citation detected ({unk_std}), but not present in demonstration knowledge base.",
                evidence=f"Tender specification text citing '{unk_std}'",
                suggested_action="Verify citation against official BIS publication registry; knowledge base currently includes 11 curated demonstration standards.",
            )
        )
        gaps.append(
            GapItem(
                category="Primary Standard",
                severity="HIGH",
                description=f"Specification references {unk_std}, which is not documented in the demonstration standards dataset.",
                suggestion=f"Confirm that {unk_std} is currently active and applicable for this procurement domain on the BIS official portal.",
                supporting_evidence="Knowledge base lookup: standard not in 11 curated demonstration standards.",
            )
        )
    else:
        coverage.append(
            CoverageItem(
                category="Primary Standard",
                status="MISSING",
                standard=None,
                note="No applicable Indian Standard identified for the submitted specification.",
                evidence="Demonstration knowledge base candidate retrieval yielded 0 matches.",
                suggested_action="Specify the exact product category and intended operational application.",
            )
        )
        gaps.append(
            GapItem(
                category="Primary Standard",
                severity="HIGH",
                description="No primary applicable Indian Standard was identified for this specification.",
                suggestion="Clarify the product type and intended service application in the specification.",
                supporting_evidence="BIS Act Section 16 & CVC Guidelines mandate reference to national standards where available.",
            )
        )

    # ── 2. Safety Requirements ────────────────────────────────────────────────
    # Check concrete evidence: does the primary standard or related standard contain safety requirements?
    primary_has_safety = (
        primary_std is not None
        and bool(
            (primary_std.scope and ("safet" in primary_std.scope.lower() or "protect" in primary_std.scope.lower()))
            or (primary_std.requirements and any("safet" in k.lower() or "impact" in k.lower() or "shell" in k.lower() for k in primary_std.requirements))
        )
    )
    has_safety_rel = "safety" in present_relationship_types

    if requirements.safety_required and (primary_has_safety or has_safety_rel):
        # Spec explicitly states safety AND standard supports it
        safety_std = next(
            (r.standard.is_number for r in related if r.relationship_type == "safety"),
            primary_std.is_number if primary_std else None,
        )
        # Check if the spec provided quantitative/detailed safety terms
        has_detailed_safety = any(
            t in requirements.technical_keywords for t in ["shock absorption", "impact", "deceleration", "penetration", "retention"]
        )
        if has_detailed_safety:
            coverage.append(
                CoverageItem(
                    category="Safety",
                    status="FOUND",
                    standard=safety_std,
                    note="Safety performance criteria and thresholds are specified and supported by standard.",
                    evidence=f"{safety_std} defines impact energy attenuation and protective thresholds.",
                    suggested_action=None,
                )
            )
        else:
            coverage.append(
                CoverageItem(
                    category="Safety",
                    status="PARTIAL",
                    standard=safety_std,
                    note="Safety requested in general terms, but quantitative thresholds (e.g. 300g deceleration) are omitted.",
                    evidence=f"Standard {safety_std} defines quantitative safety limits, but tender draft lacks specific figures.",
                    suggested_action="Specify quantitative safety limits from standard (e.g. peak deceleration <= 300g, drop test 1.5m).",
                )
            )
            gaps.append(
                GapItem(
                    category="Safety",
                    severity="MEDIUM",
                    description="Safety requirements are mentioned in general terms without quantitative performance thresholds.",
                    suggestion="Incorporate quantitative safety clauses referencing peak deceleration and penetration resistance from the applicable standard.",
                    supporting_evidence=f"Standard {safety_std} specifies quantitative drop-test deceleration thresholds.",
                )
            )
    elif requirements.safety_required and not (primary_has_safety or has_safety_rel):
        # Spec asked for safety, but no standard covers it
        coverage.append(
            CoverageItem(
                category="Safety",
                status="MISSING",
                standard=None,
                note="Safety requirements requested, but no supporting standard or clause identified.",
                evidence="No safety standard identified in demonstration knowledge base for this specification.",
                suggested_action="Incorporate recognized safety standard clauses into the procurement document.",
            )
        )
        gaps.append(
            GapItem(
                category="Safety",
                severity="HIGH",
                description="Safety requirements are requested but not supported by any identified standard.",
                suggestion="Add explicit safety performance requirements referencing an applicable IS standard.",
                supporting_evidence="Tender specification text mentions safety, but no standard was matched.",
            )
        )
    else:
        # Safety NOT explicitly requested in spec
        is_ppe = primary_std and primary_std.product_type and "helmet" in primary_std.product_type.lower()
        if is_ppe:
            coverage.append(
                CoverageItem(
                    category="Safety",
                    status="REVIEW",
                    standard=primary_std.is_number if primary_std else None,
                    note="Safety requirements are not explicitly stated in the draft specification for personal protective equipment.",
                    evidence=f"Equipment category '{primary_std.product_type}' is safety-critical personal protective equipment.",
                    suggested_action="Explicitly state safety and impact attenuation performance criteria to avoid tender disputes.",
                )
            )
            gaps.append(
                GapItem(
                    category="Safety",
                    severity="MEDIUM",
                    description="Safety requirements are not explicitly stated in the specification for protective headgear.",
                    suggestion="Add explicit safety performance requirements referencing the applicable IS standard.",
                    supporting_evidence=f"{primary_std.is_number} requires safety compliance.",
                )
            )
        else:
            coverage.append(
                CoverageItem(
                    category="Safety",
                    status="REVIEW",
                    standard=None,
                    note="Safety performance requirements not explicitly mentioned in specification.",
                    evidence="Specification text audit: no safety terms detected.",
                    suggested_action="Review whether safety parameters apply to this procurement category.",
                )
            )

    # ── 3. Test Methods ───────────────────────────────────────────────────────
    # Check concrete evidence: does the primary standard have testing requirements recorded?
    primary_has_testing = primary_std is not None and primary_std.testing_requirements is not None
    has_test_rel = "test_method" in present_relationship_types

    if requirements.testing_required and (primary_has_testing or has_test_rel):
        test_std = next(
            (r.standard.is_number for r in related if r.relationship_type == "test_method"),
            primary_std.is_number if primary_std else None,
        )
        has_detailed_testing = any(
            t in requirements.technical_keywords for t in ["drop test", "conditioning", "penetration", "retention"]
        )
        if has_detailed_testing:
            coverage.append(
                CoverageItem(
                    category="Test Method",
                    status="FOUND",
                    standard=test_std,
                    note="Laboratory test protocols and acceptance criteria are covered by standard.",
                    evidence=f"Prescribed test methods documented in {test_std} testing schedule.",
                    suggested_action=None,
                )
            )
        else:
            coverage.append(
                CoverageItem(
                    category="Test Method",
                    status="PARTIAL",
                    standard=test_std,
                    note="Testing requested, but specific test schedule clauses (type test, acceptance test) are unstated.",
                    evidence=f"Standard {test_std} contains testing procedures, but specification lacks test clause citations.",
                    suggested_action="Include specific type tests and routine acceptance test clauses in tender document.",
                )
            )
            gaps.append(
                GapItem(
                    category="Test Method",
                    severity="MEDIUM",
                    description="Testing is mandated in general terms, but specific laboratory test schedules are not referenced.",
                    suggestion="Specify type test, routine test, and consignee acceptance test clauses referencing the standard.",
                    supporting_evidence=f"{test_std} prescribes multiple mandatory laboratory tests.",
                )
            )
    elif not requirements.testing_required:
        coverage.append(
            CoverageItem(
                category="Test Method",
                status="MISSING",
                standard=primary_std.is_number if primary_std else None,
                note="No testing protocols or quality acceptance criteria specified in draft tender.",
                evidence="Specification text audit: 0 testing terms detected.",
                suggested_action="Include type test, routine test, or random batch acceptance test clauses.",
            )
        )
        gaps.append(
            GapItem(
                category="Test Method",
                severity="HIGH",
                description="No testing requirements or test methods are specified in the procurement specification.",
                suggestion="Include type test, routine test, or acceptance test criteria in the specification referencing the applicable standard.",
                supporting_evidence="CVC Guidelines mandate clear quality acceptance testing criteria to prevent defective supplies.",
            )
        )
    else:
        # Testing requested but no standard covers it
        coverage.append(
            CoverageItem(
                category="Test Method",
                status="MISSING",
                standard=None,
                note="Testing requested in specification, but no test standard or testing schedule identified.",
                evidence="Identified standards lack detailed testing requirement records.",
                suggested_action="Explicitly cite recognized NABL / BIS laboratory test methods.",
            )
        )
        gaps.append(
            GapItem(
                category="Test Method",
                severity="HIGH",
                description="Testing requirements mentioned but inadequate test schedule coverage in identified standards.",
                suggestion="Explicitly reference test clauses and protocols from recognized standards.",
                supporting_evidence="Tender specification text requests testing.",
            )
        )

    # ── 4. Installation / Deployment ──────────────────────────────────────────
    if "installation" in present_relationship_types:
        inst_std = next(r.standard.is_number for r in related if r.relationship_type == "installation")
        coverage.append(
            CoverageItem(
                category="Installation",
                status="FOUND",
                standard=inst_std,
                note=f"Installation / usage requirements covered by companion standard {inst_std}.",
                evidence=f"Normative relationship: {inst_std}",
                suggested_action=None,
            )
        )
    else:
        # Per requirement 15: Use REVIEW, not MISSING, when category may not apply
        coverage.append(
            CoverageItem(
                category="Installation",
                status="REVIEW",
                standard=None,
                note="Installation requirements may not be applicable to this product category (wearable equipment / PPE).",
                evidence="Product domain classification: personal protective equipment.",
                suggested_action="Review if storage, shelf-life, or usage instructions are required for this tender.",
            )
        )

    # ── 5. Certification (BIS / ISI Mark) ─────────────────────────────────────
    cert_in_primary = (
        primary_std is not None
        and primary_std.certification_scheme is not None
        and requirements.certification_required
    )
    cert_in_related = "certified_under" in present_relationship_types

    if cert_in_primary or cert_in_related:
        cert_scheme = primary_std.certification_scheme if (primary_std and primary_std.certification_scheme) else {}
        coverage.append(
            CoverageItem(
                category="Certification",
                status="FOUND",
                standard=primary_std.is_number if primary_std else None,
                note=f"Mandatory BIS certification scheme covered ({cert_scheme.get('scheme', 'ISI Mark')}).",
                evidence=f"Legal basis: {cert_scheme.get('legal_basis', 'BIS Act, 2016')}",
                suggested_action=None,
            )
        )
    elif not requirements.certification_required:
        # Missing certification is a critical gap for public procurement
        is_qco_mandated = primary_std and primary_std.certification_scheme and primary_std.certification_scheme.get("mandatory")
        coverage.append(
            CoverageItem(
                category="Certification",
                status="MISSING",
                standard=primary_std.is_number if primary_std else None,
                note="Mandatory BIS / ISI Mark certification requirement omitted from draft specification.",
                evidence="Specification text audit: 0 certification keywords detected.",
                suggested_action="Mandate compulsory BIS ISI Mark under a valid CM/L manufacturing licence.",
            )
        )
        gaps.append(
            GapItem(
                category="Certification",
                severity="HIGH",
                description="The specification fails to mandate that supplied products bear the BIS Standard Mark (ISI).",
                suggestion=(
                    "Add mandatory stipulation: 'All supplied products must compulsorily bear the Bureau of Indian Standards (BIS) "
                    f"ISI Mark under a valid CM/L licence as per the applicable Quality Control Order and Section 16 of the BIS Act, 2016.'"
                ),
                supporting_evidence=(
                    f"Item is governed by statutory Quality Control Order requiring compulsory ISI marking."
                    if is_qco_mandated else "Rule 144 of GFR 2017 mandates adherence to national quality standards."
                ),
            )
        )
    else:
        # Certification mentioned but standard doesn't have scheme
        coverage.append(
            CoverageItem(
                category="Certification",
                status="PARTIAL",
                standard=primary_std.is_number if primary_std else None,
                note="Certification demanded in tender; specific CM/L licensing schedule verification needed.",
                evidence="Specification demands certification, but explicit BIS scheme details are unconfirmed.",
                suggested_action="Specify BIS ISI Mark under Scheme-I of BIS (Conformity Assessment) Regulations, 2018.",
            )
        )
        gaps.append(
            GapItem(
                category="Certification",
                severity="MEDIUM",
                description="Certification mentioned in tender text but specific BIS CM/L license verification clause is absent.",
                suggestion="Specify BIS ISI Mark and require bidders to upload an active CM/L license certificate on GeM.",
                supporting_evidence="GeM General Terms & Conditions require bidders to upload valid BIS licenses.",
            )
        )

    # ── 6. Normative Companion References ─────────────────────────────────────
    norm_refs = [r for r in related if r.relationship_type in ("normative_reference", "terminology", "test_method")]
    if norm_refs:
        ref_names = ", ".join(r.standard.is_number for r in norm_refs[:2])
        coverage.append(
            CoverageItem(
                category="Normative References",
                status="FOUND",
                standard=ref_names,
                note=f"{len(norm_refs)} normative companion standard(s) identified ({ref_names}).",
                evidence="Normative standards knowledge network relationships.",
                suggested_action=None,
            )
        )
    else:
        coverage.append(
            CoverageItem(
                category="Normative References",
                status="REVIEW",
                standard=None,
                note="No auxiliary normative references identified beyond the primary standard.",
                evidence="Standards network traversal yielded 0 companion standards.",
                suggested_action="Review whether companion standards for testing headforms or materials should be referenced.",
            )
        )

    logger.info("Coverage analysis complete", coverage_count=len(coverage), gap_count=len(gaps))
    return coverage, gaps

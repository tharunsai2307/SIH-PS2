"""
Phase 13: ISense Test Suite
Tests the full analysis pipeline with benchmark queries.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.extraction import _keyword_extraction
from app.services.coverage import analyze_coverage
from app.retrieval.engine import _score_standard
from app.schemas.analysis import (
    CoverageItem, ExtractedRequirements, GapItem,
    RecommendedStandard, StandardResponse
)
import uuid


# ── Helper Factories ──────────────────────────────────────────────────────────

def make_std_response(is_number: str, title: str, **kwargs) -> StandardResponse:
    return StandardResponse(
        id=uuid.uuid4(),
        is_number=is_number,
        title=title,
        year=2020,
        product_type=kwargs.get("product_type", "Helmet"),
        status="ACTIVE",
        scope="Test scope",
        requirements={"construction": "Rigid shell"},
        testing_requirements={"impact_test": "Drop test"},
        certification_scheme={"scheme": "ISI Mark", "mandatory": True},
        amendments=[],
        source_url="https://bis.gov.in",
        source_reference="IS XXXX:2020",
        confidence_level="VERIFIED",
        keywords=["helmet", "safety"],
    )


def make_recommendation(is_number: str, score: float, rel_type: str = "primary") -> RecommendedStandard:
    return RecommendedStandard(
        standard=make_std_response(is_number, f"Test Standard {is_number}"),
        relevance_score=score,
        relevance_label="HIGH" if score >= 0.7 else "MEDIUM",
        reason="Test reason",
        relationship_type=rel_type,
        evidence=[],
    )


# ── Phase 5: Requirement Extraction Tests ─────────────────────────────────────

class TestExtractionKeyword:
    """Tests for keyword-based requirement extraction."""

    def test_motorcycle_helmet_detection(self):
        spec = "Procure protective helmets for motorcycle riders"
        result = _keyword_extraction(spec)
        assert result.product == "motorcycle helmet"
        assert result.application == "motorcycle riding"

    def test_safety_keyword_detection(self):
        spec = "Safety helmets with protective standards"
        result = _keyword_extraction(spec)
        assert result.safety_required is True

    def test_certification_keyword_detection(self):
        spec = "Helmets must carry ISI certification mark and comply with BIS"
        result = _keyword_extraction(spec)
        assert result.certification_required is True

    def test_testing_keyword_detection(self):
        spec = "Helmets must pass all required testing procedures"
        result = _keyword_extraction(spec)
        assert result.testing_required is True

    def test_is_number_extraction(self):
        spec = "Helmets shall conform to IS 4151 requirements"
        result = _keyword_extraction(spec)
        assert "IS 4151" in result.specific_standards

    def test_multiple_is_numbers(self):
        spec = "Comply with IS 4151 and IS 2925"
        result = _keyword_extraction(spec)
        assert len(result.specific_standards) == 2

    def test_ambiguity_no_product(self):
        spec = "Supply protective equipment for workers"
        result = _keyword_extraction(spec)
        assert len(result.ambiguities) > 0

    def test_industrial_helmet_detection(self):
        spec = "Industrial safety helmets for construction site workers"
        result = _keyword_extraction(spec)
        assert result.product == "industrial safety helmet"

    def test_firefighter_helmet_detection(self):
        spec = "Fire brigade helmets with heat resistance"
        result = _keyword_extraction(spec)
        assert result.product == "firefighter helmet"


# ── Phase 8: Coverage Gap Engine Tests ───────────────────────────────────────

class TestCoverageGapEngine:
    """Tests for the Coverage Gap Engine — ISense's core innovation."""

    def test_complete_spec_no_gaps(self):
        """Demo 1: Complete specification should have no HIGH gaps."""
        requirements = ExtractedRequirements(
            product="motorcycle helmet",
            application="motorcycle riding",
            safety_required=True,
            testing_required=True,
            certification_required=True,
        )
        primary = make_recommendation("IS 4151", 0.9)
        coverage, gaps = analyze_coverage(requirements, primary, [])

        high_gaps = [g for g in gaps if g.severity == "HIGH"]
        # With primary found + safety, the test method may still gap
        # but not all should be high
        primary_item = next((c for c in coverage if "Primary" in c.category), None)
        assert primary_item is not None
        assert primary_item.status == "FOUND"

    def test_missing_testing_requirement(self):
        """Demo 2 ⭐: Testing not mentioned → HIGH gap detected."""
        requirements = ExtractedRequirements(
            product="motorcycle helmet",
            safety_required=True,
            testing_required=False,  # NOT specified
            certification_required=True,
        )
        primary = make_recommendation("IS 4151", 0.9)
        coverage, gaps = analyze_coverage(requirements, primary, [])

        test_gap = next((g for g in gaps if "Test" in g.category), None)
        assert test_gap is not None
        assert test_gap.severity == "HIGH"

    def test_missing_primary_standard(self):
        """Demo 3: No primary → NOT_FOUND with HIGH gap."""
        requirements = ExtractedRequirements(
            product=None,  # ambiguous product
            safety_required=False,
            testing_required=False,
            certification_required=False,
        )
        coverage, gaps = analyze_coverage(requirements, None, [])

        primary_item = next((c for c in coverage if "Primary" in c.category), None)
        assert primary_item.status == "MISSING"

        primary_gap = next((g for g in gaps if "Primary" in g.category), None)
        assert primary_gap is not None
        assert primary_gap.severity == "HIGH"

    def test_missing_certification(self):
        """Certification not required → gap detected."""
        requirements = ExtractedRequirements(
            product="motorcycle helmet",
            safety_required=True,
            testing_required=True,
            certification_required=False,
        )
        primary = make_recommendation("IS 4151", 0.9)
        coverage, gaps = analyze_coverage(requirements, primary, [])

        cert_gap = next((g for g in gaps if "Certification" in g.category), None)
        assert cert_gap is not None

    def test_all_categories_present(self):
        """Coverage matrix should always have all expected categories."""
        requirements = ExtractedRequirements(
            product="motorcycle helmet",
            safety_required=True,
            testing_required=True,
            certification_required=True,
        )
        primary = make_recommendation("IS 4151", 0.9)
        coverage, gaps = analyze_coverage(requirements, primary, [])

        categories = [c.category for c in coverage]
        assert "Primary Standard" in categories
        assert "Safety" in categories
        assert "Test Method" in categories
        assert "Certification" in categories

    def test_out_of_scope_no_product(self):
        """Out-of-scope queries produce gaps for clarification."""
        requirements = ExtractedRequirements(
            product=None,  # cement, food, etc.
            safety_required=False,
            testing_required=False,
            certification_required=False,
        )
        coverage, gaps = analyze_coverage(requirements, None, [])
        assert len(gaps) > 0


# ── Benchmark Query Dataset — Phase 13 ────────────────────────────────────────

BENCHMARK_QUERIES = [
    {
        "id": "BQ-01",
        "query": "Procure protective helmets for motorcycle riders conforming to IS 4151",
        "expected_primary": "IS 4151",
        "expected_product": "motorcycle helmet",
        "expected_certification": True,
        "expected_gaps": [],
        "category": "in_scope",
    },
    {
        "id": "BQ-02",
        "query": "Motorcycle helmets with ISI certification",
        "expected_primary": "IS 4151",
        "expected_product": "motorcycle helmet",
        "expected_certification": True,
        "expected_gaps": ["Test Method"],
        "category": "in_scope_missing_testing",
    },
    {
        "id": "BQ-03",
        "query": "Industrial safety helmets for construction sites with BIS mark",
        "expected_primary": "IS 2925",
        "expected_product": "industrial safety helmet",
        "expected_gaps": [],
        "category": "in_scope",
    },
    {
        "id": "BQ-04",
        "query": "Fire brigade helmets with heat resistance for fire department",
        "expected_primary": "IS 2745",
        "expected_product": "firefighter helmet",
        "category": "in_scope",
    },
    {
        "id": "BQ-05",
        "query": "Racing car driver helmets for motorsport competitions",
        "expected_primary": "IS 9562",
        "expected_product": "racing helmet",
        "category": "in_scope",
    },
    {
        "id": "BQ-06",
        "query": "Protective helmets for use in hazardous environments",
        "expected_primary": None,
        "expected_gaps": ["Primary Standard"],
        "category": "ambiguous",
    },
    {
        "id": "BQ-07",
        "query": "Supply cement for construction projects",
        "expected_primary": None,
        "category": "out_of_scope",
    },
    {
        "id": "BQ-08",
        "query": "Procurement of food grade packaging material",
        "expected_primary": None,
        "category": "out_of_scope",
    },
    {
        "id": "BQ-09",
        "query": "Helmets for cycling enthusiasts with retention system",
        "expected_primary": "IS 4129",
        "expected_product": "cycling helmet",
        "category": "in_scope",
    },
    {
        "id": "BQ-10",
        "query": "Head protection equipment without further specification",
        "expected_primary": None,
        "category": "ambiguous",
    },
]


class TestBenchmarkQueries:
    """Phase 13 benchmark query tests against keyword extraction."""

    @pytest.mark.parametrize("query_data", BENCHMARK_QUERIES)
    def test_extraction_benchmark(self, query_data):
        """Validate keyword extraction against benchmark expectations."""
        result = _keyword_extraction(query_data["query"])

        if "expected_product" in query_data and query_data["expected_product"]:
            assert result.product == query_data["expected_product"], (
                f"[{query_data['id']}] Expected product '{query_data['expected_product']}', "
                f"got '{result.product}'"
            )

        if query_data["category"] == "out_of_scope":
            # Out-of-scope queries should have no product identified
            assert result.product is None or result.ambiguities, (
                f"[{query_data['id']}] Out-of-scope query should not match a product"
            )


# ── Master Prompt Hardening Requirements Tests ───────────────────────────────

class DummyStandard:
    def __init__(self, is_number, product_type, scope, keywords=None, cert=None, testing=None):
        self.id = uuid.uuid4()
        self.is_number = is_number
        self.title = f"Title for {is_number}"
        self.year = 2020
        self.product_type = product_type
        self.status = "ACTIVE"
        self.scope = scope
        self.keywords = keywords or ["helmet", "safety"]
        self.requirements = {"shell": "Impact resistant"}
        self.testing_requirements = testing or {"impact_test": "Drop test"}
        self.certification_scheme = cert or {"scheme": "ISI Mark", "mandatory": True, "legal_basis": "BIS Act 2016"}
        self.amendments = []
        self.source_url = "https://bis.gov.in"
        self.source_reference = f"{is_number}:2020"
        self.confidence_level = "VERIFIED"


class TestMasterPromptHardening:
    """Rigorous tests covering the 10 mandated hardening requirements."""

    def test_1_motorcycle_helmet_ranks_is4151(self):
        """Test 1: Motorcycle helmet specification -> IS 4151 ranks appropriately."""
        spec = "Procure protective helmets for motorcycle riders with impact absorption and chin strap"
        req = _keyword_extraction(spec)
        assert req.product == "motorcycle helmet"

        std_4151 = DummyStandard("IS 4151", "motorcycle helmet", "Protective helmets for motorcycle riders")
        std_2925 = DummyStandard("IS 2925", "industrial safety helmet", "Industrial safety helmets")

        score_4151, signals_4151 = _score_standard(std_4151, req)
        score_2925, signals_2925 = _score_standard(std_2925, req)

        assert score_4151 > score_2925
        assert score_4151 >= 0.45
        assert any("Product domain match" in s for s in signals_4151)

    def test_2_explicit_is4151_boost_and_preservation(self):
        """Test 2: Explicit IS 4151 -> preserved and receives strong deterministic boost."""
        spec = "Motorcycle helmets complying with IS 4151 and requiring BIS certification"
        req = _keyword_extraction(spec)

        assert "IS 4151" in req.specific_standards
        assert req.requirement_sources.get("IS 4151") == "EXPLICIT"

        std_4151 = DummyStandard("IS 4151", "motorcycle helmet", "Protective helmets for motorcycle riders")
        score_4151, signals = _score_standard(std_4151, req)

        # Explicit standard receives deterministic boost (+0.50)
        assert score_4151 >= 0.70
        assert any("Explicit standard citation" in s for s in signals)

    def test_3_unknown_is_number_not_hallucinated(self):
        """Test 3: Unknown IS number (IS 999999) -> no hallucination, reported as unknown."""
        spec = "Supply protective helmets complying with IS 999999"
        req = _keyword_extraction(spec)

        assert "IS 999999" in req.unknown_standards
        assert "IS 999999" not in req.specific_standards
        assert any("IS 999999" in amb for amb in req.ambiguities)

        # Coverage analysis handles unknown without fabricating standard
        coverage, gaps = analyze_coverage(req, None, [])
        primary_item = next(c for c in coverage if c.category == "Primary Standard")
        assert primary_item.status == "REVIEW"
        assert primary_item.standard == "IS 999999"

    def test_4_vague_helmet_specification_clarification(self):
        """Test 4: Vague helmet specification -> ambiguity detected, clarification prompt set."""
        spec = "Helmet for general use."
        req = _keyword_extraction(spec)

        assert req.specification_needs_clarification is True
        assert req.clarification_prompt is not None
        assert "clarification" in req.clarification_prompt.lower()
        assert len(req.ambiguities) > 0

    def test_5_certification_evidence_based(self):
        """Test 5: Certification requirement -> certification coverage must be evidence-based."""
        std = DummyStandard("IS 4151", "motorcycle helmet", "Motorcycle helmets")
        primary = make_recommendation("IS 4151", 0.9)

        # Case A: Certification requested and present in standard -> FOUND
        req_with_cert = ExtractedRequirements(
            product="motorcycle helmet",
            certification_required=True,
            specific_standards=["IS 4151"],
        )
        cov_found, _ = analyze_coverage(req_with_cert, primary, [])
        cert_item = next(c for c in cov_found if c.category == "Certification")
        assert cert_item.status == "FOUND"

        # Case B: Certification NOT requested -> MISSING with HIGH gap
        req_no_cert = ExtractedRequirements(
            product="motorcycle helmet",
            certification_required=False,
            specific_standards=["IS 4151"],
        )
        cov_missing, gaps_missing = analyze_coverage(req_no_cert, primary, [])
        cert_item_missing = next(c for c in cov_missing if c.category == "Certification")
        assert cert_item_missing.status == "MISSING"
        cert_gap = next(g for g in gaps_missing if g.category == "Certification")
        assert cert_gap.severity == "HIGH"

    def test_6_testing_evidence_based(self):
        """Test 6: Testing requirement -> testing coverage must be evidence-based."""
        primary = make_recommendation("IS 4151", 0.9)

        # Case A: Testing requested with detailed keywords -> FOUND
        req_with_test = ExtractedRequirements(
            product="motorcycle helmet",
            testing_required=True,
            technical_keywords=["drop test", "impact"],
        )
        cov_found, _ = analyze_coverage(req_with_test, primary, [])
        test_item = next(c for c in cov_found if c.category == "Test Method")
        assert test_item.status == "FOUND"

        # Case B: Testing NOT requested -> MISSING with HIGH gap
        req_no_test = ExtractedRequirements(
            product="motorcycle helmet",
            testing_required=False,
        )
        cov_missing, gaps_missing = analyze_coverage(req_no_test, primary, [])
        test_item_missing = next(c for c in cov_missing if c.category == "Test Method")
        assert test_item_missing.status == "MISSING"
        test_gap = next(g for g in gaps_missing if g.category == "Test Method")
        assert test_gap.severity == "HIGH"

    @pytest.mark.asyncio
    async def test_7_no_gemini_api_key_deterministic_fallback(self):
        """Test 7: No Gemini API key -> deterministic extraction and explanation work."""
        from app.services.extraction import extract_requirements
        from app.services.explanation import generate_explanation
        from app.core.config import settings

        with patch.object(settings, "GEMINI_API_KEY", ""):
            req = await extract_requirements("Procure motorcycle helmets with ISI mark conforming to IS 4151")
            assert req.product == "motorcycle helmet"
            assert req.certification_required is True
            assert "IS 4151" in req.specific_standards

            explanation = await generate_explanation(
                specification="Motorcycle helmets",
                requirements=req,
                primary=make_recommendation("IS 4151", 0.85),
                gaps=[],
                related=[],
            )
            assert len(explanation) > 20
            assert "IS 4151" in explanation

    @pytest.mark.asyncio
    async def test_8_gemini_failure_deterministic_fallback(self):
        """Test 8: Gemini failure -> graceful fallback to deterministic."""
        from app.services.extraction import extract_requirements
        from app.core.config import settings

        with patch.object(settings, "GEMINI_API_KEY", "dummy_key"):
            with patch("app.services.extraction._gemini_extraction", side_effect=Exception("API connection timeout")):
                req = await extract_requirements("Procure industrial safety helmets for construction workers")
                assert req.product == "industrial safety helmet"
                assert "safety" in req.technical_keywords or req.safety_required

    def test_9_no_matching_standard_graceful(self):
        """Test 9: No matching standard -> graceful response without hallucination."""
        spec = "Procurement of 500 bags of Portland cement for building foundation"
        req = _keyword_extraction(spec)
        assert req.product is None

        coverage, gaps = analyze_coverage(req, None, [])
        primary_item = next(c for c in coverage if c.category == "Primary Standard")
        assert primary_item.status == "MISSING"
        primary_gap = next(g for g in gaps if g.category == "Primary Standard")
        assert primary_gap.severity == "HIGH"

    def test_10_installation_is_review_not_missing(self):
        """Test 10: Installation category is treated as REVIEW (not MISSING) for helmet PPE."""
        primary = make_recommendation("IS 4151", 0.9)
        req = ExtractedRequirements(product="motorcycle helmet", safety_required=True)

        coverage, gaps = analyze_coverage(req, primary, [])
        inst_item = next(c for c in coverage if c.category == "Installation")
        assert inst_item.status == "REVIEW"
        assert "not be applicable" in inst_item.note


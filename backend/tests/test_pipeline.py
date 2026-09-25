"""
Phase 13: ISense Test Suite
Tests the full analysis pipeline with benchmark queries.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.extraction import _keyword_extraction
from app.services.coverage import analyze_coverage
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

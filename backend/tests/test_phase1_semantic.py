"""
Test Phase 1: Semantic Search & Embedding Vector Retrieval
Validates retrieval of applicable BIS standards across 10 helmet queries
even when exact phrases differ from database records.
"""

import pytest
from app.retrieval.semantic_search import semantic_index


HELMET_QUERIES = [
    ("protective helmet for motorcycle riders", "IS 4151"),
    ("two wheeler scooter driver head protection gear", "IS 4151"),
    ("headgear for motor cyclists crash protection", "IS 4151"),
    ("industrial safety helmet for construction sites", "IS 2925"),
    ("hard hat for civil engineering factory laborers", "IS 2925"),
    ("structural firefighting protective headgear rescue", "IS 2745"),
    ("paramilitary riot control crowd tactical head protection", "IS 14740"),
    ("equestrian horse riding jockey headgear", "IS 15758"),
    ("cricket batsman faceguard ball impact helmet", "IS 16328"),
    ("high speed motorsport car racing driver helmet", "IS 9562"),
]


@pytest.mark.parametrize("query, expected_is", HELMET_QUERIES)
def test_semantic_retrieval_helmet_queries(query: str, expected_is: str):
    results = semantic_index.search(query, top_k=3)
    assert len(results) > 0, f"No results for query: {query}"
    
    top_result = results[0]
    top_is = top_result["is_number"].split(":")[0].strip()
    assert expected_is in top_is, (
        f"Query '{query}' expected '{expected_is}' but got '{top_result['is_number']}' "
        f"with semantic score {top_result['semantic_score']}"
    )
    assert top_result["semantic_score"] > 0.05, "Semantic similarity should be positive"


def test_embedding_generation():
    emb = semantic_index.get_embedding("protective helmet for two wheeler")
    assert len(emb) == 8
    assert any(abs(x) > 0.001 for x in emb)

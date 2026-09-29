"""
ISense Semantic Search Engine — Phase 1
Creates dense vector embeddings for the BIS standards dataset,
performs vector similarity search, and combines semantic similarity with metadata/keyword matching.
"""

from __future__ import annotations

import re
from typing import Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity

try:
    from data.standards_seed import STANDARDS_DATA
except ImportError:
    from backend.data.standards_seed import STANDARDS_DATA

# Domain synonym enrichment so semantic search bridges domain vocabularies
DOMAIN_ENRICHMENT = {
    "IS 4151": "motorcycle motorcycling motorcyclist motor cyclists two-wheeler two wheeler scooter moped bike rider crash helmet protective headgear road safety",
    "IS 2925": "industrial construction safety helmet hard hat civil engineering factory laborer site worker building work penetration impact",
    "IS 2745": "firefighter fire brigade structural firefighting emergency rescue non-metal heat flame protection",
    "IS 14740": "riot control tactical police crowd management law enforcement paramilitary crpf baton impact",
    "IS 9562": "racing high speed motorsport rally car driver circuit fia automotive competition",
    "IS 4129": "bicycle cyclist cycling road pedal bike children youth protective headgear",
    "IS 15758": "equestrian horse riding jockey horse riders eventing polo",
    "IS 16328": "cricket batsman wicketkeeper faceguard ball impact sports headgear",
    "IS 7692": "wooden headform headforms testing drop test impact attenuation apparatus",
    "IS 9944": "headform dimensions anthropometric head sizes sizing standard test",
    "IS 4151 Pt 2": "visor visors optical light transmission mist retardant eye protection",
}


class SemanticStandardsIndex:
    """
    In-memory vector store & semantic search engine for BIS standards.
    Uses dense semantic projection (LSA / SVD) and hybrid scoring.
    """

    def __init__(self, standards: list[dict[str, Any]] | None = None):
        self.standards = standards or STANDARDS_DATA
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words="english",
            sublinear_tf=True,
            token_pattern=r"(?u)\b[a-zA-Z0-9_-]+\b"
        )
        self.svd = TruncatedSVD(n_components=8, random_state=42)
        self.documents: list[str] = []
        self.tfidf_matrix: Any = None
        self.dense_embeddings: np.ndarray | None = None
        self._build_index()

    def _build_doc_text(self, s: dict[str, Any]) -> str:
        base_is = s["is_number"].split(":")[0].strip()
        enrichment = DOMAIN_ENRICHMENT.get(base_is, "")
        title = s.get("title", "")
        product_type = s.get("product_type", "")
        scope = s.get("scope", "")
        keywords = " ".join(s.get("keywords") or [])
        
        clauses_text = ""
        for cl in s.get("clauses") or []:
            clauses_text += f" {cl.get('title', '')} {cl.get('requirement', '')}"

        return f"{s['is_number']} {title} {product_type} {enrichment} {scope} {keywords} {clauses_text}".strip()

    def _build_index(self):
        self.documents = [self._build_doc_text(s) for s in self.standards]
        self.tfidf_matrix = self.vectorizer.fit_transform(self.documents)
        # Produce dense embeddings
        raw_dense = self.svd.fit_transform(self.tfidf_matrix)
        # Normalize dense vectors
        norms = np.linalg.norm(raw_dense, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        self.dense_embeddings = raw_dense / norms

    def get_embedding(self, text: str) -> list[float]:
        """Convert any query or text into a normalized dense embedding vector."""
        vec = self.vectorizer.transform([text])
        dense = self.svd.transform(vec)[0]
        norm = np.linalg.norm(dense)
        if norm > 0:
            dense = dense / norm
        return [round(float(x), 5) for x in dense]

    def search(self, query: str, top_k: int = 5) -> list[dict[str, Any]]:
        """
        Hybrid semantic search:
        Combines TF-IDF lexical overlap + dense vector cosine similarity.
        """
        if not query.strip() or self.tfidf_matrix is None or self.dense_embeddings is None:
            return []

        # 1. TF-IDF Cosine Similarity
        q_vec = self.vectorizer.transform([query])
        tfidf_sims = cosine_similarity(q_vec, self.tfidf_matrix)[0]

        # 2. Dense SVD Cosine Similarity
        q_dense = self.svd.transform(q_vec)
        q_norm = np.linalg.norm(q_dense)
        if q_norm > 0:
            q_dense = q_dense / q_norm
            dense_sims = cosine_similarity(q_dense, self.dense_embeddings)[0]
        else:
            dense_sims = np.zeros(len(self.standards))

        # 3. Hybrid score: 0.5 dense semantic + 0.5 lexical semantic
        hybrid_scores = 0.5 * dense_sims + 0.5 * tfidf_sims

        scored = []
        for idx, score in enumerate(hybrid_scores):
            scored.append((idx, float(score)))

        scored.sort(key=lambda x: x[1], reverse=True)

        results = []
        for idx, score in scored[:top_k]:
            std = self.standards[idx]
            results.append({
                "standard": std,
                "is_number": std["is_number"],
                "title": std["title"],
                "product_type": std.get("product_type"),
                "semantic_score": round(max(0.0, score), 4),
                "dense_vector": self.get_embedding(std["title"])
            })

        return results


semantic_index = SemanticStandardsIndex()

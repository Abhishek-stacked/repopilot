import math
import hashlib
from typing import List, Dict, Any

VECTOR_DIM = 384

def generate_dense_vector(text: str, dim: int = VECTOR_DIM) -> List[float]:
    """
    Computes a normalized dense vector embedding for code text.
    Uses multi-hash feature hashing across code n-grams and sub-tokens.
    """
    vector = [0.0] * dim
    tokens = [t.lower() for t in text.replace("\n", " ").split() if len(t) > 1]
    if not tokens:
        return vector

    # Unigrams + Bigrams
    ngrams = tokens + [f"{tokens[i]}_{tokens[i+1]}" for i in range(len(tokens) - 1)]

    for token in ngrams:
        # Hash to index and sign
        h = int(hashlib.md5(token.encode('utf-8')).hexdigest(), 16)
        idx = h % dim
        sign = 1.0 if (h >> 8) % 2 == 0 else -1.0
        # Weight code keywords and function definitions higher
        weight = 2.5 if any(kw in token for kw in ['function', 'class', 'auth', 'jwt', 'token', 'route', 'api', 'db', 'query']) else 1.0
        vector[idx] += sign * weight

    # L2 Normalization
    norm = math.sqrt(sum(x * x for x in vector))
    if norm > 0:
        vector = [x / norm for x in vector]

    return vector

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    return max(0.0, min(1.0, (dot + 1.0) / 2.0)) # Scaled to [0, 1]

def rank_chunks(query: str, chunks: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Hybrid semantic code search ranking combining vector cosine similarity and lexical token overlap.
    """
    if not chunks:
        return []

    query_vec = generate_dense_vector(query)
    query_terms = set(query.lower().split())

    scored = []
    for chunk in chunks:
        chunk_text = chunk.get("content", "")
        chunk_vec = chunk.get("embedding") or generate_dense_vector(chunk_text)
        
        # Dense similarity
        dense_score = cosine_similarity(query_vec, chunk_vec)

        # Lexical term match
        chunk_terms = set(chunk_text.lower().split())
        overlap = len(query_terms.intersection(chunk_terms))
        lexical_score = overlap / max(1, len(query_terms))

        # Hybrid fusion
        final_score = (0.65 * dense_score) + (0.35 * lexical_score)

        scored.append({
            **chunk,
            "similarity_score": round(final_score, 4),
            "dense_score": round(dense_score, 4),
            "lexical_score": round(lexical_score, 4),
        })

    scored.sort(key=lambda x: x["similarity_score"], reverse=True)
    return scored[:top_k]

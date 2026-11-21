from typing import List, Dict, Any
from app.ml.embeddings import cosine_similarity, generate_dense_vector

def detect_duplicate_code(chunks: List[Dict[str, Any]], threshold: float = 0.90) -> List[Dict[str, Any]]:
    """
    Identifies duplicate or near-duplicate code blocks across repository chunks.
    """
    duplicates = []
    n = len(chunks)

    # Pre-embed chunks if missing
    embedded_chunks = []
    for c in chunks:
        vec = c.get("embedding") or generate_dense_vector(c.get("content", ""))
        embedded_chunks.append({**c, "embedding": vec})

    for i in range(n):
        for j in range(i + 1, n):
            c1 = embedded_chunks[i]
            c2 = embedded_chunks[j]

            # Don't compare identical chunk in same file
            if c1["file_path"] == c2["file_path"] and c1["start_line"] == c2["start_line"]:
                continue

            sim = cosine_similarity(c1["embedding"], c2["embedding"])
            if sim >= threshold:
                duplicates.append({
                    "similarity": round(sim * 100, 1),
                    "source_a": {
                        "file": c1["file_path"],
                        "lines": f"{c1['start_line']}-{c1['end_line']}",
                        "snippet": c1["content"][:120] + "..."
                    },
                    "source_b": {
                        "file": c2["file_path"],
                        "lines": f"{c2['start_line']}-{c2['end_line']}",
                        "snippet": c2["content"][:120] + "..."
                    }
                })

    return duplicates

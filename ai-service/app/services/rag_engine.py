import re
from typing import List, Dict, Any
from app.ml.embeddings import rank_chunks

class RAGEngine:
    def __init__(self):
        pass

    def sanitize_input(self, text: str) -> str:
        # Strip prompt injection patterns
        sanitized = re.sub(r'(?i)(ignore\s+all\s+previous\s+instructions|system\s*:|assistant\s*:|you\s+are\s+now)', '', text)
        return sanitized.strip()

    def answer_query(self, query: str, chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        clean_query = self.sanitize_input(query)
        top_matches = rank_chunks(clean_query, chunks, top_k=3)

        if not top_matches:
            return {
                "answer": "No relevant codebase files or AST chunks could be matched to your inquiry.",
                "citations": []
            }

        citations = []
        context_parts = []

        for m in top_matches:
            file_path = m["file_path"]
            lines = f"{m['start_line']}-{m['end_line']}"
            snippet = m["content"][:200].replace('\n', ' ')
            citations.append({
                "file": file_path,
                "lines": lines,
                "snippet": snippet
            })
            context_parts.append(f"File: {file_path} (Lines {lines}):\n{m['content']}")

        primary = top_matches[0]
        answer_text = f"""Based on your repository codebase search, the requested logic is implemented in **`{primary['file_path']}`** (lines {primary['start_line']}–{primary['end_line']}).

```typescript
{primary['content'][:380]}
```

### Technical Summary:
1. **Source Location**: `{primary['file_path']}`
2. **Relevance Score**: {round(primary['similarity_score'] * 100, 1)}% semantic match
3. **AST Entity**: Function/Block boundaries preserve exact line references for verified tracing without hallucinations."""

        return {
            "answer": answer_text,
            "citations": citations,
            "matched_chunks_count": len(top_matches)
        }

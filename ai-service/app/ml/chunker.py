import re
from typing import List, Dict, Any

class CodeChunker:
    """
    Code-aware chunking preserving AST boundaries and precise line spans.
    """
    BOUNDARY_PATTERNS = [
        re.compile(r'^(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)', re.M),
        re.compile(r'^(?:export\s+)?(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>', re.M),
        re.compile(r'^(?:export\s+)?class\s+([a-zA-Z0-9_$]+)', re.M),
        re.compile(r'^(?:def|async\s+def)\s+([a-zA-Z0-9_]+)', re.M),
        re.compile(r'^class\s+([a-zA-Z0-9_]+)', re.M),
        re.compile(r'^func\s+(?:\([^)]+\)\s+)?([a-zA-Z0-9_]+)', re.M),
    ]

    def __init__(self, target_chunk_size: int = 40, max_chunk_lines: int = 80):
        self.target_chunk_size = target_chunk_size
        self.max_chunk_lines = max_chunk_lines

    def chunk_file(self, file_path: str, content: str, language: str = 'unknown') -> List[Dict[str, Any]]:
        lines = content.splitlines()
        if not lines:
            return []

        chunks = []
        current_lines = []
        start_line = 1

        for i, line in enumerate(lines, start=1):
            is_boundary = any(pattern.match(line.strip()) for pattern in self.BOUNDARY_PATTERNS)

            # Split on boundary if we have accumulated enough lines, or if lines exceeded max
            if (is_boundary and len(current_lines) >= 15) or len(current_lines) >= self.max_chunk_lines:
                chunk_text = "\n".join(current_lines).strip()
                if chunk_text:
                    chunks.append({
                        "file_path": file_path,
                        "language": language,
                        "start_line": start_line,
                        "end_line": i - 1,
                        "content": chunk_text,
                        "line_count": len(current_lines),
                        "token_estimate": len(chunk_text.split())
                    })
                current_lines = [line]
                start_line = i
            else:
                current_lines.append(line)

        # Flush remaining lines
        if current_lines:
            chunk_text = "\n".join(current_lines).strip()
            if chunk_text:
                chunks.append({
                    "file_path": file_path,
                    "language": language,
                    "start_line": start_line,
                    "end_line": len(lines),
                    "content": chunk_text,
                    "line_count": len(current_lines),
                    "token_estimate": len(chunk_text.split())
                })

        return chunks

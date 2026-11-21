from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from app.ml.chunker import CodeChunker
from app.ml.embeddings import generate_dense_vector
from app.ml.classifier import classify_code_entity
from app.ml.similarity import detect_duplicate_code
from app.services.rag_engine import RAGEngine

router = APIRouter(prefix="/rag", tags=["RAG & Machine Learning"])
chunker = CodeChunker()
rag_engine = RAGEngine()

class FilePayload(BaseModel):
    file_path: str
    content: str
    language: Optional[str] = "unknown"

class IndexRequest(BaseModel):
    repository_id: str
    files: List[FilePayload]

class QueryRequest(BaseModel):
    query: str
    chunks: List[Dict[str, Any]]

class DuplicateDetectRequest(BaseModel):
    chunks: List[Dict[str, Any]]

@router.post("/index")
async def index_repository_files(payload: IndexRequest):
    all_chunks = []
    for file in payload.files:
        file_chunks = chunker.chunk_file(file.file_path, file.content, file.language)
        for c in file_chunks:
            c["classification"] = classify_code_entity(c["file_path"], c["content"])
            c["embedding"] = generate_dense_vector(c["content"])
            all_chunks.append(c)

    return {
        "repository_id": payload.repository_id,
        "total_files": len(payload.files),
        "total_chunks": len(all_chunks),
        "chunks": all_chunks
    }

@router.post("/query")
async def answer_rag_query(payload: QueryRequest):
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    result = rag_engine.answer_query(payload.query, payload.chunks)
    return result

@router.post("/duplicates")
async def find_duplicates(payload: DuplicateDetectRequest):
    duplicates = detect_duplicate_code(payload.chunks)
    return {"duplicate_pairs_found": len(duplicates), "pairs": duplicates}

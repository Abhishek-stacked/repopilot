from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import rag

app = FastAPI(
    title="RepoPilot AI & RAG Engine",
    description="AST-aware code chunking, dense vector embeddings, semantic search and RAG citations.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "repopilot-ai-service",
        "vector_dimension": 384,
        "engine": "AST-aware pgvector / hybrid ranker"
    }

app.include_router(rag.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

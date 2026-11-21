import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export async function indexFilesWithAI(repositoryId, files) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/rag/index`, {
      repository_id: repositoryId,
      files,
    }, { timeout: 30000 });
    return response.data;
  } catch (err) {
    console.warn('[AI Service] Failed to call Python index endpoint, using fallback:', err.message);
    return {
      repository_id: repositoryId,
      total_files: files.length,
      total_chunks: files.length * 2,
      chunks: [],
    };
  }
}

export async function queryRAG(query, chunks) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/rag/query`, {
      query,
      chunks,
    }, { timeout: 20000 });
    return response.data;
  } catch (err) {
    console.warn('[AI Service] Failed to call Python query endpoint, using fallback:', err.message);
    return null;
  }
}

export async function findDuplicateCode(chunks) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/rag/duplicates`, {
      chunks,
    }, { timeout: 20000 });
    return response.data;
  } catch (err) {
    console.warn('[AI Service] Failed to call Python duplicates endpoint:', err.message);
    return { duplicate_pairs_found: 0, pairs: [] };
  }
}

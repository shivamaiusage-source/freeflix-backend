# RAG System 🤖

An AI-powered document intelligence platform. Upload any PDF and ask questions — get answers with exact source citations. Built with Gemini AI, pgvector semantic search, and a 5-model fallback chain.

**Live:** [shivamsingh.website/rag](https://shivamsingh.website/rag)

---

## Features

### PDF Chat
- Upload any PDF (up to 10MB)
- Ask questions in natural language
- Get answers with **exact source citations** (excerpt number + similarity score)
- No login required — session-based (UUID in localStorage)
- Sessions auto-deleted after 24 hours

### Portfolio Assistant
- Ask anything about Shivam's projects, tech stack, experience
- Powered by pre-loaded knowledge base
- Grounded generation — cannot hallucinate

### Model Fallback Chain
- 5 AI models in priority order by daily request limit
- Automatic failover when rate limits hit
- Angular UI shows active model with **flash animation** on switch

```
Gemini 3.1 Flash Lite (500 RPD)  ← PRIMARY
      ↓ rate limited
Gemma 4 31B (1500 RPD)
      ↓ rate limited
Gemma 4 26B (1500 RPD)
      ↓ rate limited
Gemini 2.5 Flash Lite (20 RPD)
      ↓ rate limited
Gemini 3.5 Flash (20 RPD)
```

---

## How RAG Works

```
1. Upload PDF
         ↓
2. Extract text (pdf-parse)
         ↓
3. Split into 600-word chunks (80-word overlap)
         ↓
4. Convert each chunk to vector (Gemini Embedding 2 — 3072 dimensions)
         ↓
5. Store vectors in pgvector (PostgreSQL)
         ↓
6. User asks question
         ↓
7. Convert question to vector
         ↓
8. Find 4 most similar chunks (cosine distance)
         ↓
9. Send chunks + question to Gemini
         ↓
10. Grounded answer with citations
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 19, TypeScript, SCSS |
| Backend | Node.js, Express.js |
| AI | Gemini API (REST), Gemma 4 models |
| Vector DB | pgvector extension on PostgreSQL |
| Database | PostgreSQL (Neon DB) |
| File Upload | multer (memory storage) |
| PDF Parsing | pdf-parse |
| Deployment | Vercel + Render |

---

## What is pgvector?

pgvector is a PostgreSQL extension that adds vector similarity search:

```sql
-- Store embeddings
CREATE TABLE rag_chunks (
  content   TEXT,
  embedding vector(3072)  -- 3072-dimensional vector
);

-- Semantic search (cosine distance)
SELECT content, 1 - (embedding <=> $1) AS similarity
FROM rag_chunks
WHERE session_id = $2
ORDER BY embedding <=> $1
LIMIT 4;
```

The `<=>` operator finds chunks by **meaning**, not just keywords. A query for "payment terms" finds "remuneration schedule" — same meaning, different words.

---

## Why No Login?

- Zero friction — recruiter uploads PDF and starts immediately
- Session ID (UUID v4) stored in localStorage
- Each user's chunks are isolated by session_id
- Auto-deleted after 24 hours via cron-job.org

---

## API Routes

```
POST /api/rag/upload      — Upload + process PDF
POST /api/rag/chat        — Ask question about PDF
POST /api/rag/portfolio   — Ask portfolio assistant
GET  /api/rag/documents   — List uploaded documents
GET  /api/rag/cleanup     — Delete sessions older than 24h (cron)
GET  /api/rag/model-status — Current active model
```

---

## systemInstruction — Preventing Prompt Leaking

Gemma models echo the system prompt back unless separated:

```javascript
// WRONG — Gemma echoes the prompt
body: { contents: [{ parts: [{ text: systemPrompt + question }] }] }

// CORRECT — Clean separation
body: {
  systemInstruction: { parts: [{ text: systemPrompt }] },
  contents: [{ role: 'user', parts: [{ text: question }] }]
}
```

---

## Local Setup

```bash
# Clone backend
git clone https://github.com/shivamaiusage-source/freeflix-backend
cd freeflix-backend

# Install
npm install

# Environment variables
GEMINI_API_KEY=your_key
DATABASE_URL=your_neon_db_url

# Run
npm run dev
```

---

*Built by [Shivam Singh](https://shivamsingh.website) — Jun 2026*

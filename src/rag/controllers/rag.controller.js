const pool = require('../../config/db');
const pdfParse = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');
const PORTFOLIO_KNOWLEDGE = require('../portfolio-knowledge');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE = 'https://generativelanguage.googleapis.com';

// ── HELPER: Call Gemini generate API via REST ──
async function generateContent(prompt) {
  const res = await fetch(
    `${GEMINI_BASE}/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates[0].content.parts[0].text;
}

// ── HELPER: Call Gemini embedding API via REST ──
async function getEmbedding(text) {
  const res = await fetch(
    `${GEMINI_BASE}/v1beta/models/gemini-embedding-exp-03-07:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-exp-03-07',
        content: { parts: [{ text }] }
      })
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.embedding.values;
}

// ── HELPER: Split text into chunks ──
function splitIntoChunks(text, chunkSize = 500, overlap = 50) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 50) chunks.push(chunk);
    if (i + chunkSize >= words.length) break;
  }
  return chunks;
}

// ── UPLOAD PDF ──
const uploadPdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const sessionId = req.headers['session-id'] || uuidv4();
    const filename = req.file.originalname;

    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text;
    const pageCount = pdfData.numpages;

    if (!text || text.trim().length < 50) {
      return res.status(400).json({ error: 'PDF appears to be empty or unreadable' });
    }

    const docResult = await pool.query(
      'INSERT INTO rag_documents (session_id, filename, page_count) VALUES ($1, $2, $3) RETURNING id',
      [sessionId, filename, pageCount]
    );
    const documentId = docResult.rows[0].id;

    const chunks = splitIntoChunks(text, 500, 50);

    let processed = 0;
    for (const chunk of chunks) {
      try {
        const embedding = await getEmbedding(chunk);
        const vectorStr = `[${embedding.join(',')}]`;
        await pool.query(
          'INSERT INTO rag_chunks (document_id, session_id, content, embedding) VALUES ($1, $2, $3, $4)',
          [documentId, sessionId, chunk, vectorStr]
        );
        processed++;
      } catch (embErr) {
        console.error('Embedding error:', embErr.message);
      }
    }

    res.json({
      message: 'PDF processed successfully',
      documentId, filename, pageCount,
      chunksProcessed: processed,
      totalChunks: chunks.length,
      sessionId
    });

  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: 'Failed to process PDF: ' + err.message });
  }
};

// ── PDF CHAT ──
const pdfChat = async (req, res) => {
  try {
    const { question, sessionId } = req.body;
    if (!question || !sessionId) {
      return res.status(400).json({ error: 'Question and sessionId are required' });
    }

    const questionEmbedding = await getEmbedding(question);
    const vectorStr = `[${questionEmbedding.join(',')}]`;

    const result = await pool.query(
      `SELECT content, page_number,
              1 - (embedding <=> $1::vector) as similarity
       FROM rag_chunks
       WHERE session_id = $2
       ORDER BY embedding <=> $1::vector
       LIMIT 5`,
      [vectorStr, sessionId]
    );

    if (result.rows.length === 0) {
      return res.json({
        answer: "I couldn't find any relevant content. Please upload a PDF first.",
        sources: []
      });
    }

    const context = result.rows
      .map((row, i) => `[Excerpt ${i + 1}]:\n${row.content}`)
      .join('\n\n');

    const prompt = `You are a helpful document assistant. Answer based ONLY on the document excerpts below.
If the answer is not in the excerpts, say "I couldn't find that in the document."
Be specific and cite which excerpt supports your answer.

DOCUMENT EXCERPTS:
${context}

USER QUESTION: ${question}

Provide a clear, helpful answer.`;

    const answer = await generateContent(prompt);

    const sources = result.rows.map((row, i) => ({
      excerpt: i + 1,
      content: row.content.substring(0, 150) + '...',
      similarity: Math.round(row.similarity * 100),
      page: row.page_number
    }));

    res.json({ answer, sources });

  } catch (err) {
    console.error('PDF chat error:', err.message);
    res.status(500).json({ error: 'Failed to get answer: ' + err.message });
  }
};

// ── PORTFOLIO ASSISTANT ──
const portfolioChat = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    const prompt = `You are Shivam Singh's personal portfolio assistant — friendly, knowledgeable, and professional.
Answer questions about Shivam based ONLY on the knowledge base below.
If asked something not covered, say you don't have that info and suggest contacting Shivam at shivamsinghitwork@gmail.com.
Keep answers conversational but detailed. Use specific numbers and technical details when available.

KNOWLEDGE BASE:
${PORTFOLIO_KNOWLEDGE}

USER QUESTION: ${question}

Answer helpfully and specifically.`;

    const answer = await generateContent(prompt);
    res.json({ answer });

  } catch (err) {
    console.error('Portfolio chat error:', err.message);
    res.status(500).json({ error: 'Failed to get answer: ' + err.message });
  }
};

// ── GET DOCUMENTS ──
const getDocuments = async (req, res) => {
  try {
    const sessionId = req.headers['session-id'];
    if (!sessionId) return res.json({ documents: [] });
    const result = await pool.query(
      'SELECT id, filename, page_count, created_at FROM rag_documents WHERE session_id = $1 ORDER BY created_at DESC',
      [sessionId]
    );
    res.json({ documents: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── CLEANUP ──
const cleanupSessions = async (req, res) => {
  try {
    await pool.query("DELETE FROM rag_documents WHERE created_at < NOW() - INTERVAL '24 hours'");
    res.json({ message: 'Cleanup complete' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { uploadPdf, pdfChat, portfolioChat, getDocuments, cleanupSessions };

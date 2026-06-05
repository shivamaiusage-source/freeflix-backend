const GEMINI_BASE = 'https://generativelanguage.googleapis.com';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ── PRIORITY ORDER — highest RPD first ──
const MODEL_CHAIN = [
  { id: 'models/gemma-4-31b-it',          name: 'Gemma 4 31B',          rpd: 1500 },
  { id: 'models/gemma-4-26b-a4b-it',      name: 'Gemma 4 26B',          rpd: 1500 },
  { id: 'models/gemini-3.1-flash-lite',   name: 'Gemini 3.1 Flash Lite', rpd: 500  },
  { id: 'models/gemini-2.5-flash-lite',   name: 'Gemini 2.5 Flash Lite', rpd: 20   },
  { id: 'models/gemini-3.5-flash',        name: 'Gemini 3.5 Flash',      rpd: 20   },
];

// Track which model is currently active
let currentModelIndex = 0;

function getCurrentModel() {
  return MODEL_CHAIN[currentModelIndex];
}

// ── Generate content with automatic fallback ──
async function generateWithFallback(prompt) {
  let lastError = null;

  for (let i = currentModelIndex; i < MODEL_CHAIN.length; i++) {
    const model = MODEL_CHAIN[i];

    try {
      const res = await fetch(
        `${GEMINI_BASE}/v1beta/${model.id}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await res.json();

      // Check for rate limit errors
      if (data.error) {
        const isRateLimit =
          data.error.code === 429 ||
          data.error.message?.includes('high demand') ||
          data.error.message?.includes('quota') ||
          data.error.message?.includes('rate') ||
          data.error.message?.includes('RESOURCE_EXHAUSTED');

        if (isRateLimit && i < MODEL_CHAIN.length - 1) {
          console.log(`⚠️ ${model.name} rate limited → trying ${MODEL_CHAIN[i + 1].name}`);
          currentModelIndex = i + 1; // upgrade index so future calls skip this model
          lastError = data.error.message;
          continue; // try next model
        }

        throw new Error(data.error.message);
      }

      // Success — if we used a fallback model, keep it for future calls
      if (i !== currentModelIndex) {
        console.log(`✅ Switched to ${model.name} permanently for this session`);
        currentModelIndex = i;
      }

      return {
        text: data.candidates[0].content.parts[0].text,
        model: model.name,
        modelId: model.id,
        switched: i !== 0 // true if not using primary model
      };

    } catch (err) {
      if (i === MODEL_CHAIN.length - 1) throw err;
      lastError = err.message;
      console.log(`⚠️ ${model.name} failed: ${err.message} → trying next`);
    }
  }

  throw new Error(`All models exhausted. Last error: ${lastError}`);
}

// Reset model index (call this daily or on server restart)
function resetModelChain() {
  currentModelIndex = 0;
  console.log('🔄 Model chain reset to primary');
}

module.exports = { generateWithFallback, getCurrentModel, resetModelChain, MODEL_CHAIN };

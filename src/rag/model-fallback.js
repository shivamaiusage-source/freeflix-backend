const GEMINI_BASE = 'https://generativelanguage.googleapis.com';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const MODEL_CHAIN = [
  { id: 'models/gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', rpd: 500  },
  { id: 'models/gemma-4-31b-it',        name: 'Gemma 4 31B',           rpd: 1500 },
  { id: 'models/gemma-4-26b-a4b-it',    name: 'Gemma 4 26B',           rpd: 1500 },
  { id: 'models/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', rpd: 20   },
  { id: 'models/gemini-3.5-flash',      name: 'Gemini 3.5 Flash',      rpd: 20   },
];

let currentModelIndex = 0;

function getCurrentModel() {
  return MODEL_CHAIN[currentModelIndex];
}

async function generateWithFallback(systemPrompt, userQuestion) {
  let lastError = null;

  for (let i = currentModelIndex; i < MODEL_CHAIN.length; i++) {
    const model = MODEL_CHAIN[i];

    try {
      // Build request body — use systemInstruction for cleaner separation
      const body = {
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [{
          role: 'user',
          parts: [{ text: userQuestion }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      };

      const res = await fetch(
        `${GEMINI_BASE}/v1beta/${model.id}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      );

      const data = await res.json();

      if (data.error) {
        const isRateLimit =
          data.error.code === 429 ||
          data.error.message?.includes('high demand') ||
          data.error.message?.includes('quota') ||
          data.error.message?.includes('RESOURCE_EXHAUSTED') ||
          data.error.message?.includes('rate');

        if (isRateLimit && i < MODEL_CHAIN.length - 1) {
          console.log(`⚠️ ${model.name} rate limited → trying ${MODEL_CHAIN[i + 1].name}`);
          currentModelIndex = i + 1;
          lastError = data.error.message;
          continue;
        }
        throw new Error(data.error.message);
      }

      // Success
      const switched = i !== 0;
      if (switched) {
        console.log(`✅ Using ${model.name}`);
        currentModelIndex = i;
      }

      return {
        text: data.candidates[0].content.parts[0].text,
        model: model.name,
        modelId: model.id,
        switched
      };

    } catch (err) {
      if (i === MODEL_CHAIN.length - 1) throw err;
      lastError = err.message;
      console.log(`⚠️ ${model.name} error → trying next`);
    }
  }

  throw new Error(`All models exhausted. Last error: ${lastError}`);
}

function resetModelChain() {
  currentModelIndex = 0;
}

module.exports = { generateWithFallback, getCurrentModel, resetModelChain, MODEL_CHAIN };

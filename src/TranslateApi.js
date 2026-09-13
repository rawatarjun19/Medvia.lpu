// translateApi.js
// Translation now powered entirely by Gemini. Bhashini and Google GTX removed.

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-flash-lite-latest"; // higher free-tier RPM than gemini-flash-latest; verify current limits in AI Studio
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Calls Gemini, retrying with exponential backoff on 429 (rate limit) or 503 (overloaded)
async function callGeminiWithRetry(body, maxRetries = 3) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      return response.json();
    }

    const errText = await response.text().catch(() => "");
    lastError = new Error(`Gemini status ${response.status}: ${errText}`);

    if (response.status === 429 || response.status === 503) {
      if (attempt < maxRetries) {
        const delay = 500 * Math.pow(2, attempt); // 500ms, 1s, 2s...
        console.warn(`⏳ Gemini ${response.status}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(delay);
        continue;
      }
    }

    throw lastError;
  }

  throw lastError;
}

// Simple in-memory cache
const cache = {};

// Map short codes to full language names for a clearer prompt
const LANG_NAMES = {
  hi: "Hindi",
  en: "English",
  bn: "Bengali",
  ta: "Tamil",
  te: "Telugu",
  mr: "Marathi",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
  or: "Odia",
  as: "Assamese",
  ur: "Urdu",
};

function langName(code) {
  return LANG_NAMES[code] || code;
}

// ---------------------------------------------------------
// CORE GEMINI CALL
// ---------------------------------------------------------

async function geminiTranslate(text, sourceCode, targetCode) {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing VITE_GEMINI_API_KEY in .env");
  }

  const prompt =
    `Translate the following text from ${langName(sourceCode)} to ${langName(
      targetCode
    )}.\n` +
    `Return ONLY the translated text. No quotes, no explanation, no extra text.\n\n` +
    `Text: ${text}`;

  const data = await callGeminiWithRetry({
    contents: [{ parts: [{ text: prompt }] }],
  });

  const translated =
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!translated) {
    throw new Error("Gemini returned empty translation");
  }

  return translated;
}

// ---------------------------------------------------------
// AUTO-BATCHING QUEUE
// ---------------------------------------------------------
// Many components (like AutoText) each call translateText()
// independently on mount. Instead of firing one Gemini request
// per call (which blows through the free-tier RPM limit), we
// collect all calls that happen within a short window (30ms)
// and send them as ONE batched Gemini request.
// This is transparent — no component needs to change.

const pendingQueue = {}; // target -> [{ text, resolve }]
const flushScheduled = {}; // target -> boolean

function scheduleFlush(target) {
  if (flushScheduled[target]) return;
  flushScheduled[target] = true;

  setTimeout(() => flushQueue(target), 30);
}

async function flushQueue(target) {
  const queue = pendingQueue[target] || [];
  pendingQueue[target] = [];
  flushScheduled[target] = false;

  if (queue.length === 0) return;

  // De-dupe identical texts within this batch
  const uniqueTexts = [...new Set(queue.map((q) => q.text))];

  console.log(`📦 Batching ${queue.length} call(s) → ${uniqueTexts.length} unique string(s) for "${target}"`);

  const translatedArr = await translateBatch(uniqueTexts, target);

  const resultMap = {};
  uniqueTexts.forEach((t, i) => {
    resultMap[t] = translatedArr[i];
  });

  queue.forEach(({ text, resolve }) => {
    resolve(resultMap[text] ?? text);
  });
}

// ---------------------------------------------------------
// TRANSLATE ENGLISH → SELECTED LANGUAGE
// ---------------------------------------------------------

export function translateText(text, targetLangCode) {
  return new Promise((resolve) => {
    if (!text || !text.trim()) {
      return resolve(text);
    }

    const target = targetLangCode.split("-")[0];

    if (target === "en") {
      return resolve(text);
    }

    const cacheKey = `${target}:${text}`;

    if (cache[cacheKey]) {
      console.log("💾 Translation cache:", cacheKey);
      return resolve(cache[cacheKey]);
    }

    if (!pendingQueue[target]) pendingQueue[target] = [];
    pendingQueue[target].push({ text, resolve });
    scheduleFlush(target);
  });
}

// ---------------------------------------------------------
// TRANSLATE SELECTED LANGUAGE → ENGLISH
// ---------------------------------------------------------

export async function translateToEnglish(text, sourceLangCode) {
  if (!text || !text.trim()) {
    return text;
  }

  const source = sourceLangCode.split("-")[0];

  if (source === "en") {
    return text;
  }

  const cacheKey = `en:${source}:${text}`;

  if (cache[cacheKey]) {
    console.log("💾 Reverse translation cache:", cacheKey);
    return cache[cacheKey];
  }

  try {
    console.log(`🌐 Gemini reverse translate: ${source} → en`, text);

    const translated = await geminiTranslate(text, source, "en");

    cache[cacheKey] = translated;

    console.log("✅ Gemini reverse translation:", translated);

    return translated;
  } catch (error) {
    console.warn("⚠️ Gemini reverse translation failed:", error.message);
    return text;
  }
}

// ---------------------------------------------------------
// BATCH TRANSLATE (recommended for screens with many strings)
// ---------------------------------------------------------
// Pass an array of strings, get back an array of translations
// in the same order, using a SINGLE Gemini call instead of one
// call per string. Use this on screens like the consent screen
// that have many labels at once — avoids rate-limit issues.

export async function translateBatch(texts, targetLangCode) {
  const target = targetLangCode.split("-")[0];

  if (target === "en" || !texts || texts.length === 0) {
    return texts;
  }

  // Check cache first; only send uncached strings to Gemini
  const uncachedIndices = [];
  const result = texts.map((t, i) => {
    const key = `${target}:${t}`;
    if (cache[key]) return cache[key];
    uncachedIndices.push(i);
    return null;
  });

  if (uncachedIndices.length === 0) {
    return result;
  }

  const toTranslate = uncachedIndices.map((i) => texts[i]);

  try {
    const prompt =
      `Translate each of the following ${toTranslate.length} lines from English to ${langName(
        target
      )}.\n` +
      `Return ONLY a JSON array of strings, same order, same length, no explanation.\n\n` +
      toTranslate.map((t, i) => `${i + 1}. ${t}`).join("\n");

    const data = await callGeminiWithRetry({
      contents: [{ parts: [{ text: prompt }] }],
    });

    let raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    // Strip markdown code fences if Gemini adds them
    raw = raw.replace(/```json|```/g, "").trim();

    const translatedArr = JSON.parse(raw);

    if (!Array.isArray(translatedArr) || translatedArr.length !== toTranslate.length) {
      throw new Error("Gemini batch returned mismatched array");
    }

    uncachedIndices.forEach((origIndex, j) => {
      const translated = translatedArr[j];
      const key = `${target}:${texts[origIndex]}`;
      cache[key] = translated;
      result[origIndex] = translated;
    });

    return result;
  } catch (error) {
    console.warn("⚠️ Gemini batch translation failed:", error.message);
    // Fill remaining nulls with original text
    uncachedIndices.forEach((origIndex) => {
      result[origIndex] = texts[origIndex];
    });
    return result;
  }
}
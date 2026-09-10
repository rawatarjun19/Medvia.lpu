import { bhashiniTranslate } from "./bhasiniService";

const cache = {};

async function tryMyMemory(text, targetLangCode) {
  const response = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLangCode}&de=test@example.com`
  );
  const data = await response.json();
  if (!data.responseData || !data.responseData.translatedText) {
    throw new Error("MyMemory gave no result");
  }
  return data.responseData.translatedText;
}

async function tryGoogleFallback(text, targetLangCode) {
  const response = await fetch(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLangCode}&dt=t&q=${encodeURIComponent(text)}`
  );
  const data = await response.json();
  return data[0].map((part) => part[0]).join("");
}

export async function translateText(text, targetLangCode) {
  if (targetLangCode === "en") return text;

  const cacheKey = `${targetLangCode}:${text}`;
  if (cache[cacheKey]) return cache[cacheKey];

  // 1st try: Bhashini (asli, sabse accurate Indian languages ke liye)
  try {
    const translated = await bhashiniTranslate(text, "en", targetLangCode);
    cache[cacheKey] = translated;
    return translated;
  } catch (err) {
    console.warn("Bhashini failed, trying MyMemory:", err.message);
  }

  // 2nd try: MyMemory
  try {
    const translated = await tryMyMemory(text, targetLangCode);
    cache[cacheKey] = translated;
    return translated;
  } catch (err) {
    console.warn("MyMemory failed, trying Google fallback:", err.message);
  }

  // 3rd try: Google
  try {
    const translated = await tryGoogleFallback(text, targetLangCode);
    cache[cacheKey] = translated;
    return translated;
  } catch (err) {
    console.error("All translation APIs failed:", err.message);
    return text;
  }
}

export async function translateToEnglish(text, sourceLangCode) {
  if (sourceLangCode === "en") return text;

  try {
    return await bhashiniTranslate(text, sourceLangCode, "en");
  } catch (err) {
    console.warn("Bhashini reverse failed, trying MyMemory:", err.message);
  }

  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLangCode}|en&de=test@example.com`
    );
    const data = await response.json();
    return data.responseData.translatedText;
  } catch (err) {
    console.warn("MyMemory reverse failed, trying Google:", err.message);
  }

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLangCode}&tl=en&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await response.json();
    return data[0].map((part) => part[0]).join("");
  } catch (err) {
    console.error("All reverse translation APIs failed:", err.message);
    return text;
  }
}
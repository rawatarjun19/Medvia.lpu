import speechLangMap from "./speechLangMap";
import { translateText } from "./translateApi";

// Module-level (not component-level) guard: survives even if the
// calling component unmounts/remounts repeatedly. If the exact same
// text+language is requested again within this window, we skip it —
// this stops duplicate/overlapping speech and the resulting
// "interrupted" errors at the source.
let lastSpokenKey = null;
let lastSpokenAt = 0;
const DEDUPE_WINDOW_MS = 4000;

function speakWithBrowser(text, langCode) {
  window.speechSynthesis.cancel();

  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    const targetLangCode = speechLangMap[langCode] || "en-IN";

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang === targetLangCode);

    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = targetLangCode;
    } else {
      console.warn(
        `No matching voice found for ${targetLangCode}, falling back to en-IN`
      );
      utterance.lang = "en-IN";
    }

    utterance.rate = 0.9;

    utterance.onstart = () => console.log("🔊 Speech started:", text);
    utterance.onerror = (e) => console.error("🔇 Speech error:", e.error);
    utterance.onend = () => console.log("✅ Speech finished");

    window.speechSynthesis.speak(utterance);
  }, 150);
}

export async function speak(text, langCode) {
  const key = `${langCode}:${text}`;
  const now = Date.now();

  if (key === lastSpokenKey && now - lastSpokenAt < DEDUPE_WINDOW_MS) {
    console.log("⏭️ Skipping duplicate speak() call:", key);
    return;
  }

  lastSpokenKey = key;
  lastSpokenAt = now;

  const translated = await translateText(text, langCode);
  speakWithBrowser(translated, langCode);
}
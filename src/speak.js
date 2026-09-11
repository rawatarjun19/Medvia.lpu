import speechLangMap from "./speechLangMap";
import { translateText } from "./translateApi";
import { bhashiniTTS } from "./bhasiniService";

let currentAudio = null;

async function speakWithBhashini(text, langCode) {
  const audioBase64 = await bhashiniTTS(text, langCode);

  if (currentAudio) {
    currentAudio.pause();
  }

  const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
  currentAudio = audio;
  await audio.play();
}

function speakWithBrowser(text, langCode) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);

  const targetLangCode = speechLangMap[langCode] || "en-IN";
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => v.lang === targetLangCode);

  if (matchedVoice) {
    utterance.voice = matchedVoice;
    utterance.lang = targetLangCode;
  } else {
    utterance.lang = "en-IN";
  }

  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export async function speak(text, langCode) {
  const translated = await translateText(text, langCode);

  try {
    await speakWithBhashini(translated, langCode);
  } catch (err) {
    console.warn("Bhashini TTS failed, falling back to browser voice:", err.message);
    speakWithBrowser(translated, langCode);
  }
}
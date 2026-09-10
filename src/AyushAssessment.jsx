import React, { useState, useEffect } from "react";
import { AYUSH_SECTIONS, calculateDosha } from "./ayushQuestions";
import { translateBhasini } from "./bhasiniService";

const getSafeText = (textItem, currentLang) => {
  if (!textItem) return "";
  if (typeof textItem === "string") return textItem;
  const langCode = currentLang ? currentLang.split("-")[0] : "en";
  return textItem[langCode] || textItem.en || "";
};

const UI_TEXT = {
  questionOf: { en: "Question", hi: "प्रश्न" },
  touch: { en: "🖐 Touch", hi: "🖐 स्पर्श" },
  voice: { en: "🎙 Voice", hi: "🎙 आवाज" },
  listening: { en: "Listening... Speak your option", hi: "सुन रहे हैं... अपना विकल्प बोलें" },
  tapMic: { en: "Tap mic and speak your answer", hi: "माइक दबाएं और अपना उत्तर बोलें" },
  heard: { en: "Heard:", hi: "सुना गया:" },
  notSupported: { en: "Voice recognition is not supported in this browser.", hi: "इस ब्राउज़र में वॉयस सपोर्ट उपलब्ध नहीं है।" }
};

export default function AyushAssessment({ lang = "en", onComplete }) {
  const allQuestions = AYUSH_SECTIONS.flatMap((sec) => sec.questions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [inputMode, setInputMode] = useState("touch");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const currentQuestion = allQuestions[currentIndex];

  const [translatedQuestion, setTranslatedQuestion] = useState(getSafeText(currentQuestion.text, lang));
  const [translatedOptions, setTranslatedOptions] = useState(
    currentQuestion.options.map(opt => ({ ...opt, translatedLabel: getSafeText(opt.label, lang) }))
  );
  
  const [uiLabels, setUiLabels] = useState({
    questionOf: getSafeText(UI_TEXT.questionOf, lang),
    touch: getSafeText(UI_TEXT.touch, lang),
    voice: getSafeText(UI_TEXT.voice, lang),
    listening: getSafeText(UI_TEXT.listening, lang),
    tapMic: getSafeText(UI_TEXT.tapMic, lang),
    heard: getSafeText(UI_TEXT.heard, lang),
    notSupported: getSafeText(UI_TEXT.notSupported, lang)
  });

  useEffect(() => {
    let isMounted = true;
    async function prepareContent() {
      const langCode = lang.split("-")[0];
      if (langCode === "en") {
        setTranslatedQuestion(getSafeText(currentQuestion.text, lang));
        setTranslatedOptions(currentQuestion.options.map(opt => ({ ...opt, translatedLabel: getSafeText(opt.label, lang) })));
        return;
      }

      try {
        const qTextBase = getSafeText(currentQuestion.text, lang);
        const translatedQ = await translateBhasini(qTextBase, "en", lang);
        
        const translatedOpts = await Promise.all(
          currentQuestion.options.map(async (opt) => {
            const rawLabel = getSafeText(opt.label, lang);
            const translatedLabel = await translateBhasini(rawLabel, "en", lang);
            return { ...opt, translatedLabel };
          })
        );

        if (isMounted) {
          setTranslatedQuestion(translatedQ);
          setTranslatedOptions(translatedOpts);
        }
      } catch (e) {
        console.error("Translation background error:", e);
      }
    }

    setTranslatedQuestion(getSafeText(currentQuestion.text, lang));
    setTranslatedOptions(currentQuestion.options.map(opt => ({ ...opt, translatedLabel: getSafeText(opt.label, lang) })));
    setTranscript("");
    
    prepareContent();

    return () => {
      isMounted = false;
    };
  }, [currentIndex, lang]);

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang.startsWith("hi") ? "hi-IN" : "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(uiLabels.notSupported);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang.startsWith("hi") ? "hi-IN" : "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setTranscript(speechToText);
      matchVoiceOption(speechToText);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const matchVoiceOption = (text) => {
    const lowerText = text.toLowerCase();
    const matched = translatedOptions.find((opt) => {
      const label = opt.translatedLabel.toLowerCase();
      return (
        lowerText.includes(opt.dosha) ||
        lowerText.includes(label) ||
        (lowerText.includes("a") || lowerText.includes("1") || lowerText.includes("पहला") ? opt.dosha === "vata" : false) ||
        (lowerText.includes("b") || lowerText.includes("2") || lowerText.includes("दूसरा") ? opt.dosha === "pitta" : false) ||
        (lowerText.includes("c") || lowerText.includes("3") || lowerText.includes("तीसरा") ? opt.dosha === "kapha" : false)
      );
    });

    if (matched) {
      handleSelectOption(matched.dosha);
    }
  };

  const handleSelectOption = (dosha) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    const updatedAnswers = { ...answers, [currentQuestion.id]: dosha };
    setAnswers(updatedAnswers);

    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const result = calculateDosha(updatedAnswers);
      if (onComplete) {
        onComplete({ answers: updatedAnswers, ...result });
      }
    }
  };

  return (
    <div className="shell centered">
      <div className="card wide" style={{ maxWidth: "600px" }}>
        <div style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "16px", textAlign: "center" }}>
          {uiLabels.questionOf} {currentIndex + 1} / {allQuestions.length}
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div className="tabs" style={{ display: "inline-flex", marginBottom: 0 }}>
            <button className={`tab ${inputMode === "touch" ? "active" : ""}`} onClick={() => setInputMode("touch")}>
              {uiLabels.touch}
            </button>
            <button className={`tab ${inputMode === "voice" ? "active" : ""}`} onClick={() => setInputMode("voice")}>
              {uiLabels.voice}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "24px", textAlign: "center" }}>
          <h2 style={{ color: "var(--ink)", fontSize: "1.3rem", fontWeight: "600", margin: 0 }}>
            {translatedQuestion}
          </h2>
          <button className="ghost" onClick={() => speakText(translatedQuestion)} style={{ borderRadius: "50%", width: "36px", height: "36px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            🔊
          </button>
        </div>

        {inputMode === "touch" ? (
          <div className="stack">
            {translatedOptions.map((opt, idx) => (
              <button key={idx} className="ghost" onClick={() => handleSelectOption(opt.dosha)} style={{ width: "100%", padding: "14px 18px", textAlign: "left", borderColor: "var(--accent)", color: "var(--accent)", fontWeight: "500", borderRadius: "8px" }}>
                {opt.translatedLabel}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <button onClick={startVoiceInput} style={{ width: "70px", height: "70px", borderRadius: "50%", backgroundColor: isListening ? "var(--error)" : "var(--accent)", color: "var(--accent-ink)", border: "none", fontSize: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              🎙
            </button>
            <p className="muted" style={{ textAlign: "center" }}>{isListening ? uiLabels.listening : uiLabels.tapMic}</p>
            {transcript && (
              <div style={{ padding: "12px", backgroundColor: "var(--bg)", borderRadius: "8px", border: "1px solid var(--border)", width: "100%" }}>
                <strong>{uiLabels.heard}</strong> "{transcript}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
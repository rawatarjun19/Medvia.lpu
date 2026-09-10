import { useState, useEffect } from "react";
import questionBank from "./questions";
import AutoText from "./AutoText";
import VoiceInput from "./VoiceInput";
import SpeakButton from "./SpeakButton";
import { speak } from "./speak";
import { matchVoiceAnswer } from "./answerMatcher";

function QuestionEngine({ lang, complaintId, onFinish }) {
  const questions =
    complaintId === "other"
      ? questionBank.other
      : [...questionBank[complaintId], ...questionBank.general];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [textInput, setTextInput] = useState("");
  const [mode, setMode] = useState("touch");

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    speak(currentQuestion.text.en, lang);
  }, [currentIndex, lang]);

  function saveAnswerAndNext(value) {
    const updatedAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(updatedAnswers);
    setTextInput("");

    if (currentIndex === questions.length - 1) {
      onFinish(updatedAnswers);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  async function handleVoiceConfirm(transcript) {
    const matched = await matchVoiceAnswer(transcript, lang, currentQuestion.type, currentQuestion);
    saveAnswerAndNext(matched);
  }

  return (
    <div 
      style={{ 
        minHeight: "100vh", 
        width: "100%", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "20px"
      }} 
      className="bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem]"
    >
      {/* Centralized Card Container */}
      <div 
        style={{ 
          width: "100%", 
          maxWidth: "600px", 
          backgroundColor: "#ffffff", 
          borderRadius: "24px", 
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          border: "2px solid rgba(6, 78, 59, 0.2)",
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        
        {/* Progress Counter */}
        <div style={{ width: "100%", marginBottom: "16px", textAlign: "left" }}>
          <span style={{ fontSize: "14px", fontWeight: "700", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }}>
            Question {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Mode Toggle Switch */}
        <div style={{ backgroundColor: "#f3f4f6", padding: "6px", borderRadius: "9999px", display: "flex", gap: "4px", border: "1px solid #e5e7eb", marginBottom: "24px" }}>
          <button
            style={{
              padding: "8px 24px",
              borderRadius: "9999px",
              fontSize: "14px",
              fontWeight: mode === "touch" ? "600" : "500",
              backgroundColor: mode === "touch" ? "#ffffff" : "transparent",
              color: mode === "touch" ? "#064e3b" : "#4b5563",
              boxShadow: mode === "touch" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              border: mode === "touch" ? "1px solid rgba(6, 78, 59, 0.2)" : "none",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onClick={() => setMode("touch")}
          >
            ✋ Touch
          </button>
          <button
            style={{
              padding: "8px 24px",
              borderRadius: "9999px",
              fontSize: "14px",
              fontWeight: mode === "voice" ? "600" : "500",
              backgroundColor: mode === "voice" ? "#ffffff" : "transparent",
              color: mode === "voice" ? "#064e3b" : "#4b5563",
              boxShadow: mode === "voice" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              border: mode === "voice" ? "1px solid rgba(6, 78, 59, 0.2)" : "none",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onClick={() => setMode("voice")}
          >
            🎤 Voice
          </button>
        </div>

        {/* Question Text Box with Speaker */}
        <div style={{ width: "100%", textAlign: "center", marginBottom: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", lineHeight: "1.4" }}>
            <AutoText text={currentQuestion.text.en} langCode={lang} />
          </h2>
          <div>
            <SpeakButton text={currentQuestion.text.en} lang={lang} />
          </div>
        </div>

        {/* Voice Input Mode */}
        {mode === "voice" && (
          <div style={{ width: "100%", marginBottom: "24px", display: "flex", justifyContent: "center" }}>
            <VoiceInput lang={lang} onConfirm={handleVoiceConfirm} />
          </div>
        )}

        {/* Touch Mode: Yes/No Options */}
        {mode === "touch" && currentQuestion.type === "yesno" && (
          <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <button
              style={{
                width: "100%",
                padding: "16px 20px",
                backgroundColor: "#ffffff",
                color: "#064e3b",
                fontWeight: "600",
                fontSize: "18px",
                borderRadius: "16px",
                border: "2px solid rgba(6, 78, 59, 0.25)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "all 0.2s"
              }}
              onClick={() => saveAnswerAndNext("yes")}
            >
              <span><AutoText text="Yes" langCode={lang} /></span>
              <span style={{ color: "#047857", fontWeight: "bold" }}>→</span>
            </button>
            <button
              style={{
                width: "100%",
                padding: "16px 20px",
                backgroundColor: "#ffffff",
                color: "#064e3b",
                fontWeight: "600",
                fontSize: "18px",
                borderRadius: "16px",
                border: "2px solid rgba(6, 78, 59, 0.25)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "all 0.2s"
              }}
              onClick={() => saveAnswerAndNext("no")}
            >
              <span><AutoText text="No" langCode={lang} /></span>
              <span style={{ color: "#047857", fontWeight: "bold" }}>→</span>
            </button>
          </div>
        )}

        {/* Touch Mode: MCQ Options */}
        {mode === "touch" && currentQuestion.type === "mcq" && (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
            {currentQuestion.options.en.map((opt, index) => {
              const prefix = String.fromCharCode(97 + index) + ") ";
              const displayText = opt.startsWith("a)") || opt.startsWith("b)") || opt.startsWith("c)") || opt.startsWith("d)") ? opt : prefix + opt;

              return (
                <button
                  key={opt}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "16px 20px",
                    backgroundColor: "#ffffff",
                    color: "#064e3b",
                    fontWeight: "500",
                    fontSize: "16px",
                    borderRadius: "16px",
                    border: "2px solid rgba(6, 78, 59, 0.25)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.2s"
                  }}
                  onClick={() => saveAnswerAndNext(opt)}
                >
                  <span><AutoText text={displayText} langCode={lang} /></span>
                  <span style={{ color: "#047857", fontWeight: "bold" }}>→</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Touch Mode: Text Input */}
        {mode === "touch" && currentQuestion.type === "text" && (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
            <textarea
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "16px",
                border: "2px solid rgba(6, 78, 59, 0.25)",
                outline: "none",
                backgroundColor: "#ffffff",
                color: "#1f2937",
                fontSize: "16px",
                resize: "none"
              }}
              rows={4}
              placeholder="Type your answer here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            <button
              style={{
                width: "100%",
                padding: "16px",
                backgroundColor: "#064e3b",
                color: "#ffffff",
                fontWeight: "600",
                fontSize: "18px",
                borderRadius: "16px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
              onClick={() => saveAnswerAndNext(textInput)}
            >
              <AutoText text="Continue" langCode={lang} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default QuestionEngine;
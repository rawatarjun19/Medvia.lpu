import { useState, useRef } from "react";
import speechLangMap from "./speechLangMap";
import "./VoiceInput.css";

function VoiceInput({ lang, onConfirm }) {
  const [status, setStatus] = useState("idle"); // idle | listening | processing | confirm | error
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus("error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = speechLangMap[lang] || "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setStatus("listening");

    recognition.onresult = (event) => {
      setStatus("processing");
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setStatus("confirm");
    };

    recognition.onerror = () => setStatus("error");
    recognition.onend = () => {
      setStatus((prev) => (prev === "listening" ? "idle" : prev));
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function retry() {
    setTranscript("");
    setStatus("idle");
  }

  function confirm() {
    onConfirm(transcript);
    setTranscript("");
    setStatus("idle");
  }

  return (
    <div className="voice-input">
      {status === "idle" && (
        <button className="mic-button" onClick={startListening}>🎤</button>
      )}

      {status === "listening" && (
        <div className="voice-status listening">🎙️ Sun raha hoon...</div>
      )}

      {status === "processing" && (
        <div className="voice-status">Samajh raha hoon...</div>
      )}

      {status === "confirm" && (
        <div className="voice-confirm">
          <p className="voice-transcript">"{transcript}"</p>
          <div className="voice-confirm-buttons">
            <button className="option-button" onClick={confirm}>✓ Sahi hai</button>
            <button className="option-button skip" onClick={retry}>↻ Dobara bolo</button>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="voice-status error">
          Voice yahan kaam nahi kar raha. Touch mode use karo.
          <br />
          <button className="option-button" onClick={retry} style={{ marginTop: "10px" }}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

export default VoiceInput;
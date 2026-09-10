import { useState } from "react";
import languages from "./languages";
import "./LanguageSelect.css";

const mainLanguages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी (Hindi)" },
];

function LanguageSelect({ onSelect }) {
  const [selected, setSelected] = useState(null);
  const [showOthers, setShowOthers] = useState(false);

  function handleClick(lang) {
    setSelected(lang.code);
    onSelect(lang.code);
  }

  // "Other" list mein English aur Hindi dobara mat dikhao
  const otherLanguages = languages.filter(
    (lang) => lang.code !== "en" && lang.code !== "hi"
  );

  return (
    <div className="lang-container">
      <h1 className="lang-heading">
        Please choose your language
        <br />
        अपनी भाषा चुनिए
      </h1>

      {!showOthers && (
        <>
          {mainLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleClick(lang)}
              className={`lang-button ${selected === lang.code ? "selected" : ""}`}
            >
              {selected === lang.code && "✓"} {lang.label}
            </button>
          ))}
          <button
            className="lang-button"
            onClick={() => setShowOthers(true)}
          >
            Other / अन्य भाषाएं
          </button>
        </>
      )}

      {showOthers && (
        <div style={{ maxHeight: "55vh", overflowY: "auto", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <button className="lang-button" onClick={() => setShowOthers(false)} style={{ borderStyle: "dashed" }}>
            ← Back
          </button>
          {otherLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleClick(lang)}
              className={`lang-button ${selected === lang.code ? "selected" : ""}`}
            >
              {selected === lang.code && "✓"} {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSelect;
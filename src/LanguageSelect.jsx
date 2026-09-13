import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import languages from "./languages";

export default function LanguageSelect({ onSelect }) {
  const { t } = useTranslation();
  const [showOthers, setShowOthers] = useState(false);

  const mainLanguages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिंदी (Hindi)" },
  ];

  const otherLanguages = languages.filter(
    (lang) => lang.code !== "en" && lang.code !== "hi"
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "20px", background: "#f8f9fa" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "30px", color: "#333", textAlign: "center" }}>
        Please choose your language <br />
        <span style={{ fontSize: "1.5rem", fontWeight: "normal" }}>अपनी भाषा चुनिए</span>
      </h1>

      {!showOthers && (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px", width: "100%", maxWidth: "400px" }}>
          {mainLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              style={{
                padding: "16px 20px",
                fontSize: "1.1rem",
                fontWeight: "500",
                borderRadius: "30px",
                border: "2px solid #0B3B60",
                background: "#ffffff",
                color: "#0B3B60",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#0B3B60";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.color = "#0B3B60";
              }}
            >
              {lang.label}
            </button>
          ))}

          <button
            onClick={() => setShowOthers(true)}
            style={{
              padding: "16px 20px",
              fontSize: "1.1rem",
              fontWeight: "500",
              borderRadius: "30px",
              border: "2px dashed #0B3B60",
              background: "#ffffff",
              color: "#0B3B60",
              cursor: "pointer",
            }}
          >
            Other / अन्य भाषाएं
          </button>
        </div>
      )}

      {showOthers && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "400px", maxHeight: "55vh", overflowY: "auto" }}>
          <button
            onClick={() => setShowOthers(false)}
            style={{
              padding: "14px 20px",
              fontSize: "1rem",
              borderRadius: "30px",
              border: "2px dashed #0B3B60",
              background: "#ffffff",
              color: "#0B3B60",
              cursor: "pointer",
            }}
          >
            ← Back
          </button>

          {otherLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              style={{
                padding: "16px 20px",
                fontSize: "1.1rem",
                fontWeight: "500",
                borderRadius: "30px",
                border: "2px solid #0B3B60",
                background: "#ffffff",
                color: "#0B3B60",
                cursor: "pointer",
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
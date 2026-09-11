import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "./supabaseClient";
import "./ConsentScreen.css";

function ConsentScreen({ onComplete }) {
  const { t } = useTranslation();
  const [abhaId, setAbhaId] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  function handleAbhaChange(e) {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 14);
    setAbhaId(digitsOnly);
    setError("");
  }

  async function handleContinue() {
    if (abhaId.length !== 14) {
      setError(t("errorAbha"));
      return;
    }
    if (!agreed) {
      setError(t("errorConsent"));
      return;
    }

    try {
      const { data, error: dbError } = await supabase
        .from("patients")
        .insert([{ abha_id: abhaId }])
        .select();

      if (dbError) throw dbError;

      const tokenNumber = data[0].token_number;
      const patientId = data[0].id;
      onComplete(tokenNumber, patientId);
    } catch (err) {
      console.error("Token generation failed:", err.message);
      onComplete(null, null);
    }
  }

  return (
    <div className="consent-container">
      <div className="consent-card">
        <div className="consent-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L4 5V11C4 16 7.5 20.5 12 22C16.5 20.5 20 16 20 11V5L12 2Z"
              fill="#2A6F6B"
              opacity="0.15"
            />
            <path
              d="M12 2L4 5V11C4 16 7.5 20.5 12 22C16.5 20.5 20 16 20 11V5L12 2Z"
              stroke="#2A6F6B"
              strokeWidth="1.5"
            />
            <path d="M9 12L11 14L15 10" stroke="#2A6F6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="consent-heading">{t("consentHeading")}</h1>

        <label className="consent-label">
          {t("abhaLabel")}
          <input
            type="text"
            value={abhaId}
            onChange={handleAbhaChange}
            placeholder={t("abhaPlaceholder")}
            className="abha-input"
            inputMode="numeric"
          />
        </label>

        <div className="consent-info">
          <p>{t("infoLine1")}</p>
          <p>{t("infoLine2")}</p>
          <p>{t("infoLine3")}</p>
        </div>

        <label className="consent-checkbox">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          {t("consentCheckbox")}
        </label>

        {error && <p className="consent-error">{error}</p>}

        <button className="consent-button" onClick={handleContinue}>
          {t("continueButton")}
        </button>
      </div>
    </div>
  );
}

export default ConsentScreen;
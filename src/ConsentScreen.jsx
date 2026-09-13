import { useState } from "react";
import { supabase } from "./supabaseClient";
import AutoText from "./AutoText";
import "./ConsentScreen.css";

function ConsentScreen({ lang, onComplete }) {
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
      setError("errorAbha");
      return;
    }
    if (!agreed) {
      setError("errorConsent");
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
      setError("errorGeneric");
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

        <h1 className="consent-heading">
          <AutoText text="Please share your information and consent" langCode={lang} />
        </h1>

        <label className="consent-label">
          <AutoText text="ABHA ID" langCode={lang} />
          <input
            type="text"
            value={abhaId}
            onChange={handleAbhaChange}
            className="abha-input"
            inputMode="numeric"
          />
        </label>

        <div className="consent-info">
          <p><AutoText text="We will only use your health information for treatment." langCode={lang} /></p>
          <p><AutoText text="This information will be kept secure and not shared with third parties." langCode={lang} /></p>
          <p><AutoText text="You can withdraw your consent at any time." langCode={lang} /></p>
        </div>

        <label className="consent-checkbox">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <AutoText text="I agree with the information above" langCode={lang} />
        </label>

        {error === "errorAbha" && (
          <p className="consent-error"><AutoText text="ABHA ID must be 14 digits" langCode={lang} /></p>
        )}
        {error === "errorConsent" && (
          <p className="consent-error"><AutoText text="You must agree to continue" langCode={lang} /></p>
        )}
        {error === "errorGeneric" && (
          <p className="consent-error"><AutoText text="Something went wrong, please try again" langCode={lang} /></p>
        )}

        <button className="consent-button" onClick={handleContinue}>
          <AutoText text="Continue" langCode={lang} />
        </button>
      </div>
    </div>
  );
}

export default ConsentScreen;
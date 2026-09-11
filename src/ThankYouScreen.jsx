import AutoText from "./AutoText";
import "./ThankYouScreen.css";

function ThankYouScreen({ lang, token }) {
  return (
    <div className="thankyou-container">
      <div className="thankyou-card">
        <div className="thankyou-icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#2A6F6B" opacity="0.15" />
            <circle cx="12" cy="12" r="10" stroke="#2A6F6B" strokeWidth="1.5" />
            <path d="M8 12.5L10.5 15L16 9" stroke="#2A6F6B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="thankyou-heading">
          <AutoText text="Thank you" langCode={lang} />
        </h1>
        <p className="thankyou-subtext">
          <AutoText text="Your responses have been recorded. Please wait, a staff member will assist you shortly." langCode={lang} />
        </p>

        {token && (
          <div className="thankyou-token">
            <p className="thankyou-token-label">
              <AutoText text="Your token number" langCode={lang} />
            </p>
            <p className="thankyou-token-number">#{token}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ThankYouScreen;
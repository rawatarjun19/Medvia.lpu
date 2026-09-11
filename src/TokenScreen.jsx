import AutoText from "./AutoText";
import "./TokenScreen.css";

function TokenScreen({ token, lang, onContinue }) {
  return (
    <div className="token-container">
      <div className="token-card">
        <p className="token-label">
          <AutoText text="Your token number is" langCode={lang} />
        </p>
        <h1 className="token-number">{token ? `#${token}` : "—"}</h1>
        <p className="token-subtext">
          <AutoText text="Please note this down. The receptionist will call you by this number." langCode={lang} />
        </p>
        <button className="token-button" onClick={onContinue}>
          <AutoText text="Continue" langCode={lang} />
        </button>
      </div>
    </div>
  );
}

export default TokenScreen;
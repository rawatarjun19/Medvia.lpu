import { speak } from "./speak";
import "./SpeakButton.css";

function SpeakButton({ text, lang }) {
  return (
    <button
      className="speak-button"
      onClick={() => speak(text, lang)}
      aria-label="Sun ke dobara suniye"
    >
      🔊
    </button>
  );
}

export default SpeakButton;
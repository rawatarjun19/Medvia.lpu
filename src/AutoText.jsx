import { useState, useEffect } from "react";
import { translateText } from "./translateApi";

function AutoText({ text, langCode }) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let cancelled = false;
    translateText(text, langCode).then((translated) => {
      if (!cancelled) setDisplayText(translated);
    });
    return () => {
      cancelled = true;
    };
  }, [text, langCode]);

  return <>{displayText}</>;
}

export default AutoText;
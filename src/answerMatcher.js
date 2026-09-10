import { translateToEnglish } from "./TranslateApi.js";

export async function matchVoiceAnswer(transcript, lang, questionType, currentQuestion) {
  const englishText = (await translateToEnglish(transcript, lang)).toLowerCase();

  if (questionType === "yesno") {
    if (englishText.includes("yes")) return "yes";
    if (englishText.includes("no")) return "no";
    return transcript; // match na ho to patient ke asli shabd hi rakh lo
  }

  if (questionType === "mcq") {
    const match = currentQuestion.options.en.find((opt) =>
      englishText.includes(opt.toLowerCase())
    );
    return match || transcript;
  }

  return transcript; 
}
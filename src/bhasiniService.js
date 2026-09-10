const USER_ID = (import.meta.env.VITE_BHASINI_USER_ID || "").trim();
const API_KEY = (import.meta.env.VITE_BHASINI_API_KEY || "").trim();
const INFERENCE_KEY = (import.meta.env.VITE_BHASINI_API_KEY || "").trim();
const PIPELINE_ID = (import.meta.env.VITE_BHASINI_PIPELINE_ID || "").trim();

export async function bhashiniTranslate(text, sourceLang = "en", targetLang = "hi") {
  if (!text || sourceLang === targetLang) return text;
  const src = sourceLang.split("-")[0];
  const tgt = targetLang.split("-")[0];

  try {
    const configResponse = await fetch(
      "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          userID: USER_ID,
          ulcaApiKey: API_KEY,
        },
        body: JSON.stringify({
          pipelineTasks: [
            { taskType: "translation", config: { language: { sourceLanguage: src, targetLanguage: tgt } } },
          ],
          pipelineRequestConfig: { pipelineId: PIPELINE_ID },
        }),
      }
    );

    if (!configResponse.ok) throw new Error(`Config status ${configResponse.status}`);
    const configData = await configResponse.json();

    const translationService = configData.pipelineResponseConfig[0].config[0];
    const callbackUrl = configData.pipelineInferenceAPIEndPoint.callbackUrl;
    const serviceId = translationService.serviceId;

    const computeResponse = await fetch(callbackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: INFERENCE_KEY },
      body: JSON.stringify({
        pipelineTasks: [
          { taskType: "translation", config: { language: { sourceLanguage: src, targetLanguage: tgt }, serviceId } },
        ],
        inputData: { input: [{ source: text }] },
      }),
    });

    if (!computeResponse.ok) throw new Error(`Compute status ${computeResponse.status}`);
    const computeData = await computeResponse.json();
    return computeData?.pipelineResponse?.[0]?.output?.[0]?.target || (await fallbackGoogleTranslate(text, tgt));
  } catch (error) {
    console.warn("Bhashini failed, using fallback:", error.message);
    return await fallbackGoogleTranslate(text, tgt);
  }
}

// alias — kuch files isi naam se import karti hain
export const translateBhasini = bhashiniTranslate;

export async function bhashiniTTS(text, lang = "hi") {
  if (!text) return;
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang.startsWith("hi") ? "hi-IN" : lang.startsWith("en") ? "en-IN" : `${lang}-IN`;
    window.speechSynthesis.speak(utterance);
  }
}

async function fallbackGoogleTranslate(text, targetLang) {
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await res.json();
    return data[0].map((item) => item[0]).join("");
  } catch (e) {
    return text;
  }
}
const DEFAULT_MODEL = "gemini-2.5-flash";
const MAX_AUDIO_BASE64_LENGTH = 10 * 1024 * 1024;

async function transcribe({ audioBase64, mimeType = "audio/webm", language = "en-IN" }) {
    if (!audioBase64) throw new Error("audioBase64 is required");
    if (typeof audioBase64 !== "string" || audioBase64.length > MAX_AUDIO_BASE64_LENGTH) {
        throw new Error("Audio recording is invalid or too large");
    }
    if (!/^audio\/[a-z0-9.+-]+$/i.test(mimeType)) throw new Error("Unsupported audio format");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Speech transcription is not configured");

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || DEFAULT_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [
                        { text: `Transcribe this audio exactly. The expected spoken language is ${language}. Return only the transcription, without labels, explanations, or medical advice.` },
                        { inlineData: { mimeType, data: audioBase64 } }
                    ]
                }],
                generationConfig: { temperature: 0, maxOutputTokens: 300 }
            })
        }
    );

    if (!response.ok) throw new Error(`Speech provider returned ${response.status}`);
    const payload = await response.json();
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
    if (!text) throw new Error("Speech provider returned an empty transcription");
    return { provider: process.env.GEMINI_MODEL || DEFAULT_MODEL, text };
}

async function synthesize({ text, language }) {
    if (!text) throw new Error("text is required");
    return { provider: "browser-fallback", audioBase64: null, fallback: "Use browser speechSynthesis." };
}

module.exports = { transcribe, synthesize };

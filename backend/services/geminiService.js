const DEFAULT_MODEL = "gemini-2.5-flash";

const LANGUAGE_NAMES = {
    en: "English",
    hi: "Hindi",
    bn: "Bengali",
    te: "Telugu",
    mr: "Marathi",
    ta: "Tamil",
    gu: "Gujarati",
    ur: "Urdu",
    kn: "Kannada",
    or: "Odia",
    pa: "Punjabi",
    ml: "Malayalam",
    as: "Assamese",
    ne: "Nepali"
};

function languageInstruction(language) {
    const selectedLanguage = LANGUAGE_NAMES[language] || "English";
    return `LANGUAGE RULE: The patient's selected language is ${selectedLanguage}. Reply entirely in ${selectedLanguage} by default. If the latest patient message is clearly written in a different language or script, reply entirely in that same language and script instead. Do not mix languages, except for unavoidable medicine brand names. Match the patient's simple wording level.`;
}

function localPatientReply(message, patients) {
    if (!Array.isArray(patients) || !patients.length) return null;
    const normalizedMessage = message.toLowerCase();
    const requestedPatient = patients.find((patient) => {
        return [patient.Name, patient.Phone_Number, patient.ABHA_ID]
            .filter(Boolean)
            .some((value) => normalizedMessage.includes(String(value).toLowerCase()));
    });
    if (!requestedPatient || !/(detail|profile|history|record|information|info)/i.test(message)) return null;

    const profile = [
        `Patient Profile: ${requestedPatient.Name || "Unknown"}`,
        `ID: ${requestedPatient.id || "Not available"}`,
        `Name: ${requestedPatient.Name || "Not available"}`,
        `Gender: ${requestedPatient.Gender || "Not available"}`,
        `Age: ${requestedPatient.Age ?? "Not available"}`,
        `Email: ${requestedPatient.Email || "Not available"}`,
        `Date of Birth (DOB): ${requestedPatient.DOB || "Not available"}`,
        `Phone Number: ${requestedPatient.Phone_Number || "Not available"}`,
        `Blood Group: ${requestedPatient.Blood_Group || "Not available"}`,
        `Allergies: ${requestedPatient.Allergies || "Not available"}`,
        `Emergency Contact: ${requestedPatient.Emergency_contact || "Not available"}`,
        `ABHA ID: ${requestedPatient.ABHA_ID || "Not available"}`,
    ];
    const records = Array.isArray(requestedPatient.history) ? requestedPatient.history : [];
    if (!records.length) profile.push("History: No history entries available.");
    else {
        profile.push("History:");
        records.forEach((entry) => {
            profile.push(`- ${entry.Visit_Date || "Unknown date"}: ${entry.Diagnosis || "No diagnosis recorded"}${entry.Symptoms ? `; Symptoms: ${entry.Symptoms}` : ""}${entry.Treatment ? `; Treatment: ${entry.Treatment}` : ""}`);
        });
    }
    return profile.join("\n");
}

function localPatientFallback(message) {
    const normalizedMessage = message.toLowerCase();
    if (/(medicine|medication|tablet|drug|dose|दवा|गोली)/i.test(normalizedMessage)) {
        return "I cannot safely recommend a medicine or dosage without a clinician reviewing your symptoms, allergies, current medicines, age, and medical history. Please speak with a qualified doctor or pharmacist. If this is an emergency, seek immediate medical care.";
    }
    if (/^(hi|hello|hey|namaste|नमस्ते)\b/i.test(normalizedMessage.trim())) {
        return "Hello. I can help collect your symptoms. What are you feeling, when did it start, and how severe is it?";
    }
    return "I can help collect your symptoms, but the AI service is temporarily unavailable. Please tell me what you are feeling, when it started, and how severe it is. A clinician should review any medical decision.";
}

const TAP_ASSISTANT_PROMPT = `You are Medvia's tap-to-answer assistant for patients who cannot type.
Generate exactly ONE next multiple-choice question to understand the patient's problem.
Reply exclusively in the language determined by the language rule supplied with this request.
Return only valid JSON matching the supplied schema; do not add markdown or commentary.
The question must be under 12 words. Return exactly four options, each no more than 3–4 short words.
For an empty history, ask a broad question about what troubles the patient today, with translated choices equivalent to Fever, Cough, Pain, and Something else.
For later turns, use the conversation history and chosen option to narrow the question. Do not ask a question already answered.
The fourth and final option must always be a translated catch-all equivalent to "Something else". Never use "None of the above".
When the history indicates chest pain, breathing difficulty, severe bleeding, unconsciousness, or stroke-like signs, set urgent to true and ask a short question confirming severity. Include suitable severity choices such as mild, severe, or cannot breathe.
Never diagnose, prescribe, or give medical advice; only ask the next clarifying question.`;

const TAP_FALLBACKS = {
    en: { question: "How are your symptoms now?", options: ["Mild", "Moderate", "Severe", "Something else"], urgent: false },
    hi: { question: "अभी आपके लक्षण कैसे हैं?", options: ["हल्के", "मध्यम", "गंभीर", "कुछ और"], urgent: false },
    bn: { question: "এখন আপনার উপসর্গ কেমন?", options: ["হালকা", "মাঝারি", "গুরুতর", "অন্য কিছু"], urgent: false },
    mr: { question: "आता तुमची लक्षणे कशी आहेत?", options: ["सौम्य", "मध्यम", "गंभीर", "काहीतरी वेगळे"], urgent: false },
    ta: { question: "இப்போது அறிகுறிகள் எப்படி உள்ளன?", options: ["லேசானது", "மிதமானது", "கடுமையானது", "வேறு ஒன்று"], urgent: false },
    te: { question: "ఇప్పుడు మీ లక్షణాలు ఎలా ఉన్నాయి?", options: ["తేలిక", "మధ్యస్థం", "తీవ్రం", "మరేదైనా"], urgent: false }
};

function validateTapQuestion(value) {
    if (!value || typeof value.question !== "string" || !value.question.trim()) return null;
    if (!Array.isArray(value.options) || value.options.length !== 4) return null;
    if (value.options.some((option) => typeof option !== "string" || !option.trim())) return null;
    if (typeof value.urgent !== "boolean") return null;
    const question = value.question.trim();
    const options = value.options.map((option) => option.trim());
    if (question.split(/\s+/).length >= 12 || options.some((option) => option.split(/\s+/).length > 4)) return null;
    return {
        question,
        options,
        urgent: value.urgent
    };
}

function tapFallback(language, history) {
    const fallback = TAP_FALLBACKS[language] || TAP_FALLBACKS.en;
    const emergencyText = JSON.stringify(history || []).toLowerCase();
    const urgent = /(chest pain|difficulty breathing|can't breathe|severe bleeding|unconscious|stroke|छाती|सांस लेने में दिक्कत|बेहोश)/i.test(emergencyText);
    return { ...fallback, urgent };
}

async function generateTapQuestion({ history = [], language = "en" }) {
    const fallback = tapFallback(language, history);
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { ...fallback, language, model: "local-tap-fallback" };

    let response;
    try {
        response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || DEFAULT_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: `${TAP_ASSISTANT_PROMPT}\n${languageInstruction(language)}` }] },
                    contents: [{ role: "user", parts: [{ text: JSON.stringify({ conversationHistory: history.slice(-12) }) }] }],
                    generationConfig: {
                        temperature: 0.15,
                        maxOutputTokens: 220,
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: "OBJECT",
                            properties: {
                                question: { type: "STRING" },
                                options: { type: "ARRAY", items: { type: "STRING" }, minItems: 4, maxItems: 4 },
                                urgent: { type: "BOOLEAN" }
                            },
                            required: ["question", "options", "urgent"]
                        }
                    }
                })
            }
        );
    } catch {
        return { ...fallback, language, model: "local-tap-fallback" };
    }

    if (!response.ok) return { ...fallback, language, model: "local-tap-fallback" };
    const payload = await response.json();
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
    try {
        const result = validateTapQuestion(JSON.parse(text));
        return result
            ? { ...result, language, model: process.env.GEMINI_MODEL || DEFAULT_MODEL }
            : { ...fallback, language, model: "local-tap-fallback" };
    } catch {
        return { ...fallback, language, model: "local-tap-fallback" };
    }
}

async function generateReply({ message, history = [], language = "en", mode = "patient", patientContext }) {
    const apiKey = process.env.GEMINI_API_KEY;
    const localReply = mode === "doctor" ? localPatientReply(message, patientContext) : null;
    if (localReply) return { text: localReply, language, model: "local-patient-record" };

    if (!apiKey) {
        if (mode === "patient") return { text: localPatientFallback(message), language, model: "local-safe-fallback" };
        const error = new Error("GEMINI_API_KEY is not configured");
        error.statusCode = 503;
        throw error;
    }

    const contextText = patientContext
        ? `\nPATIENT DATA (use only to answer the user's request; do not invent missing values):\n${JSON.stringify(patientContext).slice(0, 120000)}\n`
        : "";
    const systemText = mode === "doctor"
        ? `You are Medvia AI Assistant for a licensed doctor. Use the supplied patient data to answer questions about patients by name, phone, ABHA ID, or details. Clearly say when data is unavailable. For medicine questions, provide evidence-based general medication information: generic name, common uses, commonly reported side effects, major contraindications and interactions, and when urgent care is needed. Never create a diagnosis, prescription, or personalized dosage; remind the doctor to verify allergies, age, pregnancy status, interactions, renal/hepatic status, and current guidelines. Flag emergencies and urgent red flags. Keep answers clear and structured. ${contextText}`
        : `You are Medvia AI Assistant for a patient. Ask concise follow-up questions and help collect symptoms. Do not diagnose or replace a clinician. When the patient asks for a medicine suggestion, provide evidence-based general information about relevant over-the-counter or prescription options only when appropriate: generic medicine name, what it is commonly used for, important warnings, common side effects, major interactions, and why a doctor or pharmacist must confirm whether it is safe for this patient. Do not prescribe, give patient-specific dosage or duration, recommend antibiotics or controlled medicines, or claim that a medicine is safe without checking allergies, age, pregnancy status, current medicines, and medical history. If symptoms are severe or an emergency is described, advise immediate medical care. ${languageInstruction(language)} ${contextText}`;

    const contents = [
        ...history.map((item) => ({
            role: item.role === "model" ? "model" : "user",
            parts: [{ text: String(item.text || "") }]
        })),
        { role: "user", parts: [{ text: String(message) }] }
    ];

    let response;
    try {
        response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || DEFAULT_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: systemText }]
                    },
                    contents,
                    generationConfig: { temperature: 0.2, maxOutputTokens: 300 }
                })
            }
        );
    } catch (providerError) {
        if (mode === "patient") return { text: localPatientFallback(message), language, model: "local-safe-fallback" };
        throw providerError;
    }

    if (!response.ok) {
        const details = await response.text();
        if (mode === "patient" && response.status === 429) {
            return { text: localPatientFallback(message), language, model: "local-safe-fallback" };
        }
        const error = new Error(`Gemini returned ${response.status}: ${details.slice(0, 300)}`);
        error.statusCode = response.status >= 500 ? 502 : response.status;
        throw error;
    }

    const payload = await response.json();
    const text = payload.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim();

    if (!text) {
        const error = new Error("Gemini returned an empty response");
        error.statusCode = 502;
        throw error;
    }

    return { text, language, model: process.env.GEMINI_MODEL || DEFAULT_MODEL };
}

async function generateStructuredSummary({ complaintId, turns, language = "en" }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        const error = new Error("GEMINI_API_KEY is not configured");
        error.statusCode = 503;
        throw error;
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || DEFAULT_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: "You are a clinical intake summarizer. Use only facts in the supplied turns. Do not diagnose or invent missing information. Return JSON only." }]
                },
                contents: [{ role: "user", parts: [{ text: JSON.stringify({ complaintId, turns, language }) }] }],
                generationConfig: {
                    temperature: 0.1,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            chiefComplaint: { type: "STRING" },
                            hpi: { type: "STRING" },
                            pastHistory: { type: "STRING" },
                            drugsAndAllergies: { type: "STRING" },
                            familyHistory: { type: "STRING" },
                            personalHistory: { type: "STRING" },
                            reviewOfSystems: { type: "STRING" }
                        },
                        required: ["chiefComplaint", "hpi", "pastHistory", "drugsAndAllergies", "familyHistory", "personalHistory", "reviewOfSystems"]
                    }
                }
            })
        }
    );

    if (!response.ok) {
        const error = new Error(`Gemini returned ${response.status}`);
        error.statusCode = response.status >= 500 ? 502 : response.status;
        throw error;
    }

    const payload = await response.json();
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
    if (!text) throw new Error("Gemini returned an empty summary");
    return JSON.parse(text);
}

module.exports = { generateReply, generateStructuredSummary, generateTapQuestion, validateTapQuestion };

const express = require("express");
const { generateReply, generateTapQuestion } = require("../services/geminiService");

const router = express.Router();

router.post("/chat", async (req, res) => {
    const { message, history, language, mode, patientContext } = req.body || {};

    if (mode !== "tap" && (typeof message !== "string" || !message.trim())) {
        return res.status(400).json({ success: false, message: "message is required" });
    }

    try {
        if (mode === "tap") {
            const reply = await generateTapQuestion({
                history: Array.isArray(history) ? history.slice(-12) : [],
                language: typeof language === "string" ? language : "en"
            });
            return res.json({ success: true, ...reply });
        }
        const reply = await generateReply({
            message: message.trim().slice(0, 4000),
            history: Array.isArray(history) ? history.slice(-10) : [],
            language: typeof language === "string" ? language : "en",
            mode: mode === "doctor" ? "doctor" : "patient",
            patientContext
        });
        res.json({ success: true, ...reply });
    } catch (error) {
        const statusCode = error.statusCode || 502;
        const providerMessage = error.message || "";
        res.status(statusCode).json({
            success: false,
            message: providerMessage.includes("API_KEY_INVALID") || statusCode === 400
                ? "Google rejected the Gemini API key. Add a valid Google AI Studio API key to backend/.env and restart the backend."
                : statusCode === 429
                    ? "Gemini quota is exhausted. Please update the Gemini API key or billing quota."
                    : "Gemini request failed",
            error: error.message
        });
    }
});

module.exports = router;

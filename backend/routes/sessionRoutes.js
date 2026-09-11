const express = require("express");
const router = express.Router();

const { createSession, getSession, deleteSession, getSessionEvents } = require("../data/sessions");
const { nextQuestion, buildSummary } = require("../services/dialogueManager");
const { detectRedFlags } = require("../services/redFlagDetector");
const { generateStructuredSummary } = require("../services/geminiService");

function publicSession(session) {
    return { id: session.id, language: session.language, consent: session.consent, complaintId: session.complaintId, status: session.status, redFlags: session.redFlags };
}

// POST /api/session/start
router.post("/start", (req, res) => {
    const session = createSession();
    session.complaintId = req.body?.complaintId || null;
    res.status(201).json({ success: true, session: publicSession(session) });
});

// POST /api/session/:id/language
router.post("/:id/language", (req, res) => {
    const session = getSession(req.params.id);

    if (!session) {
        return res.status(404).json({
            success: false,
            message: "Session not found"
        });
    }

    const { language } = req.body;

    if (!language) {
        return res.status(400).json({
            success: false,
            message: "Language is required"
        });
    }

    session.language = String(language).trim().toLowerCase();

    res.json({
        success: true,
        message: "Language updated successfully",
        language: session.language,
        nextQuestion: nextQuestion(session)
    });
});

// POST /api/session/:id/consent
router.post("/:id/consent", (req, res) => {
    const session = getSession(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    if (req.body?.consent !== true) return res.status(400).json({ success: false, message: "Consent must be true to continue" });
    session.consent = true;
    session.consentedAt = new Date();
    session.complaintId = req.body.complaintId || session.complaintId;
    res.json({ success: true, session: publicSession(session), nextQuestion: nextQuestion(session) });
});

// GET /api/session/:id/questions
router.get("/:id/questions", (req, res) => {
    const session = getSession(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    if (!session.consent) return res.status(403).json({ success: false, message: "Consent is required" });
    const question = nextQuestion(session);
    session.currentQuestion = question?.id || null;
    res.json({ success: true, question, done: !question, summary: question ? undefined : buildSummary(session) });
});

// GET /api/session/:id/events - server-sent events for urgent alerts
router.get("/:id/events", (req, res) => {
    const session = getSession(req.params.id);
    const events = getSessionEvents(req.params.id);
    if (!session || !events) return res.status(404).json({ success: false, message: "Session not found" });
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    res.write(`event: connected\ndata: ${JSON.stringify({ sessionId: session.id })}\n\n`);
    const onAlert = (payload) => res.write(`event: red-flag\ndata: ${JSON.stringify(payload)}\n\n`);
    events.on("red-flag", onAlert);
    req.on("close", () => events.off("red-flag", onAlert));
});

router.post("/:id/summary", async (req, res) => {
    const session = getSession(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    try {
        const summary = await generateStructuredSummary({ complaintId: session.complaintId, turns: session.turns, language: session.language || "en" });
        session.summary = summary;
        session.summaryConfirmed = false;
        res.json({ success: true, summary, confirmationRequired: true });
    } catch (error) {
        res.status(error.statusCode || 502).json({ success: false, message: "Structured summary generation failed", error: error.message });
    }
});

router.post("/:id/summary/confirm", (req, res) => {
    const session = getSession(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    if (!session.summary) return res.status(400).json({ success: false, message: "Generate a summary before confirming it" });
    session.summaryConfirmed = req.body?.confirmed === true;
    res.json({ success: true, summaryConfirmed: session.summaryConfirmed });
});

// DELETE /api/session/:id - explicit privacy cleanup
router.delete("/:id", (req, res) => {
    if (!getSession(req.params.id)) return res.status(404).json({ success: false, message: "Session not found" });
    deleteSession(req.params.id);
    res.status(204).send();
});

module.exports = router;
const express = require("express");
const router = express.Router();
const { getSession, getSessionEvents } = require("../data/sessions");
const { nextQuestion, buildSummary, isExpectedQuestion, extractEntities, isEndIntent } = require("../services/dialogueManager");
const { detectRedFlags } = require("../services/redFlagDetector");

router.get("/questions", (req, res) => {
    const session = getSession(req.query.sessionId);
    if (!session) return res.status(404).json({ success: false, message: "A valid sessionId is required" });
    if (!session.consent) return res.status(403).json({ success: false, message: "Consent is required" });
    if (session.status === "urgent") return res.json({ success: true, urgent: true, done: true, alert: "Please wait. A nurse is being alerted.", summary: buildSummary(session) });
    const question = nextQuestion(session);
    session.currentQuestion = question?.id || null;
    res.json({ success: true, question, done: !question, summary: question ? undefined : buildSummary(session) });
});

router.post("/answers", (req, res) => {
    const { sessionId, questionId, answer } = req.body || {};
    const session = getSession(sessionId);
    if (!session) return res.status(404).json({ success: false, message: "A valid sessionId is required" });
    if (!session.consent) return res.status(403).json({ success: false, message: "Consent is required" });
    if (!questionId || answer === undefined || answer === null) return res.status(400).json({ success: false, message: "questionId and answer are required" });
    if (!isExpectedQuestion(session, questionId)) return res.status(400).json({ success: false, message: "That is not the current question" });
    if (session.answers.some((item) => item.questionId === questionId)) return res.status(409).json({ success: false, message: "Question already answered" });

    const answerText = typeof answer === "string" ? answer.trim().slice(0, 2000) : answer;
    const flags = detectRedFlags(answerText);
    const entities = extractEntities(answerText, flags);
    const turn = { questionId, question: session.currentQuestion || questionId, rawTranscript: answerText, extractedEntities: entities, answeredAt: new Date() };
    session.answers.push({ questionId, answer: answerText, answeredAt: new Date() });
    session.turns.push(turn);
    session.redFlags.push(...flags.filter((flag) => !session.redFlags.some((existing) => existing.id === flag.id)));

    if (flags.length) {
        session.status = "urgent";
        getSessionEvents(session.id)?.emit("red-flag", { sessionId: session.id, urgent: true, redFlags: session.redFlags });
    }
    if (isEndIntent(answerText)) session.status = "complete";
    const question = nextQuestion(session);
    session.currentQuestion = session.status === "active" ? question?.id || null : null;
    res.json({ success: true, urgent: session.redFlags.length > 0, alert: flags.length ? "Please wait. A nurse is being alerted." : undefined, nextQuestion: session.status === "active" ? question : null, summary: session.status === "active" && question ? undefined : buildSummary(session) });
});

module.exports = router;
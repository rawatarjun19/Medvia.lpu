const { questions, localizedQuestion } = require("../data/questions");
const MAX_FOLLOW_UPS = 6;

function isUnknownAnswer(value) {
    return !String(value ?? "").trim() || /^(i\s*don'?t know|don'?t know|unknown|not sure|silence|no response|kuch nahi|pata nahi|पता नहीं|कुछ नहीं|ਕੁਝ ਨਹੀਂ)$/i.test(String(value).trim());
}

function isEndIntent(value) {
    return /\b(that'?s all|nothing else|no more|done|finish)\b|बस इतना|बस|ਹੋਰ ਕੁਝ ਨਹੀਂ/i.test(String(value ?? ""));
}

function extractEntities(answer, flags) {
    const value = String(answer ?? "").trim();
    return {
        redFlags: flags.map((flag) => flag.id),
        unknown: isUnknownAnswer(value),
        endIntent: isEndIntent(value),
        normalizedText: value.toLowerCase()
    };
}

function getQuestionFlow(session) {
    const complaintQuestions = questions[session.complaintId] || questions.other;
    const hasPain = session.complaintId === "pain" || session.answers.some((item) => /pain|दर्द|ਦਰਦ/i.test(String(item.answer)));
    const followUps = hasPain ? questions.socrates.slice(0, MAX_FOLLOW_UPS) : [];
    return session.complaintId === "other" ? complaintQuestions : [...complaintQuestions, ...followUps, questions.general[0]];
}

function nextQuestion(session) {
    const flow = getQuestionFlow(session);
    const answered = new Set(session.answers.map((item) => item.questionId));
    const question = flow.find((item) => !answered.has(item.id));
    return question ? localizedQuestion(question, session.language) : null;
}

function isExpectedQuestion(session, questionId) {
    const flow = getQuestionFlow(session);
    const answered = new Set(session.answers.map((item) => item.questionId));
    return flow.find((item) => item.id === questionId && !answered.has(item.id))?.id === questionId;
}

function buildSummary(session) {
    return {
        sessionId: session.id,
        complaintId: session.complaintId,
        sections: {
            chiefComplaint: session.complaintId,
            hpi: session.answers.filter((item) => /^p|^s/.test(item.questionId)),
            pastHistory: [],
            drugsAndAllergies: [],
            familyHistory: [],
            personalHistory: [],
            reviewOfSystems: []
        },
        turns: session.turns,
        answers: session.answers,
        redFlags: session.redFlags,
        urgent: session.redFlags.length > 0,
        status: session.status,
        message: session.redFlags.length > 0 ? "Please wait. A nurse is being alerted for urgent assessment." : "Your information has been recorded for clinical review."
    };
}

module.exports = { nextQuestion, buildSummary, isExpectedQuestion, extractEntities, isEndIntent, isUnknownAnswer };
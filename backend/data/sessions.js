const crypto = require("crypto");
const EventEmitter = require("events");

const sessions = new Map();
const sessionEvents = new Map();

const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS || 30 * 60 * 1000);

function createSession() {
    const id = crypto.randomUUID();

    const session = {
        id,
        language: null,
        consent: false,
        currentQuestion: null,
        answers: [],
        turns: [],
        redFlags: [],
        status: "active",
        createdAt: new Date(),
        lastActivityAt: new Date()
    };

    sessions.set(id, session);
    sessionEvents.set(id, new EventEmitter());

    return session;
}

function getSession(id) {
    const session = sessions.get(id);

    if (!session) return undefined;

    if (Date.now() - session.lastActivityAt.getTime() > SESSION_TTL_MS) {
        sessions.delete(id);
        return undefined;
    }

    session.lastActivityAt = new Date();
    return session;
}

function deleteSession(id) {
    sessionEvents.delete(id);
    return sessions.delete(id);
}

function getSessionEvents(id) {
    return sessionEvents.get(id);
}

module.exports = {
    sessions,
    createSession,
    getSession,
    deleteSession,
    getSessionEvents,
    SESSION_TTL_MS
};
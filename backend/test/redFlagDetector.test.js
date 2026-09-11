const test = require("node:test");
const assert = require("node:assert/strict");
const { detectRedFlags } = require("../services/redFlagDetector");
const { isUnknownAnswer, extractEntities } = require("../services/dialogueManager");

test("does not flag a negated chest pain symptom", () => {
    assert.deepEqual(detectRedFlags("No chest pain, bas thodi khansi hai"), []);
});

test("flags a genuine emergency phrase", () => {
    assert.deepEqual(detectRedFlags("I have severe chest pain and difficulty breathing"), [
        { id: "chest-pain", message: "Chest pain may need urgent medical assessment." },
        { id: "breathing-difficulty", message: "Breathing difficulty can be an emergency." }
    ]);
});

test("treats silence as a valid unknown answer", () => {
    assert.equal(isUnknownAnswer(""), true);
    assert.deepEqual(extractEntities("kuch nahi", []), {
        redFlags: [],
        unknown: true,
        endIntent: false,
        normalizedText: "kuch nahi"
    });
});

test("detects a code-switched emergency phrase", () => {
    assert.equal(detectRedFlags("Mujhe chest pain hai, सांस फूल रही है").length, 2);
});
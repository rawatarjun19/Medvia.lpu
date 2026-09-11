const test = require("node:test");
const assert = require("node:assert/strict");
const { validateTapQuestion } = require("../services/geminiService");

test("accepts a valid tap-to-answer question", () => {
    assert.deepEqual(validateTapQuestion({
        question: "Where is the pain?",
        options: ["Head", "Chest", "Stomach", "Something else"],
        urgent: false
    }), {
        question: "Where is the pain?",
        options: ["Head", "Chest", "Stomach", "Something else"],
        urgent: false
    });
});

test("rejects a tap question without exactly four options", () => {
    assert.equal(validateTapQuestion({ question: "Where?", options: ["Head"], urgent: false }), null);
});

test("rejects a tap question without a boolean urgent flag", () => {
    assert.equal(validateTapQuestion({ question: "Where?", options: ["A", "B", "C", "Other"], urgent: "false" }), null);
});
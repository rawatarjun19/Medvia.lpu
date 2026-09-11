const RED_FLAG_RULES = [
    { id: "chest-pain", terms: ["chest pain", "छाती में दर्द", "छाती दर्द", "seene mein dard"], message: "Chest pain may need urgent medical assessment." },
    { id: "breathing-difficulty", terms: ["difficulty breathing", "shortness of breath", " सांस नहीं", "सांस लेने में दिक्कत", "सांस फूल"], message: "Breathing difficulty can be an emergency." },
    { id: "stroke-signs", terms: ["face drooping", "slurred speech", "one side weak", "लकवा", "बोलने में दिक्कत"], message: "Possible stroke symptoms need emergency care." },
    { id: "severe-bleeding", terms: ["heavy bleeding", "blood vomit", "खून की उल्टी", "बहुत खून"], message: "Severe bleeding needs urgent medical assessment." },
    { id: "loss-consciousness", terms: ["unconscious", "passed out", "बेहोश", "होश नहीं"], message: "Loss of consciousness needs urgent medical assessment." }
];

const NEGATION_PATTERNS = [
    /\b(no|not|without|never|don't|doesn't|didn't|isn't|aren't|haven't|hasn't)\b/i,
    /\b(nahi|nahin|nahi hai|nahi ho raha|nahi hota|nahi hua)\b/i,
    /नहीं|नही|न है/,
    /ਨਹੀਂ|ਨਹੀ/
];

function isNegated(text, startIndex) {
    const before = text.slice(Math.max(0, startIndex - 45), startIndex);
    const after = text.slice(startIndex).trimStart();
    const suffixNegation = /^(?:no|not|without|nahi|nahin|नहीं|नही|ਨਹੀਂ|ਨਹੀ)\b/i.test(after);
    return NEGATION_PATTERNS.some((pattern) => pattern.test(before)) || suffixNegation;
}

function detectRedFlags(value) {
    const text = String(value ?? "").toLowerCase();
    return RED_FLAG_RULES
        .filter((rule) => rule.terms.some((term) => {
            const index = text.indexOf(term.toLowerCase());
            return index >= 0 && !isNegated(text, index);
        }))
        .map(({ id, message }) => ({ id, message }));
}

module.exports = { detectRedFlags };
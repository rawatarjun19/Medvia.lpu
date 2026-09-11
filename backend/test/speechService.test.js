const test = require("node:test");
const assert = require("node:assert/strict");
const { transcribe, synthesize } = require("../services/speechService");

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

// Save the real fetch so every test that swaps it out can restore it, keeping
// the process clean and the tests independent from one another.
const realFetch = globalThis.fetch;

// Build a fake fetch Response whose body is a resolved JSON payload.
function jsonResponse(payload, { ok = true, status = 200 } = {}) {
    return {
        ok,
        status,
        json: async () => payload,
        text: async () => JSON.stringify(payload)
    };
}

// A Gemini-style success payload: candidates[0].content.parts[0].text
function geminiTextPayload(text) {
    const part = { text };
    const content = { parts: [part] };
    return { candidates: [{ content }] };
}

// Install a stub fetch for the duration of a single test and return the calls
// it recorded, so we can assert on the request the service actually made.
function stubFetch(handler) {
    const calls = [];
    globalThis.fetch = async (url, options) => {
        calls.push({ url, options, body: JSON.parse(options.body) });
        return handler(url, options);
    };
    return calls;
}

// Guarantee cleanup even if an assertion throws inside a test.
function withFetchRestore(t) {
    t.after(() => {
        globalThis.fetch = realFetch;
        delete process.env.GEMINI_API_KEY;
        delete process.env.GEMINI_MODEL;
    });
}

// A tiny, valid-looking base64 audio string for the happy paths.
const TINY_AUDIO = "SGVsbG8gd29ybGQ=";

// ---------------------------------------------------------------------------
// transcribe - input validation (negative / edge cases)
// ---------------------------------------------------------------------------

test("transcribe throws when audioBase64 is missing or empty", async () => {
    await assert.rejects(() => transcribe({}), /audioBase64 is required/);
    await assert.rejects(() => transcribe({ audioBase64: "" }), /audioBase64 is required/);
    await assert.rejects(() => transcribe({ audioBase64: null }), /audioBase64 is required/);
    await assert.rejects(() => transcribe({ audioBase64: undefined }), /audioBase64 is required/);
});

test("transcribe throws a TypeError when called with no arguments", async () => {
    // The service destructures its argument directly, so a missing argument is
    // a programming error rather than a validation failure. The HTTP route
    // always passes req.body || {}, so this only guards direct callers.
    await assert.rejects(() => transcribe(), TypeError);
});

test("transcribe rejects non-string audio payloads", async () => {
    const audioObject = { data: "x" };
    const audioArray = ["abc"];
    await assert.rejects(() => transcribe({ audioBase64: 12345 }), /invalid or too large/);
    await assert.rejects(() => transcribe({ audioBase64: audioObject }), /invalid or too large/);
    await assert.rejects(() => transcribe({ audioBase64: audioArray }), /invalid or too large/);
});

test("transcribe rejects audio that exceeds the 10MB base64 limit", async () => {
    const tooLarge = "a".repeat(10 * 1024 * 1024 + 1);
    await assert.rejects(() => transcribe({ audioBase64: tooLarge }), /invalid or too large/);
});

test("transcribe accepts audio exactly at the 10MB base64 boundary", async (t) => {
    withFetchRestore(t);
    process.env.GEMINI_API_KEY = "test-key";
    const boundary = "a".repeat(10 * 1024 * 1024);
    stubFetch(() => jsonResponse(geminiTextPayload("boundary ok")));

    const result = await transcribe({ audioBase64: boundary });
    assert.equal(result.text, "boundary ok");
});

test("transcribe rejects an unsupported mimeType", async () => {
    await assert.rejects(
        () => transcribe({ audioBase64: TINY_AUDIO, mimeType: "video/mp4" }),
        /Unsupported audio format/
    );
    await assert.rejects(
        () => transcribe({ audioBase64: TINY_AUDIO, mimeType: "not-a-mime" }),
        /Unsupported audio format/
    );
    await assert.rejects(
        () => transcribe({ audioBase64: TINY_AUDIO, mimeType: "" }),
        /Unsupported audio format/
    );
});

test("transcribe accepts a range of valid audio mime types", async (t) => {
    withFetchRestore(t);
    process.env.GEMINI_API_KEY = "test-key";
    for (const mimeType of ["audio/webm", "audio/mpeg", "audio/ogg", "audio/mp4", "audio/wav"]) {
        stubFetch(() => jsonResponse(geminiTextPayload("ok")));
        const result = await transcribe({ audioBase64: TINY_AUDIO, mimeType });
        assert.equal(result.text, "ok", `should accept ${mimeType}`);
    }
});

test("transcribe fails fast when no API key is configured", async () => {
    await assert.rejects(
        () => transcribe({ audioBase64: TINY_AUDIO }),
        /Speech transcription is not configured/
    );
});

// ---------------------------------------------------------------------------
// transcribe - provider interaction (positive & failure cases)
// ---------------------------------------------------------------------------

test("transcribe returns the provider text and model on success", async (t) => {
    withFetchRestore(t);
    process.env.GEMINI_API_KEY = "test-key";
    const calls = stubFetch(() => jsonResponse(geminiTextPayload("  mujhe bukhar hai  ")));

    const result = await transcribe({ audioBase64: TINY_AUDIO, language: "hi-IN" });

    assert.deepEqual(result, { provider: "gemini-2.5-flash", text: "mujhe bukhar hai" });
    assert.equal(calls.length, 1);
    // The key is passed in the query string and the audio in the request body.
    assert.match(calls[0].url, /generateContent\?key=test-key/);
    assert.equal(calls[0].body.contents[0].parts[1].inlineData.data, TINY_AUDIO);
    assert.equal(calls[0].body.contents[0].parts[1].inlineData.mimeType, "audio/webm");
    assert.match(calls[0].body.contents[0].parts[0].text, /hi-IN/);
});

test("transcribe honours a custom GEMINI_MODEL env override", async (t) => {
    withFetchRestore(t);
    process.env.GEMINI_API_KEY = "test-key";
    process.env.GEMINI_MODEL = "gemini-custom";
    const calls = stubFetch(() => jsonResponse(geminiTextPayload("hello")));

    const result = await transcribe({ audioBase64: TINY_AUDIO });

    assert.equal(result.provider, "gemini-custom");
    assert.match(calls[0].url, /models\/gemini-custom:generateContent/);
});

test("transcribe joins multiple text parts into one transcription", async (t) => {
    withFetchRestore(t);
    process.env.GEMINI_API_KEY = "test-key";
    const firstPart = { text: "part one " };
    const secondPart = { text: "part two" };
    const content = { parts: [firstPart, secondPart] };
    const candidate = { content: content };
    const payload = { candidates: [candidate] };
    stubFetch(() => jsonResponse(payload));
    const result = await transcribe({ audioBase64: TINY_AUDIO });
    assert.equal(result.text, "part one part two");
});

test("transcribe throws when the provider responds with a non-ok status", async (t) => {
    withFetchRestore(t);
    process.env.GEMINI_API_KEY = "test-key";
    stubFetch(() => jsonResponse({ error: "boom" }, { ok: false, status: 429 }));

    await assert.rejects(() => transcribe({ audioBase64: TINY_AUDIO }), /Speech provider returned 429/);
});

test("transcribe throws when the provider returns an empty transcription", async (t) => {
    withFetchRestore(t);
    process.env.GEMINI_API_KEY = "test-key";
    stubFetch(() => jsonResponse(geminiTextPayload("   ")));

    await assert.rejects(() => transcribe({ audioBase64: TINY_AUDIO }), /empty transcription/);
});

test("transcribe throws when the payload has no candidates", async (t) => {
    withFetchRestore(t);
    process.env.GEMINI_API_KEY = "test-key";
    stubFetch(() => jsonResponse({}));

    await assert.rejects(() => transcribe({ audioBase64: TINY_AUDIO }), /empty transcription/);
});

test("transcribe propagates network errors from fetch", async (t) => {
    withFetchRestore(t);
    process.env.GEMINI_API_KEY = "test-key";
    stubFetch(() => {
        throw new Error("network down");
    });

    await assert.rejects(() => transcribe({ audioBase64: TINY_AUDIO }), /network down/);
});

// ---------------------------------------------------------------------------
// synthesize
// ---------------------------------------------------------------------------

test("synthesize returns the browser fallback descriptor on success", async () => {
    const result = await synthesize({ text: "Take your medicine", language: "en-IN" });
    assert.deepEqual(result, {
        provider: "browser-fallback",
        audioBase64: null,
        fallback: "Use browser speechSynthesis."
    });
});

test("synthesize throws when text is missing", async () => {
    await assert.rejects(() => synthesize({}), /text is required/);
    await assert.rejects(() => synthesize({ text: "" }), /text is required/);
    await assert.rejects(() => synthesize({ text: null }), /text is required/);
});

test("synthesize throws a TypeError when called with no arguments", async () => {
    await assert.rejects(() => synthesize(), TypeError);
});

test("synthesize does not require a configured API key", async () => {
    delete process.env.GEMINI_API_KEY;
    const result = await synthesize({ text: "hello" });
    assert.equal(result.provider, "browser-fallback");
});

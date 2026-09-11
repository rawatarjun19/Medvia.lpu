# Medvia Backend

## Run

```bash
npm install
npm start
```

Copy `.env.example` to `.env`. Add your Gemini API key to `GEMINI_API_KEY` to enable the Gemini endpoint. Speech endpoints use browser SpeechRecognition and speechSynthesis fallback. Never commit `.env` or provider keys.

## APIs

- `POST /api/session/start` with optional `complaintId`: `fever`, `cough`, `pain`, or `other`
- `POST /api/session/:id/language` with `{ "language": "hi" }`
- `POST /api/session/:id/consent` with `{ "consent": true }`
- `GET /api/questions?sessionId=:id`
- `POST /api/answers` with `{ "sessionId", "questionId", "answer" }`
- `GET /api/session/:id/events` for server-sent red-flag alerts
- `POST /api/speech/transcribe` with `{ "audioBase64", "language" }`
- `POST /api/speech/synthesize` with `{ "text", "language" }`
- `POST /api/gemini/chat` with `{ "message", "language", "history" }`
- `DELETE /api/session/:id` to immediately clear patient session data

Sessions are held in memory, expire after `SESSION_TTL_MS`, and do not retain raw speech audio or ABHA identifiers.

The intake loop stores each answer as a structured turn containing the question ID, raw transcript, and extracted entities. Red flags are checked on every turn with English, Hindi, and Punjabi negation handling. A confirmed red flag immediately pauses intake, emits the SSE alert, and tells the patient to wait for a nurse. Browser voice input falls back to touch mode after two failed recognition attempts.
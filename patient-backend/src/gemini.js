// Calls Google's free-tier Gemini API to summarise an uploaded medical
// document (image or PDF) for a doctor.
//
// Get a free key at https://aistudio.google.com/apikey and put it in your
// .env file as VITE_GEMINI_API_KEY=your_key_here
//
// NOTE: this calls Gemini directly from the browser, so the key is visible
// to anyone who opens dev tools. That's fine for a hackathon demo — for a
// real deployment, move this call into a Supabase Edge Function so the key
// never reaches the browser.

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
// Using the 'latest' alias instead of a pinned version number (like
// 'gemini-2.0-flash') on purpose — Google periodically retires specific
// model versions, and this alias automatically points to whatever their
// current flash model is, so this won't silently break again later.
const GEMINI_MODEL = 'gemini-flash-latest'

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function summarizeDocument(file) {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing VITE_GEMINI_API_KEY in your .env file')
  }

  const base64Data = await fileToBase64(file)

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text:
                  'You are helping a doctor quickly review a patient-uploaded medical document. ' +
                  'Look at the attached file and reply using EXACTLY this plain-text format, one ' +
                  'field per line, nothing else before or after it, no markdown or asterisks:\n\n' +
                  'DOCUMENT_TYPE: short label, e.g. Lab Report, Prescription, Consultation Note\n' +
                  'KEY_FINDINGS: key values/findings in plain sentences\n' +
                  'MEDICATIONS: medications mentioned, or None mentioned\n' +
                  'URGENT: yes or no — yes only if something looks abnormal or urgent\n' +
                  'URGENT_NOTES: explanation if URGENT is yes, else leave blank\n' +
                  'UNCLEAR: yes or no — yes if the file is blurry, unreadable, or not medical',
              },
              {
                inline_data: {
                  mime_type: file.type || 'application/octet-stream',
                  data: base64Data,
                },
              },
            ],
          },
        ],
      }),
    }
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Gemini API error: ${text}`)
  }

  const data = await response.json()
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!rawText) throw new Error('Gemini returned no summary')

  return JSON.stringify(parseLabeledText(rawText))
}

// Turns Gemini's "LABEL: value" lines into the object PatientDocuments.jsx
// expects. If Gemini ignores the format for some reason, everything just
// falls back into key_findings so nothing is silently lost.
function parseLabeledText(rawText) {
  const lines = rawText.split('\n')
  const get = (label) => {
    const line = lines.find((l) => l.trim().toUpperCase().startsWith(label + ':'))
    return line ? line.split(':').slice(1).join(':').trim() : ''
  }

  const documentType = get('DOCUMENT_TYPE')
  const keyFindings = get('KEY_FINDINGS')

  // If we didn't find the expected labels at all, Gemini replied in free
  // text — just show that instead of an empty summary.
  if (!documentType && !keyFindings) {
    return {
      document_type: 'Document',
      key_findings: rawText.trim(),
      medications: '',
      urgent: false,
      urgent_notes: '',
      unclear: false,
    }
  }

  return {
    document_type: documentType || 'Document',
    key_findings: keyFindings,
    medications: get('MEDICATIONS'),
    urgent: get('URGENT').toLowerCase().startsWith('y'),
    urgent_notes: get('URGENT_NOTES'),
    unclear: get('UNCLEAR').toLowerCase().startsWith('y'),
  }
}

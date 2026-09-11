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

  // Never let this hang forever. PDFs (especially multi-page ones) genuinely
  // take Gemini longer to process than a single compressed photo, so they
  // get a longer allowance before we give up.
  const timeoutMs = file.type === 'application/pdf' ? 60000 : 30000
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  let response
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    'You are helping a doctor quickly review a patient-uploaded medical document. ' +
                    'Look at the attached file and reply using EXACTLY this plain-text format, ' +
                    'nothing else before or after it, no markdown symbols like asterisks:\n\n' +
                    'DOCUMENT_TYPE: short label, e.g. Lab Report, Prescription, Consultation Note\n' +
                    'KEY_FINDINGS:\n' +
                    '- first key finding as a short standalone point\n' +
                    '- second key finding\n' +
                    '- one point per line, 3-6 points total, each a short plain sentence, no sub-bullets\n' +
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
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Gemini took too long to respond (${timeoutMs / 1000}s timeout). Try again.`)
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Gemini API error: ${text}`)
  }

  const data = await response.json()
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!rawText) throw new Error('Gemini returned no summary')

  return JSON.stringify(parseLabeledText(rawText))
}

// Turns Gemini's "LABEL: value" / bullet-list reply into the object
// PatientDocuments.jsx expects. key_findings is always an array of short
// points now, not one long sentence. If Gemini ignores the format for some
// reason, everything falls back into a single key_findings point so
// nothing is silently lost.
function parseLabeledText(rawText) {
  const SINGLE_LINE_LABELS = ['DOCUMENT_TYPE', 'MEDICATIONS', 'URGENT', 'URGENT_NOTES', 'UNCLEAR']
  const lines = rawText.split('\n')

  const result = {
    document_type: '',
    key_findings: [],
    medications: '',
    urgent: false,
    urgent_notes: '',
    unclear: false,
  }

  let inKeyFindings = false

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    const matchedLabel = SINGLE_LINE_LABELS.find((l) => line.toUpperCase().startsWith(l + ':'))
    const isKeyFindingsHeader = line.toUpperCase().startsWith('KEY_FINDINGS')

    if (isKeyFindingsHeader) {
      inKeyFindings = true
      // Handle "KEY_FINDINGS: something" on the same line, just in case
      const sameLine = line.split(':').slice(1).join(':').trim()
      if (sameLine) result.key_findings.push(sameLine.replace(/^[-*]\s*/, ''))
      continue
    }

    if (matchedLabel) {
      inKeyFindings = false
      const value = line.split(':').slice(1).join(':').trim()
      if (matchedLabel === 'DOCUMENT_TYPE') result.document_type = value
      else if (matchedLabel === 'MEDICATIONS') result.medications = value
      else if (matchedLabel === 'URGENT_NOTES') result.urgent_notes = value
      else if (matchedLabel === 'URGENT') result.urgent = value.toLowerCase().startsWith('y')
      else if (matchedLabel === 'UNCLEAR') result.unclear = value.toLowerCase().startsWith('y')
      continue
    }

    if (inKeyFindings) {
      result.key_findings.push(line.replace(/^[-*]\s*/, ''))
    }
  }

  // If nothing matched the expected format at all, Gemini replied in free
  // text — show that as a single point instead of an empty summary.
  if (!result.document_type && result.key_findings.length === 0) {
    return {
      document_type: 'Document',
      key_findings: [rawText.trim()],
      medications: '',
      urgent: false,
      urgent_notes: '',
      unclear: false,
    }
  }

  if (!result.document_type) result.document_type = 'Document'
  return result
}

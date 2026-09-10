import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { summarizeDocument } from './gemini'
import './App.css'

// Public route — no login. Identified only by the one-time session id from
// the QR code. This is deliberately simple: it exists to be opened once,
// on a phone, right after scanning.
export default function DocumentUploadPage() {
  const { sessionId } = useParams()
  const [patientId, setPatientId] = useState(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [sessionError, setSessionError] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [summarizing, setSummarizing] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('Upload_Sessions')
      .select('patient_id, status')
      .eq('id', sessionId)
      .maybeSingle()
      .then(({ data, error }) => {
        setLoadingSession(false)
        if (error || !data) return setSessionError('This QR code is invalid or has expired.')
        if (data.status === 'uploaded') {
          return setSessionError('This code has already been used. Generate a new one on your computer.')
        }
        setPatientId(data.patient_id)
      })
  }, [sessionId])

  async function handleUpload() {
    if (!file || !patientId) return
    setUploading(true)
    setError('')

    const path = `${patientId}/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage.from('patient-documents').upload(path, file)
    if (uploadError) {
      setUploading(false)
      return setError(uploadError.message)
    }

    const { data: urlData } = supabase.storage.from('patient-documents').getPublicUrl(path)

    const { data: docRow, error: docError } = await supabase
      .from('Patient_Documents')
      .insert({
        patient_id: patientId,
        file_path: urlData.publicUrl,
        file_name: file.name,
        file_type: file.type,
        status: 'processing',
      })
      .select()
      .single()

    if (docError) {
      setUploading(false)
      return setError(docError.message)
    }

    await supabase.from('Upload_Sessions').update({ status: 'uploaded' }).eq('id', sessionId)

    setUploading(false)
    setSummarizing(true)

    // IMPORTANT: we wait for this to finish before letting the person close
    // the page. If we just fired this and immediately said "you can close
    // now", closing the tab would cancel the request before Gemini replied.
    try {
      const summary = await summarizeDocument(file)
      await supabase.from('Patient_Documents').update({ summary, status: 'done' }).eq('id', docRow.id)
    } catch (err) {
      await supabase
        .from('Patient_Documents')
        .update({ status: 'failed', summary: String(err.message || err).slice(0, 500) })
        .eq('id', docRow.id)
      console.error('Gemini summarisation failed:', err)
    }

    setSummarizing(false)
    setDone(true)
  }

  if (loadingSession) {
    return (
      <div className="shell centered">
        <div className="card emergency-card">
          <p className="muted">Loading…</p>
        </div>
      </div>
    )
  }

  if (sessionError) {
    return (
      <div className="shell centered">
        <div className="card emergency-card">
          <h1>Can't upload</h1>
          <p className="muted">{sessionError}</p>
        </div>
      </div>
    )
  }

  if (summarizing) {
    return (
      <div className="shell centered">
        <div className="card emergency-card">
          <h1>Analyzing document…</h1>
          <p className="muted">Please keep this page open a few more seconds. Don't close it yet.</p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="shell centered">
        <div className="card emergency-card">
          <h1>Uploaded ✓</h1>
          <p className="muted">All done — you can close this page and go back to your computer now.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="shell centered">
      <div className="card">
        <h1>Upload a Document</h1>
        <p className="muted">Take a photo of your report or prescription, or choose a file.</p>
        <div className="stack">
          <input
            type="file"
            accept="image/*,application/pdf"
            capture="environment"
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
          {error && <p className="error">{error}</p>}
          <button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  )
}

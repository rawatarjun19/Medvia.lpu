import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from './supabaseClient'

// Generates a short-lived "session" row and a QR code pointing to
// /upload/:sessionId. Scanning it on a phone opens a simple upload page
// (see DocumentUploadPage.jsx) that doesn't need its own login — it's
// identified purely by the session id in the QR code.
export default function DocumentUploadQR({ patient, onUploaded }) {
  const [session, setSession] = useState(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [justUploaded, setJustUploaded] = useState(false)

  async function createSession() {
    setCreating(true)
    setError('')
    setJustUploaded(false)
    const { data, error } = await supabase
      .from('Upload_Sessions')
      .insert({ patient_id: patient.id, status: 'pending' })
      .select()
      .single()
    setCreating(false)
    if (error) return setError(error.message)
    setSession(data)
  }

  // Watch this one session row for the phone to flip it to 'uploaded'
  useEffect(() => {
    if (!session) return
    const channel = supabase
      .channel(`upload-session-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Upload_Sessions',
          filter: `id=eq.${session.id}`,
        },
        (payload) => {
          if (payload.new.status === 'uploaded') {
            setJustUploaded(true)
            onUploaded?.()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session, onUploaded])

  const url = session ? `${window.location.origin}/upload/${session.id}` : null

  return (
    <div className="history-section">
      <div className="row-between">
        <h2>Upload a Document</h2>
      </div>
      <p className="muted">
        Generate a QR code and scan it with your phone to photograph or upload a lab report or
        prescription. It's summarised automatically for your doctor.
      </p>

      {!session && (
        <button onClick={createSession} disabled={creating}>
          {creating ? 'Generating…' : 'Generate QR Code'}
        </button>
      )}

      {session && !justUploaded && (
        <div className="emergency-qr-block">
          <QRCodeSVG value={url} size={160} bgColor="#ffffff" fgColor="#16201c" />
          <div className="emergency-qr-actions">
            <span className="muted">Scan with your phone camera, then stay on this page.</span>
            <button className="ghost" type="button" onClick={createSession}>
              Generate new code
            </button>
          </div>
        </div>
      )}

      {justUploaded && (
        <p className="notice">
          Document received — it's being summarised now. Check the list below in a few seconds.
        </p>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  )
}

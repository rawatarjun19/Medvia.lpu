import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function parseSummary(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export default function PatientDocuments({ patientId }) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const { data } = await supabase
      .from('Patient_Documents')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
    setDocs(data || [])
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    load()

    // Live-update while Gemini is still summarising, or when a new doc lands
    const channel = supabase
      .channel(`patient-documents-${patientId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Patient_Documents', filter: `patient_id=eq.${patientId}` },
        () => load()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId])

  if (loading) return <p className="muted">Loading documents…</p>
  if (docs.length === 0) return <p className="muted">No uploaded documents yet.</p>

  return (
    <ul className="history-list">
      {docs.map((doc) => {
        const parsed = doc.status === 'done' ? parseSummary(doc.summary) : null

        return (
          <li key={doc.id} className="history-item">
            <div className="history-item-header">
              <strong>{parsed?.document_type || doc.file_name}</strong>
              <span className="muted">
                {new Date(doc.created_at).toLocaleDateString()}{' '}
                {new Date(doc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p>
              <a href={doc.file_path} target="_blank" rel="noreferrer">
                View original file
              </a>
            </p>

            {doc.status === 'processing' && <p className="muted">Summarising…</p>}
            {doc.status === 'failed' && (
              <p className="error">
                Summary failed{doc.summary ? `: ${doc.summary}` : ''} — original file is still available above.
              </p>
            )}

            {doc.status === 'done' && parsed && (
              <>
                {parsed.unclear && (
                  <p className="muted">
                    The file was unclear or hard to read — treat this summary as approximate.
                  </p>
                )}
                {parsed.urgent && (
                  <div className="emergency-alert" style={{ margin: '10px 0' }}>
                    <strong>Flagged as urgent</strong>
                    <p>{parsed.urgent_notes}</p>
                  </div>
                )}
                <p>
                  <span className="muted">Key findings: </span>
                  {parsed.key_findings}
                </p>
                {parsed.medications && (
                  <p>
                    <span className="muted">Medications: </span>
                    {parsed.medications}
                  </p>
                )}
              </>
            )}

            {/* Fallback for older entries saved before structured summaries */}
            {doc.status === 'done' && !parsed && (
              <p>
                <span className="muted">AI Summary: </span>
                {doc.summary}
              </p>
            )}
          </li>
        )
      })}
    </ul>
  )
}

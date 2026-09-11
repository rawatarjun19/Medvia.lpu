import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function parseSummary(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const emptyReview = {
  visitDate: new Date().toISOString().slice(0, 10),
  diagnosis: '',
  medicines: '',
  labReports: '',
  notes: '',
}

// `patient` needs at least { id, user_id }.
// `canReview` + `doctorName` are only passed from the doctor's view — the
// patient's own view renders read-only, with no review controls.
export default function PatientDocuments({ patient, canReview = false, doctorName = '' }) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewingId, setReviewingId] = useState(null)
  const [reviewForm, setReviewForm] = useState(emptyReview)
  const [savingId, setSavingId] = useState(null)

  async function load() {
    const { data } = await supabase
      .from('Patient_Documents')
      .select('*')
      .eq('patient_id', patient.id)
      .order('created_at', { ascending: false })
    setDocs(data || [])
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    load()

    const channel = supabase
      .channel(`patient-documents-${patient.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Patient_Documents', filter: `patient_id=eq.${patient.id}` },
        () => load()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient.id])

  function startEditing(doc, parsed) {
    setReviewingId(doc.id)
    setReviewForm({
      visitDate: new Date().toISOString().slice(0, 10),
      diagnosis: parsed.key_findings.join('\n'),
      medicines: parsed.medications || '',
      labReports: parsed.document_type === 'Lab Report' ? parsed.document_type : '',
      notes: '',
    })
  }

  async function saveToHistory(doc, { visitDate, diagnosis, medicines, labReports, notes }, reviewStatus) {
    setSavingId(doc.id)

    const historyPayload = {
      patient_id: patient.id,
      user_id: patient.user_id,
      Visit_Date: visitDate,
      Doctor_Name: doctorName || null,
      Diagnosis: diagnosis,
      Treatment: medicines || null,
      Notes: [labReports ? `Lab reports done: ${labReports}` : '', notes].filter(Boolean).join('\n') || null,
      source_document_id: doc.id,
    }

    const { error: historyError } = await supabase.from('Patient_History').insert(historyPayload)

    if (!historyError) {
      await supabase
        .from('Patient_Documents')
        .update({ review_status: reviewStatus, reviewed_by: doctorName || null, reviewed_at: new Date().toISOString() })
        .eq('id', doc.id)
    }

    setSavingId(null)
    setReviewingId(null)
    if (historyError) alert(`Couldn't save to history: ${historyError.message}`)
  }

  async function handleAccept(doc, parsed) {
    await saveToHistory(
      doc,
      {
        visitDate: new Date().toISOString().slice(0, 10),
        diagnosis: parsed.key_findings.join('\n'),
        medicines: parsed.medications || '',
        labReports: '',
        notes: '',
      },
      'accepted'
    )
  }

  async function handleDiscard(doc) {
    setSavingId(doc.id)
    await supabase
      .from('Patient_Documents')
      .update({ review_status: 'discarded', reviewed_by: doctorName || null, reviewed_at: new Date().toISOString() })
      .eq('id', doc.id)
    setSavingId(null)
  }

  if (loading) return <p className="muted">Loading documents…</p>
  if (docs.length === 0) return <p className="muted">No uploaded documents yet.</p>

  return (
    <ul className="history-list">
      {docs.map((doc) => {
        const parsed = doc.status === 'done' ? parseSummary(doc.summary) : null
        const findings = parsed?.key_findings
        const findingsList = Array.isArray(findings) ? findings : findings ? [findings] : []
        const reviewStatus = doc.review_status || 'pending'
        const isEditing = reviewingId === doc.id
        const isSaving = savingId === doc.id

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

                {findingsList.length > 0 && (
                  <>
                    <p className="muted" style={{ margin: '10px 0 4px' }}>Key findings:</p>
                    <ul className="findings-list">
                      {findingsList.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </>
                )}

                {parsed.medications && (
                  <p>
                    <span className="muted">Medications: </span>
                    {parsed.medications}
                  </p>
                )}

                {canReview && !isEditing && reviewStatus === 'pending' && (
                  <div className="review-actions">
                    <button type="button" disabled={isSaving} onClick={() => handleAccept(doc, parsed)}>
                      {isSaving ? 'Saving…' : 'Accept'}
                    </button>
                    <button type="button" className="ghost" onClick={() => startEditing(doc, parsed)}>
                      Edit & Save
                    </button>
                    <button type="button" className="discard" disabled={isSaving} onClick={() => handleDiscard(doc)}>
                      Discard
                    </button>
                  </div>
                )}

                {canReview && reviewStatus === 'accepted' && (
                  <p className="notice review-status">✓ Accepted into patient history as-is.</p>
                )}
                {canReview && reviewStatus === 'edited' && (
                  <p className="notice review-status">✓ Reviewed, edited, and saved to patient history.</p>
                )}
                {canReview && reviewStatus === 'discarded' && (
                  <p className="muted review-status">Discarded — not added to patient history.</p>
                )}

                {canReview && isEditing && (
                  <form
                    className="grid-form history-form"
                    onSubmit={(e) => {
                      e.preventDefault()
                      saveToHistory(doc, reviewForm, 'edited')
                    }}
                  >
                    <label>
                      Visit Date
                      <input
                        required
                        type="date"
                        value={reviewForm.visitDate}
                        onChange={(e) => setReviewForm((f) => ({ ...f, visitDate: e.target.value }))}
                      />
                    </label>
                    <label className="span-2">
                      Your Diagnosis / Perception
                      <textarea
                        required
                        rows={3}
                        value={reviewForm.diagnosis}
                        onChange={(e) => setReviewForm((f) => ({ ...f, diagnosis: e.target.value }))}
                      />
                    </label>
                    <label className="span-2">
                      Medicines Prescribed
                      <textarea
                        rows={2}
                        value={reviewForm.medicines}
                        onChange={(e) => setReviewForm((f) => ({ ...f, medicines: e.target.value }))}
                      />
                    </label>
                    <label className="span-2">
                      Lab Reports / Tests Done
                      <textarea
                        rows={2}
                        value={reviewForm.labReports}
                        onChange={(e) => setReviewForm((f) => ({ ...f, labReports: e.target.value }))}
                      />
                    </label>
                    <label className="span-2">
                      Additional Notes
                      <textarea
                        rows={2}
                        value={reviewForm.notes}
                        onChange={(e) => setReviewForm((f) => ({ ...f, notes: e.target.value }))}
                      />
                    </label>
                    <div className="span-2 review-actions">
                      <button type="submit" disabled={isSaving}>
                        {isSaving ? 'Saving…' : 'Save to History'}
                      </button>
                      <button type="button" className="ghost" onClick={() => setReviewingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </form>
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

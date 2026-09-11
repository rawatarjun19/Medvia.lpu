import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const emptyEntry = {
  Visit_Date: '',
  Hospital_Name: '',
  Doctor_Name: '',
  Diagnosis: '',
  Symptoms: '',
  Treatment: '',
  Notes: '',
  Follow_up_Date: '',
}

export default function PatientHistory({ patient, userId, readOnly = false }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyEntry)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadEntries() {
    setLoading(true)
    const { data, error } = await supabase
      .from('Patient_History')
      .select('*')
      .eq('patient_id', patient.id)
      .order('Visit_Date', { ascending: false })
    if (error) setError(error.message)
    setEntries(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadEntries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient.id])

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload = {
      patient_id: patient.id,
      user_id: userId,
      Visit_Date: form.Visit_Date,
      Hospital_Name: form.Hospital_Name || null,
      Doctor_Name: form.Doctor_Name || null,
      Diagnosis: form.Diagnosis,
      Symptoms: form.Symptoms || null,
      Treatment: form.Treatment || null,
      Notes: form.Notes || null,
      Follow_up_Date: form.Follow_up_Date || null,
    }

    const { error } = await supabase.from('Patient_History').insert(payload)
    setSaving(false)
    if (error) return setError(error.message)

    setForm(emptyEntry)
    setShowForm(false)
    loadEntries()
  }

  return (
    <div className="history-section">
      <div className="row-between">
        <h2>Patient History</h2>
        {!readOnly && (
          <button className="ghost" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Cancel' : '+ Add Entry'}
          </button>
        )}
      </div>

      {!readOnly && showForm && (
        <form onSubmit={handleSubmit} className="grid-form history-form">
          <label>
            Visit Date
            <input
              required
              type="date"
              value={form.Visit_Date}
              onChange={(e) => updateField('Visit_Date', e.target.value)}
            />
          </label>
          <label>
            Follow-up Date
            <input
              type="date"
              value={form.Follow_up_Date}
              onChange={(e) => updateField('Follow_up_Date', e.target.value)}
            />
          </label>
          <label>
            Hospital / Clinic Name
            <input value={form.Hospital_Name} onChange={(e) => updateField('Hospital_Name', e.target.value)} />
          </label>
          <label>
            Doctor Name
            <input value={form.Doctor_Name} onChange={(e) => updateField('Doctor_Name', e.target.value)} />
          </label>
          <label className="span-2">
            Diagnosis
            <input required value={form.Diagnosis} onChange={(e) => updateField('Diagnosis', e.target.value)} />
          </label>
          <label className="span-2">
            Symptoms
            <textarea rows={2} value={form.Symptoms} onChange={(e) => updateField('Symptoms', e.target.value)} />
          </label>
          <label className="span-2">
            Treatment / Prescription
            <textarea rows={2} value={form.Treatment} onChange={(e) => updateField('Treatment', e.target.value)} />
          </label>
          <label className="span-2">
            Notes
            <textarea rows={2} value={form.Notes} onChange={(e) => updateField('Notes', e.target.value)} />
          </label>
          {error && <p className="error span-2">{error}</p>}
          <button type="submit" disabled={saving} className="span-2">
            {saving ? 'Saving…' : 'Save Entry'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="muted">Loading history…</p>
      ) : entries.length === 0 ? (
        <p className="muted">No history entries yet.</p>
      ) : (
        <ul className="history-list">
          {entries.map((entry) => (
            <li key={entry.id} className="history-item">
              <div className="history-item-header">
                <strong>{entry.Diagnosis}</strong>
                <span className="muted">{entry.Visit_Date}</span>
              </div>
              {(entry.Hospital_Name || entry.Doctor_Name) && (
                <p className="muted">
                  {[entry.Hospital_Name, entry.Doctor_Name].filter(Boolean).join(' · ')}
                </p>
              )}
              {entry.Symptoms && <p><span className="muted">Symptoms: </span>{entry.Symptoms}</p>}
              {entry.Treatment && <p><span className="muted">Treatment: </span>{entry.Treatment}</p>}
              {entry.Notes && <p><span className="muted">Notes: </span>{entry.Notes}</p>}
              {entry.Follow_up_Date && <p><span className="muted">Follow-up: </span>{entry.Follow_up_Date}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
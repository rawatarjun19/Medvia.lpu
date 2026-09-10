import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './App.css'

// Public, no-login page. A responder or anyone who scans the patient's
// emergency QR code lands here directly — this must never require auth.
export default function EmergencyPage() {
  const { patientId } = useParams()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    supabase
      .from('Patients')
      // Only ever select the fields that are safe to show with no login.
      // Do not widen this select() — full history/contact details stay
      // behind the real login flow in App.jsx.
      .select('Name, Gender, Age, Blood_Group, Allergies, Emergency_contact, ABHA_ID')
      .eq('id', patientId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) setError(error.message)
        else if (!data) setError('This code does not match any patient record.')
        setPatient(data)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [patientId])

  if (loading) {
    return (
      <div className="shell centered">
        <div className="card emergency-card">
          <p className="muted">Loading emergency information…</p>
        </div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="shell centered">
        <div className="card emergency-card">
          <h1>Record not found</h1>
          <p className="muted">{error || 'This QR code does not match a patient record.'}</p>
        </div>
      </div>
    )
  }

  const hasAllergies = patient.Allergies && patient.Allergies.trim().toLowerCase() !== 'none'

  return (
    <div className="shell centered">
      <div className="card emergency-card">
        <p className="emergency-label">Emergency Medical Information</p>
        <h1>{patient.Name}</h1>
        <p className="muted">{patient.Gender} · {patient.Age} years</p>

        <div className="emergency-blood">
          <span className="emergency-blood-label">Blood Group</span>
          <span className="emergency-blood-value">{patient.Blood_Group || 'Unknown'}</span>
        </div>

        {hasAllergies && (
          <div className="emergency-alert">
            <strong>Allergy alert</strong>
            <p>{patient.Allergies}</p>
          </div>
        )}

        <dl className="details">
          <div className="detail-row">
            <dt>Emergency Contact</dt>
            <dd>
              {patient.Emergency_contact ? (
                <a href={`tel:${patient.Emergency_contact}`}>{patient.Emergency_contact}</a>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div className="detail-row">
            <dt>ABHA ID</dt>
            <dd>{patient.ABHA_ID || '—'}</dd>
          </div>
        </dl>

        <p className="muted emergency-footer">
          Shown from a scanned emergency code. Full medical history requires hospital login.
        </p>
      </div>
    </div>
  )
}

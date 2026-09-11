import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import PatientHistory from './PatientHistory'
import PatientDocuments from './PatientDocuments'
import { SPECIALIZATION_KEYWORDS } from './specializations'

export default function DoctorDashboard({ doctor, onLogout }) {
  const [query, setQuery] = useState('')
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [filterBySpecialization, setFilterBySpecialization] = useState(false)
  const [overview, setOverview] = useState({ latestVisit: null, urgentCount: 0 })
  const [overviewLoading, setOverviewLoading] = useState(true)

  const keywords = SPECIALIZATION_KEYWORDS[doctor.Specialization]
  const specializationHasKeywords = Boolean(keywords && keywords.length > 0)
  const isFilteredBySpecialization = filterBySpecialization && specializationHasKeywords

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    async function loadPatients() {
      try {
        const term = query.trim()

        // Step 1: if this specialization has a keyword set, find which
        // patients have a history entry matching one of those keywords.
        // Specializations without a keyword set (General Physician, Other)
        // skip this step entirely and see every patient.
        let allowedPatientIds = null
        if (isFilteredBySpecialization) {
          const historyFilter = keywords
            .map((k) => `Diagnosis.ilike.%${k}%`)
            .concat(keywords.map((k) => `Symptoms.ilike.%${k}%`))
            .join(',')

          const { data: historyRows, error: historyError } = await supabase
            .from('Patient_History')
            .select('patient_id')
            .or(historyFilter)

          if (historyError) throw historyError
          allowedPatientIds = [...new Set((historyRows || []).map((r) => r.patient_id))]

          // No matches at all — skip the second query, nothing to fetch.
          if (allowedPatientIds.length === 0) {
            if (!cancelled) {
              setPatients([])
              setLoading(false)
            }
            return
          }
        }

        // Step 2: fetch patients, applying the name/phone/ABHA search and
        // the specialization filter (if any) together.
        let request = supabase.from('Patients').select('*').order('Name')

        if (term) {
          // Commas break the .or() filter syntax since they're the
          // separator between conditions, so strip them out of the search
          // term before building the filter string.
          const safeTerm = term.replace(/,/g, '')
          request = request.or(
            `Name.ilike.%${safeTerm}%,Phone_Number.ilike.%${safeTerm}%,ABHA_ID.ilike.%${safeTerm}%`
          )
        }

        if (allowedPatientIds !== null) {
          request = request.in('id', allowedPatientIds)
        }

        const { data, error: patientsError } = await request
        if (patientsError) throw patientsError

        if (!cancelled) {
          setPatients(data || [])
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || String(err))
          setLoading(false)
        }
      }
    }

    loadPatients()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, doctor.Specialization, filterBySpecialization])

  // When a doctor opens a patient, load just enough extra data to build the
  // at-a-glance overview: their most recent visit, and whether any uploaded
  // document was flagged urgent by Gemini.
  useEffect(() => {
    if (!selected) return
    let cancelled = false
    setOverviewLoading(true)

    Promise.all([
      supabase
        .from('Patient_History')
        .select('*')
        .eq('patient_id', selected.id)
        .order('Visit_Date', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from('Patient_Documents').select('summary').eq('patient_id', selected.id).eq('status', 'done'),
    ]).then(([historyRes, docsRes]) => {
      if (cancelled) return
      const urgentCount = (docsRes.data || []).filter((d) => {
        try {
          return JSON.parse(d.summary).urgent
        } catch {
          return false
        }
      }).length
      setOverview({ latestVisit: historyRes.data || null, urgentCount })
      setOverviewLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [selected])

  if (selected) {
    const hasAllergyAlert = selected.Allergies && selected.Allergies.trim().toLowerCase() !== 'none'

    return (
      <div className="shell">
        <div className="doctor-grid">
          <aside className="card doctor-sidebar">
            <button className="ghost" onClick={() => setSelected(null)} style={{ marginBottom: '16px' }}>
              ← Back to patient list
            </button>

            <h1>{selected.Name}</h1>
            <p className="muted" style={{ marginTop: '-14px', marginBottom: '20px' }}>
              {selected.Gender}, {selected.Age}
            </p>

            {hasAllergyAlert && (
              <div className="emergency-alert" style={{ marginBottom: '14px' }}>
                <strong>Allergy alert</strong>
                <p>{selected.Allergies}</p>
              </div>
            )}

            {!overviewLoading && overview.urgentCount > 0 && (
              <div className="emergency-alert" style={{ marginBottom: '14px' }}>
                <strong>
                  {overview.urgentCount} urgent finding{overview.urgentCount > 1 ? 's' : ''} in documents
                </strong>
                <p className="muted" style={{ margin: 0 }}>See the Documents panel →</p>
              </div>
            )}

            <div className="vitals-grid vitals-grid-narrow">
              <div className="vital-stat">
                <span className="muted">Blood Group</span>
                <strong>{selected.Blood_Group || 'Unknown'}</strong>
              </div>
              <div className="vital-stat">
                <span className="muted">Last Visit</span>
                <strong>{overviewLoading ? '…' : overview.latestVisit?.Visit_Date || 'None yet'}</strong>
              </div>
              <div className="vital-stat">
                <span className="muted">Registered</span>
                <strong>
                  {selected.created_at ? new Date(selected.created_at).toLocaleDateString() : '—'}
                </strong>
              </div>
            </div>

            {!overviewLoading && overview.latestVisit && (
              <div className="history-item" style={{ marginTop: '14px' }}>
                <div className="history-item-header">
                  <strong>Recent diagnosis</strong>
                  <span className="muted">{overview.latestVisit.Visit_Date}</span>
                </div>
                <p>{overview.latestVisit.Diagnosis}</p>
              </div>
            )}

            <details style={{ marginTop: '18px' }}>
              <summary className="muted" style={{ cursor: 'pointer' }}>
                Contact & registration details
              </summary>
              <dl className="details" style={{ marginTop: '8px' }}>
                {Object.entries({
                  Email: selected.Email,
                  DOB: selected.DOB,
                  'Phone Number': selected.Phone_Number,
                  'Emergency Contact': selected.Emergency_contact,
                  'ABHA ID': selected.ABHA_ID,
                }).map(([label, value]) => (
                  <div className="detail-row" key={label}>
                    <dt>{label}</dt>
                    <dd>{value || '—'}</dd>
                  </div>
                ))}
              </dl>
            </details>
          </aside>

          <main className="doctor-main">
            <div className="card doctor-panel">
              <h2>Uploaded Documents</h2>
              <PatientDocuments patient={selected} canReview doctorName={doctor.Name} />
            </div>

            <div className="card doctor-panel">
              <PatientHistory patient={selected} readOnly />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="shell">
      <div className="card doctor-list-wide">
        <div className="row-between">
          <div>
            <h1>Patients</h1>
            <p className="muted">Dr. {doctor.Name}{doctor.Specialization ? ` · ${doctor.Specialization}` : ''}</p>
          </div>
          <button className="ghost" onClick={onLogout}>Log out</button>
        </div>

        <input
          className="search-input"
          placeholder="Search by name, phone, or ABHA ID…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {specializationHasKeywords && (
          <label style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={filterBySpecialization}
              onChange={(e) => setFilterBySpecialization(e.target.checked)}
            />
            Only show patients relevant to {doctor.Specialization} (based on diagnosis history)
          </label>
        )}

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p className="muted">Loading patients…</p>
        ) : patients.length === 0 ? (
          <p className="muted">
            {isFilteredBySpecialization
              ? `No patients found matching ${doctor.Specialization} and your search. Try unchecking the filter above.`
              : 'No patients found.'}
          </p>
        ) : (
          <ul className="patient-list">
            {patients.map((p) => (
              <li key={p.id} className="patient-list-item" onClick={() => setSelected(p)}>
                <div>
                  <strong>{p.Name}</strong>
                  <span className="muted"> · {p.Gender}, {p.Age}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="muted">{p.Phone_Number}</span>
                  <br />
                  <span className="muted">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
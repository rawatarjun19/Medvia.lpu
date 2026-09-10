import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import PatientHistory from './PatientHistory'
import DoctorDashboard from './DoctorDashboard'
import EmergencyQRCard from './EmergencyQRCard'
import DocumentUploadQR from './DocumentUploadQR'
import PatientDocuments from './PatientDocuments'
import { SPECIALIZATIONS } from './specializations'
import './App.css'

const BLOOD_GROUPS = ['Unknown', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const GENDERS = ['Female', 'Male', 'Other']

const emptyPatientForm = {
  Name: '',
  Gender: '',
  Age: '',
  Email: '',
  DOB: '',
  Phone_Number: '',
  Blood_Group: 'Unknown',
  Allergies: 'None',
  Emergency_contact: '',
  ABHA_ID: '',
}

const emptyDoctorForm = {
  Name: '',
  Specialization: '',
  License_Number: '',
  Hospital_Name: '',
}

export default function App() {
  const [session, setSession] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)

  // Role detection: does this logged-in user already have a Patients row, a Doctors row, or neither?
  const [checkingRole, setCheckingRole] = useState(false)
  const [patient, setPatient] = useState(null)
  const [doctor, setDoctor] = useState(null)
  const [roleChoice, setRoleChoice] = useState(null) // 'patient' | 'doctor', only used before either row exists

  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [authForm, setAuthForm] = useState({ email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [authNotice, setAuthNotice] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [form, setForm] = useState(emptyPatientForm)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const [docForm, setDocForm] = useState(emptyDoctorForm)
  const [docError, setDocError] = useState('')
  const [docLoading, setDocLoading] = useState(false)

  // Restore session on load, and keep it in sync
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCheckingSession(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  // Once logged in, check both Patients and Doctors tables for a row belonging to this user
  useEffect(() => {
    if (!session) {
      setPatient(null)
      setDoctor(null)
      return
    }
    setCheckingRole(true)
    Promise.all([
      supabase.from('Patients').select('*').eq('user_id', session.user.id).maybeSingle(),
      supabase.from('Doctors').select('*').eq('user_id', session.user.id).maybeSingle(),
    ]).then(([patientRes, doctorRes]) => {
      if (patientRes.error) setFormError(patientRes.error.message)
      if (doctorRes.error) setDocError(doctorRes.error.message)
      setPatient(patientRes.data)
      setDoctor(doctorRes.data)
      setCheckingRole(false)
    })
  }, [session])

  async function handleAuthSubmit(e) {
    e.preventDefault()
    setAuthError('')
    setAuthNotice('')
    setAuthLoading(true)

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email: authForm.email,
        password: authForm.password,
      })
      setAuthLoading(false)
      if (error) return setAuthError(error.message)
      if (!data.session) {
        setAuthNotice(
          'Account created. Check your email to confirm it, then log in below to finish setting up your account.'
        )
        setMode('login')
        return
      }
      setSession(data.session)
      setForm((f) => ({ ...f, Email: authForm.email }))
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authForm.email,
        password: authForm.password,
      })
      setAuthLoading(false)
      if (error) return setAuthError(error.message)
      setSession(data.session)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setSession(null)
    setPatient(null)
    setDoctor(null)
    setRoleChoice(null)
    setForm(emptyPatientForm)
    setDocForm(emptyDoctorForm)
    setAuthForm({ email: '', password: '' })
  }

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function updateDocField(key, value) {
    setDocForm((f) => ({ ...f, [key]: value }))
  }

  async function handlePatientSubmit(e) {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)

    const payload = {
      user_id: session.user.id,
      Name: form.Name,
      Gender: form.Gender,
      Age: Number(form.Age),
      Email: form.Email || null,
      DOB: form.DOB,
      Phone_Number: form.Phone_Number,
      Blood_Group: form.Blood_Group || 'Unknown',
      Allergies: form.Allergies || 'None',
      Emergency_contact: form.Emergency_contact,
      ABHA_ID: form.ABHA_ID || null,
    }

    const { data, error } = await supabase.from('Patients').insert(payload).select().single()
    setFormLoading(false)
    if (error) return setFormError(error.message)
    setPatient(data)
  }

  async function handleDoctorSubmit(e) {
    e.preventDefault()
    setDocError('')
    setDocLoading(true)

    const payload = {
      user_id: session.user.id,
      Name: docForm.Name,
      Specialization: docForm.Specialization || null,
      License_Number: docForm.License_Number || null,
      Hospital_Name: docForm.Hospital_Name || null,
    }

    const { data, error } = await supabase.from('Doctors').insert(payload).select().single()
    setDocLoading(false)
    if (error) return setDocError(error.message)
    setDoctor(data)
  }

  if (checkingSession) {
    return <div className="shell centered">Loading…</div>
  }

  // ---- Not logged in: show login / signup ----
  if (!session) {
    return (
      <div className="shell centered">
        <div className="card">
          <h1>Patient Portal</h1>
          <div className="tabs">
            <button className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => setMode('login')}>
              Log in
            </button>
            <button className={mode === 'signup' ? 'tab active' : 'tab'} onClick={() => setMode('signup')}>
              Sign up
            </button>
          </div>
          <form onSubmit={handleAuthSubmit} className="stack">
            <label>
              Email
              <input
                type="email"
                required
                value={authForm.email}
                onChange={(e) => setAuthForm((f) => ({ ...f, email: e.target.value }))}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                minLength={6}
                value={authForm.password}
                onChange={(e) => setAuthForm((f) => ({ ...f, password: e.target.value }))}
              />
            </label>
            {authError && <p className="error">{authError}</p>}
            {authNotice && <p className="notice">{authNotice}</p>}
            <button type="submit" disabled={authLoading}>
              {authLoading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ---- Logged in, checking which role this user has ----
  if (checkingRole) {
    return <div className="shell centered">Loading your account…</div>
  }

  // ---- Doctor: show dashboard ----
  if (doctor) {
    return <DoctorDashboard doctor={doctor} onLogout={handleLogout} />
  }

  // ---- Patient: show profile + history ----
  if (patient) {
    return (
      <div className="shell">
        <div className="card wide">
          <div className="row-between">
            <h1>Your Patient Record</h1>
            <button className="ghost" onClick={handleLogout}>Log out</button>
          </div>
          <dl className="details">
            {Object.entries({
              Name: patient.Name,
              Gender: patient.Gender,
              Age: patient.Age,
              Email: patient.Email,
              DOB: patient.DOB,
              'Phone Number': patient.Phone_Number,
              'Blood Group': patient.Blood_Group,
              Allergies: patient.Allergies,
              'Emergency Contact': patient.Emergency_contact,
              'ABHA ID': patient.ABHA_ID,
              'Registered On': patient.created_at
                ? new Date(patient.created_at).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : '—',
            }).map(([label, value]) => (
              <div className="detail-row" key={label}>
                <dt>{label}</dt>
                <dd>{value || '—'}</dd>
              </div>
            ))}
          </dl>

          <EmergencyQRCard patient={patient} />

          <DocumentUploadQR patient={patient} />
          <PatientDocuments patientId={patient.id} />

          <PatientHistory patient={patient} userId={session.user.id} />
        </div>
      </div>
    )
  }

  // ---- Neither role exists yet: ask which one this account is ----
  if (!roleChoice) {
    return (
      <div className="shell centered">
        <div className="card">
          <div className="row-between">
            <h1>Welcome</h1>
            <button className="ghost" onClick={handleLogout}>Log out</button>
          </div>
          <p className="muted">Is this account for a patient or a doctor?</p>
          <div className="stack">
            <button onClick={() => setRoleChoice('patient')}>I'm a Patient</button>
            <button className="ghost" onClick={() => setRoleChoice('doctor')}>I'm a Doctor</button>
          </div>
        </div>
      </div>
    )
  }

  // ---- Doctor onboarding form ----
  if (roleChoice === 'doctor') {
    return (
      <div className="shell centered">
        <div className="card">
          <div className="row-between">
            <h1>Doctor Sign-up</h1>
            <button className="ghost" onClick={handleLogout}>Log out</button>
          </div>
          <form onSubmit={handleDoctorSubmit} className="stack">
            <label>
              Full Name
              <input required value={docForm.Name} onChange={(e) => updateDocField('Name', e.target.value)} />
            </label>
            <label>
              Specialization
              <select
                required
                value={docForm.Specialization}
                onChange={(e) => updateDocField('Specialization', e.target.value)}
              >
                <option value="" disabled>Select</option>
                {SPECIALIZATIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              License Number
              <input value={docForm.License_Number} onChange={(e) => updateDocField('License_Number', e.target.value)} />
            </label>
            <label>
              Hospital Name
              <input value={docForm.Hospital_Name} onChange={(e) => updateDocField('Hospital_Name', e.target.value)} />
            </label>
            {docError && <p className="error">{docError}</p>}
            <button type="submit" disabled={docLoading}>
              {docLoading ? 'Saving…' : 'Create Doctor Account'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ---- Patient onboarding form (roleChoice === 'patient') ----
  return (
    <div className="shell">
      <div className="card wide">
        <div className="row-between">
          <h1>Patient Registration</h1>
          <button className="ghost" onClick={handleLogout}>Log out</button>
        </div>
        <form onSubmit={handlePatientSubmit} className="grid-form">
          <label>
            Full Name
            <input required value={form.Name} onChange={(e) => updateField('Name', e.target.value)} />
          </label>
          <label>
            Gender
            <select required value={form.Gender} onChange={(e) => updateField('Gender', e.target.value)}>
              <option value="" disabled>Select</option>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label>
            Age
            <input required type="number" min="0" value={form.Age} onChange={(e) => updateField('Age', e.target.value)} />
          </label>
          <label>
            Date of Birth
            <input required type="date" value={form.DOB} onChange={(e) => updateField('DOB', e.target.value)} />
          </label>
          <label>
            Contact Email
            <input type="email" value={form.Email} onChange={(e) => updateField('Email', e.target.value)} />
          </label>
          <label>
            Phone Number
            <input required value={form.Phone_Number} onChange={(e) => updateField('Phone_Number', e.target.value)} />
          </label>
          <label>
            Blood Group
            <select value={form.Blood_Group} onChange={(e) => updateField('Blood_Group', e.target.value)}>
              {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </label>
          <label>
            Allergies
            <input value={form.Allergies} onChange={(e) => updateField('Allergies', e.target.value)} />
          </label>
          <label>
            Emergency Contact
            <input required value={form.Emergency_contact} onChange={(e) => updateField('Emergency_contact', e.target.value)} />
          </label>
          <label>
            ABHA ID
            <input value={form.ABHA_ID} onChange={(e) => updateField('ABHA_ID', e.target.value)} />
          </label>
          {formError && <p className="error span-2">{formError}</p>}
          <button type="submit" disabled={formLoading} className="span-2">
            {formLoading ? 'Saving…' : 'Save Patient Record'}
          </button>
        </form>
      </div>
    </div>
  )
}

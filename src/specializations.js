// Shared between the doctor signup form (dropdown) and the doctor
// dashboard (specialization-based patient filtering).

export const SPECIALIZATIONS = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Endocrinologist',
  'ENT Specialist',
  'Gastroenterologist',
  'General Surgeon',
  'Gynecologist',
  'Nephrologist',
  'Neurologist',
  'Oncologist',
  'Ophthalmologist',
  'Orthopedic',
  'Pediatrician',
  'Psychiatrist',
  'Pulmonologist',
  'Radiologist',
  'Urologist',
  'Dentist',
  'Other',
]

// Keyword sets used to match a patient's Patient_History diagnosis/symptoms
// text to a specialization. This is a simple heuristic, NOT a real
// doctor-patient assignment system — there's no ground truth linking a
// patient to a specific doctor's field. 'General Physician' and 'Other'
// are deliberately left out of this map, so they fall back to seeing every
// patient, matching how a generalist actually works.
export const SPECIALIZATION_KEYWORDS = {
  Cardiologist: ['heart', 'cardiac', 'chest pain', 'hypertension', 'blood pressure', 'arrhythmia', 'palpitation'],
  Dermatologist: ['skin', 'rash', 'acne', 'eczema', 'psoriasis', 'dermat'],
  Endocrinologist: ['diabetes', 'thyroid', 'hormone', 'insulin', 'endocrine'],
  'ENT Specialist': ['ear', 'nose', 'throat', 'sinus', 'tonsil', 'hearing'],
  Gastroenterologist: ['stomach', 'abdominal', 'liver', 'gastric', 'digestive', 'bowel', 'ulcer'],
  'General Surgeon': ['surgery', 'appendix', 'hernia', 'surgical'],
  Gynecologist: ['pregnancy', 'menstrual', 'uterus', 'ovarian', 'gynec'],
  Nephrologist: ['kidney', 'renal', 'dialysis'],
  Neurologist: ['headache', 'migraine', 'seizure', 'stroke', 'nerve', 'neuro'],
  Oncologist: ['cancer', 'tumor', 'oncology', 'chemo'],
  Ophthalmologist: ['eye', 'vision', 'cataract', 'retina'],
  Orthopedic: ['bone', 'fracture', 'joint', 'back pain', 'orthopedic', 'arthritis'],
  Pediatrician: ['child', 'infant', 'pediatric', 'vaccination'],
  Psychiatrist: ['anxiety', 'depression', 'mental', 'psychiatric', 'stress'],
  Pulmonologist: ['lung', 'cough', 'asthma', 'breathing', 'respiratory', 'pneumonia'],
  Radiologist: ['imaging', 'x-ray', 'scan', 'mri', 'ct'],
  Urologist: ['urinary', 'bladder', 'prostate', 'kidney stone'],
  Dentist: ['tooth', 'dental', 'gum', 'cavity'],
}

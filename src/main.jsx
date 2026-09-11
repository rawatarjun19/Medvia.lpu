import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import EmergencyPage from './EmergencyPage.jsx'
import DocumentUploadPage from './DocumentUploadPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public routes — no login. These are what a scanned QR code opens. */}
        <Route path="/emergency/:patientId" element={<EmergencyPage />} />
        <Route path="/upload/:sessionId" element={<DocumentUploadPage />} />
        {/* Everything else (login, patient view, doctor dashboard) stays in App */}
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

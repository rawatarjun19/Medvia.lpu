import { QRCodeSVG } from 'qrcode.react'

// Shown on the patient's own record page. Generates a QR code that, when
// scanned by anyone (no app, no login), opens the public /emergency/:id page
// with just blood group, allergies, and emergency contact.
export default function EmergencyQRCard({ patient }) {
  const url = `${window.location.origin}/emergency/${patient.id}`

  return (
    <div className="history-section emergency-qr-section">
      <div className="row-between">
        <h2>Emergency QR Code</h2>
      </div>
      <p className="muted">
        Print this and keep it in your wallet, on a wristband, or as your phone lock screen.
        Scanning it shows your blood group, allergies, and emergency contact instantly — no
        login or app needed.
      </p>
      <div className="emergency-qr-block">
        <QRCodeSVG value={url} size={160} bgColor="#ffffff" fgColor="#16201c" />
        <div className="emergency-qr-actions">
          <a href={url} target="_blank" rel="noreferrer" className="muted">
            {url}
          </a>
          <button className="ghost" type="button" onClick={() => window.print()}>
            Print card
          </button>
        </div>
      </div>
    </div>
  )
}

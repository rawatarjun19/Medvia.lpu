import React from "react";
import pmPhoto from "./assets/pm-photo.jpg"; 
import chancellorPhoto from "./assets/chancellor-photo.jpg";
import "./HomeScreen.css";

const HomeScreen = (props) => {
  return (
    <div className="shell" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div className="card wide" style={{ maxWidth: "900px", width: "100%", textAlign: "left" }}>
        <div className="tricolor-strip"></div>

        <header className="home-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
          <div className="header-brand" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <svg className="brand-emblem" width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="19" fill="none" stroke="#0B3B60" strokeWidth="1.5" />
              <circle cx="20" cy="20" r="3" fill="#0B3B60" />
              {[...Array(24)].map((item, index) => {
                let angle = (index * 360) / 24;
                let rad = (angle * 3.14159) / 180;
                let x1 = 20 + 5 * Math.cos(rad);
                let y1 = 20 + 5 * Math.sin(rad);
                let x2 = 20 + 16 * Math.cos(rad);
                let y2 = 20 + 16 * Math.sin(rad);
                return (
                  <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0B3B60" strokeWidth="1" />
                );
              })}
            </svg>
            
            <div className="brand-text">
              <span className="brand-title" style={{fontWeight: "bold", fontSize: "22px", display: "block"}}>Medvia</span>
              <span className="brand-subtitle muted" style={{fontSize: "12px"}}>Ayushman Bharat Digital Mission Enabled Patient Portal</span>
            </div>
          </div>

          <div className="header-officials" style={{ display: "flex", gap: "16px" }}>
            <div className="official" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img src={pmPhoto} alt="Hon'ble Prime Minister" className="official-photo" style={{ width: "35px", height: "35px", borderRadius: "50%", objectFit: "cover" }} />
              <div className="official-text" style={{ fontSize: "11px" }}>
                <span className="official-name" style={{ fontWeight: "600", display: "block" }}>Shri Narendra Modi</span>
                <span className="official-title muted">Hon'ble PM of India</span>
              </div>
            </div>
            
            <div className="official" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img src={chancellorPhoto} alt="Chancellor" className="official-photo" style={{ width: "35px", height: "35px", borderRadius: "50%", objectFit: "cover" }} />
              <div className="official-text" style={{ fontSize: "11px" }}>
                <span className="official-name" style={{ fontWeight: "600", display: "block" }}>Ashok Mittal</span>
                <span className="official-title muted">Chancellor, LPU</span>
              </div>
            </div>
          </div>
        </header>

        <main className="home-hero" style={{ textAlign: "center", margin: "20px 0" }}>
          <span className="home-tag muted" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>A Digital India Initiative 🇮🇳</span>
          <h1 className="home-heading" style={{ fontSize: "36px", margin: "10px 0" }}>Medvia Patient Portal</h1>
          <p className="home-subheading muted" style={{ maxWidth: "600px", margin: "0 auto 24px auto" }}>
            A multilingual, voice-enabled patient intake system, built to serve every citizen in their own language.
          </p>

          <div className="home-actions" style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap", position: "relative", zIndex: 10 }}>
            <button className="home-btn primary" onClick={props.onStart} style={{cursor: "pointer"}}>
              Start Patient Check-in
            </button>
            <button 
              className="home-btn primary" 
              onClick={props.onStartAyush} 
              style={{cursor: "pointer", backgroundColor: "#2e7d32", borderColor: "#2e7d32"}}
            >
              🌿 AYUSH Check-in
            </button>
            
            {/* Foolproof Direct Link with high z-index */}
            <a 
  href="https://probackendmedvia.netlify.app/" 
  target="_blank" 
  rel="noopener noreferrer"
  className="home-btn secondary ghost"
  style={{ 
    display: "inline-flex", 
    alignItems: "center", 
    justifyContent: "center", 
    textDecoration: "none", 
    cursor: "pointer",
    position: "relative",
    zIndex: 9999,
    pointerEvents: "auto",
    backgroundColor: "#0B3B60",
    color: "#FFFFFF",
    borderColor: "#0B3B60"
  }}
>
  Hospital Dashboard ↗
</a>
          </div>
        </main>

        <section className="home-features" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginTop: "32px", borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
          <div className="feature-card" style={{ textAlign: "center" }}>
            <svg className="feature-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto 8px auto", display: "block" }}>
              <path d="M12 3C7 3 3 6.5 3 11c0 2.5 1.3 4.7 3.3 6.2L5.5 21l4.2-1.7c.7.1 1.5.2 2.3.2 5 0 9-3.5 9-8s-4-8.5-9-8.5z" stroke="#0B3B60" strokeWidth="1.4" strokeLinejoin="round" />
              <circle cx="8.5" cy="11" r="0.9" fill="#0B3B60" />
              <circle cx="12" cy="11" r="0.9" fill="#0B3B60" />
              <circle cx="15.5" cy="11" r="0.9" fill="#0B3B60" />
            </svg>
            <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>14+ Languages</h3>
            <p className="muted" style={{ fontSize: "0.85rem" }}>Voice and text support across major Indian languages.</p>
          </div>

          <div className="feature-card" style={{ textAlign: "center" }}>
            <svg className="feature-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto 8px auto", display: "block" }}>
              <rect x="9" y="2" width="6" height="12" rx="3" stroke="#0B3B60" strokeWidth="1.4" />
              <path d="M5 11a7 7 0 0014 0" stroke="#0B3B60" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="12" y1="18" x2="12" y2="22" stroke="#0B3B60" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="8" y1="22" x2="16" y2="22" stroke="#0B3B60" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>Voice First</h3>
            <p className="muted" style={{ fontSize: "0.85rem" }}>Speak your symptoms, no typing required.</p>
          </div>

          <div className="feature-card" style={{ textAlign: "center" }}>
            <svg className="feature-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto 8px auto", display: "block" }}>
              <rect x="5" y="10" width="14" height="10" rx="2" stroke="#0B3B60" strokeWidth="1.4" />
              <path d="M8 10V7a4 4 0 018 0v3" stroke="#0B3B60" strokeWidth="1.4" />
              <circle cx="12" cy="15" r="1.3" fill="#0B3B60" />
            </svg>
            <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>ABHA Linked</h3>
            <p className="muted" style={{ fontSize: "0.85rem" }}>Secure, DPDP-compliant health data handling.</p>
          </div>
        </section>

        <footer className="home-footer" style={{ textAlign: "center", marginTop: "32px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
          <p className="muted" style={{ fontSize: "0.75rem" }}>Government of India · Ministry of Health and Family Welfare (Prototype) · {new Date().getFullYear()}</p>
          <button
            onClick={props.onAbout}
            style={{ background: "none", border: "none", color: "#00fef1", fontSize: "11px", textDecoration: "underline", cursor: "pointer", marginTop: "6px", padding: 0 }}
          >
            About this project
          </button>
        </footer>
      </div>
    </div>
  );
}

export default HomeScreen;
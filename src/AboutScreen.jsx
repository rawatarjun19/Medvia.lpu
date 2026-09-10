import "./AboutScreen.css";

function AboutScreen({ onBack }) {
  return (
    <div className="about-container">
      <div className="tricolor-strip" />

      <header className="about-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Home
        </button>
      </header>

      <main className="about-content">
        <h1 className="about-heading">About Medvia</h1>

        <p className="about-text">
          Medvia is a multilingual, voice-enabled patient intake system designed to make healthcare
          more accessible to every citizen — regardless of the language they speak or their comfort
          with technology.
        </p>

        <div className="about-section">
          <h2>The Problem</h2>
          <p>
            Language barriers and low digital literacy often prevent patients from clearly
            communicating their symptoms to healthcare staff, especially in linguistically diverse
            regions of India. This can delay diagnosis and reduce the quality of care.
          </p>
        </div>

        <div className="about-section">
          <h2>Our Approach</h2>
          <p>
            Medvia lets patients interact in their own language, either by speaking or by touch,
            through a simple guided conversation. Responses are structured into a format doctors
            and staff can review quickly, while sensitive health information is handled in line
            with DPDP and ABDM compliance guidelines.
          </p>
        </div>

        <div className="about-section">
          <h2>Key Features</h2>
          <ul className="about-list">
            <li>Support for 14+ Indian languages, with voice and touch input</li>
            <li>ABHA-linked, consent-first patient onboarding</li>
            <li>Dynamic, schema-driven questionnaire engine</li>
            <li>Built with accessibility (WCAG 2.1 AA) as a core requirement, not an afterthought</li>
          </ul>
        </div>

        <div className="about-section">
          <h2>Built For</h2>
          <p>[Hackathon Name] · Team Medvia</p>
        </div>
      </main>

      <footer className="about-footer">
        <p>Government of India · Ministry of Health and Family Welfare (Prototype) · {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default AboutScreen;
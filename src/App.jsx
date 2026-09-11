import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "./supabaseClient";
import HomeScreen from "./HomeScreen";
import AboutScreen from "./AboutScreen";
import LanguageSelect from "./LanguageSelect";
import ConsentScreen from "./ConsentScreen";
import ChiefComplaint from "./ChiefComplaint";
import QuestionEngine from "./QuestionEngine";
import ThankYouScreen from "./ThankYouScreen";
import AyushAssessment from "./AyushAssessment";

function App() {
  const { i18n } = useTranslation();
  const [step, setStep] = useState("home");
  const [mode, setMode] = useState("regular");
  const [complaintId, setComplaintId] = useState(null);
  const [tokenNumber, setTokenNumber] = useState(null);
  const [patientId, setPatientId] = useState(null);

  function handleStartRegular() {
    setMode("regular");
    setStep("language");
  }

  function handleStartAyush() {
    setMode("ayush");
    setStep("language");
  }

  function handleLanguageSelect(code) {
    i18n.changeLanguage(code);
    setStep("consent");
  }

  function handleConsentComplete(token, id) {
    setTokenNumber(token);
    setPatientId(id);
    if (mode === "ayush") {
      setStep("ayush");
    } else {
      setStep("complaint");
    }
  }

  function handleComplaintSelect(id) {
    setComplaintId(id);
    setStep("questions");
  }

  async function saveAnswersToDatabase(answers, type) {
    if (!patientId) return;
    try {
      await supabase.from("medical_records").insert([
        {
          patient_id: patientId,
          document_name: type === "ayush" ? "AYUSH Assessment" : "Patient Intake",
          document_type: type,
          extracted_text: JSON.stringify(answers),
        },
      ]);
    } catch (err) {
      console.error("Failed to save answers:", err.message);
    }
  }

  async function handleQuestionsFinish(allAnswers) {
    console.log("Sab answers:", allAnswers);
    await saveAnswersToDatabase(allAnswers, "intake_conversation");
    setStep("done");
  }

  async function handleAyushFinish(ayushAnswers) {
    console.log("AYUSH answers:", ayushAnswers);
    await saveAnswersToDatabase(ayushAnswers, "ayush_assessment");
    setStep("done");
  }

  return (
    <>
      {step === "home" && (
        <HomeScreen
          onStart={handleStartRegular}
          onStartAyush={handleStartAyush}
          onAbout={() => setStep("about")}
          onDashboard={() => {}}
        />
      )}
      {step === "about" && <AboutScreen onBack={() => setStep("home")} />}
      {step === "language" && <LanguageSelect onSelect={handleLanguageSelect} />}
      {step === "consent" && (
        <ConsentScreen lang={i18n.language} onComplete={handleConsentComplete} />
      )}
      {step === "complaint" && (
        <ChiefComplaint lang={i18n.language} onSelect={handleComplaintSelect} />
      )}
      {step === "questions" && (
        <QuestionEngine lang={i18n.language} complaintId={complaintId} onFinish={handleQuestionsFinish} />
      )}
      {step === "ayush" && (
        <AyushAssessment lang={i18n.language} onComplete={handleAyushFinish} />
      )}
      {step === "done" && <ThankYouScreen lang={i18n.language} token={tokenNumber} />}
    </>
  );
}

export default App;
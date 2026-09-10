import { useState } from "react";
import { useTranslation } from "react-i18next";
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

  function handleConsentComplete() {
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

  function handleQuestionsFinish(allAnswers) {
    console.log("Sab answers:", allAnswers);
    setStep("done");
  }

  function handleAyushFinish(ayushAnswers) {
    console.log("AYUSH answers:", ayushAnswers);
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
      {step === "done" && <ThankYouScreen lang={i18n.language} />}
    </>
  );
}

export default App;
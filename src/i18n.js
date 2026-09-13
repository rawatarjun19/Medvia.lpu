import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Agar resources alag file mein hain toh unhe import kar sakte ho, yahan basic setup hai
const resources = {
  en: {
    translation: {
      consentHeading: "Patient Consent & ABHA Verification",
      abhaLabel: "Enter 14-digit ABHA ID",
      abhaPlaceholder: "e.g., 14-1234-5678-9012",
      infoLine1: "Your health records will be securely linked.",
      infoLine2: "You can revoke consent at any time.",
      infoLine3: "Data is protected under NDHM guidelines.",
      consentCheckbox: "I agree to share my health records for clinical assessment.",
      continueButton: "Continue",
      errorAbha: "Please enter a valid 14-digit ABHA ID.",
      errorConsent: "You must agree to the terms to proceed.",
    },
  },
  hi: {
    translation: {
      consentHeading: "रोगी सहमति और आभा आईडी सत्यापन",
      abhaLabel: "14-अंकों की आभा (ABHA) आईडी दर्ज करें",
      abhaPlaceholder: "जैसे, 14-1234-5678-9012",
      infoLine1: "आपके स्वास्थ्य रिकॉर्ड सुरक्षित रूप से लिंक किए जाएंगे।",
      infoLine2: "आप किसी भी समय सहमति वापस ले सकते हैं।",
      infoLine3: "डेटा एनडीएचएम दिशानिर्देशों के तहत सुरक्षित है।",
      consentCheckbox: "मैं clinical assessment के लिए अपने स्वास्थ्य रिकॉर्ड साझा करने同意 करता/करती हूँ।",
      continueButton: "आगे बढ़ें",
      errorAbha: "कृपया वैध 14-अंकों की आभा आईडी दर्ज करें।",
      errorConsent: "आगे बढ़ने के लिए आपको सहमति देनी होगी।",
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
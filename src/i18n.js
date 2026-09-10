import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      consentHeading: "Please share your information and consent",
      abhaLabel: "ABHA ID",
      abhaPlaceholder: "14 digit ABHA ID",
      infoLine1: "We will only use your health information for treatment.",
      infoLine2: "This information will be kept secure and not shared with third parties.",
      infoLine3: "You can withdraw your consent at any time.",
      consentCheckbox: "I agree with the information above",
      continueButton: "Continue",
      errorAbha: "ABHA ID must be 14 digits",
      errorConsent: "You must agree to continue",
      chiefComplaintHeading: "What is your main problem?",
      complaintFever: "Fever",
      complaintCough: "Cough / Cold",
      complaintPain: "Body Pain",
      complaintOther: "Something else",
      otherDescribe: "Please describe your problem in detail",
      yesAnswer: "Yes",
      noAnswer: "No",
    },
  },
  hi: {
    translation: {
      consentHeading: "अपनी जानकारी और सहमति दें",
      abhaLabel: "ABHA ID",
      abhaPlaceholder: "14 अंकों की ABHA ID",
      infoLine1: "हम आपकी स्वास्थ्य जानकारी केवल इलाज के लिए उपयोग करेंगे।",
      infoLine2: "यह जानकारी सुरक्षित रखी जाएगी, किसी तीसरे पक्ष के साथ साझा नहीं होगी।",
      infoLine3: "आप किसी भी समय अपनी सहमति वापस ले सकते हैं।",
      consentCheckbox: "मैं ऊपर दी गई जानकारी से सहमत हूं",
      continueButton: "आगे बढ़ें",
      errorAbha: "ABHA ID 14 अंकों की होनी चाहिए",
      errorConsent: "आगे बढ़ने के लिए सहमति देना ज़रूरी है",
      chiefComplaintHeading: "आपकी मुख्य समस्या क्या है?",
      complaintFever: "बुखार",
      complaintCough: "खांसी / ज़ुकाम",
      complaintPain: "शरीर में दर्द",
      complaintOther: "कुछ और",
      otherDescribe: "कृपया अपनी समस्या विस्तार से बताएं",
      yesAnswer: "हां",
      noAnswer: "नहीं",
    },
  },
  pa: {
    translation: {
      consentHeading: "ਆਪਣੀ ਜਾਣਕਾਰੀ ਅਤੇ ਸਹਿਮਤੀ ਦਿਓ",
      abhaLabel: "ABHA ID",
      abhaPlaceholder: "14 ਅੰਕਾਂ ਦੀ ABHA ID",
      infoLine1: "ਅਸੀਂ ਤੁਹਾਡੀ ਸਿਹਤ ਜਾਣਕਾਰੀ ਸਿਰਫ਼ ਇਲਾਜ ਲਈ ਵਰਤਾਂਗੇ।",
      infoLine2: "ਇਹ ਜਾਣਕਾਰੀ ਸੁਰੱਖਿਅਤ ਰੱਖੀ ਜਾਵੇਗੀ, ਕਿਸੇ ਤੀਜੀ ਧਿਰ ਨਾਲ ਸਾਂਝੀ ਨਹੀਂ ਹੋਵੇਗੀ।",
      infoLine3: "ਤੁਸੀਂ ਕਿਸੇ ਵੀ ਸਮੇਂ ਆਪਣੀ ਸਹਿਮਤੀ ਵਾਪਸ ਲੈ ਸਕਦੇ ਹੋ।",
      consentCheckbox: "ਮੈਂ ਉੱਪਰ ਦਿੱਤੀ ਜਾਣਕਾਰੀ ਨਾਲ ਸਹਿਮਤ ਹਾਂ",
      continueButton: "ਅੱਗੇ ਵਧੋ",
      errorAbha: "ABHA ID 14 ਅੰਕਾਂ ਦੀ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ",
      errorConsent: "ਅੱਗੇ ਵਧਣ ਲਈ ਸਹਿਮਤੀ ਦੇਣੀ ਜ਼ਰੂਰੀ ਹੈ",
      chiefComplaintHeading: "ਤੁਹਾਡੀ ਮੁੱਖ ਸਮੱਸਿਆ ਕੀ ਹੈ?",
      complaintFever: "ਬੁਖਾਰ",
      complaintCough: "ਖੰਘ / ਜ਼ੁਕਾਮ",
      complaintPain: "ਸਰੀਰ ਵਿੱਚ ਦਰਦ",
      complaintOther: "ਕੁਝ ਹੋਰ",
      otherDescribe: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਸਮੱਸਿਆ ਵਿਸਥਾਰ ਵਿੱਚ ਦੱਸੋ",
      yesAnswer: "ਹਾਂ",
      noAnswer: "ਨਹੀਂ",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
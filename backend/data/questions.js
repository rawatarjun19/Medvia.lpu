const questions = {
    fever: [
        { id: "f1", type: "yesno", text: { en: "Do you have a fever right now?", hi: "क्या आपको अभी बुखार है?", pa: "ਕੀ ਤੁਹਾਨੂੰ ਹੁਣ ਬੁਖਾਰ ਹੈ?" } },
        { id: "f2", type: "mcq", text: { en: "How many days has the fever lasted?", hi: "बुखार कितने दिनों से है?", pa: "ਬੁਖਾਰ ਕਿੰਨੇ ਦਿਨਾਂ ਤੋਂ ਹੈ?" }, options: { en: ["1 day", "2-3 days", "More than a week", "Not sure"], hi: ["1 दिन", "2-3 दिन", "1 हफ्ते से ज़्यादा", "पता नहीं"], pa: ["1 ਦਿਨ", "2-3 ਦਿਨ", "1 ਹਫ਼ਤੇ ਤੋਂ ਵੱਧ", "ਪਤਾ ਨਹੀਂ"] } }
    ],
    cough: [
        { id: "c1", type: "yesno", text: { en: "Is there mucus/phlegm when you cough?", hi: "क्या खांसी में बलगम आता है?", pa: "ਕੀ ਖੰਘ ਵਿੱਚ ਬਲਗਮ ਆਉਂਦਾ ਹੈ?" } }
    ],
    pain: [
        { id: "p1", type: "mcq", text: { en: "Where is the pain located?", hi: "दर्द कहाँ हो रहा है?", pa: "ਦਰਦ ਕਿੱਥੇ ਹੋ ਰਿਹਾ ਹੈ?" }, options: { en: ["Head", "Stomach", "Chest", "Back", "Other"], hi: ["सिर", "पेट", "छाती", "पीठ", "अन्य"], pa: ["ਸਿਰ", "ਢਿੱਡ", "ਛਾਤੀ", "ਪਿੱਠ", "ਹੋਰ"] } }
    ],
    other: [
        { id: "o1", type: "text", text: { en: "Please describe your problem in detail", hi: "कृपया अपनी समस्या विस्तार से बताएं", pa: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਸਮੱਸਿਆ ਵਿਸਥਾਰ ਵਿੱਚ ਦੱਸੋ" } }
    ],
    general: [
        { id: "g1", type: "text", text: { en: "Any other symptoms? (optional)", hi: "कोई और लक्षण? (वैकल्पिक)", pa: "ਕੋਈ ਹੋਰ ਲੱਛਣ? (ਚੋਣਵਾਂ)" } }
    ],
    socrates: [
        { id: "s1", type: "text", text: { en: "When did it start, and did it begin suddenly or gradually?", hi: "यह कब शुरू हुआ और अचानक या धीरे-धीरे शुरू हुआ?", pa: "ਇਹ ਕਦੋਂ ਸ਼ੁਰੂ ਹੋਇਆ ਅਤੇ ਅਚਾਨਕ ਜਾਂ ਹੌਲੀ-ਹੌਲੀ?" } },
        { id: "s2", type: "text", text: { en: "What makes it better or worse?", hi: "किस चीज़ से यह बेहतर या बदतर होता है?", pa: "ਕਿਹੜੀ ਚੀਜ਼ ਨਾਲ ਇਹ ਬਿਹਤਰ ਜਾਂ ਮਾੜਾ ਹੁੰਦਾ ਹੈ?" } },
        { id: "s3", type: "text", text: { en: "How severe is it from 0 to 10?", hi: "0 से 10 के बीच यह कितना तेज़ है?", pa: "0 ਤੋਂ 10 ਤੱਕ ਇਹ ਕਿੰਨਾ ਤੇਜ਼ ਹੈ?" } }
    ]
};

function localizedQuestion(question, language = "en") {
    const supportedLanguage = question.text[language] ? language : "en";
    return { ...question, text: question.text[supportedLanguage], options: question.options && question.options[supportedLanguage] };
}

module.exports = { questions, localizedQuestion };
export const AYUSH_SECTIONS = [
  {
    id: "prakriti",
    title: {
      en: "Section 1: About Your Body (Prakriti — one-time, ask only on first visit)",
      hi: "खंड 1: आपके शरीर के बारे में (प्रकृति — पहली बार)"
    },
    questions: [
      {
        id: "body_build",
        text: {
          en: "How is your body build?",
          hi: "आपकी शारीरिक बनावट कैसी है?"
        },
        options: [
          { dosha: "vata", label: { en: "a) Thin, light, small bones", hi: "a) दुबला, हल्का, पतली हड्डियां" } },
          { dosha: "pitta", label: { en: "b) Medium, strong, athletic", hi: "b) मध्यम, मजबूत, एथलेटिक" } },
          { dosha: "kapha", label: { en: "c) Heavy, solid, gains weight easily", hi: "c) भारी, मजबूत, वजन आसानी से बढ़ता है" } }
        ]
      },
      {
        id: "skin_type",
        text: {
          en: "How is your skin usually?",
          hi: "आपकी त्वचा सामान्यतः कैसी है?"
        },
        options: [
          { dosha: "vata", label: { en: "a) Dry, rough, thin", hi: "a) रूखी, खुरदरी, पतली" } },
          { dosha: "pitta", label: { en: "b) Warm, soft, gets red/rashes easily", hi: "b) गर्म, मुलायम, आसानी से लाल होना या चकत्ते पड़ना" } },
          { dosha: "kapha", label: { en: "c) Thick, oily, smooth, cool", hi: "c) मोटी, तेलीय, चिकनी, ठंडी" } }
        ]
      },
      {
        id: "appetite_baseline",
        text: {
          en: "How is your appetite normally (your whole life)?",
          hi: "सामान्यतः आपकी भूख कैसी रहती है (पूरे जीवन)?"
        },
        options: [
          { dosha: "vata", label: { en: "a) Changes a lot — sometimes hungry, sometimes not", hi: "a) बहुत बदलती है — कभी भूख, कभी नहीं" } },
          { dosha: "pitta", label: { en: "b) Strong — get irritable if I miss a meal", hi: "b) तेज — खाना छूटने पर चिड़चिड़ापन होना" } },
          { dosha: "kapha", label: { en: "c) Steady but can skip a meal without trouble", hi: "c) स्थिर लेकिन बिना परेशानी के खाना छोड़ सकते हैं" } }
        ]
      },
      {
        id: "sleep_pattern",
        text: {
          en: "How do you usually sleep?",
          hi: "आप आमतौर पर कैसे सोते हैं?"
        },
        options: [
          { dosha: "vata", label: { en: "a) Light sleeper, wakes up often", hi: "a) हल्की नींद, बार-बार खुलना" } },
          { dosha: "pitta", label: { en: "b) Medium sleep, wakes up fresh", hi: "b) मध्यम नींद, तरोताजा उठना" } },
          { dosha: "kapha", label: { en: "c) Deep sleeper, hard to wake up", hi: "c) गहरी नींद, उठना मुश्किल होना" } }
        ]
      },
      {
        id: "weather_reaction",
        text: {
          en: "How do you react to weather?",
          hi: "मौसम पर आपकी क्या प्रतिक्रिया होती है?"
        },
        options: [
          { dosha: "vata", label: { en: "a) Dislike cold and wind", hi: "a) ठंड और हवा पसंद नहीं" } },
          { dosha: "pitta", label: { en: "b) Dislike heat and sun", hi: "b) गर्मी और धूप पसंद नहीं" } },
          { dosha: "kapha", label: { en: "c) Dislike cold and damp/wet weather", hi: "c) ठंड और सीलन/गीला मौसम पसंद नहीं" } }
        ]
      },
      {
        id: "stress_handling",
        text: {
          en: "How do you handle stress normally?",
          hi: "आप सामान्यतः तनाव को कैसे संभालते हैं?"
        },
        options: [
          { dosha: "vata", label: { en: "a) I worry and get anxious", hi: "a) मैं चिंता करता हूँ और बेचैन हो जाता हूँ" } },
          { dosha: "pitta", label: { en: "b) I get angry or irritated", hi: "b) मुझे गुस्सा या चिड़चिड़ाहट होती है" } },
          { dosha: "kapha", label: { en: "c) I stay calm, sometimes too calm (avoid dealing with it)", hi: "c) मैं शांत रहता हूँ, कभी-कभी बहुत ज्यादा शांत (सामना करने से बचना)" } }
        ]
      }
    ]
  },
  {
    id: "vikriti",
    title: {
      en: "Section 2: How You Feel Right Now (Vikriti — ask every visit)",
      hi: "खंड 2: आप अभी कैसा महसूस कर रहे हैं (विक्रति)"
    },
    questions: [
      {
        id: "problem_duration",
        text: {
          en: "Since when have you had this problem?",
          hi: "आपको यह समस्या कब से है?"
        },
        options: [
          { dosha: "vata", label: { en: "a) Few days", hi: "a) कुछ दिन" } },
          { dosha: "pitta", label: { en: "b) Few weeks", hi: "b) कुछ सप्ताह" } },
          { dosha: "kapha", label: { en: "c) Few months or more", hi: "c) कुछ महीने या उससे अधिक" } }
        ]
      },
      {
        id: "worse_time",
        text: {
          en: "Is your problem worse at any particular time?",
          hi: "क्या आपकी समस्या किसी विशेष समय पर बढ़ जाती है?"
        },
        options: [
          { dosha: "vata", label: { en: "a) Early morning / late evening", hi: "a) सुबह-सुबह / देर शाम" } },
          { dosha: "pitta", label: { en: "b) Afternoon / midday", hi: "b) दोपहर / दिन का मध्य भाग" } },
          { dosha: "kapha", label: { en: "c) Night / after meals", hi: "c) रात / भोजन के बाद" } }
        ]
      },
      {
        id: "makes_worse",
        text: {
          en: "What makes it feel worse?",
          hi: "किस चीज़ से यह और बदतर महसूस होता है?"
        },
        options: [
          { dosha: "vata", label: { en: "a) Cold, wind, hunger, skipping meals", hi: "a) ठंड, हवा, भूख, खाना छोड़ना" } },
          { dosha: "pitta", label: { en: "b) Heat, sun, spicy food, anger", hi: "b) गर्मी, धूप, मसालेदार खाना, गुस्सा" } },
          { dosha: "kapha", label: { en: "c) Cold, wet weather, oily/heavy food, too much rest", hi: "c) ठंड, गीला मौसम, तेलीय/भारी खाना, बहुत ज्यादा आराम" } }
        ]
      },
      {
        id: "makes_better",
        text: {
          en: "What makes it feel better?",
          hi: "किस चीज़ से राहत महसूस होती है?"
        },
        options: [
          { dosha: "vata", label: { en: "a) Warmth, rest, regular meals", hi: "a) गर्ماहट, आराम, नियमित भोजन" } },
          { dosha: "pitta", label: { en: "b) Cool things, calm environment", hi: "b) ठंडी चीजें, शांत वातावरण" } },
          { dosha: "kapha", label: { en: "c) Movement, warmth, light food", hi: "c) हलचल, गर्माहट, हल्का भोजन" } }
        ]
      }
    ]
  },
  {
    id: "agni",
    title: {
      en: "Section 3: Digestion (Agni)",
      hi: "खंड 3: पाचन (अग्नि)"
    },
    questions: [
      {
        id: "hunger_pattern",
        text: {
          en: "How is your hunger?",
          hi: "आपकी भूख कैसी है?"
        },
        options: [
          { dosha: "vata", label: { en: "a) Irregular — some days no hunger at all", hi: "a) अनियमित — कुछ दिन बिल्कुल भूख नहीं लगती" } },
          { dosha: "pitta", label: { en: "b) Strong — get uncomfortable if delayed", hi: "b) तेज — देरी होने पर बेचैनी होती है" } },
          { dosha: "kapha", label: { en: "c) Low but steady", hi: "c) कम लेकिन स्थिर" } }
        ]
      },
      {
        id: "post_eating",
        text: {
          en: "After eating, how do you usually feel?",
          hi: "खाने के बाद आप आमतौर पर कैसा महसूस करते हैं?"
        },
        options: [
          { dosha: "vata", label: { en: "a) Bloated, gassy", hi: "a) पेट फूलना, गैस बनना" } },
          { dosha: "pitta", label: { en: "b) Fine, sometimes acidity/burning", hi: "b) ठीक, कभी-कभी एसिडिटी / जलन" } },
          { dosha: "kapha", label: { en: "c) Heavy, sleepy", hi: "c) भारीपन, नींद आना" } }
        ]
      },
      {
        id: "thirst_pattern",
        text: {
          en: "How is your thirst?",
          hi: "आपको प्यास कैसी लगती है?"
        },
        options: [
          { dosha: "vata", label: { en: "a) Changes a lot", hi: "a) बहुत बदलती है" } },
          { dosha: "pitta", label: { en: "b) Always thirsty", hi: "b) हमेशा प्यास लगना" } },
          { dosha: "kapha", label: { en: "c) Rarely thirsty", hi: "c) शायद ही कभी प्यास लगना" } }
        ]
      }
    ]
  },
  {
    id: "koshtha",
    title: {
      en: "Section 4: Bowel Movements (Koshtha)",
      hi: "खंड 4: मलत्याग (कोकोष्ठ)"
    },
    questions: [
      {
        id: "toilet_frequency",
        text: {
          en: "How often do you go to the toilet (bowel motion)?",
          hi: "आप शौचालय (मल त्याग के लिए) कितनी बार जाते हैं?"
        },
        options: [
          { dosha: "vata", label: { en: "a) Irregular, sometimes constipated", hi: "a) अनियमित, कभी-कभी कब्ज" } },
          { dosha: "pitta", label: { en: "b) Once or more daily, sometimes loose", hi: "b) दिन में एक या अधिक बार, कभी-कभी ढीला मल" } },
          { dosha: "kapha", label: { en: "c) Once daily, regular, sometimes slow/hard", hi: "c) दिन में एक बार, नियमित, कभी-कभी धीमा/कठिन" } }
        ]
      },
      {
        id: "skip_meal_stomach",
        text: {
          en: "If you skip a meal, what happens to your stomach?",
          hi: "यदि आप एक समय का भोजन छोड़ दें, तो आपके पेट पर क्या असर पड़ता है?"
        },
        options: [
          { dosha: "vata", label: { en: "a) Gets constipated", hi: "a) कब्ज हो जाता है" } },
          { dosha: "pitta", label: { en: "b) No major change", hi: "b) कोई बड़ा बदलाव नहीं" } },
          { dosha: "kapha", label: { en: "c) No change, digestion stays fine", hi: "c) कोई बदलाव नहीं, पाचन ठीक रहता है" } }
        ]
      }
    ]
  },
  {
    id: "ahara_vihara",
    title: {
      en: "Section 5: Daily Habits (Ahara-Vihara)",
      hi: "खंड 5: दैनिक आदतें (आहार-विहार)"
    },
    questions: [
      {
        id: "meal_time",
        text: {
          en: "What time do you usually eat your meals?",
          hi: "आप आमतौर पर किस समय भोजन करते हैं?"
        },
        options: [
          { dosha: "vata", label: { en: "a) Different time every day", hi: "a) हर दिन अलग समय पर" } },
          { dosha: "pitta", label: { en: "b) Fixed times, get upset if delayed", hi: "b) निश्चित समय पर, देरी होने पर परेशानी होना" } },
          { dosha: "kapha", label: { en: "c) Fixed times, in no rush", hi: "c) निश्चित समय पर, कोई जल्दबाजी नहीं" } }
        ]
      },
      {
        id: "exercise_level",
        text: {
          en: "How much do you exercise/move in a day?",
          hi: "आप दिन में कितना व्यायाम या शारीरिक गतिविधि करते हैं?"
        },
        options: [
          { dosha: "vata", label: { en: "a) Very little", hi: "a) बहुत कम" } },
          { dosha: "pitta", label: { en: "b) Moderate", hi: "b) मध्यम" } },
          { dosha: "kapha", label: { en: "c) Very little, feel heavy/lazy to move", hi: "c) बहुत कम, हिलने-डुलने में भारीपन/आलस महसूस होना" } }
        ]
      },
      {
        id: "water_intake",
        text: {
          en: "How much water do you drink daily?",
          hi: "आप प्रतिदिन कितना पानी पीते हैं?"
        },
        options: [
          { dosha: "vata", label: { en: "a) Less than 4 glasses", hi: "a) 4 गिलास से कम" } },
          { dosha: "pitta", label: { en: "b) 4–8 glasses", hi: "b) 4–8 गिलास" } },
          { dosha: "kapha", label: { en: "c) More than 8 glasses", hi: "c) 8 गिलास से अधिक" } }
        ]
      },
      {
        id: "food_preference",
        text: {
          en: "What type of food do you prefer?",
          hi: "आप किस प्रकार का भोजन पसंद करते हैं?"
        },
        options: [
          { dosha: "vata", label: { en: "a) Warm, oily food", hi: "a) गर्म, तेलीय भोजन" } },
          { dosha: "pitta", label: { en: "b) Cool, light food", hi: "b) ठंडा, हल्का भोजन" } },
          { dosha: "kapha", label: { en: "c) Warm, light, spiced food", hi: "c) गर्म, हल्का, मसालेदार भोजन" } }
        ]
      }
    ]
  },
  {
    id: "nidana",
    title: {
      en: "Section 6: What Started This Problem (Nidana)",
      hi: "खंड 6: यह समस्या कैसे शुरू हुई (निदान)"
    },
    questions: [
      {
        id: "problem_cause",
        text: {
          en: "What do you think caused your problem?",
          hi: "आपके अनुसार आपकी समस्या का कारण क्या है?"
        },
        options: [
          { dosha: "vata", label: { en: "a) Stress / irregular routine / skipping meals", hi: "a) तनाव / अनियमित दिनचर्या / खाना छोड़ना" } },
          { dosha: "pitta", label: { en: "b) Too much heat, sun, spicy/oily food, anger", hi: "b) अत्यधिक गर्मी, धूप, मसालेदार/तेलीय भोजन, गुस्सा" } },
          { dosha: "kapha", label: { en: "c) Cold weather, oversleeping, heavy/oily food, lack of movement", hi: "c) ठंडा मौसम, अधिक सोना, भारी/तेलीय भोजन, हलचल की कमी" } }
        ]
      },
      {
        id: "life_event_trigger",
        text: {
          en: "Did this problem start after any big life event?",
          hi: "क्या यह समस्या जीवन की किसी बड़ी घटना के बाद शुरू हुई?"
        },
        options: [
          { dosha: "vata", label: { en: "a) Yes — emotional stress, travel, change in routine", hi: "a) हाँ — मानसिक तनाव, यात्रा, दिनचर्या में बदलाव" } },
          { dosha: "pitta", label: { en: "b) Yes — anger, conflict, overheating, sun exposure", hi: "b) हाँ — गुस्सा, विवाद, अत्यधिक गर्मी, धूप लगना" } },
          { dosha: "kapha", label: { en: "c) Yes — season change (monsoon/winter), overeating, inactivity", hi: "c) हाँ — मौसम परिवर्तन (मानसून/सर्दी), अति भोजन, निष्क्रियता" } }
        ]
      }
    ]
  }
];

export function calculateDosha(answers) {
  let vata = 0, pitta = 0, kapha = 0;
  Object.values(answers).forEach((dosha) => {
    if (dosha === "vata") vata++;
    if (dosha === "pitta") pitta++;
    if (dosha === "kapha") kapha++;
  });
  
  let primaryDosha = "Vata";
  if (pitta >= vata && pitta >= kapha) primaryDosha = "Pitta";
  if (kapha >= vata && kapha >= pitta) primaryDosha = "Kapha";

  return { scores: { vata, pitta, kapha }, primaryDosha };
}
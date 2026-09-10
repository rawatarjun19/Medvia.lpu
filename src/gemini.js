// src/gemini.js file ke bilkul niche ye function add kar dein:

export async function generateAyushSummary(patientInfo, ayushData) {
  try {
    const prompt = `
      You are an expert Ayurvedic Physician. Analyze the following patient details for AYUSH SIH 047:
      
      Patient Name: ${patientInfo.full_name || "Patient"}
      Dominant Dosha: ${ayushData.dominant}
      Scores: Vata: ${ayushData.scores.vata}, Pitta: ${ayushData.scores.pitta}, Kapha: ${ayushData.scores.kapha}
      
      Please provide a structured report with:
      1. Ayurvedic Diagnosis & Prakriti/Vikriti Summary.
      2. Pathya (Recommended Diet & Daily Lifestyle Routine).
      3. Apathya (Foods, Habits & Activities to Strictly Avoid).
      4. Suggested Classical Herbs/Formulations (e.g. Ashwagandha, Triphala, etc.).
    `;

    // Aapke gemini.js mein jo main model call hota hai, usse prompt bhejein
    const response = await model.generateContent(prompt);
    return response.response.text();
  } catch (error) {
    console.error("Gemini AYUSH Summary Error:", error);
    return "Error generating AYUSH summary.";
  }
}
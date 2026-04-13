const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/ai/safety-advice
const getSafetyAdvice = async (req, res) => {
  try {
    const { location, incidentType, context } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert tourist safety advisor with deep knowledge of travel risks worldwide.

A tourist needs detailed safety advice for:
Location: ${location || "Unknown"}
Situation: ${incidentType || "General safety inquiry"}
Context: ${context || "Tourist needs safety guidance"}

Provide 6-8 specific, actionable safety tips tailored to this exact location and situation.
Be practical, specific, and helpful. Include local emergency numbers if relevant.
Format as a JSON array of strings. Each tip should be 1-2 sentences.
Example: ["Tip 1 with specific detail.", "Tip 2 with actionable advice."]
Only respond with the JSON array, nothing else.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/```json|```/g, "");

    let tips;
    try {
      tips = JSON.parse(text);
    } catch {
      tips = text.split("\n").filter(t => t.trim().length > 10).slice(0, 8);
    }

    res.json({ success: true, data: { tips } });
  } catch (err) {
    console.error("Gemini error:", err.message);
    res.json({
      success: true,
      data: {
        tips: [
          "Stay aware of your surroundings at all times and avoid displaying expensive items.",
          "Keep emergency contacts saved and accessible — Police: 100, Ambulance: 108.",
          "Share your real-time location with trusted contacts when exploring new areas.",
          "Avoid isolated areas especially after dark; stick to well-lit, populated routes.",
          "Keep copies of important documents (passport, ID) in a secure digital backup.",
          "Use only licensed taxis or verified ride-sharing apps for transportation.",
          "Stay hydrated and carry basic first aid supplies including any personal medications.",
        ],
      },
    });
  }
};

// POST /api/ai/analyze-incident
const analyzeIncident = async (req, res) => {
  try {
    const { type, description, location, severity } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this tourist incident and provide a risk assessment:
Type: ${type}
Description: ${description}
Location: ${location || "Unknown"}
Reported Severity: ${severity}

Respond with JSON only:
{
  "riskLevel": "low|medium|high|critical",
  "immediateActions": ["action1", "action2"],
  "preventionTips": ["tip1", "tip2"],
  "summary": "brief analysis"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/```json|```/g, "");
    const analysis = JSON.parse(text);
    res.json({ success: true, data: analysis });
  } catch (err) {
    console.error("Gemini error:", err.message);
    res.json({
      success: true,
      data: {
        riskLevel: req.body.severity || "medium",
        immediateActions: ["Contact local authorities", "Move to a safe location"],
        preventionTips: ["Stay vigilant", "Travel in groups when possible"],
        summary: "Incident logged. Please follow standard safety protocols.",
      },
    });
  }
};

module.exports = { getSafetyAdvice, analyzeIncident };

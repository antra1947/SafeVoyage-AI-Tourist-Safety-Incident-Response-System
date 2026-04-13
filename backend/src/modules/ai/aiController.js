const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/ai/safety-advice
const getSafetyAdvice = async (req, res) => {
  try {
    const { location, incidentType, context } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a tourist safety expert. A tourist needs safety advice.
Location: ${location || "Unknown"}
Situation: ${incidentType || "General safety inquiry"}
Context: ${context || "Tourist needs general safety tips"}

Provide 3-5 concise, actionable safety tips. Be specific and practical. Format as a JSON array of strings.
Example: ["Tip 1", "Tip 2", "Tip 3"]
Only respond with the JSON array, nothing else.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    let tips;
    try {
      tips = JSON.parse(text);
    } catch {
      tips = text.split("\n").filter(t => t.trim()).slice(0, 5);
    }

    res.json({ success: true, data: { tips } });
  } catch (err) {
    console.error("Gemini error:", err.message);
    // Fallback tips if API fails
    res.json({
      success: true,
      data: {
        tips: [
          "Stay aware of your surroundings at all times.",
          "Keep emergency contacts saved and accessible.",
          "Share your location with trusted contacts.",
          "Avoid isolated areas, especially at night.",
          "Keep copies of important documents in a safe place.",
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

require("dotenv").config();
const express  = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect(process.env.DB_CONNECTION_STRING)
  .then(() => console.log("Incident Service: MongoDB connected"))
  .catch((e) => { console.error(e.message); process.exit(1); });

const incidentSchema = new mongoose.Schema(
  {
    reportedBy:  { type: mongoose.Schema.Types.ObjectId, required: true },
    type:        { type: String, enum: ["theft","accident","medical","natural_disaster","harassment","lost","other"], required: true },
    description: { type: String, required: true },
    location:    { latitude: Number, longitude: Number, address: { type: String, default: "Unknown" } },
    severity:    { type: String, enum: ["low","medium","high","critical"], default: "medium" },
    status:      { type: String, enum: ["pending","under_review","resolved"], default: "pending" },
  },
  { timestamps: true }
);
const Incident = mongoose.model("Incident", incidentSchema);

// POST /  — create incident
app.post("/", async (req, res) => {
  const { type, description, location, severity } = req.body;
  try {
    const incident = await Incident.create({ reportedBy: req.headers["x-user-id"], type, description, location, severity });
    res.status(201).json({ success: true, message: "Incident reported successfully", data: incident });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /my
app.get("/my", async (req, res) => {
  try {
    const incidents = await Incident.find({ reportedBy: req.headers["x-user-id"] }).sort({ createdAt: -1 });
    res.json({ success: true, data: incidents });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /  — admin all
app.get("/", async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.json({ success: true, data: incidents });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /:id/status — admin
app.patch("/:id/status", async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!incident) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: incident });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.listen(process.env.PORT, () => console.log(`Incident Service running on port ${process.env.PORT}`));

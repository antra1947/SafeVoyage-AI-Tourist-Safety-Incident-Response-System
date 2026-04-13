require("dotenv").config();
const express    = require("express");
const mongoose   = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());

mongoose.connect(process.env.DB_CONNECTION_STRING)
  .then(() => console.log("Emergency Service: MongoDB connected"))
  .catch((e) => { console.error(e.message); process.exit(1); });

// Models
const emergencySchema = new mongoose.Schema(
  {
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    location: {
      type:        { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
      address:     { type: String, default: "Location not available" },
    },
    message:    { type: String, default: "Emergency SOS triggered" },
    status:     { type: String, enum: ["active","acknowledged","resolved"], default: "active" },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);
emergencySchema.index({ location: "2dsphere" });
const Emergency = mongoose.model("Emergency", emergencySchema);

// In-memory location store (shared via gateway header)
const sendEmail = async ({ to, subject, text }) => {
  try {
    const transporter = process.env.EMAIL_PROVIDER === "ses"
      ? nodemailer.createTransport({ host: process.env.SES_HOST, port: parseInt(process.env.SES_PORT) || 587, auth: { user: process.env.SES_USER, pass: process.env.SES_PASS } })
      : nodemailer.createTransport({ service: "gmail", auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
    await transporter.sendMail({ from: process.env.EMAIL_USER || process.env.SES_USER, to, subject, text });
  } catch (err) { console.error("Email failed:", err.message); }
};

// POST /sos
app.post("/sos", async (req, res) => {
  try {
    const { message, coords, emergencyContacts, firstName, lastName } = req.body;
    const userId = req.headers["x-user-id"];

    const emergency = await Emergency.create({
      triggeredBy: userId,
      location: { type: "Point", coordinates: coords || [0, 0] },
      message: message || "Emergency SOS triggered",
    });

    // Email all emergency contacts
    for (const contact of (emergencyContacts || [])) {
      if (contact.email) {
        await sendEmail({
          to: contact.email,
          subject: `URGENT: SOS Alert from ${firstName} ${lastName}`,
          text: `${firstName} has triggered an SOS.\nMessage: ${emergency.message}\nLocation: [${coords?.[1]}, ${coords?.[0]}]`,
        });
      }
    }

    res.status(201).json({ success: true, message: "SOS triggered successfully", data: emergency });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /history
app.get("/history", async (req, res) => {
  try {
    const records = await Emergency.find({ triggeredBy: req.headers["x-user-id"] }).sort({ createdAt: -1 });
    res.json({ success: true, data: records });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /:id
app.get("/:id", async (req, res) => {
  try {
    const record = await Emergency.findOne({ _id: req.params.id, triggeredBy: req.headers["x-user-id"] });
    if (!record) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: record });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /:id/resolve
app.patch("/:id/resolve", async (req, res) => {
  try {
    const record = await Emergency.findByIdAndUpdate(req.params.id, { status: "resolved", resolvedBy: req.headers["x-user-id"] }, { new: true });
    if (!record) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: record });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.listen(process.env.PORT, () => console.log(`Emergency Service running on port ${process.env.PORT}`));

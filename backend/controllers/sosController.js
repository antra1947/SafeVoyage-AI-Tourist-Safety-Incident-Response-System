// Handles SOS alert creation and admin acknowledgment
const SOS = require("../models/SOS");
const nodemailer = require("nodemailer");

const sendSOSEmail = async (user, location) => {
  try {
    const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
    await transporter.sendMail({ from: process.env.EMAIL_USER, to: process.env.ADMIN_EMAIL, subject: "URGENT: SafeVoyage SOS Alert", text: "SOS from " + user.name + " at Lat:" + location.latitude + " Lng:" + location.longitude });
  } catch (err) { console.error("Email failed:", err.message); }
};

const triggerSOS = async (req, res) => {
  const { latitude, longitude, address, message } = req.body;
  try {
    const sos = await SOS.create({ triggeredBy: req.user._id, location: { latitude, longitude, address }, message: message || "Emergency SOS triggered" });
    sendSOSEmail(req.user, { latitude, longitude });
    res.status(201).json({ message: "SOS alert sent successfully", sos });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getMySOS = async (req, res) => {
  try {
    const alerts = await SOS.find({ triggeredBy: req.user._id }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllSOS = async (req, res) => {
  try {
    const alerts = await SOS.find().populate("triggeredBy", "name email phone").sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const acknowledgeSOS = async (req, res) => {
  try {
    const sos = await SOS.findByIdAndUpdate(req.params.id, { status: "acknowledged", acknowledgedBy: req.user._id }, { new: true });
    if (!sos) return res.status(404).json({ message: "SOS alert not found" });
    res.json(sos);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { triggerSOS, getMySOS, getAllSOS, acknowledgeSOS };

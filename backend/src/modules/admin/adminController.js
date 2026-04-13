const User = require("../auth/authModel");
const Incident = require("../incident/incidentModel");
const Emergency = require("../emergency/emergencyModel");

const getStats = async (req, res) => {
  try {
    const [totalUsers, totalIncidents, activeSOS, pendingIncidents, resolvedIncidents] = await Promise.all([
      User.countDocuments({ role: "tourist" }),
      Incident.countDocuments(),
      Emergency.countDocuments({ status: "active" }),
      Incident.countDocuments({ status: "pending" }),
      Incident.countDocuments({ status: "resolved" }),
    ]);
    res.json({ success: true, data: { totalUsers, totalIncidents, activeSOS, pendingIncidents, resolvedIncidents } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "tourist" }).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getAllSOS = async (req, res) => {
  try {
    const list = await Emergency.find().populate("triggeredBy", "firstName lastName email").sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const acknowledgeSOS = async (req, res) => {
  try {
    const record = await Emergency.findByIdAndUpdate(req.params.id, { status: "acknowledged" }, { new: true });
    if (!record) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: record });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getStats, getAllUsers, getAllSOS, acknowledgeSOS };

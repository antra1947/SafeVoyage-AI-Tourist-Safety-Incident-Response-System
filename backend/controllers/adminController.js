// Admin-only controller for viewing users, incidents, and SOS alerts
const User = require("../models/User");
const Incident = require("../models/Incident");
const SOS = require("../models/SOS");

// GET /api/admin/users - List all registered tourists
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "tourist" }).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// GET /api/admin/stats - Dashboard summary counts
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "tourist" });
    const totalIncidents = await Incident.countDocuments();
    const activeSOS = await SOS.countDocuments({ status: "active" });
    const pendingIncidents = await Incident.countDocuments({ status: "pending" });
    res.json({ totalUsers, totalIncidents, activeSOS, pendingIncidents });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getAllUsers, getDashboardStats };

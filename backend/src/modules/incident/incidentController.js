const Incident = require("./incidentModel");

const createIncident = async (req, res) => {
  const { type, description, location, severity } = req.body;
  try {
    const incident = await Incident.create({ reportedBy: req.user._id, type, description, location, severity });
    res.status(201).json({ success: true, message: "Incident reported successfully", data: incident });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMyIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: incidents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find().populate("reportedBy", "firstName lastName email").sort({ createdAt: -1 });
    res.json({ success: true, data: incidents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!incident) return res.status(404).json({ success: false, message: "Incident not found" });
    res.json({ success: true, data: incident });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createIncident, getMyIncidents, getAllIncidents, updateStatus };

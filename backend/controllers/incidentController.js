// Handles incident report creation and retrieval
const Incident = require("../models/Incident");

// POST /api/incidents - Submit a new incident report
const createIncident = async (req, res) => {
  const { type, description, location, severity } = req.body;

  try {
    const incident = await Incident.create({
      reportedBy: req.user._id,
      type,
      description,
      location,
      severity,
    });

    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/incidents/my - Get incidents reported by the logged-in user
const getMyIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({ reportedBy: req.user._id })
      .sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/incidents - Admin: get all incidents
const getAllIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find()
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/incidents/:id/status - Admin: update incident status
const updateIncidentStatus = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!incident) return res.status(404).json({ message: "Incident not found" });
    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createIncident, getMyIncidents, getAllIncidents, updateIncidentStatus };

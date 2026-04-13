const Incident = require("./incidentModel");

const createIncident = async (req, res) => {
  const { type, description, location, severity } = req.body;
  try {
    const incident = await Incident.create({ reportedBy: req.user._id, type, description, location, severity });
    res.status(201).json({ success: true, message: "Incident reported successfully", data: incident });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getMyIncidents = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;
    const total = await Incident.countDocuments({ reportedBy: req.user._id });
    const incidents = await Incident.find({ reportedBy: req.user._id })
      .sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json({ success: true, data: incidents, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getAllIncidents = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)   || 1;
    const limit  = parseInt(req.query.limit)  || 20;
    const skip   = (page - 1) * limit;
    const filter = {};
    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.type)     filter.type     = req.query.type;
    if (req.query.search)   filter.description = { $regex: req.query.search, $options: "i" };
    const total = await Incident.countDocuments(filter);
    const incidents = await Incident.find(filter)
      .populate("reportedBy", "firstName lastName email")
      .sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json({ success: true, data: incidents, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const updateStatus = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!incident) return res.status(404).json({ success: false, message: "Incident not found" });
    res.json({ success: true, data: incident });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// User deletes their own incident
const deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findOneAndDelete({ _id: req.params.id, reportedBy: req.user._id });
    if (!incident) return res.status(404).json({ success: false, message: "Incident not found or not authorized" });
    res.json({ success: true, message: "Incident deleted" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Admin deletes any incident
const adminDeleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) return res.status(404).json({ success: false, message: "Incident not found" });
    res.json({ success: true, message: "Incident deleted" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// User updates their own incident status
const updateMyStatus = async (req, res) => {
  try {
    const validStatuses = ["pending", "under_review", "resolved"];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }
    const incident = await Incident.findOneAndUpdate(
      { _id: req.params.id, reportedBy: req.user._id }, // ownership enforced
      { status: req.body.status },
      { new: true }
    );
    if (!incident) return res.status(404).json({ success: false, message: "Incident not found or not authorized" });
    res.json({ success: true, data: incident });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { createIncident, getMyIncidents, getAllIncidents, updateStatus, deleteIncident, adminDeleteIncident, updateMyStatus };

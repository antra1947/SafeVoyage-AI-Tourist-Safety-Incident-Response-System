const express = require("express");
const router = express.Router();
const { createIncident, getMyIncidents, getAllIncidents, updateIncidentStatus } = require("../controllers/incidentController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, createIncident);
router.get("/my", protect, getMyIncidents);
router.get("/", protect, adminOnly, getAllIncidents);
router.patch("/:id/status", protect, adminOnly, updateIncidentStatus);

module.exports = router;

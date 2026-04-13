const router = require("express").Router();
const { createIncident, getMyIncidents, getAllIncidents, updateStatus } = require("./incidentController");
const { protect, adminOnly } = require("../../middleware/auth");

router.post("/",              protect,            createIncident);
router.get("/my",             protect,            getMyIncidents);
router.get("/",               protect, adminOnly, getAllIncidents);
router.patch("/:id/status",   protect, adminOnly, updateStatus);

module.exports = router;

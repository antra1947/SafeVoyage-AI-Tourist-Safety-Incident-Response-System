const router = require("express").Router();
const { createIncident, getMyIncidents, getAllIncidents, updateStatus, deleteIncident, adminDeleteIncident, updateMyStatus } = require("./incidentController");
const { protect, adminOnly } = require("../../middleware/auth");

router.post("/",                protect,            createIncident);
router.get("/my",               protect,            getMyIncidents);
router.get("/",                 protect, adminOnly, getAllIncidents);
router.patch("/:id/status",     protect, adminOnly, updateStatus);
router.patch("/:id/mystatus",   protect,            updateMyStatus);
router.delete("/:id",           protect,            deleteIncident);
router.delete("/:id/admin",     protect, adminOnly, adminDeleteIncident);

module.exports = router;

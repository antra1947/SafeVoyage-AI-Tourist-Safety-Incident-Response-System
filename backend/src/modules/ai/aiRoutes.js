const router = require("express").Router();
const { getSafetyAdvice, analyzeIncident } = require("./aiController");
const { protect } = require("../../middleware/auth");

router.post("/safety-advice",    protect, getSafetyAdvice);
router.post("/analyze-incident", protect, analyzeIncident);

module.exports = router;

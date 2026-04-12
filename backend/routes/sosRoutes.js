const express = require("express");
const router = express.Router();
const { triggerSOS, getMySOS, getAllSOS, acknowledgeSOS } = require("../controllers/sosController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, triggerSOS);
router.get("/my", protect, getMySOS);
router.get("/", protect, adminOnly, getAllSOS);
router.patch("/:id/acknowledge", protect, adminOnly, acknowledgeSOS);

module.exports = router;

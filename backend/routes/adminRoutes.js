const express = require("express");
const router = express.Router();
const { getAllUsers, getDashboardStats } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/users", protect, adminOnly, getAllUsers);
router.get("/stats", protect, adminOnly, getDashboardStats);

module.exports = router;

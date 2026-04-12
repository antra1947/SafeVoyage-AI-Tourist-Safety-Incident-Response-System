const router = require("express").Router();
const { getNearbyUsers } = require("./locationController");
const { protect } = require("../../middleware/auth");

router.get("/nearby", protect, getNearbyUsers);

module.exports = router;

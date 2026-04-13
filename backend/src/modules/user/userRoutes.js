const router = require("express").Router();
const { getProfile, updateProfile } = require("./userController");
const { protect } = require("../../middleware/auth");

router.get("/profile",   protect, getProfile);
router.patch("/profile", protect, updateProfile);  // no Joi validator — sanitized in controller

module.exports = router;

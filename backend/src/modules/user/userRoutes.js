const router = require("express").Router();
const { getProfile, updateProfile } = require("./userController");
const { protect } = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const { updateProfileSchema } = require("./userValidator");

router.get("/profile",   protect, getProfile);
router.patch("/profile", protect, validate(updateProfileSchema), updateProfile);

module.exports = router;

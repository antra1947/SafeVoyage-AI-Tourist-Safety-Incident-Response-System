const router = require("express").Router();
const { getStats, getAllUsers, getAllSOS, acknowledgeSOS } = require("./adminController");
const { protect, adminOnly } = require("../../middleware/auth");

router.get("/stats",              protect, adminOnly, getStats);
router.get("/users",              protect, adminOnly, getAllUsers);
router.get("/sos",                protect, adminOnly, getAllSOS);
router.patch("/sos/:id/acknowledge", protect, adminOnly, acknowledgeSOS);

module.exports = router;

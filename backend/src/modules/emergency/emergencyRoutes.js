const router = require("express").Router();
const { triggerSOS, getHistory, getOne, resolve, deleteSOS } = require("./emergencyController");
const { protect } = require("../../middleware/auth");

router.post("/sos",          protect, triggerSOS);
router.get("/history",       protect, getHistory);
router.get("/:id",           protect, getOne);
router.patch("/:id/resolve", protect, resolve);
router.delete("/:id",        protect, deleteSOS);

module.exports = router;

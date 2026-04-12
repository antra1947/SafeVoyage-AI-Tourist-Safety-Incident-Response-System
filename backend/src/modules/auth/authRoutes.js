const router = require("express").Router();
const { register, login } = require("./authController");
const validate = require("../../middleware/validate");
const { registerSchema, loginSchema } = require("./authValidator");

router.post("/register", validate(registerSchema), register);
router.post("/login",    validate(loginSchema),    login);

module.exports = router;

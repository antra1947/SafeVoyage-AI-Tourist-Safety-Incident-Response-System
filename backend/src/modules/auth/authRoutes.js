const router = require("express").Router();
const { register, login, forgotPassword, resetPassword } = require("./authController");
const validate = require("../../middleware/validate");
const { registerSchema, loginSchema } = require("./authValidator");

router.post("/register",                validate(registerSchema), register);
router.post("/login",                   validate(loginSchema),    login);
router.post("/forgot-password",         forgotPassword);
router.post("/reset-password/:token",   resetPassword);

module.exports = router;

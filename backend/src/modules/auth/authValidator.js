const Joi = require("joi");

const registerSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName:  Joi.string().min(1).required(),
  email:     Joi.string().email().required(),
  password:  Joi.string().min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#]).+$/)
    .required()
    .messages({ "string.pattern.base": "Password must have uppercase, lowercase, number, and special character (@$!%*?&_#)", "string.min": "Password must be at least 8 characters" }),
  age:    Joi.number().min(1).optional(),
  gender: Joi.string().valid("male", "female", "other").optional(),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#]).+$/)
    .required()
    .messages({ "string.pattern.base": "Password must have uppercase, lowercase, number, and special character (@$!%*?&_#)", "string.min": "Password must be at least 8 characters" }),
});

module.exports = { registerSchema, loginSchema, resetPasswordSchema };

const Joi = require("joi");

const registerSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName:  Joi.string().min(1).required(),
  email:     Joi.string().email().required(),
  password:  Joi.string().min(6)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .required()
    .messages({ "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, and one number" }),
  age:    Joi.number().min(1).optional(),
  gender: Joi.string().valid("male", "female", "other").optional(),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .required()
    .messages({ "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, and one number" }),
});

module.exports = { registerSchema, loginSchema, resetPasswordSchema };

const Joi = require("joi");

const registerSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName:  Joi.string().min(1).required(),
  email:     Joi.string().email().required(),
  password:  Joi.string().min(6).required(),
  age:       Joi.number().min(1).optional(),
  gender:    Joi.string().valid("male", "female", "other").optional(),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };

const Joi = require("joi");

const updateProfileSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName:  Joi.string().optional(),
  photoUrl:  Joi.string().uri().optional().allow(""),
  safetyProfile: Joi.object({
    bloodGroup:   Joi.string().optional().allow(""),
    allergies:    Joi.string().optional().allow(""),
    medicalNotes: Joi.string().optional().allow(""),
    emergencyContacts: Joi.array().items(
      Joi.object({
        name:  Joi.string().required(),
        phone: Joi.string().required(),
        email: Joi.string().email().optional().allow(""),
      })
    ).optional(),
  }).optional(),
});

module.exports = { updateProfileSchema };

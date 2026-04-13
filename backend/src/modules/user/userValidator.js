const Joi = require("joi");

const updateProfileSchema = Joi.object({
  firstName: Joi.string().optional().allow(""),
  lastName:  Joi.string().optional().allow(""),
  photoUrl:  Joi.string().optional().allow(""),
  safetyProfile: Joi.object({
    bloodGroup:   Joi.string().optional().allow(""),
    allergies:    Joi.string().optional().allow(""),
    medicalNotes: Joi.string().optional().allow(""),
    emergencyContacts: Joi.array().items(
      Joi.object({
        name:  Joi.string().optional().allow(""),
        phone: Joi.string().optional().allow(""),
        email: Joi.string().optional().allow(""),
      })
    ).optional(),
  }).optional(),
});

module.exports = { updateProfileSchema };

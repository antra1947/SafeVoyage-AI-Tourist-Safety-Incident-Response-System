require("dotenv").config();
const express  = require("express");
const mongoose = require("mongoose");
const Joi      = require("joi");

const app = express();
app.use(express.json());

mongoose.connect(process.env.DB_CONNECTION_STRING)
  .then(() => console.log("User Service: MongoDB connected"))
  .catch((e) => { console.error(e.message); process.exit(1); });

// Minimal User model (shared DB, same collection)
const User = require("../auth-service/model");

const updateSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName:  Joi.string().optional(),
  photoUrl:  Joi.string().uri().optional().allow(""),
  safetyProfile: Joi.object({
    bloodGroup:   Joi.string().optional().allow(""),
    allergies:    Joi.string().optional().allow(""),
    medicalNotes: Joi.string().optional().allow(""),
    emergencyContacts: Joi.array().items(Joi.object({
      name:  Joi.string().required(),
      phone: Joi.string().required(),
      email: Joi.string().email().optional().allow(""),
    })).optional(),
  }).optional(),
});

// GET /profile  (userId injected by gateway via header)
app.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.headers["x-user-id"]).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /profile
app.patch("/profile", async (req, res) => {
  const { error } = updateSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

  try {
    const { firstName, lastName, photoUrl, safetyProfile } = req.body;
    const update = {};
    if (firstName) update.firstName = firstName;
    if (lastName)  update.lastName  = lastName;
    if (photoUrl !== undefined) update.photoUrl = photoUrl;
    if (safetyProfile) update.safetyProfile = safetyProfile;

    const user = await User.findByIdAndUpdate(req.headers["x-user-id"], update, { new: true }).select("-password");
    res.json({ success: true, message: "Profile updated successfully", data: user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.listen(process.env.PORT, () => console.log(`User Service running on port ${process.env.PORT}`));

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true },
    password:  { type: String, required: true, minlength: 6 },
    age:       { type: Number },
    gender:    { type: String, enum: ["male", "female", "other"] },
    photoUrl:  { type: String, default: "" },
    role:      { type: String, enum: ["tourist", "admin"], default: "tourist" },
    safetyProfile: {
      bloodGroup:   { type: String, default: "" },
      allergies:    { type: String, default: "" },
      medicalNotes: { type: String, default: "" },
      emergencyContacts: [{ name: String, phone: String, email: String }],
    },
    location: {
      type:        { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await require("bcryptjs").hash(this.password, 10);
  next();
});
userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);

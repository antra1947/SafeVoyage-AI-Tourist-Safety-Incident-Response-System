const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema(
  {
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: {
      type:        { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
      address:     { type: String, default: "Location not available" },
    },
    message: { type: String, default: "Emergency SOS triggered" },
    status: {
      type: String,
      enum: ["active", "acknowledged", "resolved"],
      default: "active",
    },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

emergencySchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Emergency", emergencySchema);

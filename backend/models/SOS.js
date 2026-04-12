// SOS Alert schema - stores emergency SOS triggers from tourists
const mongoose = require("mongoose");

const sosSchema = new mongoose.Schema(
  {
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String, default: "Location not available" },
    },
    message: {
      type: String,
      default: "Emergency SOS triggered",
    },
    status: {
      type: String,
      enum: ["active", "acknowledged", "resolved"],
      default: "active",
    },
    // Track which admin acknowledged the alert
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SOS", sosSchema);

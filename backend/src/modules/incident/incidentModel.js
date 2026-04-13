const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["theft", "accident", "medical", "natural_disaster", "harassment", "lost", "other"],
      required: true,
    },
    description: { type: String, required: true },
    location: {
      latitude:  { type: Number },
      longitude: { type: Number },
      address:   { type: String, default: "Unknown location" },
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "under_review", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Incident", incidentSchema);

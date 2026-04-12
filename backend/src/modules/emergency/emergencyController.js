const Emergency = require("./emergencyModel");
const User = require("../auth/authModel");
const { sendEmail } = require("../../utils/emailService");
// In-memory location store (populated by socket module)
const { locationStore } = require("../location/locationStore");

const triggerSOS = async (req, res) => {
  try {
    const { message } = req.body;
    const user = await User.findById(req.user._id);

    // Get latest location: memory first, fallback to DB
    const memLoc = locationStore.get(String(user._id));
    const coords = memLoc
      ? [memLoc.longitude, memLoc.latitude]
      : user.location.coordinates;

    const emergency = await Emergency.create({
      triggeredBy: user._id,
      location: { type: "Point", coordinates: coords },
      message: message || "Emergency SOS triggered",
    });

    // Send email to all emergency contacts
    const contacts = user.safetyProfile?.emergencyContacts || [];
    for (const contact of contacts) {
      if (contact.email) {
        await sendEmail({
          to: contact.email,
          subject: `URGENT: SOS Alert from ${user.firstName} ${user.lastName}`,
          text: `${user.firstName} has triggered an SOS alert.\nMessage: ${emergency.message}\nLocation: [${coords[1]}, ${coords[0]}]`,
        });
      }
    }

    res.status(201).json({ success: true, message: "SOS triggered successfully", data: emergency });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const records = await Emergency.find({ triggeredBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const record = await Emergency.findOne({ _id: req.params.id, triggeredBy: req.user._id });
    if (!record) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const resolve = async (req, res) => {
  try {
    const record = await Emergency.findByIdAndUpdate(
      req.params.id,
      { status: "resolved", resolvedBy: req.user._id },
      { new: true }
    );
    if (!record) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { triggerSOS, getHistory, getOne, resolve };

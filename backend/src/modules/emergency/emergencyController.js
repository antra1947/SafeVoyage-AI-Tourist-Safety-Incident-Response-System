const Emergency = require("./emergencyModel");
const User = require("../auth/authModel");
const { sendEmail, buildSOSAlertHTML, buildSOSConfirmationHTML } = require("../../utils/emailService");
const { locationStore } = require("../location/locationStore");

const triggerSOS = async (req, res) => {
  try {
    const { message, latitude, longitude } = req.body;
    const user = await User.findById(req.user._id);

    // Priority: 1) browser GPS from request, 2) socket memory, 3) DB
    let coords;
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      // Validate bounds
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({ success: false, message: "Invalid GPS coordinates" });
      }
      coords = [lng, lat];
    } else {
      const memLoc = locationStore.get(String(user._id));
      coords = memLoc
        ? [memLoc.longitude, memLoc.latitude]
        : user.location.coordinates;
    }

    // If still 0,0 fallback
    if (!coords || (coords[0] === 0 && coords[1] === 0)) {
      coords = [0, 0];
    }

    const lat = coords[1] || 0;
    const lng = coords[0] || 0;
    const alertMessage = message || "Emergency SOS triggered";
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "medium" });

    const emergency = await Emergency.create({
      triggeredBy: user._id,
      location: { type: "Point", coordinates: coords },
      message: alertMessage,
    });

    const contacts = user.safetyProfile?.emergencyContacts || [];
    const notifiedContacts = [];

    // Send alert email to each emergency contact
    for (const contact of contacts) {
      if (contact.email) {
        const sent = await sendEmail({
          to: contact.email,
          subject: `🆘 URGENT: SOS Alert from ${user.firstName} ${user.lastName}`,
          html: buildSOSAlertHTML({
            name: contact.name || "Emergency Contact",
            victimName: `${user.firstName} ${user.lastName}`,
            message: alertMessage,
            lat: lat.toFixed(6),
            lng: lng.toFixed(6),
            timestamp,
            alertId: emergency._id,
          }),
          text: `URGENT: ${user.firstName} ${user.lastName} has triggered an SOS. Location: ${lat}, ${lng}. Message: ${alertMessage}`,
        });
        if (sent) notifiedContacts.push({ name: contact.name, email: contact.email, phone: contact.phone });
      }
    }

    // Send confirmation email to the user themselves
    await sendEmail({
      to: user.email,
      subject: `✅ Your SOS Alert Has Been Sent — SafeVoyage AI`,
      html: buildSOSConfirmationHTML({
        firstName: user.firstName,
        notifiedContacts,
        message: alertMessage,
        lat: lat.toFixed(6),
        lng: lng.toFixed(6),
        timestamp,
        alertId: emergency._id,
      }),
      text: `Your SOS has been sent. ${notifiedContacts.length} contact(s) notified.`,
    });

    res.status(201).json({
      success: true,
      message: "SOS triggered successfully",
      data: {
        ...emergency.toObject(),
        notifiedContacts,
        confirmationSentTo: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const records = await Emergency.find({ triggeredBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: records });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getOne = async (req, res) => {
  try {
    const record = await Emergency.findOne({ _id: req.params.id, triggeredBy: req.user._id });
    if (!record) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: record });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
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
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const deleteSOS = async (req, res) => {
  try {
    const record = await Emergency.findOneAndDelete({ _id: req.params.id, triggeredBy: req.user._id });
    if (!record) return res.status(404).json({ success: false, message: "Not found or not authorized" });
    res.json({ success: true, message: "SOS record deleted" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { triggerSOS, getHistory, getOne, resolve, deleteSOS };

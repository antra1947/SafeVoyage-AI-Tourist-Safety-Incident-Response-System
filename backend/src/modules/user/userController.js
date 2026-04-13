const User = require("../auth/authModel");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, photoUrl, safetyProfile } = req.body;
    const update = {};
    if (firstName?.trim()) update.firstName = firstName.trim();
    if (lastName?.trim())  update.lastName  = lastName.trim();
    if (photoUrl !== undefined) update.photoUrl = photoUrl;
    if (safetyProfile) {
      update.safetyProfile = {
        bloodGroup:   safetyProfile.bloodGroup   || "",
        allergies:    safetyProfile.allergies    || "",
        medicalNotes: safetyProfile.medicalNotes || "",
        emergencyContacts: (safetyProfile.emergencyContacts || []).filter(c => c.name || c.phone || c.email),
      };
    }
    const user = await User.findByIdAndUpdate(
      req.user._id, update, { new: true, runValidators: false }
    ).select("-password");
    res.json({ success: true, message: "Profile updated successfully", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProfile, updateProfile };

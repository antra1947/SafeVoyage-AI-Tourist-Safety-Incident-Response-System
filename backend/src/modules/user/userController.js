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
    if (firstName) update.firstName = firstName;
    if (lastName)  update.lastName  = lastName;
    if (photoUrl !== undefined) update.photoUrl = photoUrl;
    if (safetyProfile) update.safetyProfile = safetyProfile;

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true }).select("-password");
    res.json({ success: true, message: "Profile updated successfully", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProfile, updateProfile };

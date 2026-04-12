// Handles user profile retrieval and updates
const User = require("../models/User");

// GET /api/users/profile - Get logged-in user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// PUT /api/users/profile - Update profile info
const updateProfile = async (req, res) => {
  try {
    const { name, phone, nationality, emergencyContact } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, nationality, emergencyContact },
      { new: true, runValidators: true }
    ).select("-password");
    res.json(user);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getProfile, updateProfile };

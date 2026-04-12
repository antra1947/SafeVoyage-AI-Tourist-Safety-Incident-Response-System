const User = require("../auth/authModel");

// GET /api/locations/nearby?lat=&lng=
const getNearbyUsers = async (req, res) => {
  try {
    const { lat, lng, radius = 100 } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: "lat and lng are required" });

    const users = await User.find({
      _id: { $ne: req.user._id },
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius),
        },
      },
    }).select("firstName lastName location lastSeen");

    const data = users.map((u) => ({
      userId: u._id,
      name: `${u.firstName} ${u.lastName}`,
      coordinates: u.location.coordinates,
      lastSeen: u.lastSeen,
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getNearbyUsers };

const jwt = require("jsonwebtoken");
const User = require("../auth/authModel");
const Location = require("./locationModel");
const { locationStore } = require("./locationStore");

// Throttle: min distance (meters) and min time (ms) between DB saves
const MIN_DISTANCE_M = 10;
const MIN_TIME_MS    = 5000;

const haversineDistance = (a, b) => {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude  - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const saveLocationToDB = async (userId, latitude, longitude) => {
  await Location.create({ userId, location: { type: "Point", coordinates: [longitude, latitude] } });
  await User.findByIdAndUpdate(userId, {
    location: { type: "Point", coordinates: [longitude, latitude] },
    lastSeen: new Date(),
  });
};

const initSocket = (io) => {
  // Authenticate socket connection via JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id).select("-password");
      if (!socket.user) return next(new Error("User not found"));
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = String(socket.user._id);
    console.log(`Socket connected: ${socket.user.firstName} (${userId})`);

    socket.on("send-location", async ({ latitude, longitude }) => {
      if (typeof latitude !== "number" || typeof longitude !== "number") return;

      const prev = locationStore.get(userId);
      const now  = Date.now();

      // Update in-memory store always
      locationStore.set(userId, { latitude, longitude, timestamp: now });

      // Save to DB with throttling
      const shouldSave =
        !prev ||
        now - prev.timestamp >= MIN_TIME_MS ||
        haversineDistance(prev, { latitude, longitude }) >= MIN_DISTANCE_M;

      if (shouldSave) {
        await saveLocationToDB(userId, latitude, longitude).catch(console.error);
      }
    });

    socket.on("disconnect", async () => {
      const loc = locationStore.get(userId);
      if (loc) {
        await saveLocationToDB(userId, loc.latitude, loc.longitude).catch(console.error);
      }
      console.log(`Socket disconnected: ${userId}`);
    });
  });
};

module.exports = { initSocket };

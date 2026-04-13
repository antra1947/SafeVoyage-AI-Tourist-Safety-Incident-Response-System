require("dotenv").config();
const express  = require("express");
const http     = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const jwt      = require("jsonwebtoken");
const path     = require("path");

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

mongoose.connect(process.env.DB_CONNECTION_STRING)
  .then(() => console.log("Location Service: MongoDB connected"))
  .catch((e) => { console.error(e.message); process.exit(1); });

// Models
const User = require("../auth-service/model");

const locationSchema = new mongoose.Schema(
  { userId: { type: mongoose.Schema.Types.ObjectId, required: true }, location: { type: { type: String, enum: ["Point"], default: "Point" }, coordinates: { type: [Number], required: true } } },
  { timestamps: true }
);
locationSchema.index({ location: "2dsphere" });
const Location = mongoose.model("Location", locationSchema);

// In-memory store
const locationStore = new Map();
const MIN_DISTANCE_M = 10, MIN_TIME_MS = 5000;

const haversine = (a, b) => {
  const R = 6371000, r = d => d * Math.PI / 180;
  const dLat = r(b.latitude - a.latitude), dLng = r(b.longitude - a.longitude);
  const x = Math.sin(dLat/2)**2 + Math.cos(r(a.latitude)) * Math.cos(r(b.latitude)) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
};

const saveToDB = async (userId, lat, lng) => {
  await Location.create({ userId, location: { type: "Point", coordinates: [lng, lat] } });
  await User.findByIdAndUpdate(userId, { location: { type: "Point", coordinates: [lng, lat] }, lastSeen: new Date() });
};

// Socket.IO
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error("Auth required"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = await User.findById(decoded.id).select("-password");
    if (!socket.user) return next(new Error("User not found"));
    next();
  } catch { next(new Error("Invalid token")); }
});

io.on("connection", (socket) => {
  const userId = String(socket.user._id);
  console.log(`Socket connected: ${socket.user.firstName} (${userId})`);

  socket.on("send-location", async ({ latitude, longitude }) => {
    if (typeof latitude !== "number" || typeof longitude !== "number") return;
    const prev = locationStore.get(userId);
    const now  = Date.now();
    locationStore.set(userId, { latitude, longitude, timestamp: now });
    const shouldSave = !prev || now - prev.timestamp >= MIN_TIME_MS || haversine(prev, { latitude, longitude }) >= MIN_DISTANCE_M;
    if (shouldSave) saveToDB(userId, latitude, longitude).catch(console.error);
  });

  socket.on("disconnect", async () => {
    const loc = locationStore.get(userId);
    if (loc) saveToDB(userId, loc.latitude, loc.longitude).catch(console.error);
    console.log(`Socket disconnected: ${userId}`);
  });
});

// GET /nearby
app.get("/nearby", async (req, res) => {
  try {
    const { lat, lng, radius = 100 } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: "lat and lng required" });
    const userId = req.headers["x-user-id"];
    const users = await User.find({
      _id: { $ne: userId },
      location: { $near: { $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] }, $maxDistance: parseInt(radius) } },
    }).select("firstName lastName location lastSeen");
    res.json({ success: true, data: users.map(u => ({ userId: u._id, name: `${u.firstName} ${u.lastName}`, coordinates: u.location.coordinates, lastSeen: u.lastSeen })) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /map
app.get("/map", (req, res) => {
  res.render("map", { token: req.query.token || "", userId: req.headers["x-user-id"] || "" });
});

server.listen(process.env.PORT, () => console.log(`Location Service running on port ${process.env.PORT}`));

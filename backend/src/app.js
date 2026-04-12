require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const http     = require("http");
const { Server } = require("socket.io");
const path     = require("path");

const connectDB  = require("./config/db");
const { initSocket } = require("./modules/location/socketHandler");
const { protect }    = require("./middleware/auth");
const { getMap }     = require("./modules/location/mapController");

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000"];

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: ALLOWED_ORIGINS, credentials: true } });

connectDB();

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/api/auth",      require("./modules/auth/authRoutes"));
app.use("/api/user",      require("./modules/user/userRoutes"));
app.use("/api/emergency", require("./modules/emergency/emergencyRoutes"));
app.use("/api/locations", require("./modules/location/locationRoutes"));

// Map UI (protected, pass ?token=<jwt> in URL)
app.get("/api/map", protect, getMap);

// Health check
app.get("/", (req, res) => res.json({ success: true, message: "SafeVoyage API v2 running" }));

// Socket.IO
initSocket(io);

const PORT = process.env.PORT || 7000;
server.listen(PORT, () => console.log(`SafeVoyage server running on port ${PORT}`));

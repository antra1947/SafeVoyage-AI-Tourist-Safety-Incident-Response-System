require("dotenv").config();
const express    = require("express");
const cors       = require("cors");
const http       = require("http");
const { Server } = require("socket.io");
const path       = require("path");
const helmet     = require("helmet");
const morgan     = require("morgan");
const rateLimit  = require("express-rate-limit");

const connectDB      = require("./config/db");
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

// Security & logging
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { success: false, message: "Too many requests" } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: "Too many auth attempts" } });
app.use("/api/", limiter);
app.use("/api/auth/", authLimiter);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/api/auth",      require("./modules/auth/authRoutes"));
app.use("/api/user",      require("./modules/user/userRoutes"));
app.use("/api/emergency", require("./modules/emergency/emergencyRoutes"));
app.use("/api/locations", require("./modules/location/locationRoutes"));
app.use("/api/incidents", require("./modules/incident/incidentRoutes"));
app.use("/api/admin",     require("./modules/admin/adminRoutes"));
app.use("/api/ai",        require("./modules/ai/aiRoutes"));

// Map UI
app.get("/api/map", protect, getMap);

// Health check
app.get("/", (req, res) => res.json({ success: true, message: "SafeVoyage API v2 running" }));

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error" });
});

initSocket(io);

const PORT = process.env.PORT || 7000;
server.listen(PORT, () => console.log(`SafeVoyage server running on port ${PORT}`));

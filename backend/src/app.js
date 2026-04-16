require("dotenv").config();
require("./config/validateEnv");
const express    = require("express");
const cors       = require("cors");
const http       = require("http");
const { Server } = require("socket.io");
const path       = require("path");
const helmet     = require("helmet");
const morgan     = require("morgan");
const rateLimit  = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const logger     = require("./utils/logger");

const connectDB      = require("./config/db");
const { initSocket } = require("./modules/location/socketHandler");
const { protect }    = require("./middleware/auth");
const { getMap }     = require("./modules/location/mapController");

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000"];

// In production allow all vercel preview URLs too
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      ALLOWED_ORIGINS.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      origin === "http://localhost:3000"
    ) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: corsOptions });

connectDB();

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(mongoSanitize()); // prevent NoSQL injection

// Logging
app.use(morgan("dev"));

// Rate limiting
const limiter     = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { success: false, message: "Too many requests, please try again later." } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20,  message: { success: false, message: "Too many auth attempts, please try again later." } });
const sosLimiter  = rateLimit({ windowMs: 60 * 1000, max: 3, message: { success: false, message: "Too many SOS requests. Please wait before trying again." } });
app.use("/api/",           limiter);
app.use("/api/auth/",      authLimiter);
app.use("/api/emergency/", sosLimiter);

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
app.get("/", (req, res) => res.json({ success: true, message: "SafeVoyage API v2 running", version: "2.0.0" }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Centralized error handler
app.use((err, req, res, next) => {
  logger.error(err.message, { path: req.path, method: req.method });
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error" });
});

initSocket(io);

const PORT = process.env.PORT || 7000;
server.listen(PORT, () => logger.info(`SafeVoyage server running on port ${PORT}`));

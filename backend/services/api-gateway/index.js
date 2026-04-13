require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const axios   = require("axios");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

const ALLOWED = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000"];

app.use(cors({ origin: ALLOWED, credentials: true }));
app.use(express.json());

const SERVICES = {
  auth:      process.env.AUTH_SERVICE,
  user:      process.env.USER_SERVICE,
  incident:  process.env.INCIDENT_SERVICE,
  emergency: process.env.EMERGENCY_SERVICE,
  location:  process.env.LOCATION_SERVICE,
};

// Auth middleware — verifies JWT by calling auth-service /verify
const authenticate = async (req, res, next) => {
  try {
    const { data } = await axios.get(`${SERVICES.auth}/verify`, {
      headers: { authorization: req.headers.authorization || "" },
    });
    // Inject user info as headers for downstream services
    req.headers["x-user-id"]   = String(data.data._id);
    req.headers["x-user-role"] = data.data.role;
    req.headers["x-user-data"] = JSON.stringify(data.data);
    next();
  } catch (err) {
    const status = err.response?.status || 401;
    res.status(status).json({ success: false, message: err.response?.data?.message || "Unauthorized" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.headers["x-user-role"] === "admin") return next();
  res.status(403).json({ success: false, message: "Admin access required" });
};

// ── AUTH routes (public) ──────────────────────────────────────────
app.post("/api/auth/register", proxy(SERVICES.auth, "/register"));
app.post("/api/auth/login",    proxy(SERVICES.auth, "/login"));

// ── USER routes ───────────────────────────────────────────────────
app.get("/api/user/profile",   authenticate, proxy(SERVICES.user, "/profile"));
app.patch("/api/user/profile", authenticate, proxy(SERVICES.user, "/profile"));

// ── INCIDENT routes ───────────────────────────────────────────────
app.post("/api/incidents",            authenticate,            proxy(SERVICES.incident, "/"));
app.get("/api/incidents/my",          authenticate,            proxy(SERVICES.incident, "/my"));
app.get("/api/incidents",             authenticate, adminOnly, proxy(SERVICES.incident, "/"));
app.patch("/api/incidents/:id/status",authenticate, adminOnly, proxyWithParam(SERVICES.incident, "/", "/status"));

// ── EMERGENCY routes ──────────────────────────────────────────────
app.post("/api/emergency/sos",         authenticate, emergencySOS);
app.get("/api/emergency/history",      authenticate, proxy(SERVICES.emergency, "/history"));
app.get("/api/emergency/:id",          authenticate, proxyWithParam(SERVICES.emergency, "/", ""));
app.patch("/api/emergency/:id/resolve",authenticate, proxyWithParam(SERVICES.emergency, "/", "/resolve"));

// ── LOCATION routes ───────────────────────────────────────────────
app.get("/api/locations/nearby", authenticate, proxy(SERVICES.location, "/nearby"));
app.get("/api/map",              authenticate, proxy(SERVICES.location, "/map"));

// Health check
app.get("/", (req, res) => res.json({ success: true, message: "SafeVoyage API Gateway running" }));

// ── Proxy helpers ─────────────────────────────────────────────────
function proxy(serviceUrl, path) {
  return async (req, res) => {
    try {
      const url = `${serviceUrl}${path}${req.query && Object.keys(req.query).length ? "?" + new URLSearchParams(req.query) : ""}`;
      const { data } = await axios({ method: req.method, url, data: req.body, headers: { "x-user-id": req.headers["x-user-id"], "x-user-role": req.headers["x-user-role"], "x-user-data": req.headers["x-user-data"] } });
      res.json(data);
    } catch (err) {
      res.status(err.response?.status || 500).json(err.response?.data || { success: false, message: "Service error" });
    }
  };
}

function proxyWithParam(serviceUrl, prefix, suffix) {
  return async (req, res) => {
    try {
      const url = `${serviceUrl}${prefix}${req.params.id}${suffix}`;
      const { data } = await axios({ method: req.method, url, data: req.body, headers: { "x-user-id": req.headers["x-user-id"], "x-user-role": req.headers["x-user-role"] } });
      res.json(data);
    } catch (err) {
      res.status(err.response?.status || 500).json(err.response?.data || { success: false, message: "Service error" });
    }
  };
}

// SOS needs to pass user data (contacts, name) to emergency service
async function emergencySOS(req, res) {
  try {
    const userData = JSON.parse(req.headers["x-user-data"] || "{}");
    const { data } = await axios.post(`${SERVICES.emergency}/sos`, {
      ...req.body,
      emergencyContacts: userData.safetyProfile?.emergencyContacts || [],
      firstName: userData.firstName,
      lastName:  userData.lastName,
    }, { headers: { "x-user-id": req.headers["x-user-id"] } });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { success: false, message: "Service error" });
  }
}

app.listen(process.env.PORT, () => console.log(`API Gateway running on port ${process.env.PORT}`));

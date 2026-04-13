// Validate required environment variables at startup
const required = [
  "DB_CONNECTION_STRING",
  "JWT_SECRET",
];

const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`[STARTUP ERROR] Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 20) {
  console.warn("[SECURITY WARNING] JWT_SECRET is too short. Use at least 32 random characters.");
}

console.log("[ENV] Environment variables validated successfully");

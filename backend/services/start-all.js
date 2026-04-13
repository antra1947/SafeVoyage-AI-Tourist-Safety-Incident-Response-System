// Run all microservices concurrently
const { spawn } = require("child_process");
const path = require("path");

const services = [
  { name: "auth-service",      dir: "auth-service" },
  { name: "user-service",      dir: "user-service" },
  { name: "incident-service",  dir: "incident-service" },
  { name: "emergency-service", dir: "emergency-service" },
  { name: "location-service",  dir: "location-service" },
  { name: "api-gateway",       dir: "api-gateway" },
];

services.forEach(({ name, dir }) => {
  const cwd = path.join(__dirname, dir);
  const proc = spawn("node", ["index.js"], { cwd, shell: true });

  proc.stdout.on("data", (d) => console.log(`[${name}] ${d.toString().trim()}`));
  proc.stderr.on("data", (d) => console.error(`[${name}] ERROR: ${d.toString().trim()}`));
  proc.on("close", (code) => console.log(`[${name}] exited with code ${code}`));
});

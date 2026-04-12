// Shared in-memory store for latest user locations
// Key: userId (string), Value: { latitude, longitude, timestamp }
const locationStore = new Map();

module.exports = { locationStore };

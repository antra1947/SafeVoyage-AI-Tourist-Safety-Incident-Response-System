import axios from "axios";

// Base API instance pointing to our Express backend
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:7000/api",
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sv_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

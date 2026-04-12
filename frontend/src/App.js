import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import IncidentReport from "./pages/IncidentReport";
import SOSPage from "./pages/SOSPage";
import AdminPanel from "./pages/AdminPanel";
import SafetyAlerts from "./pages/SafetyAlerts";

// Redirects unauthenticated users to login
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-danger"></div></div>;
  return user ? children : <Navigate to="/login" />;
};

// Redirects non-admin users away from admin panel
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-danger"></div></div>;
  return user && user.role === "admin" ? children : <Navigate to="/dashboard" />;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/report" element={<PrivateRoute><IncidentReport /></PrivateRoute>} />
        <Route path="/sos" element={<PrivateRoute><SOSPage /></PrivateRoute>} />
        <Route path="/alerts" element={<PrivateRoute><SafetyAlerts /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>;
}

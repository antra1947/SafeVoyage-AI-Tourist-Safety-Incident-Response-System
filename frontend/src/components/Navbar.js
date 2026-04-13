import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sv-navbar">
      <div className="container-fluid px-3 px-md-4">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="fas fa-shield-alt" style={{ fontSize: "0.85rem" }}></i>
          </div>
          SafeVoyage AI
        </Link>

        <button className="navbar-toggler border-0" type="button" onClick={() => setOpen(!open)}>
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${open ? "show" : ""}`} id="navMenu">
          <ul className="navbar-nav ms-auto align-items-center gap-1">
            {user ? (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive("/dashboard") ? "bg-white bg-opacity-20 fw-bold" : ""}`} to="/dashboard" onClick={() => setOpen(false)}>
                    <i className="fas fa-home me-1"></i>Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive("/sos") ? "bg-white bg-opacity-20 fw-bold" : ""}`} to="/sos" onClick={() => setOpen(false)}>
                    <i className="fas fa-exclamation-triangle me-1 text-warning"></i>SOS
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive("/report") ? "bg-white bg-opacity-20 fw-bold" : ""}`} to="/report" onClick={() => setOpen(false)}>
                    <i className="fas fa-file-alt me-1"></i>Report
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive("/alerts") ? "bg-white bg-opacity-20 fw-bold" : ""}`} to="/alerts" onClick={() => setOpen(false)}>
                    <i className="fas fa-bell me-1"></i>Alerts
                  </Link>
                </li>
                {user.role === "admin" && (
                  <li className="nav-item">
                    <Link className={`nav-link text-warning ${isActive("/admin") ? "bg-white bg-opacity-20 fw-bold" : ""}`} to="/admin" onClick={() => setOpen(false)}>
                      <i className="fas fa-cog me-1"></i>Admin
                    </Link>
                  </li>
                )}
                <li className="nav-item ms-1">
                  <div className="d-flex align-items-center gap-2">
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700 }}>
                      {user.firstName?.charAt(0).toUpperCase()}
                    </div>
                    <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-1"></i>Logout
                    </button>
                  </div>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                <li className="nav-item"><Link className="btn btn-outline-light btn-sm ms-1" to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

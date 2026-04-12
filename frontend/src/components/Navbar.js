import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sv-navbar">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="fas fa-shield-alt me-2"></i>SafeVoyage AI
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav ms-auto align-items-center">
            {user ? (
              <>
                <li className="nav-item"><Link className="nav-link" to="/dashboard"><i className="fas fa-home me-1"></i>Dashboard</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/sos"><i className="fas fa-exclamation-triangle me-1 text-warning"></i>SOS</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/report"><i className="fas fa-file-alt me-1"></i>Report</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/alerts"><i className="fas fa-bell me-1"></i>Alerts</Link></li>
                {user.role === "admin" && <li className="nav-item"><Link className="nav-link text-warning" to="/admin"><i className="fas fa-cog me-1"></i>Admin</Link></li>}
                <li className="nav-item ms-2">
                  <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-1"></i>Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

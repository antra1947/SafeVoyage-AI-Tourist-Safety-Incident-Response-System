import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", padding: 20 }}>
      <div style={{ fontSize: "6rem", fontWeight: 800, color: "#c0392b", lineHeight: 1 }}>404</div>
      <h4 className="fw-bold mt-2 mb-1">Page Not Found</h4>
      <p className="text-muted mb-4">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/dashboard" className="btn btn-danger px-4">
        <i className="fas fa-home me-2"></i>Back to Dashboard
      </Link>
    </div>
  );
}

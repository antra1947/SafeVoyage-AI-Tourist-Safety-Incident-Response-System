import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm)         { toast.error("Passwords do not match"); return; }
    if (password.length < 8)          { toast.error("Password must be at least 8 characters"); return; }
    if (!/[A-Z]/.test(password))      { toast.error("Password must contain at least one uppercase letter"); return; }
    if (!/[a-z]/.test(password))      { toast.error("Password must contain at least one lowercase letter"); return; }
    if (!/\d/.test(password))         { toast.error("Password must contain at least one number"); return; }
    if (!/[@$!%*?&_#]/.test(password)){ toast.error("Password must contain at least one special character (@$!%*?&_#)"); return; }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success("Password reset successful!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed. Link may have expired.");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card card shadow-lg">
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <i className="fas fa-key fa-3x text-danger mb-2"></i>
            <h4 className="fw-bold">Reset Password</h4>
            <p className="text-muted small">Enter your new password</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small">New Password</label>
              <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="Min 8 chars, uppercase, number, special" />
              <div className="mt-1">
                {["min8", "upper", "lower", "number", "special"].map((rule) => {
                  const checks = {
                    min8: password.length >= 8, upper: /[A-Z]/.test(password),
                    lower: /[a-z]/.test(password), number: /\d/.test(password),
                    special: /[@$!%*?&_#]/.test(password),
                  };
                  const labels = { min8: "8+ chars", upper: "Uppercase", lower: "Lowercase", number: "Number", special: "Special (@$!%*?&_#)" };
                  return (
                    <span key={rule} className="me-2" style={{ fontSize: "0.72rem", color: checks[rule] ? "#27ae60" : "#aaa" }}>
                      {checks[rule] ? "✓" : "○"} {labels[rule]}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label small">Confirm Password</label>
              <input type="password" className="form-control" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Repeat password" />
            </div>
            <button type="submit" className="btn btn-danger w-100" disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Resetting...</> : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

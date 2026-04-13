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
    if (password !== confirm) { toast.error("Passwords do not match"); return; }
    if (password.length < 6)  { toast.error("Password must be at least 6 characters"); return; }
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
              <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Min 6 characters" />
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

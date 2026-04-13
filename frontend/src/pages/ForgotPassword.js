import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Reset email sent! Check your inbox.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset email");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card card shadow-lg">
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <i className="fas fa-lock fa-3x text-danger mb-2"></i>
            <h4 className="fw-bold">Forgot Password</h4>
            <p className="text-muted small">Enter your email and we'll send a reset link</p>
          </div>
          {sent ? (
            <div className="alert alert-success text-center">
              <i className="fas fa-check-circle me-2"></i>
              Reset link sent to <strong>{email}</strong>.<br/>
              <small>Check your inbox and spam folder.</small>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small">Email Address</label>
                <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" />
              </div>
              <button type="submit" className="btn btn-danger w-100" disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</> : "Send Reset Link"}
              </button>
            </form>
          )}
          <p className="text-center mt-3 mb-0 small">
            <Link to="/login" className="text-danger">← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Register() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", age: "", gender: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", { ...form, age: form.age ? parseInt(form.age) : undefined });
      const u = data.data.user;
      login({ _id: u._id, firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role }, data.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card card shadow-lg" style={{ maxWidth: "480px" }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <i className="fas fa-user-plus fa-3x text-danger mb-2"></i>
            <h3 className="fw-bold">Create Account</h3>
            <p className="text-muted">Join SafeVoyage AI</p>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">First Name</label>
              <input type="text" name="firstName" className="form-control" value={form.firstName} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Last Name</label>
              <input type="text" name="lastName" className="form-control" value={form.lastName} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} required minLength={8} />
              <div className="mt-1">
                {["min8", "upper", "lower", "number", "special"].map((rule) => {
                  const checks = {
                    min8:    form.password.length >= 8,
                    upper:   /[A-Z]/.test(form.password),
                    lower:   /[a-z]/.test(form.password),
                    number:  /\d/.test(form.password),
                    special: /[@$!%*?&_#]/.test(form.password),
                  };
                  const labels = {
                    min8: "8+ characters", upper: "Uppercase", lower: "Lowercase",
                    number: "Number", special: "Special char (@$!%*?&_#)",
                  };
                  return (
                    <span key={rule} className="me-2" style={{ fontSize: "0.72rem", color: checks[rule] ? "#27ae60" : "#aaa" }}>
                      {checks[rule] ? "✓" : "○"} {labels[rule]}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Age</label>
                <input type="number" name="age" className="form-control" value={form.age} onChange={handleChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Gender</label>
                <select name="gender" className="form-select" value={form.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-danger w-100" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
              Register
            </button>
          </form>
          <p className="text-center mt-3 mb-0">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

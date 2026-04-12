import React, { useState } from "react";
import api from "../api";

const INCIDENT_TYPES = ["theft", "accident", "medical", "natural_disaster", "harassment", "lost", "other"];
const SEVERITY_LEVELS = ["low", "medium", "high", "critical"];

export default function IncidentReport() {
  const [form, setForm] = useState({ type: "theft", description: "", severity: "medium", address: "" });
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => setError("Could not get location")
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/incidents", {
        type: form.type,
        description: form.description,
        severity: form.severity,
        location: {
          latitude: location?.latitude || null,
          longitude: location?.longitude || null,
          address: form.address || (location ? `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}` : "Unknown"),
        },
      });
      setSuccess("Incident reported successfully. Stay safe!");
      setForm({ type: "theft", description: "", severity: "medium", address: "" });
      setLocation(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report");
    } finally { setLoading(false); }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card shadow">
            <div className="card-header sv-card-header">
              <i className="fas fa-file-alt me-2"></i>Report an Incident
            </div>
            <div className="card-body p-4">
              {success && <div className="alert alert-success"><i className="fas fa-check-circle me-2"></i>{success}</div>}
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Incident Type</label>
                  <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {INCIDENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replace("_", " ").toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Severity Level</label>
                  <div className="d-flex gap-2">
                    {SEVERITY_LEVELS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`btn btn-sm ${form.severity === s ? "btn-danger" : "btn-outline-secondary"}`}
                        onClick={() => setForm({ ...form, severity: s })}
                      >
                        {s.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Description</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Describe what happened in detail..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Location</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter address or use GPS"
                      value={form.address || (location ? `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}` : "")}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                    <button type="button" className="btn btn-outline-danger" onClick={getLocation}>
                      <i className="fas fa-map-marker-alt"></i> GPS
                    </button>
                  </div>
                  {location && <small className="text-success"><i className="fas fa-check me-1"></i>GPS location captured</small>}
                </div>
                <button type="submit" className="btn btn-danger w-100" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                  Submit Report
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

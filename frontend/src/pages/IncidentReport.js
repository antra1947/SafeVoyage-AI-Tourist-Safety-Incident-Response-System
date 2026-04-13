import React, { useState } from "react";
import api from "../api";

const INCIDENT_TYPES = ["theft", "accident", "medical", "natural_disaster", "harassment", "lost", "other"];
const SEVERITY_LEVELS = ["low", "medium", "high", "critical"];

const TYPE_ICONS = {
  theft: "fa-user-secret", accident: "fa-car-crash", medical: "fa-heartbeat",
  natural_disaster: "fa-cloud-bolt", harassment: "fa-hand-paper", lost: "fa-map-marked-alt", other: "fa-exclamation",
};

export default function IncidentReport() {
  const [form, setForm]         = useState({ type: "theft", description: "", severity: "medium", address: "" });
  const [location, setLocation] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState("");
  const [error, setError]       = useState("");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading]   = useState(false);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => setError("Could not get location. Please enter manually."),
        { timeout: 8000 }
      );
    }
  };

  const analyzeWithAI = async () => {
    if (!form.description) { setError("Please add a description first."); return; }
    setAiLoading(true);
    try {
      const { data } = await api.post("/ai/analyze-incident", {
        type: form.type,
        description: form.description,
        location: form.address || (location ? `${location.latitude}, ${location.longitude}` : "Unknown"),
        severity: form.severity,
      });
      setAiAnalysis(data.data);
    } catch { setAiAnalysis(null); }
    finally { setAiLoading(false); }
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
          latitude:  location?.latitude  || null,
          longitude: location?.longitude || null,
          address: form.address || (location ? `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}` : "Unknown"),
        },
      });
      setSuccess("Incident reported successfully. Stay safe!");
      setForm({ type: "theft", description: "", severity: "medium", address: "" });
      setLocation(null);
      setAiAnalysis(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report. Please try again.");
    } finally { setLoading(false); }
  };

  const riskColor = (r) => ({ low: "success", medium: "warning", high: "danger", critical: "dark" }[r] || "secondary");

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">

          <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
            <div className="sv-card-header">
              <i className="fas fa-file-alt me-2"></i>Report an Incident
            </div>
            <div className="card-body p-4">

              {success && (
                <div className="alert alert-success d-flex align-items-center gap-2">
                  <i className="fas fa-check-circle"></i>{success}
                </div>
              )}
              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2">
                  <i className="fas fa-times-circle"></i>{error}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                {/* Incident Type */}
                <div className="mb-3">
                  <label className="form-label fw-bold small">Incident Type</label>
                  <div className="row g-2">
                    {INCIDENT_TYPES.map(t => (
                      <div key={t} className="col-6 col-md-4">
                        <button
                          type="button"
                          className={`btn btn-sm w-100 ${form.type === t ? "btn-danger" : "btn-outline-secondary"}`}
                          style={{ borderRadius: 8, fontSize: "0.78rem", padding: "6px 4px" }}
                          onClick={() => setForm({ ...form, type: t })}
                        >
                          <i className={`fas ${TYPE_ICONS[t]} me-1`}></i>
                          {t.replace("_", " ").toUpperCase()}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Severity */}
                <div className="mb-3">
                  <label className="form-label fw-bold small">Severity Level</label>
                  <div className="d-flex gap-2">
                    {SEVERITY_LEVELS.map(s => (
                      <button
                        key={s}
                        type="button"
                        className={`severity-btn btn btn-sm ${form.severity === s ? "btn-danger" : "btn-outline-secondary"}`}
                        onClick={() => setForm({ ...form, severity: s })}
                      >
                        {s.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label fw-bold small">Description</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Describe what happened in detail..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    required
                  />
                  <div className="d-flex justify-content-end mt-1">
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={analyzeWithAI} disabled={aiLoading || !form.description}>
                      {aiLoading ? <><span className="spinner-border spinner-border-sm me-1"></span>Analyzing...</> : <><i className="fas fa-robot me-1"></i>AI Analysis</>}
                    </button>
                  </div>
                </div>

                {/* AI Analysis Result */}
                {aiAnalysis && (
                  <div className="ai-tip-card mb-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="fas fa-robot text-primary"></i>
                      <span className="fw-bold small">AI Risk Assessment</span>
                      <span className={`badge bg-${riskColor(aiAnalysis.riskLevel)} ms-auto`}>{aiAnalysis.riskLevel?.toUpperCase()} RISK</span>
                    </div>
                    <p className="small text-muted mb-2">{aiAnalysis.summary}</p>
                    {aiAnalysis.immediateActions?.length > 0 && (
                      <>
                        <div className="fw-bold small mb-1">Immediate Actions:</div>
                        {aiAnalysis.immediateActions.map((a, i) => (
                          <div key={i} className="ai-tip-item"><i className="fas fa-arrow-right"></i><span>{a}</span></div>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {/* Location */}
                <div className="mb-4">
                  <label className="form-label fw-bold small">Location</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter address or use GPS"
                      value={form.address || (location ? `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}` : "")}
                      onChange={e => setForm({ ...form, address: e.target.value })}
                    />
                    <button type="button" className="btn btn-outline-danger" onClick={getLocation}>
                      <i className="fas fa-map-marker-alt me-1"></i>GPS
                    </button>
                  </div>
                  {location && <small className="text-success mt-1 d-block"><i className="fas fa-check me-1"></i>GPS location captured</small>}
                </div>

                <button type="submit" className="btn btn-danger w-100" disabled={loading} style={{ borderRadius: 10, padding: "12px" }}>
                  {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</> : <><i className="fas fa-paper-plane me-2"></i>Submit Report</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

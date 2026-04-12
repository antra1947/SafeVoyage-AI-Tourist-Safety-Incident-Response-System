import React, { useState, useEffect } from "react";
import api from "../api";

export default function SOSPage() {
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Grab location as soon as the page loads
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => setError("Could not get your location. Please enable GPS.")
      );
    }
  }, []);

  const handleSOS = async () => {
    if (!location) { setError("Location not available. Please enable GPS."); return; }
    setSending(true);
    setError("");
    setResult(null);
    try {
      const { data } = await api.post("/emergency/sos", {
        message: message || "Emergency SOS triggered",
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "SOS failed to send");
    } finally { setSending(false); }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg border-danger">
            <div className="card-header bg-danger text-white text-center">
              <i className="fas fa-exclamation-triangle fa-2x mb-1"></i>
              <h4 className="mb-0">Emergency SOS</h4>
            </div>
            <div className="card-body text-center p-4">

              {/* Location status indicator */}
              <div className={`alert ${location ? "alert-success" : "alert-warning"} mb-3`}>
                <i className={`fas ${location ? "fa-check-circle" : "fa-spinner fa-spin"} me-2`}></i>
                {location
                  ? `Location ready: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                  : "Fetching your location..."}
              </div>

              <div className="mb-3 text-start">
                <label className="form-label fw-bold">Additional Message (optional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Describe your emergency..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {/* The big SOS button */}
              <button
                className="btn btn-danger btn-lg sos-btn w-100 mb-3"
                onClick={handleSOS}
                disabled={sending || !location}
              >
                {sending ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Sending SOS...</>
                ) : (
                  <><i className="fas fa-exclamation-triangle me-2"></i>SEND SOS ALERT</>
                )}
              </button>

              {error && <div className="alert alert-danger">{error}</div>}

              {result && (
                <div className="alert alert-success">
                  <i className="fas fa-check-circle me-2"></i>
                  <strong>SOS Sent!</strong> Emergency services have been notified.
                  <br /><small>Alert ID: {result.sos?._id}</small>
                </div>
              )}

              <div className="mt-3 p-3 bg-light rounded text-start">
                <p className="mb-1 fw-bold small text-danger"><i className="fas fa-info-circle me-1"></i>What happens next:</p>
                <ul className="small text-muted mb-0">
                  <li>Your location is sent to the SafeVoyage admin team</li>
                  <li>An email alert is dispatched immediately</li>
                  <li>Your SOS is logged for tracking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

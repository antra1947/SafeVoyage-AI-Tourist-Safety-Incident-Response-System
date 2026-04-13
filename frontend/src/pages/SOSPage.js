import React, { useState, useEffect } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function SOSPage() {
  const { user } = useAuth();
  const [location, setLocation]   = useState(null);
  const [locError, setLocError]   = useState("");
  const [locLoading, setLocLoading] = useState(true);
  const [message, setMessage]     = useState("");
  const [sending, setSending]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState("");
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    setLocLoading(true);
    setLocError("");
    if (!navigator.geolocation) {
      setLocError("Geolocation not supported by your browser.");
      setLocLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocLoading(false);
      },
      () => {
        setLocError("Could not get location. Please enable GPS and try again.");
        setLocLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // 3-second countdown before sending
  const initiateSOS = () => {
    if (!location) { setError("Location not available. Please enable GPS."); return; }
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { handleSOS(); setCountdown(null); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleSOS = async () => {
    setSending(true);
    setError("");
    setResult(null);
    try {
      const { data } = await api.post("/emergency/sos", {
        message: message || "Emergency SOS triggered",
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "SOS failed to send. Please try again.");
    } finally { setSending(false); }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">

          {/* Header */}
          <div className="card border-0 shadow-lg" style={{ borderRadius: 16, overflow: "hidden" }}>
            <div className="card-header text-white text-center py-3" style={{ background: "linear-gradient(135deg, #c0392b, #922b21)" }}>
              <div style={{ fontSize: "2.5rem" }}>🆘</div>
              <h4 className="mb-0 fw-bold">Emergency SOS</h4>
              <small className="opacity-75">Alert will be sent to your emergency contacts</small>
            </div>

            <div className="card-body p-4">

              {/* Location Status */}
              <div className={`alert ${location ? "alert-success" : locError ? "alert-danger" : "alert-warning"} d-flex align-items-center gap-2 mb-3`}>
                {locLoading ? (
                  <><span className="spinner-border spinner-border-sm"></span><span>Fetching your location...</span></>
                ) : location ? (
                  <><i className="fas fa-check-circle"></i><span>Location ready: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span></>
                ) : (
                  <><i className="fas fa-exclamation-circle"></i><span>{locError}</span></>
                )}
                {!locLoading && !location && (
                  <button className="btn btn-sm btn-outline-danger ms-auto" onClick={getLocation}>Retry</button>
                )}
              </div>

              {/* Message */}
              <div className="mb-3">
                <label className="form-label fw-600 small">Additional Message (optional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Describe your emergency..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  disabled={sending}
                />
              </div>

              {/* Countdown or SOS Button */}
              {countdown !== null ? (
                <div className="text-center mb-3">
                  <div style={{ fontSize: "4rem", fontWeight: 800, color: "#c0392b", lineHeight: 1 }}>{countdown}</div>
                  <p className="text-muted small">Sending SOS in {countdown} second{countdown !== 1 ? "s" : ""}...</p>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => setCountdown(null)}>Cancel</button>
                </div>
              ) : (
                <button
                  className="btn btn-danger sos-btn w-100 mb-3"
                  onClick={initiateSOS}
                  disabled={sending || locLoading || !location}
                >
                  {sending
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Sending SOS...</>
                    : <><i className="fas fa-exclamation-triangle me-2"></i>SEND SOS ALERT</>
                  }
                </button>
              )}

              {error && <div className="alert alert-danger"><i className="fas fa-times-circle me-2"></i>{error}</div>}

              {result && (
                <div className="alert alert-success">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className="fas fa-check-circle fa-lg"></i>
                    <strong>SOS Sent Successfully!</strong>
                  </div>
                  <p className="mb-2 small">
                    A confirmation email has been sent to <strong>{result.data?.confirmationSentTo}</strong>
                  </p>
                  {result.data?.notifiedContacts?.length > 0 ? (
                    <>
                      <p className="mb-1 small fw-bold">📧 Emergency contacts notified:</p>
                      {result.data.notifiedContacts.map((c, i) => (
                        <div key={i} className="d-flex align-items-center gap-2 mb-1 p-2 rounded" style={{ background: "#d4edda" }}>
                          <i className="fas fa-check text-success"></i>
                          <span className="small"><strong>{c.name}</strong> — {c.email}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="alert alert-warning py-1 mb-1 small">
                      <i className="fas fa-exclamation-triangle me-1"></i>
                      No emergency contacts found. Please add contacts in your profile.
                    </div>
                  )}
                  <p className="mb-0 mt-2 small text-muted">Alert ID: {result.data?._id}</p>
                </div>
              )}

              {/* Info Box */}
              <div className="p-3 rounded mt-2" style={{ background: "#fef9f9", border: "1px solid #f5c6cb" }}>
                <p className="mb-2 fw-bold small text-danger"><i className="fas fa-info-circle me-1"></i>What happens when you send SOS:</p>
                <ul className="small text-muted mb-0 ps-3">
                  <li>Your GPS location is captured instantly</li>
                  <li>Email alert sent to all your emergency contacts</li>
                  <li>SOS is logged with timestamp for tracking</li>
                  <li>Admin team is notified in real-time</li>
                </ul>
              </div>

              {/* Emergency Numbers */}
              <div className="mt-3 p-3 rounded" style={{ background: "#f0f2f5" }}>
                <p className="fw-bold small mb-2"><i className="fas fa-phone me-1 text-danger"></i>Emergency Numbers (India)</p>
                <div className="row g-1">
                  {[["Police", "100"], ["Ambulance", "108"], ["Fire", "101"], ["Women Helpline", "1091"]].map(([name, num]) => (
                    <div key={name} className="col-6">
                      <a href={`tel:${num}`} className="d-flex align-items-center gap-2 text-decoration-none text-dark small p-1 rounded hover-bg">
                        <span className="badge bg-danger">{num}</span>{name}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

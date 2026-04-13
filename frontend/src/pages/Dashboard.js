import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import LocationMap from "../components/LocationMap";

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile]     = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [sosList, setSosList]     = useState([]);
  const [location, setLocation]   = useState(null);
  const [editMode, setEditMode]   = useState(false);
  const [editForm, setEditForm]   = useState({});
  const [saveMsg, setSaveMsg]     = useState("");
  const [aiTips, setAiTips]       = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [activeTab, setActiveTab] = useState("incidents");

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const { data } = await api.get("/user/profile");
      const u = data.data || data;
      setProfile(u);
      setEditForm({
        firstName: u.firstName || "",
        lastName:  u.lastName  || "",
        photoUrl:  u.photoUrl  || "",
        safetyProfile: {
          bloodGroup:   u.safetyProfile?.bloodGroup   || "",
          allergies:    u.safetyProfile?.allergies    || "",
          medicalNotes: u.safetyProfile?.medicalNotes || "",
          emergencyContacts: u.safetyProfile?.emergencyContacts || [],
        },
      });
    } catch (e) { console.error(e); }
    finally { setLoadingProfile(false); }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchMyIncidents();
    fetchMySOS();
    getLocation();
  }, [fetchProfile]);

  const fetchMyIncidents = async () => {
    try {
      const { data } = await api.get("/incidents/my");
      setIncidents(data.data || data || []);
    } catch (e) { console.error(e); }
  };

  const fetchMySOS = async () => {
    try {
      const { data } = await api.get("/emergency/history");
      setSosList(data.data || []);
    } catch (e) { console.error(e); }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation(null),
        { timeout: 8000 }
      );
    }
  };

  const fetchAITips = async () => {
    setLoadingAI(true);
    try {
      const { data } = await api.post("/ai/safety-advice", {
        location: location ? `Lat: ${location.lat}, Lng: ${location.lng}` : "Unknown",
        context: "General tourist safety",
      });
      setAiTips(data.data?.tips || []);
    } catch (e) { console.error(e); }
    finally { setLoadingAI(false); }
  };

  const handleSaveProfile = async () => {
    try {
      await api.patch("/user/profile", editForm);
      setSaveMsg("Profile updated successfully");
      setEditMode(false);
      fetchProfile();
      // Sync navbar photo and name
      updateUser({
        firstName: editForm.firstName,
        lastName:  editForm.lastName,
        photoUrl:  editForm.photoUrl,
      });
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.errors?.[0] || "Update failed. Please try again.";
      setSaveMsg(msg);
    }
  };

  const addEmergencyContact = () => {
    setEditForm(prev => ({
      ...prev,
      safetyProfile: {
        ...prev.safetyProfile,
        emergencyContacts: [...(prev.safetyProfile?.emergencyContacts || []), { name: "", phone: "", email: "" }],
      },
    }));
  };

  const updateContact = (idx, field, val) => {
    const contacts = [...(editForm.safetyProfile?.emergencyContacts || [])];
    contacts[idx] = { ...contacts[idx], [field]: val };
    setEditForm(prev => ({ ...prev, safetyProfile: { ...prev.safetyProfile, emergencyContacts: contacts } }));
  };

  const removeContact = (idx) => {
    const contacts = (editForm.safetyProfile?.emergencyContacts || []).filter((_, i) => i !== idx);
    setEditForm(prev => ({ ...prev, safetyProfile: { ...prev.safetyProfile, emergencyContacts: contacts } }));
  };

  const severityColor = (s) => ({ low: "success", medium: "warning", high: "danger", critical: "dark" }[s] || "secondary");
  const statusColor   = (s) => ({ pending: "warning", under_review: "info", resolved: "success" }[s] || "secondary");
  const sosColor      = (s) => ({ active: "danger", acknowledged: "warning", resolved: "success" }[s] || "secondary");

  return (
    <div className="dashboard-wrapper">
      <div className="container-fluid px-3 px-md-4">

        {/* Welcome Banner */}
        <div className="card border-0 mb-4" style={{ background: "linear-gradient(135deg, #c0392b, #922b21)", borderRadius: 12 }}>
          <div className="card-body py-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 className="text-white mb-0 fw-bold">
                Welcome back, {profile?.firstName || user?.firstName || "Tourist"} {profile?.lastName || user?.lastName || ""} 👋
              </h5>
              <small className="text-white-50">Stay safe. Your safety dashboard is ready.</small>
            </div>
            <div className="d-flex gap-2">
              <Link to="/sos" className="btn btn-light btn-sm fw-bold text-danger">
                <i className="fas fa-exclamation-triangle me-1"></i>SOS
              </Link>
              <Link to="/report" className="btn btn-outline-light btn-sm">
                <i className="fas fa-file-alt me-1"></i>Report
              </Link>
            </div>
          </div>
        </div>

        <div className="row g-3">

          {/* LEFT: Profile */}
          <div className="col-lg-3">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
              <div className="sv-card-header">
                <i className="fas fa-user-circle me-2"></i>My Profile
              </div>
              <div className="card-body p-3">
                {loadingProfile ? (
                  <div className="sv-spinner"><div className="spinner-border spinner-border-sm"></div></div>
                ) : !editMode ? (
                  <>
                    <div className="text-center mb-3">
                      <div className="profile-avatar mb-2">
                        {profile?.photoUrl
                          ? <img src={profile.photoUrl} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                          : (profile?.firstName?.charAt(0) || "?").toUpperCase()
                        }
                      </div>
                      <h6 className="fw-bold mb-0">{profile?.firstName} {profile?.lastName}</h6>
                      <small className="text-muted">{profile?.email}</small>
                      <div className="mt-1">
                        <span className="badge bg-danger">{profile?.role}</span>
                      </div>
                    </div>
                    <div className="profile-info-item">
                      <i className="fas fa-tint"></i>
                      <span>{profile?.safetyProfile?.bloodGroup || <span className="text-muted">Blood group not set</span>}</span>
                    </div>
                    <div className="profile-info-item">
                      <i className="fas fa-allergies"></i>
                      <span>{profile?.safetyProfile?.allergies || <span className="text-muted">No allergies noted</span>}</span>
                    </div>
                    <div className="profile-info-item">
                      <i className="fas fa-notes-medical"></i>
                      <span>{profile?.safetyProfile?.medicalNotes || <span className="text-muted">No medical notes</span>}</span>
                    </div>
                    {profile?.safetyProfile?.emergencyContacts?.length > 0 && (
                      <div className="mt-2">
                        <small className="fw-bold text-danger d-block mb-1">
                          <i className="fas fa-phone-alt me-1"></i>Emergency Contacts
                        </small>
                        {profile.safetyProfile.emergencyContacts.map((c, i) => (
                          <div key={i} className="bg-light rounded p-2 mb-1 small">
                            <div className="fw-bold">{c.name}</div>
                            <div className="text-muted">{c.phone} · {c.email}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button className="btn btn-outline-danger btn-sm w-100 mt-3" onClick={() => setEditMode(true)}>
                      <i className="fas fa-edit me-1"></i>Edit Profile
                    </button>
                  </>
                ) : (
                  <>
                    {/* Photo picker */}
                    <div className="text-center mb-3">
                      <div className="profile-avatar mb-2" style={{ cursor: "pointer", position: "relative" }} onClick={() => document.getElementById("photoInput").click()}>
                        {editForm.photoUrl
                          ? <img src={editForm.photoUrl} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                          : <span>{editForm.firstName?.charAt(0)?.toUpperCase() || "?"}</span>
                        }
                        <div style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: "#c0392b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="fas fa-camera text-white" style={{ fontSize: "0.6rem" }}></i>
                        </div>
                      </div>
                      <input
                        id="photoInput"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={e => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => setEditForm({ ...editForm, photoUrl: ev.target.result });
                          reader.readAsDataURL(file);
                        }}
                      />
                      <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>Click photo to change</small>
                    </div>
                    <div className="row g-2 mb-2">
                      <div className="col-6">
                        <input className="form-control form-control-sm" placeholder="First Name" value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} />
                      </div>
                      <div className="col-6">
                        <input className="form-control form-control-sm" placeholder="Last Name" value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} />
                      </div>
                    </div>
                    <hr className="my-2" />
                    <small className="fw-bold text-danger d-block mb-2">Safety Profile</small>
                    <input className="form-control form-control-sm mb-2" placeholder="Blood Group (e.g. B+)" value={editForm.safetyProfile?.bloodGroup} onChange={e => setEditForm({ ...editForm, safetyProfile: { ...editForm.safetyProfile, bloodGroup: e.target.value } })} />
                    <input className="form-control form-control-sm mb-2" placeholder="Allergies" value={editForm.safetyProfile?.allergies} onChange={e => setEditForm({ ...editForm, safetyProfile: { ...editForm.safetyProfile, allergies: e.target.value } })} />
                    <input className="form-control form-control-sm mb-2" placeholder="Medical Notes" value={editForm.safetyProfile?.medicalNotes} onChange={e => setEditForm({ ...editForm, safetyProfile: { ...editForm.safetyProfile, medicalNotes: e.target.value } })} />
                    <small className="fw-bold text-danger d-block mb-1">Emergency Contacts</small>
                    {(editForm.safetyProfile?.emergencyContacts || []).map((c, i) => (
                      <div key={i} className="border rounded p-2 mb-2 bg-light">
                        <input className="form-control form-control-sm mb-1" placeholder="Name" value={c.name} onChange={e => updateContact(i, "name", e.target.value)} />
                        <input className="form-control form-control-sm mb-1" placeholder="Phone" value={c.phone} onChange={e => updateContact(i, "phone", e.target.value)} />
                        <input className="form-control form-control-sm mb-1" placeholder="Email" value={c.email} onChange={e => updateContact(i, "email", e.target.value)} />
                        <button className="btn btn-outline-danger btn-sm w-100" onClick={() => removeContact(i)}>Remove</button>
                      </div>
                    ))}
                    <button className="btn btn-outline-secondary btn-sm w-100 mb-2" onClick={addEmergencyContact}>
                      <i className="fas fa-plus me-1"></i>Add Contact
                    </button>
                    <div className="d-flex gap-2">
                      <button className="btn btn-danger btn-sm flex-fill" onClick={handleSaveProfile}>Save</button>
                      <button className="btn btn-secondary btn-sm flex-fill" onClick={() => setEditMode(false)}>Cancel</button>
                    </div>
                    {saveMsg && <div className={`alert ${saveMsg.includes("success") ? "alert-success" : "alert-danger"} mt-2 py-1 small`}>{saveMsg}</div>}
                  </>
                )}
              </div>
            </div>

            {/* AI Safety Tips */}
            <div className="card border-0 shadow-sm mt-3" style={{ borderRadius: 12 }}>
              <div className="sv-card-header">
                <i className="fas fa-robot me-2"></i>AI Safety Tips
              </div>
              <div className="card-body p-3">
                {aiTips.length === 0 ? (
                  <div className="text-center">
                    <p className="text-muted small mb-2">Get personalized safety tips powered by Gemini AI</p>
                    <button className="btn btn-outline-danger btn-sm w-100" onClick={fetchAITips} disabled={loadingAI}>
                      {loadingAI ? <><span className="spinner-border spinner-border-sm me-1"></span>Analyzing...</> : <><i className="fas fa-magic me-1"></i>Get AI Tips</>}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="ai-tip-card">
                      {aiTips.map((tip, i) => (
                        <div key={i} className="ai-tip-item">
                          <i className="fas fa-shield-alt"></i>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                    <button className="btn btn-outline-secondary btn-sm w-100 mt-2" onClick={fetchAITips} disabled={loadingAI}>
                      <i className="fas fa-sync me-1"></i>Refresh
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Main Content */}
          <div className="col-lg-9">

            {/* Quick Actions */}
            <div className="row g-3 mb-3">
              <div className="col-4">
                <Link to="/sos" className="action-card bg-danger text-white">
                  <div className="action-icon"><i className="fas fa-exclamation-triangle"></i></div>
                  <div className="action-label">SOS Alert</div>
                </Link>
              </div>
              <div className="col-4">
                <Link to="/report" className="action-card text-dark" style={{ background: "#f39c12" }}>
                  <div className="action-icon"><i className="fas fa-file-alt"></i></div>
                  <div className="action-label">Report Incident</div>
                </Link>
              </div>
              <div className="col-4">
                <Link to="/alerts" className="action-card text-white" style={{ background: "#2980b9" }}>
                  <div className="action-icon"><i className="fas fa-bell"></i></div>
                  <div className="action-label">Safety Alerts</div>
                </Link>
              </div>
            </div>

            {/* Map */}
            <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 12 }}>
              <div className="sv-card-header">
                <i className="fas fa-map-marker-alt me-2"></i>Your Current Location
              </div>
              {location ? (
                <>
                  <div className="map-container">
                    <LocationMap lat={location.lat} lng={location.lng} />
                  </div>
                  <div className="px-3 py-2 text-muted small text-center bg-light" style={{ borderRadius: "0 0 12px 12px" }}>
                    <i className="fas fa-crosshairs me-1 text-danger"></i>
                    Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-muted">
                  <i className="fas fa-map-marker-alt fa-2x mb-2 text-danger opacity-50"></i>
                  <p className="mb-2 small">Location access denied or unavailable</p>
                  <button className="btn btn-outline-danger btn-sm" onClick={getLocation}>
                    <i className="fas fa-location-arrow me-1"></i>Try Again
                  </button>
                </div>
              )}
            </div>

            {/* Tabs: Incidents & SOS */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
              <div className="card-header bg-white border-bottom d-flex gap-0" style={{ borderRadius: "12px 12px 0 0" }}>
                <button className={`admin-tab-btn ${activeTab === "incidents" ? "active" : ""}`} onClick={() => setActiveTab("incidents")}>
                  <i className="fas fa-list me-1"></i>Incidents ({incidents.length})
                </button>
                <button className={`admin-tab-btn ${activeTab === "sos" ? "active" : ""}`} onClick={() => setActiveTab("sos")}>
                  <i className="fas fa-exclamation-circle me-1"></i>SOS History ({sosList.length})
                </button>
              </div>
              <div className="card-body p-0">
                {activeTab === "incidents" && (
                  incidents.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <i className="fas fa-clipboard fa-2x mb-2 opacity-25"></i>
                      <p className="small">No incidents reported yet</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table sv-table mb-0">
                        <thead><tr><th>Type</th><th>Description</th><th>Severity</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
                        <tbody>
                          {incidents.map(inc => (
                            <tr key={inc._id}>
                              <td className="text-capitalize">{inc.type?.replace("_", " ")}</td>
                              <td>{inc.description?.substring(0, 40)}...</td>
                              <td><span className={`badge bg-${severityColor(inc.severity)}`}>{inc.severity}</span></td>
                              <td>
                                <select
                                  className="form-select form-select-sm"
                                  style={{ minWidth: 110, fontSize: "0.78rem" }}
                                  value={inc.status}
                                  onChange={async (e) => {
                                    try {
                                      await api.patch(`/incidents/${inc._id}/mystatus`, { status: e.target.value });
                                      fetchMyIncidents();
                                    } catch { alert("Could not update status"); }
                                  }}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="under_review">Under Review</option>
                                  <option value="resolved">Resolved</option>
                                </select>
                              </td>
                              <td>{new Date(inc.createdAt).toLocaleDateString()}</td>
                              <td>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  title="Delete incident"
                                  onClick={async () => {
                                    if (!window.confirm("Delete this incident?")) return;
                                    try {
                                      await api.delete(`/incidents/${inc._id}`);
                                      fetchMyIncidents();
                                    } catch (e) { alert("Could not delete"); }
                                  }}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
                {activeTab === "sos" && (
                  sosList.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <i className="fas fa-shield-alt fa-2x mb-2 opacity-25"></i>
                      <p className="small">No SOS alerts triggered</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table sv-table mb-0">
                        <thead><tr><th>Message</th><th>Location</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
                        <tbody>
                          {sosList.map(s => (
                            <tr key={s._id} className={s.status === "active" ? "table-danger" : ""}>
                              <td>{s.message}</td>
                              <td className="small text-muted">
                                {s.location?.coordinates
                                  ? <a href={`https://maps.google.com/?q=${s.location.coordinates[1]},${s.location.coordinates[0]}`} target="_blank" rel="noreferrer" className="text-danger">
                                      {s.location.coordinates[1]?.toFixed(3)}, {s.location.coordinates[0]?.toFixed(3)}
                                    </a>
                                  : "N/A"}
                              </td>
                              <td><span className={`badge bg-${sosColor(s.status)}`}>{s.status}</span></td>
                              <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                              <td className="d-flex gap-1">
                                {s.status === "active" && (
                                  <button
                                    className="btn btn-success btn-sm"
                                    title="Mark as resolved"
                                    onClick={async () => {
                                      try {
                                        await api.patch(`/emergency/${s._id}/resolve`);
                                        fetchMySOS();
                                      } catch (e) { alert("Could not resolve"); }
                                    }}
                                  >
                                    <i className="fas fa-check"></i>
                                  </button>
                                )}
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  title="Delete record"
                                  onClick={async () => {
                                    if (!window.confirm("Delete this SOS record?")) return;
                                    try {
                                      await api.delete(`/emergency/${s._id}`);
                                      fetchMySOS();
                                    } catch (e) { alert("Could not delete"); }
                                  }}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

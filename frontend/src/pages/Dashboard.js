import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import LocationMap from "../components/LocationMap";

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [sosList, setSosList] = useState([]);
  const [location, setLocation] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    fetchProfile();
    fetchMyIncidents();
    fetchMySOS();
    getLocation();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/user/profile");
      const u = data.data || data;
      setProfile(u);
      setEditForm({ firstName: u.firstName, lastName: u.lastName, photoUrl: u.photoUrl, safetyProfile: u.safetyProfile || {} });
    } catch (e) { console.error(e); }
  };

  const fetchMyIncidents = async () => {
    try { const { data } = await api.get("/incidents/my"); setIncidents(Array.isArray(data) ? data : data.data || []); }
    catch (e) { console.error(e); }
  };

  const fetchMySOS = async () => {
    try { const { data } = await api.get("/emergency/history"); setSosList(data.data || []); }
    catch (e) { console.error(e); }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation(null)
      );
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.patch("/user/profile", editForm);
      setSaveMsg("Profile updated successfully");
      setEditMode(false);
      fetchProfile();
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (e) { setSaveMsg("Update failed"); }
  };

  const severityBadge = (s) => ({ low: "success", medium: "warning", high: "danger", critical: "dark" }[s] || "secondary");
  const statusBadge = (s) => ({ pending: "warning", under_review: "info", resolved: "success" }[s] || "secondary");

  return (
    <div className="container py-4">
      <div className="row g-4">

        {/* Profile Card */}
        <div className="col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-header sv-card-header">
              <i className="fas fa-user-circle me-2"></i>My Profile
            </div>
            <div className="card-body">
              {profile && !editMode ? (
                <>
                  <div className="text-center mb-3">
                    <div className="sv-avatar">{profile.firstName?.charAt(0).toUpperCase()}</div>
                    <h5 className="mt-2 mb-0">{profile.firstName} {profile.lastName}</h5>
                    <small className="text-muted">{profile.email}</small>
                  </div>
                  <hr />
                  <p><i className="fas fa-phone me-2 text-muted"></i>{profile.phone || "Not set"}</p>
                  <p><i className="fas fa-globe me-2 text-muted"></i>{profile.nationality || "Not set"}</p>
                  <p><i className="fas fa-id-badge me-2 text-muted"></i><span className="badge bg-danger">{profile.role}</span></p>
                  <button className="btn btn-outline-danger btn-sm w-100" onClick={() => setEditMode(true)}>
                    <i className="fas fa-edit me-1"></i>Edit Profile
                  </button>
                </>
              ) : editMode ? (
                <>
                  <input className="form-control mb-2" placeholder="First Name" value={editForm.firstName || ""} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} />
                  <input className="form-control mb-2" placeholder="Last Name" value={editForm.lastName || ""} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} />
                  <input className="form-control mb-2" placeholder="Photo URL" value={editForm.photoUrl || ""} onChange={(e) => setEditForm({ ...editForm, photoUrl: e.target.value })} />
                  <hr /><p className="fw-bold small">Safety Profile</p>
                  <input className="form-control mb-2" placeholder="Blood Group" value={editForm.safetyProfile?.bloodGroup || ""} onChange={(e) => setEditForm({ ...editForm, safetyProfile: { ...editForm.safetyProfile, bloodGroup: e.target.value } })} />
                  <input className="form-control mb-2" placeholder="Allergies" value={editForm.safetyProfile?.allergies || ""} onChange={(e) => setEditForm({ ...editForm, safetyProfile: { ...editForm.safetyProfile, allergies: e.target.value } })} />
                  <input className="form-control mb-3" placeholder="Medical Notes" value={editForm.safetyProfile?.medicalNotes || ""} onChange={(e) => setEditForm({ ...editForm, safetyProfile: { ...editForm.safetyProfile, medicalNotes: e.target.value } })} />
                  <div className="d-flex gap-2">
                    <button className="btn btn-danger btn-sm flex-fill" onClick={handleSaveProfile}>Save</button>
                    <button className="btn btn-secondary btn-sm flex-fill" onClick={() => setEditMode(false)}>Cancel</button>
                  </div>
                </>
              ) : <div className="text-center"><div className="spinner-border text-danger"></div></div>}
              {saveMsg && <div className="alert alert-success mt-2 py-1 small">{saveMsg}</div>}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-lg-8">

          {/* Quick Actions */}
          <div className="row g-3 mb-4">
            <div className="col-sm-4">
              <Link to="/sos" className="text-decoration-none">
                <div className="card sv-action-card bg-danger text-white text-center p-3">
                  <i className="fas fa-exclamation-triangle fa-2x mb-2"></i>
                  <strong>SOS Alert</strong>
                </div>
              </Link>
            </div>
            <div className="col-sm-4">
              <Link to="/report" className="text-decoration-none">
                <div className="card sv-action-card bg-warning text-dark text-center p-3">
                  <i className="fas fa-file-alt fa-2x mb-2"></i>
                  <strong>Report Incident</strong>
                </div>
              </Link>
            </div>
            <div className="col-sm-4">
              <Link to="/alerts" className="text-decoration-none">
                <div className="card sv-action-card bg-info text-white text-center p-3">
                  <i className="fas fa-bell fa-2x mb-2"></i>
                  <strong>Safety Alerts</strong>
                </div>
              </Link>
            </div>
          </div>

          {/* Location Map */}
          <div className="card shadow-sm mb-4">
            <div className="card-header sv-card-header">
              <i className="fas fa-map-marker-alt me-2"></i>Your Current Location
            </div>
            <div className="card-body p-0">
              {location ? (
                <>
                  <LocationMap lat={location.lat} lng={location.lng} />
                  <div className="p-2 text-muted small text-center">
                    Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-muted">
                  <i className="fas fa-map-marker-alt fa-2x mb-2"></i>
                  <p>Location access denied or unavailable</p>
                  <button className="btn btn-outline-danger btn-sm" onClick={getLocation}>Try Again</button>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          {profile?.emergencyContact?.name && (
            <div className="card shadow-sm mb-4 border-danger">
              <div className="card-header bg-danger text-white">
                <i className="fas fa-phone-alt me-2"></i>Emergency Contact
              </div>
              <div className="card-body">
                <p className="mb-1"><strong>{profile.emergencyContact.name}</strong> ({profile.emergencyContact.relation})</p>
                <p className="mb-0"><i className="fas fa-phone me-2"></i>{profile.emergencyContact.phone}</p>
              </div>
            </div>
          )}

          {/* My Incidents */}
          <div className="card shadow-sm mb-4">
            <div className="card-header sv-card-header">
              <i className="fas fa-list me-2"></i>My Incident Reports ({incidents.length})
            </div>
            <div className="card-body p-0">
              {incidents.length === 0 ? (
                <p className="text-muted text-center p-3">No incidents reported yet</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light"><tr><th>Type</th><th>Description</th><th>Severity</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                      {incidents.map((inc) => (
                        <tr key={inc._id}>
                          <td className="text-capitalize">{inc.type.replace("_", " ")}</td>
                          <td>{inc.description.substring(0, 40)}...</td>
                          <td><span className={`badge bg-${severityBadge(inc.severity)}`}>{inc.severity}</span></td>
                          <td><span className={`badge bg-${statusBadge(inc.status)}`}>{inc.status.replace("_", " ")}</span></td>
                          <td>{new Date(inc.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* SOS History */}
          <div className="card shadow-sm">
            <div className="card-header sv-card-header">
              <i className="fas fa-exclamation-circle me-2"></i>My SOS History ({sosList.length})
            </div>
            <div className="card-body p-0">
              {sosList.length === 0 ? (
                <p className="text-muted text-center p-3">No SOS alerts triggered</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light"><tr><th>Message</th><th>Location</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                      {sosList.map((s) => (
                        <tr key={s._id}>
                          <td>{s.message}</td>
                          <td>Lat: {s.location?.coordinates?.[1]?.toFixed(3)}, Lng: {s.location?.coordinates?.[0]?.toFixed(3)}</td>
                          <td><span className={`badge ${s.status === "active" ? "bg-danger" : s.status === "acknowledged" ? "bg-warning" : "bg-success"}`}>{s.status}</span></td>
                          <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

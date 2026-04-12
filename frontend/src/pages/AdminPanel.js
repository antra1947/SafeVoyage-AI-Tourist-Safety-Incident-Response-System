import React, { useState, useEffect } from "react";
import api from "../api";

export default function AdminPanel() {
  const [tab, setTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try { const { data } = await api.get("/admin/stats"); setStats(data); }
    catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try { const { data } = await api.get("/admin/users"); setUsers(data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchIncidents = async () => {
    setLoading(true);
    try { const { data } = await api.get("/incidents"); setIncidents(data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchSOS = async () => {
    setLoading(true);
    try { const { data } = await api.get("/sos"); setSosList(data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleTabChange = (t) => {
    setTab(t);
    if (t === "users" && users.length === 0) fetchUsers();
    if (t === "incidents" && incidents.length === 0) fetchIncidents();
    if (t === "sos" && sosList.length === 0) fetchSOS();
  };

  const handleUpdateIncidentStatus = async (id, status) => {
    try {
      await api.patch(`/incidents/${id}/status`, { status });
      fetchIncidents();
    } catch (e) { console.error(e); }
  };

  const handleAcknowledgeSOS = async (id) => {
    try {
      await api.patch(`/sos/${id}/acknowledge`);
      fetchSOS();
    } catch (e) { console.error(e); }
  };

  const severityBadge = (s) => ({ low: "success", medium: "warning", high: "danger", critical: "dark" }[s] || "secondary");

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-4"><i className="fas fa-cog text-danger me-2"></i>Admin Control Panel</h4>

      {/* Stats cards */}
      {stats && (
        <div className="row g-3 mb-4">
          {[
            { label: "Total Tourists", value: stats.totalUsers, icon: "fa-users", color: "primary" },
            { label: "Total Incidents", value: stats.totalIncidents, icon: "fa-file-alt", color: "warning" },
            { label: "Active SOS", value: stats.activeSOS, icon: "fa-exclamation-triangle", color: "danger" },
            { label: "Pending Incidents", value: stats.pendingIncidents, icon: "fa-clock", color: "info" },
          ].map((s) => (
            <div key={s.label} className="col-sm-6 col-lg-3">
              <div className={`card text-white bg-${s.color} shadow-sm`}>
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fs-2 fw-bold">{s.value}</div>
                    <div className="small">{s.label}</div>
                  </div>
                  <i className={`fas ${s.icon} fa-2x opacity-50`}></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab navigation */}
      <ul className="nav nav-tabs mb-3">
        {["stats", "users", "incidents", "sos"].map((t) => (
          <li key={t} className="nav-item">
            <button className={`nav-link ${tab === t ? "active" : ""}`} onClick={() => handleTabChange(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          </li>
        ))}
      </ul>

      {loading && <div className="text-center py-4"><div className="spinner-border text-danger"></div></div>}

      {/* Users tab */}
      {tab === "users" && !loading && (
        <div className="table-responsive">
          <table className="table table-hover shadow-sm">
            <thead className="table-dark"><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Nationality</th><th>Joined</th></tr></thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u._id}>
                  <td>{i + 1}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || "-"}</td>
                  <td>{u.nationality || "-"}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-center text-muted">No users found</p>}
        </div>
      )}

      {/* Incidents tab */}
      {tab === "incidents" && !loading && (
        <div className="table-responsive">
          <table className="table table-hover shadow-sm">
            <thead className="table-dark"><tr><th>Reporter</th><th>Type</th><th>Description</th><th>Severity</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc._id}>
                  <td>{inc.reportedBy?.name || "Unknown"}</td>
                  <td className="text-capitalize">{inc.type.replace("_", " ")}</td>
                  <td>{inc.description.substring(0, 50)}...</td>
                  <td><span className={`badge bg-${severityBadge(inc.severity)}`}>{inc.severity}</span></td>
                  <td><span className="badge bg-secondary">{inc.status.replace("_", " ")}</span></td>
                  <td>
                    <select className="form-select form-select-sm" value={inc.status} onChange={(e) => handleUpdateIncidentStatus(inc._id, e.target.value)}>
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {incidents.length === 0 && <p className="text-center text-muted">No incidents found</p>}
        </div>
      )}

      {/* SOS tab */}
      {tab === "sos" && !loading && (
        <div className="table-responsive">
          <table className="table table-hover shadow-sm">
            <thead className="table-dark"><tr><th>Tourist</th><th>Email</th><th>Message</th><th>Location</th><th>Status</th><th>Time</th><th>Action</th></tr></thead>
            <tbody>
              {sosList.map((s) => (
                <tr key={s._id} className={s.status === "active" ? "table-danger" : ""}>
                  <td>{s.triggeredBy?.name || "Unknown"}</td>
                  <td>{s.triggeredBy?.email || "-"}</td>
                  <td>{s.message}</td>
                  <td>Lat: {s.location.latitude?.toFixed(3)}, Lng: {s.location.longitude?.toFixed(3)}</td>
                  <td><span className={`badge ${s.status === "active" ? "bg-danger" : s.status === "acknowledged" ? "bg-warning text-dark" : "bg-success"}`}>{s.status}</span></td>
                  <td>{new Date(s.createdAt).toLocaleString()}</td>
                  <td>
                    {s.status === "active" && (
                      <button className="btn btn-warning btn-sm" onClick={() => handleAcknowledgeSOS(s._id)}>
                        Acknowledge
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sosList.length === 0 && <p className="text-center text-muted">No SOS alerts found</p>}
        </div>
      )}
    </div>
  );
}

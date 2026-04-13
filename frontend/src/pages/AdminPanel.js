import React, { useState, useEffect, useCallback } from "react";
import api from "../api";

export default function AdminPanel() {
  const [tab, setTab]           = useState("stats");
  const [stats, setStats]       = useState(null);
  const [users, setUsers]       = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [sosList, setSosList]   = useState([]);
  const [loading, setLoading]   = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/stats");
      setStats(data.data || data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/incidents");
      setIncidents(data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchSOS = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/sos");
      setSosList(data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleTabChange = (t) => {
    setTab(t);
    if (t === "users"     && users.length === 0)     fetchUsers();
    if (t === "incidents" && incidents.length === 0) fetchIncidents();
    if (t === "sos"       && sosList.length === 0)   fetchSOS();
  };

  const handleUpdateStatus = async (id, status) => {
    try { await api.patch(`/incidents/${id}/status`, { status }); fetchIncidents(); }
    catch (e) { console.error(e); }
  };

  const handleAcknowledge = async (id) => {
    try { await api.patch(`/admin/sos/${id}/acknowledge`); fetchSOS(); fetchStats(); }
    catch (e) { console.error(e); }
  };

  const severityColor = (s) => ({ low: "success", medium: "warning", high: "danger", critical: "dark" }[s] || "secondary");

  const STAT_CARDS = stats ? [
    { label: "Total Tourists",    value: stats.totalUsers,        icon: "fa-users",              bg: "#3498db" },
    { label: "Total Incidents",   value: stats.totalIncidents,    icon: "fa-file-alt",           bg: "#f39c12" },
    { label: "Active SOS",        value: stats.activeSOS,         icon: "fa-exclamation-triangle", bg: "#e74c3c" },
    { label: "Pending Incidents", value: stats.pendingIncidents,  icon: "fa-clock",              bg: "#9b59b6" },
    { label: "Resolved",          value: stats.resolvedIncidents, icon: "fa-check-circle",       bg: "#27ae60" },
  ] : [];

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg,#c0392b,#922b21)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <i className="fas fa-cog text-white"></i>
        </div>
        <div>
          <h5 className="fw-bold mb-0">Admin Control Panel</h5>
          <small className="text-muted">Manage users, incidents, and SOS alerts</small>
        </div>
        <button className="btn btn-outline-danger btn-sm ms-auto" onClick={fetchStats}>
          <i className="fas fa-sync me-1"></i>Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {STAT_CARDS.map(s => (
          <div key={s.label} className="col-6 col-md-4 col-lg">
            <div className="stat-card" style={{ background: s.bg }}>
              <div className="stat-value">{s.value ?? "—"}</div>
              <div className="stat-label">{s.label}</div>
              <i className={`fas ${s.icon} stat-icon`}></i>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-header bg-white border-bottom d-flex gap-0 flex-wrap" style={{ borderRadius: "12px 12px 0 0" }}>
          {["stats", "users", "incidents", "sos"].map(t => (
            <button key={t} className={`admin-tab-btn ${tab === t ? "active" : ""}`} onClick={() => handleTabChange(t)}>
              <i className={`fas ${t === "stats" ? "fa-chart-bar" : t === "users" ? "fa-users" : t === "incidents" ? "fa-file-alt" : "fa-exclamation-triangle"} me-1`}></i>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="card-body p-0">
          {loading && <div className="sv-spinner"><div className="spinner-border"></div></div>}

          {/* Stats Tab */}
          {tab === "stats" && !loading && (
            <div className="p-4">
              <p className="text-muted small">Platform overview. Use the tabs above to manage users, incidents, and SOS alerts.</p>
              <div className="row g-3 mt-1">
                {STAT_CARDS.map(s => (
                  <div key={s.label} className="col-md-6">
                    <div className="d-flex align-items-center gap-3 p-3 rounded" style={{ background: "#f8f9fa" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className={`fas ${s.icon} text-white`}></i>
                      </div>
                      <div>
                        <div className="fw-bold fs-5">{s.value ?? "—"}</div>
                        <div className="text-muted small">{s.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {tab === "users" && !loading && (
            <div className="table-responsive">
              <table className="table sv-table mb-0">
                <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
                <tbody>
                  {users.length === 0
                    ? <tr><td colSpan={5} className="text-center text-muted py-4">No users found</td></tr>
                    : users.map((u, i) => (
                      <tr key={u._id}>
                        <td>{i + 1}</td>
                        <td className="fw-500">{u.firstName} {u.lastName}</td>
                        <td>{u.email}</td>
                        <td><span className="badge bg-danger">{u.role}</span></td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {/* Incidents Tab */}
          {tab === "incidents" && !loading && (
            <div className="table-responsive">
              <table className="table sv-table mb-0">
                <thead><tr><th>Reporter</th><th>Type</th><th>Description</th><th>Severity</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {incidents.length === 0
                    ? <tr><td colSpan={6} className="text-center text-muted py-4">No incidents found</td></tr>
                    : incidents.map(inc => (
                      <tr key={inc._id}>
                        <td className="small">{inc.reportedBy?.firstName || "Unknown"}</td>
                        <td className="text-capitalize small">{inc.type?.replace("_", " ")}</td>
                        <td className="small">{inc.description?.substring(0, 40)}...</td>
                        <td><span className={`badge bg-${severityColor(inc.severity)}`}>{inc.severity}</span></td>
                        <td><span className="badge bg-secondary">{inc.status?.replace("_", " ")}</span></td>
                        <td>
                          <div className="d-flex gap-1">
                            <select className="form-select form-select-sm" style={{ minWidth: 120 }} value={inc.status} onChange={e => handleUpdateStatus(inc._id, e.target.value)}>
                              <option value="pending">Pending</option>
                              <option value="under_review">Under Review</option>
                              <option value="resolved">Resolved</option>
                            </select>
                            <button className="btn btn-outline-danger btn-sm" title="Delete" onClick={async () => {
                              if (!window.confirm("Delete this incident?")) return;
                              try { await api.delete(`/incidents/${inc._id}/admin`); fetchIncidents(); }
                              catch (e) { alert("Could not delete"); }
                            }}><i className="fas fa-trash"></i></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {/* SOS Tab */}
          {tab === "sos" && !loading && (
            <div className="table-responsive">
              <table className="table sv-table mb-0">
                <thead><tr><th>Tourist</th><th>Email</th><th>Message</th><th>Status</th><th>Time</th><th>Action</th></tr></thead>
                <tbody>
                  {sosList.length === 0
                    ? <tr><td colSpan={6} className="text-center text-muted py-4">No SOS alerts</td></tr>
                    : sosList.map(s => (
                      <tr key={s._id} className={s.status === "active" ? "table-danger" : ""}>
                        <td className="fw-500 small">{s.triggeredBy?.firstName} {s.triggeredBy?.lastName}</td>
                        <td className="small">{s.triggeredBy?.email || "—"}</td>
                        <td className="small">{s.message}</td>
                        <td>
                          <span className={`badge bg-${s.status === "active" ? "danger" : s.status === "acknowledged" ? "warning text-dark" : "success"}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="small">{new Date(s.createdAt).toLocaleString()}</td>
                        <td>
                          {s.status === "active" && (
                            <button className="btn btn-warning btn-sm" onClick={() => handleAcknowledge(s._id)}>
                              <i className="fas fa-check me-1"></i>Acknowledge
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

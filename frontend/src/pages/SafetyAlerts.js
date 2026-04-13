import React, { useState } from "react";
import api from "../api";

const SAFETY_ZONES = [
  { id: 1, zone: "Old Market District",    level: "high",     message: "Pickpocketing incidents reported. Keep valuables secure.",              icon: "fa-user-secret",      color: "danger" },
  { id: 2, zone: "Riverside Area",         level: "medium",   message: "Flash flood risk during monsoon season. Avoid after heavy rain.",       icon: "fa-water",            color: "warning" },
  { id: 3, zone: "Night Bazaar",           level: "medium",   message: "Crowded area at night. Travel in groups and stay alert.",               icon: "fa-moon",             color: "warning" },
  { id: 4, zone: "Mountain Trail North",   level: "high",     message: "Landslide risk. Trail closed until further notice.",                    icon: "fa-mountain",         color: "danger" },
  { id: 5, zone: "City Center",            level: "low",      message: "Generally safe. Police patrol active. Normal precautions apply.",       icon: "fa-city",             color: "success" },
  { id: 6, zone: "Beach Promenade",        level: "low",      message: "Safe for tourists. Lifeguards on duty 8am-6pm.",                        icon: "fa-umbrella-beach",   color: "success" },
  { id: 7, zone: "Industrial Zone",        level: "critical", message: "No tourist access. Hazardous materials area.",                          icon: "fa-radiation",        color: "dark" },
  { id: 8, zone: "Heritage Temple Complex",level: "low",      message: "Safe zone. Security cameras installed. Dress modestly.",                icon: "fa-place-of-worship", color: "success" },
];

const TIPS = [
  { icon: "fa-id-card",    tip: "Always carry a copy of your passport and travel documents." },
  { icon: "fa-phone",      tip: "Save local emergency numbers: Police 100, Ambulance 108, Fire 101." },
  { icon: "fa-wifi",       tip: "Avoid using public WiFi for banking or sensitive activities." },
  { icon: "fa-map",        tip: "Share your itinerary with someone you trust back home." },
  { icon: "fa-first-aid",  tip: "Carry a basic first aid kit and any personal medications." },
  { icon: "fa-money-bill", tip: "Keep emergency cash separate from your main wallet." },
];

const LEVEL_CONFIG = {
  low:      { color: "success", bg: "#eafaf1", border: "#27ae60" },
  medium:   { color: "warning", bg: "#fef9e7", border: "#f39c12" },
  high:     { color: "danger",  bg: "#fdecea", border: "#c0392b" },
  critical: { color: "dark",    bg: "#f2f3f4", border: "#2c3e50" },
};

export default function SafetyAlerts() {
  const [filter, setFilter]     = useState("all");
  const [aiQuery, setAiQuery]   = useState("");
  const [aiTips, setAiTips]     = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError]   = useState("");

  const filtered = filter === "all" ? SAFETY_ZONES : SAFETY_ZONES.filter(z => z.level === filter);

  const getAIAdvice = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiError("");
    setAiTips([]);
    try {
      const { data } = await api.post("/ai/safety-advice", {
        location: aiQuery,
        context: `Tourist asking about safety in: ${aiQuery}`,
      });
      setAiTips(data.data?.tips || []);
    } catch {
      setAiError("AI service unavailable. Please try again.");
    } finally { setAiLoading(false); }
  };

  const levelCounts = SAFETY_ZONES.reduce((acc, z) => { acc[z.level] = (acc[z.level] || 0) + 1; return acc; }, {});

  return (
    <div className="container-fluid py-4 px-3 px-md-4">

      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg,#c0392b,#922b21)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <i className="fas fa-bell text-white"></i>
        </div>
        <div>
          <h5 className="fw-bold mb-0">Safety Alerts & Zone Warnings</h5>
          <small className="text-muted">Stay informed about potentially unsafe areas in your travel destination</small>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: "Critical Zones", count: levelCounts.critical || 0, color: "#2c3e50", icon: "fa-radiation" },
          { label: "High Risk",      count: levelCounts.high     || 0, color: "#c0392b", icon: "fa-exclamation-triangle" },
          { label: "Medium Risk",    count: levelCounts.medium   || 0, color: "#f39c12", icon: "fa-exclamation-circle" },
          { label: "Safe Zones",     count: levelCounts.low      || 0, color: "#27ae60", icon: "fa-check-circle" },
        ].map(s => (
          <div key={s.label} className="col-6 col-md-3">
            <div className="stat-card" style={{ background: s.color }}>
              <div className="stat-value">{s.count}</div>
              <div className="stat-label">{s.label}</div>
              <i className={`fas ${s.icon} stat-icon`}></i>
            </div>
          </div>
        ))}
      </div>

      {/* AI Safety Advisor */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12, background: "linear-gradient(135deg, #667eea11, #764ba211)", border: "1px solid #667eea33 !important" }}>
        <div className="card-body p-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <i className="fas fa-robot text-primary"></i>
            <span className="fw-bold small">AI Safety Advisor (Powered by Gemini)</span>
          </div>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Ask about a location, e.g. 'Old Delhi market at night'"
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && getAIAdvice()}
            />
            <button className="btn btn-danger" onClick={getAIAdvice} disabled={aiLoading || !aiQuery.trim()}>
              {aiLoading ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-magic me-1"></i>Ask AI</>}
            </button>
          </div>
          {aiError && <div className="alert alert-danger mt-2 py-1 small">{aiError}</div>}
          {aiTips.length > 0 && (
            <div className="ai-tip-card mt-2">
              {aiTips.map((tip, i) => (
                <div key={i} className="ai-tip-item">
                  <i className="fas fa-shield-alt"></i>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="d-flex gap-2 flex-wrap mb-3">
        {["all", "low", "medium", "high", "critical"].map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? "btn-danger" : "btn-outline-secondary"}`}
            style={{ borderRadius: 20, fontSize: "0.78rem" }}
            onClick={() => setFilter(f)}
          >
            {f.toUpperCase()}
            {f !== "all" && <span className="ms-1 badge bg-white text-dark">{levelCounts[f] || 0}</span>}
          </button>
        ))}
      </div>

      {/* Zone Cards */}
      <div className="row g-3 mb-4">
        {filtered.map(zone => {
          const cfg = LEVEL_CONFIG[zone.level];
          return (
            <div key={zone.id} className="col-md-6 col-lg-4">
              <div className="zone-card" style={{ background: cfg.bg, borderLeft: `4px solid ${cfg.border}` }}>
                <div className="zone-header" style={{ borderBottom: `1px solid ${cfg.border}22` }}>
                  <span><i className={`fas ${zone.icon} me-2`} style={{ color: cfg.border }}></i>{zone.zone}</span>
                  <span className={`badge bg-${cfg.color} ${cfg.color === "warning" ? "text-dark" : ""}`}>{zone.level.toUpperCase()}</span>
                </div>
                <div className="zone-body text-muted">{zone.message}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Tips */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="sv-card-header">
          <i className="fas fa-lightbulb me-2"></i>General Safety Tips for Tourists
        </div>
        <div className="card-body p-3">
          <div className="row g-2">
            {TIPS.map((t, i) => (
              <div key={i} className="col-md-6">
                <div className="d-flex align-items-start gap-3 p-2 rounded" style={{ background: "#f8f9fa" }}>
                  <i className={`fas ${t.icon} text-danger mt-1`}></i>
                  <span className="small">{t.tip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

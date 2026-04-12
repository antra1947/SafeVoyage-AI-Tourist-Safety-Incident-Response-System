import React, { useState } from "react";

// Simulated safety zone data - in production this would come from an API
const SAFETY_ZONES = [
  { id: 1, zone: "Old Market District", level: "high", message: "Pickpocketing incidents reported. Keep valuables secure.", icon: "fa-user-secret", color: "danger" },
  { id: 2, zone: "Riverside Area", level: "medium", message: "Flash flood risk during monsoon season. Avoid after heavy rain.", icon: "fa-water", color: "warning" },
  { id: 3, zone: "Night Bazaar", level: "medium", message: "Crowded area at night. Travel in groups and stay alert.", icon: "fa-moon", color: "warning" },
  { id: 4, zone: "Mountain Trail North", level: "high", message: "Landslide risk. Trail closed until further notice.", icon: "fa-mountain", color: "danger" },
  { id: 5, zone: "City Center", level: "low", message: "Generally safe. Police patrol active. Normal precautions apply.", icon: "fa-city", color: "success" },
  { id: 6, zone: "Beach Promenade", level: "low", message: "Safe for tourists. Lifeguards on duty 8am-6pm.", icon: "fa-umbrella-beach", color: "success" },
  { id: 7, zone: "Industrial Zone", level: "critical", message: "No tourist access. Hazardous materials area.", icon: "fa-radiation", color: "dark" },
  { id: 8, zone: "Heritage Temple Complex", level: "low", message: "Safe zone. Security cameras installed. Dress modestly.", icon: "fa-place-of-worship", color: "success" },
];

const TIPS = [
  { icon: "fa-id-card", tip: "Always carry a copy of your passport and travel documents." },
  { icon: "fa-phone", tip: "Save local emergency numbers: Police 100, Ambulance 108, Fire 101." },
  { icon: "fa-wifi", tip: "Avoid using public WiFi for banking or sensitive activities." },
  { icon: "fa-map", tip: "Share your itinerary with someone you trust back home." },
  { icon: "fa-first-aid", tip: "Carry a basic first aid kit and any personal medications." },
  { icon: "fa-money-bill", tip: "Keep emergency cash separate from your main wallet." },
];

export default function SafetyAlerts() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? SAFETY_ZONES : SAFETY_ZONES.filter((z) => z.level === filter);

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col">
          <h4 className="fw-bold"><i className="fas fa-bell text-danger me-2"></i>Safety Alerts & Zone Warnings</h4>
          <p className="text-muted">Stay informed about potentially unsafe areas in your travel destination.</p>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="mb-4 d-flex gap-2 flex-wrap">
        {["all", "low", "medium", "high", "critical"].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? "btn-danger" : "btn-outline-secondary"}`}
            onClick={() => setFilter(f)}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Zone cards */}
      <div className="row g-3 mb-5">
        {filtered.map((zone) => (
          <div key={zone.id} className="col-md-6 col-lg-4">
            <div className={`card h-100 border-${zone.color} shadow-sm`}>
              <div className={`card-header bg-${zone.color} ${zone.color === "warning" ? "text-dark" : "text-white"}`}>
                <i className={`fas ${zone.icon} me-2`}></i>
                {zone.zone}
                <span className="float-end badge bg-white text-dark">{zone.level.toUpperCase()}</span>
              </div>
              <div className="card-body">
                <p className="mb-0 small">{zone.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Safety tips section */}
      <div className="card shadow-sm">
        <div className="card-header sv-card-header">
          <i className="fas fa-lightbulb me-2"></i>General Safety Tips for Tourists
        </div>
        <div className="card-body">
          <div className="row g-3">
            {TIPS.map((t, i) => (
              <div key={i} className="col-md-6">
                <div className="d-flex align-items-start gap-3 p-2 bg-light rounded">
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

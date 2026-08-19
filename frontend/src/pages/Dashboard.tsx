import React from 'react';
import { useSimulationState } from '../store/simulationStore';
import { formatEmissions, formatFuel } from '../utils/formatters';
import { Activity, AlertTriangle, Cpu, Droplet, ShieldAlert } from 'lucide-react';

export default function Dashboard() {
  const simState = useSimulationState();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Platform Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Real-time overview of the reinforcement learning traffic network.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="metrics-grid">
        <div className="glass-panel metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-title">CO₂ Rate</span>
            <Activity size={20} color="var(--accent-cyan)" />
          </div>
          <span className="metric-value">{formatEmissions(simState.emissions.co2)}</span>
          <span className="metric-trend trend-down">
            <span style={{ fontSize: '12px' }}>▼ 12% vs Fixed-time</span>
          </span>
        </div>

        <div className="glass-panel metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-title">Active Vehicles</span>
            <Activity size={20} color="var(--accent-green)" />
          </div>
          <span className="metric-value">{simState.active_vehicles}</span>
          <span className="metric-trend trend-up">
            <span style={{ fontSize: '12px' }}>▲ 8% throughput</span>
          </span>
        </div>

        <div className="glass-panel metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-title">Fuel Spent</span>
            <Droplet size={20} color="var(--accent-orange)" />
          </div>
          <span className="metric-value">{formatFuel(simState.emissions.fuel)}</span>
          <span className="metric-trend trend-down">
            <span style={{ fontSize: '12px' }}>▼ 15% consumption</span>
          </span>
        </div>

        <div className="glass-panel metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-title">Optimization Mode</span>
            <Cpu size={20} color="var(--accent-purple)" />
          </div>
          <span className="metric-value" style={{ fontSize: '24px', paddingTop: '8px' }}>PPO Active</span>
          <span className="metric-trend" style={{ color: 'var(--accent-purple)' }}>
            <span>Policy: EcoTwin-v0</span>
          </span>
        </div>
      </div>

      {/* Two Columns Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Left Column: Visual overview of comparison */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Optimization Comparison</h2>
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Embedded image artifact illustrating reward curve */}
            <img src="/outputs/figures/baseline_comparison.png" alt="Baseline Comparison Graph" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Right Column: Hotspots and Warnings */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert color="var(--accent-red)" />
            Active Hotspots
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {simState.vehicles.filter(v => v.waiting_time > 120).length > 0 ? (
              simState.vehicles.filter(v => v.waiting_time > 120).map(v => (
                <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255, 23, 68, 0.08)', border: '1px solid rgba(255, 23, 68, 0.2)', borderRadius: '10px' }}>
                  <AlertTriangle size={18} color="var(--accent-red)" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>Veh {v.id} Delay Warning</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Lane: {v.lane} ({Math.round(v.waiting_time)}s wait)</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                No critical hotspots or vehicle delays detected.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

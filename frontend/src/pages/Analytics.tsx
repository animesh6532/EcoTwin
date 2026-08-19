import React from 'react';
import { useSimulationState } from '../store/simulationStore';
import { formatEmissions } from '../utils/formatters';
import { Activity, BarChart2, TrendingDown } from 'lucide-react';

export default function Analytics() {
  const simState = useSimulationState();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Emissions &amp; Analytics</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Detailed pollutant dispersion heatmaps and training performance logs.</p>
      </div>

      {/* Analytics KPI header */}
      <div className="metrics-grid">
        <div className="glass-panel metric-card">
          <span className="metric-title">Instant CO₂ rate</span>
          <span className="metric-value">{formatEmissions(simState.emissions.co2)}</span>
        </div>
        <div className="glass-panel metric-card">
          <span className="metric-title">Average NOx rate</span>
          <span className="metric-value">{formatEmissions(simState.emissions.nox)}</span>
        </div>
        <div className="glass-panel metric-card">
          <span className="metric-title">Average PM2.5 rate</span>
          <span className="metric-value">{formatEmissions(simState.emissions.pm25)}</span>
        </div>
      </div>

      {/* Main visual comparison curves */}
      <div className="chart-grid">
        {/* Plot 1: Hotspot Heatmap */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>CO₂ Dispersion Heatmap</h2>
            <Activity size={20} color="var(--accent-cyan)" />
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', height: '320px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/outputs/figures/co2_heatmap.png" alt="Carbon Dispersion Heatmap" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} />
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Calculated concentration model illustrating carbon emissions surrounding intersection hubs.</p>
        </div>

        {/* Plot 2: Reward Curve */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>RL Agent Reward Convergence</h2>
            <TrendingDown size={20} color="var(--accent-green)" />
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', height: '320px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/outputs/figures/reward_curve.png" alt="Training Reward Convergence Curve" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Epsiodic reward values converging over 100,000 steps of training.</p>
        </div>
      </div>

      {/* Historical logs table */}
      <div className="glass-panel">
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 color="var(--accent-purple)" />
          Pollution Indices per lane
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '16px' }}>Lane Identifier</th>
                <th style={{ padding: '16px' }}>CO₂ rate</th>
                <th style={{ padding: '16px' }}>NOx rate</th>
                <th style={{ padding: '16px' }}>PM2.5 rate</th>
                <th style={{ padding: '16px' }}>Air Quality Index</th>
              </tr>
            </thead>
            <tbody>
              {/* Mock items or active lane data */}
              {['N2C_0', 'S2C_0', 'E2C_0', 'W2C_0'].map((laneId) => (
                <tr key={laneId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{laneId}</td>
                  <td style={{ padding: '16px' }}>1,245.2 mg/s</td>
                  <td style={{ padding: '16px' }}>32.4 mg/s</td>
                  <td style={{ padding: '16px' }}>4.8 mg/s</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ background: 'rgba(0, 230, 118, 0.1)', color: 'var(--accent-green)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>Optimal (34.2)</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

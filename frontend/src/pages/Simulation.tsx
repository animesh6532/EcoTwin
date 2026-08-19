import React, { useState } from 'react';
import { useSimulationState } from '../store/simulationStore';
import { useSimulation } from '../hooks/useSimulation';
import CityMap from '../components/CityMap';
import SimulationControls from '../components/SimulationControls';
import { Play, Square, Settings } from 'lucide-react';

export default function Simulation() {
  const simState = useSimulationState();
  const { startSim, stopSim, pauseSim, resumeSim, stepSim } = useSimulation();
  const [selectedScenario, setSelectedScenario] = useState('normal');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Simulation Center</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Launch scenarios and monitor signal phases in real-time.</p>
        </div>
        
        {/* Setup Configuration controls */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <Settings size={18} color="var(--text-secondary)" />
            <select 
              value={selectedScenario} 
              onChange={(e) => setSelectedScenario(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', cursor: 'pointer' }}
            >
              <option value="normal">Normal Traffic</option>
              <option value="rush_hour">Rush Hour Peak</option>
              <option value="congestion">Grid Congestion</option>
              <option value="road_closure">Road Closure</option>
              <option value="high_emission">High Emission Presets</option>
            </select>
          </div>
          
          {simState.status === 'stopped' ? (
            <button className="pulse-button" onClick={() => startSim(selectedScenario, true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={16} />
              Launch SUMO
            </button>
          ) : (
            <button onClick={stopSim} style={{ background: 'var(--accent-red)', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <Square size={16} />
              Terminate
            </button>
          )}
        </div>
      </div>

      {/* Simulator Workspace Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
        {/* Left Column: SVGs Map visualizer */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '500px', background: 'rgba(5, 8, 16, 0.8)' }}>
          {simState.status === 'running' ? (
            <CityMap />
          ) : (
            <div style={{ textAlign: 'center', padding: '48px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                <span>🌱</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Simulator Idle</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '360px', fontSize: '14px' }}>Launch a traffic scenario to initialize the microscopic engine and websocket streams.</p>
            </div>
          )}
        </div>

        {/* Right Column: Execution details and controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel">
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Simulation Controls</h2>
            <SimulationControls 
              onPause={pauseSim}
              onResume={resumeSim}
              onStep={stepSim}
              isPlaying={simState.status === 'running'}
            />
          </div>

          <div className="glass-panel" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Active Nodes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.keys(simState.signals).map(tlsId => {
                const signal = simState.signals[tlsId];
                return (
                  <div key={tlsId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>Junction: {tlsId}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Program: {signal.program}</div>
                    </div>
                    {/* Signal status colors */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {signal.ryg_state.split('').slice(0, 4).map((stateChar, idx) => {
                        let color = '#7f8c8d';
                        if (stateChar.toLowerCase() === 'g') color = 'var(--accent-green)';
                        else if (stateChar.toLowerCase() === 'y') color = 'var(--accent-orange)';
                        else if (stateChar.toLowerCase() === 'r') color = 'var(--accent-red)';
                        
                        return (
                          <div key={idx} style={{ width: '12px', height: '12px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {Object.keys(simState.signals).length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', padding: '16px' }}>
                  No active intersections detected.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

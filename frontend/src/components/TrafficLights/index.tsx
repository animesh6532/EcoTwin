import React from 'react';
import { useSimulationState } from '../../store/simulationStore';

export default function TrafficLights() {
  const simState = useSimulationState();
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Intersection Phases</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Object.entries(simState.signals).map(([tlsId, signal]) => (
          <div key={tlsId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
            <span>Junction {tlsId}</span>
            <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '4px' }}>
              Phase {signal.phase} (Next: {Math.max(0, Math.round(signal.next_switch))}s)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

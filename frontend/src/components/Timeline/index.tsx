import React from 'react';
import { useSimulationState } from '../../store/simulationStore';

export default function Timeline() {
  const simState = useSimulationState();
  const maxSteps = 3600;
  const progressPercent = Math.min((simState.step / maxSteps) * 100, 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
        <span>Progress Timeline</span>
        <span>{simState.step} / {maxSteps} steps</span>
      </div>
      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
        <div 
          style={{ 
            width: `${progressPercent}%`, 
            height: '100%', 
            background: 'linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)',
            transition: 'width 0.1s ease'
          }} 
        />
      </div>
    </div>
  );
}

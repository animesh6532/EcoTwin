import React from 'react';

interface ScenarioPanelProps {
  currentScenario: string;
  onSelect: (scenario: string) => void;
}

export default function ScenarioPanel({ currentScenario, onSelect }: ScenarioPanelProps) {
  const scenarios = [
    { id: 'normal', name: 'Normal Scenario', desc: 'Standard uniform vehicle flow rate.' },
    { id: 'rush_hour', name: 'Rush Hour Peak', desc: 'Saturated North-South incoming vehicle waves.' },
    { id: 'congestion', name: 'Heavy Congestion', desc: 'Extreme queuing patterns on lanes.' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Select preset profile</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {scenarios.map(s => (
          <div 
            key={s.id}
            onClick={() => onSelect(s.id)}
            style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid', 
              borderColor: currentScenario === s.id ? 'var(--accent-cyan)' : 'var(--border-color)',
              background: currentScenario === s.id ? 'rgba(0, 229, 255, 0.04)' : 'rgba(255,255,255,0.01)',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '2px' }}>{s.name}</div>
            <div style={{ color: 'var(--text-secondary)' }}>{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

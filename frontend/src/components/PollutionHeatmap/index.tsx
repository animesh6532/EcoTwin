import React from 'react';
import { useSimulationState } from '../../store/simulationStore';
import { AlertCircle } from 'lucide-react';

export default function PollutionHeatmap() {
  const simState = useSimulationState();
  
  // Calculate relative hotspot counts
  const totalCo2 = simState.emissions.co2;
  const hotspotCount = simState.vehicles.filter(v => v.waiting_time > 60).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Hotspot Index</span>
        <span style={{ color: hotspotCount > 0 ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 600, fontSize: '13px' }}>
          {hotspotCount > 0 ? `${hotspotCount} Warnings` : 'AQI Nominal'}
        </span>
      </div>
      {hotspotCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(255, 23, 68, 0.05)', border: '1px solid rgba(255, 23, 68, 0.1)', borderRadius: '8px', fontSize: '12px' }}>
          <AlertCircle size={14} color="var(--accent-red)" />
          <span>Congested intersections raising emission metrics.</span>
        </div>
      )}
    </div>
  );
}

import { useSimulationState } from '../../store/simulationStore';

export default function VehicleLayer() {
  const simState = useSimulationState();
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Vehicles ({simState.vehicles.length})</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
        {simState.vehicles.map(v => (
          <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '12px' }}>
            <span>ID: {v.id} ({v.type.split('_')[1]})</span>
            <span style={{ color: 'var(--accent-cyan)' }}>{Math.round(v.speed)} km/h</span>
          </div>
        ))}
        {simState.vehicles.length === 0 && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>No active vehicles.</div>
        )}
      </div>
    </div>
  );
}

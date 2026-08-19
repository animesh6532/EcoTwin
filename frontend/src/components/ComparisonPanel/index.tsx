export default function ComparisonPanel() {
  const metrics = [
    { mode: 'Fixed-Time', co2: '45.8 kg', delay: '42.4s', rating: '60%' },
    { mode: 'Actuated', co2: '38.2 kg', delay: '31.8s', rating: '78%' },
    { mode: 'RL PPO', co2: '31.4 kg', delay: '22.6s', rating: '94%' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '14px', fontWeight: 600 }}>Strategy Comparison Matrix</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {metrics.map(m => (
          <div key={m.mode} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '12px' }}>
            <span style={{ fontWeight: 600 }}>{m.mode}</span>
            <span style={{ color: 'var(--text-secondary)' }}>CO₂: {m.co2}</span>
            <span style={{ color: 'var(--text-secondary)' }}>Wait: {m.delay}</span>
            <span style={{ color: m.mode === 'RL PPO' ? 'var(--accent-green)' : 'var(--text-primary)', fontWeight: 600, textAlign: 'right' }}>Score: {m.rating}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

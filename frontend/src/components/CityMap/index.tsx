import { useSimulationState } from '../../store/simulationStore';
import { projectCoordinates } from '../../utils/mapLayers';

export default function CityMap() {
  const simState = useSimulationState();
  const mapWidth = 500;
  const mapHeight = 500;

  // Helper to project SUMO grid into local SVG space
  const project = (x: number, y: number) => {
    return projectCoordinates(x, y, mapWidth, mapHeight);
  };

  const centerPos = project(0, 0);

  return (
    <svg 
      width={mapWidth} 
      height={mapHeight} 
      style={{ background: '#070a13', borderRadius: '12px', border: '1px solid var(--border-color)' }}
    >
      {/* Grid pattern background */}
      <defs>
        <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* Lanes representation */}
      {/* North-South Road */}
      <rect x={centerPos.x - 20} y={0} width={40} height={mapHeight} fill="#111827" opacity="0.8" />
      <line x1={centerPos.x} y1={0} x2={centerPos.x} y2={mapHeight} stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="6 6" />
      
      {/* East-West Road */}
      <rect x={0} y={centerPos.y - 20} width={mapWidth} height={40} fill="#111827" opacity="0.8" />
      <line x1={0} y1={centerPos.y} x2={mapWidth} y2={centerPos.y} stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="6 6" />

      {/* Central Junction intersection */}
      <rect 
        x={centerPos.x - 20} 
        y={centerPos.y - 20} 
        width={40} 
        height={40} 
        fill="#1f2937" 
        stroke="rgba(255,255,255,0.2)" 
        strokeWidth="1.5" 
      />

      {/* Traffic light phase markers */}
      {Object.keys(simState.signals).map(tlsId => {
        const signal = simState.signals[tlsId];
        // Parse state characters: GGggrrrrGGgg
        // Let's draw 4 lights around center
        const stateStr = signal.ryg_state.toLowerCase();
        
        const getLightColor = (char?: string) => {
          if (char === 'g') return 'var(--accent-green)';
          if (char === 'y') return 'var(--accent-orange)';
          return 'var(--accent-red)';
        };

        return (
          <g key={tlsId}>
            {/* North signal */}
            <circle cx={centerPos.x} cy={centerPos.y - 30} r={5} fill={getLightColor(stateStr[0])} filter={`drop-shadow(0px 0px 4px ${getLightColor(stateStr[0])})`} />
            {/* East signal */}
            <circle cx={centerPos.x + 30} cy={centerPos.y} r={5} fill={getLightColor(stateStr[2])} filter={`drop-shadow(0px 0px 4px ${getLightColor(stateStr[2])})`} />
            {/* South signal */}
            <circle cx={centerPos.x} cy={centerPos.y + 30} r={5} fill={getLightColor(stateStr[0])} filter={`drop-shadow(0px 0px 4px ${getLightColor(stateStr[0])})`} />
            {/* West signal */}
            <circle cx={centerPos.x - 30} cy={centerPos.y} r={5} fill={getLightColor(stateStr[2])} filter={`drop-shadow(0px 0px 4px ${getLightColor(stateStr[2])})`} />
          </g>
        );
      })}

      {/* Vehicles Layer */}
      {simState.vehicles.map(v => {
        const pos = project(v.x, v.y);
        
        // Colors by type
        let color = 'var(--accent-cyan)'; // Gasoline
        if (v.type.includes('electric')) color = 'var(--accent-green)';
        else if (v.type.includes('diesel') && v.type.includes('passenger')) color = 'var(--accent-orange)';
        else if (v.type.includes('truck')) color = 'var(--accent-purple)';

        return (
          <g key={v.id}>
            <circle 
              cx={pos.x} 
              cy={pos.y} 
              r={6} 
              fill={color} 
              filter={`drop-shadow(0px 0px 6px ${color})`} 
            />
            {/* Small identifier text */}
            <text x={pos.x + 8} y={pos.y - 8} fill="rgba(255,255,255,0.6)" fontSize="9px">{v.id}</text>
          </g>
        );
      })}
    </svg>
  );
}

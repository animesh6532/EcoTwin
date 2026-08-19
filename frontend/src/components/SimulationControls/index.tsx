import React, { useState } from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';

interface ControlsProps {
  onPause: () => void;
  onResume: () => void;
  onStep: () => void;
  isPlaying: boolean;
}

export default function SimulationControls({ onPause, onResume, onStep, isPlaying }: ControlsProps) {
  const [paused, setPaused] = useState(true);

  const handlePlayPause = () => {
    if (paused) {
      onResume();
    } else {
      onPause();
    }
    setPaused(!paused);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="controls-group" style={{ justifyContent: 'center' }}>
        <button 
          onClick={handlePlayPause}
          disabled={!isPlaying}
          style={{ 
            background: 'none', 
            border: '1px solid var(--border-color)', 
            borderRadius: '50%', 
            width: '48px', 
            height: '48px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: isPlaying ? 'pointer' : 'not-allowed', 
            color: isPlaying ? 'var(--text-primary)' : 'var(--text-muted)' 
          }}
        >
          {paused ? <Play size={20} /> : <Pause size={20} />}
        </button>

        <button 
          onClick={onStep}
          disabled={!isPlaying}
          style={{ 
            background: 'none', 
            border: '1px solid var(--border-color)', 
            borderRadius: '50%', 
            width: '48px', 
            height: '48px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: isPlaying ? 'pointer' : 'not-allowed', 
            color: isPlaying ? 'var(--text-primary)' : 'var(--text-muted)' 
          }}
        >
          <SkipForward size={20} />
        </button>
      </div>
      <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
        {!isPlaying ? 'Launch SUMO to enable playback.' : paused ? 'Simulation Paused' : 'Running simulation...'}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { configureOptimization, fetchOptimizationStatus } from '../services/api';
import { Cpu, ShieldCheck, Shuffle } from 'lucide-react';

export default function Scenarios() {
  const [activeCtrl, setActiveCtrl] = useState('rl');
  const [learningRate, setLearningRate] = useState(0.0003);
  const [meanReward, setMeanReward] = useState(-245.2);

  const loadStatus = async () => {
    try {
      const res = await fetchOptimizationStatus();
      setActiveCtrl(res.active_controller);
      setLearningRate(res.learning_rate);
      setMeanReward(res.mean_reward);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectCtrl = async (ctrlType: string) => {
    try {
      await configureOptimization(ctrlType);
      setActiveCtrl(ctrlType);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Optimizations &amp; Scenarios</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Toggle traffic light controller strategies and run policy comparisons.</p>
      </div>

      {/* Controller Selector Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {/* Fixed Time Controller */}
        <div 
          onClick={() => handleSelectCtrl('fixed')}
          className="glass-panel" 
          style={{ 
            cursor: 'pointer', 
            border: activeCtrl === 'fixed' ? '1px solid var(--accent-orange)' : 'var(--glass-border)',
            background: activeCtrl === 'fixed' ? 'rgba(255, 145, 0, 0.05)' : 'var(--glass-bg)',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px' 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: 600 }}>Fixed-Time Controller</span>
            <Shuffle size={20} color="var(--accent-orange)" />
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Uses pre-programmed cyclic duration phases. Green runs for 30s, yellow for 4s, sequentially.</p>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-orange)' }}>
            {activeCtrl === 'fixed' ? '● Active Controller' : 'Click to select'}
          </span>
        </div>

        {/* Actuated Controller */}
        <div 
          onClick={() => handleSelectCtrl('actuated')}
          className="glass-panel" 
          style={{ 
            cursor: 'pointer', 
            border: activeCtrl === 'actuated' ? '1px solid var(--accent-green)' : 'var(--glass-border)',
            background: activeCtrl === 'actuated' ? 'rgba(0, 230, 118, 0.05)' : 'var(--glass-bg)',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px' 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: 600 }}>Actuated Sensor Control</span>
            <ShieldCheck size={20} color="var(--accent-green)" />
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Dynamically extends green light phase if vehicles are detected. Switches only when conflicting queues build.</p>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-green)' }}>
            {activeCtrl === 'actuated' ? '● Active Controller' : 'Click to select'}
          </span>
        </div>

        {/* RL PPO Controller */}
        <div 
          onClick={() => handleSelectCtrl('rl')}
          className="glass-panel" 
          style={{ 
            cursor: 'pointer', 
            border: activeCtrl === 'rl' ? '1px solid var(--accent-cyan)' : 'var(--glass-border)',
            background: activeCtrl === 'rl' ? 'rgba(0, 229, 255, 0.05)' : 'var(--glass-bg)',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px' 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: 600 }}>PPO Policy Optimization</span>
            <Cpu size={20} color="var(--accent-cyan)" />
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Reinforcement learning policy using multi-lane waiting times and carbon emissions as reward weights.</p>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
            {activeCtrl === 'rl' ? '● Active Controller' : 'Click to select'}
          </span>
        </div>
      </div>

      {/* Comparison results */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div className="glass-panel">
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Active Optimization Metrics</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Selected Strategy:</span>
              <span style={{ fontWeight: 600 }}>{activeCtrl.toUpperCase()} Mode</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Learning Rate:</span>
              <span>{learningRate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Mean Reward (Rolling):</span>
              <span style={{ color: meanReward > -300 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>{meanReward}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
          <img src="/outputs/figures/traffic_flow.png" alt="Traffic Flow Chart" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </div>
      </div>
    </div>
  );
}

import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendType?: 'up' | 'down';
}

export default function MetricCards({ title, value, icon, trend, trendType }: MetricCardProps) {
  return (
    <div className="glass-panel metric-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="metric-title">{title}</span>
        {icon}
      </div>
      <span className="metric-value">{value}</span>
      {trend && (
        <span className={`metric-trend ${trendType === 'down' ? 'trend-down' : 'trend-up'}`}>
          <span>{trend}</span>
        </span>
      )}
    </div>
  );
}

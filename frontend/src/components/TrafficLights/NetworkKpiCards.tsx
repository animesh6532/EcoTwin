import React from "react";
import { Car, Gauge, Layers, AlertCircle, Clock, Flame } from "lucide-react";
import { GlassPanel } from "../glass/GlassPanel";

interface NetworkKpiCardsProps {
  isRunning: boolean;
  activeVehicles: number;
  averageSpeed: number;
  totalQueue: number;
  averageWaitingTime: number;
  co2Rate: number;
}

export const NetworkKpiCards: React.FC<NetworkKpiCardsProps> = ({
  isRunning,
  activeVehicles,
  averageSpeed,
  totalQueue,
  averageWaitingTime,
  co2Rate,
}) => {
  const calculateCongestionLevel = () => {
    if (!isRunning) return { label: "DATA UNAVAILABLE", color: "text-text-muted bg-white/5 border-white/10" };
    if (totalQueue > 15 || averageWaitingTime > 25) return { label: "CRITICAL", color: "text-red-400 bg-red-500/10 border-red-500/20" };
    if (totalQueue > 8 || averageWaitingTime > 12) return { label: "HIGH", color: "text-brand-orange bg-brand-orange/10 border-brand-orange/20" };
    if (totalQueue > 3) return { label: "MODERATE", color: "text-amber-300 bg-amber-400/10 border-amber-400/20" };
    return { label: "LOW", color: "text-eco-success bg-eco-success/10 border-eco-success/20" };
  };

  const congestion = calculateCongestionLevel();

  const kpis = [
    {
      label: "ACTIVE VEHICLES",
      value: isRunning ? activeVehicles.toLocaleString() : "DATA UNAVAILABLE",
      unit: isRunning ? "vehicles" : "",
      icon: Car,
      color: "text-brand-orange",
    },
    {
      label: "AVERAGE SPEED",
      value: isRunning ? `${averageSpeed.toFixed(1)}` : "DATA UNAVAILABLE",
      unit: isRunning ? "km/h" : "",
      icon: Gauge,
      color: "text-emerald-400",
    },
    {
      label: "TOTAL QUEUE",
      value: isRunning ? `${totalQueue}` : "DATA UNAVAILABLE",
      unit: isRunning ? "vehicles" : "",
      icon: Layers,
      color: "text-amber-400",
    },
    {
      label: "CONGESTION INDEX",
      value: congestion.label,
      unit: "",
      icon: AlertCircle,
      badge: true,
      badgeStyle: congestion.color,
    },
    {
      label: "WAITING TIME",
      value: isRunning ? `${averageWaitingTime.toFixed(1)}` : "DATA UNAVAILABLE",
      unit: isRunning ? "sec/veh" : "",
      icon: Clock,
      color: "text-cyan-400",
    },
    {
      label: "CO2 EMISSION RATE",
      value: isRunning ? `${co2Rate.toFixed(1)}` : "DATA UNAVAILABLE",
      unit: isRunning ? "g/s" : "",
      icon: Flame,
      color: "text-rose-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <GlassPanel key={idx} className="p-4 flex flex-col justify-between space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-text-muted">
                {kpi.label}
              </span>
              <Icon className="h-4 w-4 text-text-muted/60" />
            </div>

            <div>
              {kpi.badge ? (
                <span className={`inline-block px-2.5 py-1 rounded text-xs font-mono font-bold border ${kpi.badgeStyle}`}>
                  {kpi.value}
                </span>
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-xl font-bold font-mono tracking-tight ${kpi.value === "DATA UNAVAILABLE" ? "text-text-muted text-xs" : "text-text-cream"}`}>
                    {kpi.value}
                  </span>
                  {kpi.unit && (
                    <span className="text-[10px] text-text-pale font-mono">
                      {kpi.unit}
                    </span>
                  )}
                </div>
              )}
            </div>
          </GlassPanel>
        );
      })}
    </div>
  );
};

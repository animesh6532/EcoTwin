import React from "react";
import { LucideIcon } from "lucide-react";

interface GlassMetricProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: string | number;
    type: "up" | "down" | "neutral";
  };
  className?: string;
}

export const GlassMetric: React.FC<GlassMetricProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  className = ""
}) => {
  return (
    <div 
      className={`p-4 border rounded-xl flex flex-col justify-between h-28 font-mono text-xs ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.055)",
        borderColor: "rgba(255, 184, 77, 0.16)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.07)"
      }}
    >
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold text-[#A9947D] uppercase tracking-wider">{label}</span>
        {Icon && <Icon className="h-4.5 w-4.5 text-[#FF8A00]" />}
      </div>

      <div className="flex justify-between items-end mt-2">
        <span className="text-xl font-bold font-mono tracking-tight text-[#FFF7ED]">{value}</span>
        
        {trend && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
            trend.type === "up" 
              ? "text-[#EF4444] bg-[#EF4444]/10" 
              : trend.type === "down" 
                ? "text-[#22C55E] bg-[#22C55E]/10" 
                : "text-[#D6C3AE] bg-white/5"
          }`}>
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};

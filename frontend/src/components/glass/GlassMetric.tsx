import React from "react";
import { LucideIcon } from "lucide-react";

interface GlassMetricProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  color?: string;
  className?: string;
}

export const GlassMetric: React.FC<GlassMetricProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  color = "text-[#FF8A00]",
  className = ""
}) => {
  return (
    <div className={`p-5 rounded-2xl border border-[rgba(255,183,106,0.12)] bg-[rgba(18,12,8,0.4)] flex justify-between items-center ${className}`}>
      <div className="space-y-1">
        <span className="text-[10px] uppercase tracking-wider text-[#8D7868] font-mono block">{title}</span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black font-mono text-[#FFF3E5]">{value}</span>
          {unit && <span className="text-[10px] text-[#8D7868] font-mono uppercase font-bold">{unit}</span>}
        </div>
      </div>
      {Icon && (
        <div className={`p-2.5 rounded-xl bg-white/5 border border-white/5 ${color}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      )}
    </div>
  );
};

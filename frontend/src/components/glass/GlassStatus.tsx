import React from "react";

interface GlassStatusProps {
  label: string;
  status: "active" | "inactive" | "warning" | "online" | "offline" | string;
  className?: string;
}

export const GlassStatus: React.FC<GlassStatusProps> = ({
  label,
  status,
  className = ""
}) => {
  const getColors = () => {
    const s = status.toLowerCase();
    if (s === "active" || s === "online" || s === "healthy" || s === "ok" || s === "connected") {
      return {
        dot: "bg-[#22C55E] shadow-[0_0_8px_#22C55E]",
        badge: "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20"
      };
    }
    if (s === "warning" || s === "degraded" || s === "connecting" || s === "paused") {
      return {
        dot: "bg-[#FFB84D] shadow-[0_0_8px_#FFB84D] animate-pulse",
        badge: "text-[#FFB84D] bg-[#FFB84D]/10 border-[#FFB84D]/20"
      };
    }
    return { // inactive / offline / error
      dot: "bg-[#EF4444] shadow-[0_0_8px_#EF4444]",
      badge: "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20"
    };
  };

  const colors = getColors();

  return (
    <div 
      className={`px-3.5 py-1 border rounded-full flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider ${colors.badge} ${className}`}
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)"
      }}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      <span>{label}: {status}</span>
    </div>
  );
};

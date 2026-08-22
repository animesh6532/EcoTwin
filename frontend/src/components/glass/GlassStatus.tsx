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
    // Healthy/Active/Online
    if (s === "active" || s === "online" || s === "healthy" || s === "ok" || s === "connected" || s === "running") {
      return {
        color: "#22C55E",
        bg: "rgba(34, 197, 94, 0.10)",
        border: "rgba(34, 197, 94, 0.30)"
      };
    }
    // Warning
    if (s === "warning" || s === "connecting" || s === "degraded") {
      return {
        color: "#FFB347",
        bg: "rgba(255, 179, 71, 0.10)",
        border: "rgba(255, 179, 71, 0.30)"
      };
    }
    // Offline
    if (s === "offline" || s === "none") {
      return {
        color: "#8A7A6B",
        bg: "rgba(138, 122, 107, 0.10)",
        border: "rgba(138, 122, 107, 0.30)"
      };
    }
    // Error / Offline / Inactive
    return {
      color: "#EF4444",
      bg: "rgba(239, 68, 68, 0.10)",
      border: "rgba(239, 68, 68, 0.35)"
    };
  };

  const colors = getColors();

  return (
    <div 
      className={`px-3.5 py-1 border rounded-full flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider ${className}`}
      style={{
        color: colors.color,
        background: colors.bg,
        borderColor: colors.border,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)"
      }}
    >
      <span 
        className="h-1.5 w-1.5 rounded-full" 
        style={{
          backgroundColor: colors.color,
          boxShadow: `0 0 10px ${colors.color}`
        }}
      />
      <span>{label}: {status}</span>
    </div>
  );
};

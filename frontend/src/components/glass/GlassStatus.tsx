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
        dot: "bg-[#22C55E] shadow-[0_0_8px_#22C55E]",
        badge: "text-[#86EFAC] bg-[rgba(34,197,94,0.10)] border-[rgba(34,197,94,0.30)]"
      };
    }
    // Warning/Inactive/Offline/Error
    return {
      dot: "bg-[#EF4444] shadow-[0_0_8px_#EF4444]",
      badge: "text-[#FFB4B4] bg-[rgba(239,68,68,0.10)] border-[rgba(239,68,68,0.35)]"
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

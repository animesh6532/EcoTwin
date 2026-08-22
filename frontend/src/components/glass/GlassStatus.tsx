import React from "react";

interface GlassStatusProps {
  status: "healthy" | "degraded" | "offline" | "connecting" | "paused" | string;
  label: string;
  pulse?: boolean;
}

export const GlassStatus: React.FC<GlassStatusProps> = ({ status, label }) => {
  const getColors = () => {
    const s = status.toLowerCase();
    if (s === "healthy" || s === "ok" || s === "connected" || s === "running" || s === "true") {
      return { dot: "bg-[#39D98A] shadow-[0_0_8px_#39D98A]", text: "text-[#39D98A]" };
    }
    if (s === "degraded" || s === "connecting" || s === "paused" || s === "warning") {
      return { dot: "bg-[#FFB84D] shadow-[0_0_8px_#FFB84D] animate-pulse", text: "text-[#FFB84D]" };
    }
    return { dot: "bg-[#FF4D4D] shadow-[0_0_8px_#FF4D4D]", text: "text-[#FF4D4D]" }; // offline / error
  };
  
  const colors = getColors();

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 bg-white/5 font-mono text-[10px] tracking-wider select-none shrink-0">
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      <span className="text-[#8D7868]">{label}:</span>
      <span className={`font-bold uppercase ${colors.text}`}>{status}</span>
    </div>
  );
};

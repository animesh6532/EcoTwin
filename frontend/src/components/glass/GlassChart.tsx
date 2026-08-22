import React from "react";

interface GlassChartProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const GlassChart: React.FC<GlassChartProps> = ({
  title,
  subtitle,
  children,
  className = ""
}) => {
  return (
    <div 
      className={`p-6 border rounded-[18px] flex flex-col justify-between h-[300px] w-full font-mono text-xs ${className}`}
      style={{
        background: "rgba(18, 14, 11, 0.78)",
        borderColor: "rgba(255, 184, 77, 0.18)",
        backdropFilter: "blur(20px) saturate(120%)",
        WebkitBackdropFilter: "blur(20px) saturate(120%)",
        boxShadow: "0 18px 55px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
      }}
    >
      <div className="mb-4">
        <h3 className="text-xs font-bold text-[#FFF8F0] uppercase tracking-widest">{title}</h3>
        {subtitle && <p className="text-[10px] text-[#A89582] mt-1 normal-case font-sans font-normal">{subtitle}</p>}
      </div>

      <div className="flex-1 w-full relative">
        {children}
      </div>
    </div>
  );
};

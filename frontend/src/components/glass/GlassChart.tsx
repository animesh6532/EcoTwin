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
        background: "rgba(8, 7, 6, 0.58)",
        borderColor: "rgba(255, 145, 40, 0.16)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.06)"
      }}
    >
      <div className="mb-4">
        <h3 className="text-xs font-bold text-[#FFFFFF] uppercase tracking-widest">{title}</h3>
        {subtitle && <p className="text-[10px] text-[#9D8C7B] mt-1 normal-case font-sans font-normal">{subtitle}</p>}
      </div>

      <div className="flex-1 w-full relative">
        {children}
      </div>
    </div>
  );
};

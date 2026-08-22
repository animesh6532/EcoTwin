import React from "react";

interface GlassChartProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
}

export const GlassChart: React.FC<GlassChartProps> = ({
  title,
  subtitle,
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`p-6 rounded-[22px] border border-[rgba(255,183,106,0.15)] bg-[rgba(18,12,8,0.48)] backdrop-blur-md shadow-lg ${className}`} {...props}>
      <div className="mb-4">
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#FFF3E5]">{title}</h3>
        {subtitle && <p className="text-[11px] text-[#B89B82] mt-0.5">{subtitle}</p>}
      </div>
      <div className="h-64">
        {children}
      </div>
    </div>
  );
};

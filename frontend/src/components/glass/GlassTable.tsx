import React from "react";

interface GlassTableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export const GlassTable: React.FC<GlassTableProps> = ({
  headers,
  children,
  className = ""
}) => {
  return (
    <div 
      className={`overflow-x-auto rounded-xl border font-mono text-xs ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.055)",
        borderColor: "rgba(255, 184, 77, 0.16)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)"
      }}
    >
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[rgba(255,184,77,0.16)] bg-white/5">
            {headers.map((h, idx) => (
              <th 
                key={idx} 
                className="p-4 text-[10px] font-bold text-[#A9947D] uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(255,184,77,0.08)]">
          {children}
        </tbody>
      </table>
    </div>
  );
};

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
        background: "rgba(25, 20, 16, 0.72)",
        borderColor: "rgba(255, 184, 77, 0.20)",
        backdropFilter: "blur(20px) saturate(120%)",
        WebkitBackdropFilter: "blur(20px) saturate(120%)"
      }}
    >
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[rgba(255,184,77,0.20)] bg-white/5">
            {headers.map((h, idx) => (
              <th 
                key={idx} 
                className="p-4 text-[10px] font-bold text-[#CBB9A6] uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(255,184,77,0.12)]">
          {children}
        </tbody>
      </table>
    </div>
  );
};

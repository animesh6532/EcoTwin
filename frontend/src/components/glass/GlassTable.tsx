import React from "react";

interface GlassTableProps extends React.HTMLAttributes<HTMLDivElement> {
  headers: string[];
}

export const GlassTable: React.FC<GlassTableProps> = ({
  headers,
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`overflow-x-auto rounded-[20px] border border-[rgba(255,183,106,0.12)] bg-[rgba(18,12,8,0.3)] ${className}`} {...props}>
      <table className="w-full text-xs text-left border-collapse font-mono bg-transparent">
        <thead>
          <tr className="border-b border-[rgba(255,183,106,0.12)] bg-[rgba(30,20,15,0.48)]">
            {headers.map((h, i) => (
              <th key={i} className="p-3 bg-transparent text-[#FFE7CC] font-bold uppercase tracking-wider border-none">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(255,183,106,0.06)]">
          {children}
        </tbody>
      </table>
    </div>
  );
};

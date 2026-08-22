import React from "react";

export const GlassPanel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  style,
  ...props
}) => {
  return (
    <div
      className={`p-8 border transition-all duration-300 rounded-[24px] ${className}`}
      style={{
        background: "rgba(18, 12, 8, 0.65)",
        borderColor: "rgba(255, 183, 106, 0.18)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: "0 30px 100px rgba(0,0,0,0.55)",
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

import React from "react";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: "orange" | "green" | "red" | "cyan" | "amber" | "none";
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = "",
  glowColor = "none",
  style,
  ...props
}) => {
  const baseStyle = {
    background: "rgba(255, 255, 255, 0.055)",
    border: "1px solid rgba(255, 184, 77, 0.16)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    borderRadius: "18px",
  };

  const getGlowShadow = () => {
    if (glowColor === "orange") {
      return "0 12px 40px rgba(0, 0, 0, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 0 20px rgba(255, 138, 0, 0.03)";
    }
    if (glowColor === "green") {
      return "0 12px 40px rgba(0, 0, 0, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 0 20px rgba(34, 197, 94, 0.03)";
    }
    return "0 12px 40px rgba(0, 0, 0, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.07)";
  };

  const finalStyle = {
    ...baseStyle,
    boxShadow: getGlowShadow(),
    ...style,
  };

  return (
    <div
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
      style={finalStyle}
      {...props}
    >
      {children}
    </div>
  );
};

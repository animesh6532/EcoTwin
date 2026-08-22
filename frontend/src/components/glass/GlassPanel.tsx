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
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.025))",
    border: "1px solid rgba(255, 145, 40, 0.22)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    borderRadius: "18px",
  };

  const getGlowShadow = () => {
    if (glowColor === "orange") {
      return "0 20px 60px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 25px rgba(255, 122, 0, 0.055)";
    }
    if (glowColor === "green") {
      return "0 20px 60px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 25px rgba(34, 197, 94, 0.035)";
    }
    return "0 20px 60px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.06)";
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
      {/* Inner reflection shine */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-[inherit]"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.035), transparent 45%)"
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

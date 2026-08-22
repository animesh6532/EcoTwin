import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "small" | "large" | "feature" | "chart" | "control" | "status";
  glowColor?: "orange" | "green" | "red" | "cyan" | "amber" | "purple" | "none";
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  variant = "small",
  glowColor = "none",
  interactive = false,
  style,
  ...props
}) => {
  const baseStyle = {
    background: "rgba(25, 20, 16, 0.72)",
    border: "1px solid rgba(255, 184, 77, 0.20)",
    backdropFilter: "blur(20px) saturate(120%)",
    WebkitBackdropFilter: "blur(20px) saturate(120%)",
  };

  const getGlowShadow = () => {
    switch (glowColor) {
      case "orange":
        return "0 18px 55px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 25px rgba(255, 138, 0, 0.045)";
      case "green":
        return "0 18px 55px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 25px rgba(34, 197, 94, 0.045)";
      case "red":
        return "0 18px 55px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 25px rgba(239, 68, 68, 0.045)";
      case "cyan":
        return "0 18px 55px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 25px rgba(34, 211, 238, 0.045)";
      case "amber":
        return "0 18px 55px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 25px rgba(255, 184, 77, 0.045)";
      case "purple":
        return "0 18px 55px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 25px rgba(168, 85, 247, 0.045)";
      default:
        return "0 18px 55px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.08)";
    }
  };

  const finalStyle = {
    ...baseStyle,
    boxShadow: getGlowShadow(),
    ...style,
  };

  let variantClasses = "rounded-[18px]";
  if (variant === "large") variantClasses = "rounded-[22px] p-8";
  else if (variant === "feature") variantClasses = "rounded-[18px] p-6 border-l-4 border-l-[#FF8A00]";
  else if (variant === "chart") variantClasses = "rounded-[18px] p-6";
  else if (variant === "control") variantClasses = "rounded-[18px] p-6";
  else if (variant === "status") variantClasses = "rounded-xl p-4";
  else variantClasses = "rounded-[18px] p-6"; // small / default

  const hoverClasses = interactive 
    ? "transition-all duration-350 hover:-translate-y-0.5 hover:border-[rgba(255,138,0,0.45)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.35),_0_0_35px_rgba(255,138,0,0.10)]" 
    : "transition-all duration-350";

  return (
    <div
      className={`relative overflow-hidden ${variantClasses} ${hoverClasses} ${className}`}
      style={finalStyle}
      {...props}
    >
      {/* Premium inner reflection gradient surface (glass shine) */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-[inherit]"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.035), transparent 45%)"
        }}
      />
      
      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

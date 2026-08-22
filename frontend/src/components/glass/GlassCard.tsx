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
    background: "rgba(255, 255, 255, 0.055)",
    border: "1px solid rgba(255, 184, 77, 0.16)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
  };

  // Maps glowColor to low opacity box shadows (Never make cards neon)
  const getGlowShadow = () => {
    switch (glowColor) {
      case "orange":
        return "0 12px 40px rgba(0, 0, 0, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 0 20px rgba(255, 138, 0, 0.035)";
      case "green":
        return "0 12px 40px rgba(0, 0, 0, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 0 20px rgba(34, 197, 94, 0.035)";
      case "red":
        return "0 12px 40px rgba(0, 0, 0, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 0 20px rgba(239, 68, 68, 0.035)";
      case "cyan":
        return "0 12px 40px rgba(0, 0, 0, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 0 20px rgba(34, 211, 238, 0.035)";
      case "amber":
        return "0 12px 40px rgba(0, 0, 0, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 0 20px rgba(255, 184, 77, 0.035)";
      case "purple":
        return "0 12px 40px rgba(0, 0, 0, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 0 20px rgba(168, 85, 247, 0.035)";
      default:
        return "0 12px 40px rgba(0, 0, 0, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.07)";
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
    ? "transition-all duration-300 hover:-translate-y-[3px] hover:border-[rgba(255,138,0,0.40)] hover:shadow-[0_15px_45px_rgba(255,138,0,0.10)]" 
    : "transition-all duration-300";

  return (
    <div
      className={`${variantClasses} ${hoverClasses} ${className}`}
      style={finalStyle}
      {...props}
    >
      {children}
    </div>
  );
};

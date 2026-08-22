import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "small" | "large" | "feature" | "chart" | "control" | "status";
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  variant = "small",
  glow = false,
  style,
  ...props
}) => {
  const baseStyle = {
    background: "rgba(18, 12, 8, 0.48)",
    border: "1px solid rgba(255, 183, 106, 0.15)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    boxShadow: "0 20px 80px rgba(0,0,0,0.45)",
  };
  
  let variantClasses = "rounded-[18px]";
  if (variant === "large") variantClasses = "rounded-[24px] p-8";
  else if (variant === "feature") variantClasses = "rounded-[20px] p-6 border-l-4 border-l-[#FF8A00]";
  else if (variant === "chart") variantClasses = "rounded-[20px] p-6";
  else if (variant === "control") variantClasses = "rounded-[20px] p-6";
  else if (variant === "status") variantClasses = "rounded-xl p-4";
  else variantClasses = "rounded-[18px] p-6"; // small / default

  const glowStyle = glow ? {
    boxShadow: "0 0 25px rgba(255, 138, 0, 0.15), 0 20px 80px rgba(0,0,0,0.45)",
    borderColor: "rgba(255, 163, 71, 0.35)",
  } : {};

  return (
    <div
      className={`transition-all duration-300 ${variantClasses} ${className}`}
      style={{ ...baseStyle, ...glowStyle, ...style }}
      {...props}
    >
      {children}
    </div>
  );
};

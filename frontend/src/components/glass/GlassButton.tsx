import React from "react";

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  className = "",
  variant = "secondary",
  size = "md",
  style,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "hover:-translate-y-0.5 active:translate-y-0";
      case "danger":
        return "bg-[#EF4444]/20 text-[#FFF7ED] border border-[#EF4444]/35 hover:bg-[#EF4444]/30 hover:border-[#EF4444]/65 active:translate-y-0";
      case "ghost":
        return "bg-transparent text-[#CDBBA8] border border-transparent hover:bg-white/5 active:translate-y-0";
      default: // secondary
        return "bg-white/5 text-[#FFF7ED] border border-[rgba(255,179,71,0.25)] hover:bg-[#FF8A00]/10 hover:border-[#FF8A00]/40 active:translate-y-0";
    }
  };

  const getInlineStyles = () => {
    if (variant === "primary") {
      return {
        background: "linear-gradient(135deg, #FF7A00, #FFB347)",
        color: "#160A02",
        fontWeight: 700,
        boxShadow: "0 8px 25px rgba(255,122,0,0.25)",
        border: "none",
        ...style
      };
    }
    return style;
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "px-3.5 py-1.5 text-[10px] rounded-lg";
      case "lg":
        return "px-6 py-3.5 text-xs rounded-xl";
      default: // md
        return "px-5 py-2.5 text-xs rounded-xl";
    }
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-mono tracking-widest uppercase transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF8A00]/45 focus:ring-offset-1 focus:ring-offset-[#050505] ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      style={getInlineStyles()}
      {...props}
    >
      {children}
    </button>
  );
};

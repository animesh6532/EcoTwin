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
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-[#FF8A00] text-[#050505] font-bold border-none hover:bg-[#FF9F1C] hover:-translate-y-0.5 active:translate-y-0 hover:shadow-[0_8px_24px_rgba(255,138,0,0.25)]";
      case "danger":
        return "bg-[#EF4444]/20 text-[#FFF7ED] border border-[#EF4444]/35 hover:bg-[#EF4444]/30 hover:border-[#EF4444]/65 active:translate-y-0";
      case "ghost":
        return "bg-transparent text-[#D6C3AE] border border-transparent hover:bg-white/5 active:translate-y-0";
      default: // secondary
        return "bg-transparent text-[#FFE7CC] border border-[rgba(255,183,106,0.25)] hover:bg-[#FF8A00]/10 hover:border-[#FF8A00]/40 active:translate-y-0";
    }
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
      className={`inline-flex items-center justify-center font-mono tracking-widest uppercase transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF8A00]/45 focus:ring-offset-1 focus:ring-offset-foundation-dark ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

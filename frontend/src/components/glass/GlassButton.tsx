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
  disabled,
  ...props
}) => {
  let btnStyles = "";
  if (variant === "primary") {
    btnStyles = "bg-[#FF8A00] text-[#050505] border-transparent font-bold hover:bg-[#FF9D24] hover:shadow-[0_0_15px_rgba(255,138,0,0.4)]";
  } else if (variant === "secondary") {
    btnStyles = "bg-[rgba(255,138,0,0.08)] text-[#FFF3E5] border-[rgba(255,183,106,0.25)] hover:bg-[rgba(255,138,0,0.15)] hover:border-[#FF8A00]";
  } else if (variant === "ghost") {
    btnStyles = "bg-transparent text-[#B89B82] border-transparent hover:text-[#FFF3E5] hover:bg-white/5";
  } else if (variant === "danger") {
    btnStyles = "bg-[rgba(255,77,77,0.08)] text-[#FF4D4D] border-[rgba(255,77,77,0.25)] hover:bg-[rgba(255,77,77,0.15)] hover:border-[#FF4D4D]";
  }

  let sizeStyles = "px-4 py-2 text-xs rounded-xl";
  if (size === "sm") sizeStyles = "px-3 py-1.5 text-[11px] rounded-lg";
  else if (size === "lg") sizeStyles = "px-6 py-3 text-sm rounded-2xl font-semibold";

  return (
    <button
      className={`border font-sans transition-all duration-200 select-none flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ${btnStyles} ${sizeStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

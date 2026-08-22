import React, { useRef, useState, useEffect } from "react";

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
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: -999, y: -999 });
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card || reducedMotion) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });

    if (interactive) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -3; // Max ±3 degrees
      const rotateY = ((x - centerX) / centerX) * 3;  // Max ±3 degrees
      
      card.style.transform = `translateY(-4px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    const card = cardRef.current;
    if (!card || reducedMotion) return;
    if (interactive) {
      card.style.transform = `translateY(-4px) perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: -999, y: -999 });
    const card = cardRef.current;
    if (!card || reducedMotion) return;
    if (interactive) {
      card.style.transform = `translateY(0px) perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    }
  };

  const getBorderColor = () => {
    if (isHovered && interactive) return "rgba(255, 145, 40, 0.55)";
    return "rgba(255, 145, 40, 0.22)";
  };

  const baseStyle = {
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.025))",
    border: `1px solid ${getBorderColor()}`,
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    transition: "transform 350ms cubic-bezier(0.16, 1, 0.3, 1), border-color 350ms ease, box-shadow 350ms ease",
    transformStyle: "preserve-3d" as const,
  };

  const getShadow = () => {
    if (isHovered && interactive) {
      return "0 25px 70px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 35px rgba(255,122,0,0.18), 0 0 80px rgba(255,122,0,0.08)";
    }
    return "0 20px 60px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 25px rgba(255,122,0,0.055)";
  };

  const finalStyle = {
    ...baseStyle,
    boxShadow: getShadow(),
    ...style,
  };

  let variantClasses = "rounded-[18px]";
  if (variant === "large") variantClasses = "rounded-[22px] p-8";
  else if (variant === "feature") variantClasses = "rounded-[18px] p-6 border-l-4 border-l-[#FF8A00]";
  else if (variant === "chart") variantClasses = "rounded-[18px] p-6";
  else if (variant === "control") variantClasses = "rounded-[18px] p-6";
  else if (variant === "status") variantClasses = "rounded-xl p-4";
  else variantClasses = "rounded-[18px] p-6"; // small / default

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${variantClasses} ${className}`}
      style={finalStyle}
      {...props}
    >
      {/* Interactive cursor-follow radial glow */}
      {!reducedMotion && coords.x !== -999 && (
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${coords.x}px ${coords.y}px, rgba(255, 122, 0, 0.14), transparent 35%)`,
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* Premium inner reflection gradient surface (glass shine) */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-[inherit]"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.035), transparent 45%)"
        }}
      />
      
      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full" style={{ transform: "translateZ(10px)" }}>
        {children}
      </div>
    </div>
  );
};

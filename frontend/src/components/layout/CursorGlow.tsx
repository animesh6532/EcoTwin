import React, { useEffect, useRef } from "react";

export const CursorGlow: React.FC = () => {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable on mobile/touch screens
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const glow = glowRef.current;
    if (!glow) return;

    let mouseX = -999;
    let mouseY = -999;
    let currentX = -999;
    let currentY = -999;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (currentX === -999) {
        currentX = mouseX;
        currentY = mouseY;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;

    const updatePosition = () => {
      if (mouseX !== -999 && currentX !== -999) {
        // Interpolate position for smooth movement (lerp)
        currentX += (mouseX - currentX) * 0.12;
        currentY += (mouseY - currentY) * 0.12;
        
        glow.style.left = `${currentX}px`;
        glow.style.top = `${currentY}px`;
        glow.style.opacity = "1";
      }
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={glowRef}
      className="fixed h-[260px] w-[260px] rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-300 hidden lg:block"
      style={{
        background: "radial-gradient(circle, rgba(255, 122, 0, 0.05) 0%, rgba(255, 122, 0, 0) 70%)",
        filter: "blur(30px)",
      }}
    />
  );
};

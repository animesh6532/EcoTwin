import React from "react";

export const BackgroundLayer: React.FC = () => {
  return (
    <>
      {/* Fixed metropolitan background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center pointer-events-none z-0 select-none brightness-[0.4] contrast-[1.05]"
        style={{
          backgroundImage: "url('/images/ecotwin-city-hero.png')",
        }}
      />
      {/* Black overlay (55% to 70%) */}
      <div className="fixed inset-0 bg-black/60 pointer-events-none z-0" />
      
      {/* Warm brown overlay (10% to 20%) */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(42, 23, 12, 0.15), transparent 75%)"
        }}
      />
      
      {/* Bottom gradient overlay (stronger darkness at bottom) */}
      <div className="fixed inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent pointer-events-none z-0" />
      
      {/* Subtle scanline overlay for command room atmosphere */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[size:100%_4px] pointer-events-none z-0 opacity-20" />
    </>
  );
};

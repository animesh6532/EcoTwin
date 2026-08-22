import React from "react";

export const BackgroundLayer: React.FC = () => {
  return (
    <>
      {/* Fixed metropolitan background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center pointer-events-none z-0 select-none brightness-[0.45] contrast-[1.02]"
        style={{
          backgroundImage: "url('/images/ecotwin-city-hero.png')",
          backgroundAttachment: "fixed",
        }}
      />
      
      {/* Non-opaque layered dark gradients (city details stay visible) */}
      <div 
        className="fixed inset-0 pointer-events-none z-0" 
        style={{
          background: `
            linear-gradient(to bottom, rgba(5, 8, 12, 0.35), rgba(18, 12, 7, 0.28)),
            radial-gradient(circle at 50% 50%, rgba(255, 138, 0, 0.05), transparent 75%)
          `
        }}
      />
      
      {/* Dashboard ambient glow radial filters */}
      <div 
        className="fixed inset-0 pointer-events-none z-0" 
        style={{
          background: `
            radial-gradient(circle at 20% 0%, rgba(255, 138, 0, 0.08), transparent 28%),
            radial-gradient(circle at 90% 10%, rgba(255, 184, 77, 0.06), transparent 25%)
          `
        }}
      />
    </>
  );
};

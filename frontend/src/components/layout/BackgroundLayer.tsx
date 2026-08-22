import React from "react";

export const BackgroundLayer: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none">
      {/* Fixed cinematic background image at 42% opacity */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-300"
        style={{
          backgroundImage: "url('/images/ecotwin-city-hero.png')",
          backgroundAttachment: "fixed",
          opacity: 0.42,
          filter: "brightness(0.70) saturate(0.85)"
        }}
      />
      
      {/* Warm dark readability overlay above the image */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(135deg, rgba(10, 8, 6, 0.58), rgba(18, 12, 7, 0.48), rgba(5, 8, 10, 0.58)),
            radial-gradient(circle at 20% 15%, rgba(255, 138, 0, 0.07), transparent 32%),
            radial-gradient(circle at 80% 70%, rgba(255, 184, 77, 0.04), transparent 30%)
          `
        }}
      />
    </div>
  );
};

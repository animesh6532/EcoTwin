import React, { useEffect, useState } from "react";

export const BackgroundLayer: React.FC = () => {
  const [isLanding, setIsLanding] = useState(window.location.pathname === "/");

  useEffect(() => {
    const handlePopState = () => {
      setIsLanding(window.location.pathname === "/");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (isLanding) {
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
  }

  // Internal application pages: NO CITY IMAGE.
  // Instead: animated black + orange gradient with moving blobs.
  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden bg-[#050505]">
      {/* Animated gradient flow background */}
      <div 
        className="absolute inset-0 transition-all duration-500 animate-gradient-flow"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(255, 122, 0, 0.14), transparent 35%),
            radial-gradient(circle at 80% 70%, rgba(255, 179, 71, 0.10), transparent 30%),
            linear-gradient(135deg, #050505, #100B07, #050505, #1A0B02)
          `,
          backgroundSize: "200% 200%",
        }}
      />

      {/* Moving ambient orbs (3 orbs) */}
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-[#FF7A00] opacity-[0.12] blur-[100px] animate-float-orb-1" />
      <div className="absolute bottom-1/4 right-1/4 w-[35vw] h-[35vw] rounded-full bg-[#FFB347] opacity-[0.10] blur-[100px] animate-float-orb-2" />
      <div className="absolute top-1/2 right-1/3 w-[30vw] h-[30vw] rounded-full bg-[#FF7A00] opacity-[0.11] blur-[100px] animate-float-orb-3" />
    </div>
  );
};

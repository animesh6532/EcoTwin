import React, { useState } from "react";
import { BrandBlock } from "./BrandBlock";
import { PrimaryNavigation } from "./PrimaryNavigation";
import { OperationsStatus } from "./OperationsStatus";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { Menu, MapPin } from "lucide-react";
import { useLocationStore } from "../../store/locationStore";

interface GlobalHeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ currentPath, navigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { city, locality, source, setShowOnboardingModal } = useLocationStore();

  return (
    <header className="w-full flex items-center justify-center pt-4 md:pt-6 px-4 md:px-8 sticky top-0 z-50 pointer-events-none">
      <div 
        style={{
          background: "linear-gradient(180deg, rgba(14, 11, 9, 0.90), rgba(8, 7, 6, 0.95))",
          borderColor: "rgba(255, 138, 0, 0.25)",
          backdropFilter: "blur(22px)",
          boxShadow: "0 12px 45px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          borderRadius: "20px"
        }}
        className="w-full max-w-[1720px] pointer-events-auto border px-4 md:px-6 h-[72px] md:h-[76px] flex items-center justify-between gap-2 md:gap-4 relative overflow-hidden"
      >
        {/* DESKTOP LAYOUT (Zones A, B, C) */}
        <div className="flex items-center min-w-0 h-full flex-1">
          {/* ZONE A: BRAND */}
          <BrandBlock onNavigate={navigate} />

          {/* ZONE B: PRIMARY NAVIGATION (Desktop >= 990px) */}
          <div className="hidden lg:flex items-center min-w-0 h-full overflow-hidden">
            <PrimaryNavigation currentPath={currentPath} navigate={navigate} />
          </div>
        </div>

        {/* ZONE C: LIVE OPERATIONS & SYSTEM STATUS (Desktop >= 990px) */}
        <div className="hidden lg:flex items-center shrink-0 h-full">
          <OperationsStatus />
        </div>

        {/* MOBILE / TABLET HEADER CONTROLS (< 990px) */}
        <div className="flex lg:hidden items-center gap-2 text-xs font-mono">
          {/* Quick Location Pill */}
          <button
            onClick={() => setShowOnboardingModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#14100D] border border-[#FF8A00]/25 text-[11px] font-bold text-text-cream cursor-pointer"
          >
            <MapPin className="h-3 w-3 text-[#FF8A00]" />
            <span className="truncate max-w-[100px]">{city || locality || "Location"}</span>
            <span className="text-[8px] text-[#FF8A00] font-bold px-1 rounded bg-[#FF8A00]/10">{source}</span>
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#FF8A00]/40 text-text-cream transition-colors cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-5 w-5 text-[#FF8A00]" />
          </button>
        </div>
      </div>

      {/* MOBILE SLIDE-OUT NAVIGATION DRAWER */}
      <MobileNavDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentPath={currentPath}
        navigate={navigate}
      />
    </header>
  );
};

export default GlobalHeader;

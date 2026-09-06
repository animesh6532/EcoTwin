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
    <header className="w-full flex items-center justify-center pt-3 md:pt-4 px-2 sm:px-4 md:px-6 sticky top-0 z-50 pointer-events-none">
      <div 
        style={{
          background: "linear-gradient(180deg, rgba(14, 11, 9, 0.92), rgba(8, 7, 6, 0.96))",
          borderColor: "rgba(255, 138, 0, 0.25)",
          backdropFilter: "blur(22px)",
          boxShadow: "0 12px 45px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          borderRadius: "16px"
        }}
        className="w-full pointer-events-auto border px-3 xl:px-4 h-[70px] md:h-[74px] grid grid-cols-[auto_1fr_auto] lg:grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 xl:gap-3 relative"
      >
        {/* ZONE A: BRAND (Column 1) */}
        <div className="flex items-center shrink-0">
          <BrandBlock onNavigate={navigate} />
        </div>

        {/* ZONE B: PRIMARY NAVIGATION (Column 2 - Desktop >= 1024px) */}
        <div className="hidden lg:flex items-center justify-center min-w-0 h-full w-full">
          <PrimaryNavigation currentPath={currentPath} navigate={navigate} />
        </div>

        {/* ZONE C: LIVE OPERATIONS & SYSTEM STATUS (Column 3 - Desktop >= 1024px) */}
        <div className="hidden lg:flex items-center justify-end shrink-0 h-full">
          <OperationsStatus />
        </div>

        {/* MOBILE / TABLET HEADER CONTROLS (< 1024px) */}
        <div className="flex lg:hidden items-center justify-end gap-2 text-xs font-mono col-span-2">
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

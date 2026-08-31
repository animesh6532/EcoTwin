import { useState } from "react";
import { Leaf, Menu, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSystemReadiness } from "../../api/health";

interface LandingNavbarProps {
  onEnter: () => void;
  navigate: (path: string) => void;
}

export default function LandingNavbar({ onEnter, navigate }: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // REST API status query
  const { data: isReady } = useQuery<{ status: string }, Error>({
    queryKey: ["apiReadyLandingNavbar"],
    queryFn: getSystemReadiness,
    refetchInterval: 10000,
  });

  const navLinks = [
    { label: "Overview", path: "/overview" },
    { label: "Simulation", path: "/simulation" },
    { label: "Traffic", path: "/traffic" },
    { label: "Carbon", path: "/carbon" },
    { label: "RL Control", path: "/rl" },
    { label: "Analytics", path: "/analytics" },
    { label: "Insights", path: "/insights" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div 
        style={{ 
          background: "rgba(10, 8, 7, 0.8)", 
          borderColor: "rgba(255, 138, 0, 0.2)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
        }}
        className="mx-auto max-w-7xl border rounded-[20px] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between transition-all duration-300"
      >
        {/* Brand Logo */}
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-left cursor-pointer hover:opacity-90 transition-opacity"
        >
          <Leaf className="h-5 w-5 text-[#FF8A00] stroke-[2.5] animate-pulse" />
          <div className="flex flex-col">
            <span className="font-mono text-xs uppercase tracking-[0.25em] font-extrabold text-[#FFF7ED]">EcoTwin</span>
            <span className="text-[7px] text-[#A89582] uppercase tracking-widest font-mono mt-0.5 leading-none">Carbon Intelligence</span>
          </div>
        </button>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-semibold tracking-wide text-[#A89582]">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="hover:text-[#FFF7ED] transition-colors duration-200"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* System Readiness & Action CTA */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-[#A89582] bg-[#1a120b]/60 border border-white/5 px-3.5 py-1.5 rounded-full">
            <span className={`h-1.5 w-1.5 rounded-full ${isReady ? "bg-[#22C55E] shadow-[0_0_8px_#22C55E]" : "bg-[#FFB84D] animate-pulse"}`} />
            <span>{isReady ? "SYSTEM ONLINE" : "CONNECTING"}</span>
          </div>
          
          <button
            onClick={onEnter}
            style={{
              background: "#FF8A00",
              color: "#050505",
              boxShadow: "0 4px 14px rgba(255, 138, 0, 0.3)"
            }}
            className="px-4 py-2 rounded-xl text-[10px] tracking-wider uppercase font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,138,0,0.4)] active:translate-y-0 cursor-pointer"
          >
            Launch Dashboard
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex lg:hidden items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[8px] font-bold text-[#A89582] bg-[#1a120b]/60 border border-white/5 px-2.5 py-1 rounded-full md:hidden">
            <span className={`h-1.2 w-1.2 rounded-full ${isReady ? "bg-[#22C55E] shadow-[0_0_6px_#22C55E]" : "bg-[#FFB84D] animate-pulse"}`} />
            <span>{isReady ? "ONLINE" : "SYNCING"}</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#E8D7C5] hover:text-[#FFF7ED] transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          style={{ 
            background: "rgba(10, 8, 7, 0.96)",
            borderColor: "rgba(255, 138, 0, 0.15)"
          }}
          className="lg:hidden mt-2 mx-auto max-w-7xl border rounded-[18px] p-4 flex flex-col gap-4 text-xs font-mono animate-fade-in shadow-2xl relative z-50"
        >
          <div className="flex flex-col gap-2.5">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(link.path);
                }}
                className="w-full text-left py-2 px-3 hover:bg-[#FF8A00]/10 rounded-lg text-[#E8D7C5] hover:text-[#FFF7ED] font-semibold transition-all"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="border-t border-white/5 pt-3 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onEnter();
              }}
              style={{
                background: "#FF8A00",
                color: "#050505",
              }}
              className="w-full py-3 rounded-xl text-[10px] tracking-wider uppercase font-bold text-center cursor-pointer"
            >
              Launch Dashboard
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

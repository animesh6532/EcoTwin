import React from "react";
import { 
  LayoutDashboard, 
  Play, 
  GitFork, 
  Flame, 
  Cpu, 
  BarChart3, 
  Layers, 
  Activity, 
  Settings as SettingsIcon,
  BookOpen,
  X,
  MapPin,
  Compass
} from "lucide-react";
import { useLocationStore } from "../../store/locationStore";
import { useSimulationStore } from "../../store/simulationStore";
import { PageId } from "./PrimaryNavigation";

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  navigate: (path: string) => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  currentPath,
  navigate,
}) => {
  const { city, locality, source, isDemoMode, setShowOnboardingModal, toggleDemoMode } = useLocationStore();
  const { running, paused, simulationTime, controller, sumoStatus, connectionState } = useSimulationStore();

  if (!isOpen) return null;

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/overview" },
    { id: "simulation", label: "Simulation", icon: Play, path: "/simulation" },
    { id: "traffic", label: "Traffic", icon: GitFork, path: "/traffic" },
    { id: "carbon", label: "Carbon", icon: Flame, path: "/carbon" },
    { id: "rl", label: "RL Control", icon: Cpu, path: "/rl" },
    { id: "analytics", label: "Analytics", icon: BarChart3, path: "/analytics" },
    { id: "experiments", label: "Compare", icon: Layers, path: "/compare" },
    { id: "insights", label: "Insights", icon: BookOpen, path: "/insights" },
    { id: "health", label: "Health", icon: Activity, path: "/health" },
    { id: "settings", label: "Settings", icon: SettingsIcon, path: "/settings" },
  ] as const;

  const getActivePageId = (path: string): PageId => {
    if (path === "/compare") return "experiments";
    const segment = path.replace("/", "");
    return (segment as PageId) || "overview";
  };

  const activePageId = getActivePageId(currentPath);

  const handleNavClick = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/75 backdrop-blur-md animate-fadeIn lg:hidden">
      <div 
        style={{
          background: "linear-gradient(180deg, rgba(14, 12, 10, 0.98), rgba(8, 7, 6, 0.99))",
          borderColor: "rgba(255, 138, 0, 0.30)",
          boxShadow: "-10px 0 40px rgba(0, 0, 0, 0.8)"
        }}
        className="w-full max-w-xs h-full border-l p-6 flex flex-col justify-between overflow-y-auto text-text-cream font-mono"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex flex-col">
            <span className="font-bold text-[#FFF7ED] text-sm tracking-[0.2em] uppercase">EcoTwin</span>
            <span className="text-[9px] text-[#A89582] tracking-wider uppercase font-bold">Operations Menu</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-text-cream transition-colors cursor-pointer"
            aria-label="Close Mobile Navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="flex flex-col gap-1.5 py-4 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePageId === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                style={
                  isActive
                    ? {
                        background: "rgba(255, 138, 0, 0.15)",
                        borderColor: "rgba(255, 138, 0, 0.50)",
                        color: "#FFF7ED"
                      }
                    : {
                        background: "transparent",
                        borderColor: "transparent",
                        color: "#D6C3AE"
                      }
                }
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all border text-left cursor-pointer ${
                  isActive ? "text-[#FFF7ED]" : "hover:text-[#FFF7ED] hover:bg-white/5"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#FF8A00]" : "text-[#A89582]"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Location & Status Footer */}
        <div className="border-t border-white/10 pt-4 flex flex-col gap-3 text-xs font-mono">
          <button
            onClick={() => {
              setShowOnboardingModal(true);
              onClose();
            }}
            className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#FF8A00]/40 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#FF8A00]" />
              <div className="flex flex-col">
                <span className="text-[9px] text-[#A89582] uppercase">Target Location</span>
                <span className="font-bold text-[#FFF7ED] text-xs truncate max-w-[150px]">
                  {city || locality || "Set Location"}
                </span>
              </div>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FF8A00]/15 text-[#FF8A00] uppercase border border-[#FF8A00]/30">
              {source}
            </span>
          </button>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] uppercase font-bold">
            <span className="text-[#A89582]">Demo Network Mode</span>
            <button
              onClick={() => toggleDemoMode(!isDemoMode)}
              className={`px-2 py-0.5 rounded border text-[9px] cursor-pointer ${
                isDemoMode
                  ? "bg-[#FFB84D]/20 text-[#FFB84D] border-[#FFB84D]/40"
                  : "bg-white/5 text-[#A89582] border-white/10"
              }`}
            >
              <Compass className="h-3 w-3 inline mr-1" />
              {isDemoMode ? "Active" : "Off"}
            </button>
          </div>

          {running && (
            <div className="p-3 rounded-xl bg-[#FF8A00]/10 border border-[#FF8A00]/25 text-[10px] space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-[#FF8A00] uppercase">Active Run Session</span>
                <span className="text-white">{simulationTime.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between text-[#A89582]">
                <span>Controller:</span>
                <strong className="text-white uppercase">{controller}</strong>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[9px] text-[#A89582] pt-2 border-t border-white/5">
            <span>SUMO: <strong className={sumoStatus === "healthy" ? "text-[#39D98A]" : "text-[#FFB84D]"}>{String(sumoStatus).toUpperCase()}</strong></span>
            <span>WS: <strong className={connectionState === "connected" ? "text-[#39D98A]" : "text-[#FF4D4D]"}>{connectionState.toUpperCase()}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

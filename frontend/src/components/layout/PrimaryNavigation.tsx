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
  BookOpen
} from "lucide-react";

export type PageId = 
  | "overview"
  | "simulation"
  | "traffic"
  | "carbon"
  | "rl"
  | "analytics"
  | "experiments"
  | "insights"
  | "health"
  | "settings";

interface PrimaryNavigationProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const PrimaryNavigation: React.FC<PrimaryNavigationProps> = ({ currentPath, navigate }) => {
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

  return (
    <nav 
      className="flex items-center justify-center gap-0.5 xl:gap-1 shrink-0 whitespace-nowrap" 
      aria-label="Primary Navigation"
    >
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePageId === item.id;

        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            aria-current={isActive ? "page" : undefined}
            style={
              isActive
                ? {
                    background: "rgba(255, 138, 0, 0.12)",
                    borderColor: "rgba(255, 138, 0, 0.45)",
                    color: "#FFF7ED",
                    boxShadow: "0 0 12px rgba(255, 138, 0, 0.12)"
                  }
                : {
                    background: "transparent",
                    borderColor: "transparent",
                    color: "#D6C3AE"
                  }
            }
            className={`flex items-center gap-1 px-1.5 xl:px-2 2xl:px-2.5 py-1 rounded-lg text-[10.5px] xl:text-[11.5px] 2xl:text-[12.5px] font-medium tracking-wide transition-all duration-200 whitespace-nowrap border cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF8A00] shrink-0 ${
              isActive
                ? "font-semibold text-[#FFF7ED]"
                : "hover:text-[#FFF7ED] hover:bg-white/5"
            }`}
          >
            <Icon 
              className={`h-3 w-3 xl:h-3.5 xl:w-3.5 transition-colors duration-200 shrink-0 ${
                isActive ? "text-[#FF8A00]" : "text-[#A89582]"
              }`} 
              strokeWidth={isActive ? 2.2 : 1.8}
            />
            <span className="shrink-0">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};



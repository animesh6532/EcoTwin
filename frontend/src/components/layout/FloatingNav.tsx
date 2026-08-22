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
  Leaf
} from "lucide-react";

export type PageId = 
  | "overview"
  | "simulation"
  | "traffic"
  | "carbon"
  | "rl"
  | "analytics"
  | "experiments"
  | "health"
  | "settings";

interface FloatingNavProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export default function FloatingNav({ currentPath, navigate }: FloatingNavProps) {
  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "simulation", label: "Simulation", icon: Play },
    { id: "traffic", label: "Traffic", icon: GitFork },
    { id: "carbon", label: "Carbon", icon: Flame },
    { id: "rl", label: "RL Control", icon: Cpu },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "experiments", label: "Compare", icon: Layers },
    { id: "health", label: "Health", icon: Activity },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ] as const;

  const getPageIdFromPath = (path: string): PageId => {
    if (path === "/compare") return "experiments";
    const segment = path.replace("/", "");
    return (segment as PageId) || "overview";
  };

  const activePageId = getPageIdFromPath(currentPath);

  const getPathFromPageId = (id: PageId) => {
    if (id === "experiments") return "/compare";
    return `/${id}`;
  };

  return (
    <div className="flex items-center gap-6 overflow-x-auto scrollbar-none max-w-full">
      {/* Clickable Brand Logo (Exit Dashboard / Return to Landing Page) */}
      <button 
        onClick={() => navigate("/")}
        className="flex items-center gap-2.5 shrink-0 border-r border-[rgba(255,184,77,0.18)] pr-5 hover:opacity-85 transition-opacity text-left cursor-pointer"
        aria-label="Exit Dashboard"
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-[#FF8A00]/20 blur-md rounded-full scale-125" />
          <Leaf className="text-[#FF8A00] h-4.5 w-4.5 relative z-10 animate-pulse" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-[#FFF7ED] text-xs tracking-[0.2em] font-mono uppercase leading-none">EcoTwin</span>
          <span className="text-[8px] text-[#A89582] tracking-wider uppercase font-mono mt-0.5 font-bold">Carbon Intelligence</span>
        </div>
      </button>

      {/* Nav Link List */}
      <nav className="flex items-center gap-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePageId === item.id;

          return (
            <button
              key={item.id}
              onClick={() => navigate(getPathFromPageId(item.id))}
              style={
                isActive
                  ? {
                      background: "rgba(255, 138, 0, 0.12)",
                      borderColor: "rgba(255, 138, 0, 0.45)",
                      color: "#FFF7ED"
                    }
                  : {
                      background: "transparent",
                      borderColor: "transparent",
                      color: "#E8D7C5"
                    }
              }
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 shrink-0 border ${
                isActive
                  ? "shadow-[0_0_15px_rgba(255,138,0,0.12)] font-bold text-[#FFF7ED]"
                  : "hover:text-[#FFF7ED] hover:bg-[#FF8A00]/10"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 transition-colors duration-300 ${isActive ? "text-[#FF8A00]" : "text-[#A89582]"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

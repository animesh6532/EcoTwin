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
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
}

export default function FloatingNav({ currentPage, setCurrentPage }: FloatingNavProps) {
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

  return (
    <div className="flex items-center gap-6 overflow-x-auto scrollbar-none max-w-full">
      {/* Brand Logo with accent lines */}
      <div className="flex items-center gap-2.5 shrink-0 border-r border-rgba(255,183,106,0.15) pr-5">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-brand-orange/20 blur-md rounded-full scale-125" />
          <Leaf className="text-brand-orange h-4.5 w-4.5 relative z-10 animate-pulse" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-text-cream text-xs tracking-[0.2em] font-mono uppercase leading-none">EcoTwin</span>
          <span className="text-[8px] text-text-muted tracking-wider uppercase font-mono mt-0.5 font-bold">Carbon Intelligence</span>
        </div>
      </div>

      {/* Nav Link List */}
      <nav className="flex items-center gap-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={
                isActive
                  ? {
                      background: "linear-gradient(135deg, rgba(255,138,0,0.22), rgba(255,163,71,0.06))",
                      borderColor: "rgba(255,163,71,0.35)",
                      color: "#FFF3E5"
                    }
                  : {}
              }
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 shrink-0 border border-transparent ${
                isActive
                  ? "shadow-[0_0_15px_rgba(255,138,0,0.12)] text-text-cream font-bold"
                  : "text-text-muted hover:text-text-peach hover:bg-brand-orange/10"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 transition-colors duration-300 ${isActive ? "text-brand-orange" : "text-text-dim"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

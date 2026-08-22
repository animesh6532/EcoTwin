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
    { id: "rl", label: "RL", icon: Cpu },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "experiments", label: "Compare", icon: Layers },
    { id: "health", label: "Health", icon: Activity },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ] as const;

  return (
    <div className="flex items-center gap-6 overflow-x-auto scrollbar-none max-w-full">
      {/* Brand Logo */}
      <div className="flex items-center gap-2 shrink-0 border-r border-[#75451A]/30 pr-4">
        <Leaf className="text-[#FF8A00] h-5 w-5" strokeWidth={2.5} />
        <span className="font-bold text-[#FFF3E5] text-sm tracking-widest font-mono uppercase">EcoTwin</span>
      </div>

      {/* Nav List */}
      <nav className="flex items-center gap-1">
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
                      background: "linear-gradient(135deg, rgba(224,108,0,0.32), rgba(255,138,0,0.12))",
                      border: "1px solid rgba(255,163,71,0.45)",
                      color: "#FFF3E5"
                    }
                  : {}
              }
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 shrink-0 border border-transparent ${
                isActive
                  ? "shadow-[0_0_12px_rgba(255,138,0,0.15)]"
                  : "text-[#9A8575] hover:text-[#FFD2A3] hover:bg-[#FF8A00]/10"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#FF8A00]" : "text-[#9A8575]"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

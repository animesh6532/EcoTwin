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

interface SidebarProps {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
}

export default function Sidebar({ currentPage, setCurrentPage }: SidebarProps) {
  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "simulation", label: "Live Simulation", icon: Play },
    { id: "traffic", label: "Traffic Network", icon: GitFork },
    { id: "carbon", label: "Carbon Intelligence", icon: Flame },
    { id: "rl", label: "Reinforcement Learning", icon: Cpu },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "experiments", label: "Experiments", icon: Layers },
    { id: "health", label: "System Health", icon: Activity },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ] as const;

  return (
    <aside className="w-64 bg-white border-r border-border flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <Leaf className="text-eco-green h-6 w-6" strokeWidth={2.5} />
        <span className="font-bold text-text-primary text-xl tracking-tight">EcoTwin</span>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-eco-green/10 text-eco-forest"
                  : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${isActive ? "text-eco-green" : "text-text-muted"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom version metadata footer */}
      <div className="px-6 py-4 border-t border-border bg-bg-secondary text-[11px] text-text-muted space-y-1">
        <div className="font-medium text-text-secondary">EcoTwin Operations</div>
        <div>Version 1.0.0 (Vite + React)</div>
        <div>SUMO 1.18 Client</div>
      </div>
    </aside>
  );
}

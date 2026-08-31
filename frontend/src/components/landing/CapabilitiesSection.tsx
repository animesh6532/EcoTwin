import { Settings, Heart, AlertTriangle, Layers, BarChart3 } from "lucide-react";

export default function CapabilitiesSection() {
  const capabilities = [
    {
      icon: Settings,
      title: "Active Control",
      what: "Live traffic lights overrides & speed limits settings",
      why: "Enables manual and automated corridor signal regulation.",
    },
    {
      icon: Layers,
      title: "Comparison Panel",
      what: "Side-by-side simulation runs & telemetry analysis",
      why: "Quantifies performance of RL controllers against baseline.",
    },
    {
      icon: Heart,
      title: "Operational Telemetry",
      what: "High-frequency streaming via WebSockets client connection",
      why: "Provides instantaneous state updates of active junctions.",
    },
    {
      icon: AlertTriangle,
      title: "Hotspot Detection",
      what: "Dynamic pollution grids mapping local carbon concentration",
      why: "Alerts operators to heavy environmental bottlenecks.",
    },
    {
      icon: BarChart3,
      title: "System Diagnostics",
      what: "Continuous REST queries monitoring SUMO/TraCI health",
      why: "Ensures simulator and training modules are responsive.",
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/5 bg-[#120D09]">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFF7ED] uppercase tracking-wider">
          Core System Modules
        </h2>
        <p className="text-[#A89582] text-xs sm:text-sm mt-2">
          Technical operations built directly into the digital twin intelligence dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {capabilities.map((cap, idx) => {
          const Icon = cap.icon;
          return (
            <div 
              key={idx} 
              className="p-5 rounded-2xl border border-white/5 bg-[#17110C]/40 flex gap-4 hover:border-[#FF8A00]/20 transition-colors"
            >
              <div className="p-2.5 bg-[#FF8A00]/5 border border-[#FF8A00]/15 rounded-xl shrink-0 h-max">
                <Icon className="h-4.5 w-4.5 text-[#FF8A00]" />
              </div>
              <div className="text-left space-y-1.5">
                <h4 className="text-sm font-bold text-[#FFF7ED] uppercase tracking-wide font-sans">
                  {cap.title}
                </h4>
                <div>
                  <span className="text-[9px] uppercase font-mono tracking-wider text-[#FFB84D] block font-bold">What it does</span>
                  <p className="text-[11px] text-[#CBB9A6] leading-normal font-sans font-normal">{cap.what}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono tracking-wider text-[#A89582] block font-bold">Why it matters</span>
                  <p className="text-[11px] text-[#A89582] leading-normal font-sans font-normal">{cap.why}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

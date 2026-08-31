import { MapPin, Play, Activity, Leaf, Cpu, BarChart3, ArrowRight, ArrowDown } from "lucide-react";

export default function WorkflowSection() {
  const steps = [
    {
      icon: MapPin,
      title: "Traffic Input",
      subtitle: "Location corridor demand",
      color: "text-[#FFB84D]",
      bg: "bg-[#FFB84D]/10",
    },
    {
      icon: Play,
      title: "SUMO Engine",
      subtitle: "Microscopic physics simulation",
      color: "text-[#FF8A00]",
      bg: "bg-[#FF8A00]/10",
    },
    {
      icon: Activity,
      title: "TraCI API",
      subtitle: "Real-time state extraction",
      color: "text-[#FFB84D]",
      bg: "bg-[#FFB84D]/10",
    },
    {
      icon: Leaf,
      title: "Carbon Model",
      subtitle: "Emission analytics & hotspots",
      color: "text-[#FF8A00]",
      bg: "bg-[#FF8A00]/10",
      glow: true,
    },
    {
      icon: Cpu,
      title: "RL Controller",
      subtitle: "PPO policy action overrides",
      color: "text-[#FFB84D]",
      bg: "bg-[#FFB84D]/10",
    },
    {
      icon: BarChart3,
      title: "Insights",
      subtitle: "Baseline vs PPO evaluation",
      color: "text-[#FF8A00]",
      bg: "bg-[#FF8A00]/10",
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/5">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#FF8A00] block mb-2 font-mono">
          System Data Flow
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFF7ED] uppercase tracking-wider">
          How EcoTwin Operates
        </h2>
        <p className="text-[#A89582] text-xs sm:text-sm mt-2">
          From traffic ingestion to reinforcement learning actions—our operational telemetry loop.
        </p>
      </div>

      {/* Horizontal Pipeline (Desktop) / Vertical (Mobile) */}
      <div className="hidden lg:flex items-center justify-between gap-2.5 relative max-w-6xl mx-auto px-4 py-8 bg-[#140F0A]/50 border border-brand-orange/15 rounded-3xl backdrop-blur-sm">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="flex items-center gap-2 flex-1 last:flex-none">
              {/* Step Card */}
              <div 
                style={{
                  boxShadow: step.glow ? "0 0 20px rgba(255, 122, 0, 0.15)" : "none"
                }}
                className={`flex flex-col items-center text-center p-4 border border-white/5 rounded-2xl w-full transition-all duration-300 hover:border-[#FF8A00]/30 hover:bg-white/5 bg-[#120D09]`}
              >
                <div className={`p-2.5 rounded-xl ${step.bg} ${step.color} mb-3`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-mono font-bold text-[#FFF7ED] uppercase tracking-wider">
                  {step.title}
                </h4>
                <p className="text-[9px] text-[#A89582] font-medium mt-1 leading-normal font-sans">
                  {step.subtitle}
                </p>
              </div>

              {/* Arrow Connector (except last) */}
              {idx < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-[#A89582]/40 shrink-0 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Vertical Pipeline (Mobile/Tablet) */}
      <div className="lg:hidden flex flex-col items-center gap-4 max-w-md mx-auto">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="flex flex-col items-center w-full">
              <div className="flex items-center gap-4 p-4 border border-white/5 bg-[#120D09] rounded-2xl w-full">
                <div className={`p-2.5 rounded-xl ${step.bg} ${step.color} shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-mono font-bold text-[#FFF7ED] uppercase tracking-wider">
                    {step.title}
                  </h4>
                  <p className="text-[10px] text-[#A89582] mt-0.5">
                    {step.subtitle}
                  </p>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <ArrowDown className="h-4 w-4 text-[#A89582]/40 my-1 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

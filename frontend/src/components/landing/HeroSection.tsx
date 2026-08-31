import { ArrowUpRight, Play, Terminal, Cpu } from "lucide-react";

interface HeroSectionProps {
  onEnter: () => void;
  navigate: (path: string) => void;
}

export default function HeroSection({ onEnter, navigate }: HeroSectionProps) {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 flex flex-col lg:flex-row items-center gap-10 md:gap-12 overflow-hidden">
      {/* Left Column: Copy & Actions */}
      <div className="flex-1 space-y-6 lg:max-w-xl text-left z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF8A00]/10 border border-[#FF8A00]/25 text-[9px] font-bold text-[#FFB84D] uppercase tracking-[0.2em] font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF8A00] animate-pulse" />
          <span>[ System Active: SUMO / RL / PPO ]</span>
        </div>

        <div className="space-y-3">
          <h1 
            style={{ 
              textShadow: "0 0 40px rgba(255, 122, 0, 0.12)" 
            }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#FFF7ED] uppercase tracking-tight leading-none font-sans"
          >
            EcoTwin
          </h1>
          <p className="text-[#FF8A00] font-mono text-xs sm:text-sm tracking-[0.18em] font-bold uppercase leading-none">
            Intelligent Urban Mobility & Carbon Intelligence
          </p>
          <p className="text-[#CBB9A6] font-sans text-sm sm:text-base font-normal leading-relaxed pt-2">
            Simulate microscopic traffic corridors, measure real-time environmental emissions, and optimize signals using SUMO-powered digital twins and PPO reinforcement learning policies.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
          <button
            onClick={onEnter}
            style={{
              background: "linear-gradient(135deg, #FF7A00, #FFB347)",
              color: "#160A02",
              boxShadow: "0 8px 24px rgba(255, 122, 0, 0.25)"
            }}
            className="px-6 py-3.5 rounded-xl text-[10px] tracking-wider uppercase font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(255,138,0,0.35)] active:translate-y-0 flex items-center justify-center gap-2 border-none cursor-pointer"
          >
            <span>Enter Operations Center</span>
            <ArrowUpRight className="h-4.5 w-4.5" />
          </button>
          
          <button
            onClick={() => navigate("/simulation")}
            style={{
              borderColor: "rgba(255, 179, 71, 0.25)"
            }}
            className="bg-transparent hover:bg-[#FF8A00]/10 hover:border-[#FF8A00]/40 text-[#FFF7ED] border rounded-xl px-6 py-3.5 text-[10px] font-bold tracking-wider uppercase transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Run Simulation</span>
            <Play className="h-3.5 w-3.5 text-[#FFB347]" />
          </button>
        </div>
      </div>

      {/* Right Column: Visual Product Viewport Mockup */}
      <div className="flex-1 w-full lg:max-w-xl z-10 relative">
        <div 
          style={{
            background: "rgba(25, 20, 16, 0.7)",
            borderColor: "rgba(255, 184, 77, 0.2)",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(255, 122, 0, 0.05)"
          }}
          className="relative border rounded-[22px] overflow-hidden p-2 backdrop-blur-md"
        >
          {/* Scanline pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] pointer-events-none z-10 opacity-30" />
          
          {/* Main Visual Image */}
          <div className="relative rounded-[16px] overflow-hidden aspect-video border border-white/5 bg-[#120D09]">
            <img 
              src="/images/ecotwin-twin-viewport.png" 
              alt="Digital Twin Operations Preview" 
              className="w-full h-full object-cover select-none filter contrast-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#120D09]/80 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Micro Telemetry HUD Labels */}
          <div className="absolute top-5 left-5 right-5 flex justify-between items-center z-20 pointer-events-none">
            <span className="px-2.5 py-1 bg-[#120D09]/90 border border-[#FFB84D]/25 rounded-md text-[#FFB84D] font-mono text-[8px] uppercase tracking-wider font-extrabold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF8A00] animate-ping" />
              Live digital twin
            </span>
            <span className="px-2.5 py-1 bg-[#120D09]/90 border border-white/5 rounded-md text-[#FFF7ED] font-mono text-[8px] uppercase tracking-wider font-extrabold">
              SUMO ENGINE
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2.5 font-mono text-[8px] uppercase text-[#FFF7ED]">
            <div className="bg-[#120D09]/80 border border-white/5 p-2 rounded-xl flex flex-col justify-center">
              <span className="text-[#A89582] text-[7px] font-bold">MUTATOR</span>
              <span className="font-extrabold text-[#FF8A00] mt-0.5 flex items-center gap-1">
                <Terminal className="h-2.5 w-2.5" /> TRACI API
              </span>
            </div>
            <div className="bg-[#120D09]/80 border border-white/5 p-2 rounded-xl flex flex-col justify-center">
              <span className="text-[#A89582] text-[7px] font-bold">COGNITION</span>
              <span className="font-extrabold text-[#FF8A00] mt-0.5 flex items-center gap-1">
                <Cpu className="h-2.5 w-2.5" /> PPO RL AGENT
              </span>
            </div>
            <div className="bg-[#120D09]/80 border border-white/5 p-2 rounded-xl flex flex-col justify-center font-mono">
              <span className="text-[#A89582] text-[7px] font-bold">SIM TIME</span>
              <span className="font-extrabold text-[#FF8A00] mt-0.5">
                ACTIVE telemetry
              </span>
            </div>
          </div>
        </div>

        {/* Ambient Glow behind mockup */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-[#FF8A00]/20 to-[#FFB84D]/10 rounded-[24px] blur-2xl opacity-40 -z-10 pointer-events-none" />
      </div>
    </section>
  );
}

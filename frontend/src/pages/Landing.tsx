import { useState, useEffect } from "react";
import { Leaf, ArrowDown, ArrowUpRight, Cpu, Layers, Terminal, Activity } from "lucide-react";
import { useSimulationStore } from "../store/simulationStore";
import { useQuery } from "@tanstack/react-query";
import { getSystemReadiness } from "../api/health";

interface LandingProps {
  onEnter: () => void;
}

export default function Landing({ onEnter }: LandingProps) {
  const [activeSection, setActiveSection] = useState(0);
  const wsState = useSimulationStore();

  // Scrollspy to track the active section index (0 to 7)
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const height = window.innerHeight;
      const index = Math.min(Math.floor((scrollPos + height * 0.45) / height), 7);
      setActiveSection(index);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToStoryboard = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  // REST API status query
  const { data: isReady } = useQuery<{ status: string }, Error>({
    queryKey: ["apiReadyLanding"],
    queryFn: getSystemReadiness,
    refetchInterval: 10000,
  });

  const sections = [
    { id: "hero", label: "Overview" },
    { id: "city", label: "01 City" },
    { id: "simulate", label: "02 Simulate" },
    { id: "observe", label: "03 Observe" },
    { id: "measure", label: "04 Measure" },
    { id: "learn", label: "05 Learn" },
    { id: "optimize", label: "06 Optimize" },
    { id: "operate", label: "07 Operate" }
  ];

  return (
    <div className="relative min-h-screen w-screen bg-[#050505] text-text-cream overflow-x-hidden font-sans select-none">
      
      {/* Fixed Background Image Layer */}
      <div 
        className="fixed inset-0 bg-cover bg-center transition-transform duration-10000 ease-out scale-105 pointer-events-none z-0 opacity-40 filter brightness-[0.35]"
        style={{ 
          backgroundImage: `url('/images/ecotwin-city-hero.png')`,
        }}
      />
      
      {/* Dark layers and warm brown filters */}
      <div className="fixed inset-0 bg-gradient-to-t from-[#050505] via-[#080706]/80 to-black/60 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(58,33,16,0.18),transparent_70%)] pointer-events-none z-0" />
      
      {/* Global Scrollable Storyboard Wrap */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen w-full max-w-7xl mx-auto px-8 md:px-12">
        
        {/* Fixed Header */}
        <header className="fixed top-0 left-0 right-0 z-50 px-12 py-8 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <Leaf className="h-5 w-5 text-brand-orange stroke-[2.5] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] font-bold text-text-cream">EcoTwin</span>
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${isReady ? "bg-[#39D98A] shadow-[0_0_8px_#39D98A]" : "bg-brand-orange shadow-[0_0_8px_#FF8A00] animate-pulse"}`} />
            <span className="text-[9px] font-mono text-text-muted tracking-wider uppercase bg-[#18110B]/80 border border-brand-orange/15 px-3 py-1 rounded-full backdrop-blur-md">
              {isReady ? "SYSTEM READY" : "CONNECTING API"}
            </span>
          </div>
        </header>

        {/* Sticky vertical dots navigator */}
        <div className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-4 font-mono text-[9px] font-bold tracking-widest text-text-muted">
          {sections.map((sec, idx) => {
            const isActive = activeSection === idx;
            const isCompleted = activeSection > idx;
            return (
              <div 
                key={sec.id} 
                className="flex items-center gap-3 cursor-pointer transition-colors duration-300"
                onClick={() => window.scrollTo({ top: idx * window.innerHeight, behavior: "smooth" })}
              >
                <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                  isActive 
                    ? "bg-brand-orange scale-150 shadow-[0_0_8px_#FF8A00]" 
                    : isCompleted 
                      ? "bg-brand-amber" 
                      : "bg-[#512A0D]"
                }`} />
                <span className={isActive ? "text-brand-orange" : "opacity-0 hover:opacity-100"}>
                  {sec.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Two-Column Story Panel Layout */}
        <div className="flex flex-col lg:flex-row gap-12 w-full pt-20">
          
          {/* Left Panel: Scrolling story sections */}
          <div className="flex-1 space-y-0 relative z-10">
            
            {/* HERO SECTION */}
            <div className="min-h-screen flex flex-col justify-center py-12 space-y-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-[9px] font-bold text-brand-amber uppercase tracking-[0.25em] w-max animate-pulse">
                <span>Urban Carbon Intelligence</span>
              </div>

              <div className="space-y-4">
                <h1 
                  className="text-6xl md:text-7xl font-black text-text-cream tracking-tight font-sans leading-none"
                  style={{ textShadow: "0 0 60px rgba(255,138,0,0.12)" }}
                >
                  TEACHING THE CITY<br/>
                  <span className="text-brand-orange">TO MOVE SMARTER.</span>
                </h1>
                <p className="text-text-pale text-sm md:text-base leading-relaxed max-w-xl">
                  An AI-powered urban digital twin that simulates traffic, understands emissions and learns how intelligent control can improve city mobility.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 max-w-md">
                <button
                  onClick={onEnter}
                  className="px-8 py-3.5 rounded-full hover:scale-105 duration-200 text-xs font-bold tracking-widest select-none bg-brand-orange hover:bg-brand-bright text-[#050505] shadow-lg shadow-orange-950/20 uppercase flex items-center justify-center gap-2"
                >
                  <span>Enter Operations Center</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <button
                  onClick={handleScrollToStoryboard}
                  className="px-8 py-3.5 rounded-full hover:scale-105 duration-200 text-xs font-semibold tracking-widest select-none bg-transparent border border-brand-orange/30 text-text-peach hover:bg-brand-orange/10 flex items-center gap-2 justify-center"
                >
                  <span>Explore Digital Twin</span>
                  <ArrowDown className="h-4 w-4 text-brand-amber" />
                </button>
              </div>

              {/* Status block indicators */}
              <div className="pt-8 border-t border-[rgba(255,183,106,0.12)] max-w-lg grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${isReady ? "bg-[#39D98A] shadow-[0_0_8px_#39D98A]" : "bg-brand-orange animate-pulse"}`} />
                  <span>System Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${wsState.sumoStatus === "healthy" ? "bg-[#39D98A]" : "bg-[#8D7868]/40"}`} />
                  <span>SUMO Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${wsState.traciStatus === "healthy" ? "bg-[#39D98A]" : "bg-[#8D7868]/40"}`} />
                  <span>Traci Link</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${wsState.ppoStatus === "healthy" ? "bg-[#39D98A]" : "bg-[#8D7868]/40"}`} />
                  <span>PPO Model</span>
                </div>
              </div>
            </div>

            {/* SECTION 01: CITY */}
            <div className="min-h-screen flex flex-col justify-center py-12">
              <div 
                className="p-8 border border-brand-orange/15 space-y-4 max-w-xl shadow-2xl rounded-[20px] transition-all duration-300"
                style={{ background: "rgba(18, 12, 8, 0.55)", backdropFilter: "blur(12px)" }}
              >
                <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-brand-orange uppercase tracking-widest">
                  <span>SECTION 01</span>
                  <span>●</span>
                  <span>THE SYSTEM</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-text-cream font-sans">Every city is a system.</h3>
                <p className="text-xs text-text-pale leading-relaxed font-sans">
                  Urban corridors operate as complex arterial grids. Traffic delays propagate waves of congestion, increasing local carbon density and delaying vital transit lines. Reconstructing the city requires viewing it as an interconnected grid.
                </p>
              </div>
            </div>

            {/* SECTION 02: SIMULATE */}
            <div className="min-h-screen flex flex-col justify-center py-12">
              <div 
                className="p-8 border border-brand-orange/15 space-y-4 max-w-xl shadow-2xl rounded-[20px] transition-all duration-300"
                style={{ background: "rgba(18, 12, 8, 0.55)", backdropFilter: "blur(12px)" }}
              >
                <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-brand-orange uppercase tracking-widest">
                  <span>SECTION 02</span>
                  <span>●</span>
                  <span>MICRO-SIMULATION</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-text-cream font-sans">Reconstruct traffic at microscopic resolution.</h3>
                <p className="text-xs text-text-pale leading-relaxed font-sans">
                  EcoTwin models vehicle movements down to the individual car level in SUMO. Real-time acceleration, lane changing, and deceleration equations simulate the physics of a living city.
                </p>
              </div>
            </div>

            {/* SECTION 03: OBSERVE */}
            <div className="min-h-screen flex flex-col justify-center py-12">
              <div 
                className="p-8 border border-brand-orange/15 space-y-4 max-w-xl shadow-2xl rounded-[20px] transition-all duration-300"
                style={{ background: "rgba(18, 12, 8, 0.55)", backdropFilter: "blur(12px)" }}
              >
                <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-brand-orange uppercase tracking-widest">
                  <span>SECTION 03</span>
                  <span>●</span>
                  <span>LIVE TELEMETRY</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-text-cream font-sans">Understand vehicles, speed, waiting time and congestion.</h3>
                <p className="text-xs text-text-pale leading-relaxed font-sans">
                  Extract deep parameters continuously. TraCI APIs trace cumulative waiting time, queue lengths, average velocity vectors, and blockages on every intersection lane.
                </p>

                {/* Live indicators */}
                <div className="grid grid-cols-3 gap-3 border-t border-[rgba(255,183,106,0.12)] pt-4 font-mono text-xs">
                  <div className="bg-[#050505] p-3 rounded-xl border border-brand-orange/15 text-center">
                    <span className="text-[8px] text-text-muted block uppercase font-bold">Vehicles</span>
                    <span className="font-bold text-brand-orange mt-1 block font-mono">
                      {wsState.running ? wsState.totalVehicles : "1,722"}
                    </span>
                  </div>
                  <div className="bg-[#050505] p-3 rounded-xl border border-brand-orange/15 text-center">
                    <span className="text-[8px] text-text-muted block uppercase font-bold">Avg Speed</span>
                    <span className="font-bold text-brand-orange mt-1 block font-mono">
                      {wsState.running ? `${wsState.averageSpeed.toFixed(1)} km/h` : "38.4 km/h"}
                    </span>
                  </div>
                  <div className="bg-[#050505] p-3 rounded-xl border border-brand-orange/15 text-center">
                    <span className="text-[8px] text-text-muted block uppercase font-bold">Wait Time</span>
                    <span className="font-bold text-brand-orange mt-1 block font-mono">
                      {wsState.running ? `${wsState.averageWaitingTime.toFixed(1)} s` : "12.8 s"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 04: MEASURE */}
            <div className="min-h-screen flex flex-col justify-center py-12">
              <div 
                className="p-8 border border-brand-orange/15 space-y-4 max-w-xl shadow-2xl rounded-[20px] transition-all duration-300"
                style={{ background: "rgba(18, 12, 8, 0.55)", backdropFilter: "blur(12px)" }}
              >
                <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-brand-orange uppercase tracking-widest">
                  <span>SECTION 04</span>
                  <span>●</span>
                  <span>ENVIRONMENT</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-text-cream font-sans">Translate traffic into environmental impact.</h3>
                <p className="text-xs text-text-pale leading-relaxed font-sans">
                  Calculate environmental impacts in real-time. Compute dynamic CO₂ rates, NOx emissions, and fuel consumption to identify localized high-pollution hotspot corridors.
                </p>
              </div>
            </div>

            {/* SECTION 05: LEARN */}
            <div className="min-h-screen flex flex-col justify-center py-12">
              <div 
                className="p-8 border border-brand-orange/15 space-y-4 max-w-xl shadow-2xl rounded-[20px] transition-all duration-300"
                style={{ background: "rgba(18, 12, 8, 0.55)", backdropFilter: "blur(12px)" }}
              >
                <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-brand-orange uppercase tracking-widest">
                  <span>SECTION 05</span>
                  <span>●</span>
                  <span>PPO REINFORCEMENT LEARNING</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-text-cream font-sans">Use reinforcement learning to discover better control policies.</h3>
                <p className="text-xs text-text-pale leading-relaxed font-sans">
                  Deploy deep reinforcement learning agents. Proximal Policy Optimization (PPO) policies observe queues and occupations, dynamically selecting signal phase overrides to balance vehicular flow with emissions.
                </p>
              </div>
            </div>

            {/* SECTION 06: OPTIMIZE */}
            <div className="min-h-screen flex flex-col justify-center py-12">
              <div 
                className="p-8 border border-brand-orange/15 space-y-4 max-w-xl shadow-2xl rounded-[20px] transition-all duration-300"
                style={{ background: "rgba(18, 12, 8, 0.55)", backdropFilter: "blur(12px)" }}
              >
                <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-brand-orange uppercase tracking-widest">
                  <span>SECTION 06</span>
                  <span>●</span>
                  <span>EVALUATION</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-text-cream font-sans">Compare intelligent control against the baseline.</h3>
                <p className="text-xs text-text-pale leading-relaxed font-sans">
                  Evaluate real-world optimization indexes. Quantify average delay cuts and fuel savings of the trained neural agent policy compared directly against a fixed-time cycle baseline.
                </p>
              </div>
            </div>

            {/* SECTION 07: OPERATE (Final CTA) */}
            <div className="min-h-screen flex flex-col justify-center py-12 space-y-6">
              <div 
                className="p-8 border border-brand-orange/15 space-y-6 max-w-xl shadow-2xl rounded-[24px]"
                style={{ background: "rgba(18, 12, 8, 0.65)", backdropFilter: "blur(16px)" }}
              >
                <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-brand-orange uppercase tracking-widest">
                  <span>SECTION 07</span>
                  <span>●</span>
                  <span>DEPLOY PLATFORM</span>
                </div>
                <h3 className="text-3xl font-black uppercase text-text-cream font-sans leading-none">
                  Bring the entire digital twin into one command center.
                </h3>
                <p className="text-xs text-text-pale leading-relaxed font-sans">
                  EcoTwin transforms traffic simulation into actionable smart city intelligence. Monitor grids, inspect vehicles, and control signal overrides.
                </p>
                <button
                  onClick={onEnter}
                  className="w-full py-4 rounded-xl text-xs font-bold tracking-widest select-none bg-brand-orange hover:bg-brand-bright text-[#050505] shadow-lg shadow-orange-950/20 uppercase"
                >
                  Enter Operations Center
                </button>
              </div>
            </div>

          </div>

          {/* Right Panel: Sticky Glass Viewport */}
          <div className="hidden lg:block lg:w-1/2 relative">
            <div 
              className="sticky top-[12vh] h-[72vh] w-full rounded-[24px] overflow-hidden border shadow-[0_30px_100px_rgba(0,0,0,0.7)] select-none flex flex-col justify-between"
              style={{
                background: "rgba(18, 12, 8, 0.35)",
                borderColor: "rgba(255, 183, 106, 0.18)",
                backdropFilter: "blur(18px)"
              }}
            >
              {/* Overlay scanlines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[size:100%_4px] pointer-events-none z-10 opacity-30" />
              
              {/* Inner viewport image */}
              <img 
                src="/images/ecotwin-twin-viewport.png" 
                alt="Digital Twin Viewport" 
                className="absolute inset-0 w-full h-full object-cover filter blur-[0.5px] opacity-75 transition-all duration-700 scale-105"
                style={
                  activeSection > 0
                    ? { filter: "blur(0px)", transform: "scale(1.0)", opacity: 0.9 }
                    : {}
                }
              />

              {/* Top Viewport Header */}
              <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center font-mono text-[9px] uppercase tracking-widest">
                <span className="px-3 py-1 bg-[#050505]/75 border border-brand-orange/20 rounded-md text-brand-amber font-bold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-orange animate-ping" />
                  Live Digital Twin Viewport
                </span>
                <span className="px-3 py-1 bg-[#050505]/75 border border-white/5 rounded-md text-text-cream font-bold">
                  Active Frame: 0{activeSection + 1}
                </span>
              </div>

              {/* Bottom Viewport Metadata */}
              <div className="absolute bottom-4 left-4 right-4 z-20 grid grid-cols-4 gap-2 font-mono text-[8px] uppercase text-text-cream">
                <div className="bg-[#050505]/80 border border-white/5 p-2 rounded-md flex flex-col justify-center">
                  <span className="text-text-muted text-[7px] font-bold">Simulator</span>
                  <span className="font-bold text-brand-orange mt-0.5 flex items-center gap-1">
                    <Layers className="h-2.5 w-2.5" /> SUMO
                  </span>
                </div>
                <div className="bg-[#050505]/80 border border-white/5 p-2 rounded-md flex flex-col justify-center">
                  <span className="text-text-muted text-[7px] font-bold">API MUTATOR</span>
                  <span className="font-bold text-brand-orange mt-0.5 flex items-center gap-1">
                    <Terminal className="h-2.5 w-2.5" /> TraCI
                  </span>
                </div>
                <div className="bg-[#050505]/80 border border-white/5 p-2 rounded-md flex flex-col justify-center">
                  <span className="text-text-muted text-[7px] font-bold">COGNITION</span>
                  <span className="font-bold text-brand-orange mt-0.5 flex items-center gap-1">
                    <Cpu className="h-2.5 w-2.5" /> PPO RL
                  </span>
                </div>
                <div className="bg-[#050505]/80 border border-white/5 p-2 rounded-md flex flex-col justify-center">
                  <span className="text-text-muted text-[7px] font-bold">SIM TIME</span>
                  <span className="font-bold text-brand-orange mt-0.5 flex items-center gap-1 font-mono">
                    <Activity className="h-2.5 w-2.5" /> {wsState.running ? `${wsState.simulationTime.toFixed(1)}s` : "0.0s"}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

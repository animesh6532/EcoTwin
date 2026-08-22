import { useState, useEffect } from "react";
import { Leaf, Info, ArrowDown } from "lucide-react";
import { useSimulationStore } from "../store/simulationStore";

interface LandingProps {
  onEnter: () => void;
}

export default function Landing({ onEnter }: LandingProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const wsState = useSimulationStore();

  // Scrollspy to track the active section index (0-8)
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const height = window.innerHeight;
      const index = Math.min(Math.floor((scrollPos + height * 0.45) / height), 8);
      setActiveSection(index);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToWorkflow = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  const sections = [
    { id: "hero", label: "Hero" },
    { id: "problem", label: "The Problem" },
    { id: "twin", label: "The Digital Twin" },
    { id: "telemetry", label: "Traffic Telemetry" },
    { id: "carbon", label: "Carbon footprints" },
    { id: "rl", label: "Agent Policies" },
    { id: "workflow", label: "System Pipeline" },
    { id: "command", label: "Operations Center" },
    { id: "enter", label: "Deploy Command" }
  ];

  return (
    <div className="relative min-h-screen w-screen bg-[#090909] text-[#FFF3E5] overflow-x-hidden font-sans select-none">
      
      {/* Fixed Cinematic Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center transition-transform duration-10000 ease-out scale-105 pointer-events-none"
        style={{ 
          backgroundImage: `url('/images/ecotwin-city-hero.png')`,
        }}
      />
      {/* Layered vignette, black overlay, and warm brown gradients */}
      <div className="fixed inset-0 bg-gradient-to-t from-[#090909] via-[#0D0B09]/80 to-black/45 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(58,33,16,0.18),transparent_70%)] pointer-events-none z-0" />
      
      {/* Scrollable Storyboard Wrapper */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen w-full max-w-7xl mx-auto px-8 md:px-12">
        
        {/* Fixed Header */}
        <header className="fixed top-0 left-0 right-0 z-50 px-12 py-8 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <Leaf className="h-5 w-5 text-[#FF8A00] stroke-[2.5]" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] font-bold text-[#FFF3E5]">EcoTwin</span>
          </div>
          <span className="pointer-events-auto text-[10px] font-mono text-[#9A8575] tracking-wider uppercase bg-[#17120F]/80 border border-[#75451A]/30 px-3 py-1 rounded-full backdrop-blur-md">
            v1.0.0 Stable
          </span>
        </header>

        {/* Desktop Vertical Progress dots (Sticky sidebar) */}
        <div className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-4 font-mono text-[9px] font-bold tracking-widest text-[#9A8575]">
          {sections.map((sec, idx) => {
            const isActive = activeSection === idx;
            const isCompleted = activeSection > idx;
            return (
              <div 
                key={sec.id} 
                className="flex items-center gap-2 cursor-pointer transition-colors duration-300"
                onClick={() => window.scrollTo({ top: idx * window.innerHeight, behavior: "smooth" })}
              >
                <span className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  isActive 
                    ? "bg-[#FF8A00] scale-125 shadow-[0_0_8px_#FF8A00]" 
                    : isCompleted 
                      ? "bg-[#FFB84D]" 
                      : "bg-[#4A2810]"
                }`} />
                <span className={isActive ? "text-[#FF8A00]" : "opacity-0 hover:opacity-100"}>
                  0{idx + 1} {sec.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Two-Column Main Story Board Layout */}
        <div className="flex flex-col lg:flex-row gap-12 w-full pt-28">
          
          {/* LEFT Column: Scrolling Storyboard Content Cards (flex-1) */}
          <div className="flex-1 space-y-0">
            
            {/* SECTION 01: HERO */}
            <div className="min-h-screen flex flex-col justify-center py-12 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E06C00]/10 border border-[#E06C00]/30 text-[10px] font-bold text-[#FFB84D] uppercase tracking-[0.2em] w-max animate-pulse">
                <span>Urban Carbon Intelligence</span>
              </div>

              <div className="space-y-4">
                <h1 
                  className="text-6xl md:text-8xl font-black text-[#FFF3E5] tracking-tight font-sans"
                  style={{ textShadow: "0 0 50px rgba(255,138,0,0.18)" }}
                >
                  ECOTWIN
                </h1>
                <p className="text-[#FFD2A3] text-sm md:text-base font-medium tracking-wide max-w-xl font-mono uppercase">
                  AN AI-POWERED DIGITAL TWIN FOR INTELLIGENT TRAFFIC AND URBAN EMISSION CONTROL
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 max-w-md">
                <button
                  onClick={onEnter}
                  className="px-8 py-3.5 rounded-full hover:scale-105 duration-200 text-sm font-bold tracking-wider select-none bg-[#FF8A00] hover:bg-[#FFA347] text-[#090909] shadow-lg shadow-orange-950/20"
                >
                  Enter Operations Center
                </button>
                <button
                  onClick={handleScrollToWorkflow}
                  className="px-8 py-3.5 rounded-full hover:scale-105 duration-200 text-sm font-semibold tracking-wider select-none bg-transparent border border-[rgba(255,163,71,0.45)] text-[#FFE7CC] hover:bg-[rgba(255,138,0,0.15)] flex items-center gap-2 justify-center"
                >
                  <span>Explore Workflow</span>
                  <ArrowDown className="h-4 w-4 text-[#FFB84D]" />
                </button>
              </div>
            </div>

            {/* SECTION 02: THE PROBLEM */}
            <div className="min-h-screen flex flex-col justify-center py-12">
              <div className="p-8 glass-panel border border-[#75451A]/20 space-y-6 max-w-xl shadow-2xl">
                <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-[#FF8A00] uppercase tracking-widest">
                  <span>01</span>
                  <span>●</span>
                  <span>The Challenge</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-[#FFF3E5]">Microscopic Congestion Pools</h3>
                <p className="text-sm text-[#FFD2A3] leading-relaxed">
                  Traditional fixed traffic cycles are blind to real-time spatial bottlenecks. Micro-congestion pools aggregate toxic emissions, increasing carbon concentration levels in close residential proximity.
                </p>
              </div>
            </div>

            {/* SECTION 03: THE DIGITAL TWIN */}
            <div className="min-h-screen flex flex-col justify-center py-12">
              <div className="p-8 glass-panel border border-[#75451A]/20 space-y-6 max-w-xl shadow-2xl">
                <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-[#FF8A00] uppercase tracking-widest">
                  <span>02</span>
                  <span>●</span>
                  <span>Micro-Simulation</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-[#FFF3E5]">Intelligent Network Replication</h3>
                <p className="text-sm text-[#FFD2A3] leading-relaxed">
                  EcoTwin replicates urban grid intersections inside SUMO at space-continuous resolutions. The environment simulates realistic driver parameters and models traffic flow accurately.
                </p>
              </div>
            </div>

            {/* SECTION 04: TRAFFIC TELEMETRY */}
            <div className="min-h-screen flex flex-col justify-center py-12">
              <div className="p-8 glass-panel border border-[#75451A]/20 space-y-6 max-w-xl shadow-2xl">
                <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-[#FF8A00] uppercase tracking-widest">
                  <span>03</span>
                  <span>●</span>
                  <span>Live Telemetry</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-[#FFF3E5]">Continuous Telemetry Sockets</h3>
                <p className="text-sm text-[#FFD2A3] leading-relaxed">
                  Streams live telemetry values from active sessions via TraCI connections. Parses queues, speeds, and wait delays continuously.
                </p>

                {/* Real-time telemetry indicators */}
                <div className="grid grid-cols-3 gap-3 border-t border-[#75451A]/10 pt-4 font-mono text-xs">
                  <div className="bg-[#11100E] p-3 rounded border border-[#75451A]/10 text-center">
                    <span className="text-[9px] text-[#9A8575] block uppercase">Vehicles</span>
                    <span className="font-bold text-[#FFF3E5] mt-1 block">
                      {wsState.running ? wsState.totalVehicles : "1,722"}
                    </span>
                  </div>
                  <div className="bg-[#11100E] p-3 rounded border border-[#75451A]/10 text-center">
                    <span className="text-[9px] text-[#9A8575] block uppercase">Avg Speed</span>
                    <span className="font-bold text-[#FFF3E5] mt-1 block">
                      {wsState.running ? `${wsState.averageSpeed.toFixed(1)} km/h` : "38.4 km/h"}
                    </span>
                  </div>
                  <div className="bg-[#11100E] p-3 rounded border border-[#75451A]/10 text-center">
                    <span className="text-[9px] text-[#9A8575] block uppercase">Wait Time</span>
                    <span className="font-bold text-[#FFF3E5] mt-1 block">
                      {wsState.running ? `${wsState.averageWaitingTime.toFixed(1)} s` : "12.8 s"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 05: CARBON INTELLIGENCE */}
            <div className="min-h-screen flex flex-col justify-center py-12">
              <div className="p-8 glass-panel border border-[#75451A]/20 space-y-6 max-w-xl shadow-2xl">
                <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-[#FF8A00] uppercase tracking-widest">
                  <span>04</span>
                  <span>●</span>
                  <span>Carbon footprint</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-[#FFF3E5]">High-Fidelity Emission Models</h3>
                <p className="text-sm text-[#FFD2A3] leading-relaxed">
                  Quantifies carbon footprints dynamically. Computes CO₂ (Carbon Dioxide), NOx (Nitrogen Oxides) rates, and fuel consumption to locate hotspot corridors.
                </p>
              </div>
            </div>

            {/* SECTION 06: REINFORCEMENT LEARNING */}
            <div className="min-h-screen flex flex-col justify-center py-12">
              <div className="p-8 glass-panel border border-[#75451A]/20 space-y-6 max-w-xl shadow-2xl">
                <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-[#FF8A00] uppercase tracking-widest">
                  <span>05</span>
                  <span>●</span>
                  <span>Agent Policies</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-[#FFF3E5]">Deep Reinforcement Learning</h3>
                <p className="text-sm text-[#FFD2A3] leading-relaxed">
                  Uses PPO policy agents to adapt signal patterns. The policy balances vehicular throughput parameters with carbon dispersion objectives.
                </p>
              </div>
            </div>

            {/* SECTION 07: WORKFLOW PIPELINE CONNECTION TREE */}
            <div className="min-h-screen flex flex-col justify-center py-12">
              <div className="p-8 glass-panel border border-[#75451A]/20 space-y-6 max-w-xl shadow-2xl">
                <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-[#FF8A00] uppercase tracking-widest">
                  <span>06</span>
                  <span>●</span>
                  <span>System Architecture</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-[#FFF3E5]">Operations Pipeline Flow</h3>
                
                {/* Visual Architecture tree */}
                <div className="space-y-3 font-mono text-[10px] text-text-secondary pt-3">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="px-2 py-1 bg-white/5 border border-[#75451A]/25 rounded text-white">SUMO Simulator</span>
                    <span className="text-[#FF8A00]">→</span>
                    <span className="px-2 py-1 bg-white/5 border border-[#75451A]/25 rounded text-white">TraCI Mutator</span>
                    <span className="text-[#FF8A00]">→</span>
                    <span className="px-2 py-1 bg-white/5 border border-[#75451A]/25 rounded text-white">Telemetry</span>
                  </div>
                  <div className="text-[#FF8A00] pl-6 font-bold">↓</div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="px-2 py-1 bg-[#11100E] border border-[#75451A]/30 rounded text-[#FFD2A3]">Emission Engine</span>
                    <span className="text-[#FF8A00]">→</span>
                    <span className="px-2 py-1 bg-[#FF8A00]/10 border border-[#FF8A00]/30 rounded text-[#FF8A00]">PPO Optimizer</span>
                    <span className="text-[#FF8A00]">→</span>
                    <span className="px-2 py-1 bg-[#FF8A00] text-black font-bold rounded">Command Console</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 08: OPERATIONS CENTER */}
            <div className="min-h-screen flex flex-col justify-center py-12">
              <div className="p-8 glass-panel border border-[#75451A]/20 space-y-6 max-w-xl shadow-2xl">
                <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-[#FF8A00] uppercase tracking-widest">
                  <span>07</span>
                  <span>●</span>
                  <span>Deploy command</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-[#FFF3E5]">Operations Digital Twin</h3>
                <p className="text-sm text-[#FFD2A3] leading-relaxed">
                  Review baseline comparisons, examine system diagnostic parameters, and deploy active overrides directly within the operations center.
                </p>
              </div>
            </div>

            {/* SECTION 09: ENTER ECOTWIN (Final CTA) */}
            <div className="min-h-screen flex flex-col justify-center py-12 space-y-8">
              <div className="p-8 glass-panel border border-[#75451A]/20 space-y-6 max-w-xl shadow-2xl">
                <h3 className="text-3xl font-black uppercase text-[#FFF3E5] leading-tight font-sans">
                  READY TO OPERATE THE CITY?
                </h3>
                <p className="text-sm text-[#FFD2A3] leading-relaxed">
                  EcoTwin turns traffic simulation into actionable urban intelligence.
                </p>
                <div className="pt-4">
                  <button
                    onClick={onEnter}
                    className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wider select-none bg-[#FF8A00] hover:bg-[#FFA347] text-[#090909] shadow-lg shadow-orange-950/20 uppercase"
                  >
                    Enter Operations Center
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT Column: Sticky Floating Digital Twin Viewport (flex-1 / lg:w-1/2) */}
          <div className="hidden lg:block lg:w-1/2 relative">
            <div className="sticky top-[15vh] h-[70vh] w-full rounded-[24px] overflow-hidden border border-[#75451A]/35 shadow-[0_30px_100px_rgba(0,0,0,0.65)] select-none">
              
              {/* Glass frame reflection and scanline overlays */}
              <div className="absolute inset-0 bg-[#1e120c]/25 backdrop-blur-[16px] z-0" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] pointer-events-none z-10 opacity-30" />
              
              {/* Floating inner digital-twin image */}
              <img 
                src="/images/ecotwin-twin-viewport.png" 
                alt="Digital Twin Viewport" 
                className="w-full h-full object-cover filter blur-[1px] opacity-80 relative z-0 scale-105 transition-all duration-700"
                style={
                  activeSection > 0
                    ? { filter: "blur(0.5px)", transform: "scale(1.0)" }
                    : {}
                }
              />
              
              {/* Dynamic Overlay glow */}
              <div 
                className="absolute inset-0 pointer-events-none z-10 border border-[#FF8A00]/20 rounded-[24px] transition-opacity duration-500"
                style={{ opacity: activeSection % 2 === 0 ? 0.3 : 0 }}
              />

              {/* Status Badge in viewport */}
              <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/60 border border-[#75451A]/40 rounded font-mono text-[9px] uppercase tracking-widest text-[#FFB84D]">
                SIMULATION VIEWPORT ● SEC 0{activeSection + 1}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Info Modal Overlay */}
      {showInfo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="glass-panel max-w-md w-full p-8 space-y-6 relative border border-[#75451A]/30 shadow-2xl">
            <h3 className="text-lg font-bold text-[#FFF3E5] flex items-center gap-2">
              <Info className="h-5 w-5 text-[#FF8A00]" /> Digital Twin Specifications
            </h3>
            
            <div className="space-y-4 text-xs text-[#FFD2A3] leading-relaxed font-mono">
              <p>
                <strong>EcoTwin</strong> couples real-time microscopic traffic simulations in SUMO with state-of-the-art Deep Reinforcement Learning (PPO).
              </p>
              <div className="border-t border-white/5 pt-3 space-y-2">
                <div>• <strong>Emissions Tracker</strong>: Carbon Dioxide (CO₂) and Nitrogen Oxides (NOx) spatial dispersion fields.</div>
                <div>• <strong>Traffic Optimization</strong>: Dynamic traffic phase override logic via TraCI callbacks.</div>
                <div>• <strong>Analytics Hub</strong>: Comparative baseline vs agent run metric assessments.</div>
              </div>
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors border border-white/10"
            >
              Return to Launch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

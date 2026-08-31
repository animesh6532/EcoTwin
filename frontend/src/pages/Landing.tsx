import { useState, useEffect } from "react";
import { Leaf, ArrowUpRight, Cpu, Terminal } from "lucide-react";
import { useSimulationStore } from "../store/simulationStore";
import { useQuery } from "@tanstack/react-query";
import { getSystemReadiness } from "../api/health";

interface LandingProps {
  onEnter: () => void;
  navigate: (path: string) => void;
}

export default function Landing({ onEnter, navigate }: LandingProps) {
  const [activeSection, setActiveSection] = useState(0);
  const wsState = useSimulationStore();

  // Scrollspy to track active section (0 to 7)
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

  const headerNavLinks = [
    { label: "Overview", path: "/overview" },
    { label: "Simulation", path: "/simulation" },
    { label: "Traffic", path: "/traffic" },
    { label: "Carbon", path: "/carbon" },
    { label: "RL Control", path: "/rl" },
    { label: "Analytics", path: "/analytics" },
    { label: "Compare", path: "/compare" },
    { label: "Insights", path: "/insights" },
    { label: "Health", path: "/health" },
    { label: "Settings", path: "/settings" }
  ] as const;

  return (
    <div className="relative min-h-screen w-screen bg-[#120D09] text-[#D6C3AE] overflow-x-hidden font-sans select-none">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-delay-0 { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0ms forwards; opacity: 0; }
        .animate-delay-100 { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 100ms forwards; opacity: 0; }
        .animate-delay-200 { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 200ms forwards; opacity: 0; }
        .animate-delay-300 { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 300ms forwards; opacity: 0; }
        .animate-delay-450 { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 450ms forwards; opacity: 0; }
      `}</style>

      {/* Fixed cinematic background image */}
      <div
        className="fixed inset-0 bg-cover bg-center transition-transform duration-10000 ease-out scale-105 pointer-events-none z-0 opacity-45 filter brightness-[0.5] contrast-[1.02]"
        style={{
          backgroundImage: `url('/images/ecotwin-city-hero.png')`,
          backgroundAttachment: "fixed"
        }}
      />

      {/* Controlled dark gradient overlays (The city remains visible) */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            linear-gradient(to bottom, rgba(5, 8, 12, 0.35), rgba(18, 12, 7, 0.28)),
            radial-gradient(circle at 50% 50%, rgba(255, 138, 0, 0.05), transparent 75%)
          `
        }}
      />

      {/* Scrollable storyboard container */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen w-full max-w-7xl mx-auto px-8 md:px-12">

        {/* Floating landing-page navbar */}
        <header className="fixed top-6 left-8 right-8 z-50 flex items-center justify-between pointer-events-none max-w-7xl mx-auto">
          <div
            style={{
              background: "rgba(8, 7, 6, 0.72)",
              borderColor: "rgba(255, 145, 40, 0.20)",
              backdropFilter: "blur(22px)",
              boxShadow: "0 15px 50px rgba(0,0,0,0.45)",
              borderRadius: "28px"
            }}
            className="w-full flex items-center justify-between pointer-events-auto border rounded-[28px] px-8 py-3.5"
          >
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0 border-r border-[rgba(255,184,77,0.15)] pr-5">
              <Leaf className="h-5 w-5 text-[#FF8A00] stroke-[2.5] animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-[0.3em] font-bold text-[#FFF7ED]">EcoTwin</span>
            </div>

            {/* Dashboard Links */}
            <nav className="hidden lg:flex items-center gap-4 text-xs font-semibold tracking-wide text-[#A9947D]">
              {headerNavLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="hover:text-[#FFF7ED] transition-colors duration-200"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Primary Action */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1.5 font-mono text-[9px] font-bold text-[#A9947D] bg-[#120D09]/45 border border-white/5 px-3 py-1.5 rounded-full">
                <span className={`h-1.5 w-1.5 rounded-full ${isReady ? "bg-[#22C55E] shadow-[0_0_8px_#22C55E]" : "bg-[#FFB84D] animate-pulse"}`} />
                <span>{isReady ? "SYSTEM READY" : "CONNECTING"}</span>
              </div>

              <button
                onClick={onEnter}
                style={{
                  background: "#FF8A00",
                  color: "#050505",
                  borderRadius: "12px",
                  fontWeight: 700,
                  boxShadow: "0 0 15px rgba(255, 138, 0, 0.3)"
                }}
                className="px-5 py-2.5 text-[10px] tracking-widest uppercase transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,138,0,0.35)] active:translate-y-0"
              >
                ENTER OPERATIONS CENTER
              </button>
            </div>
          </div>
        </header>

        {/* Sticky vertical progress dots */}
        <div className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-4 font-mono text-[9px] font-bold tracking-widest text-[#A9947D]">
          {sections.map((sec, idx) => {
            const isActive = activeSection === idx;
            const isCompleted = activeSection > idx;
            return (
              <div
                key={sec.id}
                className="flex items-center gap-3 cursor-pointer transition-colors duration-300"
                onClick={() => window.scrollTo({ top: idx * window.innerHeight, behavior: "smooth" })}
              >
                <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${isActive
                    ? "bg-[#FF8A00] scale-150 shadow-[0_0_8px_#FF8A00]"
                    : isCompleted
                      ? "bg-[#FFB84D]"
                      : "bg-[#24150B]"
                  }`} />
                <span className={isActive ? "text-[#FF8A00]" : "opacity-0 hover:opacity-100"}>
                  {sec.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Two-Column Story Board */}
        <div className="flex flex-col lg:flex-row gap-12 w-full pt-32">

          {/* Left panel storyboard */}
          <div className="flex-1 space-y-0 relative z-10">

            {/* HERO SECTION */}
            <div className="min-h-screen flex flex-col justify-center py-12 space-y-8">
              <div className="animate-delay-0 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF8A00]/10 border border-[#FF8A00]/20 text-[9px] font-bold text-[#FFB84D] uppercase tracking-[0.25em] w-max">
                <span>[ SYSTEM ACTIVE ]</span>
              </div>

              <div className="space-y-4">
                <h1
                  className="animate-delay-100 font-black text-[#FFF7ED] tracking-tight font-sans leading-none"
                  style={{
                    fontSize: "clamp(64px, 10vw, 150px)",
                    textShadow: "0 0 60px rgba(255,122,0,0.12)"
                  }}
                >
                  ECOTWIN
                </h1>
                <p className="animate-delay-100 text-[#FF8A00] font-mono text-sm tracking-[0.2em] font-bold uppercase">
                  URBAN CARBON INTELLIGENCE
                </p>
                <p className="animate-delay-200 text-[#D6C3AE] font-sans text-lg md:text-xl font-normal leading-relaxed max-w-xl">
                  An AI-powered digital twin that learns how traffic control can move people efficiently while actively reducing urban pollution.
                </p>
              </div>

              <div className="animate-delay-300 flex flex-col sm:flex-row gap-4 pt-4 max-w-lg">
                <button
                  onClick={onEnter}
                  style={{
                    background: "linear-gradient(135deg, #FF7A00, #FFB347)",
                    color: "#160A02",
                    borderRadius: "12px",
                    fontWeight: 700,
                    padding: "14px 28px",
                    boxShadow: "0 8px 25px rgba(255, 122, 0, 0.25)"
                  }}
                  className="text-xs tracking-widest uppercase transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_15px_45px_rgba(255,138,0,0.4)] active:translate-y-0 flex items-center justify-center gap-2 border-none"
                >
                  <span>ENTER OPERATIONS CENTER</span>
                  <ArrowUpRight className="h-4.5 w-4.5" />
                </button>

                <button
                  onClick={() => navigate("/insights")}
                  style={{
                    borderRadius: "12px",
                    padding: "14px 28px",
                    border: "1px solid rgba(255,179,71,0.25)"
                  }}
                  className="bg-transparent text-[#FFF7ED] backdrop-blur-[12px] text-xs font-bold tracking-widest uppercase transition-all duration-200 hover:-translate-y-[3px] hover:bg-[#FF8A00]/10 hover:border-[#FF8A00]/40 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>EXPLORE PROJECT</span>
                  <ArrowUpRight className="h-4.5 w-4.5 text-[#FFB347]" />
                </button>
              </div>

              {/* Animated System Pipeline Flow */}
              <div className="animate-delay-450 pt-8 border-t border-[rgba(255,145,40,0.16)] max-w-xl">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#9D8C7B] block mb-4 font-mono">System Architecture Pipeline</span>
                <div className="flex items-center justify-between gap-1 md:gap-2 font-mono text-[9px] font-bold text-[#FFF7ED]">

                  {/* Traffic */}
                  <div className="flex flex-col items-center bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg w-20 text-center relative">
                    <span className="text-[#FFB347]">TRAFFIC</span>
                  </div>

                  {/* Connector Arrow */}
                  <span className="text-[#9D8C7B] animate-pipeline-arrow" style={{ animationDelay: "0s" }}>→</span>

                  {/* SUMO */}
                  <div className="flex flex-col items-center bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg w-20 text-center relative">
                    <span className="text-[#FF8A00]">SUMO</span>
                  </div>

                  <span className="text-[#9D8C7B] animate-pipeline-arrow" style={{ animationDelay: "0.4s" }}>→</span>

                  {/* TRACI */}
                  <div className="flex flex-col items-center bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg w-20 text-center relative">
                    <span className="text-[#FFB347]">TRACI</span>
                  </div>

                  <span className="text-[#9D8C7B] animate-pipeline-arrow" style={{ animationDelay: "0.8s" }}>→</span>

                  {/* AI / PPO */}
                  <div className="flex flex-col items-center bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg w-20 text-center relative">
                    <span className="text-[#FF8A00]">AI / PPO</span>
                  </div>

                  <span className="text-[#9D8C7B] animate-pipeline-arrow" style={{ animationDelay: "1.2s" }}>→</span>

                  {/* OPTIMIZATION */}
                  <div className="flex flex-col items-center bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg w-22 text-center relative">
                    <span className="text-[#FFB347]">OPTIMIZE</span>
                  </div>

                  <span className="text-[#9D8C7B] animate-pipeline-arrow" style={{ animationDelay: "1.6s" }}>→</span>

                  {/* CARBON */}
                  <div className="flex flex-col items-center bg-[#FF8A00]/10 border border-[#FF8A00]/30 px-2.5 py-1.5 rounded-lg w-22 text-center relative shadow-[0_0_15px_rgba(255,122,0,0.15)] animate-pulse">
                    <span className="text-[#FFB347]">CARBON</span>
                  </div>

                </div>
              </div>
            </div>

            {/* SECTION 01: CITY */}
            <div className="min-h-screen flex flex-col justify-center py-12">
              <div
                className="p-8 border space-y-4 max-w-xl shadow-2xl rounded-[20px] transition-all duration-300"
                style={{ background: "rgba(25, 20, 16, 0.72)", borderColor: "rgba(255, 184, 77, 0.20)", backdropFilter: "blur(20px) saturate(120%)" }}
              >
                <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-[#FF8A00] uppercase tracking-widest">
                  <span>SECTION 01</span>
                  <span>●</span>
                  <span>THE SYSTEM</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-[#FFF7ED] font-sans">Every city is a system.</h3>
                <p className="text-xs text-[#D6C3AE] leading-relaxed font-sans font-normal">
                  Urban corridors operate as complex arterial grids. Traffic delays propagate waves of congestion, increasing local carbon density and delaying vital transit lines. Reconstructing the city requires viewing it as an interconnected grid.
                </p>
              </div>
            </div>

            {/* SECTION 02: SIMULATE */}
            <div className="min-h-screen flex flex-col justify-center py-12">
              <div
                className="p-8 border space-y-4 max-w-xl shadow-2xl rounded-[20px] transition-all duration-300"
                style={{ background: "rgba(25, 20, 16, 0.72)", borderColor: "rgba(255, 184, 77, 0.20)", backdropFilter: "blur(20px) saturate(120%)" }}
              >
                <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-[#FF8A00] uppercase tracking-widest">
                  <span>SECTION 02</span>
                  <span>●</span>
                  <span>MICRO-SIMULATION</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-[#FFF7ED] font-sans">Reconstruct traffic at microscopic resolution.</h3>
                <p className="text-xs text-[#D6C3AE] leading-relaxed font-sans font-normal">
                  EcoTwin models vehicle movements down to the individual car level in SUMO. Real-time acceleration, lane changing, and deceleration equations simulate the physics of a living city.
                </p>
              </div>
            </div>

            {/* SECTION 03: OBSERVE */}
            <div className="min-h-screen flex flex-col justify-center py-12">
              <div
                className="p-8 border space-y-4 max-w-xl shadow-2xl rounded-[20px] transition-all duration-300"
                style={{ background: "rgba(25, 20, 16, 0.72)", borderColor: "rgba(255, 184, 77, 0.20)", backdropFilter: "blur(20px) saturate(120%)" }}
              >
                <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-[#FF8A00] uppercase tracking-widest">
                  <span>SECTION 03</span>
                  <span>●</span>
                  <span>LIVE TELEMETRY</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-[#FFF7ED] font-sans">Understand vehicles, speed, waiting time and congestion.</h3>
                <p className="text-xs text-[#D6C3AE] leading-relaxed font-sans font-normal">
                  Extract deep parameters continuously. TraCI APIs trace cumulative waiting time, queue lengths, average velocity vectors, and blockages on every intersection lane.
                </p>

                {/* Live indicators */}
                <div className="grid grid-cols-3 gap-3 border-t border-[rgba(255,184,77,0.16)] pt-4 font-mono text-xs">
                  <div className="bg-[#120D09]/80 p-3 rounded-xl border border-[#FFB84D]/16 text-center">
                    <span className="text-[8px] text-[#A9947D] block uppercase font-bold">Vehicles</span>
                    <span className="font-bold text-[#FF8A00] mt-1 block font-mono">
                      {wsState.running ? wsState.totalVehicles : "1,722"}
                    </span>
                  </div>
                  <div className="bg-[#120D09]/80 p-3 rounded-xl border border-[#FFB84D]/16 text-center">
                    <span className="text-[8px] text-[#A9947D] block uppercase font-bold">Avg Speed</span>
                    <span className="font-bold text-[#FF8A00] mt-1 block font-mono">
                      {wsState.running ? `${wsState.averageSpeed.toFixed(1)} km/h` : "38.4 km/h"}
                    </span>
                  </div>
                  <div className="bg-[#120D09]/80 p-3 rounded-xl border border-[#FFB84D]/16 text-center">
                    <span className="text-[8px] text-[#A9947D] block uppercase font-bold">Wait Time</span>
                    <span className="font-bold text-[#FF8A00] mt-1 block font-mono">
                      {wsState.running ? `${wsState.averageWaitingTime.toFixed(1)} s` : "12.8 s"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 04: MEASURE */}
            <div className="min-h-screen flex flex-col justify-center py-12">
              <div
                className="p-8 border space-y-4 max-w-xl shadow-2xl rounded-[20px] transition-all duration-300"
                style={{ background: "rgba(25, 20, 16, 0.72)", borderColor: "rgba(255, 184, 77, 0.20)", backdropFilter: "blur(20px) saturate(120%)" }}
              >
                <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-[#FF8A00] uppercase tracking-widest">
                  <span>SECTION 04</span>
                  <span>●</span>
                  <span>ENVIRONMENT</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-[#FFF7ED] font-sans">Translate traffic into environmental impact.</h3>
                <p className="text-xs text-[#D6C3AE] leading-relaxed font-sans font-normal">
                  Calculate environmental impacts in real-time. Compute dynamic CO₂ rates, NOx emissions, and fuel consumption to identify localized high-pollution hotspot corridors.
                </p>
              </div>
            </div>

            {/* SECTION 05: LEARN */}
            <div className="min-h-screen flex flex-col justify-center py-12">
              <div
                className="p-8 border space-y-4 max-w-xl shadow-2xl rounded-[20px] transition-all duration-300"
                style={{ background: "rgba(25, 20, 16, 0.72)", borderColor: "rgba(255, 184, 77, 0.20)", backdropFilter: "blur(20px) saturate(120%)" }}
              >
                <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-[#FF8A00] uppercase tracking-widest">
                  <span>SECTION 05</span>
                  <span>●</span>
                  <span>PPO REINFORCEMENT LEARNING</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-[#FFF7ED] font-sans">Use reinforcement learning to discover better control policies.</h3>
                <p className="text-xs text-[#D6C3AE] leading-relaxed font-sans font-normal">
                  Deploy deep reinforcement learning agents. Proximal Policy Optimization (PPO) policies observe queues and occupations, dynamically selecting signal phase overrides to balance vehicular flow with emissions.
                </p>
              </div>
            </div>

            {/* SECTION 06: OPTIMIZE */}
            <div className="min-h-screen flex flex-col justify-center py-12">
              <div
                className="p-8 border space-y-4 max-w-xl shadow-2xl rounded-[20px] transition-all duration-300"
                style={{ background: "rgba(25, 20, 16, 0.72)", borderColor: "rgba(255, 184, 77, 0.20)", backdropFilter: "blur(20px) saturate(120%)" }}
              >
                <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-[#FF8A00] uppercase tracking-widest">
                  <span>SECTION 06</span>
                  <span>●</span>
                  <span>EVALUATION</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-[#FFF7ED] font-sans">Compare intelligent control against the baseline.</h3>
                <p className="text-xs text-[#D6C3AE] leading-relaxed font-sans font-normal">
                  Evaluate real-world optimization indexes. Quantify average delay cuts and fuel savings of the trained neural agent policy compared directly against a fixed-time cycle baseline.
                </p>
              </div>
            </div>

            {/* SECTION 07: OPERATE (Final CTA) */}
            <div className="min-h-screen flex flex-col justify-center py-12 space-y-6">
              <div
                className="p-8 border space-y-6 max-w-xl shadow-2xl rounded-[24px]"
                style={{ background: "rgba(25, 20, 16, 0.72)", borderColor: "rgba(255, 184, 77, 0.20)", backdropFilter: "blur(20px) saturate(120%)" }}
              >
                <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-[#FF8A00] uppercase tracking-widest">
                  <span>SECTION 07</span>
                  <span>●</span>
                  <span>DEPLOY PLATFORM</span>
                </div>
                <h3 className="text-3xl font-black uppercase text-[#FFF7ED] font-sans leading-none">
                  Bring the entire digital twin into one command center.
                </h3>
                <p className="text-xs text-[#D6C3AE] leading-relaxed font-sans font-normal">
                  EcoTwin transforms traffic simulation into actionable smart city intelligence. Monitor grids, inspect vehicles, and control signal overrides.
                </p>

                <button
                  onClick={onEnter}
                  style={{
                    background: "#FF8A00",
                    color: "#050505",
                    borderRadius: "12px",
                    fontWeight: 700,
                    boxShadow: "0 0 20px rgba(255, 138, 0, 0.25)"
                  }}
                  className="w-full py-4 text-xs tracking-widest transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_15px_45px_rgba(255,138,0,0.4)] active:translate-y-0 uppercase border-none cursor-pointer"
                >
                  ENTER OPERATIONS CENTER
                </button>
              </div>
            </div>

          </div>

          {/* Right Panel: Sticky Glass Viewport */}
          <div className="hidden lg:block lg:w-1/2 relative">
            <div
              className="sticky top-[15vh] h-[70vh] w-full rounded-[24px] overflow-hidden border shadow-[0_30px_100px_rgba(0,0,0,0.7)] select-none flex flex-col justify-between"
              style={{
                background: "rgba(25, 20, 16, 0.72)",
                borderColor: "rgba(255, 184, 77, 0.20)",
                backdropFilter: "blur(20px) saturate(120%)"
              }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[size:100%_4px] pointer-events-none z-10 opacity-30" />

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

              <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center font-mono text-[9px] uppercase tracking-widest">
                <span className="px-3 py-1 bg-[#120D09]/80 border border-[#FFB84D]/20 rounded-md text-[#FFB84D] font-bold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF8A00] animate-ping" />
                  Live digital twin
                </span>
                <span className="px-3 py-1 bg-[#120D09]/80 border border-white/5 rounded-md text-[#FFF7ED] font-bold">
                  SUMO
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 z-20 grid grid-cols-3 gap-2 font-mono text-[8px] uppercase text-[#FFF7ED]">
                <div className="bg-[#120D09]/80 border border-white/5 p-2 rounded-md flex flex-col justify-center">
                  <span className="text-[#A9947D] text-[7px] font-bold">MUTATOR</span>
                  <span className="font-bold text-[#FF8A00] mt-0.5 flex items-center gap-1">
                    <Terminal className="h-2.5 w-2.5" /> TRACI
                  </span>
                </div>
                <div className="bg-[#120D09]/80 border border-white/5 p-2 rounded-md flex flex-col justify-center">
                  <span className="text-[#A9947D] text-[7px] font-bold">COGNITION</span>
                  <span className="font-bold text-[#FF8A00] mt-0.5 flex items-center gap-1">
                    <Cpu className="h-2.5 w-2.5" /> PPO RL
                  </span>
                </div>
                <div className="bg-[#120D09]/80 border border-white/5 p-2 rounded-md flex flex-col justify-center font-mono">
                  <span className="text-[#A9947D] text-[7px] font-bold">SIM TIME</span>
                  <span className="font-bold text-[#FF8A00] mt-0.5">
                    {wsState.running ? `${wsState.simulationTime.toFixed(1)}s` : "0.0s"}
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

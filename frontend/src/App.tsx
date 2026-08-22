import { useState } from "react";
import FloatingNav, { PageId } from "./components/layout/FloatingNav";
import SystemStatusBar from "./components/layout/SystemStatusBar";
import Overview from "./pages/Overview";
import Simulation from "./pages/Simulation";
import TrafficNetwork from "./pages/TrafficNetwork";
import CarbonIntelligence from "./pages/CarbonIntelligence";
import ReinforcementLearning from "./pages/ReinforcementLearning";
import Analytics from "./pages/Analytics";
import Experiments from "./pages/Experiments";
import SystemHealth from "./pages/SystemHealth";
import Settings from "./pages/Settings";
import Landing from "./pages/Landing";
import { useWebSocket } from "./hooks/useWebSocket";

export default function App() {
  const [isEntered, setIsEntered] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageId>("overview");

  // Automatically start WebSocket connection
  useWebSocket();

  const renderActivePage = () => {
    switch (currentPage) {
      case "overview":
        return <Overview />;
      case "simulation":
        return <Simulation />;
      case "traffic":
        return <TrafficNetwork />;
      case "carbon":
        return <CarbonIntelligence />;
      case "rl":
        return <ReinforcementLearning />;
      case "analytics":
        return <Analytics />;
      case "experiments":
        return <Experiments />;
      case "health":
        return <SystemHealth />;
      case "settings":
        return <Settings />;
      default:
        return <Overview />;
    }
  };

  if (!isEntered) {
    return <Landing onEnter={() => setIsEntered(true)} />;
  }

  return (
    <div className="min-h-screen w-screen bg-[#090909] text-[#FFF3E5] antialiased font-sans overflow-x-hidden relative flex flex-col justify-between">
      {/* Cinematic grid lines and atmospheric radial glow background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(224,108,0,0.06),transparent_45%)] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

      <div className="flex-1 flex flex-col z-10 w-full relative">
        {/* Floating Capsule Header Container */}
        <header className="w-full flex items-center justify-center pt-6 px-8 sticky top-0 z-50 pointer-events-none">
          <div 
            style={{ 
              background: "rgba(20,12,8,0.78)", 
              borderColor: "rgba(255,163,71,0.18)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
            }}
            className="w-full max-w-7xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 pointer-events-auto border rounded-[28px] px-8 py-3.5"
          >
            <FloatingNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <SystemStatusBar />
          </div>
        </header>

        {/* Page Content Scroll Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-8 relative">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

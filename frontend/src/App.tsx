import { useState, useEffect } from "react";
import FloatingNav from "./components/layout/FloatingNav";
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
import { BackgroundLayer } from "./components/layout/BackgroundLayer";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Reactive URL tracking
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  // Start WebSocket conditionally on dashboard views
  useWebSocket(currentPath);

  const renderActivePage = () => {
    switch (currentPath) {
      case "/overview":
        return <Overview />;
      case "/simulation":
        return <Simulation />;
      case "/traffic":
        return <TrafficNetwork />;
      case "/carbon":
        return <CarbonIntelligence />;
      case "/rl":
        return <ReinforcementLearning />;
      case "/analytics":
        return <Analytics />;
      case "/compare":
        return <Experiments />;
      case "/health":
        return <SystemHealth />;
      case "/settings":
        return <Settings />;
      default:
        return <Overview />;
    }
  };

  // Render Landing page on primary path '/'
  if (currentPath === "/") {
    return <Landing onEnter={() => navigate("/overview")} navigate={navigate} />;
  }

  return (
    <div 
      className="min-h-screen w-screen text-[#D6C3AE] antialiased font-sans overflow-x-hidden relative flex flex-col justify-between"
      style={{
        background: `
          radial-gradient(circle at 15% 10%, rgba(255,138,0,0.10), transparent 30%),
          radial-gradient(circle at 85% 20%, rgba(255,184,77,0.08), transparent 30%),
          linear-gradient(135deg, #120D09, #17130F, #0E0E0E)
        `
      }}
    >
      {/* Cinematic background map and overlays */}
      <BackgroundLayer />

      <div className="flex-1 flex flex-col z-10 w-full relative">
        {/* Floating Header capsule */}
        <header className="w-full flex items-center justify-center pt-6 px-8 sticky top-0 z-50 pointer-events-none">
          <div 
            style={{ 
              background: "rgba(18, 13, 9, 0.55)", 
              borderColor: "rgba(255, 184, 77, 0.15)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 80px rgba(0,0,0,0.5)"
            }}
            className="w-full max-w-7xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 pointer-events-auto border rounded-[28px] px-8 py-3.5"
          >
            <FloatingNav currentPath={currentPath} navigate={navigate} />
            <SystemStatusBar />
          </div>
        </header>

        {/* Page Content scroll layout */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-8 relative">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

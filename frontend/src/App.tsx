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
    <div className="min-h-screen w-screen text-[#E8D7C5] antialiased font-sans overflow-x-hidden relative flex flex-col justify-between bg-[#050505]">
      {/* Cinematic background map and overlays */}
      <BackgroundLayer />

      <div className="flex-1 flex flex-col z-10 w-full relative">
        {/* Floating Header capsule (Navbar) */}
        <header className="w-full flex items-center justify-center pt-6 px-8 sticky top-0 z-50 pointer-events-none">
          <div 
            style={{ 
              background: "rgba(8, 7, 6, 0.72)", 
              borderColor: "rgba(255, 145, 40, 0.20)",
              backdropFilter: "blur(22px)",
              boxShadow: "0 15px 50px rgba(0, 0, 0, 0.45)",
              borderRadius: "28px"
            }}
            className="w-full max-w-7xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 pointer-events-auto border px-8 py-3.5"
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

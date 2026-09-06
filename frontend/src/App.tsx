import { useState, useEffect } from "react";
import GlobalHeader from "./components/layout/GlobalHeader";
import LocationOnboardingModal from "./components/layout/LocationOnboardingModal";
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
import ProjectInsights from "./pages/ProjectInsights";
import { useWebSocket } from "./hooks/useWebSocket";
import { BackgroundLayer } from "./components/layout/BackgroundLayer";
import { CursorGlow } from "./components/layout/CursorGlow";
import { useLocationStore } from "./store/locationStore";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { latitude, source, detectBrowserLocation } = useLocationStore();

  // Initial location detection on app launch if unresolved
  useEffect(() => {
    if (latitude === null && source === "UNRESOLVED") {
      detectBrowserLocation();
    }
  }, []);

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
      case "/insights":
        return <ProjectInsights />;
      case "/settings":
        return <Settings />;
      default:
        return <Overview />;
    }
  };

  // Render Landing page on primary path '/'
  if (currentPath === "/") {
    return (
      <>
        <CursorGlow />
        <Landing onEnter={() => navigate("/overview")} navigate={navigate} />
        <LocationOnboardingModal />
      </>
    );
  }

  return (
    <div 
      className="min-h-screen w-screen text-[#E8D7C5] antialiased font-sans overflow-x-hidden relative flex flex-col justify-between bg-[#050505]"
    >
      {/* Global cursor glow follow */}
      <CursorGlow />

      {/* Location Onboarding Modal */}
      <LocationOnboardingModal />

      {/* Cinematic background map and overlays */}
      <BackgroundLayer />

      <div className="flex-1 flex flex-col z-10 w-full relative">
        {/* Global Operations Header (Zone A: Brand, Zone B: Primary Nav, Zone C: Status & Telemetry) */}
        <GlobalHeader currentPath={currentPath} navigate={navigate} />

        {/* Page Content scroll layout */}
        <main className="flex-1 w-full max-w-[1720px] mx-auto px-4 md:px-8 py-6 md:py-8 relative">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}


import { useState } from "react";
import Sidebar, { PageId } from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Overview from "./pages/Overview";
import Simulation from "./pages/Simulation";
import TrafficNetwork from "./pages/TrafficNetwork";
import CarbonIntelligence from "./pages/CarbonIntelligence";
import ReinforcementLearning from "./pages/ReinforcementLearning";
import Analytics from "./pages/Analytics";
import Experiments from "./pages/Experiments";
import SystemHealth from "./pages/SystemHealth";
import Settings from "./pages/Settings";
import { useWebSocket } from "./hooks/useWebSocket";

export default function App() {
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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg">
      {/* Sidebar Navigation */}
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page content scroll container */}
        <main className="flex-1 overflow-y-auto p-8">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

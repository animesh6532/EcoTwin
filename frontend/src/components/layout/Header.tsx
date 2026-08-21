import { useSimulationStore } from "../../store/simulationStore";
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  Cpu, 
  Activity,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function Header() {
  const {
    connectionState,
    running,
    paused,
    simulationTime,
    controller,
    sumoStatus,
    traciStatus,
    ppoStatus,
  } = useSimulationStore();

  // Helper to render connection status badge
  const renderConnectionBadge = () => {
    switch (connectionState) {
      case "connected":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-eco-green/10 text-eco-green">
            <Wifi className="h-3.5 w-3.5" />
            <span>Connected</span>
          </span>
        );
      case "connecting":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-traffic-yellow/10 text-traffic-yellow animate-pulse">
            <Wifi className="h-3.5 w-3.5" />
            <span>Connecting</span>
          </span>
        );
      case "disconnected":
      case "error":
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-carbon-critical/10 text-carbon-critical">
            <WifiOff className="h-3.5 w-3.5" />
            <span>Offline</span>
          </span>
        );
    }
  };

  // Helper for simulation status
  const renderSimulationBadge = () => {
    if (!running) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border border-border bg-bg-secondary text-text-secondary">
          Stopped
        </span>
      );
    }
    if (paused) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border border-traffic-yellow/30 bg-traffic-yellow/5 text-traffic-yellow">
          Paused
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border border-eco-green/30 bg-eco-green/5 text-eco-green animate-pulse">
        Live
      </span>
    );
  };

  const formatTime = (time: number) => {
    return `${time.toFixed(1)}s`;
  };

  return (
    <header className="h-16 border-b border-border bg-white flex items-center justify-between px-8 z-10">
      {/* Simulation Info */}
      <div className="flex items-center gap-4">
        {renderConnectionBadge()}
        {renderSimulationBadge()}
        
        {/* Simulation Time */}
        <div className="flex items-center gap-1.5 text-sm text-text-secondary font-mono border-l border-border pl-4">
          <Clock className="h-4 w-4 text-text-muted" />
          <span className="text-text-muted">Time:</span>
          <span className="font-bold text-text-primary">{formatTime(simulationTime)}</span>
        </div>

        {/* Controller mode */}
        <div className="flex items-center gap-1.5 text-sm text-text-secondary border-l border-border pl-4">
          <Cpu className="h-4 w-4 text-text-muted" />
          <span className="text-text-muted">Controller:</span>
          <span className={`font-semibold uppercase ${controller === "ppo" ? "text-eco-green" : "text-text-secondary"}`}>
            {controller === "ppo" ? "RL Optimization (PPO)" : "Fixed-Time Cycle"}
          </span>
        </div>
      </div>

      {/* Component Statuses */}
      <div className="flex items-center gap-4 text-xs font-medium">
        <span className="text-text-muted font-sans text-xs flex items-center gap-1">
          <Activity className="h-3 w-3 text-text-muted" /> System Status:
        </span>
        
        {/* SUMO Status */}
        <span className="flex items-center gap-1">
          <span className="text-text-secondary">SUMO:</span>
          {sumoStatus === "healthy" ? (
            <CheckCircle className="h-3.5 w-3.5 text-eco-green" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 text-text-muted" />
          )}
        </span>

        {/* TraCI Status */}
        <span className="flex items-center gap-1 border-l border-border pl-3">
          <span className="text-text-secondary">TraCI:</span>
          {traciStatus === "healthy" ? (
            <CheckCircle className="h-3.5 w-3.5 text-eco-green" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 text-text-muted" />
          )}
        </span>

        {/* PPO Status */}
        <span className="flex items-center gap-1 border-l border-border pl-3">
          <span className="text-text-secondary">PPO:</span>
          {ppoStatus === "healthy" ? (
            <CheckCircle className="h-3.5 w-3.5 text-eco-green" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 text-text-muted" />
          )}
        </span>

        {/* User profile placeholder */}
        <div className="flex items-center border-l border-border pl-4 ml-2">
          <div className="h-8 w-8 rounded-full bg-eco-forest text-white font-bold text-sm flex items-center justify-center">
            OP
          </div>
        </div>
      </div>
    </header>
  );
}

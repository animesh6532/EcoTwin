import { useQuery } from "@tanstack/react-query";
import { useSimulationStore } from "../store/simulationStore";
import { getSystemHealth } from "../api/health";
import { Activity, CheckCircle2, AlertCircle, XCircle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function SystemHealth() {
  const wsState = useSimulationStore();
  
  const { data: healthData, isLoading, error, refetch } = useQuery({
    queryKey: ["systemHealthCheck"],
    queryFn: getSystemHealth,
    refetchInterval: 5000, // Poll every 5s
  });

  // Sync statuses with store for header badges
  useEffect(() => {
    if (healthData?.components) {
      useSimulationStore.getState().setSystemStatus({
        sumo: healthData.components.sumo,
        traci: healthData.components.traci,
        ppo: healthData.components.ppo,
      });
    }
  }, [healthData]);

  // Helper to render component status badges
  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "healthy":
      case "ready":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-eco-green/10 text-eco-green border border-eco-green/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Healthy</span>
          </span>
        );
      case "inactive":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-text-muted/10 text-text-muted border border-text-muted/20">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Inactive</span>
          </span>
        );
      case "warning":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-traffic-yellow/10 text-traffic-yellow border border-traffic-yellow/20">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Warning</span>
          </span>
        );
      case "error":
      case "unavailable":
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-carbon-critical/10 text-carbon-critical border border-carbon-critical/20">
            <XCircle className="h-3.5 w-3.5" />
            <span>Error</span>
          </span>
        );
    }
  };

  const getWebSocketStatusText = () => {
    switch (wsState.connectionState) {
      case "connected":
        return "healthy";
      case "connecting":
        return "warning";
      case "error":
        return "error";
      case "disconnected":
      default:
        return "inactive";
    }
  };

  const components = [
    {
      id: "api",
      name: "FastAPI Core Application Server",
      status: error ? "error" : (healthData?.components.api ?? "inactive"),
      description: "Handles HTTP REST routing, serves telemetry payloads, and coordinates lifecycle hooks.",
    },
    {
      id: "database",
      name: "Database Session Manager",
      status: error ? "error" : (healthData?.components.database ?? "inactive"),
      description: "Stores metrics snapshots, simulation session metadata, and historical evaluation trends.",
    },
    {
      id: "sumo",
      name: "SUMO Microscopic Traffic Engine",
      status: error ? "error" : (healthData?.components.sumo ?? "inactive"),
      description: "Micro-simulator running vehicle movements, lane models, and emission factors.",
    },
    {
      id: "traci",
      name: "TraCI TCP Client Connection Interface",
      status: error ? "error" : (healthData?.components.traci ?? "inactive"),
      description: "Bidirectional TCP socket interface connecting FastAPI app with active SUMO instances.",
    },
    {
      id: "ppo",
      name: "PPO Policy Inference Model",
      status: error ? "error" : (healthData?.components.ppo ?? "inactive"),
      description: "Loads the trained stable-baselines3 policy model checkpoint for traffic optimization.",
    },
    {
      id: "websocket",
      name: "WebSocket State Update Broker",
      status: getWebSocketStatusText(),
      description: "Pushes high-speed live simulation frame state updates to connected dashboard clients.",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">System Health Diagnostics</h1>
          <p className="text-text-secondary text-sm mt-1">
            Real-time status monitoring of microscopic simulator layers, models, and databases.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-bg-secondary text-text-primary border border-border shadow-sm rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh check</span>
        </button>
      </div>

      {error && (
        <div className="bg-carbon-critical/5 border border-carbon-critical/20 rounded-xl p-4 text-xs text-carbon-critical flex items-center gap-2 max-w-xl mx-auto">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Cannot query health endpoints. Please check if the FastAPI backend server is running on http://127.0.0.1:8000.</span>
        </div>
      )}

      {/* Grid of Components health */}
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-bg-secondary flex items-center gap-2">
          <Activity className="h-4.5 w-4.5 text-eco-green" />
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Health Diagnostics Dashboard</h3>
        </div>

        <div className="divide-y divide-border">
          {components.map((comp) => (
            <div key={comp.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-bg-secondary/20 transition-colors">
              <div className="space-y-1 md:max-w-2xl">
                <h4 className="font-bold text-text-primary text-sm">{comp.name}</h4>
                <p className="text-xs text-text-secondary leading-relaxed">{comp.description}</p>
              </div>
              
              <div className="shrink-0">
                {renderStatusBadge(comp.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

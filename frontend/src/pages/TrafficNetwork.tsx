import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSimulationStore } from "../store/simulationStore";
import { getTrafficLights, getTrafficLightDetail, setTrafficLightAction, getOverrideHistory } from "../api/trafficLights";
import { setRLMode } from "../api/rl";
import { TrafficLight } from "../types";
import { toast } from "../utils/toast";
import { useLocationStore } from "../store/locationStore";

import { TrafficHeader } from "../components/TrafficLights/TrafficHeader";
import { LocationControlPanel } from "../components/TrafficLights/LocationControlPanel";
import { NetworkKpiCards } from "../components/TrafficLights/NetworkKpiCards";
import { JunctionList } from "../components/TrafficLights/JunctionList";
import { JunctionDetailPanel } from "../components/TrafficLights/JunctionDetailPanel";
import { PhaseTimeline } from "../components/TrafficLights/PhaseTimeline";
import { SignalStateVisualizer } from "../components/TrafficLights/SignalStateVisualizer";
import { ControllerPanel } from "../components/TrafficLights/ControllerPanel";
import { TrafficFlowPanel } from "../components/TrafficLights/TrafficFlowPanel";
import { OverrideHistoryTable } from "../components/TrafficLights/OverrideHistoryTable";
import { ManualOverrideModal } from "../components/TrafficLights/ManualOverrideModal";
import { TrafficMap } from "../components/TrafficLights/TrafficMap";
import { LiveEventFeed, LogEvent } from "../components/TrafficLights/LiveEventFeed";
import { SumoDiagnosticPanel } from "../components/TrafficLights/SumoDiagnosticPanel";
import { GlassPanel } from "../components/glass/GlassPanel";
import { GlassButton } from "../components/glass/GlassButton";
import { AlertTriangle } from "lucide-react";

export default function TrafficNetwork() {
  const queryClient = useQueryClient();
  const wsState = useSimulationStore();

  const [selectedJunctionId, setSelectedJunctionId] = useState<string | null>(null);
  const [overrideModal, setOverrideModal] = useState<{
    isOpen: boolean;
    junctionId: string;
    targetPhaseIndex: number;
    currentPhaseIndex: number;
    targetPhaseName?: string;
    currentPhaseName?: string;
  }>({
    isOpen: false,
    junctionId: "",
    targetPhaseIndex: 0,
    currentPhaseIndex: 0,
  });

  const [overrideError, setOverrideError] = useState<string | null>(null);
  const [eventFeed, setEventFeed] = useState<LogEvent[]>([]);

  const lastPhaseRef = useRef<number | null>(null);
  const lastQueueRef = useRef<number | null>(null);

  // Location Store
  const {
    latitude,
    longitude,
    accuracy,
    loading: geoLoading,
    error: geoError,
    permissionStatus,
    detectBrowserLocation,
    clearLocation,
  } = useLocationStore();

  // Discover SUMO Junction IDs
  const { data: tlIds, isLoading: isLoadingTlList } = useQuery({
    queryKey: ["trafficLightsList"],
    queryFn: getTrafficLights,
    enabled: wsState.running,
    refetchInterval: wsState.running ? 5000 : false,
  });

  // Auto-select first discovered junction if none selected
  useEffect(() => {
    if (tlIds && tlIds.length > 0 && !selectedJunctionId) {
      setSelectedJunctionId(tlIds[0]);
    }
  }, [tlIds, selectedJunctionId]);

  // Query audit history log
  const { data: overrideHistoryLogs, isLoading: isLoadingHistory, refetch: refetchHistory } = useQuery({
    queryKey: ["overrideHistoryLogs"],
    queryFn: () => getOverrideHistory(20),
    refetchInterval: wsState.running ? 3000 : false,
  });

  // Selected junction query detail fallback (when not streamed via WS)
  const { data: queriedTlDetail } = useQuery({
    queryKey: ["trafficLightDetail", selectedJunctionId],
    queryFn: () => getTrafficLightDetail(selectedJunctionId!),
    enabled: !!selectedJunctionId && wsState.running,
    refetchInterval: wsState.running ? 1000 : false,
  });

  // Merge live WS junction data with query fallback
  const liveJunction: TrafficLight | null = React.useMemo(() => {
    if (!selectedJunctionId) return null;
    const wsMatch = wsState.trafficLights.find((t) => t.id === selectedJunctionId);
    if (wsMatch && wsMatch.phase_details) return wsMatch;
    if (queriedTlDetail) return queriedTlDetail;
    return null;
  }, [selectedJunctionId, wsState.trafficLights, queriedTlDetail]);

  // Track live events reactively
  useEffect(() => {
    if (!wsState.running) return;

    const newEvents: LogEvent[] = [];
    const nowStr = new Date().toLocaleTimeString();

    if (liveJunction) {
      if (lastPhaseRef.current !== null && lastPhaseRef.current !== liveJunction.active_phase) {
        newEvents.push({
          id: `phase-${Date.now()}`,
          timestamp: nowStr,
          junctionId: liveJunction.id,
          type: "PHASE_CHANGE",
          message: `Phase transition: ${liveJunction.active_phase_name || `Phase ${liveJunction.active_phase}`}`,
          detail: `Pattern: ${liveJunction.active_phase}`,
        });
      }
      lastPhaseRef.current = liveJunction.active_phase ?? 0;

      if (lastQueueRef.current !== null && Math.abs(lastQueueRef.current - (liveJunction.total_queue || 0)) >= 2) {
        newEvents.push({
          id: `queue-${Date.now()}`,
          timestamp: nowStr,
          junctionId: liveJunction.id,
          type: "QUEUE_ALERT",
          message: `Queue update: ${liveJunction.total_queue} vehicles in line`,
        });
      }
      lastQueueRef.current = liveJunction.total_queue || 0;
    }

    if (newEvents.length > 0) {
      setEventFeed((prev) => [...newEvents, ...prev].slice(0, 20));
    }
  }, [liveJunction?.active_phase, liveJunction?.total_queue, wsState.running]);

  // Full junction array for list view
  const junctionList: TrafficLight[] = React.useMemo(() => {
    if (wsState.trafficLights && wsState.trafficLights.length > 0) {
      return wsState.trafficLights;
    }
    if (tlIds && tlIds.length > 0) {
      return tlIds.map((id) => ({
        id,
        status: wsState.running ? "ACTIVE" : "OFFLINE",
        active_phase: liveJunction?.id === id ? liveJunction.active_phase : 0,
        active_phase_name: liveJunction?.id === id ? liveJunction.active_phase_name : "Phase 0",
        phases: liveJunction?.id === id ? liveJunction.phases : [],
        phase_details: liveJunction?.id === id ? liveJunction.phase_details : [],
        remaining_sec: liveJunction?.id === id ? liveJunction.remaining_sec : 0,
        elapsed_sec: liveJunction?.id === id ? liveJunction.elapsed_sec : 0,
        next_phase: liveJunction?.id === id ? liveJunction.next_phase : 1,
        next_phase_name: liveJunction?.id === id ? liveJunction.next_phase_name : "Phase 1",
        cycle_duration: liveJunction?.id === id ? liveJunction.cycle_duration : 90,
        total_vehicles: liveJunction?.id === id ? liveJunction.total_vehicles : 0,
        total_queue: liveJunction?.id === id ? liveJunction.total_queue : 0,
        average_speed: liveJunction?.id === id ? liveJunction.average_speed : 0,
        average_delay: liveJunction?.id === id ? liveJunction.average_delay : 0,
        signal_state: liveJunction?.id === id ? liveJunction.signal_state : { north: "RED", south: "RED", east: "RED", west: "RED" },
        approaches: liveJunction?.id === id ? liveJunction.approaches : [],
        controller: wsState.controller,
        timestamp: new Date().toISOString(),
      }));
    }
    return [];
  }, [wsState.trafficLights, tlIds, liveJunction, wsState.running, wsState.controller]);

  // Controller mode mutation
  const switchControllerMutation = useMutation({
    mutationFn: (mode: "fixed_time" | "ppo") => setRLMode({ controller_type: mode }),
    onSuccess: (data) => {
      wsState.setSimulationStatus({ controller: data.active_controller });
      toast(`Controller successfully set to ${data.active_controller.toUpperCase()}`, "success");
      setEventFeed((prev) => [
        {
          id: `ctrl-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          junctionId: selectedJunctionId || "center",
          type: "PPO_ACTION",
          message: `Controller mode changed to ${data.active_controller.toUpperCase()}`,
        },
        ...prev,
      ]);
    },
    onError: (err: any) => {
      toast(err.message || "Failed to switch controller mode", "error");
    },
  });

  // Manual Phase Action Mutation
  const applyOverrideMutation = useMutation({
    mutationFn: ({ junctionId, phaseIndex }: { junctionId: string; phaseIndex: number }) =>
      setTrafficLightAction(junctionId, phaseIndex, 30),
    onSuccess: (data) => {
      setOverrideModal((prev) => ({ ...prev, isOpen: false }));
      setOverrideError(null);
      refetchHistory();
      queryClient.invalidateQueries({ queryKey: ["trafficLightDetail"] });
      toast(`Manual Phase ${data.applied_phase} applied to Junction ${data.junction_id}`, "success");
    },
    onError: (err: any) => {
      setOverrideError(err.message || "Manual override rejected by safety validator.");
      refetchHistory();
    },
  });

  const handleOpenOverrideModal = (phaseIndex: number, phaseName?: string) => {
    if (!selectedJunctionId || !liveJunction) return;
    setOverrideError(null);
    setOverrideModal({
      isOpen: true,
      junctionId: selectedJunctionId,
      targetPhaseIndex: phaseIndex,
      currentPhaseIndex: liveJunction.active_phase ?? 0,
      targetPhaseName: phaseName,
      currentPhaseName: liveJunction.active_phase_name,
    });
  };

  const handleExecuteOverride = () => {
    applyOverrideMutation.mutate({
      junctionId: overrideModal.junctionId,
      phaseIndex: overrideModal.targetPhaseIndex,
    });
  };

  // Derive system health
  const systemHealth = {
    api: wsState.connectionState === "connected" ? "healthy" : "active",
    sumo: wsState.sumoStatus,
    traci: wsState.traciStatus,
    ppo: wsState.ppoStatus,
  };

  // Calculate live network totals
  const totalQueue = junctionList.reduce((acc, j) => acc + (j.total_queue || 0), 0);

  return (
    <div className="space-y-4 animate-fade-in text-text-cream pb-12">
      {/* 1. Page Header (Section 1) */}
      <TrafficHeader
        controllerMode={wsState.controller}
        simulationStatus={wsState.running ? "ACTIVE RUN" : "IDLE"}
        isWsConnected={wsState.connectionState === "connected"}
        systemHealth={systemHealth}
      />

      {/* 2. Live Operations Strip (Section 2) */}
      <NetworkKpiCards
        isRunning={wsState.running}
        activeVehicles={wsState.vehicleCount}
        averageSpeed={wsState.averageSpeed || wsState.metrics.average_speed}
        totalQueue={totalQueue}
        averageWaitingTime={wsState.averageWaitingTime || wsState.metrics.average_waiting_time}
        co2Rate={wsState.co2 || wsState.metrics.total_co2}
      />

      {/* 3. Location + Network Context Bar (Section 3) */}
      <LocationControlPanel
        latitude={latitude}
        longitude={longitude}
        accuracy={accuracy}
        loading={geoLoading}
        permissionState={permissionStatus}
        onDetectLocation={detectBrowserLocation}
      />


      {/* 4. Main Operations Center Workspace (2-Column Dashboard Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Junction Control Console (5 cols ~38%) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Discovered Junction Selector (Section 6) */}
          <JunctionList
            junctions={junctionList}
            selectedJunctionId={selectedJunctionId}
            onSelectJunction={setSelectedJunctionId}
            isLoading={isLoadingTlList}
            isRunning={wsState.running}
            controllerMode={wsState.controller}
          />

          {/* Real-time Intersection Signal Heads (Section 7) */}
          <GlassPanel className="p-4">
            <SignalStateVisualizer junction={liveJunction} />
          </GlassPanel>

          {/* 4-Directional Approach Traffic Flow Breakdown (Section 8) */}
          <GlassPanel className="p-4">
            <TrafficFlowPanel approaches={liveJunction?.approaches} isRunning={wsState.running} />
          </GlassPanel>

          {/* Intelligent RL Controller Decision Panel (Section 10) */}
          <GlassPanel className="p-4">
            <ControllerPanel
              currentController={wsState.controller}
              ppoStatusStr={wsState.ppoStatusStr}
              ppoReward={wsState.ppoReward}
              ppoLatencyMs={wsState.ppoLatencyMs}
              onSwitchController={(mode) => switchControllerMutation.mutate(mode)}
              isSwitching={switchControllerMutation.isPending}
              isRunning={wsState.running}
            />
          </GlassPanel>
        </div>

        {/* Right Column: Live SUMO Map & Operational Diagnostics (7 cols ~62%) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Interactive SUMO Traffic Map (Section 5) */}
          <TrafficMap
            userLat={latitude}
            userLng={longitude}
            userAccuracy={accuracy}
            junctions={junctionList}
            selectedJunctionId={selectedJunctionId}
            onSelectJunction={setSelectedJunctionId}
            vehicles={wsState.vehicles}
            isRunning={wsState.running}
          />

          {/* SUMO Simulator Diagnostic Engine (Section 12) */}
          <SumoDiagnosticPanel
            sumoStatus={wsState.sumoStatus}
            traciStatus={wsState.traciStatus}
            ppoStatus={wsState.ppoStatus}
            connectionState={wsState.connectionState}
            simulationTime={wsState.simulationTime}
            vehicleCount={wsState.vehicleCount}
            isRunning={wsState.running}
          />

          {/* Live Operational Event Feed Log (Section 11) */}
          <GlassPanel className="p-4">
            <LiveEventFeed events={eventFeed} isRunning={wsState.running} />
          </GlassPanel>

          {/* Selected Junction Detail Inspector & Manual Override Controls */}
          <GlassPanel className="p-5 space-y-6">
            <JunctionDetailPanel junction={liveJunction} controllerMode={wsState.controller} />

            {/* Manual Signal Phase Override Selector */}
            {liveJunction && (
              <div className="pt-5 border-t border-[rgba(255,183,106,0.12)] space-y-4 font-mono">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest">
                    MANUAL SIGNAL PHASE OVERRIDE SELECTOR
                  </h4>
                  {wsState.controller === "ppo" && (
                    <span className="text-[9px] px-2 py-0.5 rounded bg-brand-orange/10 text-brand-orange border border-brand-orange/20 font-bold uppercase">
                      RL Override Lock Active
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {liveJunction.phase_details && liveJunction.phase_details.length > 0 ? (
                    liveJunction.phase_details.map((phase) => {
                      const isCurrent = liveJunction.active_phase === phase.index;
                      return (
                        <div
                          key={phase.index}
                          className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2.5 transition-all ${
                            isCurrent
                              ? "bg-brand-orange/10 border-brand-orange/50 shadow-[0_0_15px_rgba(255,138,0,0.08)]"
                              : "bg-[#120D09]/50 border-[rgba(255,184,77,0.16)]"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-xs text-text-cream">Phase {phase.index}</span>
                              {isCurrent && (
                                <span className="px-2 py-0.5 bg-brand-orange/20 text-brand-orange text-[9px] font-bold rounded uppercase tracking-wide">
                                  Active Phase
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-text-pale font-sans leading-snug">{phase.name}</p>
                            <span className="font-mono text-[9px] text-[#A89582] block bg-[#120D09] px-2 py-0.5 border border-white/5 rounded max-w-max">
                              State: {phase.state_pattern}
                            </span>
                          </div>

                          <GlassButton
                            onClick={() => handleOpenOverrideModal(phase.index, phase.name)}
                            disabled={wsState.controller === "ppo" || isCurrent || !wsState.running}
                            variant={isCurrent ? "primary" : "secondary"}
                            size="sm"
                            className="w-full text-[10px] font-mono mt-1"
                            title={
                              wsState.controller === "ppo"
                                ? "Switch simulation to Baseline mode to issue manual phase overrides."
                                : isCurrent
                                ? "Junction is currently active on this phase."
                                : ""
                            }
                          >
                            {isCurrent ? "Phase Active" : "Override to Phase"}
                          </GlassButton>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-2 text-center py-4 text-xs text-text-muted border border-dashed border-white/10 rounded-xl">
                      No phase definitions loaded for this junction.
                    </div>
                  )}
                </div>

                {wsState.controller === "ppo" && (
                  <div className="flex items-center gap-2 p-2.5 bg-brand-orange/10 border border-brand-orange/20 rounded-xl text-brand-orange text-[10px] font-mono uppercase tracking-wider">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>PPO Optimization active. Switch controller to Baseline to manually override signals.</span>
                  </div>
                )}
              </div>
            )}

            {/* Signal Phase Timeline */}
            {liveJunction && (
              <div className="pt-5 border-t border-[rgba(255,183,106,0.12)]">
                <PhaseTimeline junction={liveJunction} />
              </div>
            )}
          </GlassPanel>

          {/* Manual Override Audit History Log Table */}
          <GlassPanel className="p-5">
            <OverrideHistoryTable logs={overrideHistoryLogs || []} isLoading={isLoadingHistory} />
          </GlassPanel>
        </div>
      </div>

      {/* Confirmation Modal for High-Risk Manual Override */}
      <ManualOverrideModal
        isOpen={overrideModal.isOpen}
        onClose={() => setOverrideModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleExecuteOverride}
        junctionId={overrideModal.junctionId}
        targetPhaseIndex={overrideModal.targetPhaseIndex}
        currentPhaseIndex={overrideModal.currentPhaseIndex}
        targetPhaseName={overrideModal.targetPhaseName}
        currentPhaseName={overrideModal.currentPhaseName}
        isPending={applyOverrideMutation.isPending}
        errorMessage={overrideError}
      />
    </div>
  );
}




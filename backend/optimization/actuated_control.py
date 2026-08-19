import traci
from backend.optimization.baseline_controller import BaseTrafficController
from backend.simulation.traffic_lights import TrafficLightsManager

class ActuatedController(BaseTrafficController):
    def __init__(self, tls_id: str):
        super().__init__(tls_id)
        self.current_phase = 0
        self.phase_timer = 0
        self.min_green = 10
        self.max_green = 50
        self.yellow_dur = 4

    def select_action(self, step: int) -> int:
        if not traci.isLoaded():
            return 0
            
        self.phase_timer += 1
        
        # Yellow phases are always fixed
        if self.current_phase in [1, 3]:
            if self.phase_timer >= self.yellow_dur:
                self.current_phase = (self.current_phase + 1) % 4
                self.phase_timer = 0
            return self.current_phase
            
        # Green phases (0 or 2)
        if self.phase_timer < self.min_green:
            return self.current_phase
            
        # Detect queues on conflicting lanes
        try:
            lanes = list(dict.fromkeys(traci.trafficlight.getControlledLanes(self.tls_id)))
            
            # Determine lane index mappings
            # If current phase is 0 (NS Green), we look at EW lanes (indices 2, 3 in 4-lane setup)
            conflict_halting = 0
            active_halting = 0
            
            if self.current_phase == 0:
                # NS active, EW conflict
                for i, lane in enumerate(lanes):
                    halting = traci.lane.getLastStepHaltingNumber(lane)
                    if i in [0, 1]:  # NS
                        active_halting += halting
                    else:  # EW
                        conflict_halting += halting
            else:
                # EW active, NS conflict
                for i, lane in enumerate(lanes):
                    halting = traci.lane.getLastStepHaltingNumber(lane)
                    if i in [2, 3]:  # EW
                        active_halting += halting
                    else:  # NS
                        conflict_halting += halting
                        
            # Switch criteria: green maximum reached OR (conflict queues and active lanes are clear)
            if self.phase_timer >= self.max_green or (conflict_halting > 2 and active_halting == 0):
                self.current_phase = (self.current_phase + 1) % 4
                self.phase_timer = 0
        except Exception:
            pass
            
        return self.current_phase

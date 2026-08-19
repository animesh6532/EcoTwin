from backend.optimization.baseline_controller import BaseTrafficController

class FixedTimeController(BaseTrafficController):
    def __init__(self, tls_id: str, cycle_durations=None):
        super().__init__(tls_id)
        # Default: 30 steps green, 4 steps yellow
        self.cycle_durations = cycle_durations or [30, 4, 30, 4]
        self.total_cycle = sum(self.cycle_durations)

    def select_action(self, step: int) -> int:
        cycle_pos = step % self.total_cycle
        
        running_sum = 0
        for phase_idx, duration in enumerate(self.cycle_durations):
            running_sum += duration
            if cycle_pos < running_sum:
                return phase_idx
                
        return 0

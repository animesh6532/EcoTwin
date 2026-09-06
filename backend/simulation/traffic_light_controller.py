import traci
from typing import List, Dict, Any
from datetime import datetime
from backend.core.logging import logger

DEFAULT_PHASE_DESCRIPTIONS = {
    0: "North-South Green (East-West Red)",
    1: "North-South Yellow transition",
    2: "East-West Green (North-South Red)",
    3: "East-West Yellow transition",
}

class TrafficLightController:
    """
    Handles discovery, detailed state inspection, approach telemetry,
    and safety-validated phase controls for traffic lights in SUMO via TraCI.
    """

    @staticmethod
    def discover_tls_ids() -> List[str]:
        if not traci.isLoaded():
            return []
        try:
            return list(traci.trafficlight.getIDList())
        except Exception as e:
            logger.warning(f"Failed to discover traffic light IDs: {e}")
            return []

    @staticmethod
    def get_current_phase(tls_id: str) -> int:
        if not traci.isLoaded():
            return 0
        try:
            return traci.trafficlight.getPhase(tls_id)
        except Exception as e:
            logger.error(f"Failed to get current phase for TLS {tls_id}: {e}")
            return 0

    @staticmethod
    def get_phases_info(tls_id: str) -> List[Dict[str, Any]]:
        """
        Retrieves program logic phases directly from SUMO or fallback.
        """
        if traci.isLoaded():
            try:
                logics = traci.trafficlight.getAllProgramLogics(tls_id)
                if logics and len(logics) > 0 and len(logics[0].phases) > 0:
                    phases_data = []
                    for idx, p in enumerate(logics[0].phases):
                        name = getattr(p, "name", None) or DEFAULT_PHASE_DESCRIPTIONS.get(idx, f"Phase {idx}")
                        phases_data.append({
                            "index": idx,
                            "name": name,
                            "duration": float(p.duration),
                            "state_pattern": p.state
                        })
                    return phases_data
            except Exception as e:
                logger.warning(f"Error reading program logics for TLS {tls_id}: {e}")

        # Static fallback matching city.net.xml logic
        return [
            {"index": 0, "name": DEFAULT_PHASE_DESCRIPTIONS[0], "duration": 42.0, "state_pattern": "GGGggrrrrrGGGggrrrrr"},
            {"index": 1, "name": DEFAULT_PHASE_DESCRIPTIONS[1], "duration": 3.0, "state_pattern": "yyyyyrrrrryyyyyrrrrr"},
            {"index": 2, "name": DEFAULT_PHASE_DESCRIPTIONS[2], "duration": 42.0, "state_pattern": "rrrrrGGGggrrrrrGGGgg"},
            {"index": 3, "name": DEFAULT_PHASE_DESCRIPTIONS[3], "duration": 3.0, "state_pattern": "rrrrryyyyyrrrrryyyyy"},
        ]

    @staticmethod
    def get_timing_info(tls_id: str) -> Dict[str, Any]:
        """
        Calculates remaining seconds, elapsed time, next phase, cycle duration.
        """
        phases = TrafficLightController.get_phases_info(tls_id)
        cycle_duration = sum(p["duration"] for p in phases) or 90.0
        active_phase = TrafficLightController.get_current_phase(tls_id)
        
        remaining_sec = 0.0
        next_phase = (active_phase + 1) % len(phases) if phases else 0
        
        if traci.isLoaded():
            try:
                next_switch = traci.trafficlight.getNextSwitch(tls_id)
                sim_time = traci.simulation.getTime()
                remaining_sec = max(0.0, round(next_switch - sim_time, 1))
            except Exception:
                current_duration = phases[active_phase]["duration"] if active_phase < len(phases) else 42.0
                remaining_sec = current_duration
        else:
            current_duration = phases[active_phase]["duration"] if active_phase < len(phases) else 42.0
            remaining_sec = current_duration

        current_duration = phases[active_phase]["duration"] if active_phase < len(phases) else 42.0
        elapsed_sec = max(0.0, round(current_duration - remaining_sec, 1))
        
        active_phase_name = phases[active_phase]["name"] if active_phase < len(phases) else f"Phase {active_phase}"
        next_phase_name = phases[next_phase]["name"] if next_phase < len(phases) else f"Phase {next_phase}"

        return {
            "active_phase": active_phase,
            "active_phase_name": active_phase_name,
            "remaining_sec": remaining_sec,
            "elapsed_sec": elapsed_sec,
            "next_phase": next_phase,
            "next_phase_name": next_phase_name,
            "cycle_duration": cycle_duration,
        }

    @staticmethod
    def get_signal_state_map(tls_id: str) -> Dict[str, str]:
        """
        Derives North, South, East, West signal head state colors (GREEN, YELLOW, RED)
        from actual SUMO state string.
        """
        state_str = "GGGggrrrrrGGGggrrrrr"
        if traci.isLoaded():
            try:
                state_str = traci.trafficlight.getRedYellowGreenState(tls_id)
            except Exception as e:
                logger.warning(f"Error reading signal state string for TLS {tls_id}: {e}")

        def parse_direction_color(chars: str) -> str:
            if "G" in chars or "g" in chars:
                return "GREEN"
            if "y" in chars or "Y" in chars:
                return "YELLOW"
            return "RED"

        # Split 20-char state into 4 directions (5 chars each: N, E, S, W)
        if len(state_str) >= 20:
            north_chars = state_str[0:5]
            east_chars = state_str[5:10]
            south_chars = state_str[10:15]
            west_chars = state_str[15:20]
        else:
            north_chars = state_str[0:min(len(state_str), 5)]
            east_chars = state_str[5:min(len(state_str), 10)] if len(state_str) >= 10 else "r"
            south_chars = state_str[10:min(len(state_str), 15)] if len(state_str) >= 15 else "r"
            west_chars = state_str[15:] if len(state_str) >= 20 else "r"

        return {
            "north": parse_direction_color(north_chars),
            "east": parse_direction_color(east_chars),
            "south": parse_direction_color(south_chars),
            "west": parse_direction_color(west_chars),
        }

    @staticmethod
    def get_approach_metrics(tls_id: str) -> List[Dict[str, Any]]:
        """
        Calculates directional incoming & outgoing approach metrics (North, South, East, West).
        """
        directions_config = [
            {"direction": "North", "inc": ["N2C_0", "N2C_1"], "out": ["C2N_0", "C2N_1"]},
            {"direction": "East", "inc": ["E2C_0", "E2C_1"], "out": ["C2E_0", "C2E_1"]},
            {"direction": "South", "inc": ["S2C_0", "S2C_1"], "out": ["C2S_0", "C2S_1"]},
            {"direction": "West", "inc": ["W2C_0", "W2C_1"], "out": ["C2W_0", "C2W_1"]},
        ]

        approaches = []
        for cfg in directions_config:
            v_approaching = 0
            v_waiting = 0
            queue_len = 0
            speeds = []
            
            if traci.isLoaded():
                for lane in cfg["inc"]:
                    try:
                        v_ids = traci.lane.getLastStepVehicleIDs(lane)
                        v_approaching += len(v_ids)
                        halting = traci.lane.getLastStepHaltingNumber(lane)
                        v_waiting += halting
                        queue_len += halting
                        speed = traci.lane.getLastStepMeanSpeed(lane) * 3.6 # m/s to km/h
                        if speed > 0:
                            speeds.append(speed)
                    except Exception:
                        pass

            avg_speed = round(sum(speeds) / len(speeds), 1) if speeds else 0.0
            est_delay = round(v_waiting * 1.8 + queue_len * 2.2, 1)

            approaches.append({
                "direction": cfg["direction"],
                "incoming_lanes": cfg["inc"],
                "outgoing_lanes": cfg["out"],
                "vehicles_approaching": v_approaching,
                "vehicles_waiting": v_waiting,
                "queue_length": queue_len,
                "average_speed": avg_speed,
                "estimated_delay": est_delay,
            })

        return approaches

    @staticmethod
    def get_full_detail(tls_id: str, controller_type: str = "fixed_time") -> Dict[str, Any]:
        """
        Compiles complete dynamic detail payload for a junction.
        """
        timing = TrafficLightController.get_timing_info(tls_id)
        phases = TrafficLightController.get_phases_info(tls_id)
        signal_state = TrafficLightController.get_signal_state_map(tls_id)
        approaches = TrafficLightController.get_approach_metrics(tls_id)

        total_vehicles = sum(a["vehicles_approaching"] for a in approaches)
        total_queue = sum(a["queue_length"] for a in approaches)
        valid_speeds = [a["average_speed"] for a in approaches if a["average_speed"] > 0]
        avg_speed = round(sum(valid_speeds) / len(valid_speeds), 1) if valid_speeds else 0.0
        avg_delay = round(sum(a["estimated_delay"] for a in approaches) / max(1, len(approaches)), 1)

        # Status heuristic
        if not traci.isLoaded():
            status = "OFFLINE"
        elif total_queue > 15 or avg_delay > 25:
            status = "CRITICAL"
        elif total_queue > 8 or avg_delay > 12:
            status = "WARNING"
        else:
            status = "ACTIVE"

        return {
            "id": tls_id,
            "status": status,
            "active_phase": timing["active_phase"],
            "active_phase_name": timing["active_phase_name"],
            "phases": [p["state_pattern"] for p in phases],
            "phase_details": phases,
            "remaining_sec": timing["remaining_sec"],
            "elapsed_sec": timing["elapsed_sec"],
            "next_phase": timing["next_phase"],
            "next_phase_name": timing["next_phase_name"],
            "cycle_duration": timing["cycle_duration"],
            "total_vehicles": total_vehicles,
            "total_queue": total_queue,
            "average_speed": avg_speed,
            "average_delay": avg_delay,
            "signal_state": signal_state,
            "approaches": approaches,
            "controller": controller_type,
            "timestamp": datetime.utcnow().isoformat(),
        }

    @staticmethod
    def validate_override_safety(tls_id: str, action: int) -> tuple[bool, str]:
        """
        Validates safety requirements before applying manual signal phase override.
        """
        if not traci.isLoaded():
            return False, "SUMO TraCI simulation session is not active."

        tls_ids = TrafficLightController.discover_tls_ids()
        if tls_id not in tls_ids:
            return False, f"Traffic light junction '{tls_id}' does not exist in simulation."

        phases = TrafficLightController.get_phases_info(tls_id)
        if action < 0 or action >= len(phases):
            return False, f"Invalid phase index {action}. Available range is [0..{len(phases)-1}]."

        current_phase = TrafficLightController.get_current_phase(tls_id)
        if current_phase == action:
            return False, f"Junction '{tls_id}' is already active on phase {action}."

        return True, ""

    @staticmethod
    def apply_action(tls_id: str, action: int) -> bool:
        """
        Set traffic light to the target phase.
        """
        if not traci.isLoaded():
            return False
        
        is_safe, _ = TrafficLightController.validate_override_safety(tls_id, action)
        if not is_safe:
            # Check basic bounds if already on phase
            phases = TrafficLightController.get_phases_info(tls_id)
            if action < 0 or action >= len(phases):
                return False

        try:
            traci.trafficlight.setPhase(tls_id, int(action))
            return True
        except Exception as e:
            logger.error(f"Failed to apply phase action {action} to TLS {tls_id}: {e}")
            return False


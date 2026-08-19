import traci
from typing import List, Dict, Any
from backend.core.logging import logger

class TrafficLightsManager:
    @staticmethod
    def get_tls_ids() -> List[str]:
        if not traci.isLoaded():
            return []
        try:
            return list(traci.trafficlight.getIDList())
        except Exception:
            return []

    @staticmethod
    def get_state(tls_id: str) -> Dict[str, Any]:
        state = {
            "id": tls_id,
            "phase": 0,
            "ryg_state": "",
            "program": "default",
            "next_switch": 0
        }
        if not traci.isLoaded():
            return state
        try:
            state["phase"] = traci.trafficlight.getPhase(tls_id)
            state["ryg_state"] = traci.trafficlight.getRedYellowGreenState(tls_id)
            state["program"] = traci.trafficlight.getProgram(tls_id)
            state["next_switch"] = traci.trafficlight.getNextSwitch(tls_id) - traci.simulation.getTime()
        except Exception as e:
            logger.warning(f"Error querying TLS {tls_id} state: {e}")
        return state

    @staticmethod
    def set_phase(tls_id: str, phase_index: int):
        if not traci.isLoaded():
            return
        try:
            traci.trafficlight.setPhase(tls_id, phase_index)
        except Exception as e:
            logger.error(f"Failed to set phase {phase_index} on TLS {tls_id}: {e}")

    @staticmethod
    def set_program(tls_id: str, program_id: str):
        if not traci.isLoaded():
            return
        try:
            traci.trafficlight.setProgram(tls_id, program_id)
        except Exception as e:
            logger.error(f"Failed to set program {program_id} on TLS {tls_id}: {e}")

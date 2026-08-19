from gymnasium import spaces
from typing import Dict

def get_action_space() -> spaces.Discrete:
    return spaces.Discrete(4)

# Phase configurations for standard 4-way intersection:
# Phase 0: North-South Green (e.g. "GGggrrrrGGgg")
# Phase 1: North-South Yellow (e.g. "yyyyrrrryyyy")
# Phase 2: East-West Green (e.g. "rrrrGGggrrrr")
# Phase 3: East-West Yellow (e.g. "rrrryyyyrrrr")
PHASE_MAPPING: Dict[int, str] = {
    0: "NS_GREEN",
    1: "NS_YELLOW",
    2: "EW_GREEN",
    3: "EW_YELLOW"
}

def get_phase_name(action: int) -> str:
    return PHASE_MAPPING.get(action, f"PHASE_{action}")

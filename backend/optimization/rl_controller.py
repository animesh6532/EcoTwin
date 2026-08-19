from backend.optimization.baseline_controller import BaseTrafficController
from backend.rl.inference import RLInference
from backend.rl.observation_space import extract_observation

class RLController(BaseTrafficController):
    def __init__(self, tls_id: str, model_path: str = None):
        super().__init__(tls_id)
        self.agent = RLInference(model_path=model_path)

    def select_action(self, step: int) -> int:
        obs = extract_observation(self.tls_id)
        return self.agent.predict(obs)

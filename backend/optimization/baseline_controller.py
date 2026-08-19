from abc import ABC, abstractmethod

class BaseTrafficController(ABC):
    def __init__(self, tls_id: str):
        self.tls_id = tls_id

    @abstractmethod
    def select_action(self, step: int) -> int:
        """
        Choose the phase index (action) to apply at the current simulation step.
        """
        pass

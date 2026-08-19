import { useState } from 'react';
import { 
  startSimulation, 
  stopSimulation, 
  pauseSimulation, 
  resumeSimulation, 
  stepSimulation 
} from '../services/api';
import { simulationStore } from '../store/simulationStore';

export function useSimulation() {
  const [loading, setLoading] = useState(false);

  const startSim = async (scenario: string, gui: boolean) => {
    setLoading(true);
    try {
      const res = await startSimulation(scenario, gui);
      simulationStore.setState({ status: 'running', step: res.step });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const stopSim = async () => {
    setLoading(true);
    try {
      await stopSimulation();
      simulationStore.setState({ status: 'stopped', vehicles: [], active_vehicles: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const pauseSim = async () => {
    try {
      await pauseSimulation();
    } catch (e) {
      console.error(e);
    }
  };

  const resumeSim = async () => {
    try {
      await resumeSimulation();
    } catch (e) {
      console.error(e);
    }
  };

  const stepSim = async () => {
    try {
      const res = await stepSimulation();
      simulationStore.setState({ step: res.step });
    } catch (e) {
      console.error(e);
    }
  };

  return {
    loading,
    startSim,
    stopSim,
    pauseSim,
    resumeSim,
    stepSim
  };
}

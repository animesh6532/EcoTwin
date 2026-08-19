const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchHealth() {
  const res = await fetch(`${API_URL}/api/health`);
  return res.json();
}

export async function startSimulation(scenario = 'normal', gui = true) {
  const res = await fetch(`${API_URL}/api/simulation/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario, gui, duration: 3600, step_length: 0.1 })
  });
  return res.json();
}

export async function pauseSimulation() {
  const res = await fetch(`${API_URL}/api/simulation/pause`, { method: 'POST' });
  return res.json();
}

export async function resumeSimulation() {
  const res = await fetch(`${API_URL}/api/simulation/resume`, { method: 'POST' });
  return res.json();
}

export async function stepSimulation() {
  const res = await fetch(`${API_URL}/api/simulation/step`, { method: 'POST' });
  return res.json();
}

export async function stopSimulation() {
  const res = await fetch(`${API_URL}/api/simulation/stop`, { method: 'POST' });
  return res.json();
}

export async function fetchTrafficMetrics() {
  const res = await fetch(`${API_URL}/api/traffic/metrics`);
  return res.json();
}

export async function fetchEmissionsMetrics() {
  const res = await fetch(`${API_URL}/api/emissions/metrics`);
  return res.json();
}

export async function configureOptimization(controllerType: string) {
  const res = await fetch(`${API_URL}/api/optimization/configure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ controller_type: controllerType })
  });
  return res.json();
}

export async function fetchOptimizationStatus() {
  const res = await fetch(`${API_URL}/api/optimization/status`);
  return res.json();
}

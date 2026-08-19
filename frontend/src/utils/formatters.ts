export function formatEmissions(mgVal: number): string {
  if (mgVal > 1000000) {
    return `${(mgVal / 1000000).toFixed(2)} kg/s`;
  }
  if (mgVal > 1000) {
    return `${(mgVal / 1000).toFixed(2)} g/s`;
  }
  return `${mgVal.toFixed(1)} mg/s`;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatFuel(mlVal: number): string {
  if (mlVal > 1000) {
    return `${(mlVal / 1000).toFixed(2)} L/s`;
  }
  return `${mlVal.toFixed(1)} ml/s`;
}

import { useState, useEffect } from 'react';
import { fetchTrafficMetrics, fetchEmissionsMetrics } from '../services/api';

export function useMetrics(pollInterval = 5000) {
  const [traffic, setTraffic] = useState<any>(null);
  const [emissions, setEmissions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [tData, eData] = await Promise.all([
        fetchTrafficMetrics(),
        fetchEmissionsMetrics()
      ]);
      setTraffic(tData);
      setEmissions(eData);
    } catch (err) {
      console.error('Error fetching analytics metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval]);

  return { traffic, emissions, loading, refetch: loadData };
}

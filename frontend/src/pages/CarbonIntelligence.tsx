import { useQuery } from "@tanstack/react-query";
import { useSimulationStore } from "../store/simulationStore";
import { getCurrentEmissions, getAccumulatedEmissions, getEmissionHotspots } from "../api/emissions";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  LineChart,
  Line,
  Legend
} from "recharts";
import { useState, useEffect } from "react";
import { ShieldCheck, AlertTriangle, ShieldAlert, Leaf, Activity, Info } from "lucide-react";

export default function CarbonIntelligence() {
  const wsState = useSimulationStore();
  
  // Queries
  const { data: currentEmissions } = useQuery({
    queryKey: ["currentEmissions"],
    queryFn: getCurrentEmissions,
    refetchInterval: wsState.running && !wsState.paused ? 2000 : false,
  });

  const { data: accumulatedEmissions } = useQuery({
    queryKey: ["accumulatedEmissions"],
    queryFn: getAccumulatedEmissions,
    refetchInterval: wsState.running && !wsState.paused ? 5000 : false,
  });

  const { data: hotspots, isLoading: isLoadingHotspots } = useQuery({
    queryKey: ["hotspotsList"],
    queryFn: getEmissionHotspots,
    refetchInterval: wsState.running && !wsState.paused ? 5000 : false,
  });

  // Maintain local history of rates
  const [rateHistory, setRateHistory] = useState<{ time: string; co2: number; nox: number; fuel: number }[]>([]);

  useEffect(() => {
    if (wsState.running && currentEmissions) {
      setRateHistory((prev) => {
        const timeStr = `${wsState.simulationTime.toFixed(0)}s`;
        if (prev.length > 0 && prev[prev.length - 1].time === timeStr) {
          return prev;
        }
        const next = [
          ...prev,
          {
            time: timeStr,
            co2: currentEmissions.co2,
            nox: currentEmissions.nox,
            fuel: currentEmissions.fuel,
          },
        ];
        return next.slice(-20); // Keep last 20 steps
      });
    }
  }, [wsState.simulationTime, currentEmissions, wsState.running]);

  // Carbon Pressure Index calculation
  const getCarbonPressureIndex = () => {
    const co2Rate = currentEmissions?.co2 ?? 0;
    const noxRate = currentEmissions?.nox ?? 0;
    const avgWait = wsState.metrics.average_waiting_time;

    // Calculation weight formula:
    // co2 weight: 50%, nox weight: 30%, wait time weight: 20%
    // Normalized out of 100 points
    const co2Score = Math.min((co2Rate / 10000) * 100, 100);
    const noxScore = Math.min((noxRate / 100) * 100, 100);
    const waitScore = Math.min((avgWait / 60) * 100, 100);

    const totalScore = (co2Score * 0.5) + (noxScore * 0.3) + (waitScore * 0.2);

    let status: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" = "LOW";
    let color = "text-eco-green bg-eco-green/10 border-eco-green/20";
    let icon = ShieldCheck;

    if (totalScore > 75) {
      status = "CRITICAL";
      color = "text-carbon-critical bg-carbon-critical/10 border-carbon-critical/20";
      icon = ShieldAlert;
    } else if (totalScore > 45) {
      status = "HIGH";
      color = "text-carbon-alert bg-carbon-alert/10 border-carbon-alert/20";
      icon = AlertTriangle;
    } else if (totalScore > 20) {
      status = "MODERATE";
      color = "text-traffic-yellow bg-traffic-yellow/10 border-traffic-yellow/20";
      icon = AlertTriangle;
    }

    return { score: totalScore, status, color, icon };
  };

  const cpi = getCarbonPressureIndex();
  const IconCpi = cpi.icon;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Carbon Intelligence</h1>
        <p className="text-text-secondary text-sm mt-1">
          Monitor dynamic environmental footprints, pollution hotspots, and spatial dispersal factors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Emission Trends charts */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* CO2 Area Chart */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">Carbon Dioxide (CO₂) Emission Rate</h3>
            
            <div className="h-64">
              {rateHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={rateHistory}>
                    <defs>
                      <linearGradient id="colorCo2Rate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EA580C" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#EA580C" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: 11 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="co2" 
                      name="CO₂ (mg/s)"
                      stroke="#EA580C" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#colorCo2Rate)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-text-muted text-sm border-2 border-dashed border-border rounded-lg">
                  <Leaf className="h-8 w-8 text-text-muted/40 mb-2 animate-pulse" />
                  <span>Simulation not active. No live trends available.</span>
                </div>
              )}
            </div>
          </div>

          {/* NOx and Fuel Line Chart */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">NOx & Fuel Rate Telemetry</h3>
            
            <div className="h-64">
              {rateHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rateHistory}>
                    <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: 11 }}
                    />
                    <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Line 
                      type="monotone" 
                      dataKey="nox" 
                      name="NOx Rate (mg/s)"
                      stroke="#DC2626" 
                      strokeWidth={2} 
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="fuel" 
                      name="Fuel Consumption (ml/s)"
                      stroke="#16A34A" 
                      strokeWidth={2} 
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-text-muted text-sm border-2 border-dashed border-border rounded-lg">
                  <Activity className="h-8 w-8 text-text-muted/40 mb-2" />
                  <span>Simulation not active. No live rate telemetries available.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Carbon Pressure Index & Hotspots list */}
        <div className="space-y-8">
          {/* Carbon Pressure Index Card */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Carbon Pressure Index</h3>
            
            <div className={`p-4 rounded-xl border flex items-center justify-between ${cpi.color}`}>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-85">Rating status</span>
                <div className="text-xl font-bold mt-0.5">{cpi.status}</div>
              </div>
              <IconCpi className="h-8 w-8 stroke-[2]" />
            </div>

            <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
              <div className="flex justify-between items-center text-[11px] font-semibold text-text-primary border-b border-border pb-1">
                <span>Metrics Contributors</span>
                <span>Score: {cpi.score.toFixed(0)}/100</span>
              </div>
              
              <div className="flex justify-between">
                <span>CO₂ emissions (mg/s)</span>
                <span className="font-semibold text-text-primary">50% weight</span>
              </div>
              <div className="flex justify-between">
                <span>NOx emissions (mg/s)</span>
                <span className="font-semibold text-text-primary">30% weight</span>
              </div>
              <div className="flex justify-between">
                <span>Average vehicle wait (s)</span>
                <span className="font-semibold text-text-primary">20% weight</span>
              </div>
            </div>
            
            <div className="bg-bg-secondary border border-border rounded-lg p-3 text-[10px] text-text-muted flex gap-2">
              <Info className="h-4.5 w-4.5 text-text-muted/65 shrink-0" />
              <span>Calculated dynamically from active vehicles in SUMO step callback.</span>
            </div>
          </div>

          {/* Lane Emission Hotspots Ranking */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">Critical Hotspot Lanes</h3>
              
              <div className="space-y-2">
                {isLoadingHotspots ? (
                  <div className="h-10 bg-bg-secondary rounded animate-pulse" />
                ) : hotspots && hotspots.length > 0 ? (
                  hotspots.map((lane, index) => (
                    <div key={lane} className="p-3 bg-bg-secondary border border-border rounded-lg flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 bg-carbon-critical/10 text-carbon-critical font-bold text-[10px] flex items-center justify-center rounded-full">
                          {index + 1}
                        </span>
                        <span className="font-mono text-text-primary">{lane}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-carbon-alert/10 text-carbon-alert font-semibold text-[9px] rounded uppercase tracking-wider">
                        High Emission
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-xs text-text-muted border border-dashed border-border rounded-lg">
                    No critical hotspots detected. All lane emissions remain within safe threshold levels.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-border mt-6 text-center text-[10px] text-text-muted font-mono">
              Accumulated CO₂: {accumulatedEmissions ? (accumulatedEmissions.co2 / 1000).toFixed(1) : 0} g
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

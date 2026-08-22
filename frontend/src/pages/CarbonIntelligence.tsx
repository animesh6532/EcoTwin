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

    const co2Score = Math.min((co2Rate / 10000) * 100, 100);
    const noxScore = Math.min((noxRate / 100) * 100, 100);
    const waitScore = Math.min((avgWait / 60) * 100, 100);

    const totalScore = (co2Score * 0.5) + (noxScore * 0.3) + (waitScore * 0.2);

    let status: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" = "LOW";
    let color = "text-[#FFD2A3] bg-[#FFD2A3]/5 border-[#FFD2A3]/20";
    let icon = ShieldCheck;

    if (totalScore > 75) {
      status = "CRITICAL";
      color = "text-[#FF4D4D] bg-[#FF4D4D]/5 border-[#FF4D4D]/20";
      icon = ShieldAlert;
    } else if (totalScore > 45) {
      status = "HIGH";
      color = "text-[#FF8A00] bg-[#FF8A00]/5 border-[#FF8A00]/20";
      icon = AlertTriangle;
    } else if (totalScore > 20) {
      status = "MODERATE";
      color = "text-[#FFB84D] bg-[#FFB84D]/5 border-[#FFB84D]/20";
      icon = AlertTriangle;
    }

    return { score: totalScore, status, color, icon };
  };

  const cpi = getCarbonPressureIndex();
  const IconCpi = cpi.icon;

  return (
    <div className="space-y-8 animate-fade-in text-[#FFF3E5]">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black tracking-tight uppercase font-sans">Carbon Intelligence</h1>
        <p className="text-[#FFD2A3] text-sm mt-1">
          Monitor dynamic environmental footprints, pollution hotspots, and spatial dispersal factors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Emission Trends charts */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* CO2 Area Chart */}
          <div className="glass-panel p-6 border border-[#75451A]/20 shadow-2xl">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-text-primary mb-4">Carbon Dioxide (CO₂) Emission Rate</h3>
            
            <div className="h-64">
              {rateHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={rateHistory}>
                    <defs>
                      <linearGradient id="colorCo2Rate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF8A00" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#FF8A00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#555" tickLine={false} tick={{ fill: '#9A8575', fontSize: 9, fontFamily: 'monospace' }} />
                    <YAxis stroke="#555" tickLine={false} tick={{ fill: '#9A8575', fontSize: 9, fontFamily: 'monospace' }} />
                    <Tooltip 
                      contentStyle={{ background: "#11100E", border: "1px solid rgba(255,163,71,0.15)", borderRadius: "8px", fontSize: 11 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="co2" 
                      name="CO₂ (mg/s)"
                      stroke="#FF8A00" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#colorCo2Rate)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[#9A8575] text-xs border border-dashed border-[#75451A]/20 rounded-lg font-mono">
                  <Leaf className="h-8 w-8 text-[#9A8575]/40 mb-2" />
                  <span>Simulation not active. No live trends available.</span>
                </div>
              )}
            </div>
          </div>

          {/* NOx and Fuel Line Chart */}
          <div className="glass-panel p-6 border border-[#75451A]/20 shadow-2xl">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-text-primary mb-4">NOx & Fuel Rate Telemetry</h3>
            
            <div className="h-64">
              {rateHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rateHistory}>
                    <XAxis dataKey="time" stroke="#555" tickLine={false} tick={{ fill: '#9A8575', fontSize: 9, fontFamily: 'monospace' }} />
                    <YAxis stroke="#555" tickLine={false} tick={{ fill: '#9A8575', fontSize: 9, fontFamily: 'monospace' }} />
                    <Tooltip 
                      contentStyle={{ background: "#11100E", border: "1px solid rgba(255,163,71,0.15)", borderRadius: "8px", fontSize: 11 }}
                    />
                    <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Line 
                      type="monotone" 
                      dataKey="nox" 
                      name="NOx Rate (mg/s)"
                      stroke="#E06C00" 
                      strokeWidth={2} 
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="fuel" 
                      name="Fuel Consumption (ml/s)"
                      stroke="#FFB84D" 
                      strokeWidth={2} 
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[#9A8575] text-xs border border-dashed border-[#75451A]/20 rounded-lg font-mono">
                  <Activity className="h-8 w-8 text-[#9A8575]/40 mb-2" />
                  <span>Simulation not active. No live rate telemetries available.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Carbon Pressure Index & Hotspots list */}
        <div className="space-y-8">
          {/* Carbon Pressure Index Card */}
          <div className="glass-panel p-6 border border-[#75451A]/20 shadow-2xl space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#9A8575] mb-2 border-b border-[#75451A]/10 pb-3">Carbon Pressure Index</h3>
            
            <div className={`p-4 rounded-xl border flex items-center justify-between ${cpi.color} font-mono`}>
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider opacity-85">Rating status</span>
                <div className="text-lg font-bold mt-0.5">{cpi.status}</div>
              </div>
              <IconCpi className="h-7 w-7 stroke-[2]" />
            </div>

            <div className="space-y-3 text-xs text-[#FFD2A3] leading-relaxed font-mono">
              <div className="flex justify-between items-center text-[10px] font-semibold text-[#FFF3E5] border-b border-[#75451A]/10 pb-1 uppercase tracking-wider">
                <span>Metrics Contributors</span>
                <span>Score: {cpi.score.toFixed(0)}/100</span>
              </div>
              
              <div className="flex justify-between">
                <span>CO₂ emissions</span>
                <span className="font-semibold text-text-primary">50% weight</span>
              </div>
              <div className="flex justify-between">
                <span>NOx emissions</span>
                <span className="font-semibold text-text-primary">30% weight</span>
              </div>
              <div className="flex justify-between">
                <span>Avg vehicle wait</span>
                <span className="font-semibold text-text-primary">20% weight</span>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/5 rounded-lg p-3 text-[9px] text-[#9A8575] flex gap-2 font-mono uppercase tracking-wider">
              <Info className="h-4 w-4 text-[#9A8575]/65 shrink-0" />
              <span>Calculated dynamically from active vehicles.</span>
            </div>
          </div>

          {/* Lane Emission Hotspots Ranking */}
          <div className="glass-panel p-6 border border-[#75451A]/20 shadow-2xl flex flex-col justify-between h-[320px]">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#9A8575] mb-4 border-b border-[#75451A]/10 pb-3">Critical Hotspot Lanes</h3>
              
              <div className="space-y-2 overflow-y-auto max-h-[180px] pr-1">
                {isLoadingHotspots ? (
                  <div className="h-10 bg-white/5 rounded animate-pulse" />
                ) : hotspots && hotspots.length > 0 ? (
                  hotspots.map((lane, index) => (
                    <div key={lane} className="p-3 bg-[#11100E] border border-[#75451A]/10 rounded-lg flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 bg-[#E06C00]/15 text-[#FF8A00] font-bold text-[9px] flex items-center justify-center rounded-full">
                          {index + 1}
                        </span>
                        <span className="text-[#FFF3E5]">{lane}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-[#FF8A00]/10 text-[#FF8A00] font-semibold text-[8px] rounded uppercase tracking-wider">
                        High Emission
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-xs text-[#9A8575] border border-dashed border-[#75451A]/20 rounded-lg">
                    No hotspots detected.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-[#75451A]/10 mt-6 text-center text-[10px] text-[#9A8575] font-mono uppercase tracking-wider">
              Accumulated CO₂: {accumulatedEmissions ? (accumulatedEmissions.co2 / 1000).toFixed(1) : 0} g
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

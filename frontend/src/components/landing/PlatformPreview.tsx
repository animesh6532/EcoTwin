import { Users, Gauge, Clock, Activity, Leaf } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { GlassCard } from "../glass/GlassCard";

export default function PlatformPreview() {
  // Mock data for carbon trend representation
  const mockChartData = [
    { time: "0s", co2: 2400 },
    { time: "10s", co2: 3100 },
    { time: "20s", co2: 2800 },
    { time: "30s", co2: 4200 },
    { time: "40s", co2: 3900 },
    { time: "50s", co2: 5100 },
    { time: "60s", co2: 4700 },
    { time: "70s", co2: 5900 },
    { time: "80s", co2: 5500 },
    { time: "90s", co2: 6800 },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/5 bg-[#120D09]">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#FF8A00] block mb-2 font-mono">
          Simulated Interface
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFF7ED] uppercase tracking-wider">
          Real-Time Diagnostics Preview
        </h2>
        <p className="text-[#A89582] text-xs sm:text-sm mt-2">
          Experience the analytical telemetry captured during active SUMO simulation runs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch max-w-6xl mx-auto">
        {/* Left: Map Preview Card */}
        <div className="lg:col-span-2 relative rounded-[24px] border border-brand-orange/15 min-h-[300px] flex flex-col justify-between overflow-hidden shadow-2xl bg-[#120D09]">
          {/* Mock background map tile */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 filter brightness-[0.4] grayscale-[0.5]"
            style={{ 
              backgroundImage: `url('/images/ecotwin-city-hero.png')`
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[size:100%_4px] pointer-events-none z-10 opacity-25" />

          {/* Top Info Banner */}
          <div className="absolute top-4 left-4 z-20 px-3.5 py-1.5 bg-[#120D09]/90 border border-brand-orange/20 rounded-xl font-mono text-[9px] uppercase tracking-wider text-[#FFF7ED] flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#39D98A] shadow-[0_0_8px_#39D98A]" />
            <span>Interactive Simulator Console (Sample View)</span>
          </div>

          {/* Center visual layout placeholder simulating nodes */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="relative">
              {/* Center intersection marker */}
              <div className="h-4 w-4 bg-[#FF8A00] border-2 border-white rounded-full animate-pulse shadow-[0_0_15px_#FF8A00]" />
              {/* Sub-node lines */}
              <div className="absolute top-2 left-6 h-0.5 w-12 bg-dashed border-t border-[#FF8A00]/40" />
              <div className="absolute -top-10 left-2 h-12 w-0.5 bg-dashed border-l border-[#FF8A00]/40" />
            </div>
          </div>

          {/* Bottom legend */}
          <div className="absolute bottom-4 left-4 z-20 p-2.5 bg-[#120D09]/90 border border-white/5 rounded-xl font-mono text-[8px] uppercase tracking-wider space-y-1.5 text-[#E8D7C5]">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#39D98A]" />
              <span>Fluid Velocity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF8A00]" />
              <span>Emission Hotspot</span>
            </div>
          </div>
        </div>

        {/* Right: Telemetry & Emissions Preview */}
        <div className="flex flex-col gap-6 justify-between">
          {/* Telemetry Stats */}
          <GlassCard className="p-5 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-[rgba(255,183,106,0.12)] pb-2.5">
                <span className="text-[9px] uppercase font-mono tracking-widest text-[#A89582] font-bold block">Telemetry Metrics</span>
                <h3 className="text-xs font-bold uppercase font-mono text-[#FFF7ED]">Network Metrics</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FF8A00]/10 border border-[#FF8A00]/20 rounded-lg text-[#FF8A00]">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[8px] text-[#A89582] font-bold uppercase tracking-wider block">Vehicles</span>
                    <span className="font-mono text-xs font-bold text-[#FFF7ED]">1,722 qty</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FF8A00]/10 border border-[#FF8A00]/20 rounded-lg text-[#FF8A00]">
                    <Gauge className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[8px] text-[#A89582] font-bold uppercase tracking-wider block">Avg Speed</span>
                    <span className="font-mono text-xs font-bold text-[#FFF7ED]">38.4 km/h</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FF8A00]/10 border border-[#FF8A00]/20 rounded-lg text-[#FF8A00]">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[8px] text-[#A89582] font-bold uppercase tracking-wider block">Wait Time</span>
                    <span className="font-mono text-xs font-bold text-[#FFF7ED]">12.8 s</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FF8A00]/10 border border-[#FF8A00]/20 rounded-lg text-[#FF8A00]">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[8px] text-[#A89582] font-bold uppercase tracking-wider block">Congestion</span>
                    <span className="font-mono text-xs font-bold text-[#FFF7ED]">8.4%</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Carbon Chart */}
          <GlassCard className="p-5 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-[rgba(255,183,106,0.12)] pb-2">
                <h3 className="text-xs font-bold uppercase font-mono text-[#FFF7ED] flex items-center gap-1.5">
                  <Leaf className="h-3.5 w-3.5 text-[#FF8A00]" /> CO₂ Emissions
                </h3>
                <span className="text-[9px] font-mono text-[#FF8A00] font-bold">5,200 mg/s</span>
              </div>
            </div>
            
            <div className="h-28 mt-4 font-mono text-[9px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="colorCo2Preview" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF8A00" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#FF8A00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#A89582" tickLine={false} tick={{ fill: '#A89582', fontSize: 8 }} />
                  <YAxis stroke="#A89582" tickLine={false} tick={{ fill: '#A89582', fontSize: 8 }} />
                  <Tooltip 
                    contentStyle={{ background: "rgba(18, 14, 11, 0.95)", border: "1px solid rgba(255, 184, 77, 0.25)", borderRadius: "8px", fontSize: 9 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="co2" 
                    stroke="#FF8A00" 
                    strokeWidth={1.5} 
                    fillOpacity={1} 
                    fill="url(#colorCo2Preview)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

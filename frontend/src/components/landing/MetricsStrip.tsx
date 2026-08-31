import { useSimulationStore } from "../../store/simulationStore";
import { Activity, ShieldCheck, Cpu, Leaf } from "lucide-react";

export default function MetricsStrip() {
  const { running, totalVehicles, averageSpeed, averageWaitingTime, co2 } = useSimulationStore();

  const activeMetrics = [
    {
      icon: Activity,
      label: "Vehicles Active",
      value: running ? `${totalVehicles} qty` : "Real-Time Telemetry",
    },
    {
      icon: ShieldCheck,
      label: "Simulation Engine",
      value: running ? `${averageSpeed.toFixed(1)} km/h` : "SUMO-Powered",
    },
    {
      icon: Cpu,
      label: "Control Strategy",
      value: running ? `${averageWaitingTime.toFixed(1)}s wait` : "RL PPO Optimization",
    },
    {
      icon: Leaf,
      label: "Emission Profiler",
      value: running ? `${co2.toFixed(0)} mg/s` : "Emission-Aware",
    },
  ];

  return (
    <div className="w-full bg-[#17110C]/60 border-y border-brand-orange/15 backdrop-blur-md py-6 my-6 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {activeMetrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div key={idx} className="flex flex-col md:flex-row items-center justify-center gap-3 font-mono">
                <div className="p-2 bg-[#FF8A00]/5 border border-[#FF8A00]/15 rounded-lg text-[#FF8A00] shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-left md:text-left text-center">
                  <span className="text-[8px] text-[#A89582] uppercase tracking-wider block font-bold">
                    {m.label}
                  </span>
                  <span className="text-xs font-bold text-[#FFF7ED] uppercase tracking-widest mt-0.5 block">
                    {m.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

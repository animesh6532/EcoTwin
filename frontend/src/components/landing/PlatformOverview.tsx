import { GitFork, Leaf, Cpu, Play } from "lucide-react";
import { GlassCard } from "../glass/GlassCard";

export default function PlatformOverview() {
  const cards = [
    {
      icon: GitFork,
      title: "Traffic Intelligence",
      description: "Monitor live velocities, waiting times, and congestion queues across city corridors.",
      glow: "orange" as const,
    },
    {
      icon: Leaf,
      title: "Carbon Intelligence",
      description: "Track emissions rates of CO₂, NOx, and fuel consumption dynamically.",
      glow: "green" as const,
    },
    {
      icon: Cpu,
      title: "RL Optimization",
      description: "Deploy trained PPO models to override traffic signals and optimize throughput.",
      glow: "amber" as const,
    },
    {
      icon: Play,
      title: "Digital Simulation",
      description: "Model real-world scenarios micro-simulation level using the SUMO engine.",
      glow: "cyan" as const,
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFF7ED] uppercase tracking-wider">
          Unified Urban Command
        </h2>
        <p className="text-[#A89582] text-xs sm:text-sm mt-2">
          EcoTwin integrates microscopic traffic simulation with environment mapping and reinforcement learning intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <GlassCard
              key={idx}
              variant="feature"
              interactive={true}
              glowColor={card.glow}
              className="flex flex-col gap-4 text-left h-full"
            >
              <div className="p-3 bg-[#FF8A00]/10 border border-[#FF8A00]/25 rounded-xl w-max">
                <Icon className="h-5 w-5 text-[#FF8A00]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#FFF7ED] tracking-wide">
                  {card.title}
                </h3>
                <p className="text-[#CBB9A6] text-xs mt-2 leading-relaxed font-sans font-normal">
                  {card.description}
                </p>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}

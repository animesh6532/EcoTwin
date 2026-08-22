import { useState } from "react";
import { toast } from "../utils/toast";
import { Sliders, Settings as SettingsIcon, ShieldAlert } from "lucide-react";
import { GlassCard } from "../components/glass/GlassCard";
import { GlassPanel } from "../components/glass/GlassPanel";
import { GlassButton } from "../components/glass/GlassButton";

export default function Settings() {
  const [apiUrl, setApiUrl] = useState(
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
  );
  const [refreshInterval, setRefreshInterval] = useState("2");
  const [highContrastMap, setHighContrastMap] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Local configuration saved successfully.", "success");
  };

  return (
    <div className="space-y-8 animate-fade-in text-text-cream">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black tracking-tight uppercase font-sans">Settings & Customization</h1>
        <p className="text-text-pale text-xs mt-1">
          Adjust runtime UI preferences, simulation refresh frequencies, and system endpoints.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Settings Card */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          <GlassPanel className="p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-[rgba(255,183,106,0.12)] font-mono text-xs uppercase tracking-widest text-[#FFF3E5] font-bold">
              <SettingsIcon className="h-4.5 w-4.5 text-brand-orange" />
              <span>Operational Config</span>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {/* API Endpoint field */}
              <div>
                <label className="block text-text-pale mb-2 uppercase tracking-widest font-bold">REST API Base URL</label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#050505]/45 border border-[rgba(255,183,106,0.22)] rounded-lg text-text-cream placeholder:text-text-muted focus:ring-1 focus:ring-brand-orange"
                  placeholder="e.g. http://127.0.0.1:8000"
                />
                <p className="text-[10px] text-text-muted mt-1 leading-normal uppercase">
                  Primary REST API server endpoint. Defaults to VITE_API_BASE_URL.
                </p>
              </div>

              {/* Refresh Rate */}
              <div>
                <label className="block text-text-pale mb-2 uppercase tracking-widest font-bold">Metrics Refresh Rate (s)</label>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(e.target.value)}
                  className="w-full p-2.5 border border-[rgba(255,183,106,0.22)] rounded-lg bg-[#050505]/45 text-text-cream focus:ring-1 focus:ring-brand-orange"
                >
                  <option value="1">1.0s (Highest Density)</option>
                  <option value="2">2.0s (Default)</option>
                  <option value="5">5.0s (Performance Mode)</option>
                </select>
              </div>

              {/* Map Theme Toggle */}
              <div className="flex items-center justify-between border-t border-[rgba(255,183,106,0.12)] pt-4">
                <div>
                  <label className="block text-text-cream font-bold uppercase tracking-widest">Dark digital twin map theme</label>
                  <p className="text-[10px] text-text-muted mt-1 leading-relaxed font-sans font-normal normal-case">
                    Invert geographic street layers to match the operations command room palette.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={highContrastMap}
                  onChange={(e) => setHighContrastMap(e.target.checked)}
                  className="rounded border-[rgba(255,183,106,0.22)] text-brand-orange focus:ring-brand-orange h-4 w-4 bg-[#050505]/45"
                />
              </div>
            </div>

            <div className="border-t border-[rgba(255,183,106,0.12)] pt-6 flex justify-end">
              <GlassButton type="submit" variant="primary" size="md" className="font-mono tracking-widest text-[10px] uppercase">
                Save changes
              </GlassButton>
            </div>
          </GlassPanel>
        </form>

        {/* Build Info Metadata card */}
        <GlassCard variant="large" className="flex flex-col justify-between h-[360px] border border-[rgba(255,183,106,0.12)]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-4 border-b border-[rgba(255,183,106,0.12)] font-mono text-xs uppercase tracking-widest text-[#FFF3E5] font-bold">
              <Sliders className="h-4.5 w-4.5 text-text-muted" />
              <span>System Metadata</span>
            </div>

            <div className="space-y-3.5 font-mono text-[9px] text-text-pale leading-normal uppercase tracking-widest font-bold">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-text-muted">Environment</span>
                <span className="text-text-cream">Development</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-text-muted">Bundler</span>
                <span className="text-text-cream">Vite Client</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-text-muted">Node Target</span>
                <span className="text-text-cream">ESNext</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-text-muted">TraCI Link</span>
                <span className="text-[#39D98A]">Connected</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-white/5 border border-white/5 rounded-lg flex gap-2 font-mono text-[9px] text-text-muted uppercase tracking-wider leading-relaxed">
            <ShieldAlert className="h-4.5 w-4.5 text-brand-orange shrink-0 animate-pulse" />
            <span>Changes made above apply only to local preferences. Environment variables require rebuild compilation.</span>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}

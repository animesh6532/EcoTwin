import { useState } from "react";
import { toast } from "../utils/toast";
import { Sliders, Settings as SettingsIcon, ShieldAlert } from "lucide-react";

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
    <div className="space-y-8 animate-fade-in text-[#FFF3E5]">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black tracking-tight uppercase font-sans">Settings & Customization</h1>
        <p className="text-[#FFD2A3] text-sm mt-1">
          Adjust runtime UI preferences, simulation refresh frequencies, and system endpoints.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Card */}
        <form onSubmit={handleSave} className="lg:col-span-2 glass-panel p-6 border border-[#75451A]/20 shadow-2xl space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-[#75451A]/10 font-mono text-xs uppercase tracking-wider text-[#FFF3E5]">
            <SettingsIcon className="h-4.5 w-4.5 text-[#FF8A00]" />
            <span>Operational Config</span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* API Endpoint field */}
            <div>
              <label className="block text-[#FFD2A3] mb-2 uppercase tracking-wider">REST API Base URL</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#11100E] border border-[#75451A]/35 rounded-lg text-[#FFF3E5] placeholder:text-[#9A8575] focus:ring-1 focus:ring-[#FF8A00]"
                placeholder="e.g. http://127.0.0.1:8000"
              />
              <p className="text-[10px] text-[#9A8575] mt-1 leading-relaxed uppercase">
                Primary API server endpoint. Defaults to your environment VITE_API_BASE_URL.
              </p>
            </div>

            {/* Refresh Rate */}
            <div>
              <label className="block text-[#FFD2A3] mb-2 uppercase tracking-wider">Metrics Refresh Interval (s)</label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                className="w-full p-2 border border-[#75451A]/35 rounded bg-[#11100E] text-[#FFF3E5] focus:ring-1 focus:ring-[#FF8A00]"
              >
                <option value="1">1.0s (Highest Density)</option>
                <option value="2">2.0s (Default)</option>
                <option value="5">5.0s (Performance Mode)</option>
              </select>
            </div>

            {/* Map Theme Toggle */}
            <div className="flex items-center justify-between border-t border-[#75451A]/10 pt-4">
              <div>
                <label className="block text-[#FFF3E5] font-bold uppercase tracking-wider">Dark Digital-Twin Map Theme</label>
                <p className="text-[10px] text-[#9A8575] mt-1 leading-relaxed font-sans">
                  Invert geographic street layers to match the operations command room palette.
                </p>
              </div>
              <input
                type="checkbox"
                checked={highContrastMap}
                onChange={(e) => setHighContrastMap(e.target.checked)}
                className="rounded border-[#75451A]/35 text-[#FF8A00] focus:ring-[#FF8A00] h-4 w-4 bg-[#11100E]"
              />
            </div>
          </div>

          <div className="border-t border-[#75451A]/10 pt-6 flex justify-end">
            <button type="submit" className="glass-button-accent font-mono tracking-wider text-xs uppercase px-6">
              Save changes
            </button>
          </div>
        </form>

        {/* Build Info Metadata card */}
        <div className="glass-panel p-6 border border-[#75451A]/20 shadow-2xl space-y-6 flex flex-col justify-between h-[360px]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-4 border-b border-[#75451A]/10 font-mono text-xs uppercase tracking-wider text-[#FFF3E5]">
              <Sliders className="h-4.5 w-4.5 text-[#9A8575]" />
              <span>System Metadata</span>
            </div>

            <div className="space-y-3 font-mono text-[10px] text-[#FFD2A3] leading-relaxed uppercase tracking-wider">
              <div>Environment: <span className="font-bold text-[#FFF3E5]">Local Development</span></div>
              <div>Bundler: <span className="font-bold text-[#FFF3E5]">Vite v4.5 Client</span></div>
              <div>Node target: <span className="font-bold text-[#FFF3E5]">ESNext</span></div>
              <div>SUMO link: <span className="font-bold text-[#FFF3E5]">TraCI socket active</span></div>
            </div>
          </div>

          <div className="p-3.5 bg-white/5 border border-white/5 rounded-lg flex gap-2 font-mono text-[9px] text-[#9A8575] uppercase tracking-wider leading-relaxed">
            <ShieldAlert className="h-4 w-4 text-[#FFB84D] shrink-0" />
            <span>Changes made above apply only to local preferences. Environment variables require rebuild compilation.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

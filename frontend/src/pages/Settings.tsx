import { useState } from "react";
import { Settings as SettingsIcon, Save, Info } from "lucide-react";
import { toast } from "../utils/toast";

export default function Settings() {
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000");
  const [mapTheme, setMapTheme] = useState("light-carto");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("ecotwin_api_url", apiUrl);
    toast("Settings saved successfully.", "success");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">System Settings</h1>
        <p className="text-text-secondary text-sm mt-1">
          Configure platform endpoints, map visualization layers, and local preferences.
        </p>
      </div>

      <div className="bg-white border border-border rounded-xl p-6 shadow-sm max-w-2xl">
        <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <SettingsIcon className="h-5 w-5 text-eco-green" />
            <h3 className="font-bold text-text-primary text-sm">Platform Configuration</h3>
          </div>

          {/* API URL */}
          <div className="space-y-1.5">
            <label className="block font-bold text-text-secondary uppercase">Vite API Base URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg font-mono text-text-primary"
            />
            <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
              Target endpoint for HTTP API requests. Defaults to the environment configuration URL.
            </p>
          </div>

          {/* Map theme */}
          <div className="space-y-1.5">
            <label className="block font-bold text-text-secondary uppercase">Basemap Theme</label>
            <select
              value={mapTheme}
              onChange={(e) => setMapTheme(e.target.value)}
              className="w-full p-2 bg-bg-secondary border border-border rounded-lg text-text-primary"
            >
              <option value="light-carto">CartoDB Light (Recommended)</option>
              <option value="osm-standard">OpenStreetMap Standard</option>
              <option value="satellite-view">Satellite Imagery</option>
            </select>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-eco-forest hover:bg-eco-forest/90 text-white rounded-lg font-semibold shadow-sm transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Configuration</span>
          </button>
        </form>
      </div>

      <div className="bg-bg-secondary border border-border rounded-xl p-4 text-[10px] text-text-muted max-w-2xl flex gap-2">
        <Info className="h-4.5 w-4.5 text-text-muted/65 shrink-0" />
        <span>Endpoint configuration changes require hot-reloading the browser to apply system-wide.</span>
      </div>
    </div>
  );
}

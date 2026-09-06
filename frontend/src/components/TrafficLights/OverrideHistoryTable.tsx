import React from "react";
import { History, CheckCircle, XCircle } from "lucide-react";
import { TrafficOverrideLog } from "../../types";

interface OverrideHistoryTableProps {
  logs: TrafficOverrideLog[];
  isLoading: boolean;
}

export const OverrideHistoryTable: React.FC<OverrideHistoryTableProps> = ({ logs, isLoading }) => {
  return (
    <div className="space-y-3 font-mono">
      <div className="flex justify-between items-center pb-2 border-b border-[rgba(255,183,106,0.12)]">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-brand-orange" />
          <h4 className="text-xs font-bold uppercase tracking-widest text-text-cream">
            MANUAL OVERRIDE AUDIT LOG
          </h4>
        </div>
        <span className="text-[10px] text-text-pale">
          Persistent Database Trace
        </span>
      </div>

      {isLoading ? (
        <div className="h-28 bg-[#120D09]/40 rounded-xl shimmer animate-pulse" />
      ) : logs && logs.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-[rgba(255,184,77,0.16)] bg-[#120D09]/50">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[10px] uppercase font-bold text-text-muted">
                <th className="py-2.5 px-3">TIME</th>
                <th className="py-2.5 px-3">JUNCTION</th>
                <th className="py-2.5 px-3">PREVIOUS PHASE</th>
                <th className="py-2.5 px-3">NEW PHASE</th>
                <th className="py-2.5 px-3">CONTROLLER</th>
                <th className="py-2.5 px-3">DURATION</th>
                <th className="py-2.5 px-3 text-right">RESULT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-text-cream">
              {logs.map((log) => {
                const isSuccess = log.result === "SUCCESS";
                return (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3 text-text-pale text-[11px]">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-bold text-brand-orange">{log.junction_id}</td>
                    <td className="py-2.5 px-3 text-text-pale">Phase {log.previous_phase}</td>
                    <td className="py-2.5 px-3 font-bold text-white">Phase {log.new_phase}</td>
                    <td className="py-2.5 px-3 text-text-pale uppercase text-[10px]">{log.controller}</td>
                    <td className="py-2.5 px-3 text-text-pale">{log.duration_sec}s</td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          isSuccess
                            ? "text-eco-success bg-eco-success/10 border border-eco-success/20"
                            : "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                        }`}
                      >
                        {isSuccess ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {log.result}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-text-muted border border-dashed border-[rgba(255,183,106,0.12)] rounded-xl font-mono">
          NO OVERRIDE EVENTS
        </div>
      )}
    </div>
  );
};

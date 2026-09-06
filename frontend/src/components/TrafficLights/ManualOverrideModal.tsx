import React from "react";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import { GlassModal } from "../glass/GlassModal";
import { GlassButton } from "../glass/GlassButton";

interface ManualOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  junctionId: string;
  targetPhaseIndex: number;
  currentPhaseIndex: number;
  targetPhaseName?: string;
  currentPhaseName?: string;
  isPending: boolean;
  errorMessage?: string | null;
}

export const ManualOverrideModal: React.FC<ManualOverrideModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  junctionId,
  targetPhaseIndex,
  currentPhaseIndex,
  targetPhaseName,
  currentPhaseName,
  isPending,
  errorMessage,
}) => {
  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="MANUAL SIGNAL OVERRIDE">
      <div className="space-y-5 font-mono">
        <div className="flex items-start gap-3 p-3.5 bg-brand-orange/10 border border-brand-orange/30 rounded-xl text-brand-orange text-xs leading-relaxed">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-white font-bold uppercase mb-0.5">HIGH-RISK CONTROL ACTION</strong>
            This action will temporarily override active signal program timers and force the junction into the requested phase state.
          </div>
        </div>

        <div className="bg-[#120D09] p-4 rounded-xl border border-white/10 space-y-2 text-xs">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-text-pale">Target Junction:</span>
            <strong className="text-brand-orange font-bold">{junctionId}</strong>
          </div>

          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-text-pale">Current Active Phase:</span>
            <span className="text-text-cream">
              Phase {currentPhaseIndex} ({currentPhaseName || "Active"})
            </span>
          </div>

          <div className="flex justify-between pt-1">
            <span className="text-text-pale">Requested Override Phase:</span>
            <strong className="text-eco-success font-bold">
              Phase {targetPhaseIndex} ({targetPhaseName || `Phase ${targetPhaseIndex}`})
            </strong>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <GlassButton onClick={onClose} variant="ghost" size="sm" className="font-mono text-xs">
            CANCEL
          </GlassButton>

          <GlassButton
            onClick={onConfirm}
            variant="primary"
            size="sm"
            disabled={isPending}
            className="font-mono text-xs text-white bg-brand-orange hover:bg-brand-orange/80"
          >
            {isPending ? "APPLYING OVERRIDE..." : "CONFIRM OVERRIDE"}
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
};

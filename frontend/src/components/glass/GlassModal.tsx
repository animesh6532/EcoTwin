import React from "react";
import { X } from "lucide-react";
import { GlassButton } from "./GlassButton";

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="w-full max-w-lg border rounded-[24px] p-6 space-y-4 shadow-2xl relative"
        style={{
          background: "rgba(18, 12, 8, 0.88)",
          borderColor: "rgba(255, 183, 106, 0.25)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)"
        }}
      >
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <h3 className="font-bold text-[#FFF3E5] text-sm uppercase tracking-wider font-sans">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-[#B89B82] hover:text-[#FFF3E5] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="space-y-4 font-mono text-xs text-[#FFE7CC] leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

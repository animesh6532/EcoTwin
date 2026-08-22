import React from "react";
import { X } from "lucide-react";

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
    <div className="fixed inset-0 z-[100] bg-[#120D09]/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="w-full max-w-lg border rounded-[24px] p-6 space-y-4 shadow-2xl relative"
        style={{
          background: "rgba(30, 24, 19, 0.92)",
          borderColor: "rgba(255, 184, 77, 0.25)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.08)"
        }}
      >
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <h3 className="font-bold text-[#FFF7ED] text-sm uppercase tracking-wider font-sans">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-[#A9947D] hover:text-[#FFF7ED] transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        
        <div className="space-y-4 font-mono text-xs text-[#D6C3AE] leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

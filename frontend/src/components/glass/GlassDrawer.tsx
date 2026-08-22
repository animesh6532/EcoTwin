import React from "react";
import { X } from "lucide-react";

interface GlassDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const GlassDrawer: React.FC<GlassDrawerProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  return (
    <div 
      className={`fixed top-24 bottom-6 right-6 w-96 border rounded-[22px] p-6 space-y-4 shadow-2xl z-[90] font-mono text-xs transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-[420px]"
      }`}
      style={{
        background: "rgba(30, 24, 19, 0.88)",
        borderColor: "rgba(255, 184, 77, 0.22)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.07)"
      }}
    >
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <h3 className="font-bold text-[#FFF7ED] text-[11px] uppercase tracking-widest">{title}</h3>
        <button 
          onClick={onClose} 
          className="text-[#A9947D] hover:text-[#FFF7ED] transition-colors"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="space-y-4 h-[calc(100%-3rem)] overflow-y-auto scrollbar-none pr-1 text-[#D6C3AE] leading-relaxed">
        {children}
      </div>
    </div>
  );
};

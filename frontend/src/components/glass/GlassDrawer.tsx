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
      className={`fixed right-0 top-0 bottom-0 z-50 w-80 border-l transition-transform duration-300 flex flex-col ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      style={{
        background: "rgba(18, 12, 8, 0.92)",
        borderColor: "rgba(255, 183, 106, 0.15)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "-10px 0 40px rgba(0,0,0,0.5)"
      }}
    >
      <div className="p-4 border-b border-[rgba(255,183,106,0.12)] flex justify-between items-center shrink-0">
        <h3 className="font-bold text-[#FFF3E5] text-xs font-mono uppercase tracking-wider">{title}</h3>
        <button 
          onClick={onClose} 
          className="text-[#B89B82] hover:text-[#FFF3E5] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {children}
      </div>
    </div>
  );
};

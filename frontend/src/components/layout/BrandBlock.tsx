import React from "react";
import { Leaf } from "lucide-react";

interface BrandBlockProps {
  onNavigate: (path: string) => void;
}

export const BrandBlock: React.FC<BrandBlockProps> = ({ onNavigate }) => {
  return (
    <div className="flex items-center shrink-0 border-r border-white/10 pr-4 mr-2 h-9">
      <button 
        onClick={() => onNavigate("/")}
        className="group flex items-center gap-2.5 hover:opacity-90 transition-opacity text-left cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF8A00] rounded-lg p-1"
        aria-label="EcoTwin Home - Return to Landing Page"
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-[#FF8A00]/25 blur-md rounded-full scale-125 group-hover:scale-150 transition-transform" />
          <Leaf className="text-[#FF8A00] h-4.5 w-4.5 relative z-10 animate-pulse" strokeWidth={2.5} />
        </div>
        
        <div className="flex flex-col justify-center select-none">
          <span className="font-bold text-[#FFF7ED] text-xs tracking-[0.2em] font-mono uppercase leading-none">
            EcoTwin
          </span>
          <span className="text-[8px] text-[#A89582] tracking-wider uppercase font-mono mt-0.5 font-bold leading-none">
            Operations
          </span>
        </div>
      </button>
    </div>
  );
};

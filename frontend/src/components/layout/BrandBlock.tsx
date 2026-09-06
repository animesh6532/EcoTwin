import React from "react";
import { Leaf } from "lucide-react";

interface BrandBlockProps {
  onNavigate: (path: string) => void;
}

export const BrandBlock: React.FC<BrandBlockProps> = ({ onNavigate }) => {
  return (
    <div className="flex items-center shrink-0 border-r border-white/10 pr-2 xl:pr-2.5 mr-1 xl:mr-1.5 h-8 w-[135px] xl:w-[150px]">
      <button 
        onClick={() => onNavigate("/")}
        className="group flex items-center gap-1.5 hover:opacity-90 transition-opacity text-left cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF8A00] rounded-lg p-0.5 shrink-0"
        aria-label="EcoTwin Home - Return to Landing Page"
      >
        <div className="relative flex items-center justify-center shrink-0">
          <div className="absolute inset-0 bg-[#FF8A00]/25 blur-md rounded-full scale-125 group-hover:scale-150 transition-transform" />
          <Leaf className="text-[#FF8A00] h-3.5 w-3.5 xl:h-4 xl:w-4 relative z-10 animate-pulse" strokeWidth={2.5} />
        </div>
        
        <div className="flex flex-col justify-center select-none whitespace-nowrap shrink-0">
          <span className="font-bold text-[#FFF7ED] text-[10.5px] xl:text-[11.5px] tracking-[0.18em] font-mono uppercase leading-none">
            EcoTwin
          </span>
          <span className="text-[7px] xl:text-[7.5px] text-[#A89582] tracking-wider uppercase font-mono mt-0.5 font-bold leading-none">
            Operations
          </span>
        </div>
      </button>
    </div>
  );
};



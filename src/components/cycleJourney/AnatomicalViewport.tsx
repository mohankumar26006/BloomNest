import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";

export interface AnatomicalViewportProps {
  selectedDay: number;
  cycleLength: number;
  periodDuration: number;
  estimatedOvulationDay: number;
  isFertileWindow: boolean;
  isPeakDay: boolean;
  isPeriod: boolean;
  phaseName: string;
}

export const AnatomicalViewport: React.FC<AnatomicalViewportProps> = ({
  selectedDay,
  isFertileWindow,
  isPeakDay,
  isPeriod,
}) => {

  // Dynamic 3D Medical Render Image Mapping - 28 distinct renders for Day 1 to Day 28
  const getPhaseImage = () => {
    const dayNum = Math.min(Math.max(1, selectedDay), 28);
    return `/images/cycle-journey/day${dayNum}.jpg`;
  };

  const activeImage = getPhaseImage();

  return (
    <div className="relative w-full aspect-[16/9] max-h-[520px] min-h-[350px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a1222] via-[#140e1b] to-[#0d0912] border border-rose-900/40 shadow-2xl flex items-center justify-center p-0">
      
      {/* Background Soft Glow & Phase Environment Lighting */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
          isPeakDay
            ? "bg-radial from-amber-500/25 via-rose-500/10 to-transparent opacity-100"
            : isFertileWindow
            ? "bg-radial from-teal-500/25 via-emerald-500/10 to-transparent opacity-100"
            : isPeriod
            ? "bg-radial from-rose-600/25 via-pink-500/10 to-transparent opacity-100"
            : "bg-radial from-purple-600/20 via-pink-500/5 to-transparent opacity-100"
        }`}
      />

      {/* FULL FRAME 3D STUDIO CONTAINER */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        
        {/* Orbital Spinning Rings Effect */}
        <div className="absolute inset-[-15px] sm:inset-[-25px] rounded-full border border-rose-400/20 border-dashed animate-[spin_40s_linear_infinite] pointer-events-none z-10" />
        <div className="absolute inset-[-35px] sm:inset-[-45px] rounded-full border border-purple-400/15 animate-[spin_30s_linear_infinite_reverse] pointer-events-none z-10" />
        <div className="absolute inset-[-55px] sm:inset-[-65px] rounded-full border-[0.5px] border-white/10 animate-[spin_50s_linear_infinite] pointer-events-none z-10" />

        {/* Orbiting Particle Sparkles */}
        <div className="absolute top-4 right-12 w-2 h-2 bg-amber-300 rounded-full shadow-[0_0_12px_#fef08a] animate-pulse z-10" />
        <div className="absolute bottom-8 left-8 w-1.5 h-1.5 bg-rose-400 rounded-full shadow-[0_0_10px_#fda4af] animate-pulse z-10" />

        {/* Full-bleed 3D Render Image fitting edge-to-edge in Frame */}
        <div className="relative w-full h-full flex items-center justify-center rounded-3xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={`${activeImage}_${selectedDay}`}
              src={activeImage}
              alt={`Realistic 3D medical visual render for cycle day ${selectedDay}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full h-full object-cover object-center transition-all duration-300"
              style={{
                filter: `brightness(${1 + ((selectedDay % 4) * 0.025)}) contrast(${1 + ((selectedDay % 3) * 0.02)})`,
              }}
            />
          </AnimatePresence>

          {/* Soft Edge Glow Overlay to blend seamlessly into container */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 border border-white/10 rounded-3xl pointer-events-none" />
        </div>

        {/* Medical Disclaimer Banner */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1 rounded-xl border border-rose-800/40 text-[10px] text-rose-300/90 flex items-center gap-1.5 shrink-0 whitespace-nowrap shadow-md z-20">
          <Info className="w-3 h-3 text-rose-400" />
          <span>Illustrative 3D medical visualization — Not a medical diagnosis</span>
        </div>

      </div>
    </div>
  );
};

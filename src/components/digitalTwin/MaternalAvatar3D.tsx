import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AvatarVisualState } from "../../types/digitalTwin";
import {
  Sparkles,
  Heart,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Moon,
  Smile,
  AlertCircle,
} from "lucide-react";

interface MaternalAvatar3DProps {
  state: AvatarVisualState;
  trimester?: number;
  gestationalWeek?: number;
  label?: string;
  reason?: string;
}

export const MaternalAvatar3D: React.FC<MaternalAvatar3DProps> = ({
  state,
  trimester = 2,
  gestationalWeek = 24,
  label = "Calm & Steady",
  reason,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Map each deterministic avatar state to photorealistic maternal avatar visuals
  const getStateImage = (currentState: AvatarVisualState) => {
    switch (currentState) {
      case "POSITIVE":
        return "/images/digital-twin/positive.jpg";
      case "TIRED":
        return "/images/digital-twin/tired.jpg";
      case "DISCOMFORT":
        return "/images/digital-twin/discomfort.jpg";
      case "ATTENTION":
        return "/images/digital-twin/attention.jpg";
      case "LOW_MOOD":
        return "/images/digital-twin/low_mood.jpg";
      case "STABLE":
      default:
        return "/images/digital-twin/stable.jpg";
    }
  };

  const activeImage = getStateImage(state);

  // Flat, soft pastel state colors (no neon glows, no dark sci-fi auras)
  const getStateConfig = () => {
    switch (state) {
      case "POSITIVE":
        return {
          badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          icon: Sparkles,
        };
      case "TIRED":
        return {
          badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
          dot: "bg-sky-400",
          icon: Moon,
        };
      case "DISCOMFORT":
        return {
          badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-400",
          icon: Heart,
        };
      case "LOW_MOOD":
        return {
          badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
          dot: "bg-purple-400",
          icon: Smile,
        };
      case "ATTENTION":
        return {
          badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
          dot: "bg-amber-500",
          icon: AlertCircle,
        };
      case "STABLE":
      default:
        return {
          badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          icon: Sparkles,
        };
    }
  };

  const config = getStateConfig();
  const IconComponent = config.icon;

  return (
    <div className="relative w-full h-full min-h-[460px] sm:min-h-[520px] rounded-3xl overflow-hidden bg-gradient-to-b from-purple-50/60 via-white to-purple-50/30 border border-purple-100 shadow-sm flex flex-col justify-between p-4 sm:p-5 select-none transition-colors">
      {/* Top Status & Pregnancy Context Bar */}
      <div className="relative z-10 flex items-center justify-between pointer-events-auto gap-2">
        <div className="flex items-center gap-2">
          {/* Gentle Status Badge */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-xs transition-colors ${config.badgeBg}`}
          >
            <span className={`w-2 h-2 rounded-full ${config.dot}`} />
            <IconComponent className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold tracking-wide">{label}</span>
          </div>

          {/* Gentle Fetal Heartbeat Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-purple-100 text-gray-600 text-[11px] font-medium shadow-xs">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-300" />
            <span>Fetal Heartbeat ~140 BPM</span>
          </div>
        </div>

        {/* Gestational Context */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-purple-800 bg-purple-100/70 px-3 py-1 rounded-full border border-purple-200/60 shadow-xs">
            Week {gestationalWeek} · Trimester {trimester}
          </span>
        </div>
      </div>

      {/* Center Photorealistic Maternal Avatar Viewport */}
      <div className="relative z-5 flex-1 flex items-center justify-center overflow-hidden my-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: zoomLevel }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="relative w-full h-full max-h-[480px] sm:max-h-[520px] flex items-center justify-center"
          >
            <img
              src={activeImage}
              alt={`Maternal Avatar - ${label}`}
              className="w-full h-full max-h-[480px] sm:max-h-[520px] object-cover object-center rounded-2xl shadow-sm transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel})` }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Reassurance Note & Interactive Zoom Controls */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-auto pt-1">
        {/* Supportive Note */}
        <div className="max-w-md text-center sm:text-left">
          {reason && (
            <div className="px-3.5 py-1.5 rounded-xl bg-white/95 border border-purple-100 text-[11px] text-gray-600 font-medium shadow-xs">
              {reason}
            </div>
          )}
        </div>

        {/* Soft Pastel Zoom Controls Pill */}
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm p-1 rounded-2xl border border-purple-100 shadow-sm ml-auto">
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            title="Reset Zoom"
            className="p-1.5 rounded-xl text-gray-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.min(prev + 0.15, 1.4))}
            title="Zoom In"
            className="p-1.5 rounded-xl text-gray-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.max(prev - 0.15, 0.85))}
            title="Zoom Out"
            className="p-1.5 rounded-xl text-gray-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { Signal, Wifi, Battery, Smartphone, Monitor } from "lucide-react";

export const MobileStatusBar: React.FC<{
  isDeviceFrame: boolean;
  onToggleFrame: () => void;
}> = ({ isDeviceFrame, onToggleFrame }) => {
  const [timeStr, setTimeStr] = useState("9:41");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12;
      setTimeStr(`${formattedHours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#fdf2f5] dark:bg-[#120d18] border-b border-pink-200/60 dark:border-rose-950 px-4 py-1.5 flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-rose-200 select-none z-30">
      {/* Time */}
      <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-pink-700 dark:text-pink-300">
        <span>{timeStr}</span>
        <span className="text-[9px] px-1.5 py-0.2 rounded bg-pink-100 dark:bg-rose-950 text-pink-700 dark:text-pink-300 font-sans font-extrabold uppercase">
          BloomNest iOS
        </span>
      </div>

      {/* Dynamic Notch / Camera Capsule indicator in device view */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gray-900 text-white text-[10px] font-mono shadow-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Mama Care OS 18</span>
      </div>

      {/* Right Controls: Device Mode Toggle + Signal / Battery */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleFrame}
          className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-rose-950/80 border border-pink-200 dark:border-rose-900 text-pink-600 dark:text-pink-300 shadow-2xs hover:bg-pink-50 transition-colors"
          title="Toggle Mobile Device Frame"
        >
          {isDeviceFrame ? (
            <>
              <Monitor className="w-3 h-3 text-purple-600" />
              <span>Full Screen</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3 h-3 text-pink-600" />
              <span>Phone Frame</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1.5 text-gray-600 dark:text-rose-300">
          <Signal className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
          <Wifi className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
          <Battery className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useCallback } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export interface CycleTimelineSliderProps {
  selectedDay: number;
  onSelectDay: (day: number) => void;
  cycleLength: number;
  periodDuration: number;
  estimatedOvulationDay: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const CycleTimelineSlider: React.FC<CycleTimelineSliderProps> = ({
  selectedDay,
  onSelectDay,
  cycleLength,
  periodDuration,
  estimatedOvulationDay,
  isPlaying,
  onTogglePlay,
}) => {

  const handlePrev = useCallback(() => {
    onSelectDay(selectedDay > 1 ? selectedDay - 1 : cycleLength);
  }, [selectedDay, cycleLength, onSelectDay]);

  const handleNext = useCallback(() => {
    onSelectDay(selectedDay < cycleLength ? selectedDay + 1 : 1);
  }, [selectedDay, cycleLength, onSelectDay]);

  // Keyboard Navigation Support (Left/Right arrows, Spacebar for play/pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing inside an input or textarea
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === " ") {
        e.preventDefault();
        onTogglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext, onTogglePlay]);

  return (
    <div className="w-full space-y-4">
      
      {/* Controls Bar: Play/Pause Button + Slider + Previous/Next Buttons */}
      <div className="flex items-center gap-3 bg-white/80 dark:bg-[#15201c]/80 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm">
        <button
          onClick={onTogglePlay}
          aria-label={isPlaying ? "Pause cycle journey" : "Play cycle journey"}
          className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0 transition-transform active:scale-95"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        {/* Scrubbable Range Slider */}
        <div className="flex-1 relative flex items-center px-1">
          <input
            type="range"
            min={1}
            max={cycleLength}
            value={selectedDay}
            onChange={(e) => onSelectDay(parseInt(e.target.value, 10))}
            aria-label="Select cycle day"
            className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600 dark:accent-purple-400 focus:outline-none"
          />
        </div>

        {/* Previous Day & Next Day Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handlePrev}
            aria-label="Previous cycle day"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next cycle day"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 28-35 Day Visual Timeline Pills Stream */}
      <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {Array.from({ length: cycleLength }).map((_, idx) => {
            const day = idx + 1;
            const isSelected = day === selectedDay;
            const isPeak = day === estimatedOvulationDay;
            const isFertile = day >= estimatedOvulationDay - 4 && day <= estimatedOvulationDay + 1;
            const isPeriod = day <= periodDuration;

            return (
              <button
                key={day}
                onClick={() => onSelectDay(day)}
                className={`w-8 h-8 rounded-full flex flex-col items-center justify-center text-[11px] font-bold transition-all relative ${
                  isSelected
                    ? "ring-2 ring-purple-600 scale-110 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md font-extrabold z-10"
                    : isPeak
                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700"
                    : isFertile
                    ? "bg-teal-100 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-800"
                    : isPeriod
                    ? "bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800"
                    : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800"
                }`}
              >
                <span>{day}</span>
                {isPeak && !isSelected && (
                  <Sparkles className="w-2.5 h-2.5 text-amber-500 absolute -top-0.5 -right-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Phase Color Legend Bar */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-600 dark:text-slate-400 pt-1 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-400" />
          <span>Period Days</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Early Follicular Phase</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-teal-400" />
          <span>Fertile Window</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-400 flex items-center justify-center text-[8px]">✨</span>
          <span>Peak Ovulation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-purple-400" />
          <span>Luteal Phase</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { AnatomicalViewport } from "../components/cycleJourney/AnatomicalViewport";
import { CycleTimelineSlider } from "../components/cycleJourney/CycleTimelineSlider";
import { CyclePhaseCards } from "../components/cycleJourney/CyclePhaseCards";
import { CycleIntelligencePanel } from "../components/cycleJourney/CycleIntelligencePanel";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ArrowLeft, Sparkles, Calendar, Droplet, TrendingUp, Info } from "lucide-react";

export const CycleJourneyPage: React.FC = () => {
  const { user, setActivePage } = useApp();

  // Read Cycle Parameters dynamically from user profile or preconception state
  const cycleLength = user.prePregnancyDetails?.cycleLengthDays || 28;
  const periodDuration = 5; // Standard period duration
  const lastPeriodDateStr = user.prePregnancyDetails?.lastPeriodDate || user.lmpDate || "2026-08-28";

  // Calculate current cycle day (Normalized to midnight local time)
  const calculateCurrentCycleDay = () => {
    try {
      const [sy, sm, sd] = lastPeriodDateStr.split("-").map(Number);
      const startMidnight = new Date(sy, (sm || 1) - 1, sd || 1, 0, 0, 0, 0);
      const today = new Date();
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
      const diffMs = todayMidnight.getTime() - startMidnight.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const safeDiffDays = Math.max(0, diffDays);
      return (safeDiffDays % cycleLength) + 1;
    } catch {
      return 14;
    }
  };

  const currentCycleDay = calculateCurrentCycleDay();
  const estimatedOvulationDay = Math.max(1, cycleLength - 14);

  // Local Page State for Interactive Timeline Exploration
  const [selectedDay, setSelectedDay] = useState<number>(currentCycleDay);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Read logged observations from localStorage (bloom_pre_cycleLogs)
  const loggedObservations = useMemo(() => {
    try {
      const saved = localStorage.getItem("bloom_pre_cycleLogs");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  }, []);

  // Find observation for selected day if present
  const todayLog = useMemo(() => {
    return loggedObservations.find((l: any) => l.cycleDay === selectedDay);
  }, [loggedObservations, selectedDay]);

  // Derived phase & window calculations for selectedDay
  const isSelectedPeakDay = selectedDay === estimatedOvulationDay;
  const isSelectedFertileWindow = selectedDay >= estimatedOvulationDay - 4 && selectedDay <= estimatedOvulationDay + 1;
  const isSelectedPeriod = selectedDay <= periodDuration;

  const getPhaseName = (day: number) => {
    if (day <= periodDuration) return "Menstruation";
    if (day < estimatedOvulationDay - 4) return "Egg Preparation";
    if (day === estimatedOvulationDay) return "Peak Ovulation";
    if (day >= estimatedOvulationDay - 4 && day <= estimatedOvulationDay + 1) return "Fertile Window";
    return "Post-Ovulation Window";
  };

  const currentPhaseName = getPhaseName(selectedDay);

  // Auto-play animation interval effect
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSelectedDay((prev) => (prev < cycleLength ? prev + 1 : 1));
      }, 1500); // Advance 1 day every 1.5 seconds smoothly
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, cycleLength]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => setActivePage("dashboard")}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
              Cycle Journey
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200 text-[10px] font-black border border-purple-200 dark:border-purple-800">
                3D Visual
              </span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-rose-950 dark:text-rose-50">
            Cycle Journey 3D
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-rose-300/80 mt-0.5">
            Explore how your body changes throughout your cycle
          </p>
        </div>

        {/* Dynamic Current Cycle Day Badge Header */}
        <div className="flex items-center gap-3 bg-white/90 dark:bg-[#15201c]/90 backdrop-blur-md p-3 rounded-2xl border border-rose-100 dark:border-rose-900/40 shadow-sm shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">Current Cycle Day</div>
            <div className="text-base font-black text-rose-950 dark:text-rose-100 mt-0.5">
              Day {currentCycleDay} <span className="text-xs font-normal text-slate-500">of {cycleLength} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN 3D ANATOMICAL VIEWPORT + CONTEXT SIDE CARD (DESKTOP LAYOUT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Anatomical Viewport (Spans 2 columns on desktop) */}
        <div className="lg:col-span-2">
          <AnatomicalViewport
            selectedDay={selectedDay}
            cycleLength={cycleLength}
            periodDuration={periodDuration}
            estimatedOvulationDay={estimatedOvulationDay}
            isFertileWindow={isSelectedFertileWindow}
            isPeakDay={isSelectedPeakDay}
            isPeriod={isSelectedPeriod}
            phaseName={currentPhaseName}
          />
        </div>

        {/* Right Side Context Card: Selected Day Status & Cycle Petails */}
        <Card variant="glass" className="p-5 border-rose-100 dark:border-rose-900/40 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            
            {/* Selected Day Header */}
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Current Selected Day
              </div>
              <div className="text-2xl font-black text-rose-950 dark:text-rose-50 flex items-center gap-2 mt-0.5">
                Day {selectedDay}
              </div>
              
              {/* Dynamic Status Badge */}
              <div className="mt-2">
                {isSelectedPeakDay ? (
                  <Badge variant="success" className="bg-amber-500 text-white font-extrabold px-3 py-1 text-xs">
                    Estimated Peak Ovulation Day 🔥
                  </Badge>
                ) : isSelectedFertileWindow ? (
                  <Badge variant="warning" className="bg-teal-600 text-white font-bold px-3 py-1 text-xs">
                    Estimated Fertile Window 🌱
                  </Badge>
                ) : isSelectedPeriod ? (
                  <Badge variant="neutral" className="bg-rose-600 text-white font-bold px-3 py-1 text-xs">
                    Menstruation Period 🩸
                  </Badge>
                ) : (
                  <Badge variant="neutral" className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-3 py-1 text-xs">
                    Follicular / Luteal Phase
                  </Badge>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-rose-300/80 mt-2 leading-relaxed">
                You're exploring Day {selectedDay} of your {cycleLength}-day cycle setup.
              </p>
            </div>

            {/* Current Phase Educational Brief */}
            <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-1">
              <div className="text-xs font-bold text-rose-950 dark:text-rose-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>{currentPhaseName}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-rose-300/80 leading-snug">
                {isSelectedPeakDay
                  ? "The mature egg is released from the ovary. Fertility is at its highest point."
                  : isSelectedFertileWindow
                  ? "Estrogen levels rise as dominant follicle matures. Higher probability of conception."
                  : isSelectedPeriod
                  ? "Endometrial uterine lining sheds. Rest and gentle hydration are recommended."
                  : "Post-ovulation luteal phase. Progesterone maintains uterine lining health."}
              </p>
            </div>

            {/* Cycle Parameters Detail Box */}
            <div className="space-y-2 pt-2 border-t border-rose-100 dark:border-rose-900/30 text-xs">
              <div className="font-bold text-rose-950 dark:text-rose-100">Cycle Setup Details</div>
              <div className="flex items-center justify-between text-slate-600 dark:text-rose-300/80">
                <span>Average Cycle Length:</span>
                <strong className="text-rose-950 dark:text-rose-100">{cycleLength} days</strong>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-rose-300/80">
                <span>Period Duration:</span>
                <strong className="text-rose-950 dark:text-rose-100">{periodDuration} days</strong>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-rose-300/80">
                <span>Last Period (LMP):</span>
                <strong className="text-rose-950 dark:text-rose-100">{lastPeriodDateStr}</strong>
              </div>
            </div>

          </div>

          <Button
            variant="secondary"
            className="w-full py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 font-bold text-xs rounded-xl"
            onClick={() => setActivePage("dashboard")}
          >
            Return to Dashboard
          </Button>
        </Card>

      </div>

      {/* 3. CYCLE TIMELINE SLIDER CONTROLLER */}
      <Card variant="glass" className="p-5 border-rose-100 dark:border-rose-900/40">
        <CycleTimelineSlider
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          cycleLength={cycleLength}
          periodDuration={periodDuration}
          estimatedOvulationDay={estimatedOvulationDay}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
        />
      </Card>

      {/* 4. THE 5 PHASES OF YOUR CYCLE CARDS */}
      <CyclePhaseCards
        selectedDay={selectedDay}
        cycleLength={cycleLength}
        periodDuration={periodDuration}
        estimatedOvulationDay={estimatedOvulationDay}
      />

      {/* 5. YOUR CYCLE INTELLIGENCE PANEL */}
      <CycleIntelligencePanel
        selectedDay={selectedDay}
        currentCycleDay={currentCycleDay}
        cervicalMucusObserved={todayLog?.cervicalMucus}
        lhTestObserved={todayLog?.lhTest}
        isFertileWindow={isSelectedFertileWindow}
        isPeakDay={isSelectedPeakDay}
      />

    </div>
  );
};

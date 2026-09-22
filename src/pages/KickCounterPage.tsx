import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  Footprints,
  Play,
  CheckCircle2,
  RotateCcw,
  Save,
  Sparkles,
  Clock,
  Heart,
  AlertTriangle,
  TrendingDown,
  Info,
  ShieldAlert,
  GlassWater,
  Bed,
  PhoneCall,
  Activity,
} from "lucide-react";

export const KickCounterPage: React.FC = () => {
  const { kickSessions, addKickSession, setActivePage, showToast, t } = useApp();

  const [isActive, setIsActive] = useState(false);
  const [kickCount, setKickCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [kickTimestamps, setKickTimestamps] = useState<number[]>([]);
  const [notes, setNotes] = useState("");
  const [showLowMovementGuide, setShowLowMovementGuide] = useState(false);

  const GOAL_KICKS = 10;

  // Real-time timer
  useEffect(() => {
    let interval: any = null;
    if (isActive && sessionStartTime) {
      interval = setInterval(() => {
        const next = Math.floor((Date.now() - sessionStartTime) / 1000);
        setElapsedSeconds(next);
        if (next >= 7200 && kickCount < GOAL_KICKS) {
          setShowLowMovementGuide(true);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, kickCount, sessionStartTime]);

  const handleStart = () => {
    setIsActive(true);
    setSessionStartTime(Date.now());
    setKickCount(0);
    setElapsedSeconds(0);
    setKickTimestamps([]);
    setShowLowMovementGuide(false);
  };

  const handleKickTap = () => {
    if (!isActive) {
      setIsActive(true);
      setSessionStartTime(Date.now());
    }
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      try { window.navigator.vibrate(50); } catch (e) {}
    }

    const now = Date.now();
    setKickTimestamps((prev) => [...prev, now]);
    setKickCount((prev) => {
      const updated = prev + 1;
      if (updated === GOAL_KICKS) {
        showToast(t("kickGoalReached"));
      }
      return updated;
    });
  };

  const handleReset = () => {
    setIsActive(false);
    setSessionStartTime(null);
    setKickCount(0);
    setElapsedSeconds(0);
    setKickTimestamps([]);
    setShowLowMovementGuide(false);
  };

  const handleSave = () => {
    if (kickCount === 0) return;
    const minutes = Math.max(1, Math.round(elapsedSeconds / 60));
    addKickSession({
      date: new Date().toISOString().split("T")[0],
      sessionStartTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      kickCount,
      durationMinutes: minutes,
      notes: notes || (kickCount < 10 ? t("decreasedMovement") : t("normalKicks")),
    });

    if (kickCount < GOAL_KICKS && minutes >= 60) {
      setShowLowMovementGuide(true);
    } else {
      handleReset();
      setNotes("");
    }
  };

  const calculateKickIntervals = () => {
    if (kickTimestamps.length < 2) return [];
    const intervals: number[] = [];
    for (let i = 1; i < kickTimestamps.length; i++) {
      const diffSec = Math.round((kickTimestamps[i] - kickTimestamps[i - 1]) / 1000);
      intervals.push(diffSec);
    }
    return intervals;
  };

  const intervals = calculateKickIntervals();
  const avgIntervalSec =
    intervals.length > 0 ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length) : 0;

  const historicalAvgMinutes =
    kickSessions.length > 0
      ? Math.round(kickSessions.reduce((acc, s) => acc + s.durationMinutes, 0) / kickSessions.length)
      : 22;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <Footprints className="w-4 h-4" />
            <span>{t("fetalMovementScreening")}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            {t("kickCounterTitle")}
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
            {t("kickCounterSubtitle")}
          </p>
        </div>

        <button
          onClick={() => setShowLowMovementGuide((prev) => !prev)}
          className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-amber-100 transition-all shrink-0"
        >
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>{t("lowMovementProtocol")}</span>
        </button>
      </div>

      {/* AUTOMATED SAFETY THRESHOLD ALERT CARD */}
      {(showLowMovementGuide || (elapsedSeconds >= 7200 && kickCount < GOAL_KICKS)) && (
        <div className="p-6 rounded-3xl bg-red-600 text-white shadow-xl space-y-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-start justify-between border-b border-white/20 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold">{t("obstetricSafetyAdvisory")}</h3>
                <p className="text-xs text-amber-100">
                  {t("fewerThan10Kicks")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowLowMovementGuide(false)}
              className="text-xs font-bold bg-white/20 px-3 py-1 rounded-xl hover:bg-white/30"
            >
              {t("dismiss")}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15 space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-100">
                <GlassWater className="w-4 h-4 text-cyan-200" />
                <span>{t("hydrateSnack")}</span>
              </div>
              <p className="text-[11px] opacity-90">{t("hydrateSnackDesc")}</p>
            </div>

            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15 space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-100">
                <Bed className="w-4 h-4 text-emerald-200" />
                <span>{t("leftSideRest")}</span>
              </div>
              <p className="text-[11px] opacity-90">{t("leftSideRestDesc")}</p>
            </div>

            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15 space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-100">
                <PhoneCall className="w-4 h-4 text-rose-200" />
                <span>{t("reCount1Hour")}</span>
              </div>
              <p className="text-[11px] opacity-90">{t("reCount1HourDesc")}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={() => setActivePage("emergency")}
              className="px-5 py-2.5 rounded-2xl bg-white text-red-700 font-extrabold text-xs shadow-md hover:bg-red-50 flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{t("contactEmergencyOBGYN")}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Counter Stage */}
      <div className="p-8 rounded-3xl bg-rose-600 text-white shadow-xl flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
        <div className="text-xs font-bold px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{t("elapsedTime")}: {formatTime(elapsedSeconds)}</span>
        </div>

        {/* 1-Tap Big Responsive Kick Button */}
        <div className="relative">
          <button
            onClick={handleKickTap}
            className="w-48 h-48 rounded-full bg-white text-rose-600 shadow-2xl flex flex-col items-center justify-center hover:bg-rose-50 transition-colors group relative z-10"
          >
            <Footprints className="w-11 h-11 group-hover:animate-bounce text-rose-500" />
            <span className="text-5xl font-extrabold my-1 text-gray-900 font-serif">{kickCount}</span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-500 bg-rose-50 px-3 py-0.5 rounded-full">
              {t("oneTapKickLog")}
            </span>
          </button>
          {isActive && (
            <div className="absolute inset-0 rounded-full border-4 border-white/40 animate-ping pointer-events-none" />
          )}
        </div>

        {kickCount >= GOAL_KICKS && (
          <div className="p-3 px-6 rounded-2xl bg-amber-400 text-rose-950 font-extrabold text-xs animate-bounce flex items-center gap-2 shadow-lg">
            <Sparkles className="w-4 h-4" />
            <span>{t("targetReached", { minutes: Math.round(elapsedSeconds / 60) })}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t("resetTimer")}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={kickCount === 0}
            className="px-6 py-2.5 rounded-xl bg-white text-rose-600 hover:bg-rose-50 disabled:opacity-50 font-bold text-xs shadow-md flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{t("saveSession")}</span>
          </button>
        </div>
      </div>

      {/* KICK VELOCITY ANALYTICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1a1523] p-5 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-rose-300">
            <Activity className="w-4 h-4 text-purple-500" />
            <span>{t("currentSessionPace")}</span>
          </div>
          <div className="text-2xl font-serif font-extrabold text-gray-900 dark:text-rose-100">
            {kickCount > 0 ? (elapsedSeconds / Math.max(1, kickCount) / 60).toFixed(1) : "0.0"} <span className="text-xs font-normal">{t("minPerKick")}</span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-rose-400">
            {t("avgIntervalDesc")}
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a1523] p-5 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-rose-300">
            <Clock className="w-4 h-4 text-rose-500" />
            <span>{t("historicalAvg10Kicks")}</span>
          </div>
          <div className="text-2xl font-serif font-extrabold text-gray-900 dark:text-rose-100">
            ~{historicalAvgMinutes} <span className="text-xs font-normal">{t("mins")}</span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-rose-400">
            {t("historicalDFMC")}
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a1523] p-5 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-rose-300">
            <Info className="w-4 h-4 text-blue-500" />
            <span>{t("lastInterKickInterval")}</span>
          </div>
          <div className="text-2xl font-serif font-extrabold text-gray-900 dark:text-rose-100">
            {intervals.length > 0 ? `${intervals[intervals.length - 1]}s` : "--"}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-rose-400">
            {t("kickIntervalDesc", { prev: Math.max(1, kickCount - 1), curr: kickCount })}
          </p>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-rose-500" />
          <span>{t("historicalKickSessions")}</span>
        </h3>

        <div className="space-y-2.5">
          {kickSessions.map((session) => (
            <div
              key={session.id}
              className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-center justify-between text-xs"
            >
              <div className="space-y-1">
                <div className="font-bold text-rose-900 dark:text-rose-100 text-sm">
                  {t("kicksRecorded", { count: session.kickCount, mins: session.durationMinutes })}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-rose-400">
                  {session.date} at {session.sessionStartTime} · {t("pace")}: ~{(session.durationMinutes / Math.max(1, session.kickCount)).toFixed(1)}{t("mKick")}
                </div>
                {session.notes && (
                  <div className="text-[11px] text-rose-600 dark:text-rose-300 italic">
                    "{session.notes}"
                  </div>
                )}
              </div>

              <span className={`px-3 py-1 rounded-full font-bold text-[10px] ${
                session.kickCount >= 10
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-200"
                  : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200"
              }`}>
                {session.kickCount >= 10 ? t("normalActive") : t("decreasedCount")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

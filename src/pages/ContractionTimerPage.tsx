import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Clock, Play, Square, AlertTriangle, Activity, Heart, PhoneCall, ShieldCheck, Info, CheckCircle2, Siren } from "lucide-react";

export const ContractionTimerPage: React.FC = () => {
  const { contractions, addContraction, setActivePage, showToast, t } = useApp();

  const [isRunning, setIsRunning] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [intensity, setIntensity] = useState<"mild" | "moderate" | "severe">("moderate");
  const [lastContractionStart, setLastContractionStart] = useState<number | null>(null);
  const [lastEndTime, setLastEndTime] = useState<Date | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        setDurationSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const handleStart = () => {
    setIsRunning(true);
    setStartTime(Date.now());
    setDurationSeconds(0);
  };

  const handleStop = () => {
    setIsRunning(false);
    const now = new Date();
    const currentStart = startTime || (Date.now() - durationSeconds * 1000);

    // Medically, contraction interval is measured Start-to-Start
    let interval = 0;
    if (lastContractionStart) {
      interval = Math.max(0, Math.round((currentStart - lastContractionStart) / 1000));
    } else if (lastEndTime) {
      interval = Math.max(0, Math.round((currentStart - lastEndTime.getTime()) / 1000));
    }

    addContraction({
      date: now.toISOString().split("T")[0],
      startTime: new Date(currentStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      durationSeconds: Math.max(1, durationSeconds),
      intervalSeconds: interval,
      intensity,
    });

    setLastContractionStart(currentStart);
    setLastEndTime(now);
    setDurationSeconds(0);
    showToast(t("contractionSaved"));
  };

  // Rule of 5-1-1 Labor Assessment Engine
  // (Contractions ~5 min apart, lasting ~1 min, for active labor triage)
  const recentContractions = contractions.slice(0, 5);
  const contractionsWithInterval = recentContractions.filter((c) => c.intervalSeconds > 0);

  const isRule511Met =
    recentContractions.length >= 3 &&
    contractionsWithInterval.length >= 2 &&
    recentContractions.every((c) => c.durationSeconds >= 45) &&
    contractionsWithInterval.every((c) => c.intervalSeconds <= 330);

  const isEarlyLabor =
    !isRule511Met &&
    recentContractions.length >= 2 &&
    contractionsWithInterval.some((c) => c.intervalSeconds <= 600);

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>{t("laborTriageProtocol")}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            {t("contractionTimerTitle")}
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
            {t("contractionTimerSubtitle")}
          </p>
        </div>

        <button
          onClick={() => setActivePage("emergency")}
          className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-rose-100 transition-all shrink-0"
        >
          <PhoneCall className="w-4 h-4 text-rose-600" />
          <span>{t("callHospitalTriage")}</span>
        </button>
      </div>

      {/* TRIAGE RECOMMENDATION BANNER */}
      {isRule511Met ? (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-white/20 rounded-2xl shrink-0">
              <Siren className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">
                {t("rule511Met")}
              </span>
              <h3 className="font-serif text-lg font-bold mt-1">{t("activeLaborAlert")}</h3>
              <p className="text-xs text-rose-100 mt-0.5">
                {t("activeLaborDesc")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActivePage("emergency")}
            className="px-6 py-3 bg-white text-red-600 rounded-2xl font-extrabold text-xs shadow-lg hover:bg-rose-50 shrink-0 flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{t("emergencyHospitalLine")}</span>
          </button>
        </div>
      ) : isEarlyLabor ? (
        <div className="p-5 rounded-3xl bg-amber-500 text-white shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <div className="text-sm font-extrabold">{t("earlyLaborApproaching")}</div>
              <div className="text-xs opacity-90">{t("earlyLaborDesc")}</div>
            </div>
          </div>
          <span className="px-3 py-1 bg-white/20 rounded-xl text-xs font-bold uppercase shrink-0">{t("earlyPhase")}</span>
        </div>
      ) : (
        <div className="p-5 rounded-3xl bg-emerald-600 text-white shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 shrink-0" />
            <div>
              <div className="text-sm font-extrabold">{t("preLaborPhase")}</div>
              <div className="text-xs opacity-90">{t("preLaborDesc")}</div>
            </div>
          </div>
          <span className="px-3 py-1 bg-white/20 rounded-xl text-xs font-bold uppercase shrink-0">{t("restPhase")}</span>
        </div>
      )}

      {/* Timer Controls Stage */}
      <div className="p-8 rounded-3xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 text-white shadow-xl flex flex-col items-center justify-center text-center space-y-6">
        <div className="text-xs font-bold px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md">
          {isRunning ? t("contractionActive") : t("readyForContraction")}
        </div>

        <div className="text-6xl font-serif font-extrabold tracking-tight">
          {formatSecs(durationSeconds)}
        </div>

        {/* Intensity Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-rose-100 font-semibold mr-1">{t("intensityLevel")}:</span>
          {(["mild", "moderate", "severe"] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setIntensity(lvl)}
              className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all ${
                intensity === lvl
                  ? "bg-white text-rose-600 shadow-md scale-105"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {t(`intensity_${lvl}`)}
            </button>
          ))}
        </div>

        {/* Start / Stop Button */}
        <button
          onClick={isRunning ? handleStop : handleStart}
          className={`w-52 py-4 rounded-full font-black text-sm uppercase tracking-wider shadow-2xl transition-transform active:scale-95 flex items-center justify-center gap-2 ${
            isRunning
              ? "bg-red-600 text-white animate-pulse"
              : "bg-white text-rose-600 hover:bg-rose-50"
          }`}
        >
          {isRunning ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          <span>{isRunning ? t("stopContraction") : t("startContraction")}</span>
        </button>
      </div>

      {/* Contraction History */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-500" />
            <span>{t("contractionHistoryLogs")}</span>
          </h3>
          <span className="text-xs text-gray-500 dark:text-rose-400 font-medium">
            {t("totalLogged")}: {contractions.length}
          </span>
        </div>

        <div className="space-y-2.5">
          {contractions.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-center justify-between text-xs"
            >
              <div className="space-y-1">
                <div className="font-bold text-rose-900 dark:text-rose-100 text-sm">
                  {t("durationFrequency", {
                    duration: formatSecs(c.durationSeconds),
                    freq: c.intervalSeconds > 0 ? `${Math.round(c.intervalSeconds / 60)} ${t("minsApart")}` : t("firstContraction")
                  })}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-rose-400">
                  {t("loggedOn")} {c.date} {t("at")} {c.startTime}
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase ${
                c.intensity === "severe"
                  ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-200"
                  : c.intensity === "moderate"
                  ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200"
                  : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-200"
              }`}>
                {t(`intensity_${c.intensity}`)} {t("peak")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

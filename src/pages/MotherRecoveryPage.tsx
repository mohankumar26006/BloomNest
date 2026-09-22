import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  PostpartumProfile,
  MotherRecoveryLog,
  PainScore,
  EnergyLevel,
  MobilityStatus,
  RestQuality,
  OverallRecoveryStatus,
  PainLog,
} from "../types";
import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
  getRecoveryStage,
  formatDeliveryType,
} from "../utils/postpartumUtils";
import {
  Activity,
  Heart,
  Calendar,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Battery,
  Moon,
  BatteryLow,
  BatteryMedium,
  BedDouble,
  Footprints,
  FileText,
  Plus,
  History,
  ArrowRight,
  Bandage,
  Milk,
  Droplets,
  Smile,
} from "lucide-react";
import { WoundLog, PumpingLog } from "../types";

const POSTPARTUM_PROFILE_KEY = "bloomnest_postpartum_profile_v1";
const RECOVERY_LOGS_KEY = "bloomnest_mother_recovery_logs_v1";
const PAIN_LOGS_KEY = "bloomnest_pain_logs_v1";
const WOUND_LOGS_KEY = "bloomnest_wound_logs_v1";

export const MotherRecoveryPage: React.FC<{
  onNavigateSubPage?: (page: string) => void;
}> = ({ onNavigateSubPage }) => {
  const { user, showToast } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<PostpartumProfile | null>(null);
  const [logs, setLogs] = useState<MotherRecoveryLog[]>([]);
  const [latestWoundLog, setLatestWoundLog] = useState<WoundLog | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Form state
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [pain, setPain] = useState<PainScore>(3);
  const [energy, setEnergy] = useState<EnergyLevel>("Medium");
  const [mobility, setMobility] = useState<MobilityStatus>("Moderate");
  const [rest, setRest] = useState<RestQuality>("Fair");
  const [overallRecovery, setOverallRecovery] = useState<OverallRecoveryStatus>("Better");
  const [notes, setNotes] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  // Load Feature 01 Postpartum Context & Existing Recovery Logs
  useEffect(() => {
    const loadData = () => {
      try {
        // Load Feature 01 Profile
        const savedProfile = localStorage.getItem(POSTPARTUM_PROFILE_KEY);
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        } else if (user?.journeyStage === "POST_PREGNANCY") {
          const defaultProf: PostpartumProfile = {
            deliveryDate: new Date().toISOString().split("T")[0],
            deliveryType: "vaginal",
            numberOfBabies: 1,
          };
          setProfile(defaultProf);
        }

        // Load Feature 02 Recovery Logs
        const savedLogs = localStorage.getItem(RECOVERY_LOGS_KEY);
        if (savedLogs) {
          setLogs(JSON.parse(savedLogs));
        }

        // Load Feature 07 Wound Logs
        const savedWounds = localStorage.getItem(WOUND_LOGS_KEY);
        if (savedWounds) {
          const wndList: WoundLog[] = JSON.parse(savedWounds);
          if (wndList.length > 0) {
            wndList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setLatestWoundLog(wndList[0]);
          }
        }
      } catch (err) {
        console.error("Error loading recovery logs:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  // Sync / Default form on logDate change
  useEffect(() => {
    if (isLoading) return;

    const existingRecLog = logs.find((l) => l.date === logDate);
    if (existingRecLog) {
      setPain(existingRecLog.pain);
      setEnergy(existingRecLog.energy);
      setMobility(existingRecLog.mobility);
      setRest(existingRecLog.rest);
      setOverallRecovery(existingRecLog.overallRecovery);
      setNotes(existingRecLog.notes || "");
    } else {
      // Check if Feature 06 pain log exists for this date
      try {
        const savedPainLogs = localStorage.getItem(PAIN_LOGS_KEY);
        if (savedPainLogs) {
          const painLogs = JSON.parse(savedPainLogs);
          const datePainLog = painLogs.find((p: any) => p.date === logDate);
          if (datePainLog && typeof datePainLog.pain === "number") {
            setPain(datePainLog.pain as PainScore);
          }
        }
      } catch (e) {
        console.error("Error reading pain log for Mother Recovery default:", e);
      }
    }
  }, [logDate, logs, isLoading]);

  // Handle Save Daily Recovery Log
  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!profile) {
      setFormError("Postpartum context missing. Please configure delivery details first.");
      return;
    }

    const day = calculatePostpartumDay(profile.deliveryDate, logDate);
    const week = calculatePostpartumWeek(day);

    const newLog: MotherRecoveryLog = {
      id: `rec_${Date.now()}`,
      userId: user?.id || "user_demo",
      date: logDate,
      postpartumDay: day,
      postpartumWeek: week,
      pain,
      energy,
      mobility,
      rest,
      overallRecovery,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      // Upsert by date
      const updatedLogs = [newLog, ...logs.filter((l) => l.date !== logDate)].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      localStorage.setItem(RECOVERY_LOGS_KEY, JSON.stringify(updatedLogs));
      setLogs(updatedLogs);
      setSaveSuccessMsg(`Recovery log saved for Day ${day}! 💕`);
      showToast("Mother physical recovery logged! 🌸");
      setTimeout(() => setSaveSuccessMsg(null), 3000);
      setNotes("");
    } catch (err) {
      setFormError("Failed to save recovery log locally.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading Mother Recovery...</p>
      </div>
    );
  }

  // FALLBACK IF FEATURE 01 PROFILE NOT CONFIGURED
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-[#1A1523] rounded-3xl p-8 border border-rose-100 dark:border-rose-900/40 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center mx-auto">
            <Activity className="w-8 h-8 text-rose-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-rose-100">Setup Postpartum Care First</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Feature 02 (Mother Recovery) consumes your delivery details from Feature 01. Please configure your delivery date first.
            </p>
          </div>

          <button
            onClick={() => onNavigateSubPage && onNavigateSubPage("care")}
            className="w-full py-3 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Go to Feature 01 (Postpartum Care)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // CALCULATED CONTEXT FROM FEATURE 01
  const postpartumDay = calculatePostpartumDay(profile.deliveryDate);
  const postpartumWeek = calculatePostpartumWeek(postpartumDay);
  const currentStage = getRecoveryStage(postpartumDay);

  // Pain indicator badge helper
  const getPainColor = (score: number) => {
    if (score <= 2) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300";
    if (score <= 5) return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300";
    if (score <= 8) return "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300";
    return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-400";
  };

  const getPainLabel = (score: number) => {
    if (score === 0) return "No Pain";
    if (score <= 2) return "Mild / Discomfort";
    if (score <= 5) return "Moderate Pain";
    if (score <= 8) return "Substantial Pain";
    return "Severe Pain Alert";
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] text-slate-800 dark:text-rose-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* SUCCESS TOAST */}
      {saveSuccessMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-800 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* HEADER WITH CONSUMED CONTEXT FROM FEATURE 01 */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 dark:border-rose-900/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 uppercase tracking-wider">
              Feature 02
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Daily Physical Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-rose-100 tracking-tight mt-1">
            Mother Recovery — Postpartum Day {postpartumDay}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="px-3 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-xs">
              {currentStage.title}
            </span>
            <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
            <span className="px-3 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
              {formatDeliveryType(profile.deliveryType)}
            </span>
            <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Week {postpartumWeek} of recovery
            </span>
          </div>
        </div>

        {onNavigateSubPage && (
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => onNavigateSubPage("breastfeeding")}
              className="px-3 py-1.5 rounded-xl bg-pink-50 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800 text-xs font-extrabold text-pink-700 dark:text-pink-300 hover:bg-pink-100 transition-colors flex items-center gap-1.5"
            >
              <Milk className="w-3.5 h-3.5 text-pink-500" />
              <span>Breastfeeding (Feat 08)</span>
            </button>
            <button
              onClick={() => onNavigateSubPage("pumping")}
              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-extrabold text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors flex items-center gap-1.5"
            >
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              <span>Pumping (Feat 09)</span>
            </button>
            <button
              onClick={() => onNavigateSubPage("wound")}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-extrabold text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
            >
              <Bandage className="w-3.5 h-3.5 text-rose-500" />
              <span>Wound Care (Feat 07)</span>
            </button>
            <button
              onClick={() => onNavigateSubPage("sleep-fatigue")}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-extrabold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
              <span>Sleep & Fatigue (Feat 12)</span>
            </button>
            <button
              onClick={() => onNavigateSubPage("mood-wellbeing")}
              className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-xs font-extrabold text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors flex items-center gap-1.5"
            >
              <Smile className="w-3.5 h-3.5 text-purple-500" />
              <span>Mood & Wellbeing (Feat 14)</span>
            </button>
          </div>
        )}
      </header>

      {/* 📝 DAILY RECOVERY LOGGING FORM */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-rose-900/40 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-rose-900/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">Log Today's Recovery Metrics</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Track pain, energy, mobility, rest, and overall progress.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-slate-50 dark:bg-[#15111C] text-xs font-bold text-slate-800 dark:text-rose-200"
            />
          </div>
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveLog} className="space-y-6 text-xs">
          {/* 1. PAIN SCORE (0-10) */}
          <div className="space-y-2.5 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Pain Level (0 – 10)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getPainColor(pain)}`}>
                  {pain} / 10 • {getPainLabel(pain)}
                </span>
                {onNavigateSubPage && (
                  <button
                    type="button"
                    onClick={() => onNavigateSubPage("pain")}
                    className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-extrabold text-[11px] hover:bg-rose-200 transition-colors flex items-center gap-1"
                  >
                    <span>Detailed Pain Tracker (Feature 06)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="range"
                min="0"
                max="10"
                value={pain}
                onChange={(e) => setPain(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            <div className="grid grid-cols-11 gap-1 pt-1">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPain(i)}
                  className={`py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                    pain === i
                      ? "bg-rose-500 text-white shadow-xs scale-105"
                      : "bg-white dark:bg-[#1A1523] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-gray-800 hover:border-rose-300"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* 2. ENERGY LEVEL & MOBILITY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ENERGY LEVEL */}
            <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 flex items-center gap-2 block">
                <BatteryMedium className="w-4 h-4 text-amber-500" />
                <span>Energy Level</span>
              </label>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(["Low", "Medium", "Good"] as EnergyLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEnergy(lvl)}
                    className={`py-2.5 rounded-xl font-extrabold text-xs transition-all border ${
                      energy === lvl
                        ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                        : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-amber-300"
                    }`}
                  >
                    {lvl === "Low" ? "🪫 Low" : lvl === "Medium" ? "⚡ Medium" : "🔋 Good"}
                  </button>
                ))}
              </div>
            </div>

            {/* MOBILITY */}
            <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 flex items-center gap-2 block">
                <Footprints className="w-4 h-4 text-teal-500" />
                <span>Mobility Status</span>
              </label>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(["Difficult", "Moderate", "Comfortable"] as MobilityStatus[]).map((mob) => (
                  <button
                    key={mob}
                    type="button"
                    onClick={() => setMobility(mob)}
                    className={`py-2.5 rounded-xl font-extrabold text-[11px] transition-all border ${
                      mobility === mob
                        ? "bg-teal-600 text-white border-teal-700 shadow-xs"
                        : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-teal-300"
                    }`}
                  >
                    {mob === "Difficult" ? "🛋️ Difficult" : mob === "Moderate" ? "🚶‍♀️ Moderate" : "🏃‍♀️ Comfortable"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. REST QUALITY & OVERALL RECOVERY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* REST QUALITY */}
            <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 flex items-center gap-2 block">
                <BedDouble className="w-4 h-4 text-indigo-500" />
                <span>Rest & Sleep Quality</span>
              </label>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(["Poor", "Fair", "Good"] as RestQuality[]).map((rst) => (
                  <button
                    key={rst}
                    type="button"
                    onClick={() => setRest(rst)}
                    className={`py-2.5 rounded-xl font-extrabold text-xs transition-all border ${
                      rest === rst
                        ? "bg-indigo-600 text-white border-indigo-700 shadow-xs"
                        : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-indigo-300"
                    }`}
                  >
                    {rst === "Poor" ? "😴 Poor" : rst === "Fair" ? "😌 Fair" : "🌟 Good"}
                  </button>
                ))}
              </div>
            </div>

            {/* OVERALL RECOVERY */}
            <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 flex items-center gap-2 block">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Overall Recovery Feel</span>
              </label>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(["Worse", "Same", "Better"] as OverallRecoveryStatus[]).map((ovr) => (
                  <button
                    key={ovr}
                    type="button"
                    onClick={() => setOverallRecovery(ovr)}
                    className={`py-2.5 rounded-xl font-extrabold text-xs transition-all border ${
                      overallRecovery === ovr
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                        : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-emerald-300"
                    }`}
                  >
                    {ovr === "Worse" ? "📉 Worse" : ovr === "Same" ? "➡️ Same" : "📈 Better"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* NOTES (OPTIONAL) */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-700 dark:text-rose-300 block">
              Recovery Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record incision observations, pelvic discomfort, or special feelings today..."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>Save Today's Recovery Log</span>
          </button>
        </form>
      </section>

      {/* 📊 RECOVERY HISTORY TIMELINE */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-rose-900/40 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-rose-900/30 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-rose-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">Recovery Log History</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {logs.length} {logs.length === 1 ? "entry" : "entries"} logged
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 italic">
            No recovery logs recorded yet. Complete today's log above to build your recovery timeline!
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#15111C] border border-slate-200/60 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-rose-100">{log.date}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-extrabold text-[10px]">
                      Day {log.postpartumDay}
                    </span>
                    <span className="text-slate-400 text-[10px]">Week {log.postpartumWeek}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 pt-0.5">
                    <span>Pain: <strong className="text-rose-600">{log.pain}/10</strong></span>
                    <span>•</span>
                    <span>Energy: <strong>{log.energy}</strong></span>
                    <span>•</span>
                    <span>Mobility: <strong>{log.mobility}</strong></span>
                    <span>•</span>
                    <span>Rest: <strong>{log.rest}</strong></span>
                  </div>

                  {log.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
                      "{log.notes}"
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                      log.overallRecovery === "Better"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : log.overallRecovery === "Same"
                        ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                    }`}
                  >
                    Overall: {log.overallRecovery}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

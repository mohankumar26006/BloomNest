import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  PostpartumProfile,
  PainLog,
  PainLocation,
  PainType,
  PainTiming,
  PainRelief,
  PainLogTrend,
  MotherRecoveryLog,
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
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  History,
  Info,
  ArrowRight,
  ShieldAlert,
  Flame,
  Sparkles,
} from "lucide-react";

const POSTPARTUM_PROFILE_KEY = "bloomnest_postpartum_profile_v1";
const PAIN_LOGS_KEY = "bloomnest_pain_logs_v1";
const RECOVERY_LOGS_KEY = "bloomnest_mother_recovery_logs_v1";

export const PainMonitoringPage: React.FC<{
  onNavigateSubPage?: (page: string) => void;
}> = ({ onNavigateSubPage }) => {
  const { user, showToast } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<PostpartumProfile | null>(null);
  const [logs, setLogs] = useState<PainLog[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [defaultedFromRecovery, setDefaultedFromRecovery] = useState<boolean>(false);

  // Form state
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [pain, setPain] = useState<number>(3);
  const [location, setLocation] = useState<PainLocation>("Abdomen");
  const [type, setType] = useState<PainType>("Cramping");
  const [timing, setTiming] = useState<PainTiming>("Comes and goes");
  const [trend, setTrend] = useState<PainLogTrend>("Improving");
  const [whatHelped, setWhatHelped] = useState<PainRelief>("Rest");
  const [notes, setNotes] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  // Load Feature 01 Postpartum Context & Existing Pain Logs
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

        // Load Feature 06 Pain Logs
        const savedLogs = localStorage.getItem(PAIN_LOGS_KEY);
        if (savedLogs) {
          setLogs(JSON.parse(savedLogs));
        }
      } catch (err) {
        console.error("Error loading pain logs:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  // Sync / Default Pain Score from Feature 02 (Mother Recovery) whenever logDate or logs change
  useEffect(() => {
    if (isLoading) return;

    // 1. Existing Feature 06 Log for this date
    const existingPainLog = logs.find((l) => l.date === logDate);
    if (existingPainLog) {
      setPain(existingPainLog.pain);
      setLocation(existingPainLog.location);
      setType(existingPainLog.type);
      setTiming(existingPainLog.timing);
      setTrend(existingPainLog.trend);
      setWhatHelped(existingPainLog.whatHelped);
      setNotes(existingPainLog.notes || "");
      setDefaultedFromRecovery(false);
      return;
    }

    // 2. If no Feature 06 log for this date, check Feature 02 (Mother Recovery)
    try {
      const savedRecLogs = localStorage.getItem(RECOVERY_LOGS_KEY);
      if (savedRecLogs) {
        const recLogs: MotherRecoveryLog[] = JSON.parse(savedRecLogs);
        const dateRecLog = recLogs.find((r) => r.date === logDate) || recLogs[0];
        if (dateRecLog && typeof dateRecLog.pain === "number") {
          setPain(dateRecLog.pain);
          setDefaultedFromRecovery(true);
          return;
        }
      }
    } catch (e) {
      console.error("Error defaulting pain from recovery log:", e);
    }

    setDefaultedFromRecovery(false);
  }, [logDate, logs, isLoading]);

  // Handle Save Daily Pain Record
  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!profile) {
      setFormError("Postpartum context missing. Please configure delivery details first.");
      return;
    }

    const day = calculatePostpartumDay(profile.deliveryDate, logDate);
    const week = calculatePostpartumWeek(day);

    const newLog: PainLog = {
      id: `pain_${Date.now()}`,
      userId: user?.id || "user_demo",
      date: logDate,
      postpartumDay: day,
      postpartumWeek: week,
      pain,
      location,
      type,
      timing,
      trend,
      whatHelped,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      // Upsert by date
      const updatedLogs = [newLog, ...logs.filter((l) => l.date !== logDate)].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      localStorage.setItem(PAIN_LOGS_KEY, JSON.stringify(updatedLogs));
      setLogs(updatedLogs);
      setSaveSuccessMsg(`Pain record saved for Day ${day}!`);
      showToast("Detailed pain entry logged");
      setTimeout(() => setSaveSuccessMsg(null), 3000);
      setNotes("");
    } catch (err) {
      setFormError("Failed to save pain log locally.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading Pain Monitoring...</p>
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
              Feature 06 (Pain Monitoring) reuses delivery details from Feature 01. Please configure your delivery date first.
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

  const getPainBadgeClass = (score: number) => {
    if (score <= 2) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300";
    if (score <= 5) return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300";
    if (score <= 8) return "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300";
    return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-400";
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
              Feature 06
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Detailed Pain & Recovery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-rose-100 tracking-tight mt-1">
            Pain Monitoring — Postpartum Day {postpartumDay}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="px-3 py-0.5 rounded-full bg-rose-600 text-white font-extrabold text-xs">
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
      </header>

      {/* DAILY DETAILED PAIN LOGGING FORM */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-rose-900/40 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-rose-900/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 flex items-center justify-center">
              <Activity className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">Log Detailed Pain Observation</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Record pain level, location, type, timing, trend, and relief measures.</p>
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
          {/* 1. PAIN LEVEL (0-10) */}
          <div className="space-y-2.5 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>Pain Level (0 – 10)</span>
              </label>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getPainBadgeClass(pain)}`}>
                {pain} / 10
              </span>
            </div>

            {defaultedFromRecovery && (
              <div className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl border border-rose-200/60 dark:border-rose-900/40 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Auto-filled initial pain scale ({pain}/10) from Feature 02 — Mother Physical Recovery.</span>
              </div>
            )}

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

          {/* 2. PAIN LOCATION & PAIN TYPE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* LOCATION */}
            <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
                Pain Location <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {(
                  [
                    "Abdomen",
                    "Pelvic area",
                    "Perineal area",
                    "Incision / wound area",
                    "Back",
                    "Breast",
                    "Head",
                    "Other",
                  ] as PainLocation[]
                ).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className={`py-2 rounded-xl font-extrabold text-[11px] transition-all border ${
                      location === loc
                        ? "bg-rose-500 text-white border-rose-600 shadow-xs"
                        : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-rose-300"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* PAIN TYPE */}
            <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
                Pain Type <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {(["Aching", "Cramping", "Burning", "Sharp", "Throbbing", "Other"] as PainType[]).map((typ) => (
                  <button
                    key={typ}
                    type="button"
                    onClick={() => setType(typ)}
                    className={`py-2.5 rounded-xl font-extrabold text-xs transition-all border ${
                      type === typ
                        ? "bg-rose-500 text-white border-rose-600 shadow-xs"
                        : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-rose-300"
                    }`}
                  >
                    {typ}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. TIMING, TREND, & WHAT HELPED */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* TIMING */}
            <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
                Timing <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2 pt-1">
                {(["Constant", "Comes and goes"] as PainTiming[]).map((tm) => (
                  <button
                    key={tm}
                    type="button"
                    onClick={() => setTiming(tm)}
                    className={`py-2 rounded-xl font-extrabold text-[11px] transition-all border ${
                      timing === tm
                        ? "bg-rose-500 text-white border-rose-600 shadow-xs"
                        : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-rose-300"
                    }`}
                  >
                    {tm}
                  </button>
                ))}
              </div>
            </div>

            {/* TREND */}
            <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
                Pain Trend <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2 pt-1">
                {(["Improving", "Same", "Worsening"] as PainLogTrend[]).map((trd) => (
                  <button
                    key={trd}
                    type="button"
                    onClick={() => setTrend(trd)}
                    className={`py-2 rounded-xl font-extrabold text-[11px] transition-all border ${
                      trend === trd
                        ? trd === "Worsening"
                          ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                          : "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                        : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-rose-300"
                    }`}
                  >
                    {trd}
                  </button>
                ))}
              </div>
            </div>

            {/* WHAT HELPED */}
            <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
                What Helped? <span className="text-rose-500">*</span>
              </label>
              <select
                value={whatHelped}
                onChange={(e) => setWhatHelped(e.target.value as PainRelief)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#1A1523] font-bold text-xs"
              >
                <option value="Rest">Rest</option>
                <option value="Position change">Position change</option>
                <option value="Medication">Medication</option>
                <option value="Heat/cold">Heat / cold pack</option>
                <option value="Nothing">Nothing</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* NOTES (OPTIONAL) */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-700 dark:text-rose-300 block">
              Pain Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record incision tenderness, nursing cramps, or medication effectiveness..."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>Save Today's Pain Record</span>
          </button>
        </form>
      </section>

      {/* PAIN HISTORY TIMELINE */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-rose-900/40 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-rose-900/30 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-rose-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">Pain Record History</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {logs.length} {logs.length === 1 ? "entry" : "entries"} logged
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 italic">
            No detailed pain records logged yet. Complete today's record above to build your pain timeline!
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

                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-rose-200 pt-0.5">
                    <span>Pain: <strong className="text-rose-600">{log.pain}/10</strong></span>
                    <span>•</span>
                    <span>Location: <strong>{log.location}</strong></span>
                    <span>•</span>
                    <span>Type: <strong>{log.type}</strong></span>
                    <span>•</span>
                    <span>Timing: <strong>{log.timing}</strong></span>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 pt-0.5">
                    <span>Relief: <strong className="text-slate-700 dark:text-rose-300">{log.whatHelped}</strong></span>
                    {log.notes && <span>• "{log.notes}"</span>}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                      log.trend === "Improving"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : log.trend === "Same"
                        ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                    }`}
                  >
                    Trend: {log.trend}
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

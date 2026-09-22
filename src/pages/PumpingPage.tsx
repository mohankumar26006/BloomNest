import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  PostpartumProfile,
  BabyProfileData,
  PumpingLog,
  PumpingMethod,
  BreastUsed,
  MilkAction,
  PumpingExperience,
  PumpingSymptom,
  PumpingRelief,
} from "../types";
import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
  getRecoveryStage,
  formatDeliveryType,
  formatBabyAge,
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
  Droplets,
  Baby as BabyIcon,
  Sparkles,
  HeartPulse,
  Timer,
  Archive,
  Thermometer,
  Trash2,
  Zap,
} from "lucide-react";

const POSTPARTUM_PROFILE_KEY = "bloomnest_postpartum_profile_v1";
const BABY_PROFILE_KEY = "bloomnest_baby_profile_v1";
const PUMPING_LOGS_KEY = "bloomnest_pumping_logs_v1";

export const PumpingPage: React.FC<{
  onNavigateSubPage?: (page: string) => void;
}> = ({ onNavigateSubPage }) => {
  const { user, showToast } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<PostpartumProfile | null>(null);
  const [babyProfile, setBabyProfile] = useState<BabyProfileData | null>(null);
  const [logs, setLogs] = useState<PumpingLog[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Form state
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const [method, setMethod] = useState<PumpingMethod>("Electric Pump");
  const [breastUsed, setBreastUsed] = useState<BreastUsed>("Both");

  // Duration
  const [leftMins, setLeftMins] = useState<number>(8);
  const [rightMins, setRightMins] = useState<number>(7);

  // Milk volume & unit
  const [volumeUnit, setVolumeUnit] = useState<"mL" | "oz">("mL");
  const [leftVolume, setLeftVolume] = useState<number>(40);
  const [rightVolume, setRightVolume] = useState<number>(30);

  // Milk status / disposition
  const [milkAction, setMilkAction] = useState<MilkAction>("Stored");

  // Experience & Symptoms
  const [experience, setExperience] = useState<PumpingExperience>("Comfortable");
  const [symptoms, setSymptoms] = useState<PumpingSymptom[]>(["None"]);
  const [whatHelped, setWhatHelped] = useState<PumpingRelief[]>(["Pump setting adjustment"]);
  const [notes, setNotes] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  // Load Feature 01, 03, & Existing Feature 09 Pumping Logs
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

        // Load Feature 03 Baby Profile
        const savedBaby = localStorage.getItem(BABY_PROFILE_KEY);
        if (savedBaby) {
          setBabyProfile(JSON.parse(savedBaby));
        }

        // Load Feature 09 Pumping Logs
        const savedLogs = localStorage.getItem(PUMPING_LOGS_KEY);
        if (savedLogs) {
          setLogs(JSON.parse(savedLogs));
        }
      } catch (err) {
        console.error("Error loading pumping logs:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  // Handle Symptom Checkbox Toggle
  const toggleSymptom = (sym: PumpingSymptom) => {
    if (sym === "None") {
      setSymptoms(["None"]);
      return;
    }
    const filtered = symptoms.filter((s) => s !== "None");
    if (filtered.includes(sym)) {
      const updated = filtered.filter((s) => s !== sym);
      setSymptoms(updated.length === 0 ? ["None"] : updated);
    } else {
      setSymptoms([...filtered, sym]);
    }
  };

  // Handle Relief Checkbox Toggle
  const toggleRelief = (rel: PumpingRelief) => {
    if (rel === "Nothing") {
      setWhatHelped(["Nothing"]);
      return;
    }
    const filtered = (whatHelped || []).filter((r) => r !== "Nothing");
    if (filtered.includes(rel)) {
      const updated = filtered.filter((r) => r !== rel);
      setWhatHelped(updated.length === 0 ? ["Nothing"] : updated);
    } else {
      setWhatHelped([...filtered, rel]);
    }
  };

  // Compute calculated totals based on selected breast
  const totalMins =
    breastUsed === "Left" ? leftMins : breastUsed === "Right" ? rightMins : leftMins + rightMins;

  const rawTotalVol =
    breastUsed === "Left" ? leftVolume : breastUsed === "Right" ? rightVolume : leftVolume + rightVolume;

  // Save Pumping Session
  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!profile) {
      setFormError("Postpartum context missing. Please configure delivery details first.");
      return;
    }

    if (totalMins <= 0) {
      setFormError("Please enter valid pumping duration (at least 1 minute).");
      return;
    }

    if (rawTotalVol < 0) {
      setFormError("Milk volume cannot be negative.");
      return;
    }

    const day = calculatePostpartumDay(profile.deliveryDate, logDate);
    const week = calculatePostpartumWeek(day);

    // Convert total volume to normalized mL for internal math consistency
    const normalizedTotalMl =
      volumeUnit === "oz" ? Math.round(rawTotalVol * 29.5735) : rawTotalVol;
    const normalizedLeftMl =
      volumeUnit === "oz" ? Math.round(leftVolume * 29.5735) : leftVolume;
    const normalizedRightMl =
      volumeUnit === "oz" ? Math.round(rightVolume * 29.5735) : rightVolume;

    const newLog: PumpingLog = {
      id: `pump_${Date.now()}`,
      date: logDate,
      startTime: startTime || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      postpartumDay: day,
      postpartumWeek: week,
      method,
      breastUsed,
      durationMinutes: totalMins,
      leftDurationMinutes: breastUsed !== "Right" ? leftMins : undefined,
      rightDurationMinutes: breastUsed !== "Left" ? rightMins : undefined,
      leftVolumeMl: breastUsed !== "Right" ? normalizedLeftMl : undefined,
      rightVolumeMl: breastUsed !== "Left" ? normalizedRightMl : undefined,
      totalVolumeMl: normalizedTotalMl,
      volumeUnit,
      milkAction,
      experience,
      symptoms,
      whatHelped,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem(PUMPING_LOGS_KEY, JSON.stringify(updatedLogs));

    // Reset Form with auto-refreshed timestamp
    setStartTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setNotes("");
    setSaveSuccessMsg("Pumping session recorded successfully!");
    if (showToast) showToast("Pumping session logged!");

    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Delete Log Entry
  const handleDeleteLog = (logId: string) => {
    const updated = logs.filter((l) => l.id !== logId);
    setLogs(updated);
    localStorage.setItem(PUMPING_LOGS_KEY, JSON.stringify(updated));
    if (showToast) showToast("Log entry deleted");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading Pumping & Milk Care...</p>
      </div>
    );
  }

  // Fallback if profile missing
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-[#1A1523] rounded-3xl p-8 border border-rose-100 dark:border-rose-900/40 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center mx-auto">
            <Droplets className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-rose-100">Setup Postpartum Care First</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Feature 09 (Pumping) consumes postpartum timeline from Feature 01. Please configure your delivery date first.
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

  // Feature 01 & 03 Context Calculations
  const postpartumDay = calculatePostpartumDay(profile.deliveryDate);
  const postpartumWeek = calculatePostpartumWeek(postpartumDay);
  const currentStage = getRecoveryStage(postpartumDay);
  const babyName = babyProfile?.babyName || "Newborn Baby";

  // Filter Today's Logs for Summary
  const todayLogs = logs.filter((l) => l.date === logDate);
  const todaySessionsCount = todayLogs.length;
  const todayTotalDuration = todayLogs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);
  const todayTotalMl = todayLogs.reduce((acc, l) => acc + (l.totalVolumeMl || 0), 0);
  const todayTotalOz = (todayTotalMl / 29.5735).toFixed(1);

  // Breakdown by Milk Disposition
  const storedMl = todayLogs
    .filter((l) => l.milkAction === "Stored")
    .reduce((acc, l) => acc + (l.totalVolumeMl || 0), 0);
  const immediateMl = todayLogs
    .filter((l) => l.milkAction === "Used immediately")
    .reduce((acc, l) => acc + (l.totalVolumeMl || 0), 0);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] text-slate-800 dark:text-rose-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* SUCCESS TOAST */}
      {saveSuccessMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-800 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* HEADER WITH CONSUMED CONTEXT FROM FEATURE 01 & FEATURE 03 */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 dark:border-rose-900/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              Feature 09
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pumping & Milk Tracking (Mother Expression)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-rose-100 tracking-tight mt-1">
            Pumping & Milk Care — Postpartum Day {postpartumDay}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="px-3 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-xs">
              {currentStage.title}
            </span>
            <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
            <span className="px-3 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1">
              <BabyIcon className="w-3 h-3 text-rose-500" />
              <span>{babyName}</span>
            </span>
            <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Week {postpartumWeek} of recovery
            </span>
          </div>
        </div>

        {onNavigateSubPage && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => onNavigateSubPage("breastfeeding")}
              className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-pink-500" />
              <span>Direct Breastfeeding (Feat 08)</span>
            </button>
            <button
              onClick={() => onNavigateSubPage("safety")}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-rose-900 dark:text-rose-100 text-xs font-bold shadow-xs hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Safety Shield</span>
            </button>
          </div>
        )}
      </header>

      {/* TODAY'S PUMPING SUMMARY CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1A1523] p-4 rounded-2xl border border-slate-200/80 dark:border-rose-900/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Today's Expressed Milk</span>
            <span className="text-2xl font-black text-slate-900 dark:text-rose-100">
              {volumeUnit === "mL" ? `${todayTotalMl} mL` : `${todayTotalOz} oz`}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {volumeUnit === "mL" ? `(~${todayTotalOz} oz)` : `(~${todayTotalMl} mL)`}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
            <Droplets className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1523] p-4 rounded-2xl border border-slate-200/80 dark:border-rose-900/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sessions Logged</span>
            <span className="text-2xl font-black text-slate-900 dark:text-rose-100">{todaySessionsCount} sessions</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Recorded for {logDate}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
            <Timer className="w-5 h-5 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1523] p-4 rounded-2xl border border-slate-200/80 dark:border-rose-900/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Duration</span>
            <span className="text-2xl font-black text-slate-900 dark:text-rose-100">{todayTotalDuration} mins</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Cumulative expression time</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
            <Clock className="w-5 h-5 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1523] p-4 rounded-2xl border border-slate-200/80 dark:border-rose-900/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Milk Disposition</span>
            <span className="text-xs font-black text-slate-900 dark:text-rose-100 block">
              Stored: {storedMl} mL
            </span>
            <span className="text-[11px] font-bold text-emerald-600 block">
              Immediate: {immediateMl} mL
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <Archive className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
      </section>

      {/* LOG PUMPING SESSION FORM */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-rose-900/40 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-rose-900/30 pb-3 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center">
              <Droplets className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">Log Pumping Session</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Record milk expression method, volumes, milk disposition, and comfort.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Unit Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setVolumeUnit("mL")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  volumeUnit === "mL"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                }`}
              >
                mL
              </button>
              <button
                type="button"
                onClick={() => setVolumeUnit("oz")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  volumeUnit === "oz"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                }`}
              >
                oz
              </button>
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
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveLog} className="space-y-6 text-xs">
          {/* A. TIME PICKER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 flex items-center gap-1.5 block">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Session Start Time</span>
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="e.g. 08:30 AM"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold text-xs text-slate-800 dark:text-rose-100"
                required
              />
            </div>
          </div>

          {/* B. EXPRESSION METHOD */}
          <div className="space-y-2">
            <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
              Expression Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(["Electric Pump", "Manual Pump", "Hand Expression", "Other"] as PumpingMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
                    method === m
                      ? "bg-blue-600 text-white border-blue-700 shadow-xs"
                      : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-blue-300"
                  }`}
                >
                  {m === "Electric Pump" && <Zap className="w-4 h-4 text-amber-300" />}
                  {m === "Manual Pump" && <Droplets className="w-4 h-4 text-blue-300" />}
                  {m === "Hand Expression" && <Heart className="w-4 h-4 text-rose-300" />}
                  {m === "Other" && <Info className="w-4 h-4 text-slate-300" />}
                  <span>{m}</span>
                </button>
              ))}
            </div>
          </div>

          {/* C. BREAST USED & DURATION */}
          <div className="space-y-2.5 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
                Breast Used
              </label>
              <span className="px-3 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-xs">
                Total Duration: {totalMins} mins
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {(["Left", "Right", "Both"] as BreastUsed[]).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBreastUsed(b)}
                  className={`py-2.5 rounded-xl font-extrabold text-xs transition-all border ${
                    breastUsed === b
                      ? "bg-blue-600 text-white border-blue-700 shadow-xs"
                      : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-blue-300"
                  }`}
                >
                  {b} Breast
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {(breastUsed === "Left" || breastUsed === "Both") && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                    Left Breast Duration (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={leftMins}
                    onChange={(e) => setLeftMins(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-bold text-xs"
                  />
                </div>
              )}

              {(breastUsed === "Right" || breastUsed === "Both") && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                    Right Breast Duration (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rightMins}
                    onChange={(e) => setRightMins(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-bold text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* D. MILK EXPRESSED VOLUME */}
          <div className="space-y-2.5 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-200/60 dark:border-blue-900/40">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-blue-950 dark:text-blue-200 flex items-center gap-1.5 block">
                <Droplets className="w-4 h-4 text-blue-600" />
                <span>Milk Expressed ({volumeUnit})</span>
              </label>
              <span className="px-3 py-0.5 rounded-full bg-blue-600 text-white font-extrabold text-xs">
                Total Volume: {rawTotalVol} {volumeUnit}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {(breastUsed === "Left" || breastUsed === "Both") && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-blue-900 dark:text-blue-300 block">
                    Left Breast ({volumeUnit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={leftVolume}
                    onChange={(e) => setLeftVolume(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-blue-300 dark:border-blue-800 bg-white dark:bg-[#15111C] font-bold text-xs text-blue-950 dark:text-blue-100"
                  />
                </div>
              )}

              {(breastUsed === "Right" || breastUsed === "Both") && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-blue-900 dark:text-blue-300 block">
                    Right Breast ({volumeUnit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={rightVolume}
                    onChange={(e) => setRightVolume(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-blue-300 dark:border-blue-800 bg-white dark:bg-[#15111C] font-bold text-xs text-blue-950 dark:text-blue-100"
                  />
                </div>
              )}
            </div>
          </div>

          {/* E. MILK DISPOSITION */}
          <div className="space-y-2">
            <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
              What happened to the expressed milk?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["Stored", "Used immediately", "Discarded", "Other"] as MilkAction[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setMilkAction(a)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    milkAction === a
                      ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                      : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-emerald-300"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 italic">
              * Note: Expressed ≠ Consumed. Feature 10 (Baby Feeding) tracks actual baby intake.
            </p>
          </div>

          {/* F. MOTHER EXPERIENCE */}
          <div className="space-y-2">
            <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
              Pumping Experience
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  "Comfortable",
                  "Mild Discomfort",
                  "Difficult",
                  "Very Difficult",
                ] as PumpingExperience[]
              ).map((exp) => (
                <button
                  key={exp}
                  type="button"
                  onClick={() => setExperience(exp)}
                  className={`py-2.5 px-2.5 rounded-xl border text-xs font-extrabold transition-all text-center ${
                    experience === exp
                      ? exp === "Comfortable"
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                        : exp === "Mild Discomfort"
                        ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                        : "bg-rose-600 text-white border-rose-700 shadow-xs"
                      : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-slate-400"
                  }`}
                >
                  {exp}
                </button>
              ))}
            </div>
          </div>

          {/* G. BREAST / NIPPLE SYMPTOMS */}
          <div className="space-y-2">
            <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
              Breast / Nipple Symptoms
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  "None",
                  "Soreness",
                  "Cracking",
                  "Engorgement / Fullness",
                  "Other",
                ] as PumpingSymptom[]
              ).map((sym) => {
                const isSel = symptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                      isSel
                        ? sym === "None"
                          ? "bg-slate-800 text-white"
                          : "bg-rose-500 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          {/* H. WHAT HELPED */}
          <div className="space-y-2">
            <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
              What helped during pumping? (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  "Pump setting adjustment",
                  "Position change",
                  "Rest",
                  "Warm/cold compress",
                  "Lactation support",
                  "Other",
                  "Nothing",
                ] as PumpingRelief[]
              ).map((rel) => {
                const isSel = whatHelped?.includes(rel);
                return (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => toggleRelief(rel)}
                    className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                      isSel
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {rel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* I. NOTES */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-700 dark:text-rose-300 block">
              Session Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. First session after morning feed. Adjusted pump suction setting."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold text-xs text-slate-800 dark:text-rose-100"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>Save Pumping Session</span>
          </button>
        </form>
      </section>

      {/* PUMPING HISTORY TIMELINE & FLANGE GUIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* HISTORY LIST (7 COLS) */}
        <section className="lg:col-span-7 bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-rose-900/40 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-rose-900/30 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-blue-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">Pumping History</h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {logs.length} {logs.length === 1 ? "entry" : "entries"} logged
            </span>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 italic">
              No pumping sessions recorded yet. Use the form above to record your first milk expression.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#15111C] border border-slate-200/60 dark:border-gray-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-rose-100">
                        {log.date} • {log.startTime}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-extrabold text-[10px]">
                        {log.totalVolumeMl} mL
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400">Method:</span>{" "}
                      <strong className="text-slate-800 dark:text-rose-200">{log.method}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Breast:</span>{" "}
                      <strong className="text-slate-800 dark:text-rose-200">
                        {log.breastUsed} ({log.durationMinutes}m)
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Status:</span>{" "}
                      <strong className="text-emerald-600 dark:text-emerald-400">{log.milkAction}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Experience:</span>{" "}
                      <strong className="text-slate-800 dark:text-rose-200">{log.experience}</strong>
                    </div>
                  </div>

                  {log.symptoms && !log.symptoms.includes("None") && (
                    <div className="text-[11px] text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl border border-rose-200/50 dark:border-rose-900/30">
                      <strong>Symptoms:</strong> {log.symptoms.join(", ")}
                    </div>
                  )}

                  {log.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      "{log.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* FLANGE SIZING & STORAGE GUIDELINES (5 COLS) */}
        <section className="lg:col-span-5 bg-white dark:bg-[#1A1523] rounded-3xl p-6 border border-slate-200/80 dark:border-rose-900/40 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-rose-900/30 pb-3">
            <Thermometer className="w-4 h-4 text-blue-500" />
            <h3 className="font-bold text-slate-900 dark:text-rose-100 text-sm">Comfort & Milk Storage Guidelines</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#15111C] border border-slate-200/60 dark:border-gray-800 space-y-1.5">
              <p className="font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Flange Sizing Rule
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Measure nipple diameter before pumping. Flange tunnel should be 2-3mm larger than your nipple so it moves freely without pulling areola.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#15111C] border border-slate-200/60 dark:border-gray-800 space-y-1.5">
              <p className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Archive className="w-3.5 h-3.5" />
                Expressed Milk Storage (Rule of 4)
              </p>
              <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                <li><strong>Room Temp (&le;77°F / 25°C):</strong> 4 Hours</li>
                <li><strong>Refrigerator (40°F / 4°C):</strong> 4 Days</li>
                <li><strong>Freezer (&le;0°F / -18°C):</strong> 6 Months</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

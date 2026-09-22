import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  PostpartumProfile,
  BabyProfileData,
  BabyFeedingLog,
  BabyFeedingMethod,
  BreastUsed,
  BabyFeedingBehavior,
  BabyFeedingResponse,
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
  Milk,
  Utensils,
  Moon,
  Smile,
} from "lucide-react";

const POSTPARTUM_PROFILE_KEY = "bloomnest_postpartum_profile_v1";
const BABY_PROFILE_KEY = "bloomnest_baby_profile_v1";
const BABY_FEEDING_LOGS_KEY = "bloomnest_baby_feeding_logs_v1";

export const BabyFeedingPage: React.FC<{
  onNavigateSubPage?: (page: string) => void;
}> = ({ onNavigateSubPage }) => {
  const { user, showToast } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<PostpartumProfile | null>(null);
  const [babyProfile, setBabyProfile] = useState<BabyProfileData | null>(null);
  const [logs, setLogs] = useState<BabyFeedingLog[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Form state
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const [method, setMethod] = useState<BabyFeedingMethod>("Direct Breastfeeding");

  // Direct Breastfeeding fields
  const [breastUsed, setBreastUsed] = useState<BreastUsed>("Left");
  const [leftMins, setLeftMins] = useState<number>(12);
  const [rightMins, setRightMins] = useState<number>(0);

  // Bottle fields (Expressed Milk / Formula)
  const [volumeUnit, setVolumeUnit] = useState<"mL" | "oz">("mL");
  const [amountOffered, setAmountOffered] = useState<number>(90);
  const [amountConsumed, setAmountConsumed] = useState<number>(70);

  // Behavioral & Response observations
  const [behavior, setBehavior] = useState<BabyFeedingBehavior[]>(["Fed comfortably"]);
  const [response, setResponse] = useState<BabyFeedingResponse>("Calm / satisfied");
  const [notes, setNotes] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  // Load Feature 01, 03, & Existing Feature 10 Baby Feeding Logs
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

        // Load Feature 10 Feeding Logs
        const savedLogs = localStorage.getItem(BABY_FEEDING_LOGS_KEY);
        if (savedLogs) {
          setLogs(JSON.parse(savedLogs));
        }
      } catch (err) {
        console.error("Error loading baby feeding logs:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  // Handle Behavior Toggle
  const toggleBehavior = (b: BabyFeedingBehavior) => {
    if (b === "Fed comfortably") {
      setBehavior(["Fed comfortably"]);
      return;
    }
    const filtered = behavior.filter((item) => item !== "Fed comfortably");
    if (filtered.includes(b)) {
      const updated = filtered.filter((item) => item !== b);
      setBehavior(updated.length === 0 ? ["Fed comfortably"] : updated);
    } else {
      setBehavior([...filtered, b]);
    }
  };

  // Direct Breastfeeding Total Mins
  const totalDirectMins =
    breastUsed === "Left" ? leftMins : breastUsed === "Right" ? rightMins : leftMins + rightMins;

  // Remaining Bottle Amount (Offered - Consumed)
  const remainingBottleAmount = Math.max(0, amountOffered - amountConsumed);

  // Save Feeding Log
  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!profile) {
      setFormError("Postpartum context missing. Please configure delivery details first.");
      return;
    }

    if (method === "Direct Breastfeeding" && totalDirectMins <= 0) {
      setFormError("Please enter a valid breastfeeding duration (at least 1 minute).");
      return;
    }

    if ((method === "Expressed Breast Milk" || method === "Formula") && amountConsumed < 0) {
      setFormError("Consumed amount cannot be negative.");
      return;
    }

    const day = calculatePostpartumDay(profile.deliveryDate, logDate);
    const week = calculatePostpartumWeek(day);

    // Normalize volume to mL for bottle feeds
    const normalizedOfferedMl =
      volumeUnit === "oz" ? Math.round(amountOffered * 29.5735) : amountOffered;
    const normalizedConsumedMl =
      volumeUnit === "oz" ? Math.round(amountConsumed * 29.5735) : amountConsumed;
    const normalizedRemainingMl = Math.max(0, normalizedOfferedMl - normalizedConsumedMl);

    const newLog: BabyFeedingLog = {
      id: `feed_${Date.now()}`,
      date: logDate,
      startTime: startTime || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      postpartumDay: day,
      postpartumWeek: week,
      method,
      breastUsed: method === "Direct Breastfeeding" ? breastUsed : undefined,
      durationMinutes: method === "Direct Breastfeeding" ? totalDirectMins : undefined,
      leftDurationMinutes: method === "Direct Breastfeeding" && breastUsed !== "Right" ? leftMins : undefined,
      rightDurationMinutes: method === "Direct Breastfeeding" && breastUsed !== "Left" ? rightMins : undefined,
      amountOfferedMl: method !== "Direct Breastfeeding" ? normalizedOfferedMl : undefined,
      amountConsumedMl: method !== "Direct Breastfeeding" ? normalizedConsumedMl : undefined,
      amountRemainingMl: method !== "Direct Breastfeeding" ? normalizedRemainingMl : undefined,
      volumeUnit,
      behavior,
      response,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem(BABY_FEEDING_LOGS_KEY, JSON.stringify(updatedLogs));

    // Reset Form
    setStartTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setNotes("");
    setSaveSuccessMsg("Baby feeding session logged successfully!");
    if (showToast) showToast("Baby feeding logged!");

    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Delete Log Entry
  const handleDeleteLog = (logId: string) => {
    const updated = logs.filter((l) => l.id !== logId);
    setLogs(updated);
    localStorage.setItem(BABY_FEEDING_LOGS_KEY, JSON.stringify(updated));
    if (showToast) showToast("Log entry deleted");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading Baby Feeding Care...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-[#1A1523] rounded-3xl p-8 border border-rose-100 dark:border-rose-900/40 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-pink-100 dark:bg-pink-900/40 text-pink-600 flex items-center justify-center mx-auto">
            <Utensils className="w-8 h-8 text-pink-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-rose-100">Setup Postpartum Care First</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Feature 10 (Baby Feeding) consumes birth context from Feature 01. Please configure your delivery date first.
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

  // Today's Feeding Summary Stats
  const todayLogs = logs.filter((l) => l.date === logDate);
  const totalEventsToday = todayLogs.length;
  const directBfCount = todayLogs.filter((l) => l.method === "Direct Breastfeeding").length;
  const expressedMilkCount = todayLogs.filter((l) => l.method === "Expressed Breast Milk").length;
  const formulaCount = todayLogs.filter((l) => l.method === "Formula").length;

  // Measurable bottle intake (STRICTLY summed from bottle feeds; NO converting direct breastfeeding minutes to fake mL!)
  const totalBottleMlToday = todayLogs.reduce(
    (acc, l) => acc + (l.amountConsumedMl || 0),
    0
  );
  const totalBottleOzToday = (totalBottleMlToday / 29.5735).toFixed(1);

  const latestFeedLog = todayLogs[0] || logs[0];

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
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 uppercase tracking-wider">
              Feature 10
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Baby Feeding & Intake Care
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-rose-100 tracking-tight mt-1">
            Baby Feeding — Postpartum Day {postpartumDay}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="px-3 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-xs">
              {currentStage.title}
            </span>
            <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
            <span className="px-3 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1">
              <BabyIcon className="w-3.5 h-3.5 text-rose-500" />
              <span>{babyName}</span>
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
              className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors flex items-center gap-1.5"
            >
              <Milk className="w-3.5 h-3.5 text-pink-500" />
              <span>Breastfeeding (Feat 08)</span>
            </button>
            <button
              onClick={() => onNavigateSubPage("pumping")}
              className="px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors flex items-center gap-1.5"
            >
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              <span>Pumping (Feat 09)</span>
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

      {/* TODAY'S BABY FEEDING SUMMARY CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1A1523] p-4 rounded-2xl border border-slate-200/80 dark:border-rose-900/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Today's Feeding Events</span>
            <span className="text-2xl font-black text-slate-900 dark:text-rose-100">{totalEventsToday} feeds</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Recorded for {logDate}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/40 text-pink-600 flex items-center justify-center">
            <Utensils className="w-5 h-5 text-pink-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1523] p-4 rounded-2xl border border-slate-200/80 dark:border-rose-900/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Direct Breastfeeds</span>
            <span className="text-2xl font-black text-slate-900 dark:text-rose-100">{directBfCount} sessions</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Mother breastfeeds</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
            <Milk className="w-5 h-5 text-rose-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1523] p-4 rounded-2xl border border-slate-200/80 dark:border-rose-900/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Bottle Intake (Measurable)</span>
            <span className="text-2xl font-black text-slate-900 dark:text-rose-100">
              {volumeUnit === "mL" ? `${totalBottleMlToday} mL` : `${totalBottleOzToday} oz`}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Expressed milk & formula</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1523] p-4 rounded-2xl border border-slate-200/80 dark:border-rose-900/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Last Feed Logged</span>
            <span className="text-xs font-black text-slate-900 dark:text-rose-100 block">
              {latestFeedLog ? `${latestFeedLog.startTime} (${latestFeedLog.method})` : "None yet"}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
              {latestFeedLog?.response || "Tracking active"}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <Clock className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
      </section>

      {/* LOG BABY FEEDING SESSION FORM */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-rose-900/40 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-rose-900/30 pb-3 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300 flex items-center justify-center">
              <Utensils className="w-4 h-4 text-pink-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">Log Baby Feeding Event</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Record method, amount consumed, duration, behavior, and baby response.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(method === "Expressed Breast Milk" || method === "Formula") && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setVolumeUnit("mL")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    volumeUnit === "mL"
                      ? "bg-pink-600 text-white shadow-xs"
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
                      ? "bg-pink-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                  }`}
                >
                  oz
                </button>
              </div>
            )}

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
                <span>Feeding Start Time</span>
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

          {/* B. FEEDING METHOD */}
          <div className="space-y-2">
            <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
              Feeding Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(["Direct Breastfeeding", "Expressed Breast Milk", "Formula", "Other"] as BabyFeedingMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
                    method === m
                      ? "bg-pink-600 text-white border-pink-700 shadow-xs"
                      : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-pink-300"
                  }`}
                >
                  {m === "Direct Breastfeeding" && <Milk className="w-4 h-4 text-rose-300" />}
                  {m === "Expressed Breast Milk" && <Droplets className="w-4 h-4 text-blue-300" />}
                  {m === "Formula" && <Utensils className="w-4 h-4 text-amber-300" />}
                  {m === "Other" && <Info className="w-4 h-4 text-slate-300" />}
                  <span className="text-center">{m}</span>
                </button>
              ))}
            </div>
          </div>

          {/* C. DYNAMIC METHOD INPUTS */}
          {method === "Direct Breastfeeding" ? (
            /* DIRECT BREASTFEEDING FIELDS */
            <div className="space-y-2.5 bg-rose-50/50 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-200/60 dark:border-rose-900/40">
              <div className="flex items-center justify-between">
                <label className="font-extrabold text-rose-950 dark:text-rose-200 block">
                  Breast Used & Duration
                </label>
                <span className="px-3 py-0.5 rounded-full bg-rose-600 text-white font-extrabold text-xs">
                  Total: {totalDirectMins} mins
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
                        ? "bg-rose-600 text-white border-rose-700 shadow-xs"
                        : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-rose-300"
                    }`}
                  >
                    {b} Breast
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {(breastUsed === "Left" || breastUsed === "Both") && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-rose-900 dark:text-rose-300 block">
                      Left Breast Duration (min)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={leftMins}
                      onChange={(e) => setLeftMins(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-[#15111C] font-bold text-xs"
                    />
                  </div>
                )}

                {(breastUsed === "Right" || breastUsed === "Both") && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-rose-900 dark:text-rose-300 block">
                      Right Breast Duration (min)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={rightMins}
                      onChange={(e) => setRightMins(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-[#15111C] font-bold text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* BOTTLE FEEDING FIELDS (EXPRESSED MILK / FORMULA / OTHER) */
            <div className="space-y-2.5 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-200/60 dark:border-blue-900/40">
              <div className="flex items-center justify-between">
                <label className="font-extrabold text-blue-950 dark:text-blue-200 block">
                  Bottle Intake Amounts ({volumeUnit})
                </label>
                <span className="px-3 py-0.5 rounded-full bg-blue-600 text-white font-extrabold text-xs">
                  Remaining: {remainingBottleAmount} {volumeUnit}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-blue-900 dark:text-blue-300 block">
                    Amount Offered ({volumeUnit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={amountOffered}
                    onChange={(e) => setAmountOffered(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-blue-300 dark:border-blue-800 bg-white dark:bg-[#15111C] font-bold text-xs text-blue-950 dark:text-blue-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-blue-900 dark:text-blue-300 block">
                    Amount Consumed by Baby ({volumeUnit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={amountConsumed}
                    onChange={(e) => setAmountConsumed(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-blue-300 dark:border-blue-800 bg-white dark:bg-[#15111C] font-bold text-xs text-blue-950 dark:text-blue-100"
                  />
                </div>
              </div>
              <p className="text-[11px] text-blue-800 dark:text-blue-300 italic">
                * Note: Offered ≠ Consumed. Feature 10 records what baby actually drank.
              </p>
            </div>
          )}

          {/* D. BABY FEEDING BEHAVIOR */}
          <div className="space-y-2">
            <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
              Baby Feeding Behavior (Observations)
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  "Fed comfortably",
                  "Took breaks",
                  "Fussy during feeding",
                  "Difficulty staying latched",
                  "Fell asleep during feeding",
                  "Finished feeding",
                  "Stopped early",
                  "Other",
                ] as BabyFeedingBehavior[]
              ).map((b) => {
                const isSel = behavior.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBehavior(b)}
                    className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                      isSel
                        ? b === "Fed comfortably"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-pink-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          {/* E. BABY RESPONSE AFTER FEEDING */}
          <div className="space-y-2">
            <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
              Baby Response After Feeding
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  "Calm / satisfied",
                  "Still hungry",
                  "Sleepy",
                  "Fussy",
                  "Spit-up observed",
                  "Other",
                ] as BabyFeedingResponse[]
              ).map((resp) => (
                <button
                  key={resp}
                  type="button"
                  onClick={() => setResponse(resp)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold transition-all text-center ${
                    response === resp
                      ? resp === "Calm / satisfied" || resp === "Sleepy"
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                        : "bg-amber-500 text-white border-amber-600 shadow-xs"
                      : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-slate-400"
                  }`}
                >
                  {resp}
                </button>
              ))}
            </div>
          </div>

          {/* F. NOTES */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-700 dark:text-rose-300 block">
              Feeding Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Baby fed well but stopped after 50 mL. Fell asleep comfortably."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold text-xs text-slate-800 dark:text-rose-100"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>Save Baby Feeding Log</span>
          </button>
        </form>
      </section>

      {/* FEEDING HISTORY TIMELINE & FEEDING CUES GUIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* HISTORY LIST (7 COLS) */}
        <section className="lg:col-span-7 bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-rose-900/40 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-rose-900/30 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-pink-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">Feeding History</h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {logs.length} {logs.length === 1 ? "entry" : "entries"} logged
            </span>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 italic">
              No feeding events recorded yet. Use the form above to record your infant's first feed.
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
                      <span className="px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 font-extrabold text-[10px]">
                        {log.method}
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
                    {log.method === "Direct Breastfeeding" ? (
                      <div>
                        <span className="text-slate-400">Breast & Duration:</span>{" "}
                        <strong className="text-slate-800 dark:text-rose-200">
                          {log.breastUsed} ({log.durationMinutes}m)
                        </strong>
                      </div>
                    ) : (
                      <div>
                        <span className="text-slate-400">Intake:</span>{" "}
                        <strong className="text-slate-800 dark:text-rose-200">
                          {log.amountConsumedMl} mL consumed ({log.amountOfferedMl} mL offered)
                        </strong>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400">Response:</span>{" "}
                      <strong className="text-emerald-600 dark:text-emerald-400">{log.response || "Normal"}</strong>
                    </div>
                  </div>

                  {log.behavior && log.behavior.length > 0 && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1A1523] p-2 rounded-xl border border-slate-200/50 dark:border-gray-800">
                      <strong>Behavior:</strong> {log.behavior.join(", ")}
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

        {/* FEEDING CUES & BURPING GUIDELINES (5 COLS) */}
        <section className="lg:col-span-5 bg-white dark:bg-[#1A1523] rounded-3xl p-6 border border-slate-200/80 dark:border-rose-900/40 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-rose-900/30 pb-3">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <h3 className="font-bold text-slate-900 dark:text-rose-100 text-sm">Infant Feeding Cues & Burping</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#15111C] border border-slate-200/60 dark:border-gray-800 space-y-1.5">
              <p className="font-extrabold text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5" />
                Early Hunger Cues
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Look for rooting (turning head towards touch), lip smacking, or sucking on hands. Feed at early cues before crying starts.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#15111C] border border-slate-200/60 dark:border-gray-800 space-y-1.5">
              <p className="font-extrabold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5" />
                Burping Techniques
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Burp baby midway through bottle feeds or when switching breasts. Hold upright over shoulder or sit baby on lap supporting chin.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

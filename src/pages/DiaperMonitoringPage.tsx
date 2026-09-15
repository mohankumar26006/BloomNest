import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  PostpartumProfile,
  BabyProfileData,
  DiaperLog,
  DiaperType,
  UrineAmount,
  StoolColor,
  StoolConsistency,
  DiaperChangeReason,
  DiaperBabyBehavior,
} from "../types";
import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
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
  Trash2,
  Smile,
  ShieldCheck,
  TrendingUp,
  Filter,
} from "lucide-react";

const POSTPARTUM_PROFILE_KEY = "bloomnest_postpartum_profile_v1";
const BABY_PROFILE_KEY = "bloomnest_baby_profile_v1";
const DIAPER_LOGS_KEY = "bloomnest_diaper_logs_v1";

export const DiaperMonitoringPage: React.FC<{
  onNavigateSubPage?: (page: string) => void;
}> = ({ onNavigateSubPage }) => {
  const { user, showToast } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<PostpartumProfile | null>(null);
  const [babyProfile, setBabyProfile] = useState<BabyProfileData | null>(null);
  const [logs, setLogs] = useState<DiaperLog[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Twin / Multi-baby support state
  const [selectedBabyIndex, setSelectedBabyIndex] = useState<number>(0);

  // Form state
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [logTime, setLogTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const [diaperType, setDiaperType] = useState<DiaperType>("Wet");

  // Conditional fields
  const [urineAmount, setUrineAmount] = useState<UrineAmount>("Moderate");
  const [stoolColor, setStoolColor] = useState<StoolColor>("Yellow / Mustard");
  const [stoolConsistency, setStoolConsistency] = useState<StoolConsistency>("Seedy / Grainy");

  // Additional observations
  const [changeReason, setChangeReason] = useState<DiaperChangeReason>("Routine check");
  const [babyBehavior, setBabyBehavior] = useState<DiaperBabyBehavior>("Calm");
  const [notes, setNotes] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  // Load Feature 01, 03, & Existing Feature 11 Diaper Logs
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

        // Load Feature 11 Diaper Logs
        const savedLogs = localStorage.getItem(DIAPER_LOGS_KEY);
        if (savedLogs) {
          setLogs(JSON.parse(savedLogs));
        } else {
          // Initial sample seed logs for demonstration if empty
          const today = new Date().toISOString().split("T")[0];
          const sampleLogs: DiaperLog[] = [
            {
              id: "diaper_sample_1",
              date: today,
              time: "08:15 AM",
              timestamp: Date.now() - 3600000 * 3,
              postpartumDay: 5,
              postpartumWeek: 1,
              type: "Wet + Dirty",
              urineAmount: "Moderate",
              stoolColor: "Yellow / Mustard",
              stoolConsistency: "Seedy / Grainy",
              changeReason: "Before/After feeding",
              babyBehavior: "Calm",
              notes: "Normal mustard seedy stool after morning feed.",
              createdAt: new Date().toISOString(),
            },
            {
              id: "diaper_sample_2",
              date: today,
              time: "05:30 AM",
              timestamp: Date.now() - 3600000 * 6,
              postpartumDay: 5,
              postpartumWeek: 1,
              type: "Wet",
              urineAmount: "Moderate",
              changeReason: "Routine check",
              babyBehavior: "Sleepy",
              notes: "Good wet diaper before feeding.",
              createdAt: new Date().toISOString(),
            },
          ];
          setLogs(sampleLogs);
          localStorage.setItem(DIAPER_LOGS_KEY, JSON.stringify(sampleLogs));
        }
      } catch (err) {
        console.error("Error loading diaper monitoring data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Save Diaper Log Handler
  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaveSuccessMsg(null);

    // Context calculations from Feature 01 / Feature 03
    const deliveryDateStr = profile?.deliveryDate || babyProfile?.babyBirthDate || new Date().toISOString().split("T")[0];
    const pDay = calculatePostpartumDay(deliveryDateStr, logDate);
    const pWeek = calculatePostpartumWeek(pDay);

    const nowTimestamp = new Date(`${logDate} ${logTime}`).getTime() || Date.now();

    const babyName = babyProfile?.babyName || "Baby";

    const newLog: DiaperLog = {
      id: `diaper_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: logDate,
      time: logTime,
      timestamp: nowTimestamp,
      postpartumDay: pDay,
      postpartumWeek: pWeek,
      babyId: babyProfile ? "baby_1" : undefined,
      babyName,
      type: diaperType,
      urineAmount: diaperType === "Wet" || diaperType === "Wet + Dirty" ? urineAmount : undefined,
      stoolColor: diaperType === "Dirty" || diaperType === "Wet + Dirty" ? stoolColor : undefined,
      stoolConsistency: diaperType === "Dirty" || diaperType === "Wet + Dirty" ? stoolConsistency : undefined,
      changeReason,
      babyBehavior,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);

    try {
      localStorage.setItem(DIAPER_LOGS_KEY, JSON.stringify(updatedLogs));
      setSaveSuccessMsg("Diaper log saved successfully!");
      if (showToast) showToast("Diaper log recorded", "success");

      // Reset notes field
      setNotes("");

      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Failed to save diaper log:", err);
      setFormError("Failed to save record to storage.");
    }
  };

  // Delete Log Item Handler
  const handleDeleteLog = (id: string) => {
    if (window.confirm("Are you sure you want to delete this diaper record?")) {
      const filtered = logs.filter((l) => l.id !== id);
      setLogs(filtered);
      localStorage.setItem(DIAPER_LOGS_KEY, JSON.stringify(filtered));
      if (showToast) showToast("Diaper record removed", "info");
    }
  };

  // Dynamic Calculated Today's Totals
  const todayStr = new Date().toISOString().split("T")[0];
  const todayLogs = logs.filter((l) => l.date === todayStr);

  const todayTotalChanges = todayLogs.length;
  const todayWetCount = todayLogs.filter((l) => l.type === "Wet" || l.type === "Wet + Dirty").length;
  const todayDirtyCount = todayLogs.filter((l) => l.type === "Dirty" || l.type === "Wet + Dirty").length;
  const todayWetAndDirtyCount = todayLogs.filter((l) => l.type === "Wet + Dirty").length;
  const todayDryCount = todayLogs.filter((l) => l.type === "Dry").length;

  // Calculate age & stage context
  const birthDateStr = babyProfile?.babyBirthDate || profile?.deliveryDate || todayStr;
  const currentPostpartumDay = calculatePostpartumDay(birthDateStr, todayStr);
  const babyAgeText = formatBabyAge(currentPostpartumDay).formatted;
  const babyNameDisplay = babyProfile?.babyName || "Baby";

  // Last 3-Day Trend Calculation
  const getDayOffsetStr = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return d.toISOString().split("T")[0];
  };

  const trendDays = [
    { label: "Today", date: todayStr },
    { label: "Yesterday", date: getDayOffsetStr(1) },
    { label: "2 Days Ago", date: getDayOffsetStr(2) },
  ].map((item) => {
    const dayRecords = logs.filter((l) => l.date === item.date);
    return {
      ...item,
      total: dayRecords.length,
      wet: dayRecords.filter((l) => l.type === "Wet" || l.type === "Wet + Dirty").length,
      dirty: dayRecords.filter((l) => l.type === "Dirty" || l.type === "Wet + Dirty").length,
    };
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] text-slate-800 dark:text-slate-100 p-4 sm:p-6 lg:p-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* TOP BANNER & FEATURE BADGE */}
        <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-xs font-semibold rounded-full flex items-center gap-1.5">
                🧷 Feature 11 • Baby Diaper Monitoring
              </span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs font-medium rounded-full">
                Output Monitoring Source
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Baby Diaper Care
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Track wet & dirty diapers, urine amount, stool color & consistency for <strong className="text-amber-700 dark:text-amber-400 font-semibold">{babyNameDisplay}</strong> ({babyAgeText}).
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {onNavigateSubPage && (
              <button
                onClick={() => onNavigateSubPage("safety")}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-xs font-medium transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                View Safety Shield
              </button>
            )}
            {onNavigateSubPage && (
              <button
                onClick={() => onNavigateSubPage("baby_care")}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium transition flex items-center justify-center gap-1.5"
              >
                <BabyIcon className="w-4 h-4" />
                Baby Care Dashboard
              </button>
            )}
          </div>
        </div>

        {/* MULTI-BABY SELECTOR (If multiple babies) */}
        {profile?.numberOfBabies && profile.numberOfBabies > 1 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300 font-medium">
              <BabyIcon className="w-4 h-4" />
              <span>Multiple Babies ({profile.numberOfBabies} Twins / Multiples Log)</span>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: profile.numberOfBabies }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedBabyIndex(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    selectedBabyIndex === idx
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  Baby {idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TODAY'S DYNAMIC SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1A1523] rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Today's Changes</span>
              <span className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
                <Activity className="w-4 h-4" />
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{todayTotalChanges}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Calculated from saved logs</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1523] rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Wet Diapers</span>
              <span className="p-2 bg-sky-50 dark:bg-sky-900/30 rounded-xl text-sky-600 dark:text-sky-400">
                <Droplets className="w-4 h-4" />
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-sky-600 dark:text-sky-400">{todayWetCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentPostpartumDay <= 5 ? `Expected: ${Math.min(currentPostpartumDay, 5)}+ / day` : "Goal: 5-6+ / day"}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1523] rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Dirty Diapers</span>
              <span className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-700 dark:text-amber-400">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-amber-700 dark:text-amber-400">{todayDirtyCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Includes {todayWetAndDirtyCount} Wet+Dirty
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1523] rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">3-Day Trend</span>
              <span className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {trendDays[0].wet + trendDays[1].wet + trendDays[2].wet} Wet Total
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Hydration output stable</p>
            </div>
          </div>
        </div>

        {/* MAIN TWO-COLUMN GRID: FORM & TREND / HISTORY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN: DIAPER CHANGE LOGGER FORM (7 COLS) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#1A1523] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Plus className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Log Diaper Change</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Record diaper type, urine amount, stool color & behavior</p>
                </div>
              </div>
            </div>

            {saveSuccessMsg && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {formError && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-3 text-rose-800 dark:text-rose-300 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveLog} className="space-y-5">
              {/* DATE & TIME ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Time
                  </label>
                  <input
                    type="text"
                    value={logTime}
                    onChange={(e) => setLogTime(e.target.value)}
                    placeholder="e.g. 09:30 AM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              {/* DIAPER TYPE SELECTOR */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                  Diaper Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(["Wet", "Dirty", "Wet + Dirty", "Dry"] as DiaperType[]).map((t) => {
                    const isSelected = diaperType === t;
                    let icon = "💧";
                    let activeBg = "bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-sky-800 dark:text-sky-300";
                    if (t === "Dirty") {
                      icon = "💩";
                      activeBg = "bg-amber-50 dark:bg-amber-950/40 border-amber-600 text-amber-800 dark:text-amber-300";
                    } else if (t === "Wet + Dirty") {
                      icon = "💧💩";
                      activeBg = "bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-800 dark:text-purple-300";
                    } else if (t === "Dry") {
                      icon = "⚪";
                      activeBg = "bg-slate-100 dark:bg-slate-800 border-slate-400 text-slate-700 dark:text-slate-300";
                    }

                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setDiaperType(t)}
                        className={`p-3 rounded-2xl border text-xs font-medium flex flex-col items-center justify-center gap-1.5 transition ${
                          isSelected
                            ? `${activeBg} ring-2 ring-amber-500/20 shadow-sm font-semibold`
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="text-lg">{icon}</span>
                        <span>{t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CONDITIONAL URINE AMOUNT FIELDS (WET OR WET + DIRTY) */}
              {(diaperType === "Wet" || diaperType === "Wet + Dirty") && (
                <div className="p-4 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 rounded-2xl space-y-3">
                  <label className="block text-xs font-semibold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-sky-600" />
                    Urine Wetness Amount
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(["Light", "Moderate", "Heavy", "Not assessed"] as UrineAmount[]).map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setUrineAmount(amt)}
                        className={`px-3 py-2 rounded-xl text-xs transition ${
                          urineAmount === amt
                            ? "bg-sky-600 text-white font-semibold shadow-sm"
                            : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CONDITIONAL STOOL FIELDS (DIRTY OR WET + DIRTY) */}
              {(diaperType === "Dirty" || diaperType === "Wet + Dirty") && (
                <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-amber-900 dark:text-amber-300 mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Stool Color
                    </label>
                    <select
                      value={stoolColor}
                      onChange={(e) => setStoolColor(e.target.value as StoolColor)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Yellow / Mustard">💛 Yellow / Mustard (Normal milk stool)</option>
                      <option value="Green / Transitional">💚 Green / Transitional (Days 3-4)</option>
                      <option value="Meconium (Black/Tarry)">🖤 Meconium (Black/Tarry - Days 1-2)</option>
                      <option value="Brown">🤎 Brown</option>
                      <option value="Red / Bloody">🚨 Red / Bloody (Safety concern)</option>
                      <option value="Pale / White / Clay">🚨 Pale / White / Clay (Biliary concern)</option>
                      <option value="Other">Other</option>
                      <option value="Not assessed">Not assessed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-900 dark:text-amber-300 mb-1.5">
                      Stool Consistency
                    </label>
                    <select
                      value={stoolConsistency}
                      onChange={(e) => setStoolConsistency(e.target.value as StoolConsistency)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Seedy / Grainy">Seedy / Grainy (Normal breastfed)</option>
                      <option value="Soft / Pasty">Soft / Pasty (Normal formula fed)</option>
                      <option value="Loose / Liquid">Loose / Liquid</option>
                      <option value="Thick / Formed">Thick / Formed</option>
                      <option value="Hard / Pellets">Hard / Pellets (Constipation concern)</option>
                      <option value="Other">Other</option>
                      <option value="Not assessed">Not assessed</option>
                    </select>
                  </div>
                </div>
              )}

              {/* CHANGE REASON & BABY BEHAVIOR ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Change Reason
                  </label>
                  <select
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value as DiaperChangeReason)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Routine check">Routine check</option>
                    <option value="Fussy / Crying">Fussy / Crying</option>
                    <option value="Smell">Smell</option>
                    <option value="Leaking">Leaking</option>
                    <option value="Before/After feeding">Before/After feeding</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Baby Behavior
                  </label>
                  <select
                    value={babyBehavior}
                    onChange={(e) => setBabyBehavior(e.target.value as DiaperBabyBehavior)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Calm">😌 Calm</option>
                    <option value="Fussy">🥺 Fussy</option>
                    <option value="Crying">😭 Crying</option>
                    <option value="Sleepy">😴 Sleepy</option>
                  </select>
                </div>
              </div>

              {/* NOTES */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Optional Diaper Observations & Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., mild diaper rash observed, changed cream after cleaning..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Save Diaper Log
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: TREND WIDGET & STOOL GUIDE (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">

            {/* 3-DAY TREND WIDGET */}
            <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">3-Day Diaper Output Trend</h3>
              </div>

              <div className="space-y-3">
                {trendDays.map((day) => (
                  <div key={day.label} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{day.label} ({day.date})</span>
                      <span className="text-amber-700 dark:text-amber-400">{day.total} Changes</span>
                    </div>
                    <div className="flex gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300 rounded-md">
                        💧 {day.wet} Wet
                      </span>
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded-md">
                        💩 {day.dirty} Dirty
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* NEWBORN STOOL & HYDRATION EDUCATIONAL GUIDE */}
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Newborn Stool & Hydration Guide</h3>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2 p-2.5 bg-white/70 dark:bg-slate-800/70 rounded-xl">
                  <span className="text-base">🖤</span>
                  <div>
                    <strong className="block text-slate-900 dark:text-white">Days 1–2: Meconium</strong>
                    Black, sticky, tar-like. Expected 1–2 wet & 1+ dirty diaper per day.
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 bg-white/70 dark:bg-slate-800/70 rounded-xl">
                  <span className="text-base">💚</span>
                  <div>
                    <strong className="block text-slate-900 dark:text-white">Days 3–4: Transitional Stool</strong>
                    Greenish-brown, less sticky. Expected 3–4 wet & 2+ dirty diapers per day.
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 bg-white/70 dark:bg-slate-800/70 rounded-xl">
                  <span className="text-base">💛</span>
                  <div>
                    <strong className="block text-slate-900 dark:text-white">Days 5+: Milk Stool</strong>
                    Yellow/Mustard, seedy (breastfed) or tan/soft (formula). Expected 5–6+ wet & 3+ dirty per day.
                  </div>
                </div>

                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl text-rose-800 dark:text-rose-300">
                  <strong>🚨 Safety Warning Colors:</strong> Contact pediatrician immediately if stool is <strong>Red / Bloody</strong> or <strong>Pale / White / Clay</strong>.
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* DIAPER HISTORY TIMELINE */}
        <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Diaper History Timeline</h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Total {logs.length} logged records
            </span>
          </div>

          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No diaper changes logged yet. Use the form above to record your first diaper change!
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                let badgeBg = "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300";
                let icon = "💧";
                if (log.type === "Dirty") {
                  badgeBg = "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
                  icon = "💩";
                } else if (log.type === "Wet + Dirty") {
                  badgeBg = "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
                  icon = "💧💩";
                } else if (log.type === "Dry") {
                  badgeBg = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
                  icon = "⚪";
                }

                return (
                  <div
                    key={log.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${badgeBg}`}>
                          <span>{icon}</span>
                          <span>{log.type}</span>
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {log.date} @ {log.time}
                        </span>
                        <span className="text-xs text-slate-400">
                          (Day {log.postpartumDay})
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                        {log.urineAmount && (
                          <p>💧 <strong>Urine:</strong> {log.urineAmount}</p>
                        )}
                        {log.stoolColor && (
                          <p>
                            💩 <strong>Stool:</strong> {log.stoolColor} ({log.stoolConsistency || "Standard"})
                          </p>
                        )}
                        <p className="text-slate-500 dark:text-slate-400">
                          <strong>Reason:</strong> {log.changeReason || "Routine"} • <strong>Behavior:</strong> {log.babyBehavior || "Calm"}
                        </p>
                        {log.notes && (
                          <p className="text-amber-800 dark:text-amber-300 italic bg-amber-50/60 dark:bg-amber-950/30 p-2 rounded-lg mt-1">
                            "{log.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                      title="Delete log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

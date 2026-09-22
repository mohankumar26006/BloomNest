import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  PostpartumProfile,
  BabyProfileData,
  BabySleepLog,
  BabySleepType,
  BabySettlingEase,
  BabySleepBehavior,
  BabySleepOnsetMethod,
  BabyAwakeningReason,
  BabySleepEnvironment,
  BabyWakingState,
} from "../types";
import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
  formatBabyAge,
} from "../utils/postpartumUtils";
import {
  Moon,
  Sun,
  Activity,
  Heart,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  History,
  Info,
  ShieldCheck,
  TrendingUp,
  Trash2,
  Bed,
  Baby as BabyIcon,
  Sparkles,
  Smile,
  Utensils,
  Droplets,
} from "lucide-react";

const POSTPARTUM_PROFILE_KEY = "bloomnest_postpartum_profile_v1";
const BABY_PROFILE_KEY = "bloomnest_baby_profile_v1";
const BABY_SLEEP_LOGS_KEY = "bloomnest_baby_sleep_logs_v1";

export const BabySleepPage: React.FC<{
  onNavigateSubPage?: (page: string) => void;
}> = ({ onNavigateSubPage }) => {
  const { user, showToast } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<PostpartumProfile | null>(null);
  const [babyProfile, setBabyProfile] = useState<BabyProfileData | null>(null);
  const [logs, setLogs] = useState<BabySleepLog[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Twin / Multi-baby support state
  const [selectedBabyIndex, setSelectedBabyIndex] = useState<number>(0);

  // Form state
  const [sleepDate, setSleepDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState<string>("10:30 AM");
  const [endTime, setEndTime] = useState<string>("11:45 AM");
  const [sleepType, setSleepType] = useState<BabySleepType>("Daytime nap");
  const [settlingEase, setSettlingEase] = useState<BabySettlingEase>("Settled easily");
  const [sleepBehavior, setSleepBehavior] = useState<BabySleepBehavior>("Slept comfortably");
  const [onsetMethod, setOnsetMethod] = useState<BabySleepOnsetMethod>("Feeding");
  const [awakeningsCount, setAwakeningsCount] = useState<number>(0);
  const [awakeningReason, setAwakeningReason] = useState<BabyAwakeningReason>("Feeding");
  const [sleepEnvironment, setSleepEnvironment] = useState<BabySleepEnvironment>("Bassinet");
  const [wakingState, setWakingState] = useState<BabyWakingState>("Calm");
  const [notes, setNotes] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  // Caregiving context counts for night timeline
  const [careFeedCount, setCareFeedCount] = useState<number>(0);
  const [careDiaperCount, setCareDiaperCount] = useState<number>(0);

  // Helper to compute duration in minutes between start time and end time strings
  const calculateDurationMins = (startStr: string, endStr: string): number => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const startMs = new Date(`${today} ${startStr}`).getTime();
      let endMs = new Date(`${today} ${endStr}`).getTime();

      // If end time is earlier than start time, assume overnight sleep spanning next day
      if (endMs <= startMs) {
        endMs += 24 * 3600 * 1000;
      }

      const diffMins = Math.round((endMs - startMs) / (1000 * 60));
      return isNaN(diffMins) || diffMins <= 0 ? 75 : diffMins;
    } catch {
      return 75; // default 1h 15m
    }
  };

  const calculatedDurationMinutes = calculateDurationMins(startTime, endTime);
  const durationHoursText = `${Math.floor(calculatedDurationMinutes / 60)}h ${calculatedDurationMinutes % 60}m`;

  // Load Feature 01, 03, & Existing Feature 13 Baby Sleep Logs
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

        // Load Feature 13 Baby Sleep Logs
        const savedLogs = localStorage.getItem(BABY_SLEEP_LOGS_KEY);
        if (savedLogs) {
          setLogs(JSON.parse(savedLogs));
        } else {
          // Initial sample seed logs for demonstration if empty
          const today = new Date().toISOString().split("T")[0];
          const sampleLogs: BabySleepLog[] = [
            {
              id: "bsleep_sample_1",
              date: today,
              startTime: "10:30 AM",
              endTime: "11:45 AM",
              timestamp: Date.now() - 3600000 * 3,
              durationMinutes: 75,
              type: "Daytime nap",
              settlingEase: "Settled easily",
              sleepBehavior: "Slept comfortably",
              onsetMethod: "Feeding",
              awakeningsCount: 0,
              sleepEnvironment: "Bassinet",
              wakingState: "Calm",
              notes: "Fell asleep smoothly right after morning feed.",
              postpartumDay: 5,
              postpartumWeek: 1,
              createdAt: new Date().toISOString(),
            },
            {
              id: "bsleep_sample_2",
              date: today,
              startTime: "02:00 AM",
              endTime: "06:30 AM",
              timestamp: Date.now() - 3600000 * 8,
              durationMinutes: 270,
              type: "Night sleep",
              settlingEase: "Needed some soothing",
              sleepBehavior: "Restless",
              onsetMethod: "Rocking",
              awakeningsCount: 2,
              awakeningReason: "Feeding",
              sleepEnvironment: "Crib",
              wakingState: "Alert",
              notes: "Woke up twice for feeding around 3:30 AM.",
              postpartumDay: 5,
              postpartumWeek: 1,
              createdAt: new Date().toISOString(),
            },
          ];
          setLogs(sampleLogs);
          localStorage.setItem(BABY_SLEEP_LOGS_KEY, JSON.stringify(sampleLogs));
        }

        // Load context counts
        const todayStr = new Date().toISOString().split("T")[0];
        const savedFeeds = localStorage.getItem("bloomnest_baby_feeding_logs_v1");
        if (savedFeeds) {
          const feeds = JSON.parse(savedFeeds);
          setCareFeedCount(feeds.filter((f: any) => f.date === todayStr).length);
        }

        const savedDiapers = localStorage.getItem("bloomnest_diaper_logs_v1");
        if (savedDiapers) {
          const diapers = JSON.parse(savedDiapers);
          setCareDiaperCount(diapers.filter((d: any) => d.date === todayStr).length);
        }
      } catch (err) {
        console.error("Error loading baby sleep data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Handle Save Baby Sleep Session
  const handleSaveSleepLog = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaveSuccessMsg(null);

    const deliveryDateStr = profile?.deliveryDate || babyProfile?.babyBirthDate || new Date().toISOString().split("T")[0];
    const pDay = calculatePostpartumDay(deliveryDateStr, sleepDate);
    const pWeek = calculatePostpartumWeek(pDay);

    const durMins = calculateDurationMins(startTime, endTime);
    const nowTimestamp = new Date(`${sleepDate} ${startTime}`).getTime() || Date.now();
    const babyName = babyProfile?.babyName || "Baby";

    const newLog: BabySleepLog = {
      id: `bsleep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: sleepDate,
      startTime,
      endTime,
      timestamp: nowTimestamp,
      durationMinutes: durMins,
      type: sleepType,
      settlingEase,
      sleepBehavior,
      onsetMethod,
      awakeningsCount,
      awakeningReason: awakeningsCount > 0 ? awakeningReason : undefined,
      sleepEnvironment,
      wakingState,
      notes: notes.trim() || undefined,
      babyId: babyProfile ? "baby_1" : undefined,
      babyName,
      postpartumDay: pDay,
      postpartumWeek: pWeek,
      createdAt: new Date().toISOString(),
    };

    const updated = [newLog, ...logs];
    setLogs(updated);

    try {
      localStorage.setItem(BABY_SLEEP_LOGS_KEY, JSON.stringify(updated));
      setSaveSuccessMsg("Baby sleep session recorded successfully!");
      if (showToast) showToast("Baby sleep session logged", "success");
      setNotes("");
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Failed to save baby sleep log:", err);
      setFormError("Failed to save baby sleep record.");
    }
  };

  // Delete Log Handler
  const handleDeleteLog = (id: string) => {
    if (window.confirm("Are you sure you want to delete this baby sleep record?")) {
      const filtered = logs.filter((l) => l.id !== id);
      setLogs(filtered);
      localStorage.setItem(BABY_SLEEP_LOGS_KEY, JSON.stringify(filtered));
      if (showToast) showToast("Baby sleep record deleted", "info");
    }
  };

  // Dynamic Calculated Today's Totals
  const todayStr = new Date().toISOString().split("T")[0];
  const todayLogs = logs.filter((l) => l.date === todayStr);

  const todayTotalMins = todayLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
  const todayNightMins = todayLogs.filter((l) => l.type === "Night sleep").reduce((acc, l) => acc + l.durationMinutes, 0);
  const todayDayMins = todayLogs.filter((l) => l.type !== "Night sleep").reduce((acc, l) => acc + l.durationMinutes, 0);
  const todayAwakeningsTotal = todayLogs.reduce((acc, l) => acc + l.awakeningsCount, 0);
  const todayNapsCount = todayLogs.filter((l) => l.type === "Daytime nap" || l.type === "Short nap").length;

  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);
  const latestLog = sortedLogs[0];

  const birthDateStr = babyProfile?.babyBirthDate || profile?.deliveryDate || todayStr;
  const currentPostpartumDay = calculatePostpartumDay(birthDateStr, todayStr);
  const babyAgeText = formatBabyAge(currentPostpartumDay).formatted;
  const babyNameDisplay = babyProfile?.babyName || "Baby";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
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
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 text-xs font-semibold rounded-full flex items-center gap-1.5">
                😴 Feature 13 • Baby Sleep Care
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 text-xs font-medium rounded-full">
                Infant Sleep Event Source
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Baby Sleep Care
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Record sleep windows, naps, awakenings, settling ease, and wake states for <strong className="text-indigo-700 dark:text-indigo-400 font-semibold">{babyNameDisplay}</strong> ({babyAgeText}).
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {onNavigateSubPage && (
              <button
                onClick={() => onNavigateSubPage("safety")}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-medium transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                View Safety Shield
              </button>
            )}
            {onNavigateSubPage && (
              <button
                onClick={() => onNavigateSubPage("baby-care")}
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
          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-indigo-800 dark:text-indigo-300 font-medium">
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
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  Baby {idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TODAY'S DYNAMIC BABY SLEEP SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1A1523] rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Baby Sleep</span>
              <span className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Moon className="w-4 h-4" />
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {Math.floor(todayTotalMins / 60)}h {todayTotalMins % 60}m
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Night: {Math.floor(todayNightMins / 60)}h {todayNightMins % 60}m • Day: {Math.floor(todayDayMins / 60)}h {todayDayMins % 60}m
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1523] rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sessions & Naps</span>
              <span className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                <Bed className="w-4 h-4" />
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{todayLogs.length} Sessions</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {todayNapsCount} daytime naps recorded
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1523] rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Awakenings Logged</span>
              <span className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">{todayAwakeningsTotal}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Primary: Feeding & Diaper changes
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1523] rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Latest Sleep Event</span>
              <span className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {latestLog ? `Woke @ ${latestLog.endTime}` : "No sleep logged"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {latestLog ? `${latestLog.type} (${Math.floor(latestLog.durationMinutes / 60)}h ${latestLog.durationMinutes % 60}m)` : "Ready to log"}
              </p>
            </div>
          </div>
        </div>

        {/* MAIN TWO-COLUMN GRID: SLEEP LOGGER FORM & CAREGIVING CONTEXT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN: BABY SLEEP SESSION LOGGER FORM (7 COLS) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#1A1523] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Plus className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Log Baby Sleep Session</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Record sleep start/end, settling ease & onset method</p>
                </div>
              </div>
            </div>

            {saveSuccessMsg && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm">
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

            <form onSubmit={handleSaveSleepLog} className="space-y-5">
              {/* DATE ROW */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Date
                </label>
                <input
                  type="date"
                  value={sleepDate}
                  onChange={(e) => setSleepDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* START TIME & END TIME ROW WITH AUTO-DURATION */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl">
                <div>
                  <label className="block text-xs font-semibold text-indigo-900 dark:text-indigo-300 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    Sleep Started
                  </label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-indigo-900 dark:text-indigo-300 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    Woke Up
                  </label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="e.g. 11:45 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="flex flex-col justify-center items-center bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Calculated Duration</span>
                  <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">{durationHoursText}</span>
                </div>
              </div>

              {/* SLEEP CATEGORY SELECTOR */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                  Sleep Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(["Night sleep", "Daytime nap", "Short nap", "Other/rest"] as BabySleepType[]).map((t) => {
                    const isSelected = sleepType === t;
                    let icon = "🌙";
                    if (t === "Daytime nap") icon = "☀️";
                    else if (t === "Short nap") icon = "💤";
                    else if (t === "Other/rest") icon = "🛋️";

                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSleepType(t)}
                        className={`p-3 rounded-2xl border text-xs font-medium flex flex-col items-center justify-center gap-1.5 transition ${
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-800 dark:text-indigo-300 ring-2 ring-indigo-500/20 font-semibold shadow-sm"
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

              {/* EASE OF SETTLING & SLEEP ONSET METHOD ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Ease of Settling
                  </label>
                  <select
                    value={settlingEase}
                    onChange={(e) => setSettlingEase(e.target.value as BabySettlingEase)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Settled easily">😌 Settled easily</option>
                    <option value="Needed some soothing">🤗 Needed some soothing</option>
                    <option value="Difficult to settle">🥺 Difficult to settle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Sleep Onset Method (How fell asleep)
                  </label>
                  <select
                    value={onsetMethod}
                    onChange={(e) => setOnsetMethod(e.target.value as BabySleepOnsetMethod)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Feeding">🍼 Feeding</option>
                    <option value="Rocking">👶 Rocking</option>
                    <option value="Holding">🤗 Holding</option>
                    <option value="Swaddling">🛌 Swaddling</option>
                    <option value="Pacifier">👶 Pacifier</option>
                    <option value="Self-settled">✨ Self-settled</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* AWAKENINGS & REASON */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Awakenings During Session
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAwakeningsCount(Math.max(0, awakeningsCount - 1))}
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition"
                      >
                        -
                      </button>
                      <span className="font-bold text-slate-900 dark:text-white px-2 text-sm">{awakeningsCount}</span>
                      <button
                        type="button"
                        onClick={() => setAwakeningsCount(awakeningsCount + 1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {awakeningsCount > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                      Main Awakening Reason
                    </label>
                    <select
                      value={awakeningReason}
                      onChange={(e) => setAwakeningReason(e.target.value as BabyAwakeningReason)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Feeding">🍼 Feeding</option>
                      <option value="Diaper change">🧷 Diaper change</option>
                      <option value="Crying">😭 Crying</option>
                      <option value="Discomfort">😣 Discomfort</option>
                      <option value="Unknown">Unknown</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}
              </div>

              {/* ENVIRONMENT & WAKING STATE ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Sleep Environment / Location
                  </label>
                  <select
                    value={sleepEnvironment}
                    onChange={(e) => setSleepEnvironment(e.target.value as BabySleepEnvironment)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Bassinet">Bassinet</option>
                    <option value="Crib">Crib</option>
                    <option value="Bed">Bed</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Baby State After Waking
                  </label>
                  <select
                    value={wakingState}
                    onChange={(e) => setWakingState(e.target.value as BabyWakingState)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Calm">😌 Calm</option>
                    <option value="Alert">👀 Alert</option>
                    <option value="Sleepy">😴 Sleepy</option>
                    <option value="Fussy">🥺 Fussy</option>
                    <option value="Crying">😭 Crying</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* NOTES */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Optional Sleep Observations & Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. baby woke twice for feeding, swaddle helped calm before sleep..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Save Baby Sleep Session
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: SHARED CAREGIVING TIMELINE CONTEXT (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">

            {/* SHARED TIMELINE SUMMARY WIDGET */}
            <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Correlated Caregiving Events Today</h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Feature 13 correlates feeding (F10) and diaper (F11) events around sleep windows as factual observations without asserting forced causality.
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center p-3 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-teal-600" />
                    <span>Baby Feeding Sessions (Feature 10)</span>
                  </div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{careFeedCount} logged today</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-sky-600" />
                    <span>Diaper Changes (Feature 11)</span>
                  </div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{careDiaperCount} logged today</span>
                </div>
              </div>
            </div>

            {/* NEWBORN SLEEP PATTERN GUIDANCE CARD */}
            <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Newborn Sleep Stage Reference</span>
              </div>
              <p className="leading-relaxed">
                Newborns (Weeks 1–4) typically sleep 14–17 hours per 24-hour period in short 2–4 hour cycles driven by feeding needs.
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1 text-[11px]">
                <strong className="block text-slate-800 dark:text-slate-200">Safe Sleep Practices:</strong>
                <p>• Always place baby on back to sleep on a firm mattress.</p>
                <p>• Keep crib free of loose bedding, pillows, and soft toys.</p>
              </div>
            </div>

          </div>
        </div>

        {/* BABY SLEEP HISTORY TIMELINE */}
        <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Baby Sleep History Timeline</h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Total {logs.length} logged records
            </span>
          </div>

          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No baby sleep sessions logged yet. Use the form above to record your baby's first sleep session!
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 font-bold">
                        {log.type} ({Math.floor(log.durationMinutes / 60)}h {log.durationMinutes % 60}m)
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {log.date} ({log.startTime} - {log.endTime})
                      </span>
                      <span className="text-slate-400">(Day {log.postpartumDay})</span>
                    </div>

                    <div className="text-slate-600 dark:text-slate-300 space-y-1">
                      <p>
                        😴 <strong>Settling:</strong> {log.settlingEase || "Standard"} • <strong>Onset:</strong> {log.onsetMethod || "Not recorded"} • <strong>State:</strong> {log.wakingState || "Calm"}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        <strong>Awakenings:</strong> {log.awakeningsCount} {log.awakeningReason ? `(Reason: ${log.awakeningReason})` : ""} • <strong>Environment:</strong> {log.sleepEnvironment || "Bassinet"}
                      </p>
                      {log.notes && (
                        <p className="text-indigo-800 dark:text-indigo-300 italic bg-indigo-50/60 dark:bg-indigo-950/30 p-2 rounded-lg mt-1">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

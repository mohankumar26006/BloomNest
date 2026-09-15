import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  PostpartumProfile,
  BabyProfileData,
  MotherSleepLog,
  MotherFatigueLog,
  SleepType,
  SleepQuality,
  InterruptionReason,
  FatigueFunctionalImpact,
} from "../types";
import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
  getRecoveryStage,
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
  Zap,
  Bed,
  Smile,
  Frown,
  Meh,
  Sparkles,
} from "lucide-react";

const POSTPARTUM_PROFILE_KEY = "bloomnest_postpartum_profile_v1";
const SLEEP_LOGS_KEY = "bloomnest_mother_sleep_logs_v1";
const FATIGUE_LOGS_KEY = "bloomnest_mother_fatigue_logs_v1";

export const MotherSleepFatiguePage: React.FC<{
  onNavigateSubPage?: (page: string) => void;
}> = ({ onNavigateSubPage }) => {
  const { user, showToast } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<PostpartumProfile | null>(null);
  const [sleepLogs, setSleepLogs] = useState<MotherSleepLog[]>([]);
  const [fatigueLogs, setFatigueLogs] = useState<MotherFatigueLog[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Sleep Logger Form state
  const [sleepDate, setSleepDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState<string>("11:30 PM");
  const [endTime, setEndTime] = useState<string>("02:30 AM");
  const [sleepType, setSleepType] = useState<SleepType>("Night sleep");
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>("Fair");
  const [awakeningsCount, setAwakeningsCount] = useState<number>(2);
  const [selectedReasons, setSelectedReasons] = useState<InterruptionReason[]>(["Baby feeding"]);
  const [sleepNotes, setSleepNotes] = useState<string>("");
  const [sleepFormError, setSleepFormError] = useState<string | null>(null);

  // Fatigue Check-in Form state
  const [fatigueDate, setFatigueDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [fatigueTime, setFatigueTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const [fatigueScore, setFatigueScore] = useState<number>(6);
  const [functionalImpact, setFunctionalImpact] = useState<FatigueFunctionalImpact>("Moderately affecting me");
  const [fatigueNotes, setFatigueNotes] = useState<string>("");

  // Cross-feature night context logs
  const [nightFeedCount, setNightFeedCount] = useState<number>(0);
  const [nightPumpCount, setNightPumpCount] = useState<number>(0);
  const [nightDiaperCount, setNightDiaperCount] = useState<number>(0);

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
      return isNaN(diffMins) || diffMins <= 0 ? 180 : diffMins;
    } catch {
      return 180; // default 3 hrs
    }
  };

  const calculatedDurationMinutes = calculateDurationMins(startTime, endTime);
  const durationHoursText = `${Math.floor(calculatedDurationMinutes / 60)}h ${calculatedDurationMinutes % 60}m`;

  // Load Feature 01 Context & Existing Feature 12 Logs
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

        // Load Sleep Logs
        const savedSleep = localStorage.getItem(SLEEP_LOGS_KEY);
        if (savedSleep) {
          setSleepLogs(JSON.parse(savedSleep));
        } else {
          // Initial sample sleep seed logs
          const today = new Date().toISOString().split("T")[0];
          const sampleSleep: MotherSleepLog[] = [
            {
              id: "sleep_sample_1",
              date: today,
              startTime: "11:00 PM",
              endTime: "03:30 AM",
              durationMinutes: 270,
              type: "Night sleep",
              quality: "Fair",
              awakeningsCount: 3,
              interruptionReasons: ["Baby feeding", "Diaper change"],
              notes: "Woke up twice for baby feeding and diaper change.",
              postpartumDay: 5,
              postpartumWeek: 1,
              createdAt: new Date().toISOString(),
            },
            {
              id: "sleep_sample_2",
              date: today,
              startTime: "01:30 PM",
              endTime: "02:45 PM",
              durationMinutes: 75,
              type: "Daytime nap",
              quality: "Good",
              awakeningsCount: 0,
              interruptionReasons: [],
              notes: "Restful afternoon nap while baby slept.",
              postpartumDay: 5,
              postpartumWeek: 1,
              createdAt: new Date().toISOString(),
            },
          ];
          setSleepLogs(sampleSleep);
          localStorage.setItem(SLEEP_LOGS_KEY, JSON.stringify(sampleSleep));
        }

        // Load Fatigue Logs
        const savedFatigue = localStorage.getItem(FATIGUE_LOGS_KEY);
        if (savedFatigue) {
          setFatigueLogs(JSON.parse(savedFatigue));
        } else {
          const today = new Date().toISOString().split("T")[0];
          const sampleFatigue: MotherFatigueLog[] = [
            {
              id: "fatigue_sample_1",
              date: today,
              time: "03:00 PM",
              timestamp: Date.now() - 3600000 * 2,
              fatigueScore: 6,
              functionalImpact: "Moderately affecting me",
              notes: "Feeling tired in afternoon, rest helped slightly.",
              postpartumDay: 5,
              postpartumWeek: 1,
              createdAt: new Date().toISOString(),
            },
          ];
          setFatigueLogs(sampleFatigue);
          localStorage.setItem(FATIGUE_LOGS_KEY, JSON.stringify(sampleFatigue));
        }

        // Cross-feature night caregiving count calculation
        const todayStr = new Date().toISOString().split("T")[0];
        const savedFeeds = localStorage.getItem("bloomnest_baby_feeding_logs_v1");
        if (savedFeeds) {
          const feeds = JSON.parse(savedFeeds);
          setNightFeedCount(feeds.filter((f: any) => f.date === todayStr).length);
        }

        const savedPumps = localStorage.getItem("bloomnest_pumping_logs_v1");
        if (savedPumps) {
          const pumps = JSON.parse(savedPumps);
          setNightPumpCount(pumps.filter((p: any) => p.date === todayStr).length);
        }

        const savedDiapers = localStorage.getItem("bloomnest_diaper_logs_v1");
        if (savedDiapers) {
          const diapers = JSON.parse(savedDiapers);
          setNightDiaperCount(diapers.filter((d: any) => d.date === todayStr).length);
        }
      } catch (err) {
        console.error("Error loading mother sleep & fatigue data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Handle Save Sleep Session
  const handleSaveSleepLog = (e: React.FormEvent) => {
    e.preventDefault();
    setSleepFormError(null);
    setSaveSuccessMsg(null);

    const deliveryDateStr = profile?.deliveryDate || new Date().toISOString().split("T")[0];
    const pDay = calculatePostpartumDay(deliveryDateStr, sleepDate);
    const pWeek = calculatePostpartumWeek(pDay);

    const durMins = calculateDurationMins(startTime, endTime);

    const newLog: MotherSleepLog = {
      id: `sleep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: sleepDate,
      startTime,
      endTime,
      durationMinutes: durMins,
      type: sleepType,
      quality: sleepQuality,
      awakeningsCount,
      interruptionReasons: selectedReasons,
      notes: sleepNotes.trim() || undefined,
      postpartumDay: pDay,
      postpartumWeek: pWeek,
      createdAt: new Date().toISOString(),
    };

    const updated = [newLog, ...sleepLogs];
    setSleepLogs(updated);

    try {
      localStorage.setItem(SLEEP_LOGS_KEY, JSON.stringify(updated));
      setSaveSuccessMsg("Sleep session recorded successfully!");
      if (showToast) showToast("Sleep session logged", "success");
      setSleepNotes("");
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Failed to save sleep log:", err);
      setSleepFormError("Failed to save sleep record.");
    }
  };

  // Handle Save Fatigue Check-in
  const handleSaveFatigueLog = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessMsg(null);

    const deliveryDateStr = profile?.deliveryDate || new Date().toISOString().split("T")[0];
    const pDay = calculatePostpartumDay(deliveryDateStr, fatigueDate);
    const pWeek = calculatePostpartumWeek(pDay);

    const nowTs = new Date(`${fatigueDate} ${fatigueTime}`).getTime() || Date.now();

    const newFatigue: MotherFatigueLog = {
      id: `fatigue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: fatigueDate,
      time: fatigueTime,
      timestamp: nowTs,
      fatigueScore,
      functionalImpact,
      notes: fatigueNotes.trim() || undefined,
      postpartumDay: pDay,
      postpartumWeek: pWeek,
      createdAt: new Date().toISOString(),
    };

    const updated = [newFatigue, ...fatigueLogs];
    setFatigueLogs(updated);

    try {
      localStorage.setItem(FATIGUE_LOGS_KEY, JSON.stringify(updated));
      setSaveSuccessMsg("Daily fatigue check-in saved!");
      if (showToast) showToast("Fatigue level recorded", "success");
      setFatigueNotes("");
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Failed to save fatigue log:", err);
    }
  };

  // Delete Log Handlers
  const handleDeleteSleep = (id: string) => {
    if (window.confirm("Delete this sleep record?")) {
      const filtered = sleepLogs.filter((s) => s.id !== id);
      setSleepLogs(filtered);
      localStorage.setItem(SLEEP_LOGS_KEY, JSON.stringify(filtered));
      if (showToast) showToast("Sleep record deleted", "info");
    }
  };

  const handleDeleteFatigue = (id: string) => {
    if (window.confirm("Delete this fatigue entry?")) {
      const filtered = fatigueLogs.filter((f) => f.id !== id);
      setFatigueLogs(filtered);
      localStorage.setItem(FATIGUE_LOGS_KEY, JSON.stringify(filtered));
      if (showToast) showToast("Fatigue record deleted", "info");
    }
  };

  // Toggle Interruption Reason
  const toggleReason = (reason: InterruptionReason) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter((r) => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  // Dynamic Calculated Today's Totals
  const todayStr = new Date().toISOString().split("T")[0];
  const todaySleeps = sleepLogs.filter((s) => s.date === todayStr);

  const todayTotalMins = todaySleeps.reduce((acc, s) => acc + s.durationMinutes, 0);
  const todayNightMins = todaySleeps.filter((s) => s.type === "Night sleep").reduce((acc, s) => acc + s.durationMinutes, 0);
  const todayNapMins = todaySleeps.filter((s) => s.type === "Daytime nap" || s.type === "Rest").reduce((acc, s) => acc + s.durationMinutes, 0);
  const todayAwakeningsTotal = todaySleeps.reduce((acc, s) => acc + s.awakeningsCount, 0);

  const sortedFatigueToday = fatigueLogs.filter((f) => f.date === todayStr).sort((a, b) => b.timestamp - a.timestamp);
  const latestFatigueToday = sortedFatigueToday[0] || fatigueLogs.sort((a, b) => b.timestamp - a.timestamp)[0];

  const currentPostpartumDay = calculatePostpartumDay(profile?.deliveryDate || todayStr, todayStr);
  const currentPostpartumWeek = calculatePostpartumWeek(currentPostpartumDay);
  const stage = getRecoveryStage(currentPostpartumDay);

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
                😴 Feature 12 • Mother Sleep & Fatigue
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 text-xs font-medium rounded-full">
                Postpartum Day {currentPostpartumDay} • Week {currentPostpartumWeek}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Mother Sleep & Fatigue
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Track rest duration, subjective sleep quality, night awakenings, and daily fatigue during your {stage.title} recovery.
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
                onClick={() => onNavigateSubPage("recovery")}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium transition flex items-center justify-center gap-1.5"
              >
                <Activity className="w-4 h-4" />
                Mother Recovery
              </button>
            )}
          </div>
        </div>

        {/* TODAY'S DYNAMIC SLEEP & FATIGUE SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1A1523] rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Sleep Today</span>
              <span className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Moon className="w-4 h-4" />
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {Math.floor(todayTotalMins / 60)}h {todayTotalMins % 60}m
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Night: {Math.floor(todayNightMins / 60)}h {todayNightMins % 60}m • Naps: {Math.floor(todayNapMins / 60)}h {todayNapMins % 60}m
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1523] rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Night Awakenings</span>
              <span className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{todayAwakeningsTotal}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {todaySleeps.length} sleep/rest sessions recorded
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1523] rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Latest Fatigue Score</span>
              <span className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-400">
                <Zap className="w-4 h-4" />
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
                {latestFatigueToday ? `${latestFatigueToday.fatigueScore}/10` : "Not logged"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {latestFatigueToday?.functionalImpact || "Self-reported daily check-in"}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1523] rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Night Context</span>
              <span className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {nightFeedCount + nightPumpCount + nightDiaperCount} Night Events
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {nightFeedCount} feeds • {nightPumpCount} pumps • {nightDiaperCount} diapers
              </p>
            </div>
          </div>
        </div>

        {/* MAIN TWO-COLUMN GRID: SLEEP LOGGER & FATIGUE CHECK-IN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN: SLEEP SESSION LOGGER FORM (7 COLS) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#1A1523] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Bed className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Log Sleep / Rest Session</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Record rest window, calculated duration & quality</p>
                </div>
              </div>
            </div>

            {saveSuccessMsg && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {sleepFormError && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-3 text-rose-800 dark:text-rose-300 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{sleepFormError}</span>
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
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="e.g. 11:30 PM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-indigo-900 dark:text-indigo-300 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    End Time
                  </label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="e.g. 02:30 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="flex flex-col justify-center items-center bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Calculated Duration</span>
                  <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">{durationHoursText}</span>
                </div>
              </div>

              {/* SLEEP / REST TYPE SELECTOR */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                  Sleep / Rest Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(["Night sleep", "Daytime nap", "Rest", "Other"] as SleepType[]).map((t) => {
                    const isSelected = sleepType === t;
                    let icon = "🌙";
                    if (t === "Daytime nap") icon = "☀️";
                    else if (t === "Rest") icon = "🛋️";
                    else if (t === "Other") icon = "✨";

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

              {/* SLEEP QUALITY SELECTOR */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                  Sleep Quality (Self-Reported)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["Poor", "Fair", "Good", "Very good"] as SleepQuality[]).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setSleepQuality(q)}
                      className={`px-3 py-2 rounded-xl text-xs transition ${
                        sleepQuality === q
                          ? "bg-indigo-600 text-white font-semibold shadow-sm"
                          : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* AWAKENINGS COUNT & INTERRUPTION REASONS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Number of Awakenings / Interruptions
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

                {awakeningsCount > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                      Primary Interruption Reasons
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          "Baby feeding",
                          "Diaper change",
                          "Baby crying",
                          "Pumping",
                          "Mother's discomfort/pain",
                          "Bathroom",
                          "Medication",
                          "Other",
                        ] as InterruptionReason[]
                      ).map((reason) => {
                        const isChecked = selectedReasons.includes(reason);
                        return (
                          <button
                            key={reason}
                            type="button"
                            onClick={() => toggleReason(reason)}
                            className={`px-3 py-1.5 rounded-xl text-xs transition ${
                              isChecked
                                ? "bg-purple-600 text-white font-semibold"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                          >
                            {reason}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* NOTES */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Optional Sleep Notes
                </label>
                <textarea
                  value={sleepNotes}
                  onChange={(e) => setSleepNotes(e.target.value)}
                  placeholder="e.g., woke up several times for feeding, could not return to sleep easily..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Save Sleep Session
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: DAILY FATIGUE CHECK-IN & NIGHT CONTEXT (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">

            {/* DAILY FATIGUE CHECK-IN WIDGET */}
            <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Zap className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Daily Fatigue Check-in</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Quick self-reported fatigue score (0–10)</p>
                </div>
              </div>

              <form onSubmit={handleSaveFatigueLog} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Fatigue Score</span>
                    <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{fatigueScore}/10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={fatigueScore}
                    onChange={(e) => setFatigueScore(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0 (No Fatigue)</span>
                    <span>5 (Moderate)</span>
                    <span>10 (Exhausted)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Functional Impact on Today's Recovery
                  </label>
                  <select
                    value={functionalImpact}
                    onChange={(e) => setFunctionalImpact(e.target.value as FatigueFunctionalImpact)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Not affecting me">Not affecting me</option>
                    <option value="Slightly affecting me">Slightly affecting me</option>
                    <option value="Moderately affecting me">Moderately affecting me</option>
                    <option value="Significantly affecting me">Significantly affecting me</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Fatigue Observations & Notes
                  </label>
                  <input
                    type="text"
                    value={fatigueNotes}
                    onChange={(e) => setFatigueNotes(e.target.value)}
                    placeholder="e.g. feeling slow-moving today, partner helping with afternoon feeds..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-sm transition"
                >
                  Save Fatigue Check-in
                </button>
              </form>
            </div>

            {/* CORRELATED NIGHT CAREGIVING CONTEXT PANEL */}
            <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Night Caregiving Context Summary</h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Feature 12 correlates logged nighttime caregiving events to provide contextual insight into maternal sleep interruptions without asserting forced causality.
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2.5 bg-white/80 dark:bg-slate-800/80 rounded-xl">
                  <span>🍼 Night Feeding Events (Feature 10)</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{nightFeedCount} logged</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-white/80 dark:bg-slate-800/80 rounded-xl">
                  <span>💧 Pumping Sessions (Feature 09)</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{nightPumpCount} logged</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-white/80 dark:bg-slate-800/80 rounded-xl">
                  <span>🧷 Diaper Changes (Feature 11)</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{nightDiaperCount} logged</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SLEEP & FATIGUE HISTORY TIMELINE */}
        <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Sleep & Fatigue Log History</h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {sleepLogs.length} sleep sessions • {fatigueLogs.length} fatigue entries
            </span>
          </div>

          <div className="space-y-4">
            {/* SLEEP SESSIONS HISTORY */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Sleep Sessions
              </h4>
              {sleepLogs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No sleep sessions recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {sleepLogs.map((s) => (
                    <div
                      key={s.id}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 font-bold">
                            {s.type} ({Math.floor(s.durationMinutes / 60)}h {s.durationMinutes % 60}m)
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {s.date} ({s.startTime} - {s.endTime})
                          </span>
                          <span className="text-slate-400">Day {s.postpartumDay}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">
                          <strong>Quality:</strong> {s.quality} • <strong>Awakenings:</strong> {s.awakeningsCount}
                          {s.interruptionReasons && s.interruptionReasons.length > 0 && ` (${s.interruptionReasons.join(", ")})`}
                        </p>
                        {s.notes && <p className="italic text-slate-500 dark:text-slate-400">"{s.notes}"</p>}
                      </div>
                      <button
                        onClick={() => handleDeleteSleep(s.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition"
                        title="Delete sleep record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FATIGUE LOGS HISTORY */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Daily Fatigue Check-ins
              </h4>
              {fatigueLogs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No fatigue check-ins recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {fatigueLogs.map((f) => (
                    <div
                      key={f.id}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold">
                            Fatigue {f.fatigueScore}/10
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {f.date} @ {f.time}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">
                          <strong>Impact:</strong> {f.functionalImpact || "Not recorded"}
                        </p>
                        {f.notes && <p className="italic text-slate-500 dark:text-slate-400">"{f.notes}"</p>}
                      </div>
                      <button
                        onClick={() => handleDeleteFatigue(f.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition"
                        title="Delete fatigue entry"
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

      </div>
    </div>
  );
};

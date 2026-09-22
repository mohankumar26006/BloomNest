import React, { useState, useEffect, useId } from "react";
import { useApp } from "../context/AppContext";
import {
  PostpartumProfile,
  BabyProfileData,
  MotherMoodWellbeingLog,
  MotherMoodScore,
  MotherEmotionalState,
  OverwhelmedRating,
  FeltSupportedStatus,
  MotherRecoveryLog,
  BleedingLog,
  PainLog,
  BreastfeedingLog,
  PumpingLog,
  BabyFeedingLog,
  DiaperLog,
  MotherSleepLog,
  BabySleepLog,
} from "../types";
import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
  getRecoveryStage,
  formatDeliveryType,
  formatBabyAge,
} from "../utils/postpartumUtils";
import {
  Smile,
  Heart,
  Calendar,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Info,
  Users,
  Sun,
  Activity,
  Milk,
  Baby,
  Moon,
  Droplets,
  BookOpen,
} from "lucide-react";

const POSTPARTUM_PROFILE_KEY = "bloomnest_postpartum_profile_v1";
const BABY_PROFILE_KEY = "bloomnest_baby_profile_v1";
const MOOD_WELLBEING_LOGS_KEY = "bloomnest_mood_wellbeing_logs_v1";

const EMOTIONAL_STATE_OPTIONS: MotherEmotionalState[] = [
  "Calm",
  "Happy",
  "Tired",
  "Worried",
  "Anxious",
  "Irritable",
  "Overwhelmed",
  "Sad",
  "Lonely",
  "Frustrated",
  "Confident",
  "Supported",
];

const WORRY_REASON_OPTIONS = [
  "Baby health",
  "Feeding",
  "Sleep",
  "Recovery",
  "Pain",
  "Breastfeeding",
  "Family",
  "Doctor/appointment",
  "Other",
];

const OVERWHELMED_OPTIONS: OverwhelmedRating[] = [
  "Not at all",
  "A little",
  "Moderate",
  "Very",
  "Extremely",
];

const SUPPORT_STATUS_OPTIONS: FeltSupportedStatus[] = [
  "Yes, very supported",
  "Somewhat supported",
  "Not much",
  "Not at all",
];

const SUPPORT_SOURCES_OPTIONS = [
  "Partner",
  "Family",
  "Friend",
  "Healthcare provider",
  "Lactation support",
  "Other",
];

const POSITIVE_COPING_OPTIONS = [
  "Rest",
  "Baby time",
  "Partner/family support",
  "Talking to someone",
  "Eating well",
  "Going outside",
  "Relaxation",
  "Prayer/meditation",
  "Personal time",
  "Other",
];

export const MotherMoodWellbeingPage: React.FC<{
  onNavigateSubPage?: (page: string) => void;
}> = ({ onNavigateSubPage }) => {
  const { user, setActivePage, showToast } = useApp();

  const notesInputId = useId();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<PostpartumProfile | null>(null);
  const [babyProfile, setBabyProfile] = useState<BabyProfileData | null>(null);
  const [moodLogs, setMoodLogs] = useState<MotherMoodWellbeingLog[]>([]);

  // Cross-feature caregiving timeline state
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);

  // Form State
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [logTime, setLogTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const [moodScore, setMoodScore] = useState<MotherMoodScore>(3);
  const [selectedEmotions, setSelectedEmotions] = useState<MotherEmotionalState[]>(["Tired"]);
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [worryLevel, setWorryLevel] = useState<number>(2);
  const [selectedWorryReasons, setSelectedWorryReasons] = useState<string[]>([]);
  const [overwhelmedRating, setOverwhelmedRating] = useState<OverwhelmedRating>("A little");
  const [feltSupported, setFeltSupported] = useState<FeltSupportedStatus>("Yes, very supported");
  const [selectedSupportSources, setSelectedSupportSources] = useState<string[]>(["Partner"]);
  const [selectedPositiveCoping, setSelectedPositiveCoping] = useState<string[]>(["Rest"]);
  const [notes, setNotes] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadContexts = () => {
      try {
        // 1. Feature 01 Context
        const savedProfile = localStorage.getItem(POSTPARTUM_PROFILE_KEY);
        let p: PostpartumProfile | null = null;
        if (savedProfile) {
          p = JSON.parse(savedProfile);
          setProfile(p);
        } else if (user?.journeyStage === "POST_PREGNANCY") {
          p = {
            deliveryDate: new Date().toISOString().split("T")[0],
            deliveryType: "vaginal",
            numberOfBabies: 1,
          };
          setProfile(p);
        }

        // 2. Feature 03 Baby Context
        const savedBaby = localStorage.getItem(BABY_PROFILE_KEY);
        if (savedBaby) {
          setBabyProfile(JSON.parse(savedBaby));
        }

        // 3. Feature 14 Mood Logs
        const savedMoods = localStorage.getItem(MOOD_WELLBEING_LOGS_KEY);
        let loadedMoods: MotherMoodWellbeingLog[] = [];
        if (savedMoods) {
          loadedMoods = JSON.parse(savedMoods);
          setMoodLogs(loadedMoods);
        }

        // Load timeline events across features for today
        loadTimeline(new Date().toISOString().split("T")[0], loadedMoods);
      } catch (err) {
        console.error("Error loading Mood Wellbeing context:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadContexts();
  }, [user]);

  // Load integrated caregiving timeline events for specified date
  const loadTimeline = (targetDate: string, currentMoodLogs: MotherMoodWellbeingLog[]) => {
    const events: any[] = [];

    // Mood check-ins
    currentMoodLogs
      .filter((m) => m.date === targetDate)
      .forEach((m) => {
        events.push({
          time: m.time,
          timestamp: m.timestamp,
          feature: "Feature 14",
          category: "Mood & Emotional Wellbeing",
          title: `Mood Check-in: Score ${m.moodScore}/5 (${getMoodEmoji(m.moodScore)})`,
          details: `Stress: ${m.stressLevel}/10 • Overwhelmed: ${m.overwhelmedRating} • Supported: ${m.feltSupported}`,
          color: "bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950/40 dark:border-purple-900/50 dark:text-purple-300",
          icon: Smile,
        });
      });

    // Mother Recovery (Feat 2)
    const savedRec = localStorage.getItem("bloomnest_mother_recovery_logs_v1");
    if (savedRec) {
      const recs: MotherRecoveryLog[] = JSON.parse(savedRec);
      recs
        .filter((r) => r.date === targetDate)
        .forEach((r) => {
          events.push({
            time: "Daily Log",
            timestamp: new Date(r.createdAt || `${targetDate}T12:00:00`).getTime(),
            feature: "Feature 02",
            category: "Mother Physical Recovery",
            title: `Physical Recovery Log: Pain ${r.pain}/10`,
            details: `Energy: ${r.energy} • Rest: ${r.rest} • Mobility: ${r.mobility}`,
            color: "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300",
            icon: Activity,
          });
        });
    }

    // Breastfeeding (Feat 8)
    const savedBf = localStorage.getItem("bloomnest_breastfeeding_logs_v1");
    if (savedBf) {
      const bfs: BreastfeedingLog[] = JSON.parse(savedBf);
      bfs
        .filter((b) => b.date === targetDate)
        .forEach((b) => {
          events.push({
            time: b.startTime,
            timestamp: new Date(b.createdAt || `${targetDate}T12:00:00`).getTime(),
            feature: "Feature 08",
            category: "Direct Breastfeeding",
            title: `Breastfeeding Session (${b.breastUsed}) — ${b.durationMinutes} min`,
            details: `Experience: ${b.experience} ${b.symptoms?.length ? `• Symptoms: ${b.symptoms.join(", ")}` : ""}`,
            color: "bg-pink-50 border-pink-200 text-pink-800 dark:bg-pink-950/40 dark:border-pink-900/50 dark:text-pink-300",
            icon: Milk,
          });
        });
    }

    // Pumping (Feat 9)
    const savedPump = localStorage.getItem("bloomnest_pumping_logs_v1");
    if (savedPump) {
      const pumps: PumpingLog[] = JSON.parse(savedPump);
      pumps
        .filter((p) => p.date === targetDate)
        .forEach((p) => {
          events.push({
            time: p.startTime,
            timestamp: new Date(p.createdAt || `${targetDate}T12:00:00`).getTime(),
            feature: "Feature 09",
            category: "Milk Pumping",
            title: `Pumping Session — ${p.totalVolumeMl} mL (${p.durationMinutes} min)`,
            details: `Method: ${p.method} • Disposition: ${p.milkAction}`,
            color: "bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/40 dark:border-sky-900/50 dark:text-sky-300",
            icon: Droplets,
          });
        });
    }

    // Baby Feeding (Feat 10)
    const savedFeed = localStorage.getItem("bloomnest_baby_feeding_logs_v1");
    if (savedFeed) {
      const feeds: BabyFeedingLog[] = JSON.parse(savedFeed);
      feeds
        .filter((f) => f.date === targetDate)
        .forEach((f) => {
          events.push({
            time: f.startTime,
            timestamp: new Date(f.createdAt || `${targetDate}T12:00:00`).getTime(),
            feature: "Feature 10",
            category: "Baby Feeding",
            title: `Baby Feed (${f.method})`,
            details: `${f.amountConsumedMl ? `${f.amountConsumedMl} mL consumed • ` : ""}${f.response || "No response notes"}`,
            color: "bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-950/40 dark:border-indigo-900/50 dark:text-indigo-300",
            icon: Milk,
          });
        });
    }

    // Diaper (Feat 11)
    const savedDiaper = localStorage.getItem("bloomnest_diaper_logs_v1");
    if (savedDiaper) {
      const diapers: DiaperLog[] = JSON.parse(savedDiaper);
      diapers
        .filter((d) => d.date === targetDate)
        .forEach((d) => {
          events.push({
            time: d.time,
            timestamp: d.timestamp || new Date(d.createdAt || `${targetDate}T12:00:00`).getTime(),
            feature: "Feature 11",
            category: "Baby Diaper",
            title: `Diaper Change (${d.type})`,
            details: `Stool: ${d.stoolColor || "N/A"} (${d.stoolConsistency || "N/A"}) • Urine Amount: ${d.urineAmount || "N/A"}`,
            color: "bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-950/40 dark:border-teal-900/50 dark:text-teal-300",
            icon: Baby,
          });
        });
    }

    // Mother Sleep (Feat 12)
    const savedMotherSleep = localStorage.getItem("bloomnest_mother_sleep_logs_v1");
    if (savedMotherSleep) {
      const slps: MotherSleepLog[] = JSON.parse(savedMotherSleep);
      slps
        .filter((s) => s.date === targetDate)
        .forEach((s) => {
          events.push({
            time: s.startTime,
            timestamp: new Date(s.createdAt || `${targetDate}T12:00:00`).getTime(),
            feature: "Feature 12",
            category: "Mother Sleep",
            title: `Mother Rest Session — ${(s.durationMinutes / 60).toFixed(1)} hrs`,
            details: `Rest Quality: ${s.quality} • Awakenings: ${s.awakeningsCount}`,
            color: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-900/50 dark:text-blue-300",
            icon: Moon,
          });
        });
    }

    // Baby Sleep (Feat 13)
    const savedBabySleep = localStorage.getItem("bloomnest_baby_sleep_logs_v1");
    if (savedBabySleep) {
      const bSlps: BabySleepLog[] = JSON.parse(savedBabySleep);
      bSlps
        .filter((s) => s.date === targetDate)
        .forEach((s) => {
          events.push({
            time: s.startTime,
            timestamp: s.timestamp,
            feature: "Feature 13",
            category: "Baby Sleep",
            title: `Baby Sleep (${s.type}) — ${s.durationMinutes} min`,
            details: `Settling: ${s.settlingEase || "N/A"} • Awakenings: ${s.awakeningsCount}`,
            color: "bg-violet-50 border-violet-200 text-violet-800 dark:bg-violet-950/40 dark:border-violet-900/50 dark:text-violet-300",
            icon: Moon,
          });
        });
    }

    // Sort chronologically (newest timestamp first)
    events.sort((a, b) => b.timestamp - a.timestamp);
    setTimelineEvents(events);
  };

  const getMoodEmoji = (score: MotherMoodScore) => {
    switch (score) {
      case 1:
        return "Very Low";
      case 2:
        return "Low";
      case 3:
        return "Okay";
      case 4:
        return "Good";
      case 5:
        return "Very Good";
    }
  };

  const toggleEmotionTag = (tag: MotherEmotionalState) => {
    setSelectedEmotions((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleWorryReason = (r: string) => {
    setSelectedWorryReasons((prev) =>
      prev.includes(r) ? prev.filter((item) => item !== r) : [...prev, r]
    );
  };

  const toggleSupportSource = (s: string) => {
    setSelectedSupportSources((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const togglePositiveCoping = (c: string) => {
    setSelectedPositiveCoping((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const handleSaveMoodLog = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!profile) {
      setFormError("Postpartum context not found. Please setup Feature 01 first.");
      return;
    }

    const babyAgeDays = calculatePostpartumDay(profile.babyBirthDate || profile.deliveryDate);
    const babyAgeWeeks = calculatePostpartumWeek(babyAgeDays);
    const stage = getRecoveryStage(babyAgeDays).title;

    const newLog: MotherMoodWellbeingLog = {
      id: `mood_${Date.now()}`,
      userId: user?.id || "user_demo",
      date: logDate,
      time: logTime,
      timestamp: new Date(`${logDate}T${logTime.includes(":") ? "12:00" : "12:00"}`).getTime() || Date.now(),
      postpartumDay: babyAgeDays,
      postpartumWeek: babyAgeWeeks,
      recoveryStage: stage,
      moodScore,
      emotionalStates: selectedEmotions,
      stressLevel,
      worryLevel,
      worryReasons: selectedWorryReasons,
      overwhelmedRating,
      feltSupported,
      supportSources: selectedSupportSources,
      positiveCoping: selectedPositiveCoping,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const updatedLogs = [newLog, ...moodLogs];
      localStorage.setItem(MOOD_WELLBEING_LOGS_KEY, JSON.stringify(updatedLogs));
      setMoodLogs(updatedLogs);
      loadTimeline(logDate, updatedLogs);

      setSaveSuccessMsg("Emotional check-in saved");
      showToast("Mood & emotional check-in logged!");
      setTimeout(() => setSaveSuccessMsg(null), 3000);

      // Reset optional inputs
      setNotes("");
    } catch (err) {
      setFormError("Failed to save mood check-in.");
    }
  };

  const handleDeleteLog = (id: string) => {
    try {
      const updated = moodLogs.filter((m) => m.id !== id);
      localStorage.setItem(MOOD_WELLBEING_LOGS_KEY, JSON.stringify(updated));
      setMoodLogs(updated);
      loadTimeline(logDate, updated);
      showToast("Log entry removed");
    } catch (err) {
      showToast("Failed to delete log entry");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading Mood & Emotional Wellbeing...</p>
      </div>
    );
  }

  // FALLBACK IF FEATURE 01 PROFILE NOT CONFIGURED
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-[#1A1523] rounded-3xl p-8 border border-purple-100 dark:border-purple-900/40 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center mx-auto">
            <Smile className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-rose-100">Setup Postpartum Care First</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Feature 14 (Mood & Emotional Wellbeing) requires delivery context from Feature 01. Please configure your delivery date first.
            </p>
          </div>
          <button
            onClick={() => onNavigateSubPage && onNavigateSubPage("care")}
            className="w-full py-3 px-6 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Go to Feature 01 (Postpartum Care)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // CONTEXT CALCULATIONS
  const birthDateStr = profile.babyBirthDate || profile.deliveryDate;
  const babyAgeDays = calculatePostpartumDay(birthDateStr);
  const babyAgeWeeks = calculatePostpartumWeek(babyAgeDays);
  const stage = getRecoveryStage(babyAgeDays).title;
  const formattedBabyAge = formatBabyAge(babyAgeDays);

  // TODAY'S MOOD SUMMARY COMPUTATIONS
  const todayStr = new Date().toISOString().split("T")[0];
  const todayMoodLogs = moodLogs.filter((m) => m.date === todayStr);
  const latestTodayMood = todayMoodLogs[0];

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] text-slate-800 dark:text-rose-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* TOAST SUCCESS */}
      {saveSuccessMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-800 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* TOP HEADER WITH REUSED CONTEXT FROM FEATURE 01 & FEATURE 03 */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 dark:border-purple-900/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 uppercase tracking-wider">
              Feature 14
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Mother Emotional Wellbeing & Diary
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-rose-100 tracking-tight mt-1">
            Mood & Emotional Wellbeing
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white font-bold text-[11px]">
              Postpartum Day {babyAgeDays} (Week {babyAgeWeeks})
            </span>
            <span>•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
              {stage}
            </span>
            <span>•</span>
            <span>
              Caring for {babyProfile?.babyName || "Newborn Baby"} ({formattedBabyAge.formatted})
            </span>
          </div>
        </div>

        <button
          onClick={() => onNavigateSubPage && onNavigateSubPage("safety")}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900/40 text-xs hover:bg-rose-100 transition-all self-start sm:self-auto"
        >
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>Safety Shield</span>
        </button>
      </header>

      {/* TODAY'S EMOTIONAL WELLBEING SUMMARY */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 border border-slate-200/80 dark:border-purple-900/40 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-purple-900/30 pb-3">
          <div className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-purple-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">Today's Emotional Wellbeing Summary</h2>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 uppercase tracking-wider">
            Self-Reported Check-In
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Mood Score */}
          <div className="bg-purple-50/60 dark:bg-[#15111C] p-4 rounded-2xl border border-purple-100 dark:border-purple-900/40 space-y-1">
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
              Overall Mood
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-rose-100">
              {latestTodayMood ? getMoodEmoji(latestTodayMood.moodScore) : "Not logged today"}
            </div>
            <p className="text-[10px] text-slate-400">
              {latestTodayMood ? `Logged at ${latestTodayMood.time}` : "Record daily check-in below"}
            </p>
          </div>

          {/* Stress Level */}
          <div className="bg-amber-50/60 dark:bg-[#15111C] p-4 rounded-2xl border border-amber-100 dark:border-amber-900/40 space-y-1">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              Stress Level
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-rose-100">
              {latestTodayMood ? `${latestTodayMood.stressLevel} / 10` : "Not logged"}
            </div>
            <p className="text-[10px] text-slate-400">
              {latestTodayMood ? `Worry level: ${latestTodayMood.worryLevel}/10` : "0=No stress, 10=Severe"}
            </p>
          </div>

          {/* Overwhelmed Rating */}
          <div className="bg-rose-50/60 dark:bg-[#15111C] p-4 rounded-2xl border border-rose-100 dark:border-rose-900/40 space-y-1">
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
              Feeling Overwhelmed
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-rose-100">
              {latestTodayMood ? latestTodayMood.overwhelmedRating : "Not logged"}
            </div>
            <p className="text-[10px] text-slate-400">Self-reported workload perception</p>
          </div>

          {/* Emotional Support */}
          <div className="bg-emerald-50/60 dark:bg-[#15111C] p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Felt Supported
            </span>
            <div className="text-base font-black text-slate-900 dark:text-rose-100 truncate">
              {latestTodayMood ? latestTodayMood.feltSupported : "Not logged"}
            </div>
            <p className="text-[10px] text-slate-400">
              {latestTodayMood?.supportSources?.length
                ? `By ${latestTodayMood.supportSources.join(", ")}`
                : "Support network tracking"}
            </p>
          </div>
        </div>
      </section>

      {/* INTERACTIVE EMOTIONAL CHECK-IN FORM */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-purple-900/40 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-purple-900/30 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-rose-100">Log Emotional Check-In</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Record your current feelings, stress level, support network, and positive moments.
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold">
            Feature 14 Log
          </span>
        </div>

        {formError && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveMoodLog} className="space-y-6 text-xs">
          {/* 1. Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-rose-300 mb-1">Check-in Date</label>
              <input
                type="date"
                required
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-rose-300 mb-1">Check-in Time</label>
              <input
                type="text"
                required
                placeholder="e.g. 10:30 AM"
                value={logTime}
                onChange={(e) => setLogTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold"
              />
            </div>
          </div>

          {/* 2. Mood Rating (1 to 5 Emoji Scale) */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700 dark:text-rose-300">
              How are you feeling overall right now? <span className="text-purple-500">*</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as MotherMoodScore[]).map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setMoodScore(score)}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                    moodScore === score
                      ? "bg-purple-600 text-white border-purple-700 shadow-md scale-105"
                      : "bg-slate-50 dark:bg-[#15111C] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-purple-300"
                  }`}
                >
                  <span className="text-[10px] font-extrabold">{getMoodEmoji(score)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Emotional State Tags (Multi-select) */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700 dark:text-rose-300">
              Emotional State <span className="text-slate-400 font-normal">(Select all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOTIONAL_STATE_OPTIONS.map((emotion) => {
                const isSelected = selectedEmotions.includes(emotion);
                return (
                  <button
                    key={emotion}
                    type="button"
                    onClick={() => toggleEmotionTag(emotion)}
                    className={`px-3 py-1.5 rounded-full font-bold transition-all text-xs border ${
                      isSelected
                        ? "bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border-purple-400"
                        : "bg-slate-50 dark:bg-[#15111C] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-gray-800 hover:border-purple-300"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {emotion}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Stress Level & Worry Level (0-10 Sliders) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50/80 dark:bg-[#15111C] border border-slate-200/60 dark:border-gray-800">
            {/* Stress Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-700 dark:text-rose-300">Stress Level (0–10)</span>
                <span className="px-2.5 py-0.5 rounded-md bg-purple-600 text-white font-extrabold text-xs">
                  {stressLevel} / 10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={stressLevel}
                onChange={(e) => setStressLevel(parseInt(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>0 (No stress)</span>
                <span>5 (Moderate)</span>
                <span>10 (Severe)</span>
              </div>
            </div>

            {/* Worry Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-700 dark:text-rose-300">Worry / Anxiety Level (0–10)</span>
                <span className="px-2.5 py-0.5 rounded-md bg-amber-600 text-white font-extrabold text-xs">
                  {worryLevel} / 10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={worryLevel}
                onChange={(e) => setWorryLevel(parseInt(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>0 (Calm)</span>
                <span>5 (Some worry)</span>
                <span>10 (High anxiety)</span>
              </div>
            </div>
          </div>

          {/* 5. Worry Reasons (Optional) */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700 dark:text-rose-300">
              Primary Sources of Worry <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {WORRY_REASON_OPTIONS.map((reason) => {
                const isSelected = selectedWorryReasons.includes(reason);
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => toggleWorryReason(reason)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                      isSelected
                        ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                        : "bg-white dark:bg-[#15111C] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-gray-800"
                    }`}
                  >
                    {reason}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Feeling Overwhelmed & Support Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-rose-300 mb-1.5">
                How overwhelmed do you feel today?
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {OVERWHELMED_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setOverwhelmedRating(opt)}
                    className={`py-2 px-3 rounded-xl font-semibold border text-left text-xs transition-all ${
                      overwhelmedRating === opt
                        ? "bg-rose-500 text-white border-rose-600 shadow-xs font-bold"
                        : "bg-white dark:bg-[#15111C] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-rose-300 mb-1.5">
                Did you feel supported today?
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {SUPPORT_STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFeltSupported(opt)}
                    className={`py-2 px-3 rounded-xl font-semibold border text-left text-xs transition-all ${
                      feltSupported === opt
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-xs font-bold"
                        : "bg-white dark:bg-[#15111C] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 7. Who Supported You & Positive Coping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-rose-300 mb-1">
                Who supported you today? <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SUPPORT_SOURCES_OPTIONS.map((src) => {
                  const isSelected = selectedSupportSources.includes(src);
                  return (
                    <button
                      key={src}
                      type="button"
                      onClick={() => toggleSupportSource(src)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                        isSelected
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-400"
                          : "bg-white dark:bg-[#15111C] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-gray-800"
                      }`}
                    >
                      {src}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-rose-300 mb-1">
                What helped you feel better? <span className="text-slate-400 font-normal">(Positive Moments)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {POSITIVE_COPING_OPTIONS.map((coping) => {
                  const isSelected = selectedPositiveCoping.includes(coping);
                  return (
                    <button
                      key={coping}
                      type="button"
                      onClick={() => togglePositiveCoping(coping)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                        isSelected
                          ? "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-400"
                          : "bg-white dark:bg-[#15111C] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-gray-800"
                      }`}
                    >
                      {coping}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 8. Personal Notes / Journal */}
          <div>
            <label htmlFor={notesInputId} className="block font-bold text-slate-700 dark:text-rose-300 mb-1">
              Personal Reflection / Journal Notes <span className="text-slate-400 font-normal">(Private)</span>
            </label>
            <textarea
              id={notesInputId}
              rows={3}
              placeholder="Record any personal thoughts, triumphs, challenges, or thoughts for your care team..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Save Emotional Check-In Log</span>
          </button>
        </form>
      </section>

      {/* INTEGRATED CAREGIVING & EMOTIONAL TIMELINE (FEATURES 1-14) */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-purple-900/40 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-purple-900/30 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">Integrated Caregiving & Wellbeing Timeline</h2>
          </div>
          <span className="text-xs text-slate-400">Connected Cross-Feature View</span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Visual feed showing physical recovery, sleep, feeding, diaper changes, and emotional check-ins logged today.
        </p>

        {timelineEvents.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-[#15111C] rounded-2xl border border-dashed border-slate-200 dark:border-gray-800 space-y-2">
            <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No events logged today across modules.</p>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {timelineEvents.map((evt, idx) => {
              const EvtIcon = evt.icon || Clock;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${evt.color}`}
                >
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-black/30 shrink-0">
                    <EvtIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-75">
                        {evt.feature} • {evt.category}
                      </span>
                      <span className="text-xs font-bold">{evt.time}</span>
                    </div>
                    <h3 className="text-xs font-bold mt-0.5 truncate">{evt.title}</h3>
                    <p className="text-[11px] opacity-90 mt-0.5 line-clamp-2">{evt.details}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* EMOTIONAL WELLBEING LOG HISTORY TABLE */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-purple-900/40 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-purple-900/30 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">Emotional Wellbeing Log History</h2>
          </div>
          <span className="text-xs text-slate-400">{moodLogs.length} Entries Recorded</span>
        </div>

        {moodLogs.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-[#15111C] rounded-2xl border border-dashed border-slate-200 dark:border-gray-800 space-y-2">
            <Smile className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No emotional check-ins recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-gray-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date / Time</th>
                  <th className="py-2.5 px-3">Mood Score</th>
                  <th className="py-2.5 px-3">Emotions</th>
                  <th className="py-2.5 px-3">Stress / Worry</th>
                  <th className="py-2.5 px-3">Overwhelmed</th>
                  <th className="py-2.5 px-3">Support</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60 font-semibold">
                {moodLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-purple-50/30 dark:hover:bg-purple-950/20">
                    <td className="py-3 px-3">
                      <div>{log.date}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{log.time}</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-purple-600 dark:text-purple-300">
                      {getMoodEmoji(log.moodScore)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {log.emotionalStates.map((st) => (
                          <span key={st} className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-900/30 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                            {st}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div>Stress: {log.stressLevel}/10</div>
                      <div className="text-[10px] text-amber-600 dark:text-amber-400">Worry: {log.worryLevel}/10</div>
                    </td>
                    <td className="py-3 px-3">{log.overwhelmedRating}</td>
                    <td className="py-3 px-3">{log.feltSupported}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* EDUCATIONAL POSTPARTUM EMOTIONAL WELLBEING GUIDE */}
      <section className="bg-purple-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-purple-800/60 pb-3">
          <Heart className="w-5 h-5 text-pink-400" />
          <h2 className="text-base font-extrabold text-rose-100">Postpartum Emotional Wellbeing & Self-Care</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2">
            <h3 className="font-bold text-purple-200">The Fourth Trimester Emotional Transition</h3>
            <p className="text-purple-100/80 leading-relaxed text-[11px]">
              Shifting hormone levels, sleep loss, and new caregiving responsibilities naturally create fluctuating emotional states. Experiencing tiredness or occasional worry is common in early postpartum recovery.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2">
            <h3 className="font-bold text-purple-200">Seeking Supportive Care</h3>
            <p className="text-purple-100/80 leading-relaxed text-[11px]">
              Connecting with partner, family, or healthcare providers is essential. If emotional distress or low mood persists across multiple check-ins, inform your OBGYN, midwife, or doctor for compassionate guidance.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

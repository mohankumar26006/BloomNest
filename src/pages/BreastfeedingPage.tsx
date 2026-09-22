import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  PostpartumProfile,
  BabyProfileData,
  BreastfeedingLog,
  BreastUsed,
  BreastfeedingExperience,
  BreastSymptom,
  BreastfeedingRelief,
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
  Milk,
  Baby as BabyIcon,
  Sparkles,
  HeartPulse,
  Timer,
} from "lucide-react";

const POSTPARTUM_PROFILE_KEY = "bloomnest_postpartum_profile_v1";
const BABY_PROFILE_KEY = "bloomnest_baby_profile_v1";
const BREASTFEEDING_LOGS_KEY = "bloomnest_breastfeeding_logs_v1";

export const BreastfeedingPage: React.FC<{
  onNavigateSubPage?: (page: string) => void;
}> = ({ onNavigateSubPage }) => {
  const { user, showToast } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<PostpartumProfile | null>(null);
  const [babyProfile, setBabyProfile] = useState<BabyProfileData | null>(null);
  const [logs, setLogs] = useState<BreastfeedingLog[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Form state
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const [breastUsed, setBreastUsed] = useState<BreastUsed>("Left");
  const [leftMins, setLeftMins] = useState<number>(15);
  const [rightMins, setRightMins] = useState<number>(0);
  const [experience, setExperience] = useState<BreastfeedingExperience>("Comfortable");
  const [symptoms, setSymptoms] = useState<BreastSymptom[]>(["None"]);
  const [whatHelped, setWhatHelped] = useState<BreastfeedingRelief[]>(["Position change"]);
  const [notes, setNotes] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  // Load Feature 01, 03, & Existing Feature 08 Breastfeeding Logs
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

        // Load Feature 08 Breastfeeding Logs
        const savedLogs = localStorage.getItem(BREASTFEEDING_LOGS_KEY);
        if (savedLogs) {
          setLogs(JSON.parse(savedLogs));
        }
      } catch (err) {
        console.error("Error loading breastfeeding logs:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  // Handle Symptom Checkbox Toggle
  const toggleSymptom = (sym: BreastSymptom) => {
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
  const toggleRelief = (rel: BreastfeedingRelief) => {
    if (whatHelped?.includes(rel)) {
      setWhatHelped(whatHelped.filter((r) => r !== rel));
    } else {
      setWhatHelped([...(whatHelped || []), rel]);
    }
  };

  // Handle Save Session
  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!profile) {
      setFormError("Postpartum context missing. Please configure delivery details first.");
      return;
    }

    const totalMins =
      breastUsed === "Left" ? leftMins : breastUsed === "Right" ? rightMins : leftMins + rightMins;

    if (totalMins <= 0) {
      setFormError("Please enter valid feeding duration (at least 1 minute).");
      return;
    }

    const day = calculatePostpartumDay(profile.deliveryDate, logDate);
    const week = calculatePostpartumWeek(day);

    const newLog: BreastfeedingLog = {
      id: `bf_${Date.now()}`,
      userId: user?.id || "user_demo",
      date: logDate,
      startTime: startTime.trim() || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      postpartumDay: day,
      postpartumWeek: week,
      breastUsed,
      durationMinutes: totalMins,
      leftDurationMinutes: breastUsed !== "Right" ? leftMins : 0,
      rightDurationMinutes: breastUsed !== "Left" ? rightMins : 0,
      experience,
      symptoms,
      whatHelped,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const updatedLogs = [newLog, ...logs].sort(
        (a, b) => new Date(`${b.date} ${b.startTime}`).getTime() - new Date(`${a.date} ${a.startTime}`).getTime()
      );
      localStorage.setItem(BREASTFEEDING_LOGS_KEY, JSON.stringify(updatedLogs));
      setLogs(updatedLogs);
      setSaveSuccessMsg(`Breastfeeding session saved!`);
      showToast("Direct breastfeeding logged");
      setTimeout(() => setSaveSuccessMsg(null), 3000);
      setNotes("");
      // Refresh time string for next session
      setStartTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      setFormError("Failed to save breastfeeding log locally.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading Direct Breastfeeding...</p>
      </div>
    );
  }

  // FALLBACK IF FEATURE 01 PROFILE NOT CONFIGURED
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-[#1A1523] rounded-3xl p-8 border border-rose-100 dark:border-rose-900/40 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center mx-auto">
            <Milk className="w-8 h-8 text-rose-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-rose-100">Setup Postpartum Care First</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Feature 08 (Breastfeeding) consumes postpartum timeline from Feature 01. Please configure your delivery date first.
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

  // CALCULATED CONTEXT FROM FEATURE 01 & FEATURE 03
  const postpartumDay = calculatePostpartumDay(profile.deliveryDate);
  const postpartumWeek = calculatePostpartumWeek(postpartumDay);
  const currentStage = getRecoveryStage(postpartumDay);
  const babyName = babyProfile?.babyName || "Newborn Baby";

  // Compute Today's Stats dynamically from saved session records
  const todayLogs = logs.filter((l) => l.date === logDate);
  const totalSessionsToday = todayLogs.length;
  const totalMinsToday = todayLogs.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const latestTodayLog = todayLogs[0];

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] text-slate-800 dark:text-rose-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
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
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 uppercase tracking-wider">
              Feature 08
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Mother Direct Breastfeeding Tracker
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-rose-100 tracking-tight mt-1">
            Breastfeeding — Postpartum Day {postpartumDay}
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
              onClick={() => onNavigateSubPage("pain")}
              className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors flex items-center gap-1.5"
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Pain Tracker</span>
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

      {/* TODAY'S SUMMARY CARDS (DYNAMICALLY COMPUTED FROM SAVED SESSION RECORDS) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1A1523] p-4 rounded-2xl border border-slate-200/80 dark:border-rose-900/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sessions Logged</span>
            <span className="text-2xl font-black text-slate-900 dark:text-rose-100">{totalSessionsToday} sessions</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Recorded for {logDate}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center">
            <Milk className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1523] p-4 rounded-2xl border border-slate-200/80 dark:border-rose-900/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Duration</span>
            <span className="text-2xl font-black text-slate-900 dark:text-rose-100">{totalMinsToday} mins</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Summed from saved records</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
            <Timer className="w-5 h-5 text-teal-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1523] p-4 rounded-2xl border border-slate-200/80 dark:border-rose-900/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Last Breast Used</span>
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {latestTodayLog ? `${latestTodayLog.breastUsed} (${latestTodayLog.startTime})` : "None yet"}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Alternate breasts each feed</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 flex items-center justify-center">
            <Heart className="w-5 h-5 text-pink-500" />
          </div>
        </div>
      </section>

      {/* LOG BREASTFEEDING SESSION FORM */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-rose-900/40 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-rose-900/30 pb-3 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 flex items-center justify-center">
              <Milk className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">Log Breastfeeding Session</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Record breast used, duration, mother's experience, and symptoms.
              </p>
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
          {/* 1. SESSION TIME & BREAST USED */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* START TIME */}
            <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
                Session Time
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="e.g. 08:10 AM"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-bold text-xs"
              />
            </div>

            {/* BREAST USED */}
            <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
                Breast Used
              </label>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(["Left", "Right", "Both"] as BreastUsed[]).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      setBreastUsed(b);
                      if (b === "Left") {
                        setLeftMins(15);
                        setRightMins(0);
                      } else if (b === "Right") {
                        setLeftMins(0);
                        setRightMins(15);
                      } else {
                        setLeftMins(8);
                        setRightMins(7);
                      }
                    }}
                    className={`py-2 rounded-xl font-extrabold text-xs transition-all border ${
                      breastUsed === b
                        ? "bg-rose-500 text-white border-rose-600 shadow-xs"
                        : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-rose-300"
                    }`}
                  >
                    {b === "Left" ? "Left" : b === "Right" ? "Right" : "Both"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. DURATION IN MINUTES CLEAN BREAKDOWN */}
          <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
            <label className="font-extrabold text-slate-900 dark:text-rose-100 flex flex-wrap items-center justify-between gap-1">
              <span>Feeding Duration</span>
              <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                {breastUsed === "Left"
                  ? `Left Breast: ${leftMins} min`
                  : breastUsed === "Right"
                  ? `Right Breast: ${rightMins} min`
                  : `Left: ${leftMins} min • Right: ${rightMins} min • Total: ${leftMins + rightMins} min`}
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {(breastUsed === "Left" || breastUsed === "Both") && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500">Left Breast (mins)</span>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={leftMins}
                    onChange={(e) => setLeftMins(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-extrabold text-xs"
                  />
                </div>
              )}

              {(breastUsed === "Right" || breastUsed === "Both") && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500">Right Breast (mins)</span>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={rightMins}
                    onChange={(e) => setRightMins(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-extrabold text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 3. MOTHER'S EXPERIENCE RATING */}
          <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
            <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
              Mother's Experience During Session
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {(
                [
                  "Comfortable",
                  "Some discomfort",
                  "Difficult",
                  "Very difficult",
                ] as BreastfeedingExperience[]
              ).map((exp) => (
                <button
                  key={exp}
                  type="button"
                  onClick={() => setExperience(exp)}
                  className={`py-2.5 px-2 rounded-xl font-extrabold text-xs transition-all border ${
                    experience === exp
                      ? exp === "Comfortable"
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                        : exp === "Some discomfort"
                        ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                        : "bg-rose-600 text-white border-rose-700 shadow-xs"
                      : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-rose-300"
                  }`}
                >
                  {exp === "Comfortable"
                    ? "Comfortable"
                    : exp === "Some discomfort"
                    ? "Mild Discomfort"
                    : exp === "Difficult"
                    ? "Difficult"
                    : "Very Difficult"}
                </button>
              ))}
            </div>
          </div>

          {/* 4. BREAST/NIPPLE SYMPTOMS */}
          <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
            <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
              Breast / Nipple Symptoms (Select all that apply)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {(
                ["None", "Soreness", "Cracking", "Engorgement/fullness", "Other"] as BreastSymptom[]
              ).map((sym) => {
                const isSelected = symptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`py-2 px-2.5 rounded-xl font-bold text-xs transition-all border flex items-center justify-between ${
                      isSelected
                        ? sym === "None"
                          ? "bg-emerald-600 text-white border-emerald-700"
                          : "bg-rose-500 text-white border-rose-600"
                        : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-rose-300"
                    }`}
                  >
                    <span>{sym}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. WHAT HELPED */}
          <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
            <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
              What Helped Comfort / Latch? (Optional)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {(
                [
                  "Position change",
                  "Latch adjustment",
                  "Rest",
                  "Lactation consultant support",
                  "Cold/warm compress",
                  "Other",
                ] as BreastfeedingRelief[]
              ).map((rel) => {
                const isSelected = whatHelped?.includes(rel);
                return (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => toggleRelief(rel)}
                    className={`py-2 px-2.5 rounded-xl font-bold text-[11px] transition-all border flex items-center justify-between ${
                      isSelected
                        ? "bg-teal-600 text-white border-teal-700"
                        : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-rose-300"
                    }`}
                  >
                    <span>{rel}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* NOTES (OPTIONAL) */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-700 dark:text-rose-300 block">
              Breastfeeding Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record baby's alertness, latch notes, or special feelings during this session..."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>Save Breastfeeding Session</span>
          </button>
        </form>
      </section>

      {/* BREASTFEEDING SESSION HISTORY */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-rose-900/40 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-rose-900/30 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-rose-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">Breastfeeding Session History</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {logs.length} {logs.length === 1 ? "session" : "sessions"} logged
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 italic">
            No breastfeeding sessions logged yet. Record your first session above to track your breastfeeding journey!
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
                    <span className="font-extrabold text-slate-900 dark:text-rose-100">{log.startTime}</span>
                    <span className="text-slate-400 text-[10px]">({log.date})</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-extrabold text-[10px]">
                      Breast: {log.breastUsed}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-extrabold text-[10px]">
                      {log.durationMinutes} min
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 pt-0.5">
                    <span>Experience: <strong>{log.experience}</strong></span>
                    <span>•</span>
                    <span>Symptoms: <strong>{log.symptoms.join(", ")}</strong></span>
                  </div>

                  {log.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
                      "{log.notes}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CONTEXT-AWARE LACTATION & POSITIONING GUIDE */}
      <section className="bg-rose-50/60 dark:bg-rose-950/20 rounded-3xl p-6 border border-rose-100 dark:border-rose-900/30 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-rose-100 uppercase tracking-wider">
            Context-Aware Lactation Holds & Comfort Tips
          </h3>
        </div>

        {profile.deliveryType === "c_section" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 bg-white dark:bg-[#15111C] rounded-2xl border border-rose-100 dark:border-rose-900/30 space-y-1">
              <h4 className="font-extrabold text-slate-800 dark:text-rose-200">Football Hold (Recommended for C-Section)</h4>
              <p className="text-[11px]">
                Tuck baby under your arm like a football. Helps reduce direct pressure on your abdominal C-section incision while maintaining neck support.
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-[#15111C] rounded-2xl border border-rose-100 dark:border-rose-900/30 space-y-1">
              <h4 className="font-extrabold text-slate-800 dark:text-rose-200">Side-Lying Position</h4>
              <p className="text-[11px]">
                Lie comfortably on your side with baby facing you. Ideal for nighttime nursing and avoiding contact with your lower abdomen.
              </p>
            </div>
          </div>
        ) : profile.deliveryType === "assisted_vaginal" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 bg-white dark:bg-[#15111C] rounded-2xl border border-rose-100 dark:border-rose-900/30 space-y-1">
              <h4 className="font-extrabold text-slate-800 dark:text-rose-200">Side-Lying Hold (Perineal Comfort)</h4>
              <p className="text-[11px]">
                Lying on your side relieves pressure on perineal stitches or pelvic soreness, allowing rest during longer feeding sessions.
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-[#15111C] rounded-2xl border border-rose-100 dark:border-rose-900/30 space-y-1">
              <h4 className="font-extrabold text-slate-800 dark:text-rose-200">Laid-Back Nursing</h4>
              <p className="text-[11px]">
                Recline comfortably supported by pillows, placing baby tummy-to-tummy on your chest to encourage natural latching.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 bg-white dark:bg-[#15111C] rounded-2xl border border-rose-100 dark:border-rose-900/30 space-y-1">
              <h4 className="font-extrabold text-slate-800 dark:text-rose-200">Cradle & Cross-Cradle Hold</h4>
              <p className="text-[11px]">
                Support baby's back and neck with your arm or opposite hand. Use nursing pillows under your elbows for comfortable posture.
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-[#15111C] rounded-2xl border border-rose-100 dark:border-rose-900/30 space-y-1">
              <h4 className="font-extrabold text-slate-800 dark:text-rose-200">Football Hold</h4>
              <p className="text-[11px]">
                Hold baby along your side resting on a pillow. Great for controlling latch angle and comfortable for mothers with full breasts.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

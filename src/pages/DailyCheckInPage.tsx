import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  PostpartumProfile,
  BabyProfileData,
  DailyCheckInSubmissionData,
  DailyCheckInEvent,
  DailyCheckInResultSummary,
  OverallRecoveryStatus,
  EnergyLevel,
  RestQuality,
  BabyCheckInInput,
  PageView,
} from "../types";
import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
  getRecoveryStage,
} from "../utils/postpartumUtils";
import {
  submitDailyCheckIn,
  getCheckInHistory,
  getCheckInForDate,
} from "../utils/dailyCheckInEngine";
import {
  Heart,
  Baby,
  FileText,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Moon,
  Battery,
  BatteryLow,
  Smile,
  Meh,
  Frown,
  Calendar,
  ExternalLink,
  RotateCcw,
  Check,
  AlertCircle,
} from "lucide-react";

const POSTPARTUM_PROFILE_KEY = "bloomnest_postpartum_profile_v1";
const BABY_PROFILES_KEY = "bloomnest_baby_profiles_v1";

interface DailyCheckInPageProps {
  onNavigateSubPage?: (page: PageView) => void;
}

export const DailyCheckInPage: React.FC<DailyCheckInPageProps> = ({ onNavigateSubPage }) => {
  const { showToast } = useApp();

  const [profile, setProfile] = useState<PostpartumProfile | null>(null);
  const [babies, setBabies] = useState<{ id: string; name: string }[]>([]);
  const [history, setHistory] = useState<DailyCheckInEvent[]>([]);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [resultSummary, setResultSummary] = useState<DailyCheckInResultSummary | null>(null);

  // Form State
  const [overallRecovery, setOverallRecovery] = useState<OverallRecoveryStatus>("Same");
  const [painScore, setPainScore] = useState<number>(2);
  const [energy, setEnergy] = useState<EnergyLevel>("Medium");
  const [sleepQuality, setSleepQuality] = useState<RestQuality | "Very good">("Fair");
  const [mood, setMood] = useState<"Good" | "Okay" | "Low" | "Worried" | "Very low">("Okay");
  const [bleedingStatus, setBleedingStatus] = useState<"No change" | "Improving" | "Increased" | "Concerned">("No change");
  const [woundStatus, setWoundStatus] = useState<"No change" | "Improving" | "New change" | "Concerned">("No change");
  const [breastfeedingStatus, setBreastfeedingStatus] = useState<"Going well" | "Some difficulty" | "Very difficult" | "Not breastfeeding today">("Going well");
  const [pumpingStatus, setPumpingStatus] = useState<"Going well" | "Some difficulty" | "Difficult" | "Not pumping today">("Not pumping today");

  // Baby Check-ins State
  const [babyInputs, setBabyInputs] = useState<BabyCheckInInput[]>([]);
  const [userNote, setUserNote] = useState<string>("");
  const [addToDoctorBrief, setAddToDoctorBrief] = useState<boolean>(false);

  useEffect(() => {
    // Load Postpartum Profile
    let pDay = 10;
    let pWeek = 2;
    let numBabies = 1;
    try {
      const rawProf = localStorage.getItem(POSTPARTUM_PROFILE_KEY);
      if (rawProf) {
        const parsed: PostpartumProfile = JSON.parse(rawProf);
        setProfile(parsed);
        numBabies = parsed.numberOfBabies || 1;
      }
    } catch (err) {
      console.error("Failed to parse postpartum profile", err);
    }

    // Load Baby Profiles
    const loadedBabies: { id: string; name: string }[] = [];
    try {
      const rawBabies = localStorage.getItem(BABY_PROFILES_KEY);
      if (rawBabies) {
        const parsedList: BabyProfileData[] = JSON.parse(rawBabies);
        parsedList.forEach((b, idx) => {
          loadedBabies.push({ id: b.id || `baby_${idx + 1}`, name: b.babyName || `Baby ${idx + 1}` });
        });
      }
    } catch (err) {
      console.error("Failed to parse baby profiles", err);
    }

    if (loadedBabies.length === 0) {
      if (numBabies > 1) {
        for (let i = 1; i <= numBabies; i++) {
          loadedBabies.push({ id: `baby_${i}`, name: `Baby ${String.fromCharCode(64 + i)}` });
        }
      } else {
        loadedBabies.push({ id: "baby_1", name: "Newborn Baby" });
      }
    }
    setBabies(loadedBabies);

    // Initialize Baby Inputs
    setBabyInputs(
      loadedBabies.map((b) => ({
        babyId: b.id,
        babyName: b.name,
        feedingStatus: "Going well",
        diaperStatus: "As expected",
        sleepStatus: "Typical",
      }))
    );

    // Load Check-in History
    const hist = getCheckInHistory();
    setHistory(hist);

    // Check if check-in already completed today
    const todayStr = new Date().toISOString().split("T")[0];
    const todaysEvent = getCheckInForDate(todayStr);
    if (todaysEvent) {
      // Show summary for today's completed check-in
      setActiveStep(4);
    }
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const pDay = profile ? calculatePostpartumDay(profile.deliveryDate) : 10;
  const pWeek = profile ? calculatePostpartumWeek(profile.deliveryDate) : 2;
  const stage = getRecoveryStage(pDay);

  const handleBabyInputChange = (
    babyId: string,
    field: keyof BabyCheckInInput,
    value: string
  ) => {
    setBabyInputs((prev) =>
      prev.map((b) => (b.babyId === babyId ? { ...b, [field]: value } : b))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData: DailyCheckInSubmissionData = {
      overallRecovery,
      painScore,
      energy,
      sleepQuality,
      mood,
      bleedingStatus,
      woundStatus,
      breastfeedingStatus,
      pumpingStatus,
      babyCheckIns: babyInputs,
      userNote,
      addToDoctorBrief,
    };

    const summary = submitDailyCheckIn(submissionData);
    setResultSummary(summary);
    setHistory(getCheckInHistory());
    setActiveStep(4);
    showToast("Daily Check-in submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] text-slate-800 dark:text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* TOP HEADER BANNER */}
        <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-[#E0E7FF] items-center gap-2 mb-2">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-white border border-white/30">
                  Feature 23 — Touchpoint
                </span>
                <span className="bg-emerald-400/30 text-emerald-100 text-xs px-3 py-1 rounded-full font-medium">
                  ~30s to 2 min
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Daily Check-in
              </h1>
              <p className="text-rose-100 mt-1 text-sm md:text-base max-w-xl">
                Quickly tell BloomNest how you and your baby are doing right now. No need to open 10 modules every day!
              </p>
            </div>

            {/* Context Badge */}
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[200px]">
              <div className="text-xs text-rose-100 font-medium">Postpartum Context</div>
              <div className="text-lg font-bold text-white mt-0.5">
                Day {pDay} • Week {pWeek}
              </div>
              <div className="text-xs text-rose-200 mt-1 font-medium capitalize">
                {stage.title}
              </div>
            </div>
          </div>
        </div>

        {/* STEP NAVIGATION BAR */}
        <div className="bg-white dark:bg-[#1A1523] rounded-2xl p-3 shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center justify-between overflow-x-auto">
          {[
            { num: 1, label: "Mother Check", icon: Heart },
            { num: 2, label: "Baby Check", icon: Baby },
            { num: 3, label: "Concerns & Doctor", icon: FileText },
            { num: 4, label: "Check-in Summary", icon: ShieldCheck },
          ].map((s) => {
            const IconComponent = s.icon;
            const isActive = activeStep === s.num;
            const isCompleted = activeStep > s.num;
            return (
              <button
                key={s.num}
                onClick={() => setActiveStep(s.num)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                    : isCompleted
                    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isActive
                      ? "bg-white text-rose-600"
                      : isCompleted
                      ? "bg-rose-500 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* STEP 1: MOTHER CHECK */}
        {activeStep === 1 && (
          <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-8 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" /> Section A — Mother Snapshot
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                  Tap your overall status today. BloomNest routes detailed updates to Mother Recovery, Pain, Bleeding, and Sleep.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 rounded-full">
                Step 1 of 3
              </span>
            </div>

            {/* 1. Overall Recovery */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 block">
                How is your overall recovery today?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Worse", val: "Worse", icon: TrendingDown, color: "hover:border-rose-400 active:bg-rose-50 dark:active:bg-rose-950/40" },
                  { label: "Same", val: "Same", icon: RotateCcw, color: "hover:border-amber-400 active:bg-amber-50 dark:active:bg-amber-950/40" },
                  { label: "Better", val: "Better", icon: TrendingUp, color: "hover:border-emerald-400 active:bg-emerald-50 dark:active:bg-emerald-950/40" },
                ].map((item) => {
                  const isSel = overallRecovery === item.val;
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setOverallRecovery(item.val as OverallRecoveryStatus)}
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 font-medium transition-all ${
                        isSel
                          ? "border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/50"
                      }`}
                    >
                      <ItemIcon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Pain Snapshot Slider */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Pain Level Right Now (0 – 10)
                </label>
                <span className={`text-lg font-bold px-3 py-0.5 rounded-full ${
                  painScore >= 7 ? "bg-red-500 text-white" : painScore >= 4 ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                }`}>
                  {painScore}/10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={painScore}
                onChange={(e) => setPainScore(parseInt(e.target.value))}
                className="w-full accent-rose-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>0 (None)</span>
                <span>3 (Mild)</span>
                <span>6 (Moderate)</span>
                <span>10 (Severe)</span>
              </div>

              {/* Adaptive Questioning Box for High Pain */}
              {painScore >= 7 && (
                <div className="mt-3 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>High pain score recorded. You can log detailed pain locations in Feature 6.</span>
                  </div>
                  {onNavigateSubPage && (
                    <button
                      type="button"
                      onClick={() => onNavigateSubPage("health-tracker")}
                      className="px-2.5 py-1 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition flex items-center gap-1 shrink-0 ml-2"
                    >
                      Open F6 <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 3. Energy & Sleep */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Energy */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 block">
                  Energy Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Low", val: "Low", icon: BatteryLow },
                    { label: "Medium", val: "Medium", icon: Battery },
                    { label: "Good", val: "Good", icon: Battery },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setEnergy(item.val as EnergyLevel)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-medium transition ${
                        energy === item.val
                          ? "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-bold"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleep */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 block">
                  Sleep / Rest Quality
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["Poor", "Fair", "Good", "Very good"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSleepQuality(item as any)}
                      className={`p-3 rounded-xl border text-center text-xs font-medium transition ${
                        sleepQuality === item
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 font-bold"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Mood / Emotional Wellbeing */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 block">
                How are you feeling emotionally today?
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: "😊 Good", val: "Good" },
                  { label: "🙂 Okay", val: "Okay" },
                  { label: "😐 Low", val: "Low" },
                  { label: "😟 Worried", val: "Worried" },
                  { label: "😔 Very low", val: "Very low" },
                ].map((m) => (
                  <button
                    key={m.val}
                    type="button"
                    onClick={() => setMood(m.val as any)}
                    className={`p-3 rounded-xl border text-center text-xs font-medium transition ${
                      mood === m.val
                        ? "border-pink-500 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300 font-bold shadow-sm"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Bleeding & Wound Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bleeding */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Lochia / Bleeding Status
                </label>
                <select
                  value={bleedingStatus}
                  onChange={(e) => setBleedingStatus(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium"
                >
                  <option value="No change">No change</option>
                  <option value="Improving">Improving</option>
                  <option value="Increased">Increased</option>
                  <option value="Concerned">Concerned</option>
                </select>
              </div>

              {/* Wound */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Incision / Wound Status
                </label>
                <select
                  value={woundStatus}
                  onChange={(e) => setWoundStatus(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium"
                >
                  <option value="No change">No change</option>
                  <option value="Improving">Improving</option>
                  <option value="New change">New change</option>
                  <option value="Concerned">Concerned</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-6 py-3 bg-rose-500 text-white font-semibold rounded-2xl hover:bg-rose-600 transition flex items-center gap-2 shadow-md shadow-rose-500/20"
              >
                Continue to Baby Check <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: BABY CHECK */}
        {activeStep === 2 && (
          <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-8 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Baby className="w-5 h-5 text-indigo-500" /> Section B — Daily Baby Check-in
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                  How is baby doing today? Twin records remain strictly isolated via Feature 3 Baby ID.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 rounded-full">
                Step 2 of 3
              </span>
            </div>

            {/* Baby Check Cards (Loop over babies) */}
            {babyInputs.map((bInput) => (
              <div
                key={bInput.babyId}
                className="p-6 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                    👶
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      {bInput.babyName}
                    </h3>
                    <span className="text-xs text-indigo-600 dark:text-indigo-300 font-medium">
                      Twin-isolated baby record (ID: {bInput.babyId})
                    </span>
                  </div>
                </div>

                {/* Feeding Status */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 block">
                    Feeding Today
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      "Going well",
                      "Some difficulty",
                      "More difficult than usual",
                      "Concerned",
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleBabyInputChange(bInput.babyId, "feedingStatus", opt)}
                        className={`p-3 rounded-xl text-xs font-medium border transition text-center ${
                          bInput.feedingStatus === opt
                            ? "border-indigo-500 bg-indigo-500 text-white font-bold"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diaper Output */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 block">
                    Diaper Output Pattern
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      "As expected",
                      "Different today",
                      "Concerned",
                      "Haven't checked",
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleBabyInputChange(bInput.babyId, "diaperStatus", opt)}
                        className={`p-3 rounded-xl text-xs font-medium border transition text-center ${
                          bInput.diaperStatus === opt
                            ? "border-indigo-500 bg-indigo-500 text-white font-bold"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Baby Sleep */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 block">
                    Baby Sleep Pattern
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      "Typical",
                      "More disrupted",
                      "More settled",
                      "Not sure",
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleBabyInputChange(bInput.babyId, "sleepStatus", opt)}
                        className={`p-3 rounded-xl text-xs font-medium border transition text-center ${
                          bInput.sleepStatus === opt
                            ? "border-indigo-500 bg-indigo-500 text-white font-bold"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium text-sm"
              >
                Back to Mother Check
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="px-6 py-3 bg-rose-500 text-white font-semibold rounded-2xl hover:bg-rose-600 transition flex items-center gap-2 shadow-md shadow-rose-500/20"
              >
                Continue to Concerns <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONCERNS & DOCTOR PREP */}
        {activeStep === 3 && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-8 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" /> Section C — Quick Check & Concerns
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                  Anything changed today? You can optionally add notes directly to your Doctor Brief (Feature 18).
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 rounded-full">
                Step 3 of 3
              </span>
            </div>

            {/* Note Textarea */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 block">
                Anything different today or anything you want BloomNest to pay attention to?
              </label>
              <textarea
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="e.g., Pain feels higher at night, or baby nursed longer than usual on the left side..."
                rows={4}
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            {/* Toggle Doctor Brief Option */}
            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-500" /> Add concern to Doctor Brief (Feature 18)?
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Explicit opt-in: Private journal content stays private unless checked.
                </p>
              </div>
              <input
                type="checkbox"
                checked={addToDoctorBrief}
                onChange={(e) => setAddToDoctorBrief(e.target.checked)}
                className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium text-sm"
              >
                Back to Baby Check
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-2xl hover:opacity-95 transition flex items-center gap-2 shadow-lg shadow-rose-500/25 text-base"
              >
                Complete Daily Check-in <Check className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: SUMMARY & CLOSED-LOOP RESULTS */}
        {activeStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            {/* HERO SUCCESS CARD */}
            <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 md:p-8 shadow-md border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                      Today's Check-in Complete
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Recorded for {todayStr} • Postpartum Day {pDay}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Submit New Check-in
                </button>
              </div>

              {/* 3 CATEGORIZED BULLETS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {/* What's Going Well */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 space-y-2">
                  <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> What's Going Well
                  </h3>
                  <ul className="space-y-1 text-xs text-emerald-900 dark:text-emerald-200">
                    {(resultSummary?.whatIsGoingWell || ["Check-in recorded cleanly"]).map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* What Changed */}
                <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 space-y-2">
                  <h3 className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-purple-500" /> What Changed
                  </h3>
                  <ul className="space-y-1 text-xs text-purple-900 dark:text-purple-200">
                    {(resultSummary?.whatChanged || ["No major pattern changes"]).map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-purple-500 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* What Needs Attention */}
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 space-y-2">
                  <h3 className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Needs Attention
                  </h3>
                  <ul className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
                    {resultSummary?.whatNeedsAttention.length ? (
                      resultSummary.whatNeedsAttention.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-slate-500 dark:text-slate-400">No urgent concerns flagged.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* SAFETY SHIELD STATUS BADGE */}
              <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className={`w-6 h-6 ${
                    resultSummary?.safetyStatus.overallStatus === "CLEAR" ? "text-emerald-500" : "text-amber-500"
                  }`} />
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Feature 04 Safety Shield</div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Safety Tier: {resultSummary?.safetyStatus.overallStatus || "CLEAR"}
                    </div>
                  </div>
                </div>
                {onNavigateSubPage && (
                  <button
                    type="button"
                    onClick={() => onNavigateSubPage("emergency")}
                    className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-300 transition flex items-center gap-1"
                  >
                    View F4 Safety Shield <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* CHECK-IN HISTORY TABLE */}
            <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose-500" /> Check-in History Log
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                      <th className="pb-3 px-2">Date</th>
                      <th className="pb-3 px-2">Postpartum Day</th>
                      <th className="pb-3 px-2">Mother Status</th>
                      <th className="pb-3 px-2">Baby Status</th>
                      <th className="pb-3 px-2">Concern Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {history.length > 0 ? (
                      history.slice(0, 10).map((h) => (
                        <tr key={h.checkInId} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                          <td className="py-3 px-2 font-medium">{h.date}</td>
                          <td className="py-3 px-2">Day {h.postpartumDay}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              h.overallMotherStatus === "Better"
                                ? "bg-emerald-100 text-emerald-700"
                                : h.overallMotherStatus === "Worse"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-amber-100 text-amber-700"
                            }`}>
                              {h.overallMotherStatus}
                            </span>
                          </td>
                          <td className="py-3 px-2">{h.overallBabyStatus}</td>
                          <td className="py-3 px-2">
                            {h.concernFlag ? (
                              <span className="text-amber-600 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> Flagged
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-medium">No concern</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-400">
                          No check-ins recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

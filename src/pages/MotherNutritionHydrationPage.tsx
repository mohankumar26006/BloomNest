import React, { useState, useEffect, useId } from "react";
import { useApp } from "../context/AppContext";
import {
  PostpartumProfile,
  BabyProfileData,
  MotherMealLog,
  MotherFluidLog,
  MotherMealType,
  MotherFoodGroup,
  PortionSize,
  AppetiteRating,
  EatingSymptom,
  DrinkType,
  MotherRecoveryLog,
  BreastfeedingLog,
  PumpingLog,
  BabyFeedingLog,
  DiaperLog,
  MotherSleepLog,
  BabySleepLog,
  MotherMoodWellbeingLog,
} from "../types";
import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
  getRecoveryStage,
  formatDeliveryType,
  formatBabyAge,
} from "../utils/postpartumUtils";
import {
  Utensils,
  Droplet,
  GlassWater,
  CupSoda,
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
  Activity,
  Milk,
  Baby,
  Moon,
  Droplets,
  Smile,
  BookOpen,
  Apple,
} from "lucide-react";

const POSTPARTUM_PROFILE_KEY = "bloomnest_postpartum_profile_v1";
const BABY_PROFILE_KEY = "bloomnest_baby_profile_v1";
const MEAL_LOGS_KEY = "bloomnest_mother_meal_logs_v1";
const FLUID_LOGS_KEY = "bloomnest_mother_fluid_logs_v1";

const FOOD_GROUP_OPTIONS: MotherFoodGroup[] = [
  "Grains/Starches",
  "Protein",
  "Vegetables",
  "Fruits",
  "Dairy/Alternatives",
  "Nuts/Seeds",
  "Healthy Fats",
  "Other",
];

const PORTION_OPTIONS: PortionSize[] = ["Small", "Medium", "Large"];

const APPETITE_OPTIONS: AppetiteRating[] = ["Very poor", "Poor", "Fair", "Good", "Very good"];

const EATING_SYMPTOM_OPTIONS: EatingSymptom[] = [
  "None",
  "Nausea",
  "Reduced appetite",
  "Difficulty eating",
  "Difficulty drinking",
  "Constipation",
  "Other",
];

const DRINK_TYPE_OPTIONS: DrinkType[] = [
  "Water",
  "Milk",
  "ORS/Electrolyte",
  "Juice",
  "Tea/Coffee",
  "Herbal Tea",
  "Other",
];

export const MotherNutritionHydrationPage: React.FC<{
  onNavigateSubPage?: (page: string) => void;
}> = ({ onNavigateSubPage }) => {
  const { user, setActivePage, showToast } = useApp();

  const mealDescInputId = useId();
  const mealNotesInputId = useId();
  const fluidNotesInputId = useId();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<PostpartumProfile | null>(null);
  const [babyProfile, setBabyProfile] = useState<BabyProfileData | null>(null);
  const [mealLogs, setMealLogs] = useState<MotherMealLog[]>([]);
  const [fluidLogs, setFluidLogs] = useState<MotherFluidLog[]>([]);

  // Tab State
  const [activeTab, setActiveTab] = useState<"meals" | "fluids" | "timeline">("meals");

  // Timeline State
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);

  // Meal Form State
  const [mealDate, setMealDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [mealTime, setMealTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const [mealType, setMealType] = useState<MotherMealType>("Breakfast");
  const [mealDescription, setMealDescription] = useState<string>("");
  const [selectedFoodGroups, setSelectedFoodGroups] = useState<MotherFoodGroup[]>([
    "Grains/Starches",
    "Protein",
  ]);
  const [portionSize, setPortionSize] = useState<PortionSize>("Medium");
  const [appetite, setAppetite] = useState<AppetiteRating>("Good");
  const [selectedSymptoms, setSelectedSymptoms] = useState<EatingSymptom[]>(["None"]);
  const [mealNotes, setMealNotes] = useState<string>("");

  // Fluid Form State
  const [fluidDate, setFluidDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [fluidTime, setFluidTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const [drinkType, setDrinkType] = useState<DrinkType>("Water");
  const [amountMl, setAmountMl] = useState<number>(250);
  const [fluidNotes, setFluidNotes] = useState<string>("");

  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadData = () => {
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

        // 2. Feature 03 Baby Profile
        const savedBaby = localStorage.getItem(BABY_PROFILE_KEY);
        if (savedBaby) {
          setBabyProfile(JSON.parse(savedBaby));
        }

        // 3. Feature 15 Meal Logs
        const savedMeals = localStorage.getItem(MEAL_LOGS_KEY);
        let mLogs: MotherMealLog[] = [];
        if (savedMeals) {
          mLogs = JSON.parse(savedMeals);
          setMealLogs(mLogs);
        }

        // 4. Feature 15 Fluid Logs
        const savedFluids = localStorage.getItem(FLUID_LOGS_KEY);
        let fLogs: MotherFluidLog[] = [];
        if (savedFluids) {
          fLogs = JSON.parse(savedFluids);
          setFluidLogs(fLogs);
        }

        loadTimeline(new Date().toISOString().split("T")[0], mLogs, fLogs);
      } catch (err) {
        console.error("Error loading Nutrition & Hydration context:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  // Load integrated caregiving & nutrition timeline for target date
  const loadTimeline = (
    targetDate: string,
    currentMealLogs: MotherMealLog[],
    currentFluidLogs: MotherFluidLog[]
  ) => {
    const events: any[] = [];

    // Meals
    currentMealLogs
      .filter((m) => m.date === targetDate)
      .forEach((m) => {
        events.push({
          time: m.time,
          timestamp: m.timestamp,
          feature: "Feature 15",
          category: "Mother Meal",
          title: `Meal (${m.mealType}): ${m.description || "Food intake"}`,
          details: `Portion: ${m.portionSize} • Appetite: ${m.appetite} • Groups: ${m.foodGroups.join(", ")}`,
          color: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300",
          icon: Utensils,
        });
      });

    // Fluids
    currentFluidLogs
      .filter((f) => f.date === targetDate)
      .forEach((f) => {
        events.push({
          time: f.time,
          timestamp: f.timestamp,
          feature: "Feature 15",
          category: "Mother Hydration",
          title: `Fluid Intake: ${f.amountMl} mL (${f.drinkType})`,
          details: `Logged at ${f.time}`,
          color: "bg-cyan-50 border-cyan-200 text-cyan-800 dark:bg-cyan-950/40 dark:border-cyan-900/50 dark:text-cyan-300",
          icon: GlassWater,
        });
      });

    // Mood (Feat 14)
    const savedMoods = localStorage.getItem("bloomnest_mood_wellbeing_logs_v1");
    if (savedMoods) {
      const moods: MotherMoodWellbeingLog[] = JSON.parse(savedMoods);
      moods
        .filter((m) => m.date === targetDate)
        .forEach((m) => {
          events.push({
            time: m.time,
            timestamp: m.timestamp,
            feature: "Feature 14",
            category: "Emotional Wellbeing",
            title: `Mood Check-in (Score ${m.moodScore}/5)`,
            details: `Stress: ${m.stressLevel}/10 • Overwhelmed: ${m.overwhelmedRating}`,
            color: "bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950/40 dark:border-purple-900/50 dark:text-purple-300",
            icon: Smile,
          });
        });
    }

    // Mother Sleep (Feat 12)
    const savedSleep = localStorage.getItem("bloomnest_mother_sleep_logs_v1");
    if (savedSleep) {
      const slps: MotherSleepLog[] = JSON.parse(savedSleep);
      slps
        .filter((s) => s.date === targetDate)
        .forEach((s) => {
          events.push({
            time: s.startTime,
            timestamp: new Date(s.createdAt || `${targetDate}T12:00:00`).getTime(),
            feature: "Feature 12",
            category: "Mother Sleep",
            title: `Mother Rest — ${(s.durationMinutes / 60).toFixed(1)} hrs`,
            details: `Rest Quality: ${s.quality} • Awakenings: ${s.awakeningsCount}`,
            color: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-900/50 dark:text-blue-300",
            icon: Moon,
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
            title: `Breastfeeding (${b.breastUsed}) — ${b.durationMinutes} min`,
            details: `Experience: ${b.experience}`,
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
            title: `Pumping — ${p.totalVolumeMl} mL (${p.durationMinutes} min)`,
            details: `Method: ${p.method}`,
            color: "bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/40 dark:border-sky-900/50 dark:text-sky-300",
            icon: Droplets,
          });
        });
    }

    // Sort chronologically (newest first)
    events.sort((a, b) => b.timestamp - a.timestamp);
    setTimelineEvents(events);
  };

  const toggleFoodGroup = (group: MotherFoodGroup) => {
    setSelectedFoodGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const toggleSymptom = (sym: EatingSymptom) => {
    if (sym === "None") {
      setSelectedSymptoms(["None"]);
    } else {
      setSelectedSymptoms((prev) => {
        const filtered = prev.filter((s) => s !== "None");
        return filtered.includes(sym) ? filtered.filter((s) => s !== sym) : [...filtered, sym];
      });
    }
  };

  const handleSaveMealLog = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!profile) {
      setFormError("Postpartum context missing. Please setup Feature 01 first.");
      return;
    }

    if (!mealDescription.trim()) {
      setFormError("Please enter a brief meal description or food item.");
      return;
    }

    const babyAgeDays = calculatePostpartumDay(profile.babyBirthDate || profile.deliveryDate);
    const babyAgeWeeks = calculatePostpartumWeek(babyAgeDays);
    const stage = getRecoveryStage(babyAgeDays).title;

    const newMeal: MotherMealLog = {
      id: `meal_${Date.now()}`,
      userId: user?.id || "user_demo",
      date: mealDate,
      time: mealTime,
      timestamp: new Date(`${mealDate}T12:00:00`).getTime() || Date.now(),
      postpartumDay: babyAgeDays,
      postpartumWeek: babyAgeWeeks,
      recoveryStage: stage,
      mealType,
      description: mealDescription.trim(),
      foodGroups: selectedFoodGroups,
      portionSize,
      appetite,
      symptoms: selectedSymptoms,
      notes: mealNotes.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const updated = [newMeal, ...mealLogs];
      localStorage.setItem(MEAL_LOGS_KEY, JSON.stringify(updated));
      setMealLogs(updated);
      loadTimeline(mealDate, updated, fluidLogs);

      setSaveSuccessMsg("Meal log saved");
      showToast("Meal log saved!");
      setTimeout(() => setSaveSuccessMsg(null), 3000);

      // Reset form
      setMealDescription("");
      setMealNotes("");
    } catch (err) {
      setFormError("Failed to save meal log.");
    }
  };

  const handleSaveFluidLog = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!profile) {
      setFormError("Postpartum context missing. Please setup Feature 01 first.");
      return;
    }

    if (amountMl <= 0) {
      setFormError("Please enter a valid fluid amount (> 0 mL).");
      return;
    }

    const babyAgeDays = calculatePostpartumDay(profile.babyBirthDate || profile.deliveryDate);
    const babyAgeWeeks = calculatePostpartumWeek(babyAgeDays);

    const newFluid: MotherFluidLog = {
      id: `fluid_${Date.now()}`,
      userId: user?.id || "user_demo",
      date: fluidDate,
      time: fluidTime,
      timestamp: new Date(`${fluidDate}T12:00:00`).getTime() || Date.now(),
      postpartumDay: babyAgeDays,
      postpartumWeek: babyAgeWeeks,
      drinkType,
      amountMl,
      volumeUnit: "mL",
      notes: fluidNotes.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const updated = [newFluid, ...fluidLogs];
      localStorage.setItem(FLUID_LOGS_KEY, JSON.stringify(updated));
      setFluidLogs(updated);
      loadTimeline(fluidDate, mealLogs, updated);

      setSaveSuccessMsg(`Logged ${amountMl} mL ${drinkType}`);
      showToast(`Logged ${amountMl} mL ${drinkType}`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);

      // Reset form
      setFluidNotes("");
    } catch (err) {
      setFormError("Failed to save fluid log.");
    }
  };

  const handleQuickAddFluid = (addedMl: number, label: string) => {
    if (!profile) return;
    const todayStr = new Date().toISOString().split("T")[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const babyAgeDays = calculatePostpartumDay(profile.babyBirthDate || profile.deliveryDate);
    const babyAgeWeeks = calculatePostpartumWeek(babyAgeDays);

    const quickFluid: MotherFluidLog = {
      id: `fluid_${Date.now()}`,
      userId: user?.id || "user_demo",
      date: todayStr,
      time: nowTime,
      timestamp: Date.now(),
      postpartumDay: babyAgeDays,
      postpartumWeek: babyAgeWeeks,
      drinkType: "Water",
      amountMl: addedMl,
      volumeUnit: "mL",
      notes: `Quick log: ${label}`,
      createdAt: new Date().toISOString(),
    };

    try {
      const updated = [quickFluid, ...fluidLogs];
      localStorage.setItem(FLUID_LOGS_KEY, JSON.stringify(updated));
      setFluidLogs(updated);
      loadTimeline(todayStr, mealLogs, updated);

      setSaveSuccessMsg(`Added +${addedMl} mL Water!`);
      showToast(`+${addedMl} mL Water added`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      showToast("Failed to add fluid log");
    }
  };

  const handleDeleteMeal = (id: string) => {
    try {
      const updated = mealLogs.filter((m) => m.id !== id);
      localStorage.setItem(MEAL_LOGS_KEY, JSON.stringify(updated));
      setMealLogs(updated);
      loadTimeline(mealDate, updated, fluidLogs);
      showToast("Meal log deleted");
    } catch (err) {
      showToast("Failed to delete meal log");
    }
  };

  const handleDeleteFluid = (id: string) => {
    try {
      const updated = fluidLogs.filter((f) => f.id !== id);
      localStorage.setItem(FLUID_LOGS_KEY, JSON.stringify(updated));
      setFluidLogs(updated);
      loadTimeline(fluidDate, mealLogs, updated);
      showToast("Fluid log deleted");
    } catch (err) {
      showToast("Failed to delete fluid log");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading Nutrition & Hydration...</p>
      </div>
    );
  }

  // FALLBACK IF FEATURE 01 PROFILE NOT CONFIGURED
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-[#1A1523] rounded-3xl p-8 border border-emerald-100 dark:border-emerald-900/40 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mx-auto">
            <Utensils className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-rose-100">Setup Postpartum Care First</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Feature 15 (Nutrition & Hydration) requires delivery context from Feature 01. Please configure your delivery date first.
            </p>
          </div>
          <button
            onClick={() => onNavigateSubPage && onNavigateSubPage("care")}
            className="w-full py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Go to Feature 01 (Postpartum Care)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // CONTEXT COMPUTATIONS
  const birthDateStr = profile.babyBirthDate || profile.deliveryDate;
  const babyAgeDays = calculatePostpartumDay(birthDateStr);
  const babyAgeWeeks = calculatePostpartumWeek(babyAgeDays);
  const stage = getRecoveryStage(babyAgeDays).title;
  const formattedBabyAge = formatBabyAge(babyAgeDays);

  // TODAY'S TOTALS COMPUTATIONS
  const todayStr = new Date().toISOString().split("T")[0];
  const todayMeals = mealLogs.filter((m) => m.date === todayStr);
  const todayFluids = fluidLogs.filter((f) => f.date === todayStr);

  const todayMealsCount = todayMeals.filter((m) => m.mealType !== "Snack").length;
  const todaySnacksCount = todayMeals.filter((m) => m.mealType === "Snack").length;
  const todayTotalFluidMl = todayFluids.reduce((acc, f) => acc + (f.amountMl || 0), 0);
  const todayFluidLiters = (todayTotalFluidMl / 1000).toFixed(2);

  const latestTodayMeal = todayMeals[0];
  const latestTodayAppetite = latestTodayMeal ? latestTodayMeal.appetite : "Not logged";

  // Unique food groups logged today
  const todayFoodGroups = Array.from(
    new Set(todayMeals.flatMap((m) => m.foodGroups || []))
  );

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
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100 dark:border-emerald-900/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              Feature 15
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Mother Nutrition & Hydration Tracker
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-rose-100 tracking-tight mt-1">
            Nutrition & Hydration
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[11px]">
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

      {/* TODAY'S NUTRITION & HYDRATION DASHBOARD */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 border border-slate-200/80 dark:border-emerald-900/40 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-emerald-900/30 pb-3">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">Today's Intake Dashboard</h2>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
            Calculated Summaries
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Meals & Snacks */}
          <div className="bg-emerald-50/60 dark:bg-[#15111C] p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Meals & Snacks
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-rose-100">
              {todayMealsCount} Meals, {todaySnacksCount} Snacks
            </div>
            <p className="text-[10px] text-slate-400">Total {todayMeals.length} logged today</p>
          </div>

          {/* Fluids Logged */}
          <div className="bg-cyan-50/60 dark:bg-[#15111C] p-4 rounded-2xl border border-cyan-100 dark:border-cyan-900/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                Total Fluids Logged
              </span>
              <GlassWater className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-rose-100">
              {todayTotalFluidMl} mL
            </div>
            <p className="text-[10px] font-bold text-cyan-700 dark:text-cyan-300">
              ({todayFluidLiters} Liters total)
            </p>
          </div>

          {/* Appetite Score */}
          <div className="bg-amber-50/60 dark:bg-[#15111C] p-4 rounded-2xl border border-amber-100 dark:border-amber-900/40 space-y-1">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              Appetite Rating
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-rose-100">
              {latestTodayAppetite}
            </div>
            <p className="text-[10px] text-slate-400">Self-reported hunger rating</p>
          </div>

          {/* Food Variety */}
          <div className="bg-purple-50/60 dark:bg-[#15111C] p-4 rounded-2xl border border-purple-100 dark:border-purple-900/40 space-y-1">
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
              Food Variety Today
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-rose-100">
              {todayFoodGroups.length} Groups
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              {todayFoodGroups.length > 0 ? todayFoodGroups.join(", ") : "Log meal to track"}
            </p>
          </div>
        </div>

        {/* QUICK FLUID PRESETS */}
        <div className="pt-2 border-t border-slate-100 dark:border-emerald-900/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-700 dark:text-rose-300 flex items-center gap-1.5">
            <GlassWater className="w-4 h-4 text-cyan-500" />
            <span>Quick Add Water:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickAddFluid(250, "Glass (250 mL)")}
              className="px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-extrabold border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+250 mL Glass</span>
            </button>
            <button
              onClick={() => handleQuickAddFluid(500, "Bottle (500 mL)")}
              className="px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-extrabold border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+500 mL Bottle</span>
            </button>
            <button
              onClick={() => handleQuickAddFluid(1000, "Pitcher (1000 mL)")}
              className="px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-extrabold border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+1,000 mL Pitcher</span>
            </button>
          </div>
        </div>
      </section>

      {/* INTERACTIVE FORM SECTION WITH TAB SWITCHING */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-emerald-900/40 shadow-xs space-y-6">
        {/* TAB HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-emerald-900/30 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("meals")}
              className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all ${
                activeTab === "meals"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-slate-100 dark:bg-[#15111C] text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Log Meal / Snack
            </button>
            <button
              onClick={() => setActiveTab("fluids")}
              className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all ${
                activeTab === "fluids"
                  ? "bg-cyan-600 text-white shadow-md"
                  : "bg-slate-100 dark:bg-[#15111C] text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Log Fluid Intake
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all ${
                activeTab === "timeline"
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-slate-100 dark:bg-[#15111C] text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Connected Timeline
            </button>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">Feature 15 Source of Truth</span>
        </div>

        {formError && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* TAB 1: MEAL LOGGING FORM */}
        {activeTab === "meals" && (
          <form onSubmit={handleSaveMealLog} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-rose-300 mb-1">Meal Type</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as MotherMealType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-rose-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={mealDate}
                  onChange={(e) => setMealDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-rose-300 mb-1">Time</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 08:30 AM"
                  value={mealTime}
                  onChange={(e) => setMealTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold"
                />
              </div>
            </div>

            <div>
              <label htmlFor={mealDescInputId} className="block font-bold text-slate-700 dark:text-rose-300 mb-1">
                Meal / Food Description <span className="text-emerald-500">*</span>
              </label>
              <input
                id={mealDescInputId}
                type="text"
                required
                placeholder="e.g. Idli with sambar & boiled egg, Oatmeal with fruits"
                value={mealDescription}
                onChange={(e) => setMealDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold"
              />
            </div>

            {/* Food Groups Multi-select */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-rose-300 mb-1.5">
                Food Groups Included <span className="text-slate-400 font-normal">(Select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {FOOD_GROUP_OPTIONS.map((group) => {
                  const isSelected = selectedFoodGroups.includes(group);
                  return (
                    <button
                      key={group}
                      type="button"
                      onClick={() => toggleFoodGroup(group)}
                      className={`px-3 py-1.5 rounded-full font-bold transition-all text-xs border ${
                        isSelected
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-400"
                          : "bg-slate-50 dark:bg-[#15111C] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-gray-800"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {group}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Portion & Appetite */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-rose-300 mb-1.5">Portion Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {PORTION_OPTIONS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPortionSize(p)}
                      className={`py-2 rounded-xl font-bold border text-xs transition-all ${
                        portionSize === p
                          ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                          : "bg-slate-50 dark:bg-[#15111C] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-rose-300 mb-1.5">Appetite Rating</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {APPETITE_OPTIONS.map((app) => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setAppetite(app)}
                      className={`py-2 rounded-xl font-semibold border text-[10px] text-center transition-all ${
                        appetite === app
                          ? "bg-amber-600 text-white border-amber-700 shadow-xs font-bold"
                          : "bg-slate-50 dark:bg-[#15111C] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800"
                      }`}
                    >
                      {app}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-rose-300 mb-1.5">
                Eating/Drinking Difficulties <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {EATING_SYMPTOM_OPTIONS.map((sym) => {
                  const isSelected = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                        isSelected
                          ? "bg-rose-500 text-white border-rose-600 shadow-xs"
                          : "bg-white dark:bg-[#15111C] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-gray-800"
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor={mealNotesInputId} className="block font-bold text-slate-700 dark:text-rose-300 mb-1">
                Meal Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id={mealNotesInputId}
                rows={2}
                placeholder="Optional notes e.g., Felt full quickly, Drank water after meal..."
                value={mealNotes}
                onChange={(e) => setMealNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Save Meal Log</span>
            </button>
          </form>
        )}

        {/* TAB 2: FLUID LOGGING FORM */}
        {activeTab === "fluids" && (
          <form onSubmit={handleSaveFluidLog} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-rose-300 mb-1">Drink Type</label>
                <select
                  value={drinkType}
                  onChange={(e) => setDrinkType(e.target.value as DrinkType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold"
                >
                  {DRINK_TYPE_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-rose-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={fluidDate}
                  onChange={(e) => setFluidDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-rose-300 mb-1">Time</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 09:30 AM"
                  value={fluidTime}
                  onChange={(e) => setFluidTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-rose-300 mb-1">
                Fluid Volume (mL) <span className="text-cyan-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="50"
                  max="3000"
                  step="50"
                  required
                  value={amountMl}
                  onChange={(e) => setAmountMl(parseInt(e.target.value) || 0)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-black text-sm"
                />
                <span className="font-bold text-slate-500 dark:text-slate-400">mL</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-[11px]">
                <span className="text-slate-400">Quick set:</span>
                {[150, 250, 350, 500, 750, 1000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmountMl(v)}
                    className={`px-2.5 py-1 rounded-lg border font-bold ${
                      amountMl === v
                        ? "bg-cyan-600 text-white border-cyan-700"
                        : "bg-slate-50 dark:bg-[#15111C] text-slate-600 dark:text-slate-400 border-slate-200"
                    }`}
                  >
                    {v} mL
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor={fluidNotesInputId} className="block font-bold text-slate-700 dark:text-rose-300 mb-1">
                Fluid Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                id={fluidNotesInputId}
                type="text"
                placeholder="e.g. Drank warm water after feeding session..."
                value={fluidNotes}
                onChange={(e) => setFluidNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Save Fluid Log ({amountMl} mL)</span>
            </button>
          </form>
        )}

        {/* TAB 3: CONNECTED TIMELINE */}
        {activeTab === "timeline" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visual feed showing physical recovery, sleep, feeding, diaper changes, mood check-ins, meals, and fluid intake logged today.
            </p>

            {timelineEvents.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-[#15111C] rounded-2xl border border-dashed border-slate-200 dark:border-gray-800 space-y-2">
                <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No events logged today across modules.</p>
              </div>
            ) : (
              <div className="space-y-3">
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
          </div>
        )}
      </section>

      {/* MEAL & FLUID HISTORY TABLES */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-emerald-900/40 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-emerald-900/30 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">Nutrition & Hydration History</h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">{mealLogs.length} Meals</span>
            <span>•</span>
            <span className="font-semibold text-slate-500">{fluidLogs.length} Fluids</span>
          </div>
        </div>

        {/* Meal History Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-slate-700 dark:text-rose-300 uppercase tracking-wider">
            Meal Logs History
          </h3>
          {mealLogs.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No meal logs recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-gray-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Date / Time</th>
                    <th className="py-2.5 px-3">Meal Type</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Food Groups</th>
                    <th className="py-2.5 px-3">Portion / Appetite</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60 font-semibold">
                  {mealLogs.map((m) => (
                    <tr key={m.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20">
                      <td className="py-3 px-3">
                        <div>{m.date}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{m.time}</div>
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-300">{m.mealType}</td>
                      <td className="py-3 px-3 font-semibold">{m.description}</td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {m.foodGroups.map((g) => (
                            <span key={g} className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                              {g}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div>{m.portionSize} portion</div>
                        <div className="text-[10px] text-amber-600 dark:text-amber-400">Appetite: {m.appetite}</div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteMeal(m.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete meal log"
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
        </div>

        {/* Fluid History Table */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-gray-800">
          <h3 className="text-xs font-extrabold text-slate-700 dark:text-rose-300 uppercase tracking-wider">
            Fluid Intake History
          </h3>
          {fluidLogs.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No fluid logs recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-gray-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Date / Time</th>
                    <th className="py-2.5 px-3">Drink Type</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Notes</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60 font-semibold">
                  {fluidLogs.map((f) => (
                    <tr key={f.id} className="hover:bg-cyan-50/30 dark:hover:bg-cyan-950/20">
                      <td className="py-3 px-3">
                        <div>{f.date}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{f.time}</div>
                      </td>
                      <td className="py-3 px-3 font-bold text-cyan-600 dark:text-cyan-300">{f.drinkType}</td>
                      <td className="py-3 px-3 font-black text-sm text-cyan-700 dark:text-cyan-300">
                        {f.amountMl} mL
                      </td>
                      <td className="py-3 px-3 text-slate-500 italic">{f.notes || "—"}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteFluid(f.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete fluid log"
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
        </div>
      </section>

      {/* EDUCATIONAL NUTRITION & HYDRATION GUIDE */}
      <section className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-emerald-800/60 pb-3">
          <Apple className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-extrabold text-rose-100">Postpartum Nutrition & Lactation Hydration Guide</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2">
            <h3 className="font-bold text-emerald-200">Hydration During Lactation & Recovery</h3>
            <p className="text-emerald-100/80 leading-relaxed text-[11px]">
              Sip fluids regularly throughout the day, especially after breastfeeding or pumping sessions. Plain water, coconut water, milk, and ORS electrolyte fluids support cell hydration and energy.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2">
            <h3 className="font-bold text-emerald-200">Nutrient Variety & Healing</h3>
            <p className="text-emerald-100/80 leading-relaxed text-[11px]">
              Focus on protein-rich foods, leafy vegetables, fruits, whole grains, and healthy fats to support tissue repair, C-section incision healing, and maternal stamina.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

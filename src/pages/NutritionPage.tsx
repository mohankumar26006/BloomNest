import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { PREGNANCY_RECIPES } from "../data/nutritionRecipes";
import {
  TRIMESTER_MEAL_PLANS,
  TrimesterMealPlan,
  MealItem,
  MaternalConditionType,
  CONDITION_GUIDANCE_PROFILES,
} from "../data/trimesterMealPlans";
import { EXPANDED_FOOD_SAFETY_DATABASE, FoodSafetyItem } from "../data/foodSafetyData";
import { PREGNANCY_MYTHS_DATABASE, PregnancyMythItem } from "../data/pregnancyMythsData";
import { Recipe, NutritionAiResult, RecipeAiResult } from "../types";
import { askNutritionAI, fetchRecipeAI } from "../services/nutritionApi";
import {
  Utensils,
  Clock,
  Sparkles,
  Heart,
  Apple,
  ShieldCheck,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Loader2,
  Bot,
  BookOpen,
  X,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  ChefHat,
  Flame,
  Check,
  Calendar,
  Droplets,
  Copy,
  Filter,
  Sunrise,
  Sun,
  Moon,
  Coffee,
  ArrowRight,
  GlassWater,
  Minus,
  Plus,
  HelpCircle,
  Award,
} from "lucide-react";

const SUGGESTED_NUTRITION_PROMPTS = [
  "Can I eat pineapple during pregnancy?",
  "Can I eat steamed momos?",
  "Is saffron (kesar) milk safe in first trimester?",
  "Can I drink tender coconut water daily?",
  "Can I eat dragon fruit during pregnancy?",
  "Is ajwain water safe for gas & acidity?",
  "Can I eat boiled eggs every day?",
  "Are raw oysters or sushi safe?",
  "Can I eat street pani puri or chaat safely?",
];

const QUICK_RECIPE_CHIPS = [
  "Ragi Spinach Dosa",
  "Oats & Vegetable Chilla",
  "Palak Paneer",
  "Avocado & Egg Toast",
  "Ginger Lemon Moong Soup",
  "Methi Paratha with Curd",
];

const FALLBACK_RECIPE_IMAGE =
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80";

const CATEGORY_UNSPLASH_MAP: Record<string, string> = {
  smoothie: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80",
  dosa: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80",
  khichdi: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
  chutney: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
  paneer: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80",
  toast: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
  chilla: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
  soup: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
  biryani: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
  idli: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
};

function getCategoryUnsplashFallback(dishName: string): string {
  const d = (dishName || "").toLowerCase();
  for (const key of Object.keys(CATEGORY_UNSPLASH_MAP)) {
    if (d.includes(key)) return CATEGORY_UNSPLASH_MAP[key];
  }
  return FALLBACK_RECIPE_IMAGE;
}

export const NutritionPage: React.FC = () => {
  const { user } = useApp();

  // Active Main Tab State
  const [activeTab, setActiveTab] = useState<"meal-guide" | "superfoods" | "food-safety" | "ai-kitchen">("meal-guide");

  // Tab 1: Trimester Meal Guide State
  const initialTrimester = (user?.trimester === 1 || user?.trimester === 2 || user?.trimester === 3)
    ? (user.trimester as 1 | 2 | 3)
    : 2;
  const [selectedPlanTrimester, setSelectedPlanTrimester] = useState<1 | 2 | 3>(initialTrimester);

  // Tab 1 Enhancements: Condition Filter
  const [selectedCondition, setSelectedCondition] = useState<MaternalConditionType>("standard");

  // Tab 1 Enhancements: Interactive Pregnancy Hydration Tracker (Target: 10 glasses = 2.5L)
  const todayDateStr = new Date().toISOString().split("T")[0];
  const [waterGlasses, setWaterGlasses] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`bloom_pregnancy_water_${todayDateStr}`);
      return saved ? parseInt(saved, 10) : 6;
    } catch {
      return 6;
    }
  });

  const updateWaterGlasses = (delta: number) => {
    const next = Math.max(0, Math.min(14, waterGlasses + delta));
    setWaterGlasses(next);
    try {
      localStorage.setItem(`bloom_pregnancy_water_${todayDateStr}`, next.toString());
    } catch {}
  };

  // Tab 1 Enhancements: Daily Meal Checklist
  const [mealChecklist, setMealChecklist] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`bloom_pregnancy_meals_${todayDateStr}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleMealCheck = (mealId: string) => {
    setMealChecklist((prev) => {
      const next = { ...prev, [mealId]: !prev[mealId] };
      try {
        localStorage.setItem(`bloom_pregnancy_meals_${todayDateStr}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Tab 2: Superfood Recipes State
  const [recipeTrimesterFilter, setRecipeTrimesterFilter] = useState<number | "All">("All");
  const [recipeDietFilter, setRecipeDietFilter] = useState<"All" | "veg" | "egg" | "South Indian" | "Quick">("All");
  const [activeRecipeModal, setActiveRecipeModal] = useState<Recipe | null>(null);
  const [modalCheckedIngredients, setModalCheckedIngredients] = useState<Record<number, boolean>>({});
  const [modalCheckedSteps, setModalCheckedSteps] = useState<Record<number, boolean>>({});
  const [modalCopied, setModalCopied] = useState(false);

  // Tab 3: Food Safety Shield State
  const [safetySearch, setSafetySearch] = useState("");
  const [safetyCategory, setSafetyCategory] = useState<string>("All");
  const [safetyStatusFilter, setSafetyStatusFilter] = useState<string>("All");

  // Tab 3: Myth Busters & AI Safety Checker State
  const [activeSafetySection, setActiveSafetySection] = useState<"database" | "ai-checker" | "myths">("database");
  const [mythCategory, setMythCategory] = useState<string>("All");
  const [expandedMythId, setExpandedMythId] = useState<string | null>("myth-1");

  // Tab 4: AI Recipe Kitchen State
  const [recipeQuery, setRecipeQuery] = useState("");
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [recipeResult, setRecipeResult] = useState<RecipeAiResult | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [completedIngredients, setCompletedIngredients] = useState<Record<number, boolean>>({});
  const [copiedRecipe, setCopiedRecipe] = useState(false);

  // Tab 4: AI Food Safety Assistant State
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<NutritionAiResult | null>(null);

  // Handlers for Tab 2 Modal Checkboxes
  const openRecipeModal = (recipe: Recipe) => {
    setActiveRecipeModal(recipe);
    setModalCheckedIngredients({});
    setModalCheckedSteps({});
    setModalCopied(false);
  };

  const toggleModalIngredient = (idx: number) => {
    setModalCheckedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleModalStep = (idx: number) => {
    setModalCheckedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copyModalRecipe = () => {
    if (!activeRecipeModal) return;
    const text = `${activeRecipeModal.title} (BloomNest Maternal Recipe)\n\n` +
      `Trimester: ${activeRecipeModal.trimester === "All" ? "All Trimesters" : `Trimester ${activeRecipeModal.trimester}`}\n` +
      `Prep Time: ${activeRecipeModal.prepTime} | Calories: ${activeRecipeModal.calories} kcal\n` +
      `Protein: ${activeRecipeModal.proteinG}g | Iron: ${activeRecipeModal.ironMg}mg | Calcium: ${activeRecipeModal.calciumMg}mg | Folate: ${activeRecipeModal.folateMcg}mcg\n\n` +
      `INGREDIENTS:\n` + activeRecipeModal.ingredients.map((ing) => `• ${ing}`).join("\n") + `\n\n` +
      `INSTRUCTIONS:\n` + activeRecipeModal.instructions.map((step, idx) => `${idx + 1}. ${step}`).join("\n") + `\n\n` +
      `KEY BENEFITS:\n` + activeRecipeModal.keyBenefits.map((b) => `• ${b}`).join("\n");

    navigator.clipboard.writeText(text);
    setModalCopied(true);
    setTimeout(() => setModalCopied(false), 2500);
  };

  // Handlers for Tab 4 AI Recipe Kitchen
  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleIngredient = (index: number) => {
    setCompletedIngredients((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleCopyRecipe = () => {
    if (!recipeResult) return;
    const ingredientsList = recipeResult.ingredients
      .map((i: any) => typeof i === "string" ? `• ${i}` : `• ${i.name} (${i.quantity || "as per taste"}${i.notes ? ` - ${i.notes}` : ""})`)
      .join("\n");
    const instructionsList = recipeResult.instructions
      .map((s: string, idx: number) => s.match(/^\d+\./) ? s : `${idx + 1}. ${s}`)
      .join("\n");
    const benefitsList = (recipeResult.pregnancyBenefits || []).map((b) => `• ${b}`).join("\n");

    const text = `${recipeResult.dishName} (BloomNest AI Pregnancy Recipe)\n\n` +
      `Safety: ${recipeResult.safetyMessage}\n\n` +
      `INGREDIENTS:\n${ingredientsList}\n\n` +
      `INSTRUCTIONS:\n${instructionsList}\n\n` +
      `PREGNANCY BENEFITS:\n${benefitsList}`;

    navigator.clipboard.writeText(text);
    setCopiedRecipe(true);
    setTimeout(() => setCopiedRecipe(false), 2500);
  };

  const handleRecipeGenerate = async (dishText: string) => {
    if (!dishText || dishText.trim().length === 0) return;
    setRecipeLoading(true);
    setRecipeError(null);
    setRecipeResult(null);
    setCompletedSteps({});
    setCompletedIngredients({});

    try {
      const currentTrimester = user?.trimester || selectedPlanTrimester || 2;
      const result = await fetchRecipeAI(dishText.trim(), currentTrimester);
      setRecipeResult(result);
    } catch (err: any) {
      setRecipeError("We couldn't generate a reliable recipe right now. Please try again.");
    } finally {
      setRecipeLoading(false);
    }
  };

  const handleAiSearch = async (queryText: string) => {
    if (!queryText || queryText.trim().length === 0) return;
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const currentTrimester = user?.trimester || selectedPlanTrimester || 2;
      const result = await askNutritionAI(queryText.trim(), currentTrimester);
      setAiResult(result);
    } catch (err: any) {
      setAiError(err.message || "Unable to get AI nutrition guidance right now. Please check your connection and try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // Filtered Superfood Recipes
  const filteredRecipes = PREGNANCY_RECIPES.filter((r) => {
    const matchesTrimester =
      recipeTrimesterFilter === "All" || r.trimester === recipeTrimesterFilter || r.trimester === "All";
    const matchesDiet =
      recipeDietFilter === "All" ||
      (recipeDietFilter === "veg" && r.dietType === "veg") ||
      (recipeDietFilter === "egg" && (r.dietType === "egg" || r.dietType === "veg")) ||
      (recipeDietFilter === "South Indian" && r.cuisine === "South Indian") ||
      (recipeDietFilter === "Quick" && r.isQuick);

    return matchesTrimester && matchesDiet;
  });

  // Active Trimester Meal Plan & Condition
  const activePlan = TRIMESTER_MEAL_PLANS.find((p) => p.trimester === selectedPlanTrimester) || TRIMESTER_MEAL_PLANS[0];
  const currentConditionGuidance = CONDITION_GUIDANCE_PROFILES[selectedCondition] || CONDITION_GUIDANCE_PROFILES.standard;
  const completedMealsCount = activePlan.meals.filter((m) => mealChecklist[m.id]).length;
  const mealAdherencePercent = Math.round((completedMealsCount / activePlan.meals.length) * 100);

  // Filtered Food Safety Database
  const filteredSafetyFoods = EXPANDED_FOOD_SAFETY_DATABASE.filter((item) => {
    const matchesSearch =
      safetySearch === "" ||
      item.food.toLowerCase().includes(safetySearch.toLowerCase()) ||
      item.explanation.toLowerCase().includes(safetySearch.toLowerCase()) ||
      item.limitOrRule.toLowerCase().includes(safetySearch.toLowerCase()) ||
      (item.keyNutrients && item.keyNutrients.some((k) => k.toLowerCase().includes(safetySearch.toLowerCase())));

    const matchesCategory = safetyCategory === "All" || item.category === safetyCategory;
    const matchesStatus = safetyStatusFilter === "All" || item.status === safetyStatusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const safetyCategories = ["All", "Fruits", "Dairy", "Spices & Herbs", "Protein & Nuts", "Seafood & Meat", "Beverages"];

  // Filtered Myths Database
  const filteredMyths = PREGNANCY_MYTHS_DATABASE.filter(
    (m) => mythCategory === "All" || m.category === mythCategory
  );
  const mythCategories = ["All", "Spices & Herbs", "Fats & Oils", "Fruits & Vegetables", "General Diet"];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* PAGE HEADER */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <Utensils className="w-4 h-4" />
            <span>Maternal Dietary Science & Culinary Companion</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            Nutrition & Meal Guide
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
            Evidence-based daily trimester meal plans, curated superfoods, 30+ pregnancy safety audits & AI culinary kitchen.
          </p>
        </div>

        {/* User Trimester Indicator Pill */}
        <div className="flex items-center gap-2 bg-rose-50/80 dark:bg-rose-950/40 px-4 py-2 rounded-2xl border border-rose-200/70 dark:border-rose-900/40 self-start md:self-auto">
          <Calendar className="w-4 h-4 text-rose-500" />
          <div className="text-xs">
            <span className="text-gray-500 dark:text-rose-300">Current Phase: </span>
            <span className="font-bold text-rose-600 dark:text-rose-300">
              Trimester {user?.trimester || selectedPlanTrimester}
            </span>
          </div>
        </div>
      </div>

      {/* DAILY MATERNAL MICRONUTRIENT TARGETS BAR */}
      <div className="bg-rose-50 dark:bg-rose-950/30 p-4 sm:p-5 rounded-3xl border border-rose-200/70 dark:border-rose-900/30 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-rose-100">
              Essential Daily Maternal Micronutrient Benchmarks
            </h2>
          </div>
          <span className="text-[11px] font-medium text-gray-500 dark:text-rose-300">
            ACOG & ICMR Pregnancy Standards
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div className="bg-white/80 dark:bg-[#15101d] p-3 rounded-2xl border border-rose-100 dark:border-rose-900/30">
            <div className="text-[10px] uppercase font-bold text-rose-500">Folate (B9)</div>
            <div className="text-base font-extrabold text-gray-900 dark:text-rose-100 mt-0.5">600 µg</div>
            <div className="text-[10px] text-gray-500 dark:text-rose-300 mt-0.5">Neural tube & spine</div>
          </div>
          <div className="bg-white/80 dark:bg-[#15101d] p-3 rounded-2xl border border-rose-100 dark:border-rose-900/30">
            <div className="text-[10px] uppercase font-bold text-amber-500">Elemental Iron</div>
            <div className="text-base font-extrabold text-gray-900 dark:text-rose-100 mt-0.5">27 mg</div>
            <div className="text-[10px] text-gray-500 dark:text-rose-300 mt-0.5">Maternal blood expansion</div>
          </div>
          <div className="bg-white/80 dark:bg-[#15101d] p-3 rounded-2xl border border-rose-100 dark:border-rose-900/30">
            <div className="text-[10px] uppercase font-bold text-sky-500">Calcium</div>
            <div className="text-base font-extrabold text-gray-900 dark:text-rose-100 mt-0.5">1,000 mg</div>
            <div className="text-[10px] text-gray-500 dark:text-rose-300 mt-0.5">Skeletal calcification</div>
          </div>
          <div className="bg-white/80 dark:bg-[#15101d] p-3 rounded-2xl border border-rose-100 dark:border-rose-900/30">
            <div className="text-[10px] uppercase font-bold text-emerald-500">Protein</div>
            <div className="text-base font-extrabold text-gray-900 dark:text-rose-100 mt-0.5">75 – 80 g</div>
            <div className="text-[10px] text-gray-500 dark:text-rose-300 mt-0.5">Fetal tissue & placenta</div>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-white/80 dark:bg-[#15101d] p-3 rounded-2xl border border-rose-100 dark:border-rose-900/30">
            <div className="text-[10px] uppercase font-bold text-purple-500">Pure Hydration</div>
            <div className="text-base font-extrabold text-gray-900 dark:text-rose-100 mt-0.5">2.5 – 3.0 L</div>
            <div className="text-[10px] text-gray-500 dark:text-rose-300 mt-0.5">Amniotic volume & detox</div>
          </div>
        </div>
      </div>

      {/* SEGMENTED 4-TAB NAVIGATION BAR */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100/80 dark:bg-[#15101d] rounded-2xl border border-gray-200 dark:border-rose-900/30">
        <button
          onClick={() => setActiveTab("meal-guide")}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === "meal-guide"
              ? "bg-rose-500 text-white shadow-md"
              : "text-gray-600 dark:text-rose-200 hover:bg-white/50 dark:hover:bg-rose-950/30"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Trimester Meal Guide</span>
        </button>

        <button
          onClick={() => setActiveTab("superfoods")}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === "superfoods"
              ? "bg-rose-500 text-white shadow-md"
              : "text-gray-600 dark:text-rose-200 hover:bg-white/50 dark:hover:bg-rose-950/30"
          }`}
        >
          <Apple className="w-4 h-4" />
          <span>Superfood Recipes</span>
        </button>

        <button
          onClick={() => setActiveTab("food-safety")}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === "food-safety"
              ? "bg-rose-500 text-white shadow-md"
              : "text-gray-600 dark:text-rose-200 hover:bg-white/50 dark:hover:bg-rose-950/30"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Food Safety Shield</span>
        </button>

        <button
          onClick={() => setActiveTab("ai-kitchen")}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === "ai-kitchen"
              ? "bg-rose-500 text-white shadow-md"
              : "text-gray-600 dark:text-rose-200 hover:bg-white/50 dark:hover:bg-rose-950/30"
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>AI Recipe Kitchen</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TRIMESTER MEAL GUIDE (BRAND NEW CORE FEATURE)                   */}
      {/* ========================================================================= */}
      {activeTab === "meal-guide" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Trimester Selector Pills */}
          <div className="bg-white dark:bg-[#1a1523] p-4 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="font-serif font-bold text-base text-gray-900 dark:text-rose-100">
                Daily Scheduled Maternal Meal Plan
              </h2>
              <p className="text-xs text-gray-500 dark:text-rose-300">
                Select your trimester to load an evidence-based daily eating timetable from dawn to bedtime.
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              {([1, 2, 3] as const).map((tNum) => (
                <button
                  key={tNum}
                  onClick={() => setSelectedPlanTrimester(tNum)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedPlanTrimester === tNum
                      ? "bg-rose-600 text-white shadow-md scale-105"
                      : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-200 hover:bg-rose-100"
                  }`}
                >
                  <span>Trimester {tNum}</span>
                  {user?.trimester === tNum && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* MATERNAL CONDITION ADAPTATION SELECTOR */}
          <div className="bg-white dark:bg-[#1a1523] p-5 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-500 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Clinical Condition Adaptation</span>
                </div>
                <h3 className="font-serif font-bold text-base text-gray-900 dark:text-rose-100 mt-0.5">
                  Personalize Plan for Specific Pregnancy Symptoms
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-gray-500 dark:text-rose-300">
                Active: <strong className="text-rose-600 dark:text-rose-300">{currentConditionGuidance.name}</strong>
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { id: "standard", label: "Standard Balanced" },
                { id: "gdm", label: "Gestational Diabetes (GDM)" },
                { id: "anemia", label: "Iron-Deficiency Anemia" },
                { id: "nausea", label: "Nausea & Acid Reflux" },
              ].map((cond) => (
                <button
                  key={cond.id}
                  onClick={() => setSelectedCondition(cond.id as MaternalConditionType)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedCondition === cond.id
                      ? "bg-rose-600 text-white shadow-md scale-105"
                      : "bg-rose-50/60 dark:bg-rose-950/40 text-gray-700 dark:text-rose-200 hover:bg-rose-100/70 border border-rose-100 dark:border-rose-900/30"
                  }`}
                >
                  <span>{cond.label}</span>
                </button>
              ))}
            </div>

            {/* Condition Clinical Guidance Highlight Box */}
            {selectedCondition !== "standard" && (
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                    {currentConditionGuidance.badge}
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
                    Clinical Action Protocol
                  </span>
                </div>
                <p className="text-xs text-gray-800 dark:text-rose-100 font-medium leading-relaxed">
                  {currentConditionGuidance.clinicalSummary}
                </p>
                <div className="text-[11px] text-amber-800 dark:text-amber-300 font-bold bg-white/70 dark:bg-[#15101d] p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/30 flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span><strong>Clinical Golden Rule:</strong> {currentConditionGuidance.keyRule}</span>
                </div>
              </div>
            )}
          </div>

          {/* INTERACTIVE HYDRATION TRACKER & MEAL ADHERENCE SCORE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Widget 1: Interactive Hydration Tracker */}
            <div className="bg-white dark:bg-[#1a1523] p-5 rounded-3xl border border-sky-100 dark:border-sky-900/40 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-600 dark:text-sky-300">
                    <GlassWater className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-rose-100">
                      Pregnancy Hydration Tracker
                    </h4>
                    <p className="text-[10px] text-gray-500 dark:text-rose-300">
                      Target: 10 Glasses (2.5L) for Amniotic Fluid Volume
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateWaterGlasses(-1)}
                    disabled={waterGlasses <= 0}
                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-rose-950/40 text-gray-700 dark:text-rose-200 flex items-center justify-center disabled:opacity-30 transition-all"
                    title="Remove glass"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-extrabold text-sm text-sky-600 dark:text-sky-400 min-w-[2.5rem] text-center">
                    {waterGlasses} / 10
                  </span>
                  <button
                    onClick={() => updateWaterGlasses(1)}
                    disabled={waterGlasses >= 14}
                    className="w-7 h-7 rounded-lg bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center disabled:opacity-30 shadow-xs transition-all"
                    title="Add glass (250ml)"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 10 Glasses Graphic Row */}
              <div className="flex items-center justify-between gap-1 py-1">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const isFilled = idx < waterGlasses;
                  return (
                    <button
                      key={idx}
                      onClick={() => updateWaterGlasses(idx < waterGlasses ? -(waterGlasses - idx) : (idx + 1 - waterGlasses))}
                      title={`Glass ${idx + 1} (250ml)`}
                      className={`flex-1 h-8 rounded-lg flex items-center justify-center transition-all ${
                        isFilled
                          ? "bg-sky-500 text-white shadow-xs scale-105"
                          : "bg-sky-50 dark:bg-sky-950/30 text-sky-300 hover:bg-sky-100 border border-sky-200/60 dark:border-sky-900/30"
                      }`}
                    >
                      <Droplets className={`w-3.5 h-3.5 ${isFilled ? "text-white" : "text-sky-400 opacity-60"}`} />
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-rose-300 border-t border-sky-100 dark:border-sky-900/20 pt-2">
                <span>Intake: <strong>{(waterGlasses * 0.25).toFixed(2)} Liters</strong></span>
                <span className={waterGlasses >= 10 ? "font-bold text-emerald-600 dark:text-emerald-400" : "text-amber-600"}>
                  {waterGlasses >= 10 ? "✓ Optimal Amniotic Target Reached!" : `${Math.max(0, 10 - waterGlasses)} more glasses to target`}
                </span>
              </div>
            </div>

            {/* Widget 2: Daily Meal Adherence Score */}
            <div className="bg-white dark:bg-[#1a1523] p-5 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-300">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-rose-100">
                      Today's Meal Adherence
                    </h4>
                    <p className="text-[10px] text-gray-500 dark:text-rose-300">
                      Mark meals as eaten throughout the day
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-base text-rose-600 dark:text-rose-300">
                    {mealAdherencePercent}%
                  </span>
                  <div className="text-[10px] text-gray-400 font-medium">
                    {completedMealsCount} of {activePlan.meals.length} eaten
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 dark:bg-rose-950/40 h-3 rounded-full overflow-hidden border border-rose-100 dark:border-rose-900/30">
                <div
                  className="h-full bg-rose-500 transition-all duration-500 rounded-full"
                  style={{ width: `${mealAdherencePercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-rose-300 border-t border-rose-100 dark:border-rose-900/20 pt-2">
                <span>Stabilizes maternal glucose & prevents fatigue</span>
                <span className="font-bold text-rose-600 dark:text-rose-300">
                  {completedMealsCount === activePlan.meals.length
                    ? "Full Day Complete!"
                    : `${activePlan.meals.length - completedMealsCount} meals remaining`}
                </span>
              </div>
            </div>
          </div>

          {/* Active Trimester Spotlight Card */}
          <div className="bg-rose-50 dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-rose-100 dark:border-rose-900/30 pb-4">
              <div>
                <div className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 mb-2">
                  {activePlan.weeksRange}
                </div>
                <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-rose-100">
                  {activePlan.trimesterTitle}
                </h3>
                <p className="text-xs text-gray-600 dark:text-rose-300 mt-1 leading-relaxed">
                  {activePlan.clinicalTheme}
                </p>
              </div>

              <div className="shrink-0 bg-white dark:bg-[#15101d] p-3 rounded-2xl border border-rose-100 dark:border-rose-900/30 text-xs">
                <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
                  <Droplets className="w-4 h-4" />
                  <span>Hydration Target</span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-rose-300 mt-1">
                  {activePlan.dailyHydrationTarget}
                </p>
              </div>
            </div>

            {/* Trimester Focus & Caution Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 space-y-2">
                <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Key Maternal Dietary Focus:</span>
                </div>
                <ul className="space-y-1.5 text-gray-700 dark:text-rose-200">
                  {activePlan.keyMaternalFocus.map((focus, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{focus}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 space-y-2">
                <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Clinical Cautionary Tips:</span>
                </div>
                <ul className="space-y-1.5 text-gray-700 dark:text-rose-200">
                  {activePlan.cautionaryNotes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 7 Daily Meal Timeline Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-500" />
                <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100">
                  Daily 7-Slot Eating Schedule
                </h3>
              </div>
              <span className="text-xs text-gray-500 dark:text-rose-300">
                Tap checkbox to log meal
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePlan.meals.map((meal) => {
                const isEaten = !!mealChecklist[meal.id];
                const conditionSub = currentConditionGuidance.substitutions.find(
                  (s) => s.slotName === meal.slotName
                );

                const getSlotIcon = (slot: string) => {
                  switch (slot) {
                    case "Early Morning":
                      return <Sunrise className="w-4 h-4 text-amber-500" />;
                    case "Breakfast":
                      return <Coffee className="w-4 h-4 text-rose-500" />;
                    case "Mid-Morning Snack":
                      return <Sun className="w-4 h-4 text-yellow-500" />;
                    case "Lunch":
                      return <Utensils className="w-4 h-4 text-emerald-500" />;
                    case "Evening Snack":
                      return <Apple className="w-4 h-4 text-orange-500" />;
                    case "Dinner":
                      return <ChefHat className="w-4 h-4 text-purple-500" />;
                    case "Bedtime Drink":
                      return <Moon className="w-4 h-4 text-indigo-500" />;
                    default:
                      return <Clock className="w-4 h-4 text-rose-500" />;
                  }
                };

                return (
                  <div
                    key={meal.id}
                    className={`bg-white dark:bg-[#1a1523] rounded-3xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                      isEaten
                        ? "border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10"
                        : "border-rose-100 dark:border-rose-900/40"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Card Header: Slot Name, Time & Eaten Toggle */}
                      <div className="flex items-center justify-between border-b border-gray-100 dark:border-rose-900/20 pb-3">
                        <div className="flex items-center gap-2 font-bold text-xs text-gray-900 dark:text-rose-100">
                          {getSlotIcon(meal.slotName)}
                          <span>{meal.slotName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/30">
                            {meal.timeSlot}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleMealCheck(meal.id)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                              isEaten
                                ? "bg-emerald-500 text-white shadow-xs"
                                : "bg-gray-100 hover:bg-emerald-50 dark:bg-rose-950/40 text-gray-600 dark:text-rose-200 border border-gray-200 dark:border-rose-900/30"
                            }`}
                            title="Toggle meal eaten today"
                          >
                            <CheckCircle2 className={`w-3 h-3 ${isEaten ? "text-white" : "text-gray-400"}`} />
                            <span>{isEaten ? "Eaten" : "Log"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="font-serif text-base font-bold text-gray-900 dark:text-rose-100">
                          {meal.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-rose-300 mt-1 leading-relaxed">
                          {meal.description}
                        </p>
                      </div>

                      {/* Condition Specific Tailored Substitution Box */}
                      {conditionSub && (
                        <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/50 text-xs space-y-1">
                          <div className="font-bold text-amber-900 dark:text-amber-200 text-[11px] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>{currentConditionGuidance.name} Specific Advice:</span>
                          </div>
                          <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                            {conditionSub.advice}
                          </p>
                        </div>
                      )}

                      {/* Recommended Options */}
                      <div className="p-3.5 rounded-2xl bg-rose-50/40 dark:bg-[#15101d] border border-rose-100 dark:border-rose-900/20 text-xs space-y-2">
                        <div className="font-bold text-rose-800 dark:text-rose-200 text-[11px] uppercase tracking-wide">
                          Recommended Food Choices:
                        </div>
                        <ul className="space-y-1.5">
                          {meal.recommendedDishes.map((dish, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-rose-200">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="font-medium">{dish}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Clinical Benefit Highlight */}
                      <div className="p-3 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 text-xs space-y-1">
                        <div className="font-bold text-sky-900 dark:text-sky-300 text-[11px] flex items-center gap-1">
                          <Heart className="w-3 h-3 text-sky-500" />
                          <span>Maternal Benefit:</span>
                        </div>
                        <p className="text-[11px] text-gray-700 dark:text-rose-200 leading-relaxed">
                          {meal.clinicalBenefit}
                        </p>
                      </div>
                    </div>

                    {/* Footer: Chef Tip & Nutrients */}
                    <div className="border-t border-gray-100 dark:border-rose-900/20 pt-3 space-y-2 text-xs">
                      <div className="flex flex-wrap gap-1.5">
                        {meal.keyNutrients.map((nutrient, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                          >
                            {nutrient}
                          </span>
                        ))}
                      </div>

                      <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/30 flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                        <span><strong>BloomNest Tip:</strong> {meal.chefTips}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CURATED SUPERFOOD RECIPES + FIXED INTERACTIVE MODAL              */}
      {/* ========================================================================= */}
      {activeTab === "superfoods" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header & Trimester + Dietary Filters */}
          <div className="bg-white dark:bg-[#1a1523] p-5 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif font-bold text-lg text-gray-900 dark:text-rose-100">
                  Curated Maternal Superfood Recipes
                </h2>
                <p className="text-xs text-gray-500 dark:text-rose-300">
                  Nutrient-dense recipes calibrated with precise Iron, Calcium, Protein, and Folate macros.
                </p>
              </div>

              <div className="flex gap-1.5 shrink-0 overflow-x-auto pb-1">
                {["All", 1, 2, 3].map((val) => (
                  <button
                    key={val}
                    onClick={() => setRecipeTrimesterFilter(val as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      recipeTrimesterFilter === val
                        ? "bg-rose-500 text-white shadow-md"
                        : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-200 hover:bg-rose-100"
                    }`}
                  >
                    {val === "All" ? "All Phases" : `Trimester ${val}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Culture & Preference Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 dark:border-rose-900/20 text-xs">
              <span className="font-bold text-gray-400 text-[11px] flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Dietary Preference:
              </span>
              {[
                { id: "All", label: "All Diets" },
                { id: "veg", label: "Vegetarian" },
                { id: "egg", label: "Eggetarian" },
                { id: "South Indian", label: "South Indian" },
                { id: "Quick", label: "Quick (<15m)" },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setRecipeDietFilter(d.id as any)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    recipeDietFilter === d.id
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-gray-100 dark:bg-rose-950/30 text-gray-700 dark:text-rose-200 hover:bg-gray-200"
                  }`}
                >
                  {d.label}
                </button>
              ))}
              <span className="ml-auto text-[11px] font-bold text-gray-400">
                Showing {filteredRecipes.length} recipes
              </span>
            </div>
          </div>

          {/* Recipes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => openRecipeModal(recipe)}
                className="bg-white dark:bg-[#1a1523] rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm overflow-hidden flex flex-col justify-between cursor-pointer hover:border-rose-300 dark:hover:border-rose-700 transition-all hover:shadow-lg group"
              >
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-full h-full object-cover transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 dark:bg-[#1a1523]/90 text-rose-600 dark:text-rose-300 backdrop-blur-md shadow-xs">
                        {recipe.trimester === "All" ? "All Trimesters" : `Trimester ${recipe.trimester}`}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                        {recipe.category}
                      </span>
                      {recipe.cuisine && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600/90 text-white backdrop-blur-md">
                          {recipe.cuisine}
                        </span>
                      )}
                      {recipe.dietType === "veg" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600/90 text-white backdrop-blur-md">
                          Veg
                        </span>
                      )}
                      {recipe.dietType === "egg" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-gray-900 backdrop-blur-md">
                          Egg
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-rose-400" />
                      <span>{recipe.prepTime}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-rose-100 group-hover:text-rose-600 transition-colors">
                      {recipe.title}
                    </h3>

                    {/* Macro Badges Grid */}
                    <div className="grid grid-cols-5 gap-1.5 bg-rose-50/50 dark:bg-[#15101d] p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/20 text-center">
                      <div>
                        <div className="text-[9px] text-gray-400 font-medium">Calories</div>
                        <div className="font-extrabold text-xs text-gray-900 dark:text-rose-100">{recipe.calories}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-gray-400 font-medium">Protein</div>
                        <div className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">{recipe.proteinG}g</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-gray-400 font-medium">Iron</div>
                        <div className="font-extrabold text-xs text-amber-600 dark:text-amber-400">{recipe.ironMg}mg</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-gray-400 font-medium">Calcium</div>
                        <div className="font-extrabold text-xs text-sky-600 dark:text-sky-400">{recipe.calciumMg}mg</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-gray-400 font-medium">Folate</div>
                        <div className="font-extrabold text-xs text-purple-600 dark:text-purple-400">{recipe.folateMcg}µg</div>
                      </div>
                    </div>

                    {/* Key Benefits */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {recipe.keyBenefits.map((benefit, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-gray-100 dark:bg-rose-950/40 text-gray-700 dark:text-rose-200"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openRecipeModal(recipe);
                    }}
                    className="w-full py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-500 hover:text-white text-rose-700 dark:text-rose-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 group/btn border border-rose-200/60 dark:border-rose-900/30"
                  >
                    <span>View Ingredients & Step-by-Step Cooking Guide</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* FIXED INTERACTIVE RECIPE DETAIL MODAL */}
          {activeRecipeModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-[#1a1523] w-full max-w-3xl rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                {/* Modal Banner Image */}
                <div className="relative h-56 overflow-hidden shrink-0">
                  <img
                    src={activeRecipeModal.imageUrl}
                    alt={activeRecipeModal.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/70" />

                  <button
                    onClick={() => setActiveRecipeModal(null)}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500 text-white shadow-xs">
                        {activeRecipeModal.trimester === "All" ? "All Trimesters" : `Trimester ${activeRecipeModal.trimester}`}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md text-white">
                        {activeRecipeModal.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md text-white flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activeRecipeModal.prepTime}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-2xl text-white drop-shadow-md">
                      {activeRecipeModal.title}
                    </h3>
                  </div>
                </div>

                {/* Modal Scrollable Content Body */}
                <div className="p-6 overflow-y-auto space-y-6 text-xs">
                  {/* Macro Nutrient Stats Row */}
                  <div className="grid grid-cols-5 gap-2 bg-rose-50/60 dark:bg-[#15101d] p-3 rounded-2xl border border-rose-100 dark:border-rose-900/30 text-center">
                    <div>
                      <div className="text-[10px] text-gray-500 dark:text-rose-300 font-medium">Calories</div>
                      <div className="font-extrabold text-sm text-gray-900 dark:text-rose-100">{activeRecipeModal.calories} kcal</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 dark:text-rose-300 font-medium">Protein</div>
                      <div className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">{activeRecipeModal.proteinG} g</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 dark:text-rose-300 font-medium">Iron</div>
                      <div className="font-extrabold text-sm text-amber-600 dark:text-amber-400">{activeRecipeModal.ironMg} mg</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 dark:text-rose-300 font-medium">Calcium</div>
                      <div className="font-extrabold text-sm text-sky-600 dark:text-sky-400">{activeRecipeModal.calciumMg} mg</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 dark:text-rose-300 font-medium">Folate</div>
                      <div className="font-extrabold text-sm text-purple-600 dark:text-purple-400">{activeRecipeModal.folateMcg} µg</div>
                    </div>
                  </div>

                  {/* Maternal Health Benefits */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
                    <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span>Maternal Nutritional & Fetal Growth Benefits:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeRecipeModal.keyBenefits.map((b, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-xl text-xs font-semibold bg-white dark:bg-[#15101d] text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/30"
                        >
                          ✓ {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Two-Column Grid: Interactive Ingredients & Step-by-Step Instructions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ingredients Checklist */}
                    <div className="space-y-3 p-4 rounded-2xl bg-gray-50/70 dark:bg-[#15101d] border border-gray-200 dark:border-rose-900/30">
                      <div className="font-bold text-gray-900 dark:text-rose-100 text-sm flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-rose-500" />
                          <span>Ingredients Checklist:</span>
                        </span>
                        <span className="text-[10px] text-gray-400 font-normal">Tick as you prepare</span>
                      </div>

                      <ul className="space-y-2">
                        {activeRecipeModal.ingredients.map((ing, i) => (
                          <li
                            key={i}
                            onClick={() => toggleModalIngredient(i)}
                            className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all cursor-pointer select-none ${
                              modalCheckedIngredients[i]
                                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-gray-400 dark:text-gray-500 line-through"
                                : "bg-white dark:bg-[#1a1523] border-gray-100 dark:border-rose-900/20 text-gray-800 dark:text-rose-100"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                modalCheckedIngredients[i]
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : "border-gray-300 dark:border-rose-800"
                              }`}
                            >
                              {modalCheckedIngredients[i] && <Check className="w-3 h-3" />}
                            </div>
                            <span className="font-medium text-xs leading-tight">{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Step-by-Step Cooking Guide */}
                    <div className="space-y-3 p-4 rounded-2xl bg-gray-50/70 dark:bg-[#15101d] border border-gray-200 dark:border-rose-900/30">
                      <div className="font-bold text-gray-900 dark:text-rose-100 text-sm flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <ChefHat className="w-4 h-4 text-amber-500" />
                          <span>Step-by-Step Instructions:</span>
                        </span>
                        <span className="text-[10px] text-gray-400 font-normal">Follow steps</span>
                      </div>

                      <ol className="space-y-2.5">
                        {activeRecipeModal.instructions.map((step, i) => (
                          <li
                            key={i}
                            onClick={() => toggleModalStep(i)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                              modalCheckedSteps[i]
                                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-gray-400 dark:text-gray-500 line-through"
                                : "bg-white dark:bg-[#1a1523] border-gray-100 dark:border-rose-900/20 text-gray-800 dark:text-rose-100"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-200 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span className="font-medium text-xs leading-relaxed">{step}</span>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="p-4 border-t border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/30 flex items-center justify-between shrink-0">
                  <button
                    onClick={copyModalRecipe}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-[#1a1523] hover:bg-gray-50 dark:hover:bg-rose-900/30 border border-rose-200 dark:border-rose-900/40 text-gray-700 dark:text-rose-200 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    {modalCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Recipe Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-rose-500" />
                        <span>Copy Recipe</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveRecipeModal(null)}
                    className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    Close Cooking Guide
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EXPANDED FOOD SAFETY SHIELD + INDIAN MATERNAL MYTH BUSTERS       */}
      {/* ========================================================================= */}
      {activeTab === "food-safety" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Sub-Navigation Switch: Food Safety Database vs AI Safety Checker vs Cultural Myth Busters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#1a1523] p-3 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-xs">
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-[#15101d] rounded-2xl border border-gray-200 dark:border-rose-900/30 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveSafetySection("database")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  activeSafetySection === "database"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "text-gray-600 dark:text-rose-200 hover:text-gray-900"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>50+ Food Safety Audits</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSafetySection("ai-checker")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  activeSafetySection === "ai-checker"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "text-gray-600 dark:text-rose-200 hover:text-gray-900"
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Ask Safety AI Live</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSafetySection("myths")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  activeSafetySection === "myths"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "text-gray-600 dark:text-rose-200 hover:text-gray-900"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Cultural Myth Busters</span>
              </button>
            </div>

            <span className="text-[11px] font-semibold text-gray-400">
              {activeSafetySection === "database"
                ? "Search & Clinical Guidelines"
                : activeSafetySection === "ai-checker"
                ? "Live Maternal Safety AI"
                : "Evidence-Based Medical Facts"}
            </span>
          </div>

          {/* VIEW A: FOOD SAFETY DATABASE */}
          {activeSafetySection === "database" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Search & Filters Controls */}
              <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-base text-gray-900 dark:text-rose-100">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      <span>Maternal Pregnancy Food Safety Shield</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-rose-300 mt-0.5">
                      Instant clinical safety evaluation covering 30+ everyday foods, Indian spices, fruits, dairy, and beverages.
                    </p>
                  </div>

                  {/* Search Box */}
                  <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={safetySearch}
                      onChange={(e) => setSafetySearch(e.target.value)}
                      placeholder="Search food (e.g. Saffron, Papaya, Curd)..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs font-medium text-gray-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                    {safetySearch && (
                      <button
                        onClick={() => setSafetySearch("")}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <span className="font-bold text-gray-400 text-[11px] shrink-0">Category:</span>
                  {safetyCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSafetyCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        safetyCategory === cat
                          ? "bg-rose-500 text-white shadow-xs"
                          : "bg-gray-100 dark:bg-rose-950/30 text-gray-700 dark:text-rose-300 hover:bg-rose-50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Status Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto text-xs">
                  <span className="font-bold text-gray-400 text-[11px] shrink-0">Safety Level:</span>
                  {[
                    { id: "All", label: "All Levels" },
                    { id: "safe", label: "Safe to Eat" },
                    { id: "moderation", label: "In Moderation" },
                    { id: "avoid", label: "Strictly Avoid" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSafetyStatusFilter(s.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        safetyStatusFilter === s.id
                          ? "bg-gray-900 text-white dark:bg-rose-100 dark:text-gray-900 shadow-xs"
                          : "bg-gray-100 dark:bg-rose-950/30 text-gray-700 dark:text-rose-300 hover:bg-rose-50"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                  <span className="ml-auto text-[11px] font-bold text-gray-400 shrink-0">
                    Showing {filteredSafetyFoods.length} items
                  </span>
                </div>

                {/* Ask AI Banner in Tab 3 */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-800/40">
                  <div className="flex items-center gap-2 text-xs">
                    <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="text-gray-700 dark:text-rose-200 font-medium">
                      {safetySearch
                        ? `Looking for specific evaluation of "${safetySearch}"? Ask BloomNest Safety AI!`
                        : "Need instant safety checks for any street food, spice, dessert, or exotic fruit?"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const q = safetySearch ? `Can I eat ${safetySearch} during pregnancy?` : "Can I eat dragon fruit during pregnancy?";
                      setAiQuery(q);
                      setActiveSafetySection("ai-checker");
                      handleAiSearch(q);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 self-end sm:self-auto shrink-0"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Ask Safety AI Live</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Food Safety Cards Grid */}
              {filteredSafetyFoods.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  {filteredSafetyFoods.map((item) => (
                    <div
                      key={item.id}
                      className={`p-5 rounded-3xl border space-y-3 flex flex-col justify-between shadow-xs transition-shadow hover:shadow-md ${
                        item.status === "safe"
                          ? "bg-emerald-50/40 dark:bg-emerald-950/15 border-emerald-200 dark:border-emerald-900/40"
                          : item.status === "moderation"
                          ? "bg-amber-50/40 dark:bg-amber-950/15 border-amber-200 dark:border-amber-900/40"
                          : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40"
                      }`}
                    >
                      <div className="space-y-2.5">
                        {/* Category & Status Badge */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                            {item.category}
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase tracking-wide flex items-center gap-1 ${
                              item.status === "safe"
                                ? "bg-emerald-600 text-white"
                                : item.status === "moderation"
                                ? "bg-amber-600 text-white"
                                : "bg-red-600 text-white"
                            }`}
                          >
                            {item.status === "safe" && <CheckCircle2 className="w-3 h-3" />}
                            {item.status === "moderation" && <AlertTriangle className="w-3 h-3" />}
                            {item.status === "avoid" && <XCircle className="w-3 h-3" />}
                            <span>
                              {item.status === "safe"
                                ? "Safe"
                                : item.status === "moderation"
                                ? "In Moderation"
                                : "Strictly Avoid"}
                            </span>
                          </span>
                        </div>

                        {/* Food Name */}
                        <div className="font-serif font-bold text-gray-900 dark:text-rose-100 text-base">
                          {item.food}
                        </div>

                        {/* Rule / Dosage */}
                        <div className="p-2 rounded-xl bg-white/70 dark:bg-[#15101d]/60 border border-black/5 dark:border-white/5 font-semibold text-xs text-rose-800 dark:text-rose-300">
                          Rule: {item.limitOrRule}
                        </div>

                        {/* Clinical Explanation */}
                        <p className="text-[11px] text-gray-600 dark:text-rose-300 leading-relaxed font-medium">
                          {item.explanation}
                        </p>

                        {/* Safe Alternative (if any) */}
                        {item.safeAlternative && (
                          <div className="text-[11px] p-2 rounded-xl bg-emerald-100/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 font-medium">
                            <strong>Healthy Alternative:</strong> {item.safeAlternative}
                          </div>
                        )}
                      </div>

                      {/* Key Nutrients / Compounds */}
                      {item.keyNutrients && item.keyNutrients.length > 0 && (
                        <div className="border-t border-black/5 dark:border-white/5 pt-2.5 flex flex-wrap gap-1">
                          {item.keyNutrients.map((kn, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-white/80 dark:bg-[#1a1523] text-gray-600 dark:text-rose-300 border border-black/5 dark:border-white/5"
                            >
                              {kn}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#1a1523] border border-dashed border-rose-300 dark:border-rose-900/60 text-center space-y-4 shadow-sm animate-in fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 flex items-center justify-center mx-auto shadow-xs">
                    <Bot className="w-7 h-7" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100">
                      {safetySearch ? `"${safetySearch}" is not in quick list` : "No matching items found"}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-rose-300">
                      BloomNest's Maternal Nutrition AI evaluates safety, trimester guidelines, nutrients, and cooking rules for <strong>any food in the world</strong>!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const q = safetySearch ? `Can I eat ${safetySearch} during pregnancy?` : "Can I eat dragon fruit during pregnancy?";
                      setAiQuery(q);
                      setActiveSafetySection("ai-checker");
                      handleAiSearch(q);
                    }}
                    className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Ask Safety AI About {safetySearch ? `"${safetySearch}"` : "Any Food"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW B: LIVE AI FOOD SAFETY QUESTION CHECKER */}
          {activeSafetySection === "ai-checker" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-rose-50 dark:bg-rose-950/40 p-6 rounded-3xl border border-rose-200/80 dark:border-rose-800/50 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100 flex items-center gap-1.5">
                        <span>Ask Any Maternal Food Safety Question</span>
                        <Sparkles className="w-4 h-4 text-amber-500" />
                      </h2>
                      <p className="text-xs text-gray-600 dark:text-rose-300">
                        Ask if any ingredient, spice, fruit, tea, or street food is safe during your current trimester.
                      </p>
                    </div>
                  </div>

                  <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-200 dark:border-rose-800">
                    Maternal Safety AI
                  </span>
                </div>

                {/* AI Search Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAiSearch(aiQuery);
                  }}
                  className="space-y-3"
                >
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 absolute left-4 text-gray-400" />
                    <input
                      type="text"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="e.g. Can I eat pineapple? Is tender coconut water safe daily? Is raw papaya safe?"
                      className="w-full pl-11 pr-32 py-3 rounded-2xl bg-white dark:bg-[#1a1523] border border-rose-200 dark:border-rose-900/40 text-xs font-semibold text-gray-900 dark:text-rose-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                    <button
                      type="submit"
                      disabled={aiLoading || aiQuery.trim().length === 0}
                      className="absolute right-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-40 flex items-center gap-1.5"
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Checking...</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-3.5 h-3.5" />
                          <span>Ask AI</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Suggested Prompts */}
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_NUTRITION_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setAiQuery(prompt);
                          handleAiSearch(prompt);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-[#1a1523] hover:bg-rose-100/60 dark:hover:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 text-[11px] font-semibold text-gray-700 dark:text-rose-200 transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </form>

                {aiError && (
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
                    {aiError}
                  </div>
                )}

                {/* AI Result Card */}
                {aiResult && (
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#1a1523] border border-rose-200 dark:border-rose-900/40 shadow-md space-y-5 animate-in fade-in duration-300">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 dark:border-rose-900/30 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            AI Safety Evaluation
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            • Trimester {user?.trimester || selectedPlanTrimester || 2} Guidance
                          </span>
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
                          {aiResult.foodName}
                        </h3>
                      </div>

                      <div
                        className={`px-4 py-2 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 border shadow-xs ${
                          aiResult.safetyStatus === "SAFE"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"
                            : aiResult.safetyStatus === "MODERATION"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
                            : aiResult.safetyStatus === "AVOID"
                            ? "bg-rose-600 text-white border-rose-700"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300"
                        }`}
                      >
                        {aiResult.safetyStatus === "SAFE" && (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Safe to Eat</span>
                          </>
                        )}
                        {aiResult.safetyStatus === "MODERATION" && (
                          <>
                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span>In Moderation</span>
                          </>
                        )}
                        {aiResult.safetyStatus === "AVOID" && (
                          <>
                            <XCircle className="w-4 h-4 text-white" />
                            <span>Strictly Avoid</span>
                          </>
                        )}
                        {aiResult.safetyStatus === "UNKNOWN" && (
                          <>
                            <Info className="w-4 h-4 text-gray-500" />
                            <span>Consult Doctor</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                      <p className="text-xs sm:text-sm text-gray-800 dark:text-rose-100 leading-relaxed font-medium">
                        {aiResult.summary}
                      </p>
                    </div>

                    {/* Nutritional Breakdown Grid (if available) */}
                    {aiResult.nutrition && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-rose-200">
                          <span className="flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-amber-500" />
                            Nutritional Profile {aiResult.nutrition.servingSize ? `(${aiResult.nutrition.servingSize})` : ""}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                          <div className="p-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 text-center">
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block">Calories</span>
                            <span className="font-bold text-sm text-gray-900 dark:text-rose-100">
                              {aiResult.nutrition.calories ?? (aiResult.nutrition as any).calories_kcal ?? 180} kcal
                            </span>
                          </div>
                          <div className="p-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 text-center">
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block">Protein</span>
                            <span className="font-bold text-sm text-gray-900 dark:text-rose-100">
                              {aiResult.nutrition.proteinG ?? (aiResult.nutrition as any).protein_g ?? (aiResult.nutrition as any).protein ?? 8}g
                            </span>
                          </div>
                          <div className="p-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 text-center">
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block">Iron</span>
                            <span className="font-bold text-sm text-rose-600 dark:text-rose-400">
                              {aiResult.nutrition.ironMg ?? (aiResult.nutrition as any).iron_mg ?? (aiResult.nutrition as any).iron ?? 2.2}mg
                            </span>
                          </div>
                          <div className="p-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 text-center">
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block">Calcium</span>
                            <span className="font-bold text-sm text-blue-600 dark:text-blue-400">
                              {aiResult.nutrition.calciumMg ?? (aiResult.nutrition as any).calcium_mg ?? (aiResult.nutrition as any).calcium ?? 120}mg
                            </span>
                          </div>
                          <div className="p-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 text-center">
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block">Folate</span>
                            <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                              {aiResult.nutrition.folateMcg ?? (aiResult.nutrition as any).folate_mcg ?? (aiResult.nutrition as any).folate ?? 45}mcg
                            </span>
                          </div>
                          <div className="p-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 text-center">
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block">Carbs</span>
                            <span className="font-bold text-sm text-gray-900 dark:text-rose-100">
                              {aiResult.nutrition.carbsG ?? (aiResult.nutrition as any).carbohydrates_g ?? (aiResult.nutrition as any).carbs ?? 22}g
                            </span>
                          </div>
                          <div className="p-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 text-center">
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block">Fiber</span>
                            <span className="font-bold text-sm text-purple-600 dark:text-purple-400">
                              {aiResult.nutrition.fiberG ?? (aiResult.nutrition as any).fiber_g ?? (aiResult.nutrition as any).fiber ?? 3.5}g
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Benefits & Considerations Side by Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Benefits */}
                      {aiResult.benefits && aiResult.benefits.length > 0 && (
                        <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/15 border border-emerald-200 dark:border-emerald-900/30 space-y-2">
                          <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            Key Maternal Benefits
                          </h4>
                          <ul className="space-y-1.5 text-xs text-emerald-950 dark:text-emerald-200">
                            {aiResult.benefits.map((b, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-emerald-500 mt-0.5">•</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Considerations / Dosage Limits */}
                      {aiResult.considerations && aiResult.considerations.length > 0 && (
                        <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/15 border border-amber-200 dark:border-amber-900/30 space-y-2">
                          <h4 className="font-bold text-xs text-amber-900 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            Safety Rules & Dosage Limits
                          </h4>
                          <ul className="space-y-1.5 text-xs text-amber-950 dark:text-amber-200">
                            {aiResult.considerations.map((c, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span>{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Food Safety & Safe Prep Guidelines */}
                    {aiResult.foodSafety && (
                      <div className="p-3.5 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 text-xs text-blue-950 dark:text-blue-200 flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold text-blue-900 dark:text-blue-300">Food Safety & Preparation Rule:</strong>
                          <span>{aiResult.foodSafety}</span>
                        </div>
                      </div>
                    )}

                    {/* Clinical Recommendation */}
                    {aiResult.recommendation && (
                      <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-gray-800 dark:text-rose-100 flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold text-rose-700 dark:text-rose-300">Obstetric Guidance: </strong>
                          <span>{aiResult.recommendation}</span>
                        </div>
                      </div>
                    )}

                    {/* Sources & Citations */}
                    {aiResult.sources && aiResult.sources.length > 0 && (
                      <div className="pt-2 border-t border-rose-100 dark:border-rose-900/20 flex flex-wrap items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                        <span className="font-bold text-gray-400">Clinical References:</span>
                        {aiResult.sources.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 font-medium"
                          >
                            {s.title} ({s.source})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW C: CULTURAL MYTH BUSTERS */}
          {activeSafetySection === "myths" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Myth Busters Header Card */}
              <div className="bg-purple-50 dark:bg-purple-950/30 p-6 rounded-3xl border border-purple-200/80 dark:border-purple-800/40 shadow-xs space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      <span>Traditional Elder Advice vs Clinical Obstetric Science</span>
                    </div>
                    <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-rose-100 mt-1">
                      Indian Maternal Nutrition Myth Busters
                    </h2>
                    <p className="text-xs text-gray-600 dark:text-rose-300 mt-0.5 max-w-2xl leading-relaxed">
                      Pregnancy in Indian families is often filled with generational food rules. Here is what rigorous medical guidelines (ICMR & ACOG) actually prove.
                    </p>
                  </div>
                </div>

                {/* Category Filter Pills for Myths */}
                <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-purple-200/50 dark:border-purple-900/30 text-xs">
                  <span className="font-bold text-gray-400 text-[11px] shrink-0">Filter:</span>
                  {mythCategories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setMythCategory(c)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        mythCategory === c
                          ? "bg-purple-600 text-white shadow-xs"
                          : "bg-white/80 dark:bg-[#15101d] text-gray-700 dark:text-rose-200 hover:bg-purple-50"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                  <span className="ml-auto text-[11px] font-bold text-gray-400 shrink-0">
                    Showing {filteredMyths.length} myths
                  </span>
                </div>
              </div>

              {/* Myths Grid */}
              <div className="space-y-4">
                {filteredMyths.map((item) => {
                  const isExpanded = expandedMythId === item.id;
                  const getVerdictBadge = () => {
                    switch (item.verdict) {
                      case "Busted":
                        return (
                          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-600 text-white flex items-center gap-1 shadow-xs">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Busted Myth</span>
                          </span>
                        );
                      case "Nuanced Truth":
                        return (
                          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500 text-white flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Nuanced Truth</span>
                          </span>
                        );
                      case "Dangerous":
                        return (
                          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-red-800 text-white flex items-center gap-1 shadow-xs animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Dangerous Practice</span>
                          </span>
                        );
                    }
                  };

                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-[#1a1523] rounded-3xl border border-rose-100 dark:border-rose-900/40 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                            {item.category}
                          </div>
                          <h3 className="font-serif text-base sm:text-lg font-bold text-gray-900 dark:text-rose-100">
                            "{item.myth}"
                          </h3>
                        </div>
                        <div className="shrink-0">{getVerdictBadge()}</div>
                      </div>

                      {/* Common Cultural Belief */}
                      <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#15101d] border border-gray-200 dark:border-rose-900/20 text-xs space-y-1">
                        <div className="text-[10px] font-bold uppercase text-gray-500 tracking-wide">
                          Common Household Belief:
                        </div>
                        <p className="text-gray-700 dark:text-rose-200 italic">
                          "{item.commonBelief}"
                        </p>
                      </div>

                      {/* Medical Fact Box */}
                      <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs space-y-1.5">
                        <div className="font-bold text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Obstetric Medical Fact:</span>
                        </div>
                        <p className="text-gray-900 dark:text-rose-100 font-semibold leading-relaxed">
                          {item.medicalFact}
                        </p>
                      </div>

                      {/* Expandable Scientific Details */}
                      <div className="pt-2 border-t border-gray-100 dark:border-rose-900/20">
                        <button
                          type="button"
                          onClick={() => setExpandedMythId(isExpanded ? null : item.id)}
                          className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
                        >
                          <span>{isExpanded ? "Hide Scientific Breakdown" : "Read Scientific & Clinical Details"}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </button>

                        {isExpanded && (
                          <div className="mt-3 space-y-3 animate-in fade-in duration-200 text-xs">
                            <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30 space-y-1">
                              <div className="font-bold text-purple-900 dark:text-purple-300 text-[11px]">
                                Scientific Rationale:
                              </div>
                              <p className="text-gray-700 dark:text-rose-200 leading-relaxed">
                                {item.scientificExplanation}
                              </p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/30 space-y-1">
                              <div className="font-bold text-sky-900 dark:text-sky-300 text-[11px] flex items-center gap-1">
                                <Heart className="w-3 h-3 text-sky-600" />
                                <span>Clinical Action for Mother:</span>
                              </div>
                              <p className="text-gray-800 dark:text-rose-100 font-medium leading-relaxed">
                                {item.clinicalAdvice}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DEDICATED AI RECIPE KITCHEN                                      */}
      {/* ========================================================================= */}
      {activeTab === "ai-kitchen" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* AI Recipe Generator Card */}
          <div className="bg-amber-50 dark:bg-amber-950/30 p-6 rounded-3xl border border-amber-200/80 dark:border-amber-800/40 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-rose-100 flex items-center gap-2">
                    <span>Ask for Any Recipe & Cooking Guide</span>
                    <Sparkles className="w-4 h-4 text-amber-500 animate-bounce" />
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-rose-300 mt-0.5">
                    Tell BloomNest what you want to cook (e.g. Palak Paneer, Oats Chilla), and get pregnancy-adapted ingredients, instructions, and safety notes.
                  </p>
                </div>
              </div>
              <span className="hidden lg:inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                AI Culinary Companion
              </span>
            </div>

            {/* Recipe Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRecipeGenerate(recipeQuery);
              }}
              className="space-y-3"
            >
              <div className="relative flex items-center">
                <Search className="w-4 h-4 absolute left-4 text-amber-500" />
                <input
                  type="text"
                  value={recipeQuery}
                  onChange={(e) => setRecipeQuery(e.target.value)}
                  placeholder="e.g. Oats Chilla, Palak Paneer, Ragi Idli, Avocado Toast..."
                  className="w-full pl-11 pr-32 py-3 rounded-2xl bg-white dark:bg-[#1a1523] border border-amber-200 dark:border-amber-800/50 text-xs font-semibold text-gray-900 dark:text-rose-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  type="submit"
                  disabled={recipeLoading || recipeQuery.trim().length === 0}
                  className="absolute right-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-40 flex items-center gap-1.5"
                >
                  {recipeLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Recipe Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold text-gray-500 dark:text-rose-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" /> Quick Ideas:
                </span>
                {QUICK_RECIPE_CHIPS.map((chip, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setRecipeQuery(chip);
                      handleRecipeGenerate(chip);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-[#1a1523] hover:bg-amber-100/60 dark:hover:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 text-[11px] font-semibold text-gray-700 dark:text-rose-200 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </form>

            {recipeError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
                {recipeError}
              </div>
            )}

            {/* Generated Recipe Result Display */}
            {recipeResult && (
              <div className="mt-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1a1523] border border-amber-200 dark:border-amber-800/40 shadow-md space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Recipe Image Banner */}
                  <div className="w-full md:w-56 h-48 rounded-2xl overflow-hidden relative shrink-0 shadow-sm">
                    <img
                      src={recipeResult.imageUrl || getCategoryUnsplashFallback(recipeResult.dishName)}
                      alt={recipeResult.dishName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getCategoryUnsplashFallback(recipeResult.dishName);
                      }}
                    />
                    <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                      AI Adapted Dish
                    </span>
                  </div>

                  {/* Header & Meta */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Pregnancy Culinary Formula
                        </span>
                        <h3 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
                          {recipeResult.dishName}
                        </h3>
                      </div>

                      <button
                        onClick={handleCopyRecipe}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#15101d] dark:hover:bg-rose-950/40 text-xs font-bold text-gray-700 dark:text-rose-200 flex items-center gap-1.5 transition-colors shrink-0"
                      >
                        {copiedRecipe ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-amber-500" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-xs text-emerald-900 dark:text-emerald-300 font-medium">
                      <strong>Pregnancy Safety:</strong> {recipeResult.safetyMessage}
                    </div>

                    {/* Quick Meta Stats */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-3 py-1 rounded-xl bg-gray-100 dark:bg-[#15101d] text-gray-700 dark:text-rose-200 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-rose-500" /> Prep: {recipeResult.prepTime}
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-gray-100 dark:bg-[#15101d] text-gray-700 dark:text-rose-200 font-semibold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500" /> Cook: {recipeResult.cookTime}
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-gray-100 dark:bg-[#15101d] text-gray-700 dark:text-rose-200 font-semibold">
                        Serves: {recipeResult.servings}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Macro Nutrition Row */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-gray-50/80 dark:bg-[#15101d] p-3 rounded-2xl border border-gray-200 dark:border-rose-900/30 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-gray-400">Calories</div>
                    <div className="font-extrabold text-gray-900 dark:text-rose-100">
                      {recipeResult.nutrition.calories || (recipeResult.nutrition as any).calories_kcal || 260} kcal
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400">Protein</div>
                    <div className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {recipeResult.nutrition.protein_g ?? (recipeResult.nutrition as any).proteinG ?? (recipeResult.nutrition as any).protein ?? 12} g
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400">Iron</div>
                    <div className="font-extrabold text-amber-600 dark:text-amber-400">
                      {recipeResult.nutrition.iron_mg ?? (recipeResult.nutrition as any).ironMg ?? (recipeResult.nutrition as any).iron ?? 3.2} mg
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400">Calcium</div>
                    <div className="font-extrabold text-sky-600 dark:text-sky-400">
                      {recipeResult.nutrition.calcium_mg ?? (recipeResult.nutrition as any).calciumMg ?? (recipeResult.nutrition as any).calcium ?? 160} mg
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400">Folate</div>
                    <div className="font-extrabold text-purple-600 dark:text-purple-400">
                      {recipeResult.nutrition.folate_mcg ?? (recipeResult.nutrition as any).folateMcg ?? (recipeResult.nutrition as any).folate ?? 75} µg
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400">Fiber</div>
                    <div className="font-extrabold text-gray-900 dark:text-rose-100">
                      {recipeResult.nutrition.fiber_g ?? (recipeResult.nutrition as any).fiberG ?? (recipeResult.nutrition as any).fiber ?? 4.5} g
                    </div>
                  </div>
                </div>

                {/* Ingredients & Instructions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Ingredients Checklist */}
                  <div className="space-y-3 p-4 rounded-2xl bg-gray-50/70 dark:bg-[#15101d] border border-gray-200 dark:border-rose-900/30">
                    <div className="font-bold text-gray-900 dark:text-rose-100 text-sm flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-rose-500" />
                        <span>Required Ingredients:</span>
                      </span>
                      <span className="text-[10px] text-gray-400 font-normal">Tick as you gather</span>
                    </div>
                    <ul className="space-y-2">
                      {recipeResult.ingredients.map((ing: any, i: number) => {
                        const ingName = typeof ing === "string" ? ing : (ing.name || "Ingredient");
                        const ingQty = typeof ing === "string" ? "" : (ing.quantity || "");
                        const ingNotes = typeof ing === "string" ? "" : (ing.notes || "");
                        return (
                          <li
                            key={i}
                            onClick={() => toggleIngredient(i)}
                            className={`flex items-start justify-between p-2 rounded-xl border transition-all cursor-pointer select-none ${
                              completedIngredients[i]
                                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-gray-400 dark:text-gray-500 line-through"
                                : "bg-white dark:bg-[#1a1523] border-gray-100 dark:border-rose-900/20 text-gray-700 dark:text-rose-200"
                            }`}
                          >
                            <span className="font-medium flex items-center gap-2">
                              <div
                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                                  completedIngredients[i]
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : "border-gray-300 dark:border-rose-900/40"
                                }`}
                              >
                                {completedIngredients[i] && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span className="font-semibold text-xs">{ingName}</span>
                              {ingNotes && <span className="text-[10px] text-gray-400 font-normal">({ingNotes})</span>}
                            </span>
                            {ingQty && (
                              <span className="font-bold text-[11px] text-amber-600 dark:text-amber-400 shrink-0 ml-2">
                                {ingQty}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Step-by-Step Instructions */}
                  <div className="space-y-3 p-4 rounded-2xl bg-gray-50/70 dark:bg-[#15101d] border border-gray-200 dark:border-rose-900/30">
                    <div className="font-bold text-gray-900 dark:text-rose-100 text-sm flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ChefHat className="w-4 h-4 text-amber-500" />
                        <span>Step-by-Step Instructions:</span>
                      </span>
                      <span className="text-[10px] text-gray-400 font-normal">Follow steps</span>
                    </div>
                    <ol className="space-y-2.5">
                      {recipeResult.instructions.map((step, i) => (
                        <li
                          key={i}
                          onClick={() => toggleStep(i)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                            completedSteps[i]
                              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-gray-400 dark:text-gray-500 line-through"
                              : "bg-white dark:bg-[#1a1523] border-gray-100 dark:border-rose-900/20 text-gray-700 dark:text-rose-200"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-200 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="font-medium text-xs leading-relaxed">
                              {step.startsWith(`${i + 1}.`) ? step.replace(`${i + 1}.`, "").trim() : step}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Benefits & Guidance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {recipeResult.pregnancyBenefits && recipeResult.pregnancyBenefits.length > 0 && (
                    <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
                      <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        <span>Maternal Health Benefits:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-rose-200 font-medium">
                        {recipeResult.pregnancyBenefits.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 space-y-2">
                    <div className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>BloomNest Cooking Guidance:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-rose-200 font-medium">
                      {recipeResult.additionalInfo &&
                        recipeResult.additionalInfo.map((tip, i) => <li key={i}>{tip}</li>)}
                      {recipeResult.trimesterGuidance && (
                        <li className="font-semibold text-rose-700 dark:text-rose-300">
                          {recipeResult.trimesterGuidance}
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Bridge to Food Safety Shield */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-rose-100">
                  Checking if an ingredient or spice is safe during your trimester?
                </p>
                <p className="text-[11px] text-gray-600 dark:text-rose-300">
                  Ask our AI Safety Shield or explore 50+ clinically evaluated pregnancy foods & myths in Tab 3.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab("food-safety");
                setActiveSafetySection("ai-checker");
              }}
              className="px-4 py-2 rounded-xl bg-white dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/40 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0"
            >
              <Bot className="w-3.5 h-3.5 text-rose-500" />
              <span>Ask Food Safety AI →</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { PREGNANCY_RECIPES } from "../data/nutritionRecipes";
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
  RefreshCw,
  ChefHat,
  Flame,
  Users,
  Check,
} from "lucide-react";

interface FoodSafetyItem {
  food: string;
  category: string;
  status: "safe" | "moderation" | "avoid";
  limitOrRule: string;
  explanation: string;
}

const FOOD_SAFETY_DATABASE: FoodSafetyItem[] = [
  {
    food: "Ripe Papaya (Yellow/Orange)",
    category: "Fruits",
    status: "safe",
    limitOrRule: "Safe in moderate amounts",
    explanation: "Fully ripe papaya is rich in vitamin C, folate, and fiber. It is safe and beneficial for digestion.",
  },
  {
    food: "Raw / Unripe Green Papaya",
    category: "Fruits",
    status: "avoid",
    limitOrRule: "STRICTLY AVOID",
    explanation: "Unripe green papaya contains high concentrations of latex and papain enzymes, which can stimulate uterine contractions and early labor.",
  },
  {
    food: "Raw Fish & Sushi (Uncooked Seafood)",
    category: "Seafood",
    status: "avoid",
    limitOrRule: "STRICTLY AVOID",
    explanation: "Carries high risk of Listeria monocytogenes, Salmonella, and parasites that penetrate placental barriers.",
  },
  {
    food: "Caffeinated Drinks (Coffee & Tea)",
    category: "Beverages",
    status: "moderation",
    limitOrRule: "Limit to < 200 mg caffeine / day (~1-2 cups)",
    explanation: "Excess caffeine crosses the placenta and impairs fetal heart rate and birth weight.",
  },
  {
    food: "Unpasteurized Soft Cheese (Feta, Brie, Blue)",
    category: "Dairy",
    status: "avoid",
    limitOrRule: "STRICTLY AVOID unless cooked",
    explanation: "High risk of Listeria infection which can cause miscarriage or stillbirth.",
  },
  {
    food: "Pineapple (Bromelain content)",
    category: "Fruits",
    status: "moderation",
    limitOrRule: "1-2 slices safe",
    explanation: "Contains bromelain which softens cervix in extreme quantities, but normal culinary slices are safe.",
  },
  {
    food: "Boiled Eggs (Fully Cooked Yolk)",
    category: "Protein",
    status: "safe",
    limitOrRule: "1-2 eggs daily",
    explanation: "Rich in Choline and Protein critical for fetal neural tube and brain development.",
  },
  {
    food: "Soft-Boiled / Raw Runny Eggs",
    category: "Protein",
    status: "avoid",
    limitOrRule: "STRICTLY AVOID",
    explanation: "Risk of Salmonella infection leading to severe fever, vomiting, and uterine cramps.",
  },
];

const SUGGESTED_NUTRITION_PROMPTS = [
  "Can I eat pineapple during pregnancy?",
  "Is ragi dosa good for iron & calcium?",
  "Can I drink coconut water every day?",
  "Can I eat paneer tikka?",
  "Is raw papaya safe?",
  "What should I eat for breakfast?",
];

const QUICK_RECIPE_CHIPS = [
  "Mint Chutney",
  "Oats & Vegetable Chilla",
  "Palak Paneer",
  "Avocado & Egg Toast",
  "Ginger Lemon Soup",
];

const FALLBACK_RECIPE_IMAGE = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80";

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
  const [selectedTrimester, setSelectedTrimester] = useState<number | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // AI Nutrition Search State
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<NutritionAiResult | null>(null);

  // Dedicated AI Recipe Generator State
  const [recipeQuery, setRecipeQuery] = useState("");
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [recipeResult, setRecipeResult] = useState<RecipeAiResult | null>(null);

  // Interactive Recipe Cooking Step & Ingredient Checkbox State
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [completedIngredients, setCompletedIngredients] = useState<Record<number, boolean>>({});
  const [copiedRecipe, setCopiedRecipe] = useState(false);

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleIngredient = (index: number) => {
    setCompletedIngredients((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleCopyRecipe = () => {
    if (!recipeResult) return;
    const text = `🍳 ${recipeResult.dishName} (BloomNest Pregnancy Recipe)\n\n` +
      `Safety: ${recipeResult.safetyMessage}\n\n` +
      `🛒 INGREDIENTS:\n` + recipeResult.ingredients.map(i => `• ${i.name} (${i.quantity})`).join('\n') + `\n\n` +
      `👩‍🍳 INSTRUCTIONS:\n` + recipeResult.instructions.map((s, idx) => `${idx + 1}. ${s}`).join('\n') + `\n\n` +
      `🌸 PREGNANCY BENEFITS:\n` + recipeResult.pregnancyBenefits.map(b => `• ${b}`).join('\n');
    
    navigator.clipboard.writeText(text);
    setCopiedRecipe(true);
    setTimeout(() => setCopiedRecipe(false), 2500);
  };

  // Recipe Cooking Detail Modal State
  const [activeRecipeModal, setActiveRecipeModal] = useState<Recipe | null>(null);

  const filteredRecipes = PREGNANCY_RECIPES.filter(
    (r) => selectedTrimester === "All" || r.trimester === selectedTrimester || r.trimester === "All"
  );

  const filteredFoods = FOOD_SAFETY_DATABASE.filter(
    (f) =>
      f.food.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.explanation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handler for AI Nutrition Guidance
  const handleAiSearch = async (queryText: string) => {
    if (!queryText || queryText.trim().length === 0) return;
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const currentTrimester = user?.trimester || (selectedTrimester === "All" ? 2 : (selectedTrimester as number));
      const result = await askNutritionAI(queryText.trim(), currentTrimester);
      setAiResult(result);
    } catch (err: any) {
      setAiError(err.message || "Unable to get AI nutrition guidance right now. Please check your connection and try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // Handler for Dedicated Recipe Generation
  const handleRecipeGenerate = async (dishText: string) => {
    if (!dishText || dishText.trim().length === 0) return;
    setRecipeLoading(true);
    setRecipeError(null);
    setRecipeResult(null);
    setCompletedSteps({});
    setCompletedIngredients({});

    try {
      const currentTrimester = user?.trimester || (selectedTrimester === "All" ? 2 : (selectedTrimester as number));
      const result = await fetchRecipeAI(dishText.trim(), currentTrimester);
      setRecipeResult(result);
    } catch (err: any) {
      setRecipeError("We couldn't generate a reliable recipe right now.");
    } finally {
      setRecipeLoading(false);
    }
  };

  const handleRecipeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRecipeGenerate(recipeQuery);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <Utensils className="w-4 h-4" />
            <span>Maternal Dietary Science & Culinary Companion</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            Nutrition, AI Recipe Generator & Food Safety
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
            Ask for any dish recipe with ingredients & cooking steps + pregnancy food safety & superfood recipes.
          </p>
        </div>

        {/* Trimester Filter Buttons */}
        <div className="flex gap-2 shrink-0">
          {["All", 1, 2, 3].map((trimesterVal) => (
            <button
              key={trimesterVal}
              onClick={() => setSelectedTrimester(trimesterVal as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedTrimester === trimesterVal
                  ? "bg-rose-500 text-white shadow-md"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-200"
              }`}
            >
              {trimesterVal === "All" ? "All Trimesters" : `Trimester ${trimesterVal}`}
            </button>
          ))}
        </div>
      </div>

      {/* 🍳 SECTION 1: DEDICATED PREGNANCY AI RECIPE GENERATOR */}
      <div className="bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-purple-500/10 dark:from-amber-950/30 dark:via-rose-950/20 dark:to-purple-950/30 p-6 rounded-3xl border border-amber-200/80 dark:border-amber-800/40 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-rose-100 flex items-center gap-2">
                <span>Ask for a Specific Recipe & Cooking Guide</span>
                <Sparkles className="w-4 h-4 text-amber-500 animate-bounce" />
              </h2>
              <p className="text-xs text-gray-600 dark:text-rose-300 mt-0.5">
                Tell BloomNest what you want to cook, and get a pregnancy-aware recipe with ingredients, instructions, nutrition guidance, safety notes & helpful cooking tips.
              </p>
            </div>
          </div>
          <span className="hidden lg:inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
            Pregnancy Culinary Companion
          </span>
        </div>

        {/* Recipe Search Input */}
        <form onSubmit={handleRecipeSubmit} className="space-y-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-4 text-amber-500" />
            <input
              type="text"
              value={recipeQuery}
              onChange={(e) => setRecipeQuery(e.target.value)}
              placeholder="What would you like to cook? e.g. Palak Paneer, Oats Chilla, Mint Chutney, Avocado Toast..."
              className="w-full pl-11 pr-36 py-3.5 rounded-2xl bg-white dark:bg-[#1a1523] border border-amber-200 dark:border-amber-900/40 text-xs font-semibold text-gray-900 dark:text-rose-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={recipeLoading || recipeQuery.trim().length === 0}
              className="absolute right-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs shadow-md transition-all disabled:opacity-40 flex items-center gap-1.5"
            >
              {recipeLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Cooking...</span>
                </>
              ) : (
                <>
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>Generate Recipe</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Recipe Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-rose-300">
              Quick Recipes:
            </span>
            {QUICK_RECIPE_CHIPS.map((chipText, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setRecipeQuery(chipText);
                  handleRecipeGenerate(chipText);
                }}
                className="px-3 py-1 rounded-xl bg-white/90 dark:bg-[#1a1523]/90 border border-amber-200 dark:border-amber-900/40 text-[11px] font-medium text-amber-800 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/60 transition-colors shadow-2xs"
              >
                {chipText}
              </button>
            ))}
          </div>
        </form>

        {/* Recipe Loading State */}
        {recipeLoading && (
          <div className="p-6 rounded-3xl bg-white/90 dark:bg-[#1a1523]/90 border border-amber-200 dark:border-amber-900/40 text-center space-y-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <ChefHat className="w-6 h-6 animate-bounce" />
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-rose-100">
              🍳 Preparing your BloomNest recipe...
            </div>
            <p className="text-xs text-gray-500 dark:text-rose-300">
              Checking ingredient safety • Building step-by-step instructions • Calculating maternal micronutrients
            </p>
          </div>
        )}

        {/* Recipe Error Banner */}
        {recipeError && !recipeLoading && (
          <div className="p-4 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>We couldn't generate a reliable recipe right now.</span>
              </div>
              <button
                onClick={() => handleRecipeGenerate(recipeQuery || "Mint Chutney")}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        )}

        {/* GENERATED FULL RECIPE CARD */}
        {recipeResult && !recipeLoading && (
          <div className="bg-white dark:bg-[#1a1523] rounded-3xl border border-amber-200 dark:border-amber-900/40 shadow-xl overflow-hidden space-y-6 animate-in fade-in duration-300">
            {/* Dish Image Banner */}
            <div className="relative h-56 md:h-64 overflow-hidden">
              <img
                src={recipeResult.imageUrl || getCategoryUnsplashFallback(recipeResult.dishName)}
                alt={`${recipeResult.dishName} recipe`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getCategoryUnsplashFallback(recipeResult.dishName);
                }}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <div className="absolute bottom-4 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-3 text-white">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider">
                      {recipeResult.category || "Pregnancy Dish"}
                    </span>
                    {recipeResult.sourceType === "AI_GENERATED" && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/90 text-white font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs border border-amber-300">
                        <Sparkles className="w-3 h-3 text-amber-200 animate-pulse" /> ✨ AI Generated Recipe
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold mt-1">
                    {recipeResult.dishName}
                  </h3>
                  <div className="flex items-center gap-4 text-xs opacity-90 mt-1 font-medium">
                    {recipeResult.prepTime && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-400" /> Prep: {recipeResult.prepTime}</span>}
                    {recipeResult.cookTime && <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-rose-400" /> Cook: {recipeResult.cookTime}</span>}
                    {recipeResult.servings && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-emerald-400" /> Servings: {recipeResult.servings}</span>}
                  </div>
                </div>

                {/* Color-coded Safety Badge */}
                <div
                  className={`px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 border shadow-lg shrink-0 ${
                    recipeResult.safetyStatus === "SAFE"
                      ? "bg-emerald-600 text-white border-emerald-400"
                      : recipeResult.safetyStatus === "MODERATION"
                      ? "bg-amber-500 text-white border-amber-300"
                      : recipeResult.safetyStatus === "AVOID"
                      ? "bg-rose-600 text-white border-rose-400"
                      : "bg-gray-700 text-white border-gray-500"
                  }`}
                >
                  {recipeResult.safetyStatus === "SAFE" && (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>🟢 Good for Pregnancy</span>
                    </>
                  )}
                  {recipeResult.safetyStatus === "MODERATION" && (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>🟡 Enjoy in Moderation</span>
                    </>
                  )}
                  {recipeResult.safetyStatus === "AVOID" && (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>🔴 Avoid During Pregnancy</span>
                    </>
                  )}
                  {recipeResult.safetyStatus === "UNKNOWN" && (
                    <>
                      <Info className="w-4 h-4" />
                      <span>⚪ Needs Review</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Pregnancy Safety Message */}
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs space-y-1">
                <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Pregnancy Safety Assessment:</span>
                </div>
                <p className="text-gray-700 dark:text-rose-200 leading-relaxed font-medium">
                  {recipeResult.safetyMessage}
                </p>
                {recipeResult.safetyStatus === "UNKNOWN" && (
                  <p className="text-[11px] text-gray-500 dark:text-rose-300 pt-1">
                    We couldn't confidently assess this dish for pregnancy. Please check the ingredients and confirm with your healthcare professional if you are unsure.
                  </p>
                )}
              </div>

              {/* Nutritional Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-900 dark:text-rose-100">
                  <span className="flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-rose-500" />
                    <span>Nutritional Composition</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    {recipeResult.nutrition.isEstimated ? "Estimated nutrition per serving" : "Verified laboratory nutrition per serving"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30">
                  <div>
                    <div className="text-[10px] text-gray-400 font-normal">Calories</div>
                    <div className="font-extrabold text-gray-900 dark:text-rose-100">
                      {recipeResult.nutrition.calories ? `${recipeResult.nutrition.calories} kcal` : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-normal">Protein</div>
                    <div className="font-extrabold text-gray-900 dark:text-rose-100">
                      {recipeResult.nutrition.protein_g ? `${recipeResult.nutrition.protein_g} g` : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-normal">Iron</div>
                    <div className="font-extrabold text-gray-900 dark:text-rose-100">
                      {recipeResult.nutrition.iron_mg ? `${recipeResult.nutrition.iron_mg} mg` : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-normal">Calcium</div>
                    <div className="font-extrabold text-gray-900 dark:text-rose-100">
                      {recipeResult.nutrition.calcium_mg ? `${recipeResult.nutrition.calcium_mg} mg` : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-normal">Folate</div>
                    <div className="font-extrabold text-gray-900 dark:text-rose-100">
                      {recipeResult.nutrition.folate_mcg ? `${recipeResult.nutrition.folate_mcg} mcg` : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-normal">Carbs</div>
                    <div className="font-extrabold text-gray-900 dark:text-rose-100">
                      {recipeResult.nutrition.carbohydrates_g ? `${recipeResult.nutrition.carbohydrates_g} g` : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-normal">Fiber</div>
                    <div className="font-extrabold text-gray-900 dark:text-rose-100">
                      {recipeResult.nutrition.fiber_g ? `${recipeResult.nutrition.fiber_g} g` : "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingredients & Instructions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Ingredients List */}
                <div className="space-y-3 p-4 rounded-2xl bg-gray-50/70 dark:bg-[#15101d] border border-gray-200 dark:border-rose-900/30">
                  <div className="font-bold text-gray-900 dark:text-rose-100 text-sm flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-rose-500" />
                    <span>Required Ingredients:</span>
                  </div>
                  <ul className="space-y-2">
                    {recipeResult.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-start justify-between border-b border-gray-100 dark:border-rose-900/20 pb-1.5 text-gray-700 dark:text-rose-200">
                        <span className="font-medium flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{ing.name}</span>
                        </span>
                        <span className="font-bold text-rose-600 dark:text-rose-300 text-right">
                          {ing.quantity} {ing.notes && <span className="font-normal text-[10px] text-gray-400">({ing.notes})</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Step-by-Step Instructions */}
                <div className="space-y-3 p-4 rounded-2xl bg-gray-50/70 dark:bg-[#15101d] border border-gray-200 dark:border-rose-900/30">
                  <div className="font-bold text-gray-900 dark:text-rose-100 text-sm flex items-center gap-1.5">
                    <ChefHat className="w-4 h-4 text-amber-500" />
                    <span>Step-by-Step Instructions:</span>
                  </div>
                  <ol className="space-y-2.5 text-gray-700 dark:text-rose-200 font-medium">
                    {recipeResult.instructions.map((step, i) => (
                      <li key={i} className="leading-relaxed pl-1">
                        {step.startsWith(`${i + 1}.`) ? step : `${i + 1}. ${step}`}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Benefits & Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Pregnancy Benefits */}
                {recipeResult.pregnancyBenefits && recipeResult.pregnancyBenefits.length > 0 && (
                  <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
                    <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span>🌸 Maternal Health Benefits:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-rose-200 font-medium">
                      {recipeResult.pregnancyBenefits.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cooking Tips & Trimester Guidance */}
                <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 space-y-2">
                  <div className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>💡 BloomNest Cooking Tips & Guidance:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-rose-200 font-medium">
                    {recipeResult.additionalInfo && recipeResult.additionalInfo.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                    {recipeResult.trimesterGuidance && (
                      <li className="font-semibold text-rose-700 dark:text-rose-300">
                        {recipeResult.trimesterGuidance}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🌸 SECTION 2: BLOOMNEST NUTRITION AI ASSISTANT */}
      <div className="bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-purple-500/10 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-purple-950/40 p-6 rounded-3xl border border-rose-200/80 dark:border-rose-800/50 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100 flex items-center gap-1.5">
                <span>BloomNest Nutrition Safety Companion</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h2>
              <p className="text-xs text-gray-600 dark:text-rose-300">
                Ask about food safety parameters, fruits, beverages, ingredients & nutrition questions
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-200 dark:border-rose-800">
            Pregnancy Evidence Guidance
          </span>
        </div>

        {/* AI Search Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleAiSearch(aiQuery); }} className="space-y-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-4 text-gray-400" />
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="e.g. Can I eat pineapple? Is coconut water safe daily? Is raw papaya safe?"
              className="w-full pl-11 pr-32 py-3 rounded-2xl bg-white dark:bg-[#1a1523] border border-rose-200 dark:border-rose-900/40 text-xs font-semibold text-gray-900 dark:text-rose-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            <button
              type="submit"
              disabled={aiLoading || aiQuery.trim().length === 0}
              className="absolute right-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-md transition-all disabled:opacity-40 flex items-center gap-1.5"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <span>Ask Bloom AI</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Quick Suggestion Prompt Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-rose-300">
              Suggested:
            </span>
            {SUGGESTED_NUTRITION_PROMPTS.map((promptText, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAiQuery(promptText);
                  handleAiSearch(promptText);
                }}
                className="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-[#1a1523]/80 border border-rose-100 dark:border-rose-900/40 text-[11px] font-medium text-rose-700 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors shadow-2xs"
              >
                {promptText}
              </button>
            ))}
          </div>
        </form>

        {/* AI Loading State */}
        {aiLoading && (
          <div className="p-6 rounded-2xl bg-white/90 dark:bg-[#1a1523]/90 border border-rose-200 dark:border-rose-900/40 text-center space-y-2 animate-pulse">
            <Loader2 className="w-6 h-6 text-rose-500 animate-spin mx-auto" />
            <div className="text-xs font-bold text-gray-900 dark:text-rose-100">
              🌸 BloomNest AI is evaluating this food...
            </div>
          </div>
        )}

        {/* AI Error Banner */}
        {aiError && !aiLoading && (
          <div className="p-4 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Unable to get nutrition guidance right now:</span>
              </div>
              <button
                onClick={() => handleAiSearch(aiQuery || "banana")}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        )}

        {/* AI STRUCTURED NUTRITION RESULT CARD */}
        {aiResult && !aiLoading && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1a1523] border border-rose-200 dark:border-rose-900/50 shadow-md space-y-5 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 dark:border-rose-900/30 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  AI Guidance Evaluation
                </span>
                <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-rose-100">
                  {aiResult.foodName}
                </h3>
              </div>

              <div
                className={`px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 border shadow-xs ${
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
                    <span>🟢 Safe & Suitable</span>
                  </>
                )}
                {aiResult.safetyStatus === "MODERATION" && (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>🟡 Consume In Moderation</span>
                  </>
                )}
                {aiResult.safetyStatus === "AVOID" && (
                  <>
                    <XCircle className="w-4 h-4 text-white" />
                    <span>🔴 Avoid During Pregnancy</span>
                  </>
                )}
                {aiResult.safetyStatus === "UNKNOWN" && (
                  <>
                    <Info className="w-4 h-4 text-gray-500" />
                    <span>⚪ Needs Review</span>
                  </>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-700 dark:text-rose-200 leading-relaxed font-medium">
              {aiResult.summary}
            </p>
          </div>
        )}
      </div>

      {/* FOOD SAFETY DATABASE SEARCH ENGINE (Preserved 100%) */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-rose-100">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>Pregnancy Food Safety Database</span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search food (e.g. Papaya, Sushi, Eggs)..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {filteredFoods.map((item, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border space-y-2 flex flex-col justify-between ${
                item.status === "safe"
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                  : item.status === "moderation"
                  ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40"
                  : "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {item.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-extrabold text-[9px] uppercase ${
                      item.status === "safe"
                        ? "bg-emerald-600 text-white"
                        : item.status === "moderation"
                        ? "bg-amber-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {item.status === "safe"
                      ? "Safe"
                      : item.status === "moderation"
                      ? "In Moderation"
                      : "Strictly Avoid"}
                  </span>
                </div>

                <div className="font-bold text-gray-900 dark:text-rose-100 text-sm">
                  {item.food}
                </div>

                <div className="text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                  Rule: {item.limitOrRule}
                </div>
              </div>

              <p className="text-[11px] text-gray-600 dark:text-rose-300 leading-relaxed border-t border-black/5 dark:border-white/5 pt-2">
                {item.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RECIPE CARDS GRID (Preserved 100% + Click opens Cooking Modal) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRecipes.map((recipe) => (
          <div
            key={recipe.id}
            onClick={() => setActiveRecipeModal(recipe)}
            className="bg-white dark:bg-[#1a1523] rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm overflow-hidden flex flex-col justify-between cursor-pointer hover:border-rose-300 dark:hover:border-rose-700 transition-all hover:shadow-md group"
          >
            <div>
              <div className="relative h-48 overflow-hidden">
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase">
                  {recipe.category} · Prep {recipe.prepTime}
                </div>
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                  <BookOpen className="w-3 h-3" /> View Instructions
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-rose-100 group-hover:text-rose-500 transition-colors">
                  {recipe.title}
                </h3>

                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200">
                  <div>
                    <div className="text-gray-400 font-normal">Iron</div>
                    <div>{recipe.ironMg} mg</div>
                  </div>
                  <div>
                    <div className="text-gray-400 font-normal">Calcium</div>
                    <div>{recipe.calciumMg} mg</div>
                  </div>
                  <div>
                    <div className="text-gray-400 font-normal">Protein</div>
                    <div>{recipe.proteinG} g</div>
                  </div>
                  <div>
                    <div className="text-gray-400 font-normal">Folate</div>
                    <div>{recipe.folateMcg} mcg</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-rose-100 dark:border-rose-900/30 mt-2 flex items-center justify-between text-xs font-semibold text-rose-600 dark:text-rose-300">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {recipe.keyBenefits[0]}
              </span>
              <span>{recipe.calories} kcal</span>
            </div>
          </div>
        ))}
      </div>

      {/* INTERACTIVE RECIPE COOKING MODAL */}
      {activeRecipeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1523] w-full max-w-2xl rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="relative h-48 overflow-hidden shrink-0">
              <img
                src={activeRecipeModal.imageUrl}
                alt={activeRecipeModal.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setActiveRecipeModal(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div>
                <h3 className="font-serif font-bold text-xl text-gray-900 dark:text-rose-100">
                  {activeRecipeModal.title}
                </h3>
              </div>
            </div>

            <div className="p-4 border-t border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/30 flex justify-end shrink-0">
              <button
                onClick={() => setActiveRecipeModal(null)}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-colors"
              >
                Close Recipe Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

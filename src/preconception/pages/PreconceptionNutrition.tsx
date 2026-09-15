import React, { useState, useEffect } from "react";
import { Utensils, CheckCircle, Flame, ShieldCheck, AlertTriangle, Sparkles, Heart, Apple, Coffee, Wine } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

export const PreconceptionNutrition: React.FC = () => {
  const [folateStreak, setFolateStreak] = useState<number>(() => {
    const saved = localStorage.getItem("bloom_pre_folateStreak");
    return saved ? parseInt(saved, 10) : 14;
  });

  const [folateTakenToday, setFolateTakenToday] = useState<boolean>(() => {
    const today = new Date().toISOString().split("T")[0];
    return localStorage.getItem(`bloom_pre_folate_${today}`) === "true";
  });

  const [waterGlasses, setWaterGlasses] = useState<number>(() => {
    const today = new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem(`bloom_pre_water_${today}`);
    return saved ? parseInt(saved, 10) : 5;
  });

  const toggleFolateToday = () => {
    const today = new Date().toISOString().split("T")[0];
    if (folateTakenToday) {
      setFolateTakenToday(false);
      setFolateStreak((s) => Math.max(0, s - 1));
      localStorage.removeItem(`bloom_pre_folate_${today}`);
      localStorage.setItem("bloom_pre_folateStreak", (folateStreak - 1).toString());
    } else {
      setFolateTakenToday(true);
      setFolateStreak((s) => s + 1);
      localStorage.setItem(`bloom_pre_folate_${today}`, "true");
      localStorage.setItem("bloom_pre_folateStreak", (folateStreak + 1).toString());
    }
  };

  const updateWater = (delta: number) => {
    const today = new Date().toISOString().split("T")[0];
    const next = Math.max(0, Math.min(12, waterGlasses + delta));
    setWaterGlasses(next);
    localStorage.setItem(`bloom_pre_water_${today}`, next.toString());
  };

  const superfoods = [
    {
      name: "Dark Leafy Greens (Spinach & Kale)",
      nutrient: "Natural Dietary Folate & Iron",
      why: "Builds red blood cells and prevents early neural tube defects within the first 28 days of conception.",
      tag: "Top Priority",
    },
    {
      name: "Lentils, Chickpeas & Moong Dal",
      nutrient: "Plant Protein & Soluble Fiber",
      why: "Studies show replacing animal protein with plant legumes reduces anovulatory infertility risk by up to 50%.",
      tag: "Ovulation Support",
    },
    {
      name: "Pasture-Raised Eggs",
      nutrient: "Choline & Vitamin B12",
      why: "Choline is vital for early fetal brain gene expression and neural tube synthesis alongside folate.",
      tag: "Egg Quality",
    },
    {
      name: "Walnuts & Flaxseeds",
      nutrient: "Omega-3 (ALA) & Zinc",
      why: "Anti-inflammatory fatty acids support healthy uterine blood flow and balance reproductive hormones.",
      tag: "Hormone Harmony",
    },
    {
      name: "Avocados",
      nutrient: "Monounsaturated Healthy Fats & Vit E",
      why: "Supports endometrial lining thickness and assists the absorption of fat-soluble vitamins (A, D, E, K).",
      tag: "Lining Support",
    },
    {
      name: "Berries (Blueberries & Pomegranates)",
      nutrient: "Polyphenols & Antioxidants",
      why: "Defends maturing oocytes (eggs) against reactive oxidative damage during follicular development.",
      tag: "Cell Protection",
    },
  ];

  const safetyItems = [
    {
      item: "Limit Caffeine to <200mg/day",
      reason: "Approx 1 regular cup of brewed coffee. High intake (>300mg) is associated with delayed conception.",
      status: "caution",
      icon: Coffee,
    },
    {
      item: "Avoid High-Mercury Fish",
      reason: "Avoid swordfish, king mackerel, and tilefish. Prefer salmon, sardines, or light tuna.",
      status: "avoid",
      icon: AlertTriangle,
    },
    {
      item: "Zero Alcohol & Smoking",
      reason: "Even moderate preconception alcohol decreases conception rates and damages oocyte DNA.",
      status: "avoid",
      icon: Wine,
    },
    {
      item: "Switch to Filtered Water & Glass Containers",
      reason: "Reduces exposure to BPA and phthalate endocrine disruptors that mimic synthetic estrogens.",
      status: "safe",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 text-white shadow-xl shadow-emerald-950/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/30 text-emerald-200">
              <Utensils className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Preconception Nutrition Lab</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Folate & Superfoods Hub</h2>
          <p className="text-emerald-100 text-sm mt-1">
            Fuel egg quality, thicken endometrial lining, and build neural tube defense months before conception.
          </p>
        </div>
      </div>

      {/* Folate Guardian Tracker */}
      <Card variant="glass" className="p-6 border-emerald-100 dark:border-emerald-900/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <Flame className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  Folate Guardian Defense
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 font-bold">
                  {folateStreak} Days Active
                </span>
              </div>
              <h3 className="text-xl font-black text-emerald-950 dark:text-emerald-50 mt-1">
                Daily Folic Acid (400 mcg - 800 mcg)
              </h3>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 mt-1 max-w-xl">
                The neural tube closes in the baby by day 28 after conception—often before a positive test! Taking folate 3 months prior reduces neural tube defects by up to 70%.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={toggleFolateToday}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                folateTakenToday
                  ? "bg-emerald-600 text-white shadow-emerald-600/30"
                  : "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200"
              }`}
            >
              <CheckCircle className={`w-5 h-5 ${folateTakenToday ? "text-white" : "text-emerald-600"}`} />
              {folateTakenToday ? "Folate Taken Today! ✓" : "Mark Folate Taken Today"}
            </button>
          </div>
        </div>

        {/* Daily Hydration Bar */}
        <div className="mt-6 pt-6 border-t border-emerald-100 dark:border-emerald-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💧</span>
            <div>
              <div className="text-xs font-bold text-emerald-900 dark:text-emerald-100">Cellular Hydration</div>
              <p className="text-[11px] text-emerald-700/70 dark:text-emerald-300/70">Adequate water increases fertile cervical mucus volume.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateWater(-1)}
              className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 font-black text-base"
            >
              -
            </button>
            <span className="font-mono font-bold text-sm text-emerald-900 dark:text-emerald-100 px-3">
              {waterGlasses} / 8 Glasses
            </span>
            <button
              onClick={() => updateWater(1)}
              className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-base hover:bg-emerald-700"
            >
              +
            </button>
          </div>
        </div>
      </Card>

      {/* Superfoods Catalog */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-emerald-950 dark:text-emerald-50 text-lg flex items-center gap-2">
            <Apple className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Fertility Boosting Superfoods
          </h3>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Evidence-Based Clinical Nutrition</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {superfoods.map((food, idx) => (
            <Card key={idx} variant="glass" className="p-5 border-emerald-100 dark:border-emerald-900/40 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-emerald-950 dark:text-emerald-100 text-sm leading-snug">{food.name}</h4>
                  <Badge variant="primary" className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-[10px] whitespace-nowrap">
                    {food.tag}
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">{food.nutrient}</p>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 leading-relaxed">{food.why}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Safety & What to Avoid */}
      <Card variant="glass" className="p-6 border-emerald-100 dark:border-emerald-900/40">
        <h3 className="font-bold text-emerald-950 dark:text-emerald-50 text-lg mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          Preconception Toxicology & Diet Guardrails
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {safetyItems.map((sec, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border flex items-start gap-3 ${
                sec.status === "avoid"
                  ? "bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-950 dark:text-rose-100"
                  : sec.status === "caution"
                  ? "bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-950 dark:text-amber-100"
                  : "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-950 dark:text-emerald-100"
              }`}
            >
              <sec.icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-sm mb-1">{sec.item}</h5>
                <p className="text-xs opacity-90 leading-relaxed">{sec.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

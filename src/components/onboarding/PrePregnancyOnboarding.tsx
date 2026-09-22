import React, { useState } from "react";
import { motion } from "motion/react";
import { PrePregnancyDetails } from "../../types";
import { ProgressHeader } from "./ProgressHeader";
import { Calendar, Flower2, Sparkles, ArrowRight, Check } from "lucide-react";

interface PrePregnancyOnboardingProps {
  onNext: (details: PrePregnancyDetails) => void;
  onBack: () => void;
}

export const PrePregnancyOnboarding: React.FC<PrePregnancyOnboardingProps> = ({
  onNext,
  onBack,
}) => {
  const [lastPeriodDate, setLastPeriodDate] = useState<string>("2026-08-15");
  const [cycleLengthDays, setCycleLengthDays] = useState<number>(28);
  const [isCycleRegular, setIsCycleRegular] = useState<boolean>(true);
  const [conceptionGoal, setConceptionGoal] = useState<string>("Actively Trying Now");
  const [wellnessFocus, setWellnessFocus] = useState<string[]>([
    "Folate & Prenatal Multivitamins",
    "Fertile Window Calculation",
    "Preconception Ragas & Stress Relief",
  ]);

  const GOALS = [
    { title: "Actively Trying Now", desc: "Optimize fertile window & track ovulation for conception." },
    { title: "Planning in 3-6 Months", desc: "Build maternal nutrition & hormonal balance beforehand." },
    { title: "General Preconception Wellness", desc: "Explore Garbha Sanskar preconception raga therapy & diet." },
  ];

  const FOCUS_OPTIONS = [
    "Folate & Prenatal Multivitamins",
    "Fertile Window Calculation",
    "Hormonal & Thyroid Health",
    "Preconception Ragas & Stress Relief",
    "Diet & Detoxification (Sattvic)",
    "Pelvic Strengthening Exercises",
  ];

  const toggleFocus = (item: string) => {
    setWellnessFocus((prev) =>
      prev.includes(item) ? prev.filter((f) => f !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      lastPeriodDate,
      cycleLengthDays,
      isCycleRegular,
      conceptionGoal,
      wellnessFocus,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#FFF0F5] via-[#FFF7F9] to-[#F5E6EC] dark:from-[#120E18] dark:via-[#1A1424] dark:to-[#22172A] text-gray-900 dark:text-rose-100">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl bg-white/90 dark:bg-[#1A1523]/90 backdrop-blur-xl p-6 sm:p-8 rounded-[36px] border border-rose-100 dark:border-rose-900/40 shadow-2xl shadow-rose-200/50 dark:shadow-none space-y-6"
      >
        <ProgressHeader
          currentStep={2}
          totalSteps={4}
          title="🌱 Preconception & Cycle Personalization"
          onBack={onBack}
        />

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Cycle & Period Section */}
          <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 space-y-4">
            <h3 className="font-serif text-base font-bold text-gray-900 dark:text-rose-100 flex items-center gap-2">
              <Flower2 className="w-4 h-4 text-emerald-500" />
              <span>Cycle & Fertility Baseline</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 dark:text-rose-300 mb-1">
                  Last Menstrual Period (LMP)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={lastPeriodDate}
                    onChange={(e) => setLastPeriodDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white dark:bg-[#15111C] border border-emerald-200 dark:border-emerald-900/40 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-rose-300 mb-1">
                  Average Cycle Length: <span className="text-emerald-600 font-extrabold">{cycleLengthDays} Days</span>
                </label>
                <input
                  type="range"
                  min={21}
                  max={35}
                  value={cycleLengthDays}
                  onChange={(e) => setCycleLengthDays(parseInt(e.target.value) || 28)}
                  className="w-full accent-emerald-500 mt-2"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-semibold px-1">
                  <span>21 days</span>
                  <span>28 days (Avg)</span>
                  <span>35 days</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-rose-300 mb-1.5">
                Is your cycle generally regular?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsCycleRegular(true)}
                  className={`py-2.5 rounded-xl font-bold border transition-all ${
                    isCycleRegular
                      ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                      : "bg-white dark:bg-[#15111C] text-gray-700 dark:text-rose-200 border-gray-200 dark:border-gray-800"
                  }`}
                >
                  ✓ Yes, Regular (~{cycleLengthDays} days)
                </button>
                <button
                  type="button"
                  onClick={() => setIsCycleRegular(false)}
                  className={`py-2.5 rounded-xl font-bold border transition-all ${
                    !isCycleRegular
                      ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                      : "bg-white dark:bg-[#15111C] text-gray-700 dark:text-rose-200 border-gray-200 dark:border-gray-800"
                  }`}
                >
                  Varied / Irregular
                </button>
              </div>
            </div>
          </div>

          {/* Planning Goal */}
          <div className="space-y-2">
            <label className="block font-bold text-gray-700 dark:text-rose-300">
              What is your current pregnancy planning goal?
            </label>
            <div className="space-y-2">
              {GOALS.map((g) => (
                <div
                  key={g.title}
                  onClick={() => setConceptionGoal(g.title)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    conceptionGoal === g.title
                      ? "bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-700 shadow-sm"
                      : "bg-white dark:bg-[#15111C] border-gray-200 dark:border-gray-800 hover:border-rose-200"
                  }`}
                >
                  <div>
                    <div className="font-bold text-gray-900 dark:text-rose-100">{g.title}</div>
                    <div className="text-[11px] text-gray-500 dark:text-rose-300 mt-0.5">{g.desc}</div>
                  </div>
                  {conceptionGoal === g.title && <Check className="w-4 h-4 text-rose-500" />}
                </div>
              ))}
            </div>
          </div>

          {/* Wellness Focus Chips */}
          <div className="space-y-2">
            <label className="block font-bold text-gray-700 dark:text-rose-300">
              Select wellness topics to feature on your Preconception Dashboard:
            </label>
            <div className="flex flex-wrap gap-2">
              {FOCUS_OPTIONS.map((item) => {
                const isSelected = wellnessFocus.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleFocus(item)}
                    className={`px-3 py-1.5 rounded-full font-bold border transition-all ${
                      isSelected
                        ? "bg-rose-500 text-white border-rose-600 shadow-xs"
                        : "bg-white dark:bg-[#15111C] text-gray-700 dark:text-rose-200 border-gray-200 dark:border-gray-800 hover:border-rose-300"
                    }`}
                  >
                    {isSelected ? `✓ ${item}` : `+ ${item}`}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 hover:from-rose-600 hover:to-purple-600 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <span>Next: Medical Report Check</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

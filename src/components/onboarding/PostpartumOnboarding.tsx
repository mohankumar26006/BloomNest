import React, { useState } from "react";
import { motion } from "motion/react";
import { PostpartumDetails } from "../../types";
import { ProgressHeader } from "./ProgressHeader";
import { Heart, Baby, Calendar, Sparkles, ArrowRight, Check } from "lucide-react";

interface PostpartumOnboardingProps {
  onNext: (details: PostpartumDetails) => void;
  onBack: () => void;
}

export const PostpartumOnboarding: React.FC<PostpartumOnboardingProps> = ({
  onNext,
  onBack,
}) => {
  const [babyDob, setBabyDob] = useState<string>("2026-07-10");
  const [babyName, setBabyName] = useState<string>("Aarav / Ananya");
  const [babyGender, setBabyGender] = useState<"Boy" | "Girl" | "Surprise">("Girl");
  const [recoveryGoals, setRecoveryGoals] = useState<string[]>([
    "Maternal Recovery & Pelvic Floor Healing",
    "Breastfeeding & Lactation Support",
    "Infant Growth & Milestones",
    "Immunization & Vaccine Schedule",
  ]);

  const GOAL_CARDS = [
    { title: "Maternal Recovery & Pelvic Floor Healing", desc: "Track lochia, incision recovery & pelvic strengthening exercises." },
    { title: "Breastfeeding & Lactation Support", desc: "Lactation timers, side logging & milk storage tracker." },
    { title: "Infant Growth & Milestones", desc: "WHO percentiles for weight, height & motor skill development." },
    { title: "Immunization & Vaccine Schedule", desc: "WHO & ACVIP milestone notifications for your newborn." },
    { title: "Baby Sleep & Care Routine", desc: "Sleep pattern logs and diaper/care activity tracking." },
    { title: "Postpartum Mental Wellness", desc: "EPDS mood check-ins and postpartum bonding tools." },
  ];

  const toggleGoal = (title: string) => {
    setRecoveryGoals((prev) =>
      prev.includes(title) ? prev.filter((g) => g !== title) : [...prev, title]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      babyDob,
      babyName,
      babyGender,
      recoveryGoals,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#FFF7F9] dark:bg-[#120E18] text-gray-900 dark:text-rose-100">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl bg-white/90 dark:bg-[#1A1523]/90 p-6 sm:p-8 rounded-2xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-6"
      >
        <ProgressHeader
          currentStep={2}
          totalSteps={4}
          title="Postpartum Recovery & Baby Care"
          onBack={onBack}
        />

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Baby Info Card */}
          <div className="bg-purple-50/50 dark:bg-purple-950/20 p-5 rounded-3xl border border-purple-100 dark:border-purple-900/30 space-y-4">
            <h3 className="font-serif text-base font-bold text-gray-900 dark:text-rose-100 flex items-center gap-2">
              <Baby className="w-5 h-5 text-purple-500" />
              <span>Baby Details & Arrival</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 dark:text-rose-300 mb-1">
                  Baby Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={babyDob}
                    onChange={(e) => setBabyDob(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white dark:bg-[#15111C] border border-purple-200 dark:border-purple-900/40 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-rose-300 mb-1">
                  Baby Name / Nickname
                </label>
                <input
                  type="text"
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                  placeholder="Baby Ananya"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-[#15111C] border border-purple-200 dark:border-purple-900/40 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-rose-300 mb-1.5">
                Baby Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["Girl", "Boy", "Surprise"] as const).map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => setBabyGender(gender)}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      babyGender === gender
                        ? "bg-purple-600 text-white border-purple-700 shadow-sm"
                        : "bg-white dark:bg-[#15111C] text-gray-700 dark:text-rose-200 border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    {gender === "Girl" ? "Girl" : gender === "Boy" ? "Boy" : "Surprise"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recovery & Care Focus */}
          <div className="space-y-2">
            <label className="block font-bold text-gray-700 dark:text-rose-300">
              Select your postpartum & infant care goals:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GOAL_CARDS.map((g) => {
                const isSelected = recoveryGoals.includes(g.title);
                return (
                  <div
                    key={g.title}
                    onClick={() => toggleGoal(g.title)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                      isSelected
                        ? "bg-purple-50 dark:bg-purple-950/60 border-purple-400 dark:border-purple-700 shadow-xs"
                        : "bg-white dark:bg-[#15111C] border-gray-200 dark:border-gray-800 hover:border-purple-200"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-gray-900 dark:text-rose-100">{g.title}</div>
                      <div className="text-[10px] text-gray-500 dark:text-rose-300 mt-0.5">{g.desc}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all"
          >
            <span>Next: Medical Report Check</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

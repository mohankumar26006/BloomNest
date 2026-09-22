import React, { useState } from "react";
import { motion } from "motion/react";
import { JourneyStage } from "../../types";
import { Sparkles, ArrowRight, CheckCircle2, Heart, Baby, Flower2 } from "lucide-react";

interface JourneySelectionScreenProps {
  onSelectJourney: (journey: JourneyStage) => void;
}

export const JourneySelectionScreen: React.FC<JourneySelectionScreenProps> = ({
  onSelectJourney,
}) => {
  const [selected, setSelected] = useState<JourneyStage>("PREGNANCY");

  const JOURNEYS: {
    id: JourneyStage;
    badge: string;
    status: "active" | "coming_soon";
    icon: React.ReactNode;
    title: string;
    description: string;
    highlights: string[];
    gradient: string;
  }[] = [
    {
      id: "PRE_PREGNANCY",
      badge: "🌱 Preconception (Coming Soon)",
      status: "coming_soon",
      icon: <Flower2 className="w-8 h-8 text-emerald-500" />,
      title: "Planning for Pregnancy",
      description: "Planned for future release: Preconception counseling, cycle logs, and fertility window tracking.",
      highlights: ["Cycle & Ovulation", "Folate & Diet Prep", "Preconception Ragas"],
      gradient: "from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-200 dark:border-emerald-900/40 opacity-80",
    },
    {
      id: "PREGNANCY",
      badge: "🤰 Active Module · Full AI Personalization",
      status: "active",
      icon: <Baby className="w-8 h-8 text-rose-500" />,
      title: "Currently Pregnant",
      description: "Fully active with BloomScan OCR report extraction, personalized weekly fetal timeline, vitals calibration, and AI guidance.",
      highlights: ["Medical Report OCR", "Calibrated Weekly Timeline", "Baseline Vitals Sync", "OB-GYN Team Link"],
      gradient: "from-rose-500/15 via-pink-500/10 to-transparent border-rose-300 dark:border-rose-800",
    },
    {
      id: "POST_PREGNANCY",
      badge: "🌷 Postpartum (Coming Soon)",
      status: "coming_soon",
      icon: <Heart className="w-8 h-8 text-purple-500" />,
      title: "Recently Had a Baby",
      description: "Planned for future release: Postpartum fourth trimester recovery, lactation logs, and newborn milestones.",
      highlights: ["Fourth Trimester Healing", "Feeding & Pumping Log", "Infant Growth Curves"],
      gradient: "from-purple-500/10 via-indigo-500/5 to-transparent border-purple-200 dark:border-purple-900/40 opacity-80",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#FFF0F5] via-[#FFF7F9] to-[#F5E6EC] dark:from-[#120E18] dark:via-[#1A1424] dark:to-[#22172A] text-gray-900 dark:text-rose-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl bg-white/80 dark:bg-[#1A1523]/80 backdrop-blur-xl p-6 sm:p-10 rounded-[36px] border border-rose-100 dark:border-rose-900/40 shadow-2xl shadow-rose-200/50 dark:shadow-none space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-xs font-bold uppercase tracking-wider border border-rose-100 dark:border-rose-900/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Select Your Motherhood Stage</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-rose-100">
            Where are you in your motherhood journey?
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-rose-300">
            BloomNest dynamically customizes your dashboard, tracking tools, and AI insights to match your current phase.
          </p>
        </div>

        {/* 3 Interactive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {JOURNEYS.map((item) => {
            const isSelected = selected === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelected(item.id)}
                className={`p-6 rounded-[28px] border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden bg-gradient-to-b ${
                  item.gradient
                } ${
                  isSelected
                    ? "border-rose-500 shadow-xl ring-4 ring-rose-400/20 bg-white dark:bg-[#20192B]"
                    : "border-rose-100/70 dark:border-rose-900/30 bg-white/60 dark:bg-[#16111E]/60 hover:border-rose-300"
                }`}
              >
                {/* Selection Badge */}
                {isSelected && (
                  <div className="absolute top-4 right-4 text-rose-500">
                    <CheckCircle2 className="w-6 h-6 fill-rose-500 text-white" />
                  </div>
                )}

                <div className="space-y-3">
                  <span className="inline-block text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 border border-rose-100 dark:border-rose-900/40">
                    {item.badge}
                  </span>

                  <div className="p-3 w-fit rounded-2xl bg-rose-50/80 dark:bg-rose-950/50">
                    {item.icon}
                  </div>

                  <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-rose-100">
                    {item.title}
                  </h3>

                  <p className="text-xs text-gray-600 dark:text-rose-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-black/5 dark:border-white/5 text-[11px]">
                  <div className="font-bold text-gray-400 dark:text-gray-500 uppercase text-[10px]">Key Focus Areas:</div>
                  <div className="flex flex-wrap gap-1">
                    {item.highlights.map((h, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white/80 dark:bg-black/40 text-gray-700 dark:text-rose-200 border border-black/5 dark:border-white/5 font-medium"
                      >
                        · {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-2 text-center max-w-xs mx-auto">
          <button
            onClick={() => onSelectJourney(selected)}
            className={`w-full py-4 rounded-2xl text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] ${
              selected === "PRE_PREGNANCY"
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30"
                : "bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 hover:from-rose-600 hover:to-purple-600 shadow-rose-300/40"
            }`}
          >
            <span>{selected === "PRE_PREGNANCY" ? "🌱 Enter Pre-Pregnancy App" : "Continue to Pregnancy Suite"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

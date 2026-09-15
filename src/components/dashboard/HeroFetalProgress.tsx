import React from "react";
import { PageView } from "../../types";
import { Card } from "../ui/Card";
import { ProgressRing } from "../ui/ProgressRing";
import { Heart, ChevronRight, Sparkles } from "lucide-react";

// Asset Images
import pastelMotherArt from "../../assets/images/pastel_mother_art_1785746033662.jpg";
import cornCobArt from "../../assets/images/corn_cob_art_1785746048803.jpg";
import { PREGNANCY_WEEKS_DATA } from "../../data/pregnancyWeeksData";

interface HeroFetalProgressProps {
  currentWeek: number;
  trimester: number;
  daysRemaining: number;
  progressPercent: number;
  onNavigate: (page: PageView) => void;
  t: (key: string, options?: any) => string;
}

export const HeroFetalProgress: React.FC<HeroFetalProgressProps> = ({
  currentWeek,
  trimester,
  daysRemaining,
  progressPercent,
  onNavigate,
  t,
}) => {
  const safeWeek = Math.min(40, Math.max(1, currentWeek || 20));
  const weekDetail = PREGNANCY_WEEKS_DATA[safeWeek - 1];
  const babySize = weekDetail?.babySize || {
    name: "Corn Cob",
    length: "35.6 cm",
    weight: "760 g",
    emoji: "🌽",
    indianComparison: "Bhutta",
  };
  return (
    <Card
      variant="gradient"
      radius="3xl"
      className="p-5 sm:p-6 space-y-5 relative overflow-hidden"
    >
      {/* Upper Grid: Progress Ring + Days Remaining + Artwork */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4 shrink-0">
          <ProgressRing
            percentage={progressPercent}
            size={110}
            strokeWidth={10}
            label={t("complete")}
          />

          <div className="space-y-0.5 text-center sm:text-left">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#8f2d48] dark:text-rose-200">
              {daysRemaining} {t("days")}
            </div>
            <div className="text-xs font-bold text-[#b84a6b] dark:text-rose-300 flex items-center justify-center sm:justify-start gap-1">
              <span>{t("remaining")}</span>
              <Heart className="w-3.5 h-3.5 fill-current text-rose-500 inline" />
            </div>
          </div>
        </div>

        {/* Soft Mother Artwork */}
        <div className="relative shrink-0 flex items-center justify-center">
          <img
            src={pastelMotherArt}
            alt="Pregnant Mother Watercolor Art"
            className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-2xl drop-shadow-xs hover:scale-105 transition-transform"
          />
        </div>
      </div>

      {/* Lower Banner: Integrated Baby Size HUD -> Baby Development */}
      <div
        onClick={() => onNavigate("baby-development")}
        className="bg-white/90 dark:bg-[#1a1423]/90 backdrop-blur-md rounded-2xl p-4 border border-[#f5cad6] dark:border-rose-900/50 shadow-xs hover:shadow-md transition-all flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-3.5">
          {safeWeek === 24 ? (
            <img
              src={cornCobArt}
              alt="Size of Corn Cob"
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 p-1 border border-amber-100 dark:border-amber-900/40 shrink-0 group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <span>{babySize.emoji}</span>
            </div>
          )}
          <div>
            <div className="text-[11px] font-extrabold text-gray-400 dark:text-rose-300/60 uppercase tracking-wider flex items-center gap-1">
              <span>{t("babyToday")}</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-base sm:text-lg font-bold font-serif text-gray-900 dark:text-rose-100">
              Size of {babySize.name}
              {babySize.indianComparison && (
                <span className="text-xs font-sans font-medium text-rose-500 dark:text-rose-300 ml-1.5">
                  ({babySize.indianComparison})
                </span>
              )}
            </div>
            <div className="text-xs font-semibold text-[#b84a6b] dark:text-rose-300">
              Week {safeWeek} · {babySize.length} | {babySize.weight}
            </div>
          </div>
        </div>

        <div className="w-9 h-9 rounded-full bg-[#fce8ee] dark:bg-rose-950/60 text-[#b84a6b] dark:text-rose-300 flex items-center justify-center group-hover:bg-[#f8d0dc] transition-colors shrink-0">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
};

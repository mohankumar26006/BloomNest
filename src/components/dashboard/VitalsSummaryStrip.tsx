import React from "react";
import { HealthVital, PageView } from "../../types";
import { Card } from "../ui/Card";
import { Droplets, Scale, Smile, Heart, Activity } from "lucide-react";

interface VitalsSummaryStripProps {
  todayVital?: Partial<HealthVital>;
  selectedMood: string;
  onNavigate: (page: PageView) => void;
  t: (key: string, options?: any) => string;
}

export const VitalsSummaryStrip: React.FC<VitalsSummaryStripProps> = ({
  todayVital,
  selectedMood,
  onNavigate,
  t,
}) => {
  const waterLiters = todayVital?.waterMl ? (todayVital.waterMl / 1000).toFixed(1) : "0.0";
  const weightDisplay = todayVital?.weightKg ? `${todayVital.weightKg} kg` : "--";
  const kicks = todayVital?.babyKicksCount !== undefined ? todayVital.babyKicksCount : 0;
  const bpStatus = todayVital?.evaluation?.bp?.status || (
    todayVital?.systolicBp && todayVital?.diastolicBp
      ? (todayVital.systolicBp > 120 || todayVital.diastolicBp > 80 || todayVital.systolicBp < 90 || todayVital.diastolicBp < 60 ? "ATTENTION" : "NORMAL")
      : "NORMAL"
  );
  const bpText = todayVital?.systolicBp && todayVital?.diastolicBp
    ? `${todayVital.systolicBp}/${todayVital.diastolicBp}`
    : "120/80";

  return (
    <div className="space-y-2.5">
      <div className="text-xs font-bold text-gray-900 dark:text-rose-100 font-serif">
        {t("todaysWellnessVitals")}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Blood Pressure & Status */}
        <Card
          variant="glass"
          radius="2xl"
          isHoverable
          onClick={() => onNavigate("health-tracker")}
          className={`p-3.5 text-center flex flex-col items-center justify-between space-y-1 ${
            bpStatus === "SEVERE"
              ? "bg-rose-50/90 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800"
              : bpStatus === "HIGH"
              ? "bg-orange-50/90 dark:bg-orange-950/60 border-orange-300 dark:border-orange-800"
              : bpStatus === "ATTENTION"
              ? "bg-amber-50/90 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800"
              : "bg-rose-50/70 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/40"
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-semibold text-gray-500 dark:text-rose-200/70">
            Blood Pressure
          </div>
          <div className="text-sm font-bold text-gray-900 dark:text-rose-100">
            {bpText} <span className="text-[10px] font-normal text-gray-400">mmHg</span>
          </div>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
            bpStatus === "NORMAL"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : bpStatus === "ATTENTION"
              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              : bpStatus === "HIGH"
              ? "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300"
              : "bg-rose-600 text-white"
          }`}>
            {bpStatus === "NORMAL" ? "Target" : bpStatus}
          </span>
        </Card>
        {/* Water / Hydration */}
        <Card
          variant="glass"
          radius="2xl"
          isHoverable
          onClick={() => onNavigate("health-tracker")}
          className="p-3.5 text-center flex flex-col items-center justify-between space-y-1 bg-[#f0f7ff]/80 dark:bg-[#121c2e]/80 border-blue-100 dark:border-blue-900/40"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center">
            <Droplets className="w-4 h-4 fill-current" />
          </div>
          <div className="text-[11px] font-semibold text-gray-500 dark:text-blue-200/70">
            {t("hydration")}
          </div>
          <div className="text-base font-bold text-gray-900 dark:text-blue-100">
            {waterLiters} L
          </div>
        </Card>

        {/* Weight */}
        <Card
          variant="glass"
          radius="2xl"
          isHoverable
          onClick={() => onNavigate("health-tracker")}
          className="p-3.5 text-center flex flex-col items-center justify-between space-y-1 bg-[#f0fdf4]/80 dark:bg-[#11241a]/80 border-emerald-100 dark:border-emerald-900/40"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-semibold text-gray-500 dark:text-emerald-200/70">
            {t("weight")}
          </div>
          <div className="text-base font-bold text-gray-900 dark:text-emerald-100">
            {weightDisplay}
          </div>
        </Card>

        {/* Mood */}
        <Card
          variant="glass"
          radius="2xl"
          isHoverable
          onClick={() => onNavigate("mood-tracker")}
          className="p-3.5 text-center flex flex-col items-center justify-between space-y-1 bg-[#fffbeb]/80 dark:bg-[#262014]/80 border-amber-100 dark:border-amber-900/40"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 flex items-center justify-center">
            <Smile className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-semibold text-gray-500 dark:text-amber-200/70">
            {t("mood")}
          </div>
          <div className="text-base font-bold text-gray-900 dark:text-amber-100 capitalize">
            {selectedMood}
          </div>
        </Card>

        {/* Baby Kicks */}
        <Card
          variant="glass"
          radius="2xl"
          isHoverable
          onClick={() => onNavigate("kick-counter")}
          className="p-3.5 text-center flex flex-col items-center justify-between space-y-1 bg-[#fcf0f3]/80 dark:bg-[#2b1422]/80 border-pink-100 dark:border-pink-900/40"
        >
          <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300 flex items-center justify-center">
            <Heart className="w-4 h-4 fill-current" />
          </div>
          <div className="text-[11px] font-semibold text-gray-500 dark:text-pink-200/70">
            {t("babyKicks")}
          </div>
          <div className="text-base font-bold text-gray-900 dark:text-pink-100">
            {kicks}
          </div>
        </Card>
      </div>
    </div>
  );
};

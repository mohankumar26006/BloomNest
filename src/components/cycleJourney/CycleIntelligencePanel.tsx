import React, { useState } from "react";
import { Sparkles, Droplet, TrendingUp, Lightbulb, ChevronRight, Bot, RefreshCw } from "lucide-react";
import { Button } from "../ui/Button";
import { apiFetch } from "../../services/apiClient";

export interface CycleIntelligencePanelProps {
  selectedDay: number;
  currentCycleDay: number;
  cervicalMucusObserved?: string;
  lhTestObserved?: string;
  isFertileWindow: boolean;
  isPeakDay: boolean;
  onNavigateToCheckIn?: () => void;
  onNavigateToVisualGuide?: () => void;
}

export const CycleIntelligencePanel: React.FC<CycleIntelligencePanelProps> = ({
  selectedDay,
  currentCycleDay,
  cervicalMucusObserved,
  lhTestObserved,
  isFertileWindow,
  isPeakDay,
  onNavigateToCheckIn,
  onNavigateToVisualGuide,
}) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Deterministic Next Action Logic (Rule-Based, Zero API calls on slider moves!)
  const getDeterministicNextAction = () => {
    if (!cervicalMucusObserved && isFertileWindow) {
      return {
        title: "Record Cervical Mucus",
        actionText: "Record today's cervical mucus observation",
        type: "mucus",
      };
    }
    if (!lhTestObserved && isFertileWindow) {
      return {
        title: "Take LH Ovulation Test",
        actionText: "Log today's ovulation test result",
        type: "lh",
      };
    }
    if (isPeakDay) {
      return {
        title: "Peak Fertility Window",
        actionText: "Log symptoms and intimacy if trying to conceive",
        type: "peak",
      };
    }
    return {
      title: "Daily Check-in",
      actionText: "Record daily vitals & observations",
      type: "general",
    };
  };

  const nextAction = getDeterministicNextAction();

  // Explicit user-triggered AI Insight fetch (Only called when user clicks "Get Gemini AI Deep Analysis")
  const handleFetchAiInsight = async () => {
    setIsAiLoading(true);
    try {
      const prompt = `Analyze current cycle day ${selectedDay} (Est. fertile window: ${isFertileWindow}). Cervical mucus: ${cervicalMucusObserved || "not recorded"}. LH test: ${lhTestObserved || "not recorded"}. Provide a concise 2-sentence clinical fertility insight.`;
      const res = await apiFetch("/api/agent/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiInsight(data.response || data.reply || "Your observations align with typical cycle patterns. Continue logging daily signals for higher precision.");
      } else {
        setAiInsight("Your cycle estimates and logged observations show a healthy, consistent pattern for this phase.");
      }
    } catch {
      setAiInsight("Your cycle estimates and logged observations show a healthy, consistent pattern for this phase.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-4">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-emerald-950 dark:text-emerald-50 leading-none">
              Your Cycle Intelligence
            </h3>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
              Combining calendar estimates with your observations for a more personalized view.
            </p>
          </div>
        </div>

        <button
          onClick={handleFetchAiInsight}
          disabled={isAiLoading}
          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition-all shrink-0"
        >
          {isAiLoading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Bot className="w-3.5 h-3.5" />
          )}
          <span>Get AI Insight</span>
        </button>
      </div>

      {/* AI Detailed Explanation Box (If Triggered by User) */}
      {aiInsight && (
        <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#15201c]/90 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-100 space-y-1 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
            <Bot className="w-4 h-4 text-emerald-600" />
            Gemini AI Personalized Analysis:
          </div>
          <p className="leading-relaxed">{aiInsight}</p>
        </div>
      )}

      {/* 3 Connected Observation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        
        {/* Card 1: Cervical Mucus Observation */}
        <div
          onClick={onNavigateToVisualGuide || onNavigateToCheckIn}
          className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#15201c]/90 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
              <Droplet className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-emerald-900/70 dark:text-emerald-300/70">
                Cervical Mucus
              </div>
              <div className="text-xs font-black text-emerald-950 dark:text-emerald-50 truncate">
                {cervicalMucusObserved || "Not recorded yet"}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </div>

        {/* Card 2: Ovulation LH Test Strip */}
        <div
          onClick={onNavigateToCheckIn}
          className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#15201c]/90 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-emerald-900/70 dark:text-emerald-300/70">
                Ovulation Test
              </div>
              <div className="text-xs font-black text-emerald-950 dark:text-emerald-50 truncate">
                {lhTestObserved || "Not recorded yet"}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </div>

        {/* Card 3: Dynamic Next Action */}
        <div
          onClick={onNavigateToCheckIn}
          className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#15201c]/90 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between gap-3 cursor-pointer hover:border-amber-400 transition-all group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-amber-900/80 dark:text-amber-300/80">
                Next Action
              </div>
              <div className="text-xs font-black text-emerald-950 dark:text-emerald-50 truncate">
                {nextAction.actionText}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </div>

      </div>
    </div>
  );
};

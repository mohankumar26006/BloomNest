import React, { useState } from "react";
import { PageView } from "../../types";
import { Card } from "../ui/Card";
import { Bot, ArrowRight, Sparkles } from "lucide-react";

interface BloomAIInsightCardProps {
  currentWeek: number;
  onNavigate: (page: PageView) => void;
  t: (key: string, options?: any) => string;
}

export const BloomAIInsightCard: React.FC<BloomAIInsightCardProps> = ({
  currentWeek,
  onNavigate,
  t,
}) => {
  const [quickInput, setQuickInput] = useState("");

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onNavigate("ai-assistant");
  };

  return (
    <Card
      variant="gradient"
      radius="3xl"
      className="p-5 space-y-3.5 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 dark:from-[#21112b] dark:via-[#28132d] dark:to-[#2e152e] border-purple-150 dark:border-purple-900/50"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1">
              <span>{t("aiMamaCompanion")}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-[11px] text-gray-500 dark:text-rose-300/70">
              {t("multilingualAssistant")}
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate("ai-assistant")}
          className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:text-pink-700 flex items-center gap-1"
        >
          <span>{t("askAi")}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Weekly Clinical Insight Note */}
      <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#130d1b]/80 border border-purple-100 dark:border-purple-900/40 text-xs font-medium text-gray-700 dark:text-rose-200 leading-relaxed">
        🌸 <strong>Week {currentWeek} Clinical Insight:</strong> Your baby's hearing is active this week. Listening to peaceful Garbha Sanskar ragas can promote maternal relaxation and baby bonding.
      </div>

      <form onSubmit={handleQuickSubmit} className="flex gap-2">
        <input
          type="text"
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
          placeholder={t("aiPlaceholder")}
          className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#130d1b] border border-pink-200 dark:border-rose-900/60 text-xs text-gray-800 dark:text-rose-100 placeholder-gray-400 dark:placeholder-rose-300/40 focus:outline-none focus:ring-2 focus:ring-pink-300 min-h-[44px]"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md transition-colors shrink-0 min-h-[44px]"
        >
          {t("ask")}
        </button>
      </form>
    </Card>
  );
};

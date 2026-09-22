import React, { useState } from "react";
import { PageView } from "../../types";
import { Card } from "../ui/Card";
import { Bot, ArrowRight } from "lucide-react";

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
      className="p-5 space-y-3.5 bg-purple-50/70 dark:bg-[#21112b] border-purple-200/70 dark:border-purple-900/50"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1">
              <span>{t("aiMamaCompanion")}</span>
            </div>
            <div className="text-[11px] text-gray-500 dark:text-rose-300/70">
              {t("multilingualAssistant")}
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate("ai-assistant")}
          className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1"
        >
          <span>{t("askAi")}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Weekly Clinical Insight Note */}
      <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#130d1b]/80 border border-purple-100 dark:border-purple-900/40 text-xs font-medium text-gray-700 dark:text-rose-200 leading-relaxed">
        <strong>Week {currentWeek} Clinical Insight:</strong> Your baby's hearing is active this week. Listening to peaceful Garbha Sanskar ragas can promote maternal relaxation and baby bonding.
      </div>

      <form onSubmit={handleQuickSubmit} className="flex gap-2">
        <input
          type="text"
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
          placeholder={t("aiPlaceholder")}
          className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#130d1b] border border-purple-200 dark:border-purple-900/60 text-xs text-gray-800 dark:text-rose-100 placeholder-gray-400 dark:placeholder-rose-300/40 focus:outline-none focus:ring-2 focus:ring-purple-300 min-h-[44px]"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-colors shrink-0 min-h-[44px]"
        >
          {t("ask")}
        </button>
      </form>
    </Card>
  );
};

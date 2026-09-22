import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { CheckCircle2, Circle, ShieldCheck, Briefcase, FileText, PhoneCall, Stethoscope, Car, Sparkles, AlertCircle } from "lucide-react";

interface ChecklistItem {
  id: string;
  category: "bag" | "plan" | "contacts" | "reports" | "appointments" | "vaccines" | "documents";
  titleKey: string;
  descKey: string;
  isDone: boolean;
}

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: "c1", category: "bag", titleKey: "birthCheck1Title", descKey: "birthCheck1Desc", isDone: true },
  { id: "c2", category: "plan", titleKey: "birthCheck2Title", descKey: "birthCheck2Desc", isDone: true },
  { id: "c3", category: "contacts", titleKey: "birthCheck3Title", descKey: "birthCheck3Desc", isDone: true },
  { id: "c4", category: "reports", titleKey: "birthCheck4Title", descKey: "birthCheck4Desc", isDone: true },
  { id: "c5", category: "documents", titleKey: "birthCheck5Title", descKey: "birthCheck5Desc", isDone: false },
  { id: "c6", category: "vaccines", titleKey: "birthCheck6Title", descKey: "birthCheck6Desc", isDone: true },
  { id: "c7", category: "contacts", titleKey: "birthCheck7Title", descKey: "birthCheck7Desc", isDone: false },
];

export const BirthReadinessPage: React.FC = () => {
  const { user, showToast, t } = useApp();
  const storageKey = `bloomnest_birth_readiness_v1_${user?.id || "guest"}`;

  const [items, setItems] = useState<ChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === INITIAL_CHECKLIST.length) {
          return parsed;
        }
      }
    } catch (e) {}
    return INITIAL_CHECKLIST;
  });

  const completedCount = items.filter((i) => i.isDone).length;
  const totalCount = items.length;
  const readinessPercent = Math.round((completedCount / totalCount) * 100);

  const toggleItem = (id: string) => {
    setItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          const isDone = !item.isDone;
          showToast(isDone ? t("markedComplete", { title: t(item.titleKey) }) : t("pendingItem", { title: t(item.titleKey) }));
          return { ...item, isDone };
        }
        return item;
      });
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-100 dark:border-rose-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>{t("laborDeliveryPrep")}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            {t("birthReadinessTitle")}
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
            {t("birthReadinessSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white p-4 rounded-2xl shadow-md shrink-0">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-rose-200">{t("overallScore")}</div>
            <div className="font-serif text-2xl font-extrabold">{readinessPercent}%</div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center font-bold text-xs bg-white/10">
            {completedCount}/{totalCount}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-gray-900 dark:text-rose-100">
          <span>{t("deliveryReadinessGauge")}</span>
          <span className="text-rose-500 font-extrabold">{t("readinessPercent", { pct: readinessPercent })}</span>
        </div>

        <div className="w-full bg-rose-100 dark:bg-rose-950/50 h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-rose-500 to-rose-600 h-full rounded-full transition-all duration-700"
            style={{ width: `${readinessPercent}%` }}
          />
        </div>

        <p className="text-xs text-gray-500 dark:text-rose-300">
          {readinessPercent >= 80 ? t("readinessExcellent") : t("readinessKeepGoing")}
        </p>
      </div>

      {/* Checklist Grid */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
              item.isDone
                ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-gray-800 dark:text-rose-200"
                : "bg-white dark:bg-[#1a1523] border-rose-100 dark:border-rose-900/40 text-gray-900 dark:text-rose-100 hover:border-rose-300"
            }`}
          >
            <button className="mt-0.5 shrink-0">
              {item.isDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-current text-white" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400" />
              )}
            </button>

            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <span className={`font-bold text-sm ${item.isDone ? "line-through opacity-75" : ""}`}>
                  {t(item.titleKey)}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    item.isDone
                      ? "bg-emerald-200 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200"
                      : "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300"
                  }`}
                >
                  {item.isDone ? t("completed") : t("pendingAction")}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-rose-300">{t(item.descKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

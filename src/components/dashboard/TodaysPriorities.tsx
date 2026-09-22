import React from "react";
import { Medicine, PageView } from "../../types";
import { Card } from "../ui/Card";
import { CardHeading } from "../ui/Typography";
import { EmptyState } from "../ui/EmptyState";
import { Pill, CheckCircle2, Sparkles, Heart } from "lucide-react";

interface TodaysPrioritiesProps {
  medicines: Medicine[];
  onToggleMedicine: (id: number) => void;
  onNavigate: (page: PageView) => void;
  t: (key: string, options?: any) => string;
}

export const TodaysPriorities: React.FC<TodaysPrioritiesProps> = ({
  medicines,
  onToggleMedicine,
  onNavigate,
  t,
}) => {
  const pendingMedicines = medicines.filter((m) => !m.isTakenToday).slice(0, 2);

  return (
    <Card variant="glass" radius="3xl" className="p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/40 pb-3">
        <CardHeading className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-500" />
          <span>{t("todaysMedicines")}</span>
        </CardHeading>
        <button
          onClick={() => onNavigate("medicines")}
          className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
        >
          {t("manage")} →
        </button>
      </div>

      {medicines.length === 0 ? (
        <EmptyState
          title="No Medications Logged"
          description="Track your daily prenatal vitamins and folic acid intake."
          actionLabel="Add Medicine"
          onAction={() => onNavigate("medicines")}
        />
      ) : pendingMedicines.length === 0 ? (
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-white" />
            <span>All Medications Taken Today!</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Great job keeping up with your prenatal health routine.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {pendingMedicines.map((med) => (
            <div
              key={med.id}
              onClick={() => onToggleMedicine(med.id)}
              className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 hover:border-rose-300 flex items-center justify-between cursor-pointer transition-all min-h-[44px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center shrink-0">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-gray-900 dark:text-rose-100">
                    {med.name}
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-rose-300">
                    {med.dosage} • {med.time || med.frequency || "Scheduled"}
                  </div>
                </div>
              </div>

              <CheckCircle2 className="w-5 h-5 text-gray-300 dark:text-rose-800 shrink-0" />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

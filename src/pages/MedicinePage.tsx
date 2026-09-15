import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Pill, CheckCircle2, Plus, Clock, AlertCircle, Sparkles } from "lucide-react";

export const MedicinePage: React.FC = () => {
  const { medicines, toggleMedicineTaken, addMedicine, t } = useApp();

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("09:00 AM");
  const [frequency, setFrequency] = useState("Daily after Breakfast");
  const [notes, setNotes] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addMedicine({
      name,
      dosage: dosage || "1 Tablet",
      time,
      frequency,
      notes,
    });
    setName("");
    setDosage("");
    setNotes("");
  };

  const takenCount = medicines.filter((m) => m.isTakenToday).length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <Pill className="w-4 h-4" />
            <span>{t("prenatalSupplementSchedule")}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            {t("medicineTrackerTitle")}
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
            {t("medicineTrackerSubtitle")}
          </p>
        </div>

        {/* Adherence Streak Banner */}
        <div className="px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>
            {t("medicineTakenCount", { taken: takenCount, total: medicines.length })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Schedule List */}
        <div className="lg:col-span-2 space-y-4">
          {medicines.map((med) => (
            <div
              key={med.id}
              onClick={() => toggleMedicineTaken(med.id)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${
                med.isTakenToday
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-200"
                  : "bg-white dark:bg-[#1a1523] border-rose-100 dark:border-rose-900/40 text-gray-900 dark:text-rose-100 hover:border-rose-300"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-colors ${
                    med.isTakenToday
                      ? "bg-emerald-500 text-white"
                      : "bg-rose-100 dark:bg-rose-900/40 text-rose-600"
                  }`}
                >
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif font-bold text-base flex items-center gap-2">
                    <span className={med.isTakenToday ? "line-through opacity-75" : ""}>
                      {med.name}
                    </span>
                    <span className="text-[10px] font-sans font-normal px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-200">
                      {med.time}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-rose-300 mt-0.5">
                    {med.dosage} · {med.frequency}
                  </div>
                  {med.notes && (
                    <div className="text-[11px] text-rose-600 dark:text-rose-300 italic mt-1">
                      💡 {med.notes}
                    </div>
                  )}
                </div>
              </div>

              <button className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-black/20 shadow-sm border border-rose-100 dark:border-rose-900/30">
                {med.isTakenToday ? t("taken") : t("markTaken")}
              </button>
            </div>
          ))}
        </div>

        {/* Add New Supplement Form */}
        <form
          onSubmit={handleAdd}
          className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4"
        >
          <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-rose-500" />
            <span>{t("addNewMedicine")}</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">
                {t("medicineName")}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("medicineNamePlaceholder")}
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">
                {t("dosage")}
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder={t("dosagePlaceholder")}
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">
                {t("time")}
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="08:00 PM"
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">
                {t("doctorInstructions")}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("doctorInstructionsPlaceholder")}
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-md"
          >
            {t("addReminder")}
          </button>
        </form>
      </div>
    </div>
  );
};

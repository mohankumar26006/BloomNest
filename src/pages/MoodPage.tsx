import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Smile, Moon, Sparkles, Heart, Plus, Calendar } from "lucide-react";

export const MoodPage: React.FC = () => {
  const { moodLogs, addMoodLog, t } = useApp();

  const [selectedMood, setSelectedMood] = useState(t("moodHappy"));
  const [sleepHours, setSleepHours] = useState(8);
  const [sleepQuality, setSleepQuality] = useState<"poor" | "fair" | "good" | "excellent">("good");
  const [notes, setNotes] = useState("");

  const MOOD_OPTIONS = [
    t("moodHappy"),
    t("moodCalm"),
    t("moodTired"),
    t("moodAnxious"),
    t("moodNauseous"),
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMoodLog({
      date: new Date().toISOString().split("T")[0],
      mood: selectedMood,
      intensityScore: 8,
      sleepHours,
      sleepQuality,
      notes,
      tags: ["Trimester 2"],
    });
    setNotes("");
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <Smile className="w-4 h-4" />
            <span>{t("emotionalRestLog")}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            {t("moodTrackerTitle")}
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
            {t("moodTrackerSubtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mood Logger Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4"
        >
          <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-rose-500" />
            <span>{t("logHowYouFeel")}</span>
          </h3>

          <div>
            <label className="block font-semibold text-xs text-gray-600 dark:text-rose-300 mb-2">
              {t("selectMood")}
            </label>
            <div className="space-y-2">
              {MOOD_OPTIONS.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setSelectedMood(m)}
                  className={`w-full p-2.5 rounded-2xl text-xs font-semibold text-left transition-all border ${
                    selectedMood === m
                      ? "bg-rose-500 text-white border-rose-500 shadow-md"
                      : "bg-rose-50/50 dark:bg-rose-950/30 text-gray-700 dark:text-rose-200 border-rose-100 dark:border-rose-900/40 hover:bg-rose-100"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">{t("sleepHours")}</label>
              <input
                type="number"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">{t("sleepQuality")}</label>
              <select
                value={sleepQuality}
                onChange={(e) => setSleepQuality(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-semibold"
              >
                <option value="excellent">{t("qualityExcellent")}</option>
                <option value="good">{t("qualityGood")}</option>
                <option value="fair">{t("qualityFair")}</option>
                <option value="poor">{t("qualityPoor")}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-xs text-gray-600 dark:text-rose-300 mb-1">{t("reflectionGratitude")}</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("moodNotesPlaceholder")}
              className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-md"
          >
            {t("saveMoodEntry")}
          </button>
        </form>

        {/* Previous Entries List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>{t("moodHistoryInsights")}</span>
            </h3>

            {moodLogs.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-rose-300 py-6 text-center">
                {t("noMoodLogs")}
              </p>
            ) : (
              moodLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-rose-900 dark:text-rose-100">{log.mood}</span>
                    <span className="text-gray-400 text-[10px]">{log.date}</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-rose-300">
                    {t("sleptHours", { hours: log.sleepHours, quality: log.sleepQuality })}
                  </div>
                  {log.notes && (
                    <p className="text-xs text-gray-700 dark:text-rose-200 italic pt-1">
                      "{log.notes}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { BookOpen, Plus, Heart, Sparkles, Image as ImageIcon, Lock, Eye } from "lucide-react";

export const JournalPage: React.FC = () => {
  const { journalEntries, addJournalEntry, user, t } = useApp();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mood, setMood] = useState(t("moodHappy"));
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addJournalEntry({
      date: new Date().toISOString().split("T")[0],
      title,
      content,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1518104593124-ac2e82a5eb9d?auto=format&fit=crop&w=600&q=80",
      mood,
      weekNumber: user.currentWeek,
      isPrivate,
    });

    setTitle("");
    setContent("");
    setImageUrl("");
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>{t("pregnancyKeepsake")}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            {t("journalTitle")}
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
            {t("journalSubtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry Creator Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4"
        >
          <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-rose-500" />
            <span>{t("newMemoryEntry", { week: user.currentWeek })}</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">
                {t("entryTitle")}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("entryTitlePlaceholder")}
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">
                {t("bellyPhotoUrl")}
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-[11px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">
                {t("letterToBaby")}
              </label>
              <textarea
                rows={4}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t("letterToBabyPlaceholder")}
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-md"
          >
            {t("publishJournalEntry")}
          </button>
        </form>

        {/* Entries Gallery */}
        <div className="lg:col-span-2 space-y-6">
          {journalEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white dark:bg-[#1a1523] rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm overflow-hidden"
            >
              {entry.imageUrl && (
                <img
                  src={entry.imageUrl}
                  alt={entry.title}
                  className="w-full h-52 object-cover"
                  referrerPolicy="no-referrer"
                />
              )}

              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-200 font-bold">
                    {t("weekLabel", { week: entry.weekNumber })}
                  </span>
                  <span className="text-gray-400">{entry.date}</span>
                </div>

                <h3 className="font-serif font-bold text-xl text-gray-900 dark:text-rose-100">
                  {entry.title}
                </h3>

                <p className="text-xs text-gray-700 dark:text-rose-200 leading-relaxed whitespace-pre-line">
                  {entry.content}
                </p>

                {entry.mood && (
                  <div className="pt-2 text-xs font-semibold text-rose-600 dark:text-rose-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t("moodLabel")}: {entry.mood}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

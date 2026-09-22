import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Settings, User, Calendar, RotateCcw, Save, ShieldAlert, LogOut } from "lucide-react";
import {
  calculateEddFromWeek,
  calculateEddFromLmp,
  calculatePregnancyProgress,
} from "../utils/pregnancyCalculation";

export const SettingsPage: React.FC = () => {
  const { user, updateUser, loadDemoData, resetAllData, t } = useApp();

  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [doctorName, setDoctorName] = useState(user.doctorName || "");
  const [hospitalName, setHospitalName] = useState(user.hospitalName || "");
  const [lmpDate, setLmpDate] = useState(user.lmpDate || "2026-06-05");

  const [calcMode, setCalcMode] = useState<"week" | "lmp">("week");
  const [selectedWeek, setSelectedWeek] = useState<number>(user.currentWeek || 20);

  const previewProgress = calculatePregnancyProgress({
    edd: calculateEddFromWeek(selectedWeek),
    currentWeek: selectedWeek,
  });

  const handleApplyWeekEdd = () => {
    const safeWeek = Math.min(42, Math.max(1, selectedWeek));
    const eddStr = calculateEddFromWeek(safeWeek);
    const progress = calculatePregnancyProgress({ edd: eddStr, currentWeek: safeWeek });
    updateUser({
      currentWeek: progress.currentWeek,
      edd: progress.edd,
      daysRemaining: progress.daysRemaining,
      trimester: progress.trimester,
    });
  };

  // Calculate EDD from LMP (LMP + 280 days via Naegele's rule)
  const handleCalculateEdd = () => {
    if (!lmpDate) return;
    const eddStr = calculateEddFromLmp(lmpDate);
    const progress = calculatePregnancyProgress({ edd: eddStr, lmpDate });

    updateUser({
      lmpDate,
      edd: progress.edd,
      daysRemaining: progress.daysRemaining,
      currentWeek: progress.currentWeek,
      trimester: progress.trimester,
    });
  };

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ fullName, email, doctorName, hospitalName });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>{t("settingsSubheader")}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            {t("settingsTitle")}
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
            {t("settingsSubtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* EDD / Week Calculator Card */}
        <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-500" />
              <span>Due Date & Week Calculator</span>
            </h3>

            {/* Mode Switcher */}
            <div className="flex bg-rose-50 dark:bg-rose-950/40 p-1 rounded-xl border border-rose-200/60 dark:border-rose-900/40 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setCalcMode("week")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  calcMode === "week"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "text-gray-600 dark:text-rose-300"
                }`}
              >
                By Current Week
              </button>
              <button
                type="button"
                onClick={() => setCalcMode("lmp")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  calcMode === "lmp"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "text-gray-600 dark:text-rose-300"
                }`}
              >
                By LMP Date
              </button>
            </div>
          </div>

          {calcMode === "week" ? (
            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-gray-600 dark:text-rose-300">
                    Current Gestational Week:
                  </label>
                  <span className="font-black text-rose-600 dark:text-rose-300 px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                    Week {selectedWeek}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={40}
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(Number(e.target.value))}
                  className="w-full h-2 bg-rose-200 dark:bg-rose-900/60 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-purple-950/20 border border-rose-200/70 dark:border-rose-900/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-rose-300 font-semibold">Calculated Due Date:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-300">
                    {new Date(previewProgress.edd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-rose-400">
                  {previewProgress.daysRemaining} days remaining (Trimester {previewProgress.trimester})
                </div>
              </div>

              <button
                type="button"
                onClick={handleApplyWeekEdd}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-md transition-all"
              >
                Apply Week & Due Date to Timeline ✨
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">
                  {t("lmpDate")} (Last Menstrual Period)
                </label>
                <input
                  type="date"
                  value={lmpDate}
                  onChange={(e) => setLmpDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-bold"
                />
              </div>

              <button
                type="button"
                onClick={handleCalculateEdd}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs shadow-md"
              >
                {t("calculateEdd")}
              </button>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 text-xs space-y-1">
            <div className="font-bold text-rose-900 dark:text-rose-100">{t("currentDueDate")}: {user.edd}</div>
            <div className="text-rose-600 dark:text-rose-300">
              {t("weekTrimesterDaysLeft", { week: user.currentWeek, trimester: user.trimester, days: user.daysRemaining })}
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <form
          onSubmit={handleSubmitProfile}
          className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4"
        >
          <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2">
            <User className="w-4 h-4 text-rose-500" />
            <span>{t("maternalProfileTitle")}</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">{t("fullName")}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">{t("email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">{t("obgynDoctorName")}</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">{t("hospitalName")}</label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md"
          >
            {t("saveProfileChanges")}
          </button>
        </form>
      </div>

      {/* Demo Profile & Reset Section */}
      <div className="bg-rose-50/60 dark:bg-rose-950/20 p-6 rounded-3xl border border-rose-200/70 dark:border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-bold text-xs text-rose-900 dark:text-rose-200">Sarah's Demo Profile</div>
          <div className="text-[11px] text-rose-700 dark:text-rose-300">
            Restore all pre-filled sample vitals, journal entries, and timelines for demonstration.
          </div>
        </div>

        <button
          onClick={loadDemoData}
          className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shrink-0 flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Load Demo Account (Sarah)</span>
        </button>
      </div>

      {/* New User Login / Create Profile Section */}
      <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-bold text-xs text-gray-900 dark:text-gray-100">Login for New Mom / Fresh Account</div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">
            Start fresh with a clean slate to log your own real medical reports, vitals, and baby kicks.
          </div>
        </div>

        <button
          onClick={() => updateUser({ hasCompletedOnboarding: false })}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-xs shadow-md shrink-0 flex items-center gap-1.5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Setup New User Profile</span>
        </button>
      </div>
    </div>
  );
};

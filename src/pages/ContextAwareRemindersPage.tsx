import React, { useState, useEffect } from "react";
import {
  Bell,
  Clock,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  FileText,
  HelpCircle,
  ArrowLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  Layers,
  Activity,
  Heart,
  Pill,
  Baby,
  Utensils,
  Smile,
  ShieldCheck,
  CheckCircle2,
  CheckSquare,
  Circle,
  Calendar,
  Sliders,
  XCircle,
  Eye,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  PageView,
  PostpartumProfile,
  ContextAwareReminderItem,
  ReminderEngineEvaluationResult,
  ReminderCategory,
  ReminderPriority,
  ReminderStatus,
  ReminderUserPreferences,
} from "../types";
import {
  evaluateContextReminders,
  updateReminderState,
  saveReminderPreferences,
} from "../utils/contextReminderEngine";
import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
  getRecoveryStage,
} from "../utils/postpartumUtils";

interface ContextRemindersPageProps {
  onNavigate?: (page: PageView) => void;
  profile?: PostpartumProfile | null;
  darkMode?: boolean;
}

export const ContextAwareRemindersPage: React.FC<ContextRemindersPageProps> = ({
  onNavigate,
  profile,
  darkMode = false,
}) => {
  const [evalResult, setEvalResult] = useState<ReminderEngineEvaluationResult | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [activeWhyReminder, setActiveWhyReminder] = useState<ContextAwareReminderItem | null>(null);
  const [showPrefsModal, setShowPrefsModal] = useState<boolean>(false);
  const [prefsForm, setPrefsForm] = useState<ReminderUserPreferences | null>(null);

  const deliveryDateStr = profile?.deliveryDate || new Date().toISOString().split("T")[0];
  const postpartumDay = calculatePostpartumDay(deliveryDateStr);
  const postpartumWeek = calculatePostpartumWeek(postpartumDay);
  const recoveryStage = getRecoveryStage(postpartumDay).title;

  const refreshEngine = () => {
    const res = evaluateContextReminders({ profile });
    setEvalResult(res);
    setPrefsForm(res.userPreferences);
  };

  useEffect(() => {
    refreshEngine();
  }, [profile]);

  if (!evalResult || !prefsForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] dark:bg-[#120E18] text-slate-800 dark:text-slate-200">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 text-amber-500 animate-spin" />
          <span className="text-sm font-semibold">Evaluating context-aware reminders & quiet hours...</span>
        </div>
      </div>
    );
  }

  // Filter reminders by selected tab
  const filteredReminders = evalResult.reminders.filter((r) => {
    if (selectedCategoryFilter === "all") return true;
    if (selectedCategoryFilter === "safety_med") return r.category === "safety" || r.category === "medication" || r.category === "appointment";
    return r.category === selectedCategoryFilter;
  });

  const handleSnooze = (reminder: ContextAwareReminderItem) => {
    const mins = prefsForm.snoozeMinutes || 15;
    const snoozeTime = new Date(Date.now() + mins * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    updateReminderState(reminder.reminderId, "snoozed", snoozeTime);
    refreshEngine();
  };

  const handleDismiss = (reminder: ContextAwareReminderItem) => {
    updateReminderState(reminder.reminderId, "dismissed");
    refreshEngine();
  };

  const handleComplete = (reminder: ContextAwareReminderItem) => {
    updateReminderState(reminder.reminderId, "completed");
    refreshEngine();
  };

  const handleSavePrefs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefsForm) return;
    saveReminderPreferences(prefsForm);
    setShowPrefsModal(false);
    refreshEngine();
  };

  const getPriorityBadge = (priority: ReminderPriority) => {
    switch (priority) {
      case "urgent_safety":
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Urgent Safety Alert
          </span>
        );
      case "medication_appointment":
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
            <Pill className="w-3.5 h-3.5" /> Time-Sensitive Care
          </span>
        );
      case "recovery":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" /> Recovery Check
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Routine Notification
          </span>
        );
    }
  };

  const getStatusBadge = (status: ReminderStatus) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Satisfied in Raw Logs
          </span>
        );
      case "suppressed":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <VolumeX className="w-3.5 h-3.5" /> Auto-Suppressed
          </span>
        );
      case "snoozed":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Snoozed
          </span>
        );
      case "dismissed":
        return (
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
            Dismissed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
            <Bell className="w-3.5 h-3.5 animate-pulse" /> Active Notification
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] text-slate-800 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto transition-colors">
      
      {/* TOP HEADER WITH POSTPARTUM CONTEXT (BloomNest Standard Header) */}
      <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-xs font-semibold rounded-full flex items-center gap-1.5 border border-amber-200 dark:border-amber-800">
              <Bell className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Feature 22 • Postpartum Care
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full">
              Day {postpartumDay} • Week {postpartumWeek}
            </span>
            <span className="px-3 py-1 rounded-full bg-rose-500 text-white font-extrabold text-xs">
              {recoveryStage}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-8 h-8 text-amber-500" />
            Context-Aware Reminders
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Answers: <span className="font-semibold text-slate-700 dark:text-slate-200">“What does the mother need to be reminded about, when should she be reminded, and should the reminder change based on what is happening right now?”</span>
          </p>
        </div>

        {/* Quick Nav & Preferences Controls */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          {onNavigate && (
            <button
              onClick={() => onNavigate("postpartum-daily-plan")}
              className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Daily Plan (Feat 21)
            </button>
          )}
          <button
            onClick={() => setShowPrefsModal(true)}
            className="px-4 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Sliders className="w-4 h-4" />
            Preferences & Quiet Hours
          </button>
        </div>
      </div>

      {/* CLOSED-LOOP ENGINE STATUS CARD */}
      <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reminder Engine Status</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {evalResult.upcomingCount} Active / Scheduled Reminder(s) Today
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {evalResult.suppressedCount} notification(s) auto-suppressed to avoid notification fatigue • {evalResult.completedCount} satisfied in raw feature logs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-xs flex items-center gap-1.5 border border-amber-500/20">
              <ShieldCheck className="w-4 h-4 text-amber-500" /> Closed-Loop Sync Active
            </div>
          </div>
        </div>

        {/* Quiet Hours Indicator Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#231C30] border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-500" />
            <span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">Quiet Hours Preference:</span>{" "}
              {prefsForm.quietHoursEnabled
                ? `${prefsForm.quietHoursStart} – ${prefsForm.quietHoursEnd} (Non-urgent notifications suppressed)`
                : "Disabled (All reminders active)"}
            </span>
          </div>
          <button
            onClick={() => setShowPrefsModal(true)}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Configure →
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {[
          { id: "all", label: `All Reminders (${evalResult.totalRemindersCount})` },
          { id: "safety_med", label: "Safety & Medical" },
          { id: "recovery", label: "Mother Recovery" },
          { id: "baby_care", label: "Baby Care" },
          { id: "wellbeing", label: "Wellbeing" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategoryFilter(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategoryFilter === tab.id
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-white dark:bg-[#1A1523] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* REMINDERS LIST */}
      <div className="space-y-4">
        {filteredReminders.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#1A1523] rounded-3xl border border-slate-100 dark:border-slate-800/80 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Active Reminders in this Category</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All reminders for this section have been satisfied or auto-suppressed according to your context.
            </p>
          </div>
        ) : (
          filteredReminders.map((item) => {
            const isCompleted = item.status === "completed";
            const isSuppressed = item.status === "suppressed";

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-[#1A1523] rounded-3xl p-6 shadow-sm border transition-all ${
                  isCompleted || isSuppressed
                    ? "opacity-60 border-slate-200 dark:border-slate-800"
                    : item.priority === "urgent_safety"
                    ? "border-rose-300 dark:border-rose-800/60"
                    : "border-slate-100 dark:border-slate-800/80"
                } space-y-4`}
              >
                {/* Reminder Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getPriorityBadge(item.priority)}
                      {getStatusBadge(item.status)}
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                        {item.sourceFeature}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-mono bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.scheduledTimeStr}
                      </span>
                    </div>

                    <h3 className={`text-base sm:text-lg font-bold text-slate-900 dark:text-white ${isCompleted ? "line-through text-slate-400" : ""}`}>
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => setActiveWhyReminder(item)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 flex items-center gap-1 transition-all"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> Why this?
                    </button>

                    {!isCompleted && !isSuppressed && (
                      <>
                        <button
                          onClick={() => handleSnooze(item)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 transition-all"
                        >
                          Snooze ({prefsForm.snoozeMinutes}m)
                        </button>
                        <button
                          onClick={() => handleDismiss(item)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-all"
                        >
                          Dismiss
                        </button>
                      </>
                    )}

                    {onNavigate && (
                      <button
                        onClick={() => onNavigate(item.sourceModulePage)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 flex items-center gap-1 transition-all shadow-sm"
                      >
                        Open Module <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Transparency Rationale Bar */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#231C30] border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span><span className="font-semibold text-slate-700 dark:text-slate-300">Context Rationale:</span> {item.whyThisReminder}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: "Why This Reminder?" Modal */}
      {activeWhyReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A1523] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold">Why am I receiving this reminder?</h3>
              </div>
              <button
                onClick={() => setActiveWhyReminder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                {activeWhyReminder.title} ({activeWhyReminder.sourceFeature})
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#231C30] border border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="font-semibold text-slate-900 dark:text-white">Trigger Rationale:</div>
                <p>{activeWhyReminder.whyThisReminder}</p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-400">
                  Scheduled Time: <span className="font-semibold text-slate-700 dark:text-slate-200">{activeWhyReminder.scheduledTimeStr}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Closed-Loop Data Rule
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Recording your observation directly in the source module automatically completes this reminder and prevents duplicate notifications.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveWhyReminder(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-sm"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: User Preferences & Quiet Hours Drawer */}
      {showPrefsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={handleSavePrefs}
            className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A1523] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold">Reminder Preferences</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrefsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Notification Master Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#231C30] border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="font-bold text-slate-800 dark:text-white block">App Reminders</span>
                  <span className="text-slate-400 text-[11px]">Enable context-aware notifications</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefsForm.notificationsEnabled}
                  onChange={(e) => setPrefsForm({ ...prefsForm, notificationsEnabled: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded"
                />
              </div>

              {/* Quiet Hours Toggle & Settings */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#231C30] border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white block">Quiet Hours</span>
                    <span className="text-slate-400 text-[11px]">Suppress non-urgent alerts during sleep</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefsForm.quietHoursEnabled}
                    onChange={(e) => setPrefsForm({ ...prefsForm, quietHoursEnabled: e.target.checked })}
                    className="w-5 h-5 accent-amber-500 rounded"
                  />
                </div>

                {prefsForm.quietHoursEnabled && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">Start Time</label>
                      <input
                        type="text"
                        value={prefsForm.quietHoursStart}
                        onChange={(e) => setPrefsForm({ ...prefsForm, quietHoursStart: e.target.value })}
                        className="w-full p-2 text-xs rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">End Time</label>
                      <input
                        type="text"
                        value={prefsForm.quietHoursEnd}
                        onChange={(e) => setPrefsForm({ ...prefsForm, quietHoursEnd: e.target.value })}
                        className="w-full p-2 text-xs rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Snooze Duration */}
              <div>
                <label className="font-bold text-slate-800 dark:text-white block mb-1">Default Snooze Duration</label>
                <select
                  value={prefsForm.snoozeMinutes}
                  onChange={(e) => setPrefsForm({ ...prefsForm, snoozeMinutes: Number(e.target.value) })}
                  className="w-full p-2.5 text-xs rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                >
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPrefsModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-md"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

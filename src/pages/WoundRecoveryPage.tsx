import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  PostpartumProfile,
  WoundLog,
  WoundType,
  WoundAppearance,
  WoundDischarge,
  WoundOpening,
  WoundTenderness,
  WoundHealingTrend,
} from "../types";
import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
  getRecoveryStage,
  formatDeliveryType,
} from "../utils/postpartumUtils";
import {
  Activity,
  Heart,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  History,
  Info,
  ArrowRight,
  ShieldAlert,
  Bandage,
  Sparkles,
  HeartPulse,
} from "lucide-react";

const POSTPARTUM_PROFILE_KEY = "bloomnest_postpartum_profile_v1";
const WOUND_LOGS_KEY = "bloomnest_wound_logs_v1";

export const WoundRecoveryPage: React.FC<{
  onNavigateSubPage?: (page: string) => void;
}> = ({ onNavigateSubPage }) => {
  const { user, showToast } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<PostpartumProfile | null>(null);
  const [logs, setLogs] = useState<WoundLog[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Form state
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [woundType, setWoundType] = useState<WoundType>("C-section incision");
  const [appearance, setAppearance] = useState<WoundAppearance>("Looks normal / improving");
  const [discharge, setDischarge] = useState<WoundDischarge>("None");
  const [opening, setOpening] = useState<WoundOpening>("No");
  const [tenderness, setTenderness] = useState<WoundTenderness>("Mild");
  const [healingTrend, setHealingTrend] = useState<WoundHealingTrend>("Improving");
  const [notes, setNotes] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  // Load Feature 01 Postpartum Context & Existing Wound Logs
  useEffect(() => {
    const loadData = () => {
      try {
        // Load Feature 01 Profile
        const savedProfile = localStorage.getItem(POSTPARTUM_PROFILE_KEY);
        let prof: PostpartumProfile | null = null;
        if (savedProfile) {
          prof = JSON.parse(savedProfile);
          setProfile(prof);
        } else if (user?.journeyStage === "POST_PREGNANCY") {
          prof = {
            deliveryDate: new Date().toISOString().split("T")[0],
            deliveryType: "c_section",
            numberOfBabies: 1,
          };
          setProfile(prof);
        }

        // Auto-select woundType based on Feature 01 deliveryType
        if (prof) {
          if (prof.deliveryType === "c_section") {
            setWoundType("C-section incision");
          } else if (prof.deliveryType === "assisted_vaginal") {
            setWoundType("Episiotomy / perineal wound");
          } else {
            setWoundType("Episiotomy / perineal wound");
          }
        }

        // Load Feature 07 Wound Logs
        const savedLogs = localStorage.getItem(WOUND_LOGS_KEY);
        if (savedLogs) {
          setLogs(JSON.parse(savedLogs));
        }
      } catch (err) {
        console.error("Error loading wound logs:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  // Sync form when logDate or logs change
  useEffect(() => {
    if (isLoading) return;
    const existingLog = logs.find((l) => l.date === logDate);
    if (existingLog) {
      setWoundType(existingLog.woundType);
      setAppearance(existingLog.appearance);
      setDischarge(existingLog.discharge);
      setOpening(existingLog.opening);
      setTenderness(existingLog.tenderness);
      setHealingTrend(existingLog.healingTrend);
      setNotes(existingLog.notes || "");
    }
  }, [logDate, logs, isLoading]);

  // Handle Save Daily Wound Record
  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!profile) {
      setFormError("Postpartum context missing. Please configure delivery details first.");
      return;
    }

    const day = calculatePostpartumDay(profile.deliveryDate, logDate);
    const week = calculatePostpartumWeek(day);

    const newLog: WoundLog = {
      id: `wnd_${Date.now()}`,
      userId: user?.id || "user_demo",
      date: logDate,
      postpartumDay: day,
      postpartumWeek: week,
      woundType,
      appearance,
      discharge,
      opening,
      tenderness,
      healingTrend,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const updatedLogs = [newLog, ...logs.filter((l) => l.date !== logDate)].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      localStorage.setItem(WOUND_LOGS_KEY, JSON.stringify(updatedLogs));
      setLogs(updatedLogs);
      setSaveSuccessMsg(`Wound recovery log saved for Day ${day}!`);
      showToast("Wound condition logged successfully");
      setTimeout(() => setSaveSuccessMsg(null), 3000);
      setNotes("");
    } catch (err) {
      setFormError("Failed to save wound log locally.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading Wound Recovery...</p>
      </div>
    );
  }

  // FALLBACK IF FEATURE 01 PROFILE NOT CONFIGURED
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-[#1A1523] rounded-3xl p-8 border border-rose-100 dark:border-rose-900/40 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center mx-auto">
            <Bandage className="w-8 h-8 text-rose-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-rose-100">Setup Postpartum Care First</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Feature 07 (Wound Recovery) consumes delivery type and postpartum timeline from Feature 01. Please configure your delivery date first.
            </p>
          </div>

          <button
            onClick={() => onNavigateSubPage && onNavigateSubPage("care")}
            className="w-full py-3 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Go to Feature 01 (Postpartum Care)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // CALCULATED CONTEXT FROM FEATURE 01
  const postpartumDay = calculatePostpartumDay(profile.deliveryDate);
  const postpartumWeek = calculatePostpartumWeek(postpartumDay);
  const currentStage = getRecoveryStage(postpartumDay);

  const getTrendBadgeClass = (t: WoundHealingTrend) => {
    if (t === "Improving") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300";
    if (t === "Same") return "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300";
    return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300";
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] text-slate-800 dark:text-rose-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* SUCCESS TOAST */}
      {saveSuccessMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-800 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* HEADER WITH CONSUMED CONTEXT FROM FEATURE 01 */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 dark:border-rose-900/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 uppercase tracking-wider">
              Feature 07
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Delivery Wound & Incision Care
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-rose-100 tracking-tight mt-1">
            Wound Recovery — Postpartum Day {postpartumDay}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="px-3 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-xs">
              {currentStage.title}
            </span>
            <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
            <span className="px-3 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
              {formatDeliveryType(profile.deliveryType)}
            </span>
            <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Week {postpartumWeek} of recovery
            </span>
          </div>
        </div>

        {onNavigateSubPage && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => onNavigateSubPage("pain")}
              className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors flex items-center gap-1.5"
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Pain Tracker (Feat 06)</span>
            </button>
            <button
              onClick={() => onNavigateSubPage("safety")}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-rose-900 dark:text-rose-100 text-xs font-bold shadow-xs hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Safety Shield</span>
            </button>
          </div>
        )}
      </header>

      {/* DAILY WOUND LOGGING FORM */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-rose-900/40 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-rose-900/30 pb-3 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 flex items-center justify-center">
              <Bandage className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">Log Today's Wound Condition</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track incision/perineal wound appearance, discharge, opening, and tenderness.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-slate-50 dark:bg-[#15111C] text-xs font-bold text-slate-800 dark:text-rose-200"
            />
          </div>
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveLog} className="space-y-6 text-xs">
          {/* 1. WOUND TYPE */}
          <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
                Wound / Recovery Category
              </label>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                Auto-derived from Feature 01 ({formatDeliveryType(profile.deliveryType)})
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
              {(
                [
                  "C-section incision",
                  "Episiotomy / perineal wound",
                  "Other delivery-related wound",
                  "Not applicable",
                ] as WoundType[]
              ).map((typeItem) => (
                <button
                  key={typeItem}
                  type="button"
                  onClick={() => setWoundType(typeItem)}
                  className={`py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all border text-left flex items-center justify-between ${
                    woundType === typeItem
                      ? "bg-rose-500 text-white border-rose-600 shadow-xs"
                      : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-rose-300"
                  }`}
                >
                  <span>{typeItem}</span>
                  {woundType === typeItem && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* 2. APPEARANCE & DISCHARGE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* APPEARANCE */}
            <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
                Wound Appearance / Signs
              </label>
              <div className="space-y-1.5 pt-1">
                {(
                  [
                    "Looks normal / improving",
                    "Redness",
                    "Swelling",
                    "Bruising",
                    "Other visible changes",
                  ] as WoundAppearance[]
                ).map((appItem) => (
                  <button
                    key={appItem}
                    type="button"
                    onClick={() => setAppearance(appItem)}
                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all border text-left flex items-center justify-between ${
                      appearance === appItem
                        ? appItem.includes("normal")
                          ? "bg-emerald-600 text-white border-emerald-700"
                          : "bg-amber-500 text-white border-amber-600"
                        : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-rose-300"
                    }`}
                  >
                    <span>{appItem}</span>
                    {appearance === appItem && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* DISCHARGE */}
            <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
                Wound Discharge
              </label>
              <div className="space-y-1.5 pt-1">
                {(["None", "Small", "Increasing", "Unusual discharge"] as WoundDischarge[]).map(
                  (disItem) => (
                    <button
                      key={disItem}
                      type="button"
                      onClick={() => setDischarge(disItem)}
                      className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all border text-left flex items-center justify-between ${
                        discharge === disItem
                          ? disItem === "None" || disItem === "Small"
                            ? "bg-teal-600 text-white border-teal-700"
                            : "bg-rose-600 text-white border-rose-700"
                          : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-rose-300"
                      }`}
                    >
                      <span>{disItem}</span>
                      {discharge === disItem && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* 3. WOUND OPENING & TENDERNESS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* WOUND OPENING */}
            <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
                Wound Opening / Separation
              </label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {(["No", "Yes / concerning change"] as WoundOpening[]).map((opn) => (
                  <button
                    key={opn}
                    type="button"
                    onClick={() => setOpening(opn)}
                    className={`py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all border ${
                      opening === opn
                        ? opn === "No"
                          ? "bg-emerald-600 text-white border-emerald-700"
                          : "bg-rose-600 text-white border-rose-700 animate-pulse"
                        : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-rose-300"
                    }`}
                  >
                    {opn === "No" ? (
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> No Opening
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> Yes / Opening
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* TENDERNESS */}
            <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
                Local Tenderness / Pain on Touch
              </label>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {(["None", "Mild", "Moderate", "Severe"] as WoundTenderness[]).map((tnd) => (
                  <button
                    key={tnd}
                    type="button"
                    onClick={() => setTenderness(tnd)}
                    className={`py-2.5 rounded-xl font-extrabold text-xs transition-all border ${
                      tenderness === tnd
                        ? tnd === "None" || tnd === "Mild"
                          ? "bg-teal-600 text-white border-teal-700"
                          : "bg-orange-500 text-white border-orange-600"
                        : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-rose-300"
                    }`}
                  >
                    {tnd}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. HEALING TREND */}
          <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
            <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
              Overall Wound Healing Trend
            </label>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {(["Improving", "Same", "Worsening"] as WoundHealingTrend[]).map((trnd) => (
                <button
                  key={trnd}
                  type="button"
                  onClick={() => setHealingTrend(trnd)}
                  className={`py-2.5 rounded-xl font-extrabold text-xs transition-all border ${
                    healingTrend === trnd
                      ? trnd === "Improving"
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                        : trnd === "Same"
                        ? "bg-slate-600 text-white border-slate-700 shadow-xs"
                        : "bg-rose-600 text-white border-rose-700 shadow-xs"
                      : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-rose-300"
                  }`}
                >
                  {trnd === "Improving" ? "Improving" : trnd === "Same" ? "Same" : "Worsening"}
                </button>
              ))}
            </div>
          </div>

          {/* NOTES (OPTIONAL) */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-700 dark:text-rose-300 block">
              Wound Care Observations <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record cleaning observations, skin tape status, or nurse comments..."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>Save Today's Wound Condition Log</span>
          </button>
        </form>
      </section>

      {/* WOUND LOG HISTORY */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-rose-900/40 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-rose-900/30 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-rose-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">Wound Recovery History</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {logs.length} {logs.length === 1 ? "entry" : "entries"} recorded
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 italic">
            No wound logs recorded yet. Complete today's wound entry above to track your incision recovery timeline!
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#15111C] border border-slate-200/60 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-rose-100">{log.date}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-extrabold text-[10px]">
                      Day {log.postpartumDay}
                    </span>
                    <span className="text-slate-400 text-[10px]">{log.woundType}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 pt-0.5">
                    <span>Appearance: <strong>{log.appearance}</strong></span>
                    <span>•</span>
                    <span>Discharge: <strong>{log.discharge}</strong></span>
                    <span>•</span>
                    <span>Opening: <strong>{log.opening}</strong></span>
                    <span>•</span>
                    <span>Tenderness: <strong>{log.tenderness}</strong></span>
                  </div>

                  {log.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
                      "{log.notes}"
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${getTrendBadgeClass(log.healingTrend)}`}>
                    Trend: {log.healingTrend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* EDUCATIONAL WOUND CARE GUIDELINES */}
      <section className="bg-rose-50/60 dark:bg-rose-950/20 rounded-3xl p-6 border border-rose-100 dark:border-rose-900/30 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-rose-100 uppercase tracking-wider">
            Incision & Wound Healing Best Practices
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-white dark:bg-[#15111C] rounded-2xl border border-rose-100 dark:border-rose-900/30 space-y-1">
            <h4 className="font-extrabold text-slate-800 dark:text-rose-200">Clean & Dry Routine</h4>
            <p className="text-[11px]">
              Wash C-section incision or perineal wound gently with warm water. Pat dry thoroughly with a fresh clean towel. Avoid scrubbing.
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-[#15111C] rounded-2xl border border-rose-100 dark:border-rose-900/30 space-y-1">
            <h4 className="font-extrabold text-slate-800 dark:text-rose-200 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Red Flag Warning Signs
            </h4>
            <p className="text-[11px]">
              Report foul-smelling yellow/green discharge, sudden wound gaping/opening, high fever (&gt;100.4°F), or worsening redness immediately.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

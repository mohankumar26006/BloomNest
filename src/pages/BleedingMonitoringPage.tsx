import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  PostpartumProfile,
  BleedingLog,
  BleedingAmount,
  LochiaColor,
  ClotStatus,
  BleedingTrend,
} from "../types";
import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
  getRecoveryStage,
  formatDeliveryType,
} from "../utils/postpartumUtils";
import {
  Droplet,
  Heart,
  Calendar,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  History,
  Info,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

const POSTPARTUM_PROFILE_KEY = "bloomnest_postpartum_profile_v1";
const BLEEDING_LOGS_KEY = "bloomnest_bleeding_logs_v1";

export const BleedingMonitoringPage: React.FC<{
  onNavigateSubPage?: (page: string) => void;
}> = ({ onNavigateSubPage }) => {
  const { user, showToast } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<PostpartumProfile | null>(null);
  const [logs, setLogs] = useState<BleedingLog[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Form state
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState<BleedingAmount>("Moderate");
  const [color, setColor] = useState<LochiaColor>("Red");
  const [clots, setClots] = useState<ClotStatus>("None");
  const [padCount, setPadCount] = useState<string>("");
  const [trend, setTrend] = useState<BleedingTrend>("Improving");
  const [notes, setNotes] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  // Load Feature 01 Postpartum Context & Existing Bleeding Logs
  useEffect(() => {
    const loadData = () => {
      try {
        // Load Feature 01 Profile
        const savedProfile = localStorage.getItem(POSTPARTUM_PROFILE_KEY);
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        } else if (user?.journeyStage === "POST_PREGNANCY") {
          const defaultProf: PostpartumProfile = {
            deliveryDate: new Date().toISOString().split("T")[0],
            deliveryType: "vaginal",
            numberOfBabies: 1,
          };
          setProfile(defaultProf);
        }

        // Load Feature 05 Bleeding Logs
        const savedLogs = localStorage.getItem(BLEEDING_LOGS_KEY);
        if (savedLogs) {
          setLogs(JSON.parse(savedLogs));
        }
      } catch (err) {
        console.error("Error loading bleeding logs:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  // Handle Save Daily Bleeding Entry
  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!profile) {
      setFormError("Postpartum context missing. Please configure delivery details first.");
      return;
    }

    const day = calculatePostpartumDay(profile.deliveryDate, logDate);
    const week = calculatePostpartumWeek(day);

    const newLog: BleedingLog = {
      id: `bld_${Date.now()}`,
      userId: user?.id || "user_demo",
      date: logDate,
      postpartumDay: day,
      postpartumWeek: week,
      amount,
      color,
      clots,
      padCount: padCount ? parseInt(padCount, 10) : undefined,
      trend,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      // Upsert by date
      const updatedLogs = [newLog, ...logs.filter((l) => l.date !== logDate)].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      localStorage.setItem(BLEEDING_LOGS_KEY, JSON.stringify(updatedLogs));
      setLogs(updatedLogs);
      setSaveSuccessMsg(`Bleeding record saved for Day ${day}! 🩸`);
      showToast("Postpartum bleeding entry logged 💕");
      setTimeout(() => setSaveSuccessMsg(null), 3000);
      setNotes("");
    } catch (err) {
      setFormError("Failed to save bleeding log locally.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading Bleeding Monitoring...</p>
      </div>
    );
  }

  // FALLBACK IF FEATURE 01 PROFILE NOT CONFIGURED
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-[#1A1523] rounded-3xl p-8 border border-rose-100 dark:border-rose-900/40 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center mx-auto">
            <Droplet className="w-8 h-8 text-rose-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-rose-100">Setup Postpartum Care First</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Feature 05 (Bleeding Monitoring) reuses delivery details from Feature 01. Please configure your delivery date first.
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
              Feature 05
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lochia & Bleeding Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-rose-100 tracking-tight mt-1">
            Bleeding Monitoring — Postpartum Day {postpartumDay}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="px-3 py-0.5 rounded-full bg-rose-600 text-white font-extrabold text-xs">
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
      </header>

      {/* 🩸 DAILY BLEEDING LOGGING FORM */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-rose-900/40 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-rose-900/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 flex items-center justify-center">
              <Droplet className="w-4 h-4 text-rose-500 fill-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">Log Today's Bleeding Observation</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Record flow amount, color, clots, pad count, and trend.</p>
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
          {/* 1. BLEEDING AMOUNT */}
          <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
            <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
              Bleeding Amount <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {(["None", "Light", "Moderate", "Heavy"] as BleedingAmount[]).map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt)}
                  className={`py-3 rounded-xl font-extrabold text-xs transition-all border ${
                    amount === amt
                      ? amt === "Heavy"
                        ? "bg-rose-600 text-white border-rose-700 shadow-xs"
                        : "bg-rose-500 text-white border-rose-600 shadow-xs"
                      : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-rose-300"
                  }`}
                >
                  {amt === "None" ? "⚪ None" : amt === "Light" ? "🌸 Light" : amt === "Moderate" ? "🩸 Moderate" : "🚨 Heavy"}
                </button>
              ))}
            </div>
          </div>

          {/* 2. LOCHIA COLOR & CLOTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* LOCHIA COLOR */}
            <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
                Lochia Color <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {(
                  [
                    { key: "Red", label: "🔴 Red (Rubra)" },
                    { key: "Pink", label: "🌸 Pink (Serosa)" },
                    { key: "Brown", label: "🟤 Brown (Serosa)" },
                    { key: "Yellow/White", label: "🟡 Yellow/White (Alba)" },
                  ] as const
                ).map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setColor(c.key as LochiaColor)}
                    className={`py-2.5 rounded-xl font-extrabold text-[11px] transition-all border ${
                      color === c.key
                        ? "bg-rose-500 text-white border-rose-600 shadow-xs"
                        : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-rose-300"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CLOT STATUS */}
            <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
                Blood Clots <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(["None", "Small", "Large"] as ClotStatus[]).map((clt) => (
                  <button
                    key={clt}
                    type="button"
                    onClick={() => setClots(clt)}
                    className={`py-2.5 rounded-xl font-extrabold text-[11px] transition-all border ${
                      clots === clt
                        ? clt === "Large"
                          ? "bg-red-600 text-white border-red-700 shadow-xs"
                          : "bg-rose-500 text-white border-rose-600 shadow-xs"
                        : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-rose-300"
                    }`}
                  >
                    {clt === "None" ? "✨ None" : clt === "Small" ? "🔹 Small" : "⚠️ Large"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. PAD COUNT & BLEEDING TREND */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PAD COUNT (OPTIONAL) */}
            <div className="space-y-1.5 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
                Pads Changed in 24h <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                min="0"
                max="30"
                placeholder="e.g. 4 pads"
                value={padCount}
                onChange={(e) => setPadCount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#1A1523] font-semibold text-xs"
              />
            </div>

            {/* BLEEDING TREND */}
            <div className="space-y-2 bg-slate-50/70 dark:bg-[#15111C] p-4 rounded-2xl border border-slate-200/60 dark:border-gray-800">
              <label className="font-extrabold text-slate-900 dark:text-rose-100 block">
                Bleeding Trend <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(["Improving", "Same", "Increasing"] as BleedingTrend[]).map((trd) => (
                  <button
                    key={trd}
                    type="button"
                    onClick={() => setTrend(trd)}
                    className={`py-2.5 rounded-xl font-extrabold text-[11px] transition-all border ${
                      trend === trd
                        ? trd === "Increasing"
                          ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                          : "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                        : "bg-white dark:bg-[#1A1523] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-gray-800 hover:border-rose-300"
                    }`}
                  >
                    {trd === "Improving" ? "📉 Improving" : trd === "Same" ? "➡️ Same" : "📈 Increasing"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* NOTES (OPTIONAL) */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-700 dark:text-rose-300 block">
              Bleeding Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record odor, flow pattern changes, or cramping during nursing..."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>Save Today's Bleeding Entry</span>
          </button>
        </form>
      </section>

      {/* 📊 BLEEDING HISTORY TIMELINE */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-rose-900/40 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-rose-900/30 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-rose-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">Bleeding Record History</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {logs.length} {logs.length === 1 ? "entry" : "entries"} logged
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 italic">
            No bleeding records logged yet. Complete today's entry above to build your lochia timeline!
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
                    <span className="text-slate-400 text-[10px]">Week {log.postpartumWeek}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-rose-200 pt-0.5">
                    <span>Flow: <strong className="text-rose-600">{log.amount}</strong></span>
                    <span>•</span>
                    <span>Color: <strong>{log.color}</strong></span>
                    <span>•</span>
                    <span>Clots: <strong>{log.clots}</strong></span>
                    {log.padCount !== undefined && (
                      <>
                        <span>•</span>
                        <span>Pads: <strong>{log.padCount}</strong></span>
                      </>
                    )}
                  </div>

                  {log.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
                      "{log.notes}"
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                      log.trend === "Improving"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : log.trend === "Same"
                        ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                    }`}
                  >
                    Trend: {log.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 📚 LOCHIA PROGRESSION EDUCATIONAL GUIDE */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-rose-900/40 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-rose-900/30 pb-3">
          <Info className="w-4 h-4 text-rose-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">Postpartum Lochia Stages Guide</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 space-y-1.5">
            <span className="font-extrabold text-rose-900 dark:text-rose-200 block">1. Lochia Rubra (Days 1–4)</span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Bright red heavy to moderate flow containing blood and mucus. Small coin-sized clots can be normal.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-pink-50/60 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 space-y-1.5">
            <span className="font-extrabold text-pink-900 dark:text-pink-200 block">2. Lochia Serosa (Days 4–10)</span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Pinkish-brown lighter discharge with less blood and more cervical mucus as uterine lining heals.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 space-y-1.5">
            <span className="font-extrabold text-amber-900 dark:text-amber-200 block">3. Lochia Alba (Weeks 2–6)</span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Yellowish-white creamy discharge consisting mainly of white blood cells and epithelial tissue.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

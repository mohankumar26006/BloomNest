import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  PersonalizedRecoveryInsightResult,
  InsightEvidencePoint,
  PageView,
} from "../types";
import { generatePersonalizedRecoveryInsight } from "../utils/personalizedRecoveryInsightEngine";
import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
  getRecoveryStage,
} from "../utils/postpartumUtils";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ChevronRight,
  Calendar,
  ExternalLink,
  History,
  Activity,
  Heart,
  Baby,
  Smile,
  Moon,
  Info,
  X,
  FileText,
  BookOpen,
} from "lucide-react";

const POSTPARTUM_PROFILE_KEY = "bloomnest_postpartum_profile_v1";

interface PersonalizedRecoveryInsightPageProps {
  onNavigateSubPage?: (page: PageView) => void;
}

export const PersonalizedRecoveryInsightPage: React.FC<PersonalizedRecoveryInsightPageProps> = ({
  onNavigateSubPage,
}) => {
  const { showToast } = useApp();

  const [insight, setInsight] = useState<PersonalizedRecoveryInsightResult | null>(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState<boolean>(false);
  const [timeRangeDays, setTimeRangeDays] = useState<number>(7);

  useEffect(() => {
    runEngine(timeRangeDays);
  }, [timeRangeDays]);

  const runEngine = (days: number) => {
    const res = generatePersonalizedRecoveryInsight(days);
    setInsight(res);
  };

  // Calculate Postpartum Context
  let pDay = 10;
  let pWeek = 2;
  try {
    const rawProf = localStorage.getItem(POSTPARTUM_PROFILE_KEY);
    if (rawProf) {
      const prof = JSON.parse(rawProf);
      pDay = calculatePostpartumDay(prof.deliveryDate);
      pWeek = calculatePostpartumWeek(pDay);
    }
  } catch {}
  const stage = getRecoveryStage(pDay);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] text-slate-800 dark:text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* TOP HERO BANNER */}
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-white border border-white/30">
                  Feature 26 — Longitudinal Synthesis
                </span>
                <span className="bg-rose-400/30 text-rose-100 text-xs px-3 py-1 rounded-full font-medium">
                  Personal Recovery Picture
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Personalized Recovery Insight
              </h1>
              <p className="text-rose-100 mt-1 text-sm md:text-base max-w-xl">
                Looking at everything you've recorded so far, here is your transparent, data-grounded recovery trajectory.
              </p>
            </div>

            {/* Evidence & Confidence Badge */}
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 space-y-1.5 min-w-[200px] text-center">
              <div className="text-[10px] text-rose-100 font-medium uppercase tracking-wider">Data Confidence</div>
              <div className="text-sm font-bold text-white uppercase tracking-wide">
                {insight?.confidenceLevel.replace("_", " ")}
              </div>
              <button
                onClick={() => setIsEvidenceModalOpen(true)}
                className="w-full py-1.5 bg-white text-rose-600 font-bold rounded-xl text-xs hover:bg-rose-50 transition flex items-center justify-center gap-1 shadow-xs"
              >
                <History className="w-3.5 h-3.5" /> Show Evidence ({insight?.totalRecordsAnalyzed || 0})
              </button>
            </div>
          </div>
        </div>

        {/* NARRATIVE RECOVERY PICTURE CARD */}
        <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" /> Your Overall Recovery Story
            </h2>
            <div className="flex items-center gap-2">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setTimeRangeDays(days)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                    timeRangeDays === days
                      ? "bg-rose-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-rose-50/50 dark:bg-rose-950/20 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/40">
            {insight?.overallNarrativeSummary}
          </p>

          {/* RECOVERY OVERVIEW MATRIX */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {insight?.domainOverviews.map((d) => (
              <div
                key={d.domain}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{d.label}</span>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      d.status === "improving"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : d.status === "needs_attention"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                        : d.status === "active"
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {d.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {d.summaryText}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* SIDE-BY-SIDE: WHAT'S GOING WELL & AREAS TO WATCH */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* What's Going Well */}
          <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" /> What's Going Well
            </h3>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {insight?.whatsGoingWell.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas to Watch */}
          <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Areas to Watch
            </h3>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {insight?.areasToWatch.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                  <span className="text-amber-600 font-bold">○</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* TIME-SERIES RECENT CHANGES */}
        {insight?.recentChanges && insight.recentChanges.length > 0 && (
          <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" /> Recent Trajectory Changes ({timeRangeDays} Days)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {insight.recentChanges.map((change, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{change.domain}</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span>{change.fromVal}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>{change.toVal}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase ${
                    change.trend === "improving" ? "text-emerald-600" : change.trend === "decreasing" ? "text-rose-600" : "text-amber-600"
                  }`}>
                    {change.trend}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SAFETY SHIELD CONTEXT */}
        <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <ShieldCheck className={`w-8 h-8 shrink-0 ${
              insight?.safetyStatus.overallStatus === "CLEAR" ? "text-emerald-500" : "text-amber-500"
            }`} />
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Feature 04 Safety Shield Context</div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Safety Tier Status: {insight?.safetyStatus.overallStatus || "CLEAR"}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deterministic clinical safety evaluation runs parallel to recovery insights and is never softened or overridden.
              </p>
            </div>
          </div>

          {onNavigateSubPage && (
            <button
              onClick={() => onNavigateSubPage("emergency")}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-200 transition flex items-center gap-1.5 shrink-0"
            >
              Review Safety Shield <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* WHAT MIGHT HELP TODAY (ACTION BRIDGE TO F21, F25, F24) */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-900/40 space-y-4">
          <h3 className="text-base font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" /> What Might Help Today?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {insight?.suggestedTodayActions.map((act, i) => (
              <div key={i} className="bg-white dark:bg-[#1A1523] p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex flex-col justify-between space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{act.title}</span>
                {onNavigateSubPage && (
                  <button
                    onClick={() => onNavigateSubPage(act.targetPage)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <span>{act.actionLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SHOW ME THE EVIDENCE MODAL */}
        {isEvidenceModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1A1523] rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <History className="w-5 h-5 text-rose-500" /> Supporting Evidence & Logged Data
                </h3>
                <button
                  onClick={() => setIsEvidenceModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                BloomNest insights are strictly grounded in your actual recorded check-ins and logs. Here is the supporting data:
              </p>

              <div className="space-y-2">
                {insight?.evidencePoints.map((ev) => (
                  <div key={ev.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{ev.featureName}</span>
                      <span className="text-slate-500">{ev.observationText}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-rose-600 dark:text-rose-400">{ev.valueStr}</span>
                      <span className="text-[10px] text-slate-400 block">{ev.dateStr}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setIsEvidenceModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Close Evidence
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

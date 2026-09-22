import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  TrendTimeRangeDays,
  PatternDomain,
  SingleModuleTrend,
  CrossModulePattern,
  OverallTrendAnalysisResult,
  PostpartumProfile,
  PageView,
} from "../types";
import { calculatePostpartumDay, calculatePostpartumWeek, getRecoveryStage } from "../utils/postpartumUtils";
import { analyzeTrendsAndPatterns } from "../utils/trendPatternEngine";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Clock,
  Heart,
  Moon,
  Smile,
  ShieldAlert,
  ShieldCheck,
  Info,
  Sliders,
  Sparkles,
  HelpCircle,
  XCircle,
  ChevronRight,
  FileText,
  Baby,
  Stethoscope,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowRight,
  Droplet,
  HeartPulse,
  Pill,
  Utensils,
  Milk,
  Droplets,
} from "lucide-react";

interface TrendPatternDetectionPageProps {
  onNavigateSubPage?: (page: string) => void;
}

export const TrendPatternDetectionPage: React.FC<TrendPatternDetectionPageProps> = ({
  onNavigateSubPage,
}) => {
  const { user } = useApp();

  // State
  const [timeRangeDays, setTimeRangeDays] = useState<TrendTimeRangeDays>(7);
  const [analysisResult, setAnalysisResult] = useState<OverallTrendAnalysisResult | null>(null);
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>("all");
  const [profile, setProfile] = useState<PostpartumProfile | null>(null);

  // Modal State for "Why am I seeing this?"
  const [selectedTrendForModal, setSelectedTrendForModal] = useState<SingleModuleTrend | null>(null);
  const [selectedPatternForModal, setSelectedPatternForModal] = useState<CrossModulePattern | null>(null);

  // Load context profile and analyze trends
  useEffect(() => {
    const savedProfile = localStorage.getItem("bloomnest_postpartum_profile_v1");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    const result = analyzeTrendsAndPatterns(timeRangeDays);
    setAnalysisResult(result);
  }, [timeRangeDays, user]);

  const deliveryDateStr = profile?.deliveryDate || new Date().toISOString().split("T")[0];
  const postpartumDay = calculatePostpartumDay(deliveryDateStr);
  const postpartumWeek = calculatePostpartumWeek(postpartumDay);
  const recoveryStageInfo = getRecoveryStage(postpartumDay);

  // Domains list for filter
  const filterDomains: { id: string; label: string }[] = [
    { id: "all", label: "All Domains" },
    { id: "recovery", label: "Mother Recovery" },
    { id: "pain", label: "Pain" },
    { id: "bleeding", label: "Lochia Bleeding" },
    { id: "mother_sleep", label: "Mother Sleep & Fatigue" },
    { id: "mood", label: "Mood & Wellbeing" },
    { id: "baby_sleep", label: "Baby Sleep" },
    { id: "baby_feeding", label: "Baby Feeding" },
    { id: "diapers", label: "Diapers" },
  ];

  const filteredTrends = analysisResult?.singleModuleTrends.filter((t) => {
    if (selectedDomainFilter === "all") return true;
    return t.domain === selectedDomainFilter;
  }) || [];

  const filteredPatterns = analysisResult?.crossModulePatterns.filter((p) => {
    if (selectedDomainFilter === "all") return true;
    return p.primaryDomain === selectedDomainFilter || p.secondaryDomain === selectedDomainFilter;
  }) || [];

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] text-slate-800 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      
      {/* TOP HEADER WITH POSTPARTUM CONTEXT */}
      <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 text-xs font-semibold rounded-full flex items-center gap-1.5 border border-purple-200 dark:border-purple-800">
              <TrendingUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Feature 19 • Care Analytics
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full">
              Day {postpartumDay} • Week {postpartumWeek}
            </span>
            <span className="px-3 py-1 rounded-full bg-rose-500 text-white font-extrabold text-xs">
              {recoveryStageInfo.title}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            Trend & Pattern Detection
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analyzing longitudinal time-series data across Features 1–17 to identify recovery trends and co-occurring patterns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          {onNavigateSubPage && (
            <button
              onClick={() => onNavigateSubPage("doctor-brief")}
              className="px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Doctor Brief (Feat 18)
            </button>
          )}
          {onNavigateSubPage && (
            <button
              onClick={() => onNavigateSubPage("safety")}
              className="px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Safety Shield (Feat 04)
            </button>
          )}
        </div>
      </div>

      {/* SAFETY & CAUSATION BOUNDARY BANNER */}
      <div className="bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl p-4 flex items-start gap-3 text-amber-900 dark:text-amber-200">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs md:text-sm">
          <span className="font-semibold text-amber-950 dark:text-amber-100">Non-Diagnostic Pattern Detection:</span>{" "}
          Feature 19 observes multi-module time-series trends without claiming causation or medical diagnoses. Immediate safety evaluation belongs to Feature 04 (Safety Shield).
        </div>
      </div>

      {/* TIME RANGE SELECTOR & DOMAIN FILTER BAR */}
      <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Select Analysis Time Window
            </span>
            <div className="bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl flex gap-1 border border-slate-200/60 dark:border-slate-800 overflow-x-auto">
              {([3, 7, 14, 30, 90] as TrendTimeRangeDays[]).map((days) => (
                <button
                  key={days}
                  onClick={() => setTimeRangeDays(days)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    timeRangeDays === days
                      ? "bg-white dark:bg-[#1A1523] text-purple-600 dark:text-purple-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Filter by Care Area
            </span>
            <select
              value={selectedDomainFilter}
              onChange={(e) => setSelectedDomainFilter(e.target.value)}
              className="p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500"
            >
              {filterDomains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span>Analyzing window: <strong>{analysisResult?.startDate}</strong> to <strong>{analysisResult?.endDate}</strong></span>
          <span>{analysisResult?.totalRecordsAnalyzed || 0} total records evaluated</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: RECOVERY TRAJECTORY CARD (LEVEL 5)                              */}
      {/* ========================================================================= */}
      {analysisResult?.trajectory && (
        <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                Level 5 • Recovery Trajectory
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                {analysisResult.trajectory.stageName} Recovery Trajectory
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {analysisResult.trajectory.postpartumRange}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 ${
                analysisResult.trajectory.overallRecoveryTrend === "increasing"
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                  : analysisResult.trajectory.overallRecoveryTrend === "decreasing"
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                  : "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              {analysisResult.trajectory.overallRecoveryTrend === "increasing"
                ? "Improving Trajectory"
                : analysisResult.trajectory.overallRecoveryTrend === "decreasing"
                ? "Monitoring Pain Trend"
                : "Stable Recovery Trajectory"}
            </span>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            {analysisResult.trajectory.summaryText}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Pain Direction</span>
              <strong className={`text-sm capitalize ${analysisResult.trajectory.painTrend === "increasing" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {analysisResult.trajectory.painTrend}
              </strong>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Lochia Bleeding</span>
              <strong className="text-sm capitalize text-slate-900 dark:text-white">
                {analysisResult.trajectory.bleedingTrend}
              </strong>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Mobility Trend</span>
              <strong className="text-sm capitalize text-slate-900 dark:text-white">
                {analysisResult.trajectory.mobilityTrend}
              </strong>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Rest & Energy</span>
              <strong className="text-sm capitalize text-slate-900 dark:text-white">
                {analysisResult.trajectory.energyTrend}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: SINGLE-MODULE DIRECTIONAL TREND CARDS (LEVEL 1)                 */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Level 1 • Single-Module Directional Trends ({filteredTrends.length})
        </h2>

        {filteredTrends.length === 0 ? (
          <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-8 text-center border border-dashed border-slate-200 dark:border-slate-800">
            <Info className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Not enough recorded check-ins in the selected time window to establish directional trends.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTrends.map((trend) => (
              <div
                key={trend.id}
                className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[11px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                        {trend.sourceModule}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{trend.title}</h3>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize flex items-center gap-1 ${
                        trend.trend === "increasing"
                          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                          : trend.trend === "decreasing"
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {trend.trend === "increasing" ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : trend.trend === "decreasing" ? (
                        <TrendingDown className="w-3.5 h-3.5" />
                      ) : (
                        <Activity className="w-3.5 h-3.5" />
                      )}
                      {trend.trend}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">{trend.summaryText}</p>

                  {/* DATA POINTS SPARKLINE / HISTORY LIST */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 text-xs space-y-1.5 border border-slate-100 dark:border-slate-800 mb-4">
                    <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200/60 dark:border-slate-800 pb-1">
                      <span>Start Value: {trend.startValueStr}</span>
                      <span>Latest: {trend.endValueStr}</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1 pt-1">
                      {trend.dataPoints.slice(-7).map((dp, idx) => (
                        <div
                          key={idx}
                          className={`p-1 text-center rounded-lg text-[10px] ${
                            dp.isRecorded
                              ? "bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300 font-bold border border-purple-100 dark:border-purple-900/40"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400 italic"
                          }`}
                        >
                          <span className="block truncate">{dp.date.split("-").slice(1).join("/")}</span>
                          <span>{dp.isRecorded ? dp.value : "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 dark:text-slate-500">
                    Confidence: <strong className="capitalize text-slate-700 dark:text-slate-300">{trend.confidence}</strong> ({trend.recordedCount} records)
                  </span>

                  <button
                    onClick={() => setSelectedTrendForModal(trend)}
                    className="text-purple-600 dark:text-purple-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Why am I seeing this?
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: CROSS-MODULE PATTERN CARDS (LEVEL 2, 3, 4)                       */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Levels 2–4 • Cross-Module Co-Occurrence Patterns ({filteredPatterns.length})
        </h2>

        {filteredPatterns.length === 0 ? (
          <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-8 text-center border border-dashed border-slate-200 dark:border-slate-800">
            <Info className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No co-occurring cross-module patterns detected in the current timeframe.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPatterns.map((pat) => (
              <div
                key={pat.id}
                className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 text-[11px] font-extrabold rounded-full">
                      Cross-Module Co-Occurrence
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Observed across {pat.daysObserved} days</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{pat.title}</h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 mb-4">
                    {pat.summaryText}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 dark:text-slate-500">
                    Sources: {pat.sourceModules.length} features linked
                  </span>

                  <button
                    onClick={() => setSelectedPatternForModal(pat)}
                    className="text-purple-600 dark:text-purple-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Why am I seeing this?
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: RECENT CHANGES SUMMARY                                          */}
      {/* ========================================================================= */}
      {analysisResult?.recentChangesSummary && analysisResult.recentChangesSummary.length > 0 && (
        <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Recent Directional Changes Summary
          </h3>
          <ul className="text-xs space-y-2 pl-2">
            {analysisResult.recentChangesSummary.map((change, idx) => (
              <li key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                <span>{change}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: INSUFFICIENT DATA DOMAINS                                       */}
      {/* ========================================================================= */}
      {analysisResult?.insufficientDataDomains && analysisResult.insufficientDataDomains.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
          <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-400" />
            Modules Requiring More Data for Trend Calculations
          </h4>
          <p className="text-slate-500 dark:text-slate-400">
            Fewer than 2 check-ins were found for: <strong className="capitalize text-slate-700 dark:text-slate-300">{analysisResult.insufficientDataDomains.join(", ").replace(/_/g, " ")}</strong>. Continue recording entries in those respective modules to unlock time-series trends.
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: WHY AM I SEEING THIS? (TREND DETAIL)                                */}
      {/* ========================================================================= */}
      {selectedTrendForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1A1523] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800/80 my-8 text-slate-800 dark:text-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Why Am I Seeing This Trend?
              </h3>
              <button onClick={() => setSelectedTrendForModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-extrabold text-purple-600 dark:text-purple-400 uppercase text-[11px] block">
                  {selectedTrendForModal.sourceModule}
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{selectedTrendForModal.title}</h4>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <p><strong>Derived Calculation:</strong> {selectedTrendForModal.explanation}</p>
                <p><strong>Directional Trend:</strong> <span className="capitalize font-bold">{selectedTrendForModal.trend}</span></p>
                <p><strong>Recorded Entries:</strong> {selectedTrendForModal.recordedCount} check-ins across last {selectedTrendForModal.totalDaysInRange} days</p>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-amber-900 dark:text-amber-200">
                <strong>Data Transparency Notice:</strong> No medical diagnosis was made. This pattern represents a mathematical time-series observation directly calculated from your recorded entries.
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => setSelectedTrendForModal(null)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold"
                >
                  Close Explanation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: WHY AM I SEEING THIS? (PATTERN DETAIL)                              */}
      {/* ========================================================================= */}
      {selectedPatternForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1A1523] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800/80 my-8 text-slate-800 dark:text-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Why Am I Seeing This Cross-Module Pattern?
              </h3>
              <button onClick={() => setSelectedPatternForModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 uppercase text-[11px] block">
                  Cross-Module Co-Occurrence Pattern
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{selectedPatternForModal.title}</h4>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <p><strong>Explanation:</strong> {selectedPatternForModal.explanation}</p>
                <p><strong>Linked Feature Modules:</strong> {selectedPatternForModal.sourceModules.join(", ")}</p>
                <p><strong>Observation Frequency:</strong> Occurred on {selectedPatternForModal.daysObserved} days</p>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-amber-900 dark:text-amber-200">
                <strong>Correlation vs Causation Notice:</strong> BloomNest reports co-occurring timeline events. The app does not assume or claim that one event caused the other.
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => setSelectedPatternForModal(null)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold"
                >
                  Close Explanation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TrendPatternDetectionPage;

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Activity,
  ShieldAlert,
  TrendingUp,
  FileText,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowLeft,
  ChevronRight,
  Filter,
  Info,
  Calendar,
  Zap,
  Eye,
  MessageSquare,
  Sparkles,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import {
  PageView,
  PostpartumProfile,
  DetectedAnomalyItem,
  OverallAnomalyAnalysisResult,
  AnomalyDomainCategory,
  AnomalyStatus,
} from "../types";
import {
  analyzeAnomalies,
  updateAnomalyUserMetadata,
} from "../utils/anomalyDetectionEngine";
import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
  getRecoveryStage,
} from "../utils/postpartumUtils";

interface AnomalyDetectionPageProps {
  onNavigate?: (page: PageView) => void;
  profile?: PostpartumProfile | null;
  darkMode?: boolean;
}

export const AnomalyDetectionPage: React.FC<AnomalyDetectionPageProps> = ({
  onNavigate,
  profile,
  darkMode = false,
}) => {
  const [analysisResult, setAnalysisResult] = useState<OverallAnomalyAnalysisResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeWhyModalItem, setActiveWhyModalItem] = useState<DetectedAnomalyItem | null>(null);
  const [activeNoteModalItem, setActiveNoteModalItem] = useState<DetectedAnomalyItem | null>(null);
  const [noteInputText, setNoteInputText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const deliveryDateStr = profile?.deliveryDate || new Date().toISOString().split("T")[0];
  const postpartumDay = calculatePostpartumDay(deliveryDateStr);
  const postpartumWeek = calculatePostpartumWeek(postpartumDay);
  const recoveryStage = getRecoveryStage(postpartumDay).title;

  const refreshAnalysis = () => {
    const res = analyzeAnomalies({ profile });
    setAnalysisResult(res);
  };

  useEffect(() => {
    refreshAnalysis();
  }, [profile]);

  if (!analysisResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] dark:bg-[#120E18] text-slate-800 dark:text-slate-200">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-amber-500 animate-spin" />
          <span className="text-sm font-semibold">Analyzing personal baselines & detecting anomalies...</span>
        </div>
      </div>
    );
  }

  const filteredAnomalies = analysisResult.anomalies.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sourceFeature.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleMarkReviewed = (item: DetectedAnomalyItem) => {
    updateAnomalyUserMetadata(item.id, "reviewed", item.userNotes);
    refreshAnalysis();
  };

  const handleSaveNote = () => {
    if (!activeNoteModalItem) return;
    updateAnomalyUserMetadata(activeNoteModalItem.id, "reviewed", noteInputText);
    setActiveNoteModalItem(null);
    setNoteInputText("");
    refreshAnalysis();
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "safety_related":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Safety Review Recommended
          </span>
        );
      case "significant":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Significant Deviation
          </span>
        );
      case "possible":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> Possible Anomaly
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Normal Baseline
          </span>
        );
    }
  };

  const getCategoryLabel = (cat: AnomalyDomainCategory) => {
    switch (cat) {
      case "physical_recovery": return "Physical Recovery";
      case "feeding_lactation": return "Feeding & Lactation";
      case "baby_output": return "Baby Output";
      case "sleep": return "Mother & Baby Sleep";
      case "emotional": return "Emotional Wellbeing";
      case "nutrition": return "Nutrition & Hydration";
      case "medication": return "Medication";
      default: return cat;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] text-slate-800 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto transition-colors">
      
      {/* TOP HEADER WITH POSTPARTUM CONTEXT (Identical to Feat 17 & 18 Design) */}
      <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-xs font-semibold rounded-full flex items-center gap-1.5 border border-amber-200 dark:border-amber-800">
              <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Feature 20 • Postpartum Care
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full">
              Day {postpartumDay} • Week {postpartumWeek}
            </span>
            <span className="px-3 py-1 rounded-full bg-rose-500 text-white font-extrabold text-xs">
              {recoveryStage}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            Anomaly Detection Engine
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Answers: <span className="font-semibold text-slate-700 dark:text-slate-200">“Is something happening now that is unexpectedly different from what has previously been recorded for this mother or baby?”</span>
          </p>
        </div>

        {/* Quick Nav Actions */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          {onNavigate && (
            <button
              onClick={() => onNavigate("emergency")}
              className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Safety Shield (Feat 04)
            </button>
          )}
          {onNavigate && (
            <button
              onClick={() => onNavigate("postpartum-trends")}
              className="px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Trends (Feat 19)
            </button>
          )}
          {onNavigate && (
            <button
              onClick={() => onNavigate("postpartum-doctor-brief")}
              className="px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Doctor Brief (Feat 18)
            </button>
          )}
        </div>
      </div>

      {/* ARCHITECTURE BOUNDARY BANNER */}
      <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800/80 space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            BloomNest Architecture: Feature 19 vs Feature 20 vs Feature 04
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-[#231C30] border border-purple-100 dark:border-purple-900/40 text-slate-700 dark:text-slate-300">
            <div className="font-bold text-purple-700 dark:text-purple-300 mb-1">Feature 19 — Trend & Pattern</div>
            <div><span className="font-medium">Main Question:</span> “What is changing or repeating over time?”</div>
            <div className="text-slate-400 mt-1 italic">Example: Pain gradually increased from 3 → 4 → 5.</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-[#231C30] border border-amber-100 dark:border-amber-900/40 text-slate-700 dark:text-slate-300">
            <div className="font-bold text-amber-700 dark:text-amber-300 mb-1">Feature 20 — Anomaly Detection</div>
            <div><span className="font-medium">Main Question:</span> “What is unexpectedly different from baseline?”</div>
            <div className="text-slate-400 mt-1 italic">Example: Pain suddenly jumped from 3–4 baseline → 8 today.</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-[#231C30] border border-rose-100 dark:border-rose-900/40 text-slate-700 dark:text-slate-300">
            <div className="font-bold text-rose-700 dark:text-rose-300 mb-1">Feature 04 — Safety Shield</div>
            <div><span className="font-medium">Main Question:</span> “Does this require medical safety attention?”</div>
            <div className="text-slate-400 mt-1 italic">Evaluates validated clinical safety rules independently.</div>
          </div>
        </div>
      </div>

      {/* OVERVIEW STATUS CARD */}
      <div className={`rounded-3xl p-6 shadow-sm border ${
        analysisResult.overallStatus === "safety_recommended"
          ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
          : analysisResult.overallStatus === "significant_deviation"
          ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
          : "bg-white dark:bg-[#1A1523] border-slate-100 dark:border-slate-800/80"
      } space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3.5 rounded-2xl ${
              analysisResult.overallStatus === "safety_recommended"
                ? "bg-rose-500 text-white"
                : analysisResult.overallStatus === "significant_deviation"
                ? "bg-amber-500 text-white"
                : "bg-emerald-500 text-white"
            }`}>
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Today's Baseline Evaluation</span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {analysisResult.overallStatus === "safety_recommended"
                  ? "Safety Shield Evaluation Recommended"
                  : analysisResult.overallStatus === "significant_deviation"
                  ? "Significant Baseline Deviation Detected"
                  : analysisResult.overallStatus === "possible_anomaly"
                  ? "Possible Baseline Anomaly Flagged"
                  : "No Unusual Baseline Changes Detected"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {analysisResult.totalAnomaliesDetected} anomaly flag(s) identified against 7-day personal recorded baselines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Evaluated at:</span>
            <span className="text-xs font-mono font-medium px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {new Date(analysisResult.evaluatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Missing Data Alert Banner */}
        {analysisResult.missingDataAlerts.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-500" /> Missing Data Safety Rule Enforced
            </div>
            {analysisResult.missingDataAlerts.map((m, idx) => (
              <div key={idx} className="pl-5 text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-amber-700 dark:text-amber-400">{m.featureName}:</span> {m.text}
              </div>
            ))}
          </div>
        )}

        {/* Multi-Signal Co-Occurrence Alert Banner */}
        {analysisResult.multiSignalCoOccurrences.length > 0 && (
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-900 dark:text-purple-300 space-y-2">
            <div className="font-bold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" /> Multi-Signal Co-Occurrence Detected
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              {analysisResult.multiSignalCoOccurrences[0].description}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="font-semibold text-purple-700 dark:text-purple-400">Correlated Indicators:</span>
              <span className="px-2.5 py-0.5 rounded-md bg-purple-200/60 dark:bg-purple-900/50 font-mono text-[11px] font-semibold text-purple-900 dark:text-purple-200">Pain + Sleep + Mood</span>
            </div>
          </div>
        )}
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Categories" },
            { id: "physical_recovery", label: "Physical Recovery" },
            { id: "feeding_lactation", label: "Feeding & Lactation" },
            { id: "baby_output", label: "Baby Output" },
            { id: "sleep", label: "Sleep" },
            { id: "emotional", label: "Emotional" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-white dark:bg-[#1A1523] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search anomalies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-2xl border bg-white dark:bg-[#1A1523] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
      </div>

      {/* ANOMALIES LIST */}
      <div className="space-y-4">
        {filteredAnomalies.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#1A1523] rounded-3xl border border-slate-100 dark:border-slate-800/80 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Baseline Anomalies Flagged</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No recorded values differ significantly from your recent baseline range in the selected category.
            </p>
          </div>
        ) : (
          filteredAnomalies.map((item) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-[#1A1523] rounded-3xl p-6 shadow-sm border transition-all ${
                item.severity === "safety_related"
                  ? "border-rose-300 dark:border-rose-800/60"
                  : item.severity === "significant"
                  ? "border-amber-200 dark:border-amber-800/60"
                  : "border-slate-100 dark:border-slate-800/80"
              } space-y-4`}
            >
              {/* Item Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(item.severity)}
                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                      {item.sourceFeature}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === "reviewed" ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed by User
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      New Observation
                    </span>
                  )}
                </div>
              </div>

              {/* Baseline Comparison Grid (BloomNest Standard Specification) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-[#231C30] p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                {/* Column 1: Today's Value */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Recorded Value</span>
                  <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                    {item.observedValueStr}
                  </div>
                  <span className="text-[11px] text-slate-400">Latest entry recorded today</span>
                </div>

                {/* Column 2: Recent Baseline */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent Baseline Range</span>
                  <div className="text-lg font-bold text-slate-700 dark:text-slate-200">
                    {item.baseline.baselineRangeStr}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Calculated from {item.baseline.dataPointsCount} logs ({item.baseline.periodDays}-day window)
                  </span>
                </div>

                {/* Column 3: Net Difference */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Deviation</span>
                  <div className="text-base font-bold text-rose-600 dark:text-rose-400">
                    {item.differenceStr}
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                    Data Strength: {item.baseline.confidence}
                  </span>
                </div>
              </div>

              {/* Rationale Text */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.explanation}
              </p>

              {/* User Note Display */}
              {item.userNotes && (
                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-900 dark:text-purple-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-500" /> User Context Note
                  </div>
                  <p className="italic">"{item.userNotes}"</p>
                </div>
              )}

              {/* Interactive Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveWhyModalItem(item)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 flex items-center gap-1.5 transition-all"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Why was this detected?
                  </button>

                  <button
                    onClick={() => {
                      setActiveNoteModalItem(item);
                      setNoteInputText(item.userNotes || "");
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 flex items-center gap-1.5 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-purple-500" /> Mark as Reviewed / Add Note
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {item.requiresSafetyReview && onNavigate && (
                    <button
                      onClick={() => onNavigate("emergency")}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" /> Safety Shield (Feat 04)
                    </button>
                  )}
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate("postpartum-doctor-brief")}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" /> Include in Doctor Brief (Feat 18)
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: "Why Was This Detected?" Modal */}
      {activeWhyModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A1523] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold">Why was this anomaly detected?</h3>
              </div>
              <button
                onClick={() => setActiveWhyModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                {activeWhyModalItem.title} ({activeWhyModalItem.sourceFeature})
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#231C30] border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                {activeWhyModalItem.whyDetectedBullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-500" /> Important Non-Diagnostic Boundary
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Feature 20 detects data deviations from your recorded baseline. Clinical safety evaluation belongs to Feature 04 (Safety Shield). Feature 20 never diagnoses medical conditions.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveWhyModalItem(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-sm"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: "Mark as Reviewed / Add User Note" Modal */}
      {activeNoteModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A1523] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-bold">Review Anomaly & Add Personal Note</h3>
              </div>
              <button
                onClick={() => setActiveNoteModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You can mark <span className="font-bold text-slate-800 dark:text-white">{activeNoteModalItem.title}</span> as reviewed and add context (e.g., "Expected due to poor sleep" or "Had a busy travel day").
              </p>

              <textarea
                rows={3}
                value={noteInputText}
                onChange={(e) => setNoteInputText(e.target.value)}
                placeholder="Enter personal context note..."
                className="w-full p-3.5 text-xs rounded-2xl border bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveNoteModalItem(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-md"
              >
                Save Review & Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from "react";
import { Card, CardHeading, BodyText, Badge, Button } from "../ui";
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Clock,
  RefreshCw,
  FileText,
  Activity,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Minus,
  CheckCircle2,
} from "lucide-react";
import { TimelineAnalysisResult } from "../../types";

interface TimelineAIAnalysisCardProps {
  analysis: TimelineAnalysisResult;
  isAnalyzing: boolean;
  onRefreshAnalysis: () => void;
  onSelectScenario?: (scenarioName: "healthy" | "gdm" | "anemia") => void;
}

export const TimelineAIAnalysisCard: React.FC<TimelineAIAnalysisCardProps> = ({
  analysis,
  isAnalyzing,
  onRefreshAnalysis,
  onSelectScenario,
}) => {
  const isLow = analysis.overallRiskLevel === "LOW";
  const isModerate = analysis.overallRiskLevel === "MODERATE";
  const isHigh = analysis.overallRiskLevel === "ATTENTION_REQUIRED";

  const riskBadgeVariant = isHigh ? "rose" : isModerate ? "coral" : "sage";
  const riskIcon = isHigh ? (
    <AlertCircle className="w-4 h-4 text-rose-600" />
  ) : isModerate ? (
    <AlertTriangle className="w-4 h-4 text-amber-600" />
  ) : (
    <ShieldCheck className="w-4 h-4 text-emerald-600" />
  );

  return (
    <div className="space-y-6">
      {/* Top Clinical Synthesis Hero Banner */}
      <Card
        variant="glass"
        radius="3xl"
        className="p-6 sm:p-7 relative overflow-hidden border-rose-200/80 dark:border-rose-900/60 bg-gradient-to-br from-white via-rose-50/40 to-pink-50/20 dark:from-[#1E1726] dark:via-[#1A1422] dark:to-[#241B2D]"
      >
        <div className="space-y-5">
          {/* Header Controls & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 dark:border-rose-900/40 pb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="rose" size="md" icon={<Sparkles className="w-4 h-4 text-rose-500" />}>
                Maternal-Fetal Clinical Intelligence
              </Badge>
              <span className="text-xs font-semibold text-gray-500 dark:text-rose-300">
                {analysis.source === "GEMINI_AI" ? "Powered by Gemini 2.5/3.8 Flash" : "Algorithmic Clinical Rule Engine"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onRefreshAnalysis}
                disabled={isAnalyzing}
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin text-rose-500" : ""}`} />}
              >
                {isAnalyzing ? "Analyzing Trajectory..." : "Re-Analyze Timeline"}
              </Button>
            </div>
          </div>

          {/* Core Scorecard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Risk Stratification */}
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#1A1523]/80 border border-rose-100 dark:border-rose-900/40 space-y-1.5">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Stratified Clinical Risk
              </div>
              <div className="flex items-center gap-2">
                {riskIcon}
                <span className="text-lg font-black text-gray-900 dark:text-rose-100">
                  {analysis.overallRiskLevel === "LOW"
                    ? "Low Maternal-Fetal Risk"
                    : analysis.overallRiskLevel === "MODERATE"
                    ? "Moderate Risk (Under Surveillance)"
                    : "Attention & Review Advised"}
                </span>
              </div>
              <div className="text-xs text-gray-600 dark:text-rose-300">
                {analysis.overallRiskLevel === "LOW"
                  ? "Reassuring longitudinal organogenesis and growth."
                  : "Requires targeted biochemical or fetal growth follow-up."}
              </div>
            </div>

            {/* Gestational Timing Adherence */}
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#1A1523]/80 border border-rose-100 dark:border-rose-900/40 space-y-1.5">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                <span>Gestational Timing Adherence</span>
                <span className="text-rose-600 font-black">{analysis.gestationalTimingScore}%</span>
              </div>
              <div className="w-full bg-rose-100 dark:bg-rose-950/60 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${analysis.gestationalTimingScore}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 dark:text-rose-300 truncate">
                {analysis.timingAdherenceNote}
              </div>
            </div>

            {/* Scenarios Switcher */}
            {onSelectScenario && (
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#1A1523]/80 border border-rose-100 dark:border-rose-900/40 space-y-2">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Interactive Test Scenarios
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={() => onSelectScenario("healthy")}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  >
                    Optimal Baseline
                  </button>
                  <button
                    onClick={() => onSelectScenario("gdm")}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                  >
                    GDM Case
                  </button>
                  <button
                    onClick={() => onSelectScenario("anemia")}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                  >
                    Anemia Case
                  </button>
                </div>
                <div className="text-[10px] text-gray-500">
                  Switch cases to simulate cross-modal correlation changes.
                </div>
              </div>
            )}
          </div>

          {/* Full Narrative Clinical Summary */}
          <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-xs text-gray-800 dark:text-rose-100 leading-relaxed">
            <strong className="text-rose-950 dark:text-white font-extrabold flex items-center gap-1.5 mb-1.5">
              <FileText className="w-4 h-4 text-rose-600" />
              Clinical Timeline Synthesis:
            </strong>
            {analysis.clinicalSummary}
          </div>

          {/* Biomarker Trajectory Summary Pills */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-gray-700 dark:text-rose-200">
              Key Biomarker Trajectories & Trends
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {analysis.keyBiomarkerTrends.map((trend, idx) => {
                const isOptimal = trend.status === "optimal";
                const isWatch = trend.status === "watch";
                const isAction = trend.status === "action";

                const badgeBg = isAction
                  ? "border-rose-300 bg-rose-50/70 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
                  : isWatch
                  ? "border-amber-300 bg-amber-50/70 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                  : "border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200";

                const trendIcon =
                  trend.trend === "increasing" ? (
                    <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                  ) : trend.trend === "decreasing" ? (
                    <TrendingDown className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 text-emerald-500" />
                  );

                return (
                  <div key={idx} className={`p-3 rounded-xl border text-xs space-y-1 ${badgeBg}`}>
                    <div className="flex items-center justify-between font-bold">
                      <span className="truncate">{trend.biomarker}</span>
                      <div className="flex items-center gap-1">
                        {trendIcon}
                        <span className="text-[10px] uppercase font-black tracking-wider">
                          {trend.trend}
                        </span>
                      </div>
                    </div>
                    <div className="font-extrabold text-sm">{trend.currentValue}</div>
                    <div className="text-[11px] opacity-80 line-clamp-2 leading-tight">
                      {trend.clinicalSignificance}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actionable Watchlist & Recommended Clinical Next Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Watchlist */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1523] border border-rose-100 dark:border-rose-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 dark:text-rose-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  Actionable Timeline Watchlist
                </span>
                <span className="text-[10px] text-gray-500">{analysis.watchlistItems.length} items</span>
              </div>
              <div className="space-y-2.5">
                {analysis.watchlistItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-gray-900 dark:text-rose-100">
                      <span>{item.item}</span>
                      <Badge
                        variant={item.urgency === "immediate" ? "rose" : item.urgency === "soon" ? "coral" : "sage"}
                        size="sm"
                      >
                        {item.urgency.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-gray-600 dark:text-rose-300">
                      <strong>Rationale:</strong> {item.rationale}
                    </div>
                    <div className="text-[11px] text-rose-800 dark:text-rose-300 font-semibold">
                      <strong>Action:</strong> {item.recommendedAction}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor Questions & Red Flags */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1523] border border-rose-100 dark:border-rose-900/40 space-y-3">
              <div className="text-xs font-bold text-gray-800 dark:text-rose-200 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
                Questions for Next OB-GYN Consultation
              </div>
              <ul className="space-y-2 text-xs text-gray-700 dark:text-rose-200">
                {analysis.suggestedDoctorQuestions.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{q}</span>
                  </li>
                ))}
              </ul>

              {/* Red Flag Warning Box */}
              <div className="p-3 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-[11px] text-red-900 dark:text-red-200 space-y-1">
                <div className="font-extrabold flex items-center gap-1 text-red-700 dark:text-red-300">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  Emergency Red Flags (Contact Hospital Immediately):
                </div>
                <ul className="list-disc list-inside space-y-0.5 opacity-90">
                  {analysis.urgentWarningSigns.slice(0, 2).map((sign, sIdx) => (
                    <li key={sIdx}>{sign}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

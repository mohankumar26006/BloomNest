import React from "react";
import { Card, CardHeading, BodyText, Badge } from "../ui";
import { GitCompare, ArrowRight, ShieldCheck, AlertTriangle, AlertCircle, Info, Stethoscope, TestTube2 } from "lucide-react";
import { CrossModalCorrelation } from "../../types";

interface CrossModalCorrelationMatrixProps {
  correlations: CrossModalCorrelation[];
}

export const CrossModalCorrelationMatrix: React.FC<CrossModalCorrelationMatrixProps> = ({ correlations }) => {
  return (
    <Card variant="glass" radius="3xl" className="p-6 sm:p-7 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 dark:border-rose-900/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="rose" size="sm" icon={<GitCompare className="w-3.5 h-3.5" />}>
              Cross-Modal Synthesis
            </Badge>
            <span className="text-xs text-gray-500 dark:text-rose-300 font-semibold">Labs ⇄ Ultrasound Scans</span>
          </div>
          <CardHeading className="text-xl mt-1">Cross-Modal Clinical Correlations</CardHeading>
          <BodyText className="text-xs">
            How biochemical laboratory findings correlate directly with maternal-fetal ultrasound observations.
          </BodyText>
        </div>

        <div className="text-xs text-gray-500 dark:text-rose-300 font-medium">
          {correlations.length} Active Cross-Correlations Evaluated
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {correlations.map((corr) => {
          const isNormal = corr.severity === "normal";
          const isBorderline = corr.severity === "borderline";
          const isConcerning = corr.severity === "concerning";

          const borderStyle = isConcerning
            ? "border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20"
            : isBorderline
            ? "border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20"
            : "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/15";

          const icon = isConcerning ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          ) : isBorderline ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          );

          const badgeVariant = isConcerning ? "rose" : isBorderline ? "coral" : "sage";

          return (
            <div
              key={corr.id}
              className={`p-5 rounded-2xl border transition-all space-y-4 hover:shadow-xs ${borderStyle}`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {icon}
                  <h4 className="font-bold text-sm text-gray-900 dark:text-rose-100">
                    {corr.title}
                  </h4>
                </div>
                <Badge variant={badgeVariant} size="sm">
                  {corr.severity === "normal"
                    ? "Normal Concordance ✓"
                    : corr.severity === "borderline"
                    ? "Borderline Watchlist ⚠️"
                    : "Clinical Action Required 🚨"}
                </Badge>
              </div>

              {/* Two Column Markers Flow */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Laboratory Input */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#1f1929] border border-rose-100 dark:border-rose-900/40 space-y-1">
                  <div className="text-[10px] uppercase font-black tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <TestTube2 className="w-3.5 h-3.5" />
                    <span>Laboratory Investigation Marker</span>
                  </div>
                  <div className="text-xs font-semibold text-gray-900 dark:text-rose-100 leading-snug">
                    {corr.labMarker}
                  </div>
                </div>

                {/* Ultrasound Scan Finding */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#1f1929] border border-rose-100 dark:border-rose-900/40 space-y-1">
                  <div className="text-[10px] uppercase font-black tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Ultrasound Imaging Finding</span>
                  </div>
                  <div className="text-xs font-semibold text-gray-900 dark:text-rose-100 leading-snug">
                    {corr.scanFinding}
                  </div>
                </div>
              </div>

              {/* Correlation Analysis & Clinical Implication */}
              <div className="space-y-2 text-xs pt-1">
                <div className="text-gray-700 dark:text-rose-200 leading-relaxed">
                  <strong className="text-gray-900 dark:text-rose-100 font-bold">Physiological Correlation: </strong>
                  {corr.correlationAnalysis}
                </div>
                <div className="text-rose-800 dark:text-rose-300 font-medium">
                  <strong className="text-rose-900 dark:text-rose-200 font-bold">Clinical Implication: </strong>
                  {corr.clinicalImplication}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

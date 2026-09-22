import React, { useState } from "react";
import { Card, CardHeading, BodyText, Badge, Button } from "../ui";
import {
  Stethoscope,
  TestTube2,
  Activity,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  FileCheck,
  Upload,
  Plus,
  Filter,
  Eye,
  Edit3,
} from "lucide-react";
import { ScanLabMilestoneRecord, BiomarkerMetric } from "../../types";

interface ChronologicalScanLabFeedProps {
  records: ScanLabMilestoneRecord[];
  onOpenReportModal?: (record: ScanLabMilestoneRecord) => void;
  onEditRecord?: (record: ScanLabMilestoneRecord) => void;
  onAddNewRecord?: () => void;
}

export const ChronologicalScanLabFeed: React.FC<ChronologicalScanLabFeedProps> = ({
  records,
  onOpenReportModal,
  onEditRecord,
  onAddNewRecord,
}) => {
  const [activeFilter, setActiveFilter] = useState<"ALL" | "ULTRASOUND" | "LAB" | "COMPLETED" | "ATTENTION">("ALL");

  const filteredRecords = records.filter((rec) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "ULTRASOUND") return rec.type === "ULTRASOUND";
    if (activeFilter === "LAB") return rec.type === "LAB_INVESTIGATION";
    if (activeFilter === "COMPLETED") return rec.status === "COMPLETED";
    if (activeFilter === "ATTENTION") return rec.clinicalStatus === "ATTENTION" || rec.clinicalStatus === "BORDERLINE";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Controls & Filter Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardHeading className="text-xl">Chronological Scan & Lab Timeline</CardHeading>
          <BodyText className="text-xs">
            Complete sequential record of all ultrasound scans, maternal laboratory panels, and fetal monitoring.
          </BodyText>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white dark:bg-[#1A1523] border border-rose-200/60 dark:border-rose-900/40 text-xs">
            <button
              onClick={() => setActiveFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeFilter === "ALL"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-gray-700 dark:text-rose-200 hover:text-rose-600"
              }`}
            >
              All ({records.length})
            </button>
            <button
              onClick={() => setActiveFilter("ULTRASOUND")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeFilter === "ULTRASOUND"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-gray-700 dark:text-rose-200 hover:text-rose-600"
              }`}
            >
              Scans
            </button>
            <button
              onClick={() => setActiveFilter("LAB")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeFilter === "LAB"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-gray-700 dark:text-rose-200 hover:text-rose-600"
              }`}
            >
              Labs
            </button>
            <button
              onClick={() => setActiveFilter("COMPLETED")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeFilter === "COMPLETED"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-gray-700 dark:text-rose-200 hover:text-rose-600"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveFilter("ATTENTION")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeFilter === "ATTENTION"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-gray-700 dark:text-rose-200 hover:text-rose-600"
              }`}
            >
              Watchlist
            </button>
          </div>

          {onAddNewRecord && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onAddNewRecord}
              leftIcon={<Plus className="w-3.5 h-3.5 text-rose-500" />}
            >
              Log Result
            </Button>
          )}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-rose-200 dark:border-rose-900/50 space-y-6">
        {filteredRecords.map((rec) => {
          const isUltrasound = rec.type === "ULTRASOUND";
          const isCompleted = rec.status === "COMPLETED";
          const isDue = rec.status === "DUE_NOW";

          const statusBadge = isCompleted ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed {rec.completedDate ? `· ${rec.completedDate}` : ""}</span>
            </span>
          ) : isDue ? (
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold text-xs animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>Due Now (Window Open)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-gray-500 dark:text-rose-300 font-semibold text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>Scheduled Upcoming</span>
            </span>
          );

          const dotColor = isCompleted
            ? "bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950/60"
            : isDue
            ? "bg-rose-500 ring-4 ring-rose-100 dark:ring-rose-950/60 animate-ping"
            : "bg-gray-300 dark:bg-gray-700 ring-4 ring-gray-100 dark:ring-gray-800";

          return (
            <div key={rec.id} className="relative group">
              {/* Timeline Marker Dot */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-5 w-4 h-4 rounded-full ${dotColor}`}
              />

              {/* Milestone Card */}
              <Card
                variant="glass"
                radius="3xl"
                className={`p-5 sm:p-6 space-y-4 hover:shadow-md transition-all ${
                  rec.clinicalStatus === "ATTENTION"
                    ? "border-rose-300 dark:border-rose-800/80 bg-rose-50/20"
                    : rec.clinicalStatus === "BORDERLINE"
                    ? "border-amber-200 dark:border-amber-900/60 bg-amber-50/15"
                    : ""
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 dark:border-rose-900/30 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-200 text-xs font-black">
                      Week {rec.gestationalWeek} · Trimester {rec.trimester}
                    </span>

                    <Badge
                      variant={isUltrasound ? "lavender" : "rose"}
                      size="sm"
                      icon={isUltrasound ? <Stethoscope className="w-3 h-3" /> : <TestTube2 className="w-3 h-3" />}
                    >
                      {rec.category}
                    </Badge>

                    {rec.clinicalStatus === "ATTENTION" && (
                      <Badge variant="rose" size="sm" icon={<AlertCircle className="w-3 h-3" />}>
                        Needs Clinical Review
                      </Badge>
                    )}
                    {rec.clinicalStatus === "BORDERLINE" && (
                      <Badge variant="coral" size="sm" icon={<AlertCircle className="w-3 h-3" />}>
                        Borderline / Watchlist
                      </Badge>
                    )}
                  </div>

                  <div>{statusBadge}</div>
                </div>

                {/* Title & Findings */}
                <div className="space-y-1.5">
                  <CardHeading className="text-lg text-gray-900 dark:text-rose-100">
                    {rec.title}
                  </CardHeading>
                  <BodyText className="text-xs text-gray-700 dark:text-rose-200 leading-relaxed">
                    {rec.findingsSummary}
                  </BodyText>
                </div>

                {/* Key Biomarkers Table / Chips */}
                {rec.keyBiomarkers && rec.keyBiomarkers.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {rec.keyBiomarkers.map((bio, idx) => {
                      const isHigh = bio.status === "high";
                      const isLow = bio.status === "low";
                      const isBorder = bio.status === "borderline";

                      const statusPill = isHigh
                        ? "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200"
                        : isLow
                        ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200"
                        : isBorder
                        ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300";

                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border text-xs space-y-0.5 ${statusPill}`}
                        >
                          <div className="text-[10px] font-semibold opacity-75 truncate">{bio.name}</div>
                          <div className="font-extrabold text-xs">
                            {bio.value} {bio.unit || ""}
                          </div>
                          {bio.referenceRange && (
                            <div className="text-[9px] opacity-60">Ref: {bio.referenceRange}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Doctor Note */}
                {rec.doctorNotes && (
                  <div className="p-3 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-800 text-xs text-gray-700 dark:text-rose-200">
                    <strong className="text-gray-900 dark:text-rose-100 font-bold">Doctor's Clinical Note: </strong>
                    {rec.doctorNotes}
                  </div>
                )}

                {/* Actions Bar */}
                <div className="pt-2 flex items-center justify-between border-t border-rose-100/60 dark:border-rose-900/20 text-xs">
                  <div className="flex items-center gap-2">
                    {rec.reportAttached ? (
                      <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Diagnostic Report Attached ✓</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-rose-400">No report file attached</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {onEditRecord && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditRecord(rec)}
                        leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                      >
                        Edit / Update
                      </Button>
                    )}

                    {onOpenReportModal && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onOpenReportModal(rec)}
                        leftIcon={rec.reportAttached ? <Eye className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                      >
                        {rec.reportAttached ? "View File" : "Attach File"}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { Card, CardHeading, BodyText, Button, Badge } from "../ui";
import { X, Save, Stethoscope, TestTube2, AlertCircle } from "lucide-react";
import { ScanLabMilestoneRecord, BiomarkerMetric } from "../../types";

interface LogScanLabResultModalProps {
  initialRecord?: ScanLabMilestoneRecord | null;
  onSave: (record: ScanLabMilestoneRecord) => void;
  onClose: () => void;
}

export const LogScanLabResultModal: React.FC<LogScanLabResultModalProps> = ({
  initialRecord,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(initialRecord?.title || "");
  const [type, setType] = useState<"ULTRASOUND" | "LAB_INVESTIGATION" | "FETAL_MONITORING">(
    initialRecord?.type || "LAB_INVESTIGATION"
  );
  const [category, setCategory] = useState<any>(
    initialRecord?.category || "Biochemical Lab"
  );
  const [gestationalWeek, setGestationalWeek] = useState<number>(initialRecord?.gestationalWeek || 24);
  const [status, setStatus] = useState<"COMPLETED" | "DUE_NOW" | "UPCOMING">(
    initialRecord?.status || "COMPLETED"
  );
  const [clinicalStatus, setClinicalStatus] = useState<"NORMAL" | "BORDERLINE" | "ATTENTION">(
    initialRecord?.clinicalStatus || "NORMAL"
  );
  const [findingsSummary, setFindingsSummary] = useState(
    initialRecord?.findingsSummary || ""
  );
  const [doctorNotes, setDoctorNotes] = useState(initialRecord?.doctorNotes || "");

  // Biomarkers
  const [biomarkers, setBiomarkers] = useState<BiomarkerMetric[]>(
    initialRecord?.keyBiomarkers && initialRecord.keyBiomarkers.length > 0
      ? initialRecord.keyBiomarkers
      : [
          { name: "Primary Marker", value: "", unit: "", referenceRange: "", status: "normal" }
        ]
  );

  const handleAddBiomarker = () => {
    setBiomarkers((prev) => [
      ...prev,
      { name: "", value: "", unit: "", referenceRange: "", status: "normal" }
    ]);
  };

  const handleUpdateBiomarker = (idx: number, field: keyof BiomarkerMetric, val: any) => {
    setBiomarkers((prev) => {
      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        [field]: val,
        ...(field === "value" && !isNaN(Number(val)) ? { numericValue: parseFloat(val) } : {})
      };
      return copy;
    });
  };

  const handleRemoveBiomarker = (idx: number) => {
    setBiomarkers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const trimester: 1 | 2 | 3 = gestationalWeek <= 13 ? 1 : gestationalWeek <= 27 ? 2 : 3;

    const updatedRecord: ScanLabMilestoneRecord = {
      id: initialRecord?.id || `rec-custom-${Date.now()}`,
      milestoneId: initialRecord?.milestoneId || `custom-${Date.now()}`,
      title: title.trim(),
      type,
      category,
      gestationalWeek,
      trimester,
      status,
      completedDate: status === "COMPLETED" ? new Date().toISOString().split("T")[0] : undefined,
      clinicalStatus,
      findingsSummary: findingsSummary.trim() || "Test results documented and verified.",
      keyBiomarkers: biomarkers.filter((b) => b.name.trim().length > 0),
      reportAttached: initialRecord?.reportAttached || false,
      doctorNotes: doctorNotes.trim() || undefined,
    };

    onSave(updatedRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1A1523] w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-rose-200 dark:border-rose-900/50 space-y-5 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/40 pb-3">
          <div className="flex items-center gap-2">
            <Badge variant="rose" size="sm" icon={type === "ULTRASOUND" ? <Stethoscope className="w-3.5 h-3.5" /> : <TestTube2 className="w-3.5 h-3.5" />}>
              {initialRecord ? "Edit Record" : "Log Investigation"}
            </Badge>
            <span className="text-xs text-gray-500 font-bold">Week {gestationalWeek}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-rose-100 dark:hover:bg-rose-950 text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-gray-700 dark:text-rose-200">Investigation / Scan Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Third Trimester Growth Scan or OGTT"
                className="w-full p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-xs font-semibold focus:outline-rose-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700 dark:text-rose-200">Modality Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-xs font-semibold"
              >
                <option value="ULTRASOUND">Ultrasound Imaging 📷</option>
                <option value="LAB_INVESTIGATION">Laboratory Investigation 🧪</option>
                <option value="FETAL_MONITORING">Fetal Monitoring / NST 🫀</option>
              </select>
            </div>
          </div>

          {/* Week & Status */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-gray-700 dark:text-rose-200">Gestational Week</label>
              <input
                type="number"
                min={1}
                max={42}
                value={gestationalWeek}
                onChange={(e) => setGestationalWeek(parseInt(e.target.value, 10) || 24)}
                className="w-full p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700 dark:text-rose-200">Completion Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-xs font-semibold"
              >
                <option value="COMPLETED">Completed</option>
                <option value="DUE_NOW">Due Now</option>
                <option value="UPCOMING">Upcoming</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700 dark:text-rose-200">Clinical Evaluation</label>
              <select
                value={clinicalStatus}
                onChange={(e) => setClinicalStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-xs font-semibold"
              >
                <option value="NORMAL">Normal / Reassuring</option>
                <option value="BORDERLINE">Borderline / Watchlist</option>
                <option value="ATTENTION">Attention / Follow-up</option>
              </select>
            </div>
          </div>

          {/* Findings Summary */}
          <div className="space-y-1">
            <label className="font-bold text-gray-700 dark:text-rose-200">Clinical Findings & Impression</label>
            <textarea
              rows={2}
              value={findingsSummary}
              onChange={(e) => setFindingsSummary(e.target.value)}
              placeholder="e.g. Normal anatomical structures, normal liquor volume, no signs of gestational diabetes..."
              className="w-full p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-xs font-normal"
            />
          </div>

          {/* Biomarkers Array */}
          <div className="space-y-2 border-t border-rose-100 dark:border-rose-900/40 pt-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-700 dark:text-rose-200">Measured Biomarkers / Metrics</label>
              <button
                type="button"
                onClick={handleAddBiomarker}
                className="text-rose-600 font-bold hover:underline"
              >
                + Add Marker
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {biomarkers.map((b, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Marker (e.g. Hb, EFW)"
                    value={b.name}
                    onChange={(e) => handleUpdateBiomarker(idx, "name", e.target.value)}
                    className="flex-1 p-2 rounded-lg border border-rose-200 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 11.4)"
                    value={b.value}
                    onChange={(e) => handleUpdateBiomarker(idx, "value", e.target.value)}
                    className="w-20 p-2 rounded-lg border border-rose-200 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Unit (g/dL)"
                    value={b.unit || ""}
                    onChange={(e) => handleUpdateBiomarker(idx, "unit", e.target.value)}
                    className="w-16 p-2 rounded-lg border border-rose-200 text-xs"
                  />
                  <select
                    value={b.status}
                    onChange={(e) => handleUpdateBiomarker(idx, "status", e.target.value)}
                    className="w-20 p-2 rounded-lg border border-rose-200 text-xs"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="low">Low</option>
                    <option value="borderline">Borderline</option>
                  </select>
                  {biomarkers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBiomarker(idx)}
                      className="text-gray-400 hover:text-rose-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Notes */}
          <div className="space-y-1 border-t border-rose-100 dark:border-rose-900/40 pt-2">
            <label className="font-bold text-gray-700 dark:text-rose-200">Doctor's Recommendations</label>
            <input
              type="text"
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="e.g. Continue prenatal iron; follow-up scan in 4 weeks."
              className="w-full p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-xs"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button variant="ghost" size="sm" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" leftIcon={<Save className="w-3.5 h-3.5" />}>
              Save Milestone
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

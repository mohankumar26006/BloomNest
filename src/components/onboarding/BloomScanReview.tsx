import React, { useState } from "react";
import { motion } from "motion/react";
import { ExtractedMedicalField } from "../../types";
import { ProgressHeader } from "./ProgressHeader";
import { ShieldAlert, CheckCircle2, Edit2, Trash2, Plus, ArrowRight, Sparkles, FileText } from "lucide-react";

interface BloomScanReviewProps {
  initialFields?: ExtractedMedicalField[];
  onConfirm: (fields: ExtractedMedicalField[]) => void;
  onBack: () => void;
}

export const BloomScanReview: React.FC<BloomScanReviewProps> = ({
  initialFields,
  onConfirm,
  onBack,
}) => {
  const defaultFields: ExtractedMedicalField[] = [
    { id: "1", category: "ultrasound", label: "Gestational Age", value: "24 Weeks 3 Days", unit: "weeks", date: "2026-08-20" },
    { id: "2", category: "ultrasound", label: "Estimated Due Date (EDD)", value: "2026-11-20", date: "2026-08-20" },
    { id: "3", category: "vitals", label: "Blood Group", value: "O+", date: "2026-08-20" },
    { id: "4", category: "vitals", label: "Blood Pressure", value: "118/74", unit: "mmHg", date: "2026-08-20" },
    { id: "5", category: "lab", label: "Hemoglobin", value: "11.8", unit: "g/dL", referenceRange: "11.0 - 14.0", date: "2026-08-20" },
    { id: "6", category: "lab", label: "Fasting Blood Sugar", value: "88", unit: "mg/dL", referenceRange: "70 - 95", date: "2026-08-20" },
    { id: "7", category: "prescription", label: "Primary OB-GYN", value: "Dr. Ananya Sharma, MD", date: "2026-08-20" },
    { id: "8", category: "prescription", label: "Maternity Hospital", value: "Apollo Cradle Maternity", date: "2026-08-20" },
  ];

  const [fields, setFields] = useState<ExtractedMedicalField[]>(
    initialFields && initialFields.length > 0 ? initialFields : defaultFields
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleStartEdit = (field: ExtractedMedicalField) => {
    setEditingId(field.id);
    setEditValue(field.value);
  };

  const handleSaveEdit = (id: string) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value: editValue } : f))
    );
    setEditingId(null);
  };

  const handleRemove = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAddField = () => {
    if (!newLabel.trim() || !newValue.trim()) return;
    const newField: ExtractedMedicalField = {
      id: Date.now().toString(),
      category: "vitals",
      label: newLabel.trim(),
      value: newValue.trim(),
      date: new Date().toISOString().split("T")[0],
    };
    setFields((prev) => [...prev, newField]);
    setNewLabel("");
    setNewValue("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#FFF0F5] via-[#FFF7F9] to-[#F5E6EC] dark:from-[#120E18] dark:via-[#1A1424] dark:to-[#22172A] text-gray-900 dark:text-rose-100">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl bg-white/90 dark:bg-[#1A1523]/90 backdrop-blur-xl p-6 sm:p-8 rounded-[36px] border border-rose-100 dark:border-rose-900/40 shadow-2xl shadow-rose-200/50 dark:shadow-none space-y-6"
      >
        <ProgressHeader
          currentStep={4}
          totalSteps={4}
          title="👩 Human Review & Data Confirmation"
          onBack={onBack}
        />

        {/* Mandatory Medical Safety Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">Medical Review Required</span>
            <span>
              BloomScan extracted this information from your uploaded report. Please review, edit, or remove any field before saving to your profile.
            </span>
          </div>
        </div>

        {/* Extracted Fields List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Extracted Clinical Fields ({fields.length})</span>
            <span>Edit / Remove</span>
          </div>

          <div className="space-y-2">
            {fields.map((field) => (
              <div
                key={field.id}
                className="p-3.5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-black/30 text-rose-500 flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 dark:text-rose-100 text-xs truncate">
                      {field.label}
                    </div>

                    {editingId === field.id ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="px-2 py-1 rounded-lg bg-white dark:bg-black/40 border border-rose-300 font-bold text-xs flex-1"
                        />
                        <button
                          onClick={() => handleSaveEdit(field.id)}
                          className="px-3 py-1 bg-rose-500 text-white rounded-lg font-bold text-[11px]"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-rose-600 dark:text-rose-300 font-semibold truncate mt-0.5">
                        {field.value} {field.unit || ""} {field.referenceRange ? `(Ref: ${field.referenceRange})` : ""}
                      </div>
                    )}
                  </div>
                </div>

                {editingId !== field.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStartEdit(field)}
                      className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 text-gray-500 hover:text-rose-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemove(field.id)}
                      className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/40 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Custom Field Form */}
        <div className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-black/20 border border-gray-200 dark:border-gray-800 space-y-2 text-xs">
          <div className="font-bold text-gray-600 dark:text-rose-300 text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Plus className="w-3.5 h-3.5 text-rose-500" />
            <span>Add Additional Clinical Field</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. Thyroid TSH Level"
              className="w-full sm:flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#15111C] border border-gray-200 dark:border-gray-700 font-semibold"
            />
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="e.g. 1.8 mIU/L"
              className="w-full sm:flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#15111C] border border-gray-200 dark:border-gray-700 font-semibold"
            />
            <button
              onClick={handleAddField}
              className="w-full sm:w-auto px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold flex items-center justify-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Personalization Calibration Preview */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-purple-500/10 border border-rose-200 dark:border-rose-900/40 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-300">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>Automatic Dashboard Personalization</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 dark:text-rose-200">
            <div className="flex items-center gap-1.5 bg-white/70 dark:bg-black/30 p-2 rounded-xl border border-rose-100 dark:border-rose-900/30">
              <span className="text-sm">🗓️</span>
              <span><strong>Gestational Week:</strong> Auto-set to scan date</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/70 dark:bg-black/30 p-2 rounded-xl border border-rose-100 dark:border-rose-900/30">
              <span className="text-sm">🩺</span>
              <span><strong>Baseline Vitals:</strong> BP, Sugar & Hb synced</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/70 dark:bg-black/30 p-2 rounded-xl border border-rose-100 dark:border-rose-900/30">
              <span className="text-sm">🏥</span>
              <span><strong>Care Team:</strong> OB-GYN & Hospital saved</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/70 dark:bg-black/30 p-2 rounded-xl border border-rose-100 dark:border-rose-900/30">
              <span className="text-sm">🤖</span>
              <span><strong>AI Guidance:</strong> Calibrated to your report</span>
            </div>
          </div>
        </div>

        {/* Confirm Action */}
        <button
          onClick={() => onConfirm(fields)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-rose-500 hover:from-emerald-600 hover:to-rose-600 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Confirm & Enter Personalized Dashboard →</span>
        </button>
      </motion.div>
    </div>
  );
};

import React from "react";
import { motion } from "motion/react";
import { ProgressHeader } from "./ProgressHeader";
import { FileText, UploadCloud, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

interface MedicalReportPromptProps {
  onAddReport: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export const MedicalReportPrompt: React.FC<MedicalReportPromptProps> = ({
  onAddReport,
  onSkip,
  onBack,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#FFF0F5] via-[#FFF7F9] to-[#F5E6EC] dark:from-[#120E18] dark:via-[#1A1424] dark:to-[#22172A] text-gray-900 dark:text-rose-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-white/90 dark:bg-[#1A1523]/90 backdrop-blur-xl p-6 sm:p-8 rounded-[36px] border border-rose-100 dark:border-rose-900/40 shadow-2xl shadow-rose-200/50 dark:shadow-none space-y-6 text-center"
      >
        <ProgressHeader
          currentStep={3}
          totalSteps={4}
          title="📄 Optional Medical Report"
          onBack={onBack}
        />

        <div className="space-y-2 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-900/40 shadow-inner">
            <FileText className="w-8 h-8" />
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-rose-100">
            Do you have a medical report you'd like to add?
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-rose-300 leading-relaxed">
            BloomScan can automatically read your ultrasound scan, lab test, or doctor prescription to digitize your blood group, gestational age, and vitals.
          </p>
        </div>

        {/* Benefits Card */}
        <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-left text-xs space-y-2">
          <div className="font-bold text-rose-600 dark:text-rose-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Why add a report?</span>
          </div>
          <div className="space-y-1 text-gray-600 dark:text-rose-200 text-[11px]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Auto-extracts Blood Group, EDD, and hemoglobin levels</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Full control: Human review is mandatory before saving</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Encrypted & private — clinical data stays secure</span>
            </div>
          </div>
        </div>

        {/* Two Choices */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onAddReport}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <UploadCloud className="w-5 h-5" />
            <span>📄 Add Medical Report & Scan</span>
          </button>

          <button
            onClick={onSkip}
            className="w-full py-3.5 rounded-2xl bg-gray-100 dark:bg-rose-950/40 hover:bg-gray-200 dark:hover:bg-rose-900/60 text-gray-700 dark:text-rose-200 font-bold text-xs border border-gray-200 dark:border-gray-800 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Skip for now → Go to Personalized Dashboard</span>
          </button>
        </div>

        <div className="text-[11px] text-gray-400 dark:text-rose-400">
          This step is completely optional. You can always upload reports later from your Medical Dossier.
        </div>
      </motion.div>
    </div>
  );
};

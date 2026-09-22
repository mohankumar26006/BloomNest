import React from "react";
import { ArrowLeft, Sparkles } from "lucide-react";

interface ProgressHeaderProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  onBack?: () => void;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  currentStep,
  totalSteps,
  title,
  onBack,
}) => {
  const percentage = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  return (
    <div className="w-full max-w-2xl mx-auto mb-6 space-y-3 px-4">
      <div className="flex items-center justify-between">
        {onBack ? (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-rose-600 dark:text-rose-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-500">
            <Sparkles className="w-4 h-4" />
            <span>BloomNest Journey</span>
          </div>
        )}

        <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-100 dark:border-rose-900/40">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      <div className="w-full h-2 bg-rose-100/60 dark:bg-rose-950/40 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="text-center pt-1">
        <h2 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100">{title}</h2>
      </div>
    </div>
  );
};

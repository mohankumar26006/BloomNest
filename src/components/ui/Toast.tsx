import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastProps {
  message: string | null;
  type?: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "success",
  onClose,
}) => {
  const iconMap: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-rose-500 shrink-0" />,
  };

  const borderMap: Record<ToastType, string> = {
    success: "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/90 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-100",
    error: "border-red-200 dark:border-red-900/50 bg-red-50/90 dark:bg-red-950/80 text-red-900 dark:text-red-100",
    info: "border-rose-200 dark:border-rose-900/50 bg-white/90 dark:bg-[#1A1523]/90 text-gray-900 dark:text-rose-100",
  };

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <div
            className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3 text-xs font-bold font-sans ${borderMap[type]}`}
          >
            <div className="flex items-center gap-2.5">
              {iconMap[type]}
              <span>{message}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

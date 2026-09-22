import React from "react";
import { motion } from "motion/react";
import { ArrowRight, ShieldCheck, Flower2, Baby } from "lucide-react";

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onSignIn }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#FFF7F9] dark:bg-[#120E18] text-gray-900 dark:text-rose-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-xl bg-white dark:bg-[#1A1523] p-8 sm:p-10 rounded-2xl border border-rose-100 dark:border-rose-900/40 shadow-sm text-center space-y-8"
      >
        {/* Brand Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800/40 text-rose-600 dark:text-rose-300 text-xs font-bold uppercase tracking-wider">
            <Flower2 className="w-4 h-4 text-rose-500" />
            <span>BloomNest Life-Stage Companion</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-rose-100">
            BloomNest
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-rose-300 font-medium max-w-md mx-auto leading-relaxed">
            Your personalized maternal wellness and clinical care companion, supporting you from preconception through pregnancy and postpartum.
          </p>
        </div>

        {/* Hero Card */}
        <div className="p-6 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 rounded-xl bg-rose-500 text-white flex items-center justify-center">
            <Baby className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <div className="font-serif font-bold text-lg text-gray-900 dark:text-rose-100">
              Warm, body-positive, and evidence-backed
            </div>
            <p className="text-xs text-gray-500 dark:text-rose-300">
              Garbha Sanskar wellness, AI triage, vital tracking, and clinical dossier reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300">
            <span className="px-3 py-1 bg-white dark:bg-black/30 rounded-full border border-rose-100 dark:border-rose-900/30">Preconception</span>
            <span className="px-3 py-1 bg-white dark:bg-black/30 rounded-full border border-rose-100 dark:border-rose-900/30">Pregnancy</span>
            <span className="px-3 py-1 bg-white dark:bg-black/30 rounded-full border border-rose-100 dark:border-rose-900/30">Postpartum</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onGetStarted}
            className="w-full py-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onSignIn}
            className="w-full py-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-200 font-bold text-xs border border-rose-200 dark:border-rose-900/40 transition-colors"
          >
            I already have an account, <span className="underline">Sign In</span>
          </button>
        </div>

        {/* Security & Privacy Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-gray-400 dark:text-rose-400 pt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Clinical privacy protected, evidence-level A guidance</span>
        </div>
      </motion.div>
    </div>
  );
};

import React from "react";
import { motion } from "motion/react";
import { ArrowRight, ShieldCheck, Flower2, Baby } from "lucide-react";

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onSignIn }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#FFF0F5] via-[#FFF7F9] to-[#F5E6EC] dark:from-[#120E18] dark:via-[#1A1424] dark:to-[#22172A] text-gray-900 dark:text-rose-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-xl bg-white/80 dark:bg-[#1A1523]/80 backdrop-blur-xl p-8 sm:p-10 rounded-[36px] border border-rose-100/80 dark:border-rose-900/40 shadow-2xl shadow-rose-200/50 dark:shadow-none text-center space-y-8 relative overflow-hidden"
      >
        {/* Decorative Floating Ambient Blobs */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-rose-200/40 dark:bg-rose-900/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-pink-200/40 dark:bg-pink-900/20 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="space-y-3 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800/40 text-rose-600 dark:text-rose-300 text-xs font-bold uppercase tracking-wider shadow-xs">
            <Flower2 className="w-4 h-4 text-rose-500" />
            <span>BloomNest Life-Stage Companion</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-rose-100">
            BloomNest
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-rose-300 font-medium max-w-md mx-auto leading-relaxed">
            Your personalized maternal wellness & clinical care companion — supporting you from preconception to pregnancy and postpartum.
          </p>
        </div>

        {/* Dreamy Visual Hero Card */}
        <div className="relative p-6 rounded-3xl bg-gradient-to-tr from-rose-100/70 to-pink-50/60 dark:from-rose-950/40 dark:to-pink-950/40 border border-white dark:border-rose-900/40 shadow-inner flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-400 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-300/50 dark:shadow-none">
            <Baby className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <div className="font-serif font-bold text-lg text-gray-900 dark:text-rose-100">
              Warm, Body-Positive & Evidence-Backed
            </div>
            <p className="text-xs text-gray-500 dark:text-rose-300">
              Garbha Sanskar wellness, AI triage, vital tracking, and clinical dossier reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300">
            <span className="px-3 py-1 bg-white/70 dark:bg-black/30 rounded-full border border-rose-100 dark:border-rose-900/30">🌱 Preconception</span>
            <span className="px-3 py-1 bg-white/70 dark:bg-black/30 rounded-full border border-rose-100 dark:border-rose-900/30">🤰 Pregnancy</span>
            <span className="px-3 py-1 bg-white/70 dark:bg-black/30 rounded-full border border-rose-100 dark:border-rose-900/30">🌷 Postpartum</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onGetStarted}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm shadow-xl shadow-rose-300/40 dark:shadow-none flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onSignIn}
            className="w-full py-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-200 font-bold text-xs border border-rose-200/60 dark:border-rose-900/40 transition-all"
          >
            I already have an account → <span className="underline">Sign In</span>
          </button>
        </div>

        {/* Security & Privacy Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-gray-400 dark:text-rose-400 pt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Clinical Privacy Protected · Evidence Level A Guidance</span>
        </div>
      </motion.div>
    </div>
  );
};

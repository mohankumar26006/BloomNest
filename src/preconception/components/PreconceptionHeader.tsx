import React from "react";
import { Menu, Heart, Sun, Moon } from "lucide-react";
import { useApp } from "../../context/AppContext";

export const PreconceptionHeader: React.FC<{
  onOpenMobileMenu: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
}> = ({ onOpenMobileMenu, activePage, onNavigate }) => {
  const { user, isDarkMode, setIsDarkMode } = useApp();

  const pageNames: Record<string, string> = {
    overview: "Readiness Dashboard",
    cycle: "Cycle & Biomarker Lab",
    nutrition: "Folate & Superfoods Hub",
    doctor: "Doctor SBAR Brief",
    partner: "Partner Wellness & Vitality",
    copilot: "5-Agent Preconception Copilot",
    safety: "Clinical Safety & Guardrails",
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#15201c]/90 backdrop-blur-md border-b border-emerald-100 dark:border-emerald-900/50 px-4 sm:px-6 py-3 flex items-center justify-between">
      {/* Left: Mobile Menu & Current Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/40 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm lg:hidden">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-black text-emerald-950 dark:text-emerald-50 text-sm sm:text-base leading-tight">
              {pageNames[activePage] || "Preconception Hub"}
            </h2>
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hidden sm:block">
              BloomNest Preconception Care • Cycle Day 14 (Fertile Window)
            </p>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-xl text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-colors"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-emerald-100 dark:border-emerald-900/40">
          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
            {user?.fullName?.charAt(0) || "P"}
          </div>
          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100 hidden md:inline">
            {user?.fullName || "Prospective Mom"}
          </span>
        </div>
      </div>
    </header>
  );
};

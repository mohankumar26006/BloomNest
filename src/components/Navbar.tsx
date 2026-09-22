import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { calculatePregnancyProgress } from "../utils/pregnancyCalculation";
import {
  Heart,
  Moon,
  Sun,
  Menu,
  X,
  Bell,
  Globe,
  PhoneCall,
  Sparkles,
  Bot,
  User as UserIcon,
  Palette,
  ShieldCheck,
} from "lucide-react";

export const Navbar: React.FC<{ onOpenMobileMenu: () => void }> = ({ onOpenMobileMenu }) => {
  const {
    user,
    language,
    setLanguage,
    supportedLanguages,
    isDarkMode,
    toggleDarkMode,
    notifications,
    markNotificationRead,
    setActivePage,
    t,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const pregnancyProgress = calculatePregnancyProgress(user);

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-[#120e18] border-b border-rose-100 dark:border-rose-900/40 transition-colors">
      <div className="h-0.5 bg-rose-500 w-full" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Left: Mobile Menu Button & Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl text-rose-700 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActivePage("dashboard")}
            className="flex items-center gap-2 text-left group shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-rose-500 flex items-center justify-center text-white shrink-0">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-serif text-lg sm:text-xl font-bold text-rose-700 dark:text-rose-200 tracking-tight leading-none">
                BloomNest
              </span>
              <span className="hidden xl:block text-[9px] font-bold tracking-widest text-rose-500/90 dark:text-rose-300/80 uppercase mt-0.5 whitespace-nowrap">
                Maternal Care & Clinical Intelligence
              </span>
            </div>
          </button>
        </div>

        {/* Center: Trimester & Week Progress Badge (Visible on XL screens to keep mobile/tablet header compact) */}
        <div className="hidden xl:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 text-xs font-semibold text-rose-800 dark:text-rose-200 shadow-xs whitespace-nowrap shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span>
            {t("trimesterWeekBadge", { tri: pregnancyProgress.trimester, week: pregnancyProgress.currentWeek })}
          </span>
          <span className="w-1 h-1 rounded-full bg-rose-400 shrink-0" />
          <span className="font-bold text-rose-600 dark:text-rose-300">
            {t("daysLeft", { daysLeft: pregnancyProgress.daysRemaining })}
          </span>
        </div>

        {/* Right: Actions (Language, Theme, SOS, AI shortcut, Profile) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* AI Shortcut */}
          <button
            onClick={() => setActivePage("ai-assistant")}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{t("aiDoctor")}</span>
          </button>

          {/* SOS Shortcut */}
          <button
            onClick={() => setActivePage("emergency")}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm animate-pulse transition-all hover:scale-105 whitespace-nowrap shrink-0"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">{t("sosBadge")}</span>
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl text-rose-700 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 text-xs font-bold transition-colors shrink-0"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="uppercase text-[10px] sm:text-[11px] font-black">{language}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-48 sm:w-52 bg-white dark:bg-[#1a1523] rounded-2xl sm:rounded-3xl shadow-2xl border border-rose-100 dark:border-rose-900/40 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase text-rose-400 dark:text-rose-300 tracking-wider">
                  {t("selectLanguage")}
                </div>
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors ${
                      language === lang.code
                        ? "font-extrabold text-rose-600 dark:text-rose-300 bg-rose-50/60 dark:bg-rose-900/20"
                        : "text-gray-700 dark:text-rose-100 font-medium"
                    }`}
                  >
                    <span>
                      {lang.flag} {lang.nativeName} ({lang.label})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Studio Button */}
          <button
            onClick={() => setActivePage("theme-studio")}
            className="hidden sm:flex p-1.5 sm:p-2 rounded-xl sm:rounded-2xl text-rose-700 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 items-center gap-1.5 transition-colors shrink-0"
            title="UI/UX Theme Studio"
          >
            <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="hidden lg:inline text-xs font-bold text-gray-700 dark:text-rose-200 whitespace-nowrap">Themes</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl text-rose-700 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
            )}
          </button>

          {/* Notifications Drawer Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl text-rose-700 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 relative transition-colors shrink-0"
              title="Notifications"
            >
              <Bell className="w-4 h-4 shrink-0" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#1a1523] rounded-2xl sm:rounded-3xl shadow-2xl border border-rose-100 dark:border-rose-900/40 p-3.5 sm:p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-rose-100 dark:border-rose-900/30">
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-100">
                    {t("clinicalCareAlerts")}
                  </span>
                  <span className="text-[10px] text-rose-500 font-extrabold uppercase">
                    {t("unreadCount", { count: unreadCount })}
                  </span>
                </div>
                <div className="mt-2.5 space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                        n.isRead
                          ? "bg-gray-50 dark:bg-rose-950/20 text-gray-600 dark:text-rose-300"
                          : "bg-rose-50/80 dark:bg-rose-900/30 font-medium text-rose-900 dark:text-rose-100 border-l-3 border-rose-500"
                      }`}
                    >
                      <div className="font-bold">{n.title}</div>
                      <p className="text-[11px] mt-0.5 opacity-90 leading-tight">{n.message}</p>
                      <div className="text-[9px] text-gray-400 dark:text-rose-400 mt-1 font-mono">
                        {n.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <button
            onClick={() => setActivePage("settings")}
            className="flex items-center p-0.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-rose-300 dark:ring-rose-600 shadow-xs shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user.fullName.charAt(0)}
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};


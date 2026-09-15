import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Heart,
  Scale,
  Bot,
  BookOpen,
  User,
  Grid,
  Sparkles,
  PhoneCall,
  Menu,
  X,
  Footprints,
  Pill,
  Flower2,
  Calendar,
  Layers,
} from "lucide-react";

export const MobileBottomNav: React.FC<{ onOpenDrawer?: () => void }> = ({ onOpenDrawer }) => {
  const { activePage, setActivePage, isDarkMode, t } = useApp();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainTabs = [
    { id: "dashboard" as const, labelKey: "navHome", icon: Heart },
    { id: "health-tracker" as const, labelKey: "navHealth", icon: Scale },
    { id: "ai-assistant" as const, labelKey: "navAiMama", icon: Bot, isAi: true },
    { id: "journal" as const, labelKey: "navJournal", icon: BookOpen },
    { id: "settings" as const, labelKey: "navProfile", icon: User },
  ];

  const quickFeatureLinks = [
    { id: "baby-development", labelKey: "navFetalOrgans", icon: Sparkles },
    { id: "garbha-wellness", labelKey: "navGarbhaSanskar", icon: Flower2 },
    { id: "hospital-bag", labelKey: "navHospitalBagChecklist", icon: Footprints },
    { id: "kick-counter", labelKey: "navKickCounter", icon: Heart },
    { id: "medicine", labelKey: "navMedicineTracker", icon: Pill },
    { id: "medical-timeline", labelKey: "navAppointmentsScans", icon: Calendar },
    { id: "emergency-contacts", labelKey: "navEmergencyNICU", icon: PhoneCall },
  ];

  return (
    <>
      {/* Quick More Drawer Overlay */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 animate-in fade-in duration-200 flex items-end sm:items-center justify-center p-3"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#1a1523] rounded-3xl p-5 border border-pink-200 dark:border-rose-900/50 shadow-2xl space-y-4 animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-rose-900/30">
              <div className="flex items-center gap-2">
                <Grid className="w-5 h-5 text-pink-500" />
                <span className="font-serif font-bold text-sm text-gray-900 dark:text-rose-100">
                  {t("mobileAppFeatures")}
                </span>
              </div>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {quickFeatureLinks.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActivePage(item.id as any);
                      setShowMoreMenu(false);
                    }}
                    className="p-3 rounded-2xl bg-pink-50/60 dark:bg-rose-950/40 hover:bg-pink-100 dark:hover:bg-rose-900/60 border border-pink-100/80 dark:border-rose-900/40 flex items-center gap-2.5 text-left transition-colors"
                  >
                    <ItemIcon className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
                    <span className="text-xs font-semibold text-gray-800 dark:text-rose-100">
                      {t(item.labelKey)}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  if (onOpenDrawer) onOpenDrawer();
                  setShowMoreMenu(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-rose-950/60 text-gray-800 dark:text-rose-200 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Layers className="w-4 h-4" />
                <span>{t("allModules")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Mobile Bottom Navigation Bar (Visible on mobile/tablet screens only) */}
      <nav
        className="lg:hidden fixed bottom-2.5 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/95 dark:bg-[#1a1423]/95 backdrop-blur-md border border-pink-200/90 dark:border-rose-900/70 rounded-full px-4 py-2 shadow-xl flex items-center justify-between z-40 transition-all"
        aria-label="Mobile Navigation"
      >
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activePage === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActivePage(tab.id as any)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-full transition-all relative ${
                isActive
                  ? "text-pink-600 dark:text-pink-300 font-bold scale-105"
                  : "text-gray-400 dark:text-rose-300/60 hover:text-pink-500"
              }`}
            >
              <div
                className={`p-1.5 rounded-full transition-colors ${
                  isActive
                    ? "bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-300 shadow-2xs"
                    : "bg-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive && tab.id === "dashboard" ? "fill-current" : ""}`} />
              </div>
              <span className="text-[10px] tracking-tight leading-none mt-0.5 font-medium">
                {t(tab.labelKey)}
              </span>

              {tab.isAi && (
                <span className="absolute -top-1 -right-0.5 w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              )}
            </button>
          );
        })}

        {/* Quick Drawer Grid Trigger */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-full text-gray-400 dark:text-rose-300/60 hover:text-pink-500 transition-colors"
          title={t("moreFeatures")}
        >
          <div className="p-1.5 rounded-full hover:bg-pink-50 dark:hover:bg-rose-950/40">
            <Grid className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight leading-none mt-0.5 font-medium">
            {t("navMore")}
          </span>
        </button>
      </nav>
    </>
  );
};

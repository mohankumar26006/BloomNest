import React from "react";
import {
  Heart,
  LayoutDashboard,
  Baby,
  Activity,
  Syringe,
  Flower2,
  Bell,
  ChevronRight,
  UserPlus,
  LogOut,
  ShieldAlert,
  Droplet,
  HeartPulse,
  Bandage,
  Milk,
  Droplets,
  Utensils,
  Moon,
  Smile,
  Pill,
  Calendar,
  FileText,
  TrendingUp,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  Lightbulb,
  Brain,
  Network,
  Bot,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export interface PostpartumNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeSubPage: string;
  setActiveSubPage: (page: string) => void;
}

export const PostpartumSidebar: React.FC<PostpartumNavProps> = ({
  isOpen,
  onClose,
  activeSubPage,
  setActiveSubPage,
}) => {
  const { user, updateUser, setActivePage } = useApp();

  const navItems = [
    { id: "dashboard", label: "Postpartum Hub", icon: LayoutDashboard, badge: "Overview" },
    { id: "care", label: "Postpartum Care", icon: Heart, badge: "Feature 01" },
    { id: "recovery", label: "Mother Physical Recovery", icon: Activity, badge: "Feature 02" },
    { id: "baby-care", label: "Newborn Baby Care", icon: Baby, badge: "Feature 03" },
    { id: "safety", label: "Clinical Safety Shield", icon: ShieldAlert, badge: "Feature 04" },
    { id: "bleeding", label: "Bleeding & Lochia Care", icon: Droplet, badge: "Feature 05" },
    { id: "pain", label: "Pain & Recovery Care", icon: HeartPulse, badge: "Feature 06" },
    { id: "wound", label: "C-Section & Wound Care", icon: Bandage, badge: "Feature 07" },
    { id: "breastfeeding", label: "Direct Breastfeeding", icon: Milk, badge: "Feature 08" },
    { id: "pumping", label: "Pumping & Milk Expressed", icon: Droplets, badge: "Feature 09" },
    { id: "baby-feeding", label: "Baby Feeding Care", icon: Utensils, badge: "Feature 10" },
    { id: "diapers", label: "Baby Diaper Care", icon: Baby, badge: "Feature 11" },
    { id: "sleep-fatigue", label: "Mother Sleep & Fatigue", icon: Moon, badge: "Feature 12" },
    { id: "baby-sleep", label: "Baby Sleep Care", icon: Moon, badge: "Feature 13" },
    { id: "mood-wellbeing", label: "Mood & Emotional Wellbeing", icon: Smile, badge: "Feature 14" },
    { id: "nutrition-hydration", label: "Nutrition & Hydration", icon: Utensils, badge: "Feature 15" },
    { id: "medication", label: "Medication Management", icon: Pill, badge: "Feature 16" },
    { id: "appointments", label: "Appointments & Visits", icon: Calendar, badge: "Feature 17" },
    { id: "doctor-brief", label: "Doctor Brief Generator", icon: FileText, badge: "Feature 18" },
    { id: "trend-pattern", label: "Trend & Pattern Engine", icon: TrendingUp, badge: "Feature 19" },
    { id: "anomalies", label: "Anomaly Detection Engine", icon: Activity, badge: "Feature 20" },
    { id: "plan", label: "Personalized Daily Plan", icon: Calendar, badge: "Feature 21" },
    { id: "reminders", label: "Context-Aware Reminders", icon: Bell, badge: "Feature 22" },
    { id: "checkin", label: "Daily Check-in Touchpoint", icon: CheckCircle2, badge: "Feature 23" },
    { id: "followup", label: "Follow-up & Care Continuity", icon: RotateCcw, badge: "Feature 24" },
    { id: "education", label: "Postpartum Education Layer", icon: BookOpen, badge: "Feature 25" },
    { id: "insight", label: "Personalized Recovery Insight", icon: Lightbulb, badge: "Feature 26" },
    { id: "growth", label: "Baby Growth & Milestones", icon: TrendingUp, badge: "Feature 27" },
    { id: "vaccines", label: "Vaccination Calendar", icon: Syringe, badge: "Feature 28" },
    { id: "memory", label: "AI Memory & Patient History", icon: Brain, badge: "Feature 29" },
    { id: "coordination", label: "Care Coordination Hub", icon: Network, badge: "Feature 30" },
    { id: "mother-recovery-ai", label: "Mother & Recovery AI Agent", icon: Bot, badge: "Agent 1" },
    { id: "baby-care-ai", label: "Baby Care AI Agent", icon: Baby, badge: "Agent 2" },
    { id: "safety-care-coordination-ai", label: "Safety & Care Coordination AI", icon: ShieldCheck, badge: "Agent 3" },
    { id: "wellness", label: "Postpartum Mind & Wellness", icon: Flower2, badge: "Coming Soon" },
  ];

  const handleLogout = () => {
    updateUser({ hasCompletedOnboarding: false });
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-[100dvh] w-[280px] bg-white dark:bg-[#1a1420] border-r border-rose-100 dark:border-rose-900/40 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Module Header */}
        <div className="p-5 border-b border-rose-100 dark:border-rose-900/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-sm">
            <Heart className="w-5 h-5 fill-white/30" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 dark:text-rose-100 leading-tight">BloomNest</h1>
            <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
              Fourth Trimester • Postpartum
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          <div className="px-2 pb-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Postpartum Module
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSubPage === item.id;
            const isComingSoon = item.badge === "Coming Soon";

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (!isComingSoon) {
                    setActiveSubPage(item.id);
                    onClose();
                  }
                }}
                disabled={isComingSoon}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-rose-500 text-white shadow-sm"
                    : isComingSoon
                    ? "opacity-60 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                    : "text-slate-600 dark:text-slate-300 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 hover:text-rose-900 dark:hover:text-rose-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                      isActive
                        ? "bg-white/20 text-white"
                        : isComingSoon
                        ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-6 px-2 pb-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Stage Switcher
            </span>
          </div>

          <button
            onClick={() => {
              updateUser({ journeyStage: "PREGNANCY" });
              setActivePage("dashboard");
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span>Switch to Pregnancy</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Footer User Info & Logout Button */}
        <div className="p-4 border-t border-rose-100 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-[#231a2c] border border-rose-200/80 dark:border-rose-800/40 hover:border-rose-400 text-rose-700 dark:text-rose-200 transition-all group shadow-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <LogOut className="w-3.5 h-3.5" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold leading-none truncate">Logout / Switch User</div>
                <div className="text-[9px] text-slate-500 dark:text-rose-300/70 mt-0.5 truncate">Reset session & setup</div>
              </div>
            </div>
          </button>

          <div className="flex items-center gap-3 pt-1">
            <div className="w-8 h-8 rounded-full bg-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center">
              {(user.fullName || user.name || "Mama")[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.fullName || user.name || "Mama"}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Postpartum Recovery</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};


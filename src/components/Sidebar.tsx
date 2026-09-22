import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { PageView } from "../types";
import {
  LayoutDashboard,
  Calendar,
  Baby,
  Stethoscope,
  Sparkles,
  Heart,
  Utensils,
  Flower2,
  Pill,
  Smile,
  Footprints,
  Clock,
  Moon,
  BookOpen,
  Briefcase,
  Users,
  Bot,
  Brain,
  PhoneCall,
  FileSpreadsheet,
  Palette,
  Settings,
  Shield,
  X,
  FileText,
  TrendingUp,
  Network,
  Activity,
  Bell,
  Building2,
  Droplet,
  ShieldCheck,
  Compass,
  CheckCircle2,
  RotateCcw,
  Syringe,
  GraduationCap,
  Search,
  ChevronDown,
  ChevronRight,
  UserPlus,
  LogIn,
} from "lucide-react";

interface SidebarItem {
  nameKey: string;
  defaultName: string;
  page: PageView;
  icon: React.ElementType;
  badge?: string;
  keywords?: string[];
}

interface SidebarGroup {
  id: string;
  labelKey: string;
  defaultLabel: string;
  items: SidebarItem[];
}

export const Sidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { activePage, setActivePage, user, updateUser, t } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Track open/collapsed groups. By default, all groups are expanded for easy navigation.
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const groups: SidebarGroup[] = [
    {
      id: "hub",
      labelKey: "groupHub",
      defaultLabel: "Core Hub",
      items: [
        { nameKey: "dashboard", defaultName: "Dashboard", page: "dashboard", icon: LayoutDashboard },
        { nameKey: "digitalTwin", defaultName: "My Digital Twin", page: "digital-twin", icon: Sparkles, badge: "3D Living" },
        { nameKey: "aiGuide", defaultName: "AI Doctor Assistant", page: "ai-assistant", icon: Bot, badge: "Gemini AI" },
        { nameKey: "garbhaWellness", defaultName: "Garbha Sanskar Hub", page: "garbha-wellness", icon: Flower2, badge: "Vedic" },
      ],
    },
    {
      id: "journey",
      labelKey: "groupJourney",
      defaultLabel: "Pregnancy & Growth",
      items: [
        ...(user?.currentJourney === "PRE_PREGNANCY" || (user as any)?.journeyStage === "PRE_PREGNANCY"
          ? [{ nameKey: "cycleJourney", defaultName: "Cycle Journey 3D", page: "cycle-journey" as PageView, icon: Flower2, badge: "3D Visual" }]
          : []),
        { nameKey: "timeline", defaultName: "Pregnancy Timeline", page: "timeline", icon: Calendar },
        { nameKey: "babyGrowth", defaultName: "Fetal Growth Studio 3D", page: "baby-development", icon: Baby, badge: "3D Visual" },
        { nameKey: "medicalScans", defaultName: "Scans & Lab Timeline", page: "medical-timeline", icon: Stethoscope },
        { nameKey: "babyNames", defaultName: "Baby Name Finder", page: "baby-names", icon: Sparkles },
      ],
    },
    {
      id: "wellness",
      labelKey: "groupWellness",
      defaultLabel: "Daily Care & Wellness",
      items: [
        { nameKey: "healthVitals", defaultName: "Health Vitals Log", page: "health-tracker", icon: Heart },
        { nameKey: "nutrition", defaultName: "Nutrition & Meal Guide", page: "nutrition", icon: Utensils },
        { nameKey: "medicines", defaultName: "Medicines & Supplements", page: "medicine", icon: Pill },
        { nameKey: "exerciseBreathing", defaultName: "Exercise & Breathing", page: "exercise-breathing", icon: Activity },
        { nameKey: "prenatalYoga", defaultName: "Prenatal Yoga Poses", page: "yoga", icon: Flower2 },
        { nameKey: "vaccinations", defaultName: "Vaccination Schedule", page: "vaccinations", icon: Syringe, badge: "Feature 28" },
        { nameKey: "moodSleep", defaultName: "Mood & Sleep Tracker", page: "mood-tracker", icon: Smile },
      ],
    },
    {
      id: "trackers",
      labelKey: "groupTrackers",
      defaultLabel: "Trackers & Medical ID",
      items: [
        ...(user?.currentJourney === "POST_PREGNANCY" || (user as any)?.journeyStage === "POST_PREGNANCY"
          ? [
              { nameKey: "postpartumCare", defaultName: "Postpartum Care Hub", page: "postpartum-care" as PageView, icon: Heart, badge: "Feature 01" },
              { nameKey: "diaperMonitoring", defaultName: "Baby Diaper Care", page: "diaper-monitoring" as PageView, icon: Baby, badge: "Feature 11" },
              { nameKey: "sleepFatigue", defaultName: "Mother Sleep & Fatigue", page: "sleep-fatigue" as PageView, icon: Moon, badge: "Feature 12" },
              { nameKey: "babySleep", defaultName: "Baby Sleep Care", page: "baby-sleep" as PageView, icon: Moon, badge: "Feature 13" },
              { nameKey: "moodWellbeing", defaultName: "Mood & Emotional Wellbeing", page: "mood-wellbeing" as PageView, icon: Smile, badge: "Feature 14" },
              { nameKey: "postpartumNutrition", defaultName: "Postpartum Nutrition & Fluid", page: "nutrition-hydration" as PageView, icon: Utensils, badge: "Feature 15" },
              { nameKey: "postpartumMedication", defaultName: "Postpartum Medication", page: "medication" as PageView, icon: Pill, badge: "Feature 16" },
              { nameKey: "postpartumAppointments", defaultName: "Appointments & Visits", page: "appointments" as PageView, icon: Calendar, badge: "Feature 17" },
              { nameKey: "doctorBrief", defaultName: "Doctor Brief Generator", page: "doctor-brief" as PageView, icon: FileText, badge: "Feature 18" },
              { nameKey: "trendPattern", defaultName: "Trend & Pattern Engine", page: "trend-pattern" as PageView, icon: TrendingUp, badge: "Feature 19" },
              { nameKey: "anomalyDetection", defaultName: "Anomaly Detection Engine", page: "anomaly-detection" as PageView, icon: Activity, badge: "Feature 20" },
              { nameKey: "dailyPlan", defaultName: "Personalized Daily Plan", page: "daily-plan" as PageView, icon: Calendar, badge: "Feature 21" },
              { nameKey: "contextReminders", defaultName: "Context-Aware Reminders", page: "context-reminders" as PageView, icon: Bell, badge: "Feature 22" },
              { nameKey: "dailyCheckIn", defaultName: "Daily Check-in Touchpoint", page: "daily-checkin" as PageView, icon: CheckCircle2, badge: "Feature 23" },
              { nameKey: "followupContinuity", defaultName: "Follow-up & Care Continuity", page: "followup-continuity" as PageView, icon: RotateCcw, badge: "Feature 24" },
              { nameKey: "postpartumEducation", defaultName: "Postpartum Education Layer", page: "postpartum-education" as PageView, icon: BookOpen, badge: "Feature 25" },
              { nameKey: "recoveryInsight", defaultName: "Personalized Recovery Insight", page: "recovery-insight" as PageView, icon: Sparkles, badge: "Feature 26" },
              { nameKey: "babyGrowth", defaultName: "Baby Growth & Milestones", page: "baby-growth-milestones" as PageView, icon: TrendingUp, badge: "Feature 27" },
              { nameKey: "aiMemory", defaultName: "AI Memory & Patient History", page: "ai-memory-history" as PageView, icon: Brain, badge: "Feature 29" },
              { nameKey: "careCoordination", defaultName: "Care Coordination Hub", page: "care-coordination" as PageView, icon: Network, badge: "Feature 30" },
              { nameKey: "motherRecoveryAi", defaultName: "Mother & Recovery AI Agent", page: "mother-recovery-ai" as PageView, icon: Bot, badge: "Agent 1" },
              { nameKey: "babyCareAi", defaultName: "Baby Care AI Agent", page: "baby-care-ai" as PageView, icon: Baby, badge: "Agent 2" },
              { nameKey: "safetyCareCoordinationAi", defaultName: "Safety & Care Coordination AI", page: "safety-care-coordination-ai" as PageView, icon: ShieldCheck, badge: "Agent 3" },
            ]
          : []),
        { nameKey: "kickCounter", defaultName: "Kick Counter", page: "kick-counter", icon: Footprints },
        { nameKey: "contractionTimer", defaultName: "Contraction Timer", page: "contraction-timer", icon: Clock },
        { nameKey: "medicalProfile", defaultName: "Medical Profile & Emergency ID", page: "medical-profile", icon: Droplet, badge: "Emergency" },
        { nameKey: "emergencyContacts", defaultName: "Emergency Contacts", page: "emergency-contacts", icon: PhoneCall },
        { nameKey: "travelSafety", defaultName: "Travel & Relocation", page: "travel-safety", icon: Compass },
      ],
    },
    {
      id: "birth",
      labelKey: "groupBirth",
      defaultLabel: "Birth Prep & Hospital",
      items: [
        { nameKey: "birthPlan", defaultName: "Birth Plan Builder", page: "birth-plan", icon: FileText },
        { nameKey: "birthReadiness", defaultName: "Delivery Readiness", page: "birth-readiness", icon: ShieldCheck },
        { nameKey: "hospitalBag", defaultName: "Hospital Bag Checklist", page: "hospital-bag", icon: Briefcase },
        { nameKey: "hospitalFinder", defaultName: "Hospital & NICU Finder", page: "hospital-finder", icon: Building2 },
        { nameKey: "educationClasses", defaultName: "Birth Education Classes", page: "education-classes", icon: GraduationCap },
        { nameKey: "journal", defaultName: "Memory Journal", page: "journal", icon: BookOpen },
        { nameKey: "partnerHub", defaultName: "Partner & Family Hub", page: "partner", icon: Users },
      ],
    },
    {
      id: "settings",
      labelKey: "groupSettings",
      defaultLabel: "Reports & App Settings",
      items: [
        { nameKey: "reports", defaultName: "Health & Doctor Reports", page: "reports", icon: FileSpreadsheet },
        { nameKey: "themeStudio", defaultName: "UI Theme Studio", page: "theme-studio", icon: Palette },
        { nameKey: "settings", defaultName: "Settings & Profile", page: "settings", icon: Settings },
        { nameKey: "admin", defaultName: "System Admin", page: "admin", icon: Shield },
      ],
    },
  ];

  const handleSelect = (page: PageView) => {
    setActivePage(page);
    onClose();
  };

  // Filter groups when searching
  const filteredGroups = groups
    .map((group) => {
      const filteredItems = group.items.filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const title = (t(item.nameKey) || item.defaultName).toLowerCase();
        return title.includes(q);
      });
      return { ...group, items: filteredItems };
    })
    .filter((group) => group.items.length > 0);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 lg:static bg-white/95 dark:bg-[#120e19]/95 backdrop-blur-xl border-r border-rose-100/80 dark:border-rose-900/40 p-4 flex flex-col transition-transform duration-300 shrink-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header & Brand Logo */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-rose-100 dark:border-rose-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-serif font-bold text-rose-950 dark:text-rose-100 text-base block leading-none">
                BloomNest
              </span>
              <span className="text-[10px] text-rose-500 dark:text-rose-400 font-semibold tracking-wide">
                Maternal Wellness
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-2xl text-gray-500 hover:bg-rose-50 dark:hover:bg-rose-900/40 lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Navigation Bar */}
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400 dark:text-rose-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu..."
            className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-xs text-gray-800 dark:text-rose-100 placeholder-gray-400 dark:placeholder-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Navigation Groups List */}
        <nav className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400 dark:text-rose-400">
              No menu items match "{searchQuery}"
            </div>
          ) : (
            filteredGroups.map((group) => {
              const isCollapsed = Boolean(collapsedGroups[group.id]) && !searchQuery.trim();

              return (
                <div key={group.id} className="space-y-1">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="w-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-rose-500/90 dark:text-rose-400/90 flex items-center justify-between hover:text-rose-700 dark:hover:text-rose-200 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      {isCollapsed ? (
                        <ChevronRight className="w-3 h-3 text-rose-400" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-rose-400" />
                      )}
                      <span>{t(group.labelKey) || group.defaultLabel}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-rose-100/70 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 font-bold">
                      {group.items.length}
                    </span>
                  </button>

                  {/* Group Items */}
                  {!isCollapsed && (
                    <div className="space-y-0.5 pt-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activePage === item.page;

                        return (
                          <button
                            key={item.page}
                            onClick={() => handleSelect(item.page)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                              isActive
                                ? "bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white shadow-sm font-bold scale-[1.01]"
                                : "text-gray-700 dark:text-rose-200/90 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-100"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon
                                className={`w-4 h-4 shrink-0 ${
                                  isActive ? "text-white" : "text-rose-500 dark:text-rose-400"
                                }`}
                              />
                              <span className="truncate">
                                {t(item.nameKey) || item.defaultName}
                              </span>
                            </div>
                            {item.badge && (
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider shrink-0 ${
                                  isActive
                                    ? "bg-white/20 text-white"
                                    : "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </nav>

        {/* Quick Action: Login for New User */}
        <div className="pt-2">
          <button
            onClick={() => {
              updateUser({ hasCompletedOnboarding: false });
              onClose();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 dark:from-rose-950/40 dark:to-pink-950/40 border border-rose-200/60 dark:border-rose-800/40 hover:border-rose-400 text-rose-700 dark:text-rose-200 transition-all group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <UserPlus className="w-3.5 h-3.5" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold leading-none truncate">Login for New User</div>
                <div className="text-[9px] text-gray-500 dark:text-rose-300/70 mt-0.5 truncate">AI Report Scanner & Setup</div>
              </div>
            </div>
            <LogIn className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </div>

        {/* Sidebar Footer Info */}
        <div className="pt-3 mt-2 border-t border-rose-100 dark:border-rose-900/30 text-[10px] text-gray-400 dark:text-rose-400/80 flex items-center justify-between">
          <span>BloomNest Care v2.4</span>
          <button
            onClick={() => handleSelect("settings")}
            className="hover:text-rose-600 dark:hover:text-rose-200 font-semibold"
          >
            Preferences &rarr;
          </button>
        </div>
      </aside>
    </>
  );
};

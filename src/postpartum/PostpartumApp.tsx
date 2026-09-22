import React, { useState } from "react";
import { PostpartumSidebar } from "./components/PostpartumSidebar";
import { PostpartumDashboard } from "./pages/PostpartumDashboard";
import { PostpartumCarePage } from "../pages/PostpartumCarePage";
import { MotherRecoveryPage } from "../pages/MotherRecoveryPage";
import { BabyCarePage } from "../pages/BabyCarePage";
import { SafetyShieldPage } from "../pages/SafetyShieldPage";
import { BleedingMonitoringPage } from "../pages/BleedingMonitoringPage";
import { PainMonitoringPage } from "../pages/PainMonitoringPage";
import { WoundRecoveryPage } from "../pages/WoundRecoveryPage";
import { BreastfeedingPage } from "../pages/BreastfeedingPage";
import { PumpingPage } from "../pages/PumpingPage";
import { BabyFeedingPage } from "../pages/BabyFeedingPage";
import { DiaperMonitoringPage } from "../pages/DiaperMonitoringPage";
import { MotherSleepFatiguePage } from "../pages/MotherSleepFatiguePage";
import { BabySleepPage } from "../pages/BabySleepPage";
import { MotherMoodWellbeingPage } from "../pages/MotherMoodWellbeingPage";
import { MotherNutritionHydrationPage } from "../pages/MotherNutritionHydrationPage";
import { MotherMedicationPage } from "../pages/MotherMedicationPage";
import { MotherBabyAppointmentsPage } from "../pages/MotherBabyAppointmentsPage";
import { DoctorBriefPage } from "../pages/DoctorBriefPage";
import { TrendPatternDetectionPage } from "../pages/TrendPatternDetectionPage";
import { AnomalyDetectionPage } from "../pages/AnomalyDetectionPage";
import { PersonalizedDailyPlanPage } from "../pages/PersonalizedDailyPlanPage";
import { ContextAwareRemindersPage } from "../pages/ContextAwareRemindersPage";
import { DailyCheckInPage } from "../pages/DailyCheckInPage";
import { FollowUpContinuityPage } from "../pages/FollowUpContinuityPage";
import { PostpartumEducationPage } from "../pages/PostpartumEducationPage";
import { PersonalizedRecoveryInsightPage } from "../pages/PersonalizedRecoveryInsightPage";
import { BabyGrowthMilestonesPage } from "../pages/BabyGrowthMilestonesPage";
import { VaccinationPage } from "../pages/VaccinationPage";
import { AiMemoryHistoryPage } from "../pages/AiMemoryHistoryPage";
import { CareCoordinationPage } from "../pages/CareCoordinationPage";
import { MotherRecoveryAiPage } from "../pages/MotherRecoveryAiPage";
import { BabyCareAiPage } from "../pages/BabyCareAiPage";
import { SafetyCareCoordinationAiPage } from "../pages/SafetyCareCoordinationAiPage";
import { GarbhaWellnessPage } from "../pages/GarbhaWellnessPage";
import { Menu, Heart, ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";

export const PostpartumApp: React.FC = () => {
  const { user, updateUser, setActivePage } = useApp();
  const [activeSubPage, setActiveSubPage] = useState<string>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const renderPostpartumSubPage = () => {
    switch (activeSubPage) {
      case "care":
        return <PostpartumCarePage />;
      case "recovery":
        return <MotherRecoveryPage onNavigateSubPage={setActiveSubPage} />;
      case "baby-care":
        return <BabyCarePage onNavigateSubPage={setActiveSubPage} />;
      case "safety":
        return <SafetyShieldPage onNavigateSubPage={setActiveSubPage} />;
      case "bleeding":
        return <BleedingMonitoringPage onNavigateSubPage={setActiveSubPage} />;
      case "pain":
        return <PainMonitoringPage onNavigateSubPage={setActiveSubPage} />;
      case "wound":
        return <WoundRecoveryPage onNavigateSubPage={setActiveSubPage} />;
      case "breastfeeding":
        return <BreastfeedingPage onNavigateSubPage={setActiveSubPage} />;
      case "pumping":
        return <PumpingPage onNavigateSubPage={setActiveSubPage} />;
      case "baby-feeding":
        return <BabyFeedingPage onNavigateSubPage={setActiveSubPage} />;
      case "diapers":
        return <DiaperMonitoringPage onNavigateSubPage={setActiveSubPage} />;
      case "sleep-fatigue":
        return <MotherSleepFatiguePage onNavigateSubPage={setActiveSubPage} />;
      case "baby-sleep":
        return <BabySleepPage onNavigateSubPage={setActiveSubPage} />;
      case "mood-wellbeing":
        return <MotherMoodWellbeingPage onNavigateSubPage={setActiveSubPage} />;
      case "nutrition-hydration":
        return <MotherNutritionHydrationPage onNavigateSubPage={setActiveSubPage} />;
      case "medication":
        return <MotherMedicationPage onNavigateSubPage={setActiveSubPage} />;
      case "appointments":
        return <MotherBabyAppointmentsPage onNavigateSubPage={setActiveSubPage} />;
      case "doctor-brief":
        return <DoctorBriefPage onNavigateSubPage={setActiveSubPage} />;
      case "trend-pattern":
      case "trends":
      case "postpartum-trends":
        return <TrendPatternDetectionPage onNavigateSubPage={setActiveSubPage} />;
      case "anomalies":
      case "anomaly-detection":
      case "postpartum-anomalies":
        return <AnomalyDetectionPage onNavigate={(page) => setActiveSubPage(page)} profile={user.postpartumProfile} />;
      case "plan":
      case "daily-plan":
      case "postpartum-daily-plan":
        return <PersonalizedDailyPlanPage onNavigate={(page) => setActiveSubPage(page)} profile={user.postpartumProfile} />;
      case "reminders":
      case "context-reminders":
      case "postpartum-reminders":
        return <ContextAwareRemindersPage onNavigate={(page) => setActiveSubPage(page)} profile={user.postpartumProfile} />;
      case "checkin":
      case "daily-checkin":
      case "postpartum-checkin":
        return <DailyCheckInPage onNavigateSubPage={(page) => setActiveSubPage(page as string)} />;
      case "followup":
      case "followup-continuity":
      case "postpartum-followup":
        return <FollowUpContinuityPage onNavigateSubPage={(page) => setActiveSubPage(page as string)} />;
      case "education":
      case "postpartum-education":
      case "education-classes":
        return <PostpartumEducationPage onNavigateSubPage={(page) => setActiveSubPage(page as string)} />;
      case "insight":
      case "recovery-insight":
      case "postpartum-recovery-insight":
        return <PersonalizedRecoveryInsightPage onNavigateSubPage={(page) => setActiveSubPage(page as string)} />;
      case "growth":
      case "baby-growth":
      case "milestones":
      case "baby-growth-milestones":
        return <BabyGrowthMilestonesPage onNavigateSubPage={(page) => setActiveSubPage(page as string)} />;
      case "vaccines":
      case "vaccinations":
      case "vaccination-tracking":
        return <VaccinationPage onNavigateSubPage={(page) => setActiveSubPage(page as string)} />;
      case "memory":
      case "ai-memory":
      case "patient-history":
      case "ai-memory-history":
        return <AiMemoryHistoryPage onNavigateSubPage={(page) => setActiveSubPage(page as string)} />;
      case "coordination":
      case "care-coordination":
      case "care-coordination-hub":
        return <CareCoordinationPage onNavigateSubPage={(page) => setActiveSubPage(page as string)} />;
      case "mother-recovery-ai":
      case "mother-recovery-agent":
        return <MotherRecoveryAiPage onNavigateSubPage={(page) => setActiveSubPage(page as string)} />;
      case "baby-care-ai":
      case "baby-care-agent":
        return <BabyCareAiPage onNavigatePage={(page) => setActiveSubPage(page as string)} />;
      case "safety-care-coordination-ai":
      case "safety-care-coordination-agent":
      case "safety-coordination-ai":
        return <SafetyCareCoordinationAiPage onNavigatePage={(page) => setActiveSubPage(page as string)} />;
      case "wellness":
        return <GarbhaWellnessPage />;
      case "dashboard":
      default:
        return <PostpartumDashboard onNavigateSubPage={setActiveSubPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120d16] text-slate-800 dark:text-rose-100 flex flex-col font-sans transition-colors">
      {/* MODULE TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#1a1420]/90 backdrop-blur-md border-b border-rose-100 dark:border-rose-900/40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-600 dark:text-rose-300 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-black text-sm">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-slate-900 dark:text-rose-100 block leading-tight">
                Postpartum Recovery Hub
              </span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block">
                Fourth Trimester • Dedicated Module
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              updateUser({ journeyStage: "PREGNANCY" });
              setActivePage("dashboard");
            }}
            className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch to Pregnancy</span>
          </button>
        </div>
      </header>

      {/* MODULE MAIN CONTENT BODY */}
      <div className="flex-1 flex w-full relative">
        <PostpartumSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          activeSubPage={activeSubPage}
          setActiveSubPage={setActiveSubPage}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-10 min-w-0 pb-20">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderPostpartumSubPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

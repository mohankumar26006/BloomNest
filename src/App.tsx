import React, { useState, Suspense, lazy, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { FloatingSOS, Toast } from "./components/FloatingSOS";
import { Card, Button, CardHeading, BodyText } from "./components/ui";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";
import { OnboardingFlow } from "./components/OnboardingFlow";

// Explicit Direct & Lazy Page Imports (All at top of file!)
import { DashboardPage } from "./pages/DashboardPage";
import { TimelinePage } from "./pages/TimelinePage";
import { MedicalTimelinePage } from "./pages/MedicalTimelinePage";
import { BabyNamesPage } from "./pages/BabyNamesPage";

const GarbhaWellnessPage = lazy(() => import("./pages/GarbhaWellnessPage").then(m => ({ default: m.GarbhaWellnessPage })));
const DigitalTwinPage = lazy(() => import("./pages/DigitalTwinPage").then(m => ({ default: m.DigitalTwinPage })));
const BabyDevelopmentPage = lazy(() => import("./pages/BabyDevelopmentPage").then(m => ({ default: m.BabyDevelopmentPage })));
const HealthTrackerPage = lazy(() => import("./pages/HealthTrackerPage").then(m => ({ default: m.HealthTrackerPage })));
const NutritionPage = lazy(() => import("./pages/NutritionPage").then(m => ({ default: m.NutritionPage })));
const YogaPage = lazy(() => import("./pages/YogaPage").then(m => ({ default: m.YogaPage })));
const MedicinePage = lazy(() => import("./pages/MedicinePage").then(m => ({ default: m.MedicinePage })));
const MoodPage = lazy(() => import("./pages/MoodPage").then(m => ({ default: m.MoodPage })));
const KickCounterPage = lazy(() => import("./pages/KickCounterPage").then(m => ({ default: m.KickCounterPage })));
const ContractionTimerPage = lazy(() => import("./pages/ContractionTimerPage").then(m => ({ default: m.ContractionTimerPage })));
const JournalPage = lazy(() => import("./pages/JournalPage").then(m => ({ default: m.JournalPage })));
const HospitalBagPage = lazy(() => import("./pages/HospitalBagPage").then(m => ({ default: m.HospitalBagPage })));
const PartnerPage = lazy(() => import("./pages/PartnerPage").then(m => ({ default: m.PartnerPage })));
const AiAssistantPage = lazy(() => import("./pages/AiAssistantPage").then(m => ({ default: m.AiAssistantPage })));
const EmergencyContactsPage = lazy(() => import("./pages/EmergencyContactsPage").then(m => ({ default: m.EmergencyContactsPage })));
const ReportsPage = lazy(() => import("./pages/ReportsPage").then(m => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const ThemeStudioPage = lazy(() => import("./pages/ThemeStudioPage").then(m => ({ default: m.ThemeStudioPage })));
const AdminPage = lazy(() => import("./pages/AdminPage").then(m => ({ default: m.AdminPage })));
const BirthPlanPage = lazy(() => import("./pages/BirthPlanPage").then(m => ({ default: m.BirthPlanPage })));
const ExerciseBreathingPage = lazy(() => import("./pages/ExerciseBreathingPage").then(m => ({ default: m.ExerciseBreathingPage })));
const HospitalFinderPage = lazy(() => import("./pages/HospitalFinderPage").then(m => ({ default: m.HospitalFinderPage })));
const MedicalProfilePage = lazy(() => import("./pages/MedicalProfilePage").then(m => ({ default: m.MedicalProfilePage })));
const BirthReadinessPage = lazy(() => import("./pages/BirthReadinessPage").then(m => ({ default: m.BirthReadinessPage })));
const TravelSafetyPage = lazy(() => import("./pages/TravelSafetyPage").then(m => ({ default: m.TravelSafetyPage })));
const VaccinationPage = lazy(() => import("./pages/VaccinationPage").then(m => ({ default: m.VaccinationPage })));
const EducationClassesPage = lazy(() => import("./pages/EducationClassesPage").then(m => ({ default: m.EducationClassesPage })));
const CycleJourneyPage = lazy(() => import("./pages/CycleJourneyPage").then(m => ({ default: m.CycleJourneyPage })));
const PostpartumCarePage = lazy(() => import("./pages/PostpartumCarePage").then(m => ({ default: m.PostpartumCarePage })));
const DiaperMonitoringPage = lazy(() => import("./pages/DiaperMonitoringPage").then(m => ({ default: m.DiaperMonitoringPage })));
const MotherSleepFatiguePage = lazy(() => import("./pages/MotherSleepFatiguePage").then(m => ({ default: m.MotherSleepFatiguePage })));
const BabySleepPage = lazy(() => import("./pages/BabySleepPage").then(m => ({ default: m.BabySleepPage })));
const MotherMoodWellbeingPage = lazy(() => import("./pages/MotherMoodWellbeingPage").then(m => ({ default: m.MotherMoodWellbeingPage })));
const MotherNutritionHydrationPage = lazy(() => import("./pages/MotherNutritionHydrationPage").then(m => ({ default: m.MotherNutritionHydrationPage })));
const MotherMedicationPage = lazy(() => import("./pages/MotherMedicationPage").then(m => ({ default: m.MotherMedicationPage })));
const MotherBabyAppointmentsPage = lazy(() => import("./pages/MotherBabyAppointmentsPage").then(m => ({ default: m.MotherBabyAppointmentsPage })));
const DoctorBriefPage = lazy(() => import("./pages/DoctorBriefPage").then(m => ({ default: m.DoctorBriefPage })));
const TrendPatternDetectionPage = lazy(() => import("./pages/TrendPatternDetectionPage").then(m => ({ default: m.TrendPatternDetectionPage })));
const AnomalyDetectionPage = lazy(() => import("./pages/AnomalyDetectionPage").then(m => ({ default: m.AnomalyDetectionPage })));
const PersonalizedDailyPlanPage = lazy(() => import("./pages/PersonalizedDailyPlanPage").then(m => ({ default: m.PersonalizedDailyPlanPage })));
const ContextAwareRemindersPage = lazy(() => import("./pages/ContextAwareRemindersPage").then(m => ({ default: m.ContextAwareRemindersPage })));
const DailyCheckInPage = lazy(() => import("./pages/DailyCheckInPage").then(m => ({ default: m.DailyCheckInPage })));
const FollowUpContinuityPage = lazy(() => import("./pages/FollowUpContinuityPage").then(m => ({ default: m.FollowUpContinuityPage })));
const PostpartumEducationPage = lazy(() => import("./pages/PostpartumEducationPage").then(m => ({ default: m.PostpartumEducationPage })));
const PersonalizedRecoveryInsightPage = lazy(() => import("./pages/PersonalizedRecoveryInsightPage").then(m => ({ default: m.PersonalizedRecoveryInsightPage })));
const BabyGrowthMilestonesPage = lazy(() => import("./pages/BabyGrowthMilestonesPage").then(m => ({ default: m.BabyGrowthMilestonesPage })));
const AiMemoryHistoryPage = lazy(() => import("./pages/AiMemoryHistoryPage").then(m => ({ default: m.AiMemoryHistoryPage })));
const CareCoordinationPage = lazy(() => import("./pages/CareCoordinationPage").then(m => ({ default: m.CareCoordinationPage })));
const MotherRecoveryAiPage = lazy(() => import("./pages/MotherRecoveryAiPage").then(m => ({ default: m.MotherRecoveryAiPage })));
const BabyCareAiPage = lazy(() => import("./pages/BabyCareAiPage").then(m => ({ default: m.BabyCareAiPage })));
const SafetyCareCoordinationAiPage = lazy(() => import("./pages/SafetyCareCoordinationAiPage").then(m => ({ default: m.SafetyCareCoordinationAiPage })));
const PreconceptionApp = lazy(() => import("./preconception/PreconceptionApp").then(m => ({ default: m.PreconceptionApp })));
const PostpartumApp = lazy(() => import("./postpartum/PostpartumApp").then(m => ({ default: m.PostpartumApp })));

// Error Boundary Wrapper Component
const PageErrorBoundary: React.FC<{ children: React.ReactNode; activePage: string; onReset: () => void }> = ({
  children,
  activePage,
  onReset,
}) => {
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [activePage]);

  if (hasError) {
    return (
      <Card className="p-8 text-center space-y-4 border-rose-200 bg-rose-50/50">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <CardHeading>Page Load Warning</CardHeading>
        <BodyText className="max-w-md mx-auto">
          We encountered a transient error while loading the "{activePage}" module.
        </BodyText>
        <div className="flex justify-center gap-3 pt-2">
          <Button onClick={onReset} variant="outline" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" /> Return to Dashboard
          </Button>
          <Button onClick={() => window.location.reload()} variant="primary" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh Application
          </Button>
        </div>
      </Card>
    );
  }

  return <>{children}</>;
};

const MainContent: React.FC = () => {
  const { activePage, setActivePage, user, isHydrated } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Show a splash loader while loading from IndexedDB
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#fff7f9] dark:bg-[#120e18] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user hasn't completed onboarding, show onboarding / login flow first
  if (user && !user.hasCompletedOnboarding) {
    return <OnboardingFlow />;
  }

  // 🌿 100% ISOLATED PRECONCEPTION WEB APPLICATION
  if (user && (user.currentJourney === "PRE_PREGNANCY" || user.journeyStage === "PRE_PREGNANCY")) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#fff7f9] dark:bg-[#120e18]"><div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" /></div>}>
        <PreconceptionApp />
      </Suspense>
    );
  }

  // 🌸 100% ISOLATED POSTPARTUM WEB APPLICATION
  if (user && (user.currentJourney === "POST_PREGNANCY" || user.journeyStage === "POST_PREGNANCY")) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] dark:bg-[#120d16]"><div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" /></div>}>
        <PostpartumApp />
      </Suspense>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case "cycle-journey":
        return <CycleJourneyPage />;
      case "dashboard":
        return <DashboardPage />;
      case "digital-twin":
        return <DigitalTwinPage />;
      case "garbha-wellness":
        return <GarbhaWellnessPage />;
      case "timeline":
        return <TimelinePage />;
      case "baby-development":
        return <BabyDevelopmentPage />;
      case "medical-timeline":
        return <MedicalTimelinePage />;
      case "baby-names":
        return <BabyNamesPage />;
      case "health-tracker":
        return <HealthTrackerPage />;
      case "nutrition":
        return <NutritionPage />;
      case "yoga":
        return <YogaPage />;
      case "medicine":
        return <MedicinePage />;
      case "mood-tracker":
        return <MoodPage />;
      case "kick-counter":
        return <KickCounterPage />;
      case "contraction-timer":
        return <ContractionTimerPage />;
      case "journal":
        return <JournalPage />;
      case "hospital-bag":
        return <HospitalBagPage />;
      case "partner":
        return <PartnerPage />;
      case "ai-assistant":
        return <AiAssistantPage />;
      case "emergency":
      case "emergency-contacts":
        return <EmergencyContactsPage />;
      case "reports":
        return <ReportsPage />;
      case "settings":
        return <SettingsPage />;
      case "theme-studio":
        return <ThemeStudioPage />;
      case "admin":
        return <AdminPage />;
      case "birth-plan":
        return <BirthPlanPage />;
      case "exercise-breathing":
        return <ExerciseBreathingPage />;
      case "hospital-finder":
        return <HospitalFinderPage />;
      case "medical-profile":
        return <MedicalProfilePage />;
      case "birth-readiness":
        return <BirthReadinessPage />;
      case "travel-safety":
        return <TravelSafetyPage />;
      case "vaccinations":
      case "vaccination-tracking":
        return <VaccinationPage />;
      case "education-classes":
        return <EducationClassesPage />;
      case "postpartum-care":
        return <PostpartumCarePage />;
      case "diapers":
      case "diaper-monitoring":
        return <DiaperMonitoringPage />;
      case "sleep-fatigue":
      case "mother-sleep":
        return <MotherSleepFatiguePage />;
      case "baby-sleep":
      case "infant-sleep":
        return <BabySleepPage />;
      case "mood-wellbeing":
      case "mother-mood":
        return <MotherMoodWellbeingPage />;
      case "nutrition-hydration":
      case "postpartum-nutrition":
        return <MotherNutritionHydrationPage />;
      case "medication":
      case "postpartum-medication":
        return <MotherMedicationPage />;
      case "appointments":
      case "postpartum-appointments":
        return <MotherBabyAppointmentsPage onNavigateSubPage={(page) => setActivePage(page as any)} />;
      case "doctor-brief":
      case "postpartum-doctor-brief":
        return <DoctorBriefPage onNavigateSubPage={(page) => setActivePage(page as any)} />;
      case "trend-pattern":
      case "postpartum-trends":
        return <TrendPatternDetectionPage onNavigateSubPage={(page) => setActivePage(page as any)} />;
      case "anomaly-detection":
      case "postpartum-anomalies":
        return <AnomalyDetectionPage onNavigate={(page) => setActivePage(page as any)} />;
      case "daily-plan":
      case "postpartum-daily-plan":
        return <PersonalizedDailyPlanPage onNavigate={(page) => setActivePage(page as any)} />;
      case "context-reminders":
      case "postpartum-reminders":
        return <ContextAwareRemindersPage onNavigate={(page) => setActivePage(page as any)} />;
      case "daily-checkin":
      case "postpartum-checkin":
        return <DailyCheckInPage onNavigateSubPage={(page) => setActivePage(page as any)} />;
      case "followup-continuity":
      case "postpartum-followup":
        return <FollowUpContinuityPage onNavigateSubPage={(page) => setActivePage(page as any)} />;
      case "postpartum-education":
        return <PostpartumEducationPage onNavigateSubPage={(page) => setActivePage(page as any)} />;
      case "recovery-insight":
      case "postpartum-recovery-insight":
        return <PersonalizedRecoveryInsightPage onNavigateSubPage={(page) => setActivePage(page as any)} />;
      case "baby-growth-milestones":
      case "baby-growth":
        return <BabyGrowthMilestonesPage onNavigateSubPage={(page) => setActivePage(page as any)} />;
      case "ai-memory-history":
      case "patient-history":
        return <AiMemoryHistoryPage onNavigateSubPage={(page) => setActivePage(page as any)} />;
      case "care-coordination":
      case "care-coordination-hub":
        return <CareCoordinationPage onNavigateSubPage={(page) => setActivePage(page as any)} />;
      case "mother-recovery-ai":
      case "mother-recovery-agent":
        return <MotherRecoveryAiPage onNavigateSubPage={(page) => setActivePage(page as any)} />;
      case "baby-care-ai":
      case "baby-care-agent":
        return <BabyCareAiPage onNavigatePage={(page) => setActivePage(page as any)} />;
      case "safety-care-coordination-ai":
      case "safety-care-coordination-agent":
        return <SafetyCareCoordinationAiPage onNavigatePage={(page) => setActivePage(page as any)} />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div
      className={`min-h-screen ${
        activePage === "digital-twin"
          ? "bg-[#FAF8FC] text-gray-900"
          : "bg-[#fff7f9] dark:bg-[#120e18] text-gray-900 dark:text-rose-100"
      } flex flex-col font-sans transition-colors`}
    >
      <Navbar onOpenMobileMenu={() => setIsMobileSidebarOpen(true)} />

      <div className="flex-1 flex w-full relative">
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        <main
          className={`flex-1 p-4 sm:p-6 min-w-0 pb-20 ${
            activePage === "digital-twin" ? "bg-[#FAF8FC]" : ""
          }`}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            <PageErrorBoundary activePage={activePage} onReset={() => setActivePage("dashboard")}>
              <Suspense fallback={<div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" /></div>}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePage}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    {renderPage()}
                  </motion.div>
                </AnimatePresence>
              </Suspense>
            </PageErrorBoundary>
          </div>
        </main>
      </div>

      <MobileBottomNav />
      <FloatingSOS />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

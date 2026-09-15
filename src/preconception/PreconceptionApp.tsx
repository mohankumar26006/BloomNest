import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { PreconceptionSidebar } from "./components/PreconceptionSidebar";
import { PreconceptionHeader } from "./components/PreconceptionHeader";
import { PreconceptionDashboard } from "./pages/PreconceptionDashboard";
import { PreconceptionCycleLab } from "./pages/PreconceptionCycleLab";
import { PreconceptionNutrition } from "./pages/PreconceptionNutrition";
import { PreconceptionDoctorBrief } from "./pages/PreconceptionDoctorBrief";
import { PreconceptionPartnerWellness } from "./pages/PreconceptionPartnerWellness";
import { PreconceptionCopilot } from "./pages/PreconceptionCopilot";
import { PreconceptionSafety } from "./pages/PreconceptionSafety";
import { motion, AnimatePresence } from "framer-motion";

const CycleJourneyPage = React.lazy(() => import("../pages/CycleJourneyPage").then(m => ({ default: m.CycleJourneyPage })));

export const PreconceptionApp: React.FC = () => {
  const { user, updateUser } = useApp();
  const [activePage, setActivePage] = useState("overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case "journey":
        return (
          <React.Suspense fallback={<div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <CycleJourneyPage />
          </React.Suspense>
        );
      case "cycle":
        return <PreconceptionCycleLab />;
      case "nutrition":
        return <PreconceptionNutrition />;
      case "doctor":
        return <PreconceptionDoctorBrief />;
      case "partner":
        return <PreconceptionPartnerWellness />;
      case "copilot":
        return <PreconceptionCopilot />;
      case "safety":
        return <PreconceptionSafety />;
      case "overview":
      default:
        return <PreconceptionDashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f7f4] dark:bg-[#0f1714] text-emerald-950 dark:text-emerald-50 flex flex-col font-sans transition-colors">
      <PreconceptionHeader
        onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        activePage={activePage}
        onNavigate={setActivePage}
      />
      
      <div className="flex-1 flex w-full relative">
        <PreconceptionSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          activePage={activePage}
          setActivePage={setActivePage}
        />

        <main className="flex-1 p-4 sm:p-6 min-w-0 pb-20">
          <div className="max-w-7xl mx-auto space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

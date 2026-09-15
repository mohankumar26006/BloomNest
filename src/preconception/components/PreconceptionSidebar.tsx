import React from "react";
import { Flower2, Activity, CalendarHeart, Utensils, Stethoscope, Users, ShieldAlert, UserPlus } from "lucide-react";
import { useApp } from "../../context/AppContext";

export const PreconceptionSidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
}> = ({ isOpen, onClose, activePage, setActivePage }) => {
  const { updateUser } = useApp();

  const navItems = [
    { id: "overview", label: "Readiness Dashboard", icon: Activity },
    { id: "journey", label: "Cycle Journey 3D", icon: CalendarHeart },
    { id: "cycle", label: "Cycle & Biomarker Lab", icon: CalendarHeart },
    { id: "nutrition", label: "Folate & Superfoods", icon: Utensils },
    { id: "doctor", label: "Doctor SBAR Brief", icon: Stethoscope },
    { id: "partner", label: "Partner Wellness", icon: Users },
    { id: "copilot", label: "5-Agent Copilot", icon: Flower2 },
    { id: "safety", label: "Clinical Safety", icon: ShieldAlert },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-emerald-950/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-[100dvh] w-[280px] bg-white dark:bg-[#15201c] border-r border-emerald-100 dark:border-emerald-900/50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-5 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Flower2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-emerald-900 dark:text-emerald-100 leading-tight">BloomNest</h1>
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Preconception</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold ${
                activePage === item.id
                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200"
                  : "text-emerald-700/70 dark:text-emerald-300/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-800 dark:hover:text-emerald-300"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-emerald-100 dark:border-emerald-900/50">
          <button
            onClick={() => {
              updateUser({ hasCompletedOnboarding: false });
              onClose();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 dark:bg-emerald-900/30 dark:hover:bg-emerald-800/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200 transition-all group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <UserPlus className="w-3.5 h-3.5" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold leading-none truncate">Login for New User</div>
                <div className="text-[9px] text-emerald-600 dark:text-emerald-300/70 mt-0.5 truncate">Choose Journey & Setup</div>
              </div>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};

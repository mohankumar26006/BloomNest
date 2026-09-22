import React, { useState, useEffect } from "react";
import { Activity, Droplet, Sparkles, Stethoscope, Heart, Users, ShieldAlert, ArrowRight, CheckCircle2, Flame, Calendar, MessageSquare } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { useApp } from "../../context/AppContext";

export const PreconceptionDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { user } = useApp();

  // Dynamic readiness checklist
  const [checklist, setChecklist] = useState({
    cycle: true,
    folate: true,
    partner: false,
    doctor: false,
    immunization: true,
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Calculate score based on completed items
  const totalItems = Object.keys(checklist).length;
  const completedCount = Object.values(checklist).filter(Boolean).length;
  const dynamicScore = Math.round((completedCount / totalItems) * 100);

  const folateStreak = 14;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 text-white shadow-xl shadow-emerald-950/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/30 text-emerald-200">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              BloomNest Preconception Hub
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Welcome, {user?.fullName || "Prospective Mom"}!
          </h2>
          <p className="text-emerald-100 text-sm mt-1 max-w-xl">
            You are in the preconception window. Optimize ovarian health, ovulation timing, and maternal-fetal biology before conception begins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            className="bg-white text-emerald-950 hover:bg-emerald-50 font-black border-0 rounded-2xl shadow-lg px-5 py-3"
            onClick={() => onNavigate("cycle")}
          >
            <Calendar className="w-4 h-4 mr-2 text-emerald-700" />
            Open Cycle Lab
          </Button>
        </div>
      </div>

      {/* Readiness Score & Dynamic Ring */}
      <Card variant="glass" radius="2xl" className="p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 border-emerald-100 dark:border-emerald-900/40">
        <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle
              cx="88" cy="88" r="76"
              className="stroke-emerald-100 dark:stroke-emerald-900/40"
              strokeWidth="14" fill="none"
            />
            <circle
              cx="88" cy="88" r="76"
              className="stroke-emerald-500 transition-all duration-700 ease-out"
              strokeWidth="14" fill="none"
              strokeDasharray="477.5"
              strokeDashoffset={477.5 - (477.5 * dynamicScore) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="text-center">
            <div className="text-4xl font-black text-emerald-800 dark:text-emerald-200">{dynamicScore}</div>
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-0.5">
              Readiness
            </div>
            <div className="text-[10px] font-semibold text-emerald-500 mt-1">
              {dynamicScore >= 80 ? "Optimal ⭐" : dynamicScore >= 60 ? "Good Pace 🌱" : "Building Up"}
            </div>
          </div>
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Personalized Conception Readiness
            </span>
            <h3 className="text-xl font-black text-emerald-950 dark:text-emerald-50 mt-1">
              Biological & Nutritional Defense
            </h3>
          </div>
          <p className="text-emerald-800/80 dark:text-emerald-200/80 text-sm leading-relaxed">
            Your score combines your daily folate streak, biomarker tracking accuracy, partner vitality, and doctor consultation readiness. Click below to update checklist items!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <div
              onClick={() => toggleCheck("cycle")}
              className={`p-2.5 rounded-xl border cursor-pointer text-xs font-bold flex items-center gap-2 transition-all ${
                checklist.cycle
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700"
                  : "bg-white dark:bg-[#15201c] text-slate-500 border-slate-200 dark:border-slate-800"
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${checklist.cycle ? "text-emerald-600" : "text-slate-400"}`} />
              Cycle & BBT Tracking Active
            </div>

            <div
              onClick={() => toggleCheck("folate")}
              className={`p-2.5 rounded-xl border cursor-pointer text-xs font-bold flex items-center gap-2 transition-all ${
                checklist.folate
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700"
                  : "bg-white dark:bg-[#15201c] text-slate-500 border-slate-200 dark:border-slate-800"
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${checklist.folate ? "text-emerald-600" : "text-slate-400"}`} />
              Folic Acid 400mcg Streak ({folateStreak}d)
            </div>

            <div
              onClick={() => toggleCheck("partner")}
              className={`p-2.5 rounded-xl border cursor-pointer text-xs font-bold flex items-center gap-2 transition-all ${
                checklist.partner
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700"
                  : "bg-white dark:bg-[#15201c] text-slate-500 border-slate-200 dark:border-slate-800"
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${checklist.partner ? "text-emerald-600" : "text-slate-400"}`} />
              Partner Vitality Plan Synced
            </div>

            <div
              onClick={() => toggleCheck("doctor")}
              className={`p-2.5 rounded-xl border cursor-pointer text-xs font-bold flex items-center gap-2 transition-all ${
                checklist.doctor
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700"
                  : "bg-white dark:bg-[#15201c] text-slate-500 border-slate-200 dark:border-slate-800"
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${checklist.doctor ? "text-emerald-600" : "text-slate-400"}`} />
              Doctor SBAR Consultation Brief
            </div>
          </div>
        </div>
      </Card>

      {/* Core Feature Hub Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-emerald-950 dark:text-emerald-50 text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Preconception Modules & Action Centers
          </h3>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Click any card to launch</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Cycle Lab */}
          <Card
            variant="glass"
            className="p-5 border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-400 dark:hover:border-emerald-700 transition-all cursor-pointer group flex flex-col justify-between"
            onClick={() => onNavigate("cycle")}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="font-bold text-emerald-950 dark:text-emerald-100 text-base">Cycle & Biomarker Lab</h4>
                <Badge variant="primary" className="bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 text-[10px]">
                  Cycle Day 14
                </Badge>
              </div>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 mb-4 leading-relaxed">
                Log Basal Body Temp (BBT), Cervical Mucus changes, and LH ovulation strip surges to pinpoint your fertile window.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400 pt-3 border-t border-emerald-100 dark:border-emerald-900/20">
              <span>Open Cycle Lab</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

          {/* Card 2: Nutrition */}
          <Card
            variant="glass"
            className="p-5 border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-400 dark:hover:border-emerald-700 transition-all cursor-pointer group flex flex-col justify-between"
            onClick={() => onNavigate("nutrition")}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Droplet className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="font-bold text-emerald-950 dark:text-emerald-100 text-base">Folate & Superfoods</h4>
                <Badge variant="success" className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 text-[10px]">
                  Streak 14d
                </Badge>
              </div>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 mb-4 leading-relaxed">
                Track daily 400-800mcg folic acid intake to safeguard early neural tube synthesis. Indian superfoods for egg quality.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-3 border-t border-emerald-100 dark:border-emerald-900/20">
              <span>View Nutrition Plan</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

          {/* Card 3: Doctor Brief */}
          <Card
            variant="glass"
            className="p-5 border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-400 dark:hover:border-emerald-700 transition-all cursor-pointer group flex flex-col justify-between"
            onClick={() => onNavigate("doctor")}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="font-bold text-emerald-950 dark:text-emerald-100 text-base">Doctor SBAR Brief</h4>
                <Badge variant="neutral" className="bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 text-[10px]">
                  Labs Pending
                </Badge>
              </div>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 mb-4 leading-relaxed">
                Generate a standardized SBAR medical summary with thyroid, rubella immunity, and medication review for your OB-GYN.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400 pt-3 border-t border-emerald-100 dark:border-emerald-900/20">
              <span>Generate Brief & Labs</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

          {/* Card 4: Partner Wellness */}
          <Card
            variant="glass"
            className="p-5 border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-400 dark:hover:border-emerald-700 transition-all cursor-pointer group flex flex-col justify-between"
            onClick={() => onNavigate("partner")}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="font-bold text-emerald-950 dark:text-emerald-100 text-base">Partner Vitality</h4>
                <Badge variant="primary" className="bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-200 text-[10px]">
                  74-Day Cycle
                </Badge>
              </div>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 mb-4 leading-relaxed">
                Sperm health takes 74 days to regenerate. Track heat exposure, zinc, CoQ10, and partner lifestyle habits.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-cyan-600 dark:text-cyan-400 pt-3 border-t border-emerald-100 dark:border-emerald-900/20">
              <span>View Partner Plan</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

          {/* Card 5: 5-Agent Copilot */}
          <Card
            variant="glass"
            className="p-5 border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-400 dark:hover:border-emerald-700 transition-all cursor-pointer group flex flex-col justify-between"
            onClick={() => onNavigate("copilot")}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="font-bold text-emerald-950 dark:text-emerald-100 text-base">5-Agent AI Copilot</h4>
                <Badge variant="primary" className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 text-[10px]">
                  5 Specialists
                </Badge>
              </div>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 mb-4 leading-relaxed">
                Get instant medical, dietary, emotional, and partner answers from Dr. Priya, Chef Ananya, and the specialist team.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 pt-3 border-t border-emerald-100 dark:border-emerald-900/20">
              <span>Chat with Copilot</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

          {/* Card 6: Clinical Safety */}
          <Card
            variant="glass"
            className="p-5 border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-400 dark:hover:border-emerald-700 transition-all cursor-pointer group flex flex-col justify-between"
            onClick={() => onNavigate("safety")}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="font-bold text-emerald-950 dark:text-emerald-100 text-base">Clinical Safety & Rules</h4>
                <Badge variant="warning" className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-[10px]">
                  Safety First
                </Badge>
              </div>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 mb-4 leading-relaxed">
                Guidelines on when to consult early (cycles &gt;35d, pelvic pain, age thresholds) and medications to audit.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 pt-3 border-t border-emerald-100 dark:border-emerald-900/20">
              <span>Read Safety Guidelines</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

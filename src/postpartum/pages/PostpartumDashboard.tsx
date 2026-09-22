import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
  formatPostpartumTime,
  getRecoveryStage,
} from "../../utils/postpartumUtils";
import {
  Heart,
  Baby,
  Activity,
  Syringe,
  Moon,
  Utensils,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Bot,
  CheckCircle2,
  Smile,
  Droplet,
  Pill,
  Calendar,
  TrendingUp,
  ShieldAlert,
  Bell,
  RotateCcw,
  BookOpen,
  Brain,
} from "lucide-react";

export const PostpartumDashboard: React.FC<{ onNavigateSubPage: (page: string) => void }> = ({
  onNavigateSubPage,
}) => {
  const { user, vitals, moodLogs, appointments, medicines } = useApp();

  // Load saved postpartum delivery date or default
  const [deliveryDate, setDeliveryDate] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("bloomnest_postpartum_profile_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.deliveryDate) return parsed.deliveryDate;
      }
    } catch {}
    return new Date().toISOString().split("T")[0];
  });

  const postpartumDay = calculatePostpartumDay(deliveryDate);
  const postpartumWeek = calculatePostpartumWeek(postpartumDay);
  const timeFormatted = formatPostpartumTime(postpartumDay);
  const stage = getRecoveryStage(postpartumDay);

  // Quick Action States
  const [feedingLogs, setFeedingLogs] = useState<Array<{ time: string; type: string; duration: string }>>([
    { time: "10:30 AM", type: "Breastfeeding (Right)", duration: "15 mins" },
    { time: "07:15 AM", type: "Breastfeeding (Left)", duration: "20 mins" },
  ]);
  const [diaperLogs, setDiaperLogs] = useState<number>(4);
  const [activeTab, setActiveTab] = useState<"overview" | "baby" | "recovery">("overview");

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. HERO RECOVERY HEADER */}
      <section className="bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-rose-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                Fourth Trimester Hub
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-400 text-slate-900 text-xs font-extrabold">
                {stage.title}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome to Postpartum Recovery, {user.fullName || user.name || "Mama"}! 💕
            </h1>

            <p className="text-sm sm:text-base text-rose-100 max-w-2xl font-normal leading-relaxed">
              You are currently on <strong className="text-white font-bold">Postpartum Day {postpartumDay}</strong> ({timeFormatted.formatted}). Focus on physical rest, lactation support, and gentle recovery.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 flex flex-col items-center justify-center min-w-[200px] text-center space-y-1">
            <span className="text-xs font-medium text-rose-100 uppercase tracking-widest">Recovery Stage</span>
            <span className="text-3xl font-black text-white">Day {postpartumDay}</span>
            <span className="text-xs font-semibold text-rose-200">Week {postpartumWeek}</span>
          </div>
        </div>
      </section>

      {/* 2. FEATURE 23 DAILY CHECK-IN HERO TOUCHPOINT */}
      <section className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase">
                Feature 23 • Daily Touchpoint
              </span>
              <span className="text-xs font-semibold text-rose-100">~30s Quick Entry</span>
            </div>
            <h3 className="text-lg font-bold mt-1">Start Today's Daily Check-in</h3>
            <p className="text-xs text-rose-100">
              Quickly tell BloomNest how you and baby are doing right now without opening 10 separate modules.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateSubPage("checkin")}
          className="px-6 py-3 rounded-2xl bg-white text-rose-600 font-extrabold text-xs shadow-md hover:bg-rose-50 inline-flex items-center gap-2 shrink-0 transition-all"
        >
          <span>Start Daily Check-in</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>

      {/* 3. FEATURE 24 FOLLOW-UP & CONTINUITY HERO BANNER */}
      <section className="bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <RotateCcw className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase">
                Feature 24 • Continuity Loop
              </span>
              <span className="text-xs font-semibold text-purple-100">Care Threads Companion</span>
            </div>
            <h3 className="text-lg font-bold mt-1">Open Care Loops & Follow-ups</h3>
            <p className="text-xs text-purple-100">
              Track open concerns, post-appointment instructions, and recovery trends until resolved.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateSubPage("followup")}
          className="px-6 py-3 rounded-2xl bg-white text-purple-700 font-extrabold text-xs shadow-md hover:bg-purple-50 inline-flex items-center gap-2 shrink-0 transition-all"
        >
          <span>View Care Continuity</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>

      {/* 3.5 AGENT 1 — MOTHER & RECOVERY AI COPILOT HERO BANNER */}
      <section className="bg-gradient-to-r from-rose-600 to-rose-700 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase">
                Agent 1 of 3 • Intelligence Layer
              </span>
              <span className="text-xs font-semibold text-rose-100">F01–F30 Connected</span>
            </div>
            <h3 className="text-lg font-bold mt-1">Mother & Recovery AI Copilot</h3>
            <p className="text-xs text-rose-100">
              Ask AI about your physical recovery, pain trajectories, lochia bleeding, sleep quality, and doctor brief prep.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateSubPage("mother-recovery-ai")}
          className="px-6 py-3 rounded-2xl bg-white text-rose-700 font-extrabold text-xs shadow-md hover:bg-rose-50 inline-flex items-center gap-2 shrink-0 transition-all"
        >
          <span>Ask Mother AI</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>

      {/* AGENT 2 — BABY CARE AI AGENT HERO BANNER */}
      <section className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Baby className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase">
                Agent 2 • Intelligence Layer
              </span>
            </div>
            <h3 className="text-lg font-bold mt-1">Baby Care AI Agent</h3>
            <p className="text-xs text-pink-100">
              Synthesize 24h feeding, diapers, sleep, F27 growth records, F28 vaccine schedule, and pediatrician preparation.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateSubPage("baby-care-ai")}
          className="px-6 py-3 rounded-2xl bg-white text-pink-700 font-extrabold text-xs shadow-md hover:bg-pink-50 inline-flex items-center gap-2 shrink-0 transition-all"
        >
          <span>Ask Baby Care AI</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>

      {/* AGENT 3 SAFETY & CARE COORDINATION AI HERO BANNER */}
      <section className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase">
                Agent 3 • Safety & Care Coordination
              </span>
              <span className="text-xs font-semibold text-purple-100">Cross-Journey Orchestration</span>
            </div>
            <h3 className="text-lg font-bold mt-1">Safety & Care Coordination AI</h3>
            <p className="text-xs text-purple-100">
              Connects Safety Shield, Appointments, Doctor Brief, Trends, Follow-ups, and Care Tasks.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateSubPage("safety-care-coordination-ai")}
          className="px-6 py-3 rounded-2xl bg-white text-purple-700 font-extrabold text-xs shadow-md hover:bg-purple-50 inline-flex items-center gap-2 shrink-0 transition-all"
        >
          <span>Ask Coordination AI</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>

      {/* 4. FEATURE 25 POSTPARTUM EDUCATION HERO BANNER */}
      <section className="bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase">
                Feature 25 • Context-Aware Education
              </span>
              <span className="text-xs font-semibold text-teal-100">Stage & Record Tailored</span>
            </div>
            <h3 className="text-lg font-bold mt-1">Personalized Postpartum Learning</h3>
            <p className="text-xs text-teal-100">
              Read transparent, evidence-based recovery & baby care guides customized to your logged records.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateSubPage("education")}
          className="px-6 py-3 rounded-2xl bg-white text-teal-700 font-extrabold text-xs shadow-md hover:bg-teal-50 inline-flex items-center gap-2 shrink-0 transition-all"
        >
          <span>Explore Education</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>

      {/* 5. FEATURE 26 PERSONALIZED RECOVERY INSIGHT HERO BANNER */}
      <section className="bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase">
                Feature 26 • Recovery Story Synthesis
              </span>
              <span className="text-xs font-semibold text-amber-100">Longitudinal Intelligence</span>
            </div>
            <h3 className="text-lg font-bold mt-1">Personalized Recovery Insight</h3>
            <p className="text-xs text-amber-100">
              See what your recorded data says about your overall recovery trajectory across all 8 care domains.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateSubPage("insight")}
          className="px-6 py-3 rounded-2xl bg-white text-rose-700 font-extrabold text-xs shadow-md hover:bg-amber-50 inline-flex items-center gap-2 shrink-0 transition-all"
        >
          <span>View Recovery Picture</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>

      {/* 6. FEATURE 27 BABY GROWTH & MILESTONES HERO BANNER */}
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase">
                Feature 27 • Longitudinal Baby Growth
              </span>
              <span className="text-xs font-semibold text-indigo-100">Physical & Milestone Progress</span>
            </div>
            <h3 className="text-lg font-bold mt-1">Baby Growth & Developmental Milestones</h3>
            <p className="text-xs text-indigo-100">
              Track weight, length, head circumference, and age-appropriate milestone observations over time.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateSubPage("growth")}
          className="px-6 py-3 rounded-2xl bg-white text-indigo-700 font-extrabold text-xs shadow-md hover:bg-indigo-50 inline-flex items-center gap-2 shrink-0 transition-all"
        >
          <span>Explore Baby Growth</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>

      {/* 7. FEATURE 28 VACCINATION TRACKING HERO BANNER */}
      <section className="bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Syringe className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase">
                Feature 28 • Preventive Care
              </span>
              <span className="text-xs font-semibold text-teal-100">Immunization Timeline</span>
            </div>
            <h3 className="text-lg font-bold mt-1">Baby Vaccination Tracking</h3>
            <p className="text-xs text-teal-100">
              Track completed, due, and upcoming immunizations according to the national schedule.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateSubPage("vaccines")}
          className="px-6 py-3 rounded-2xl bg-white text-teal-700 font-extrabold text-xs shadow-md hover:bg-teal-50 inline-flex items-center gap-2 shrink-0 transition-all"
        >
          <span>View Vaccine Card</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>

      {/* 8. FEATURE 29 AI MEMORY / PATIENT HISTORY HERO BANNER */}
      <section className="bg-gradient-to-r from-purple-700 via-indigo-700 to-rose-600 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase">
                Feature 29 • Memory Backbone
              </span>
              <span className="text-xs font-semibold text-purple-100">Longitudinal History Graph</span>
            </div>
            <h3 className="text-lg font-bold mt-1">AI Memory & Patient History</h3>
            <p className="text-xs text-purple-100">
              "BloomNest remembers your journey, not just your data." Inspect mother, baby, & care thread history.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateSubPage("memory")}
          className="px-6 py-3 rounded-2xl bg-white text-purple-800 font-extrabold text-xs shadow-md hover:bg-purple-50 inline-flex items-center gap-2 shrink-0 transition-all"
        >
          <span>Explore Care Memory</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>

      {/* 9. FEATURE 01 JUMP BANNER */}
      <section className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6 fill-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold uppercase">
                Feature 01
              </span>
              <h3 className="text-base font-bold text-slate-900">Postpartum Care Module</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Access delivery details, 4-stage interactive recovery timeline, and stage guidelines.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateSubPage("care")}
          className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-md shadow-rose-500/20 inline-flex items-center gap-2 shrink-0 transition-all"
        >
          <span>Open Postpartum Care</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>

      {/* 3. NEWBORN & MOTHER QUICK ACTIONS GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Infant Feeding</span>
            <Utensils className="w-4 h-4 text-teal-500" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800">Feeding Care</span>
            <p className="text-xs text-slate-500">Feature 10 • Infant Consumption</p>
          </div>
          <button
            onClick={() => onNavigateSubPage("baby-feeding")}
            className="w-full py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold transition-colors"
          >
            + Log Feeding Session
          </button>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Diaper Tracker</span>
            <Baby className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800">Diaper Monitoring</span>
            <p className="text-xs text-slate-500">Feature 11 • Wet & Stool Output</p>
          </div>
          <button
            onClick={() => onNavigateSubPage("diapers")}
            className="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-colors"
          >
            + Open Diaper Monitor
          </button>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mother Vitals</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800">BP & Temperature</span>
            <p className="text-xs text-slate-500">Lochia: Normal Rubra</p>
          </div>
          <button
            onClick={() => onNavigateSubPage("recovery")}
            className="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-colors"
          >
            Check Recovery Vitals
          </button>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Infant Vaccines</span>
            <Syringe className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800">BCG & OPV 0</span>
            <p className="text-xs text-slate-500">Birth Immunization Completed</p>
          </div>
          <button
            onClick={() => onNavigateSubPage("vaccines")}
            className="w-full py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-semibold transition-colors"
          >
            View Vaccine Calendar
          </button>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Care Analytics</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800">Trends & Patterns</span>
            <p className="text-xs text-slate-500">Feature 19 • Time-Series Intelligence</p>
          </div>
          <button
            onClick={() => onNavigateSubPage("trend-pattern")}
            className="w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold transition-colors"
          >
            Open Pattern Engine →
          </button>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Baseline Deviations</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800">Anomaly Detection</span>
            <p className="text-xs text-slate-500">Feature 20 • Personal Baseline Checks</p>
          </div>
          <button
            onClick={() => onNavigateSubPage("anomalies")}
            className="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-colors"
          >
            Check Anomalies →
          </button>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Orchestration</span>
            <Sparkles className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800">Personalized Daily Plan</span>
            <p className="text-xs text-slate-500">Feature 21 • Adaptive Postpartum Day Plan</p>
          </div>
          <button
            onClick={() => onNavigateSubPage("plan")}
            className="w-full py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold transition-colors"
          >
            Open Today's Plan →
          </button>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Adaptive Notifications</span>
            <Bell className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800">Context-Aware Reminders</span>
            <p className="text-xs text-slate-500">Feature 22 • Closed-Loop Notification Engine</p>
          </div>
          <button
            onClick={() => onNavigateSubPage("reminders")}
            className="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-colors"
          >
            Manage Reminders →
          </button>
        </div>
      </section>

      {/* 4. STAGE RECOVERY FOCUS & GUIDANCE */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">Current Stage Focus</span>
            <h3 className="text-lg font-bold text-slate-900">{stage.title} (Days {stage.dayRange})</h3>
          </div>
          <button
            onClick={() => onNavigateSubPage("care")}
            className="text-xs font-semibold text-rose-600 hover:underline"
          >
            View Full Timeline →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stage.guidanceCategories.map((cat, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{cat.title}</h4>
              <ul className="space-y-1.5">
                {cat.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

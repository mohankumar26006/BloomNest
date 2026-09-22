import React from "react";
import { useApp } from "../context/AppContext";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { HeroFetalProgress } from "../components/dashboard/HeroFetalProgress";
import { TodaysPriorities } from "../components/dashboard/TodaysPriorities";
import { NextAppointmentCard } from "../components/dashboard/NextAppointmentCard";
import { VitalsSummaryStrip } from "../components/dashboard/VitalsSummaryStrip";
import { calculatePregnancyProgress } from "../utils/pregnancyCalculation";
import { BloomAIInsightCard } from "../components/dashboard/BloomAIInsightCard";
import { JourneyDiscoveryHub } from "../components/dashboard/JourneyDiscoveryHub";
import { HealthVital } from "../types";
import { Siren, PhoneCall, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";

export const DashboardPage: React.FC = () => {
  const {
    user,
    vitals,
    medicines,
    toggleMedicineTaken,
    appointments,
    kickSessions,
    contractions,
    moodLogs,
    setActivePage,
    t,
  } = useApp();

  // Dynamic time of day greeting
  const currentHour = new Date().getHours();
  const timeOfDayGreeting =
    currentHour < 12
      ? t("goodMorning")
      : currentHour < 18
      ? t("goodAfternoon")
      : t("goodEvening");

  // Clinical day-by-day pregnancy calculation
  const pregnancyProgress = calculatePregnancyProgress(user);
  const { currentWeek, trimester, daysRemaining, progressPercent } = pregnancyProgress;

  // 1. Kick Counter Cross-Feature Data Link: Sum today's sessions
  const todayStr = new Date().toISOString().split("T")[0];
  const todayKicksFromSessions = (kickSessions || [])
    .filter((s) => s.date === todayStr)
    .reduce((sum, s) => sum + (s.kickCount || 0), 0);

  const todayVital = vitals[0];
  const effectiveVital: Partial<HealthVital> | undefined = todayVital
    ? {
        ...todayVital,
        babyKicksCount: Math.max(todayVital.babyKicksCount || 0, todayKicksFromSessions),
      }
    : todayKicksFromSessions > 0
    ? {
        waterMl: 0,
        weightKg: user.prePregnancyDetails?.prePregnancyWeightKg || 64,
        babyKicksCount: todayKicksFromSessions,
      }
    : undefined;

  // 2. Mood Tracker Cross-Feature Data Link: Read actual logged mood from MoodPage
  const latestMood = moodLogs && moodLogs.length > 0 ? moodLogs[0].mood : "Calm";

  // 3. Appointments Cross-Feature Data Link: Chronologically nearest upcoming visit
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const upcomingApt =
    [...appointments]
      .filter((a) => a.status === "upcoming" && new Date(a.appointmentDate || a.date).getTime() >= now.getTime())
      .sort((a, b) => new Date(a.appointmentDate || a.date).getTime() - new Date(b.appointmentDate || b.date).getTime())[0] ||
    appointments.find((a) => a.status === "upcoming");

  // 4. Contraction Timer Cross-Feature Data Link: 5-1-1 Rule Active Labor Check
  const recentContractions = (contractions || []).slice(0, 5);
  const contractionsWithInterval = recentContractions.filter((c) => c.intervalSeconds > 0);
  const isRule511Met =
    recentContractions.length >= 3 &&
    contractionsWithInterval.length >= 2 &&
    recentContractions.every((c) => c.durationSeconds >= 45) &&
    contractionsWithInterval.every((c) => c.intervalSeconds <= 330);

  // 5. Vitals Risk Cross-Feature Data Link: Alert whenever vitals are outside normal range
  const vitalsStatus = todayVital?.evaluation?.overallStatus || (
    todayVital?.systolicBp && todayVital?.diastolicBp
      ? (todayVital.systolicBp >= 160 || todayVital.diastolicBp >= 110
          ? "SEVERE"
          : todayVital.systolicBp >= 140 || todayVital.diastolicBp >= 90
          ? "HIGH"
          : todayVital.systolicBp > 120 || todayVital.diastolicBp > 80 || todayVital.systolicBp < 90 || todayVital.diastolicBp < 60
          ? "ATTENTION"
          : "NORMAL")
      : "NORMAL"
  );
  const requiresUrgentVitalsCare = vitalsStatus === "SEVERE" || todayVital?.evaluation?.requiresUrgentAttention;
  const isVitalsAttentionOrHigh = vitalsStatus === "HIGH" || vitalsStatus === "ATTENTION";
  const bpAlertText = todayVital?.evaluation?.bp?.statusText || (
    vitalsStatus === "SEVERE"
      ? "Severe blood pressure reading recorded. Please seek medical advice."
      : vitalsStatus === "HIGH"
      ? "High blood pressure recorded (≥140/90 mmHg). Notify your doctor."
      : "Blood pressure reading outside target reference range. Rest and monitor."
  );

  return (
    <div className="min-h-screen text-gray-900 dark:text-rose-100 pb-24 pt-2 space-y-6 font-sans max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* 1. PERSONALIZED WELCOME HEADER */}
      <DashboardHeader
        user={{
          ...user,
          currentWeek,
          trimester,
          daysRemaining,
        }}
        timeOfDayGreeting={timeOfDayGreeting}
        onNavigate={setActivePage}
        t={t}
      />

      {/* ACTIVE LABOR 5-1-1 TRIAGE BANNER (Connected from Contraction Timer) */}
      {isRule511Met && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-white/20 rounded-2xl shrink-0">
              <Siren className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">
                5-1-1 Labor Rule Detected
              </span>
              <h3 className="font-serif text-lg font-bold mt-1">Active Labor In Progress</h3>
              <p className="text-xs text-rose-100 mt-0.5">
                Contractions are 5 minutes apart, lasting ~1 minute. Please proceed to your delivery hospital.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActivePage("emergency")}
            className="px-6 py-2.5 bg-white text-red-600 rounded-2xl font-extrabold text-xs shadow-lg hover:bg-rose-50 shrink-0 flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Maternity Triage</span>
          </button>
        </div>
      )}

      {/* SEVERE BLOOD PRESSURE / VITALS EMERGENCY ALERT */}
      {!isRule511Met && requiresUrgentVitalsCare && (
        <div className="p-5 rounded-3xl bg-rose-600 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0 text-white" />
            <div>
              <div className="text-sm font-extrabold">🚨 Clinical Emergency Alert ({todayVital?.systolicBp}/{todayVital?.diastolicBp} mmHg)</div>
              <div className="text-xs opacity-95">{bpAlertText} Contact Dr. {user.doctorName || "your obstetrician"} immediately.</div>
            </div>
          </div>
          <button
            onClick={() => setActivePage("health-tracker")}
            className="px-4 py-2 bg-white text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold uppercase shrink-0 transition-all shadow-xs"
          >
            Review Vitals
          </button>
        </div>
      )}

      {/* ATTENTION / HIGH BLOOD PRESSURE ALERT */}
      {!isRule511Met && !requiresUrgentVitalsCare && isVitalsAttentionOrHigh && (
        <div className="p-5 rounded-3xl bg-amber-500/90 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0 text-white" />
            <div>
              <div className="text-sm font-extrabold">⚠️ Blood Pressure Attention ({todayVital?.systolicBp}/{todayVital?.diastolicBp} mmHg)</div>
              <div className="text-xs opacity-95">{bpAlertText}</div>
            </div>
          </div>
          <button
            onClick={() => setActivePage("health-tracker")}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold uppercase shrink-0 transition-all"
          >
            Review Vitals
          </button>
        </div>
      )}

      {/* 2. PRIMARY MATERNAL HERO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Integrated Fetal Progress HUD */}
        <div className="lg:col-span-2">
          <HeroFetalProgress
            currentWeek={currentWeek}
            trimester={trimester}
            daysRemaining={daysRemaining}
            progressPercent={progressPercent}
            onNavigate={setActivePage}
            t={t}
          />
        </div>

        {/* Right 1 Column: Today's Priorities & Care Checkup */}
        <div className="space-y-6">
          <TodaysPriorities
            medicines={medicines}
            onToggleMedicine={toggleMedicineTaken}
            onNavigate={setActivePage}
            t={t}
          />

          <NextAppointmentCard
            appointment={upcomingApt}
            onNavigate={setActivePage}
            t={t}
          />
        </div>
      </div>

      {/* 3. DAILY VITALS SUMMARY STRIP (Dynamically connected to Vitals, Mood & Kick Counter) */}
      <VitalsSummaryStrip
        todayVital={effectiveVital}
        selectedMood={latestMood}
        onNavigate={setActivePage}
        t={t}
      />

      {/* 4. BLOOM AI CONTEXTUAL INSIGHT */}
      <BloomAIInsightCard
        currentWeek={user.currentWeek}
        onNavigate={setActivePage}
        t={t}
      />

      {/* 4.5. MY DIGITAL TWIN (ADAPTIVE 3D MATERNAL TWIN) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-50/80 to-white/90 dark:from-slate-900/90 dark:to-slate-900/90 border border-rose-200/70 dark:border-rose-900/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-rose-500/15 text-rose-700 dark:text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-300/40">
                New · 3D Living State
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Week {user.currentWeek || 24} Journey
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-rose-100 font-serif">
              My Digital Twin
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 max-w-xl">
              An adaptive 3D maternal avatar connected directly to your logged health vitals, symptoms, sleep, and emotional wellbeing.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActivePage("digital-twin")}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <span>Open 3D Twin View</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 5. JOURNEY DISCOVERY HUB */}
      <JourneyDiscoveryHub
        journey={user.currentJourney}
        currentWeek={user.currentWeek}
        onNavigate={setActivePage}
        t={t}
      />
    </div>
  );
};

export default DashboardPage;

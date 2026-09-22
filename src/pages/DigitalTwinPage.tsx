import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { buildDigitalTwinState } from "../services/digitalTwinService";
import { AvatarVisualState } from "../types/digitalTwin";
import { MaternalAvatar3D } from "../components/digitalTwin/MaternalAvatar3D";
import { WhatChangedCard } from "../components/digitalTwin/WhatChangedCard";
import {
  Heart,
  Activity,
  Moon,
  Droplets,
  Smile,
  Calendar,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Brain,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";

export const DigitalTwinPage: React.FC = () => {
  const [previewState, setPreviewState] = useState<AvatarVisualState | null>(null);
  const [activeTab, setActiveTab] = useState<"today" | "timeline" | "care">("today");
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  const {
    user,
    vitals,
    appointments,
    medicines,
    moodLogs,
    setActivePage,
  } = useApp();

  // Derive live Digital Twin State strictly from actual project data
  const digitalTwin = useMemo(() => {
    return buildDigitalTwinState({
      user,
      vitals,
      appointments,
      medicines,
      moodLogs,
    });
  }, [user, vitals, appointments, medicines, moodLogs]);

  const { pregnancy, health, wellness, care, memory, safety, avatar, changes } = digitalTwin;

  const effectiveState = previewState || avatar.state;

  // Gentle maternal status config with pastel fills (never bright red or neon)
  const getStatusDisplay = (state: AvatarVisualState) => {
    switch (state) {
      case "POSITIVE":
        return {
          title: "Blooming & Energized",
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
          supportMessage: "Restful sleep, balanced wellness, and cheerful spirits — you and baby are blooming today!",
        };
      case "TIRED":
        return {
          title: "Feeling a Bit Tired",
          badge: "bg-sky-50 text-sky-700 border-sky-200",
          supportMessage: "Sleep was a bit light last night. Take a cozy rest and let yourself unwind today.",
        };
      case "DISCOMFORT":
        return {
          title: "Rest & Comfort Needed",
          badge: "bg-rose-50 text-rose-700 border-rose-200",
          supportMessage: "You've noted some physical discomfort today — rest with gentle pillow support and hydrate.",
        };
      case "LOW_MOOD":
        return {
          title: "Gentle Self-Care",
          badge: "bg-purple-50 text-purple-700 border-purple-200",
          supportMessage: "Holding a quiet space for you today. Remember to be gentle with yourself, one breath at a time.",
        };
      case "ATTENTION":
        return {
          title: "Gentle Check-in Advised",
          badge: "bg-amber-50 text-amber-800 border-amber-200",
          supportMessage: "A vital reading was slightly outside your typical target — worth checking with your doctor about this.",
        };
      case "STABLE":
      default:
        return {
          title: "Calm & Steady",
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
          supportMessage: "Everything is calm, steady, and balanced on your pregnancy journey today.",
        };
    }
  };

  const statusInfo = getStatusDisplay(effectiveState);

  const toggleMetric = (key: string) => {
    setExpandedMetric((prev) => (prev === key ? null : key));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 bg-[#FAF8FC] text-gray-800 p-3 sm:p-6 rounded-3xl min-h-screen">
      {/* Calm & Supportive Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-purple-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold tracking-wider uppercase text-purple-700 bg-purple-100/70 px-3 py-1 rounded-full">
              My Digital Twin
            </span>
            <span className="text-xs text-gray-500">
              Week {pregnancy.week} of 40
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif">
            Maternal Companion
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            A serene, living reflection of how you and your baby are doing today.
          </p>
        </div>

        {/* Quick Log Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActivePage("health-tracker")}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FAF8FC] text-gray-700 border border-purple-100 hover:border-purple-300 transition-colors shadow-xs text-xs font-medium"
          >
            <Activity className="w-3.5 h-3.5 text-purple-600" />
            Log Vitals
          </button>
          <button
            type="button"
            onClick={() => setActivePage("mood-tracker")}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FAF8FC] text-gray-700 border border-purple-100 hover:border-purple-300 transition-colors shadow-xs text-xs font-medium"
          >
            <Smile className="w-3.5 h-3.5 text-purple-600" />
            Check In Mood
          </button>
        </div>
      </div>

      {/* Gentle Amber Banner (Only shown when genuine Attention state is active - never red alert) */}
      {effectiveState === "ATTENTION" && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-900">
                Gentle Note from Your Companion
              </h4>
              <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                {avatar.reason || "A vital reading was slightly outside your usual target — worth checking with your doctor about this."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActivePage("health-tracker")}
            className="px-3.5 py-1.5 rounded-xl bg-amber-200/70 text-amber-900 text-xs font-semibold hover:bg-amber-200 transition-colors shrink-0"
          >
            View Details
          </button>
        </div>
      )}

      {/* Hero Section: Centered Photorealistic Maternal Avatar */}
      <div className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Large Centered Avatar Viewport */}
        <div className="max-w-xl mx-auto w-full aspect-[4/4.8] sm:h-[500px]">
          <MaternalAvatar3D
            state={effectiveState}
            trimester={pregnancy.trimester}
            gestationalWeek={pregnancy.week}
            label={statusInfo.title}
            reason={previewState ? `Previewing ${previewState} expression` : undefined}
          />
        </div>

        {/* Centered Maternal State & One-Line Supportive Message */}
        <div className="max-w-xl mx-auto text-center space-y-2.5">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold shadow-xs transition-colors mx-auto ${statusInfo.badge}`}>
            <span className="w-2 h-2 rounded-full bg-current" />
            <span>{statusInfo.title}</span>
            <span className="text-gray-400 font-normal">· Week {pregnancy.week}</span>
          </div>

          <p className="text-base sm:text-lg font-serif text-gray-700 italic leading-relaxed">
            "{previewState ? avatar.reason : statusInfo.supportMessage}"
          </p>

          {/* Pregnancy Progress Bar */}
          <div className="max-w-md mx-auto pt-2">
            <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
              <span>Trimester {pregnancy.trimester}</span>
              <span>{pregnancy.progress}% of Journey</span>
            </div>
            <div className="w-full bg-purple-100/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${pregnancy.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Soft Lavender State Simulation Strip */}
        <div className="pt-2 border-t border-purple-50 flex flex-wrap items-center justify-center gap-2">
          <span className="text-[11px] text-gray-500 font-medium mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-500" />
            Explore expressions:
          </span>
          <button
            type="button"
            onClick={() => setPreviewState(null)}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
              previewState === null
                ? "bg-purple-600 text-white shadow-xs font-semibold"
                : "bg-purple-50 text-gray-600 hover:bg-purple-100"
            }`}
          >
            ● Live Status
          </button>
          {(["POSITIVE", "STABLE", "TIRED", "DISCOMFORT", "ATTENTION", "LOW_MOOD"] as AvatarVisualState[]).map(
            (st) => {
              const labelMap: Record<AvatarVisualState, string> = {
                POSITIVE: "Blooming",
                STABLE: "Steady",
                TIRED: "Tired",
                DISCOMFORT: "Discomfort",
                ATTENTION: "Check-in",
                LOW_MOOD: "Low Mood",
              };
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setPreviewState(st)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                    previewState === st
                      ? "bg-purple-600 text-white shadow-xs font-semibold"
                      : "bg-purple-50/70 text-gray-600 hover:bg-purple-100"
                  }`}
                >
                  {labelMap[st]}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Navigation Tabs to keep primary view uncluttered */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <div className="bg-purple-100/60 p-1 rounded-2xl border border-purple-100 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("today")}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === "today"
                ? "bg-white text-purple-900 shadow-xs font-semibold"
                : "text-gray-600 hover:text-purple-800"
            }`}
          >
            Today's Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("timeline")}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "timeline"
                ? "bg-white text-purple-900 shadow-xs font-semibold"
                : "text-gray-600 hover:text-purple-800"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            What Changed?
            {changes.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-purple-200 text-[10px] text-purple-800 flex items-center justify-center font-bold">
                {changes.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("care")}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "care"
                ? "bg-white text-purple-900 shadow-xs font-semibold"
                : "text-gray-600 hover:text-purple-800"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Care & Details
          </button>
        </div>
      </div>

      {/* TAB 1: TODAY'S OVERVIEW (Simplified 2-3 Key Metric Summaries Max) */}
      {activeTab === "today" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Rest & Sleep */}
            <div
              onClick={() => toggleMetric("sleep")}
              className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs hover:border-purple-200 transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      Rest & Sleep
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Last night's duration
                    </p>
                  </div>
                </div>
                {expandedMetric === "sleep" ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div className="text-2xl font-bold text-gray-900">
                  {wellness.sleep.lastNightHours}h
                </div>
                <span className="text-xs font-medium text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                  {wellness.sleep.isRestful ? "Restful" : "Needs Rest"}
                </span>
              </div>

              {expandedMetric === "sleep" && (
                <div className="pt-2 border-t border-gray-100 text-xs text-gray-600 leading-relaxed">
                  {wellness.sleep.qualityDescription}. Aim for 7–9 hours of sleep with comfortable left-side lying support.
                </div>
              )}
            </div>

            {/* Card 2: Hydration & Wellness */}
            <div
              onClick={() => toggleMetric("hydration")}
              className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs hover:border-purple-200 transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      Hydration
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Today's intake
                    </p>
                  </div>
                </div>
                {expandedMetric === "hydration" ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div className="text-2xl font-bold text-gray-900">
                  {(wellness.hydration.todayMl / 1000).toFixed(1)} L
                </div>
                <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                  Target: {(wellness.hydration.targetMl / 1000).toFixed(1)} L
                </span>
              </div>

              {expandedMetric === "hydration" && (
                <div className="pt-2 border-t border-gray-100 text-xs text-gray-600 leading-relaxed">
                  {wellness.hydration.isAdequate
                    ? "Hydration is well-maintained today, supporting amniotic fluid and circulation."
                    : "Remember to drink small sips of water throughout the afternoon."}
                </div>
              )}
            </div>

            {/* Card 3: Heart & Gentle Vitals */}
            <div
              onClick={() => toggleMetric("vitals")}
              className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs hover:border-purple-200 transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      Heart & Vitals
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Recent baseline
                    </p>
                  </div>
                </div>
                {expandedMetric === "vitals" ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div className="text-2xl font-bold text-gray-900">
                  {health.recentVitals.bp || "118/76"}
                </div>
                <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                  {health.recentVitals.pulse ? `${health.recentVitals.pulse} BPM` : "78 BPM"}
                </span>
              </div>

              {expandedMetric === "vitals" && (
                <div className="pt-2 border-t border-gray-100 text-xs text-gray-600 leading-relaxed space-y-1">
                  <div>Blood pressure target is 90–120 / 60–80 mmHg.</div>
                  {health.recentVitals.map && <div>Mean Arterial Pressure: {health.recentVitals.map} mmHg</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WHAT CHANGED? (Longitudinal Diff Engine) */}
      {activeTab === "timeline" && (
        <div className="space-y-4">
          <WhatChangedCard changes={changes} />
        </div>
      )}

      {/* TAB 3: CARE & ROUTINES (Appointments, Meds, Preferences, Safety) */}
      {activeTab === "care" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Care & Routines Card */}
          <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900 font-serif">
                Upcoming Doctor Care
              </h4>
            </div>

            <div className="space-y-2">
              {care.upcomingAppointments.length > 0 ? (
                care.upcomingAppointments.slice(0, 2).map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3 rounded-2xl bg-[#FAF8FC] border border-purple-100/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">
                        {apt.title}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {apt.date} {apt.doctorName ? `· ${apt.doctorName}` : ""}
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full border border-purple-200/60">
                      Scheduled
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500 py-2">
                  No upcoming appointments scheduled for this week.
                </div>
              )}

              <div className="flex items-center justify-between pt-2 text-xs border-t border-gray-100">
                <span className="text-gray-500">
                  Medications taken today:
                </span>
                <span className="font-semibold text-gray-800">
                  {care.medications.takenTodayCount} of {care.medications.totalActive} active
                </span>
              </div>
            </div>
          </div>

          {/* Maternal Preferences & Memory */}
          <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900 font-serif">
                Maternal Preferences
              </h4>
            </div>

            <div className="space-y-2">
              {memory.relevantMemories.map((mem, idx) => (
                <div
                  key={idx}
                  className="text-xs text-gray-600 p-2.5 rounded-xl bg-[#FAF8FC] border border-purple-100/60 flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>{mem}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Shield Verification (Calm Warm Amber / Soft Green, Never Red SEVERE) */}
          <div className="md:col-span-2 p-4 rounded-2xl bg-[#FAF8FC] border border-purple-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-gray-800">
                ACOG Clinical Guidelines Safety Shield Active
              </span>
            </div>
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                safety.status === "NORMAL"
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                  : "text-amber-800 bg-amber-50 border-amber-200"
              }`}
            >
              {safety.status === "NORMAL" ? "Status: Normal Target" : "Status: Review Advised"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

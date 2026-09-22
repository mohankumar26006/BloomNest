import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  PostpartumProfile,
  MotherRecoveryLog,
  BabyProfileData,
  BleedingLog,
  PainLog,
  WoundLog,
  BreastfeedingLog,
  PumpingLog,
  BabyFeedingLog,
  DiaperLog,
  MotherSleepLog,
  MotherFatigueLog,
  BabySleepLog,
  MotherMoodWellbeingLog,
  MotherMealLog,
  MotherFluidLog,
  MotherMedicationItem,
  MotherMedicationLog,
  MotherBabyAppointment,
  DoctorBriefType,
  DoctorBriefItem,
} from "../types";
import { evaluateSafetyShield } from "../utils/safetyShieldEngine";
import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
  getRecoveryStage,
  formatDeliveryType,
  formatBabyAge,
} from "../utils/postpartumUtils";
import {
  FileText,
  Printer,
  Calendar,
  Clock,
  User,
  Baby,
  Heart,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Info,
  Sliders,
  ChevronRight,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Stethoscope,
  Building2,
  TrendingUp,
} from "lucide-react";

const DOCTOR_BRIEFS_KEY = "bloomnest_doctor_briefs_v1";

interface DoctorBriefPageProps {
  onNavigateSubPage?: (page: string) => void;
}

export const DoctorBriefPage: React.FC<DoctorBriefPageProps> = ({ onNavigateSubPage }) => {
  const { user } = useApp();

  // Context Data States
  const [profile, setProfile] = useState<PostpartumProfile | null>(null);
  const [motherLogs, setMotherLogs] = useState<MotherRecoveryLog[]>([]);
  const [babyProfile, setBabyProfile] = useState<BabyProfileData | null>(null);
  const [bleedingLogs, setBleedingLogs] = useState<BleedingLog[]>([]);
  const [painLogs, setPainLogs] = useState<PainLog[]>([]);
  const [woundLogs, setWoundLogs] = useState<WoundLog[]>([]);
  const [breastfeedingLogs, setBreastfeedingLogs] = useState<BreastfeedingLog[]>([]);
  const [pumpingLogs, setPumpingLogs] = useState<PumpingLog[]>([]);
  const [babyFeedingLogs, setBabyFeedingLogs] = useState<BabyFeedingLog[]>([]);
  const [diaperLogs, setDiaperLogs] = useState<DiaperLog[]>([]);
  const [sleepLogs, setSleepLogs] = useState<MotherSleepLog[]>([]);
  const [fatigueLogs, setFatigueLogs] = useState<MotherFatigueLog[]>([]);
  const [babySleepLogs, setBabySleepLogs] = useState<BabySleepLog[]>([]);
  const [moodLogs, setMoodLogs] = useState<MotherMoodWellbeingLog[]>([]);
  const [mealLogs, setMealLogs] = useState<MotherMealLog[]>([]);
  const [fluidLogs, setFluidLogs] = useState<MotherFluidLog[]>([]);
  const [medicationItems, setMedicationItems] = useState<MotherMedicationItem[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MotherMedicationLog[]>([]);
  const [appointments, setAppointments] = useState<MotherBabyAppointment[]>([]);

  // Brief Config State
  const [briefType, setBriefType] = useState<DoctorBriefType>("postpartum_recovery");
  const [selectedApptId, setSelectedApptId] = useState<string>("");
  const [timeRangeDays, setTimeRangeDays] = useState<number>(7);
  const [questions, setQuestions] = useState<string[]>([
    "Is my physical pain and lochia pattern normal for this postpartum stage?",
    "Are there any adjustments needed for my active medications or supplements?",
    "When is it safe to begin light pelvic floor & core recovery exercises?",
  ]);
  const [newQuestionText, setNewQuestionText] = useState<string>("");
  const [customDoctorNotes, setCustomDoctorNotes] = useState<string>("");

  // Privacy & Module Inclusion Toggles
  const [includedModules, setIncludedModules] = useState<Record<string, boolean>>({
    recovery: true,
    bleeding: true,
    pain: true,
    wound: true,
    breastfeeding: true,
    pumping: true,
    baby_feeding: false,
    diaper: false,
    mother_sleep: true,
    baby_sleep: false,
    mood: true,
    nutrition: true,
    medication: true,
    safety: true,
  });

  // Load all contexts
  useEffect(() => {
    // 1. Feature 01 Context
    const savedProfile = localStorage.getItem("bloomnest_postpartum_profile_v1");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else if (user?.journeyStage === "POST_PREGNANCY") {
      setProfile({
        deliveryDate: new Date().toISOString().split("T")[0],
        deliveryType: "vaginal",
        numberOfBabies: 1,
      });
    }

    // Load Features 2–17 records
    const rLogs = localStorage.getItem("bloomnest_mother_recovery_logs_v1");
    if (rLogs) setMotherLogs(JSON.parse(rLogs));

    const bProfile = localStorage.getItem("bloomnest_baby_profile_v1");
    if (bProfile) setBabyProfile(JSON.parse(bProfile));

    const bLogs = localStorage.getItem("bloomnest_bleeding_logs_v1");
    if (bLogs) setBleedingLogs(JSON.parse(bLogs));

    const pLogs = localStorage.getItem("bloomnest_pain_logs_v1");
    if (pLogs) setPainLogs(JSON.parse(pLogs));

    const wLogs = localStorage.getItem("bloomnest_wound_logs_v1");
    if (wLogs) setWoundLogs(JSON.parse(wLogs));

    const bfLogs = localStorage.getItem("bloomnest_breastfeeding_logs_v1");
    if (bfLogs) setBreastfeedingLogs(JSON.parse(bfLogs));

    const pumpLogs = localStorage.getItem("bloomnest_pumping_logs_v1");
    if (pumpLogs) setPumpingLogs(JSON.parse(pumpLogs));

    const feedLogs = localStorage.getItem("bloomnest_baby_feeding_logs_v1");
    if (feedLogs) setBabyFeedingLogs(JSON.parse(feedLogs));

    const dLogs = localStorage.getItem("bloomnest_diaper_logs_v1");
    if (dLogs) setDiaperLogs(JSON.parse(dLogs));

    const slpLogs = localStorage.getItem("bloomnest_mother_sleep_logs_v1");
    if (slpLogs) setSleepLogs(JSON.parse(slpLogs));

    const ftgLogs = localStorage.getItem("bloomnest_mother_fatigue_logs_v1");
    if (ftgLogs) setFatigueLogs(JSON.parse(ftgLogs));

    const bsLogs = localStorage.getItem("bloomnest_baby_sleep_logs_v1");
    if (bsLogs) setBabySleepLogs(JSON.parse(bsLogs));

    const mLogs = localStorage.getItem("bloomnest_mood_wellbeing_logs_v1");
    if (mLogs) setMoodLogs(JSON.parse(mLogs));

    const mlLogs = localStorage.getItem("bloomnest_mother_meal_logs_v1");
    if (mlLogs) setMealLogs(JSON.parse(mlLogs));

    const flLogs = localStorage.getItem("bloomnest_mother_fluid_logs_v1");
    if (flLogs) setFluidLogs(JSON.parse(flLogs));

    const medItems = localStorage.getItem("bloomnest_mother_medications_v1");
    if (medItems) setMedicationItems(JSON.parse(medItems));

    const mdLogs = localStorage.getItem("bloomnest_mother_medication_logs_v1");
    if (mdLogs) setMedicationLogs(JSON.parse(mdLogs));

    const apptItems = localStorage.getItem("bloomnest_mother_baby_appointments_v1");
    if (apptItems) setAppointments(JSON.parse(apptItems));
  }, [user]);

  // Handle appointment auto selection & module defaults
  const handleSelectAppointment = (apptId: string) => {
    setSelectedApptId(apptId);
    const appt = appointments.find((a) => a.id === apptId);
    if (!appt) return;

    // Populate questions from selected appointment
    if (appt.questions && appt.questions.length > 0) {
      setQuestions(appt.questions.map((q) => q.question));
    }

    // Auto toggle modules based on appointment target & category
    const cat = appt.category.toLowerCase();
    if (cat.includes("lactation") || cat.includes("breastfeeding")) {
      setBriefType("lactation_consult");
      setIncludedModules({
        recovery: true,
        bleeding: false,
        pain: true,
        wound: false,
        breastfeeding: true,
        pumping: true,
        baby_feeding: true,
        diaper: false,
        mother_sleep: true,
        baby_sleep: false,
        mood: true,
        nutrition: true,
        medication: true,
        safety: true,
      });
    } else if (cat.includes("pediatric") || cat.includes("newborn") || appt.target === "baby") {
      setBriefType("pediatric_checkup");
      setIncludedModules({
        recovery: false,
        bleeding: false,
        pain: false,
        wound: false,
        breastfeeding: true,
        pumping: false,
        baby_feeding: true,
        diaper: true,
        mother_sleep: false,
        baby_sleep: true,
        mood: false,
        nutrition: false,
        medication: false,
        safety: true,
      });
    } else if (cat.includes("wound") || cat.includes("c-section")) {
      setBriefType("wound_followup");
      setIncludedModules({
        recovery: true,
        bleeding: true,
        pain: true,
        wound: true,
        breastfeeding: false,
        pumping: false,
        baby_feeding: false,
        diaper: false,
        mother_sleep: true,
        baby_sleep: false,
        mood: true,
        nutrition: true,
        medication: true,
        safety: true,
      });
    } else {
      setBriefType("postpartum_recovery");
      setIncludedModules({
        recovery: true,
        bleeding: true,
        pain: true,
        wound: true,
        breastfeeding: true,
        pumping: true,
        baby_feeding: false,
        diaper: false,
        mother_sleep: true,
        baby_sleep: false,
        mood: true,
        nutrition: true,
        medication: true,
        safety: true,
      });
    }
  };

  // Derived postpartum context
  const deliveryDateStr = profile?.deliveryDate || new Date().toISOString().split("T")[0];
  const postpartumDay = calculatePostpartumDay(deliveryDateStr);
  const postpartumWeek = calculatePostpartumWeek(postpartumDay);
  const recoveryStage = getRecoveryStage(postpartumDay).title;

  // Safety Shield Evaluation
  const safetyEval = evaluateSafetyShield(
    profile,
    motherLogs,
    babyProfile,
    bleedingLogs,
    painLogs,
    woundLogs,
    breastfeedingLogs,
    pumpingLogs,
    babyFeedingLogs,
    diaperLogs,
    sleepLogs,
    fatigueLogs,
    babySleepLogs,
    moodLogs,
    mealLogs,
    fluidLogs,
    medicationItems,
    medicationLogs,
    appointments
  );

  // Derived Clinical Summaries (Strictly from recorded data)
  const latestRecovery = motherLogs[0];
  const latestBleeding = bleedingLogs[0];
  const latestPain = painLogs[0];
  const latestWound = woundLogs[0];
  const latestSleep = sleepLogs[0];
  const latestFatigue = fatigueLogs[0];
  const latestMood = moodLogs[0];
  const activeMeds = medicationItems.filter((m) => m.status === "active");

  // Calculations
  const takenMedsCount = medicationLogs.filter((l) => l.doseStatus === "taken").length;
  const totalMedsCount = medicationLogs.length;

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    setQuestions([...questions, newQuestionText.trim()]);
    setNewQuestionText("");
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const selectedAppt = appointments.find((a) => a.id === selectedApptId);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] text-slate-800 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      
      {/* TOP HEADER WITH ACTIONS */}
      <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 text-xs font-semibold rounded-full flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800">
              <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Feature 18 • Postpartum Care
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full">
              Day {postpartumDay} • Week {postpartumWeek}
            </span>
            <span className="px-3 py-1 rounded-full bg-rose-500 text-white font-extrabold text-xs">
              {recoveryStage}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Clinician Doctor Brief
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Concise, clinician-ready summary layer converting Features 1–17 records into an exportable visit brief.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          {onNavigateSubPage && (
            <button
              onClick={() => onNavigateSubPage("trend-pattern")}
              className="px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Trends (Feat 19)
            </button>
          )}
          {onNavigateSubPage && (
            <button
              onClick={() => onNavigateSubPage("appointments")}
              className="px-3.5 py-2 rounded-xl border border-sky-200 dark:border-sky-900/50 bg-sky-50 dark:bg-sky-950/30 text-sky-800 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Appointments (Feat 17)
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF Brief
          </button>
        </div>
      </div>

      {/* APPOINTMENT & BRIEF SELECTOR BAR */}
      <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Configure Visit Context & Included Modules
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Link to Scheduled Appointment</label>
            <select
              value={selectedApptId}
              onChange={(e) => handleSelectAppointment(e.target.value)}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- General Postpartum Visit --</option>
              {appointments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.date} • {a.target.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Brief Category / Type</label>
            <select
              value={briefType}
              onChange={(e) => setBriefType(e.target.value as DoctorBriefType)}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="postpartum_recovery">Postpartum Recovery Check</option>
              <option value="lactation_consult">Lactation & Breastfeeding Consult</option>
              <option value="pediatric_checkup">Newborn Pediatric Visit</option>
              <option value="wound_followup">C-Section / Wound Follow-up</option>
              <option value="medication_review">Medication & Supplement Review</option>
              <option value="custom">Custom Summary</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DOCTOR BRIEF PRINT-READY DOCUMENT CONTAINMENT CARD                        */}
      {/* ========================================================================= */}
      <div id="printable-doctor-brief" className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-6 text-slate-900 dark:text-slate-100 print:bg-white print:text-gray-900 print:shadow-none print:p-0">
        
        {/* SECTION 1 — BRIEF HEADER */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
                BloomNest Clinical Visit Summary
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                DOCTOR BRIEF • {briefType.replace("_", " ").toUpperCase()}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Prepared for: <strong className="text-slate-800 dark:text-slate-200">{selectedAppt ? selectedAppt.title : "Healthcare Provider Visit"}</strong>
              </p>
            </div>

            <div className="text-right text-xs text-slate-600 dark:text-slate-400">
              <p className="font-bold text-slate-900 dark:text-white">Date: {new Date().toLocaleDateString()}</p>
              <p>Delivery: {formatDeliveryType(profile?.deliveryType || "vaginal")}</p>
            </div>
          </div>

          {/* PATIENT CONTEXT GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl p-3.5 mt-4 text-xs border border-indigo-100/80 dark:border-indigo-900/40">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Patient Name</span>
              <strong className="text-slate-900 dark:text-white">{user?.fullName || "Mother"}</strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Postpartum Day</span>
              <strong className="text-indigo-900 dark:text-indigo-300">Day {postpartumDay} (Week {postpartumWeek})</strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Current Stage</span>
              <strong className="text-slate-900 dark:text-white">{recoveryStage}</strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Clinic / Doctor</span>
              <strong className="text-slate-900 dark:text-white">{selectedAppt?.providerName || profile?.doctorName || "OB/GYN Healthcare Provider"}</strong>
            </div>
          </div>
        </div>

        {/* SECTION 2 — CLINICAL SNAPSHOT OVERVIEW */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            1. Clinical Snapshot Overview (Data-Derived Facts)
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {includedModules.recovery && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Overall Recovery</span>
                <strong className="text-slate-900 dark:text-white text-sm">{latestRecovery?.overallRecovery || "Not recorded"}</strong>
              </div>
            )}

            {includedModules.pain && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Pain Rating (Feat 06)</span>
                <strong className="text-slate-900 dark:text-white text-sm">{latestPain ? `${latestPain.pain}/10 (${latestPain.location})` : "Not recorded"}</strong>
              </div>
            )}

            {includedModules.bleeding && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Lochia Bleeding (Feat 05)</span>
                <strong className="text-slate-900 dark:text-white text-sm">{latestBleeding ? `${latestBleeding.amount} • ${latestBleeding.trend}` : "Not recorded"}</strong>
              </div>
            )}

            {includedModules.wound && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Wound Healing (Feat 07)</span>
                <strong className="text-slate-900 dark:text-white text-sm">{latestWound ? `${latestWound.appearance}` : "Not recorded"}</strong>
              </div>
            )}

            {includedModules.mother_sleep && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Rest & Sleep (Feat 12)</span>
                <strong className="text-slate-900 dark:text-white text-sm">{latestSleep ? `${latestSleep.totalSleepDurationMinutes ? Math.round(latestSleep.totalSleepDurationMinutes / 60) : 5}h recorded` : "Not recorded"}</strong>
              </div>
            )}

            {includedModules.mood && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Mood Check-in (Feat 14)</span>
                <strong className="text-slate-900 dark:text-white text-sm">{latestMood ? `Score ${latestMood.moodScore}/5 (${latestMood.emotionalStates.slice(0, 2).join(", ")})` : "Not recorded"}</strong>
              </div>
            )}

            {includedModules.medication && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Medication Adherence</span>
                <strong className="text-slate-900 dark:text-white text-sm">{totalMedsCount > 0 ? `${takenMedsCount}/${totalMedsCount} doses recorded` : `${activeMeds.length} active meds`}</strong>
              </div>
            )}

            {includedModules.breastfeeding && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Breastfeeding Sessions</span>
                <strong className="text-slate-900 dark:text-white text-sm">{breastfeedingLogs.length > 0 ? `${breastfeedingLogs.length} sessions logged` : "Not recorded"}</strong>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3 — RECENT TRENDS & DIRECTIONAL CHANGES */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            2. Recent Trends & Directional Changes
          </h3>

          <div className="bg-slate-50/70 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            {painLogs.length > 1 && (
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span><strong>Pain Score Trend:</strong> {painLogs[1].pain}/10 → {painLogs[0].pain}/10 ({painLogs[0].location})</span>
                <span className={`font-bold ${painLogs[0].pain > painLogs[1].pain ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {painLogs[0].pain > painLogs[1].pain ? "↑ Increasing" : "↓ Improving"}
                </span>
              </div>
            )}

            {bleedingLogs.length > 0 && (
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span><strong>Lochia Bleeding Trend:</strong> {bleedingLogs[0].amount} • {bleedingLogs[0].color}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Trend: {bleedingLogs[0].trend}</span>
              </div>
            )}

            {sleepLogs.length > 0 && (
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span><strong>Maternal Rest & Fatigue:</strong> {latestFatigue ? `Fatigue score ${latestFatigue.fatigueScore}/10` : "Rest quality recorded"}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Average rest logged</span>
              </div>
            )}

            {safetyEval.overallStatus !== "CLEAR" && (
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-900 dark:text-amber-300 flex items-start gap-2 mt-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Safety Shield Note:</strong> {safetyEval.motherIssues[0]?.title || "Observation flagged for doctor review."}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4 — QUESTIONS FOR MY DOCTOR */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            3. Questions for My Doctor / Healthcare Provider
          </h3>

          <div className="space-y-2">
            <ul className="text-xs space-y-1.5 pl-2">
              {questions.map((q, idx) => (
                <li key={idx} className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="font-medium text-slate-900 dark:text-slate-100">☑ {q}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1 print:hidden transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>

            {/* Form to Add Custom Question */}
            <form onSubmit={handleAddQuestion} className="flex gap-2 pt-2 print:hidden">
              <input
                type="text"
                placeholder="Add a custom question to ask your doctor..."
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                className="flex-1 p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Question
              </button>
            </form>
          </div>
        </div>

        {/* SECTION 5 — MODULE PRIVACY & INCLUSION CONTROL */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-3 print:hidden">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            4. Module Inclusions & Privacy Controls
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Toggle which specialized module summaries are included in your exportable brief. Private Journal entries (Feat 14) are excluded by default for privacy.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {Object.keys(includedModules).map((modKey) => (
              <label key={modKey} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <input
                  type="checkbox"
                  checked={includedModules[modKey]}
                  onChange={(e) => setIncludedModules({ ...includedModules, [modKey]: e.target.checked })}
                  className="w-3.5 h-3.5 text-indigo-600 rounded"
                />
                <span className="capitalize font-medium text-slate-800 dark:text-slate-200">{modKey.replace("_", " ")}</span>
              </label>
            ))}
          </div>
        </div>

        {/* DOCUMENT FOOTER */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 text-[11px] text-slate-400 flex flex-col md:flex-row justify-between items-center gap-2">
          <span>Generated via BloomNest Postpartum Care Architecture • Non-Diagnostic Patient Summary</span>
          <span>Page 1 of 1</span>
        </div>

      </div>
    </div>
  );
};

export default DoctorBriefPage;

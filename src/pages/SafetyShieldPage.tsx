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
  SafetyEvaluationResult,
  SafetyIssueItem,
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
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Heart,
  Baby,
  Activity,
  PhoneCall,
  Info,
  ArrowRight,
  CheckCircle2,
  Clock,
  Building2,
  UserCheck,
  Milk,
  Moon,
  Ruler,
  Syringe,
} from "lucide-react";

const POSTPARTUM_PROFILE_KEY = "bloomnest_postpartum_profile_v1";
const RECOVERY_LOGS_KEY = "bloomnest_mother_recovery_logs_v1";
const BABY_PROFILE_KEY = "bloomnest_baby_profile_v1";
const BLEEDING_LOGS_KEY = "bloomnest_bleeding_logs_v1";
const PAIN_LOGS_KEY = "bloomnest_pain_logs_v1";
const WOUND_LOGS_KEY = "bloomnest_wound_logs_v1";
const BREASTFEEDING_LOGS_KEY = "bloomnest_breastfeeding_logs_v1";
const PUMPING_LOGS_KEY = "bloomnest_pumping_logs_v1";
const BABY_FEEDING_LOGS_KEY = "bloomnest_baby_feeding_logs_v1";
const DIAPER_LOGS_KEY = "bloomnest_diaper_logs_v1";
const SLEEP_LOGS_KEY = "bloomnest_mother_sleep_logs_v1";
const FATIGUE_LOGS_KEY = "bloomnest_mother_fatigue_logs_v1";
const BABY_SLEEP_LOGS_KEY = "bloomnest_baby_sleep_logs_v1";

export const SafetyShieldPage: React.FC<{
  onNavigateSubPage?: (page: string) => void;
}> = ({ onNavigateSubPage }) => {
  const { user, setActivePage, showToast } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(true);
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
  const [evaluation, setEvaluation] = useState<SafetyEvaluationResult | null>(null);

  // Load all consumed contexts from Feature 01, 02, 03, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17
  useEffect(() => {
    const loadAllContexts = () => {
      try {
        // 1. Feature 01 Context
        const savedProfile = localStorage.getItem(POSTPARTUM_PROFILE_KEY);
        let p: PostpartumProfile | null = null;
        if (savedProfile) {
          p = JSON.parse(savedProfile);
          setProfile(p);
        } else if (user?.journeyStage === "POST_PREGNANCY") {
          p = {
            deliveryDate: new Date().toISOString().split("T")[0],
            deliveryType: "vaginal",
            numberOfBabies: 1,
          };
          setProfile(p);
        }

        // 2. Feature 02 Logs
        const savedLogs = localStorage.getItem(RECOVERY_LOGS_KEY);
        let logs: MotherRecoveryLog[] = [];
        if (savedLogs) {
          logs = JSON.parse(savedLogs);
          setMotherLogs(logs);
        }

        // 3. Feature 03 Baby Profile
        const savedBaby = localStorage.getItem(BABY_PROFILE_KEY);
        let b: BabyProfileData | null = null;
        if (savedBaby) {
          b = JSON.parse(savedBaby);
          setBabyProfile(b);
        }

        // 4. Feature 05 Bleeding Logs
        const savedBleeding = localStorage.getItem(BLEEDING_LOGS_KEY);
        let bLogs: BleedingLog[] = [];
        if (savedBleeding) {
          bLogs = JSON.parse(savedBleeding);
          setBleedingLogs(bLogs);
        }

        // 5. Feature 06 Pain Logs
        const savedPain = localStorage.getItem(PAIN_LOGS_KEY);
        let pLogs: PainLog[] = [];
        if (savedPain) {
          pLogs = JSON.parse(savedPain);
          setPainLogs(pLogs);
        }

        // 6. Feature 07 Wound Logs
        const savedWounds = localStorage.getItem(WOUND_LOGS_KEY);
        let wLogs: WoundLog[] = [];
        if (savedWounds) {
          wLogs = JSON.parse(savedWounds);
          setWoundLogs(wLogs);
        }

        // 7. Feature 08 Breastfeeding Logs
        const savedBf = localStorage.getItem(BREASTFEEDING_LOGS_KEY);
        let bfLogs: BreastfeedingLog[] = [];
        if (savedBf) {
          bfLogs = JSON.parse(savedBf);
          setBreastfeedingLogs(bfLogs);
        }

        // 8. Feature 09 Pumping Logs
        const savedPumping = localStorage.getItem(PUMPING_LOGS_KEY);
        let pumpLogs: PumpingLog[] = [];
        if (savedPumping) {
          pumpLogs = JSON.parse(savedPumping);
          setPumpingLogs(pumpLogs);
        }

        // 9. Feature 10 Baby Feeding Logs
        const savedBabyFeeding = localStorage.getItem(BABY_FEEDING_LOGS_KEY);
        let feedLogs: BabyFeedingLog[] = [];
        if (savedBabyFeeding) {
          feedLogs = JSON.parse(savedBabyFeeding);
          setBabyFeedingLogs(feedLogs);
        }

        // 10. Feature 11 Baby Diaper Logs
        const savedDiapers = localStorage.getItem(DIAPER_LOGS_KEY);
        let dLogs: DiaperLog[] = [];
        if (savedDiapers) {
          dLogs = JSON.parse(savedDiapers);
          setDiaperLogs(dLogs);
        }

        // 11. Feature 12 Mother Sleep Logs
        const savedSleep = localStorage.getItem(SLEEP_LOGS_KEY);
        let slpLogs: MotherSleepLog[] = [];
        if (savedSleep) {
          slpLogs = JSON.parse(savedSleep);
          setSleepLogs(slpLogs);
        }

        // 12. Feature 12 Mother Fatigue Logs
        const savedFatigue = localStorage.getItem(FATIGUE_LOGS_KEY);
        let ftgLogs: MotherFatigueLog[] = [];
        if (savedFatigue) {
          ftgLogs = JSON.parse(savedFatigue);
          setFatigueLogs(ftgLogs);
        }

        // 13. Feature 13 Baby Sleep Logs
        const savedBabySleep = localStorage.getItem(BABY_SLEEP_LOGS_KEY);
        let bsLogs: BabySleepLog[] = [];
        if (savedBabySleep) {
          bsLogs = JSON.parse(savedBabySleep);
          setBabySleepLogs(bsLogs);
        }

        // 14. Feature 14 Mood & Emotional Wellbeing Logs
        const savedMoods = localStorage.getItem("bloomnest_mood_wellbeing_logs_v1");
        let mLogs: MotherMoodWellbeingLog[] = [];
        if (savedMoods) {
          mLogs = JSON.parse(savedMoods);
          setMoodLogs(mLogs);
        }

        // 15. Feature 15 Meal & Fluid Logs
        const savedMeals = localStorage.getItem("bloomnest_mother_meal_logs_v1");
        let mlLogs: MotherMealLog[] = [];
        if (savedMeals) {
          mlLogs = JSON.parse(savedMeals);
          setMealLogs(mlLogs);
        }

        const savedFluids = localStorage.getItem("bloomnest_mother_fluid_logs_v1");
        let flLogs: MotherFluidLog[] = [];
        if (savedFluids) {
          flLogs = JSON.parse(savedFluids);
          setFluidLogs(flLogs);
        }

        // 16. Feature 16 Medication Items & Logs
        const savedMeds = localStorage.getItem("bloomnest_mother_medications_v1");
        let medItems: MotherMedicationItem[] = [];
        if (savedMeds) {
          medItems = JSON.parse(savedMeds);
          setMedicationItems(medItems);
        }

        const savedMedLogs = localStorage.getItem("bloomnest_mother_medication_logs_v1");
        let mdLogs: MotherMedicationLog[] = [];
        if (savedMedLogs) {
          mdLogs = JSON.parse(savedMedLogs);
          setMedicationLogs(mdLogs);
        }

        // 17. Feature 17 Appointments
        const savedAppts = localStorage.getItem("bloomnest_mother_baby_appointments_v1");
        let apptItems: MotherBabyAppointment[] = [];
        if (savedAppts) {
          apptItems = JSON.parse(savedAppts);
          setAppointments(apptItems);
        }

        // Run Deterministic Safety Rule Engine
        const result = evaluateSafetyShield(p, logs, b, bLogs, pLogs, wLogs, bfLogs, pumpLogs, feedLogs, dLogs, slpLogs, ftgLogs, bsLogs, mLogs, mlLogs, flLogs, medItems, mdLogs, apptItems);
        setEvaluation(result);
      } catch (err) {
        console.error("Error loading Safety Shield context:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAllContexts();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Evaluating Safety Shield Engine...</p>
      </div>
    );
  }

  // FALLBACK IF FEATURE 01 PROFILE NOT CONFIGURED
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-[#1A1523] rounded-3xl p-8 border border-rose-100 dark:border-rose-900/40 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-rose-100">Setup Postpartum Care First</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Feature 04 (Safety Shield) evaluates logged data against clinical rules. Please configure delivery details first.
            </p>
          </div>

          <button
            onClick={() => onNavigateSubPage && onNavigateSubPage("care")}
            className="w-full py-3 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Go to Feature 01 (Postpartum Care)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // CALCULATE DERIVED CONTEXT
  const postpartumDay = calculatePostpartumDay(profile.deliveryDate);
  const postpartumWeek = calculatePostpartumWeek(postpartumDay);
  const currentStage = getRecoveryStage(postpartumDay);
  const babyAgeDays = calculatePostpartumDay(profile.babyBirthDate || profile.deliveryDate);
  const babyAgeFormatted = formatBabyAge(babyAgeDays);

  const status = evaluation?.overallStatus || "CLEAR";

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] text-slate-800 dark:text-rose-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* HEADER WITH CONSUMED CONTEXT FROM FEAT 1, 2, 3 */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 dark:border-rose-900/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 uppercase tracking-wider">
              Feature 04
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Clinical Safety Triage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-rose-100 tracking-tight mt-1">
            Clinical Safety Shield
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rule-based triage engine evaluating your logged metrics against clinical warning criteria.
          </p>
        </div>
      </header>

      {/* 🛡️ OVERALL SAFETY STATUS HERO CARD */}
      <section
        className={`rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden transition-all ${
          status === "URGENT"
            ? "bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 shadow-rose-600/20"
            : status === "ATTENTION"
            ? "bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 shadow-amber-500/20"
            : "bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 shadow-emerald-600/20"
        }`}
      >
        <div className="absolute top-0 right-0 transform translate-x-6 -translate-y-6 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex items-center justify-between border-b border-white/20 pb-4">
            <div className="flex items-center gap-2">
              {status === "URGENT" ? (
                <ShieldAlert className="w-6 h-6 text-red-200" />
              ) : status === "ATTENTION" ? (
                <AlertTriangle className="w-6 h-6 text-amber-200" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-emerald-200" />
              )}
              <span className="text-xs font-extrabold uppercase tracking-widest text-white/90">
                Rule-Based Safety Status
              </span>
            </div>

            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md font-bold text-xs">
              Deterministic Triage
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black tracking-tight">
              {status === "URGENT" && "🔴 Urgent Attention Recommended"}
              {status === "ATTENTION" && "🟡 Something Needs Attention"}
              {status === "CLEAR" && "🟢 No Immediate Concerns Detected"}
            </div>
            <p className="text-xs text-white/90 font-medium">
              {status === "URGENT" &&
                "Clinical warning flags detected in your logged data. Please review action guidance below and contact healthcare."}
              {status === "ATTENTION" &&
                "Noticeable changes or incomplete baseline data detected. Review the guidance items below."}
              {status === "CLEAR" &&
                "All logged maternal recovery metrics and infant parameters are within expected recovery bounds."}
            </p>
          </div>

          {/* Consumed Context Summary Bar */}
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-white/70 font-medium block">Postpartum Window</span>
              <span className="font-bold">Day {postpartumDay} (Week {postpartumWeek})</span>
            </div>
            <div>
              <span className="text-[10px] text-white/70 font-medium block">Delivery Type</span>
              <span className="font-bold">{formatDeliveryType(profile.deliveryType)}</span>
            </div>
            <div>
              <span className="text-[10px] text-white/70 font-medium block">Infant Name & Age</span>
              <span className="font-bold">{babyProfile?.babyName || "Baby"} ({babyAgeFormatted.formatted})</span>
            </div>
            <div>
              <span className="text-[10px] text-white/70 font-medium block">Mother Logs</span>
              <span className="font-bold">{motherLogs.length} Entries Logged</span>
            </div>
          </div>
        </div>
      </section>

      {/* 🩺 MOTHER SAFETY EVALUATION SECTION */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-rose-900/40 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-rose-900/30 pb-3">
          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">Mother Physical Safety Evaluation</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluates pain scores, energy levels, mobility, and symptom notes from Feature 02.
            </p>
          </div>
        </div>

        {evaluation?.motherIssues.length === 0 ? (
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>
              <strong>All Clear:</strong> No concerning trends, severe pain spikes, or warning symptoms detected in your Feature 02 recovery logs.
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {evaluation?.motherIssues.map((issue) => (
              <ActionGuidanceCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </section>

      {/* 👶 BABY SAFETY EVALUATION SECTION */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-rose-900/40 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-rose-900/30 pb-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center">
            <Baby className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">Baby Safety & Milestone Evaluation</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluates infant age milestones and baseline metrics from Feature 03.
            </p>
          </div>
        </div>

        {evaluation?.babyIssues.length === 0 ? (
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>
              <strong>All Clear:</strong> Infant profile parameters are complete and no early milestone concerns detected.
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {evaluation?.babyIssues.map((issue) => (
              <ActionGuidanceCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}

        {/* Future Modules Safety Readiness */}
        <div className="pt-2">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Future Infant Modules Gateway Readiness
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-[11px]">
            <ModuleReadinessBadge title="Feeding (Feat 10)" icon={Milk} />
            <ModuleReadinessBadge title="Diapers (Feat 11)" icon={Baby} />
            <ModuleReadinessBadge title="Sleep (Feat 13)" icon={Moon} />
            <ModuleReadinessBadge title="Growth (Feat 27)" icon={Ruler} />
            <ModuleReadinessBadge title="Vaccines (Feat 28)" icon={Syringe} />
          </div>
        </div>
      </section>

      {/* 🚨 CLINICAL HOTLINE & EMERGENCY ACTION BAR */}
      <section className="bg-rose-50 dark:bg-rose-950/30 rounded-3xl p-6 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-rose-100 text-sm">Need Clinical Support?</h3>
            <p className="text-slate-600 dark:text-rose-300">
              {profile.healthcareProvider ? `Contact Provider: ${profile.healthcareProvider}` : "Contact your Gynecologist / Hospital Emergency"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {profile.hospital && (
            <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1523] border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold truncate max-w-[200px]">
              🏥 {profile.hospital}
            </span>
          )}
          <button
            onClick={() => setActivePage("medical-profile")}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold transition-all"
          >
            Emergency Contacts
          </button>
        </div>
      </section>
    </div>
  );
};

// 📌 ACTION GUIDANCE CARD COMPONENT (What was detected -> Why it matters -> What to do)
const ActionGuidanceCard: React.FC<{ issue: SafetyIssueItem }> = ({ issue }) => {
  const isUrgent = issue.severity === "URGENT";

  return (
    <div
      className={`p-5 rounded-2xl border space-y-3 transition-all ${
        isUrgent
          ? "bg-red-50/70 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 shadow-xs"
          : "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 shadow-xs"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className={`text-sm font-extrabold ${isUrgent ? "text-red-900 dark:text-red-300" : "text-amber-900 dark:text-amber-300"}`}>
          {issue.title}
        </h3>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
            isUrgent ? "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100" : "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100"
          }`}
        >
          {issue.severity}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
        {/* 1. What was detected */}
        <div className="bg-white/80 dark:bg-[#15111C] p-3 rounded-xl border border-slate-200/50 dark:border-gray-800 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">1. What Was Detected</span>
          <p className="font-semibold text-slate-800 dark:text-rose-200">{issue.detected}</p>
        </div>

        {/* 2. Why it matters */}
        <div className="bg-white/80 dark:bg-[#15111C] p-3 rounded-xl border border-slate-200/50 dark:border-gray-800 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">2. Why It Matters</span>
          <p className="font-semibold text-slate-800 dark:text-rose-200">{issue.whyItMatters}</p>
        </div>

        {/* 3. What to do */}
        <div className="bg-white/80 dark:bg-[#15111C] p-3 rounded-xl border border-slate-200/50 dark:border-gray-800 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">3. Recommended Action</span>
          <p className="font-bold text-rose-700 dark:text-rose-300">{issue.whatToDo}</p>
        </div>
      </div>
    </div>
  );
};

// HELPER READINESS BADGE
const ModuleReadinessBadge: React.FC<{ title: string; icon: React.ElementType }> = ({ title, icon: Icon }) => (
  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#15111C] border border-slate-200/60 dark:border-gray-800 flex items-center gap-2 text-slate-400 dark:text-slate-500">
    <Icon className="w-3.5 h-3.5" />
    <span className="truncate">{title}</span>
  </div>
);

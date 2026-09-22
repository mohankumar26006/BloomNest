import {
  DailyPlanTaskItem,
  PersonalizedDailyPlanResult,
  DailyPlanTaskPriority,
  DailyPlanTaskStatus,
  DailyPlanTimeOfDay,
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
} from "../types";
import { calculatePostpartumDay, calculatePostpartumWeek, getRecoveryStage } from "./postpartumUtils";
import { evaluateSafetyShield } from "./safetyShieldEngine";
import { analyzeAnomalies } from "./anomalyDetectionEngine";

const LOCAL_STORAGE_TASK_STATES_KEY = "bloomnest_daily_plan_task_states_v1";

interface StoredTaskStateMap {
  [taskId: string]: {
    status: DailyPlanTaskStatus;
    completedAt?: string;
  };
}

/**
 * Load completed or deferred task states from localStorage
 */
export function getStoredTaskStates(): StoredTaskStateMap {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TASK_STATES_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse daily plan task states from localStorage", err);
    return {};
  }
}

/**
 * Save updated status for a daily plan task
 */
export function updateTaskStatus(taskId: string, status: DailyPlanTaskStatus): void {
  try {
    const existing = getStoredTaskStates();
    existing[taskId] = {
      status,
      completedAt: status === "completed" ? new Date().toISOString() : undefined,
    };
    localStorage.setItem(LOCAL_STORAGE_TASK_STATES_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error("Failed to save task status", err);
  }
}

/**
 * FEATURE 21 — PERSONALIZED DAILY PLAN ENGINE
 * 
 * Consumes structured data from Features 1–20 to orchestrate today's personalized plan:
 * - Layer A (Context): F01 Postpartum Stage, F03 Baby Profile, F17 Appointments.
 * - Layer B (Current State): F02 Mother Recovery, F05-F16 Logs.
 * - Layer C (Intelligence): F19 Trends, F20 Anomalies.
 * - Layer D (Safety): F04 Safety Shield Evaluation.
 * - Layer E (Communication): F18 Doctor Brief Preparation.
 * 
 * Non-Diagnostic Boundary:
 * Feature 21 prioritizes actions and organizes the day.
 * It does not independently diagnose medical conditions or create duplicate log entries.
 */
export function generatePersonalizedDailyPlan(params: {
  profile?: PostpartumProfile | null;
  motherLogs?: MotherRecoveryLog[];
  babyProfile?: BabyProfileData | null;
  bleedingLogs?: BleedingLog[];
  painLogs?: PainLog[];
  woundLogs?: WoundLog[];
  breastfeedingLogs?: BreastfeedingLog[];
  pumpingLogs?: PumpingLog[];
  babyFeedingLogs?: BabyFeedingLog[];
  diaperLogs?: DiaperLog[];
  sleepLogs?: MotherSleepLog[];
  fatigueLogs?: MotherFatigueLog[];
  babySleepLogs?: BabySleepLog[];
  moodLogs?: MotherMoodWellbeingLog[];
  mealLogs?: MotherMealLog[];
  fluidLogs?: MotherFluidLog[];
  medicationItems?: MotherMedicationItem[];
  medicationLogs?: MotherMedicationLog[];
  appointments?: MotherBabyAppointment[];
}): PersonalizedDailyPlanResult {
  const todayStr = new Date().toISOString().split("T")[0];
  const deliveryDateStr = params.profile?.deliveryDate || todayStr;

  // Layer A: Postpartum Context (Feature 01)
  const postpartumDay = calculatePostpartumDay(deliveryDateStr);
  const postpartumWeek = calculatePostpartumWeek(postpartumDay);
  const recoveryStageInfo = getRecoveryStage(postpartumDay);
  const recoveryStage = recoveryStageInfo.title;

  const storedStates = getStoredTaskStates();
  const tasks: DailyPlanTaskItem[] = [];

  // Evaluate Safety Shield (Feature 04) & Anomaly Detection (Feature 20)
  const safetyEval = evaluateSafetyShield(
    params.profile || null,
    params.motherLogs || [],
    params.babyProfile || null,
    params.bleedingLogs || [],
    params.painLogs || [],
    params.woundLogs || [],
    params.breastfeedingLogs || [],
    params.pumpingLogs || [],
    params.babyFeedingLogs || [],
    params.diaperLogs || [],
    params.sleepLogs || [],
    params.fatigueLogs || [],
    params.babySleepLogs || [],
    params.moodLogs || [],
    params.mealLogs || [],
    params.fluidLogs || [],
    params.medicationItems || [],
    params.medicationLogs || [],
    params.appointments || []
  );

  const anomalyEval = analyzeAnomalies({
    profile: params.profile,
    painLogs: params.painLogs,
    bleedingLogs: params.bleedingLogs,
    woundLogs: params.woundLogs,
    motherSleepLogs: params.sleepLogs,
    motherFatigueLogs: params.fatigueLogs,
    motherMoodLogs: params.moodLogs,
    breastfeedingLogs: params.breastfeedingLogs,
    pumpingLogs: params.pumpingLogs,
    babyFeedingLogs: params.babyFeedingLogs,
    diaperLogs: params.diaperLogs,
    babySleepLogs: params.babySleepLogs,
    mealLogs: params.mealLogs,
    fluidLogs: params.fluidLogs,
    medicationLogs: params.medicationLogs,
  });

  // -------------------------------------------------------------
  // 1. 🔴 PRIORITY Tasks (Safety Shield + Appointments Today/Tomorrow + Sudden Anomalies)
  // -------------------------------------------------------------
  // A. Safety Shield Trigger
  if (safetyEval.overallStatus !== "CLEAR") {
    const taskId = `task-safety-${todayStr}`;
    const state = storedStates[taskId];
    tasks.push({
      id: taskId,
      taskId,
      title: "Review Safety Shield Guidance",
      description: `Safety Shield flagged ${safetyEval.motherIssues.length + safetyEval.babyIssues.length} clinical observation(s) requiring attention.`,
      timeOfDay: "morning",
      priority: "priority",
      sourceFeature: "Feature 04 — Safety Shield",
      sourceModulePage: "emergency",
      reason: "Clinical safety rules require high-priority review of recorded symptoms.",
      status: state?.status || "suggested",
      completedAt: state?.completedAt,
      requiresSafetyReview: true,
    });
  }

  // B. Appointments Today or Tomorrow (Feature 17)
  const appts = params.appointments || [];
  const upcomingAppts = appts.filter(
    (a) => a.status === "upcoming" || a.status === "rescheduled"
  );
  
  // Find appointment today or tomorrow
  const apptToday = upcomingAppts.find((a) => a.date === todayStr);
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const apptTomorrow = upcomingAppts.find((a) => a.date === tomorrowStr);

  if (apptToday) {
    const taskId = `task-appt-today-${apptToday.id}`;
    const state = storedStates[taskId];
    tasks.push({
      id: taskId,
      taskId,
      title: `Attend Visit: ${apptToday.title}`,
      description: `Scheduled at ${apptToday.time} with ${apptToday.providerName || apptToday.clinicHospital || "Healthcare Provider"}.`,
      timeOfDay: "morning",
      priority: "priority",
      sourceFeature: "Feature 17 — Appointments",
      sourceModulePage: "appointments",
      reason: `You have an appointment scheduled today at ${apptToday.time}.`,
      dueTimeStr: apptToday.time,
      status: state?.status || "suggested",
      completedAt: state?.completedAt,
    });
  }

  if (apptTomorrow) {
    const taskId = `task-appt-prep-${apptTomorrow.id}`;
    const state = storedStates[taskId];
    tasks.push({
      id: taskId,
      taskId,
      title: `Prepare for Tomorrow's Appointment (${apptTomorrow.title})`,
      description: "Review recent recovery logs and generate your clinician Doctor Brief.",
      timeOfDay: "afternoon",
      priority: "priority",
      sourceFeature: "Feature 18 — Doctor Brief Generator",
      sourceModulePage: "doctor-brief",
      reason: `Upcoming appointment scheduled for tomorrow (${apptTomorrow.date}).`,
      status: state?.status || "suggested",
      completedAt: state?.completedAt,
    });
  }

  // C. Active Medication Schedules (Feature 16)
  const activeMeds = (params.medicationItems || []).filter((m) => m.status === "active");
  if (activeMeds.length > 0) {
    activeMeds.forEach((med) => {
      const taskId = `task-med-${med.id}-${todayStr}`;
      const state = storedStates[taskId];
      const dueTime = med.scheduledTimes?.[0] || "09:00 AM";

      tasks.push({
        id: taskId,
        taskId,
        title: `Take Medication: ${med.name}`,
        description: `Instructions: ${med.instructions || "Take as prescribed"}. (${med.doseAmount || ""} ${med.unit || ""})`,
        timeOfDay: dueTime.includes("PM") ? "afternoon" : "morning",
        priority: "priority",
        sourceFeature: "Feature 16 — Medication",
        sourceModulePage: "medication",
        reason: `Prescribed schedule: ${med.frequency || med.schedule}.`,
        dueTimeStr: dueTime,
        status: state?.status || "suggested",
        completedAt: state?.completedAt,
      });
    });
  }

  // -------------------------------------------------------------
  // 2. 🟡 RECOMMENDED Tasks (Recovery, Sleep Rest, Breastfeeding, Trends)
  // -------------------------------------------------------------
  // A. Daily Recovery Check-in (Feature 02 / Feature 06)
  const hasLoggedRecoveryToday = (params.motherLogs || []).some((l) => l.date === todayStr);
  const taskIdRec = `task-recovery-${todayStr}`;
  const stateRec = storedStates[taskIdRec];
  tasks.push({
    id: taskIdRec,
    taskId: taskIdRec,
    title: "Record Today's Physical Recovery & Pain Check-in",
    description: "Track energy, mobility, pain level, and lochia bleeding status for Day " + postpartumDay + ".",
    timeOfDay: "morning",
    priority: "recommended",
    sourceFeature: "Feature 02 — Mother Physical Recovery",
    sourceModulePage: "postpartum-care",
    reason: `Essential daily tracking for ${recoveryStage} stage.`,
    status: hasLoggedRecoveryToday ? "completed" : stateRec?.status || "suggested",
    completedAt: hasLoggedRecoveryToday ? new Date().toISOString() : stateRec?.completedAt,
  });

  // B. Sleep & Fatigue Rest Opportunity (Feature 12 & Feature 20 Anomaly)
  const latestSleep = (params.sleepLogs || []).find((l) => l.date === todayStr) || (params.sleepLogs || [])[0];
  const lowSleepAnomaly = anomalyEval.anomalies.find((a) => a.domain === "mother_sleep" || a.category === "sleep");

  const taskIdRest = `task-rest-${todayStr}`;
  const stateRest = storedStates[taskIdRest];
  const isSleepLow = (latestSleep && latestSleep.durationMinutes <= 240) || lowSleepAnomaly;

  tasks.push({
    id: taskIdRest,
    taskId: taskIdRest,
    title: "Prioritize Rest Opportunity & Energy Recovery",
    description: isSleepLow
      ? "Recent sleep was recorded as low. Minimize non-essential household tasks and take rest breaks when practical."
      : "Maintain your rest schedule to support healing and lactation.",
    timeOfDay: "rest_recovery",
    priority: isSleepLow ? "priority" : "recommended",
    sourceFeature: "Feature 12 — Mother Sleep & Fatigue",
    sourceModulePage: "mother-sleep",
    reason: isSleepLow
      ? "Recent recorded sleep duration was significantly lower than your baseline."
      : "Rest is vital for postpartum tissue recovery.",
    status: stateRest?.status || "suggested",
    completedAt: stateRest?.completedAt,
  });

  // C. Feeding & Infant Diaper Log (Feature 08 / Feature 10 / Feature 11)
  const hasBabyFeedingToday = (params.babyFeedingLogs || []).some((l) => l.date === todayStr) || (params.breastfeedingLogs || []).some((l) => l.date === todayStr);
  const taskIdFeed = `task-baby-feed-${todayStr}`;
  const stateFeed = storedStates[taskIdFeed];

  tasks.push({
    id: taskIdFeed,
    taskId: taskIdFeed,
    title: "Log Infant Feeding & Diaper Output",
    description: "Record breastfeeding/bottle sessions and wet/dirty diaper counts for baby care tracking.",
    timeOfDay: "afternoon",
    priority: "recommended",
    sourceFeature: "Feature 10 — Baby Feeding Care",
    sourceModulePage: "postpartum-care",
    reason: "Infant hydration and nutrition monitoring.",
    status: hasBabyFeedingToday ? "completed" : stateFeed?.status || "suggested",
    completedAt: hasBabyFeedingToday ? new Date().toISOString() : stateFeed?.completedAt,
  });

  // D. Emotional Wellbeing Check-in (Feature 14)
  const hasMoodToday = (params.moodLogs || []).some((l) => l.date === todayStr);
  const taskIdMood = `task-mood-${todayStr}`;
  const stateMood = storedStates[taskIdMood];

  tasks.push({
    id: taskIdMood,
    taskId: taskIdMood,
    title: "Complete Emotional Wellbeing Check-in",
    description: "Reflect on today's mood rating, stress score, and support options.",
    timeOfDay: "evening",
    priority: "recommended",
    sourceFeature: "Feature 14 — Mood & Wellbeing",
    sourceModulePage: "mood-wellbeing",
    reason: "Monitoring emotional wellness and postpartum mood balance.",
    status: hasMoodToday ? "completed" : stateMood?.status || "suggested",
    completedAt: hasMoodToday ? new Date().toISOString() : stateMood?.completedAt,
  });

  // -------------------------------------------------------------
  // 3. ⚪ OPTIONAL / ROUTINE Tasks (Nutrition, Hydration, Memory)
  // -------------------------------------------------------------
  const taskIdNut = `task-nutrition-${todayStr}`;
  const stateNut = storedStates[taskIdNut];
  tasks.push({
    id: taskIdNut,
    taskId: taskIdNut,
    title: "Record Meals & Hydration Intake",
    description: "Track fluid intake (target 2.5L-3L for recovery/lactation) and nutrient-dense meals.",
    timeOfDay: "afternoon",
    priority: "optional",
    sourceFeature: "Feature 15 — Nutrition & Hydration",
    sourceModulePage: "nutrition-hydration",
    reason: "Adequate hydration supports maternal healing and milk volume.",
    status: stateNut?.status || "suggested",
    completedAt: stateNut?.completedAt,
  });

  // Calculate statistics
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const priorityCount = tasks.filter((t) => t.priority === "priority").length;

  return {
    generatedAt: new Date().toISOString(),
    planDate: todayStr,
    postpartumDay,
    postpartumWeek,
    recoveryStage,
    totalTasks: tasks.length,
    completedCount,
    priorityCount,
    tasks,
    focusSummaryText: isSleepLow
      ? "Today's main focus is Rest & Recovery alongside scheduled medications and essential baby care."
      : `Day ${postpartumDay} (${recoveryStage}): Balanced recovery check-in, medication adherence, and routine baby care.`,
    safetyStatus: safetyEval.overallStatus,
    restOpportunityNote: isSleepLow
      ? "High Priority: Sleep duration was reduced recently. Consider taking nap windows when baby sleeps."
      : "Rest quality is currently within baseline expectations.",
  };
}

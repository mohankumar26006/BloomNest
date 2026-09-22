import {
  ContextAwareReminderItem,
  ReminderUserPreferences,
  ReminderEngineEvaluationResult,
  ReminderStatus,
  ReminderPriority,
  ReminderCategory,
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
import { generatePersonalizedDailyPlan } from "./dailyPlanEngine";

const LOCAL_STORAGE_REMINDER_STATES_KEY = "bloomnest_reminder_states_v1";
const LOCAL_STORAGE_REMINDER_PREFS_KEY = "bloomnest_reminder_user_prefs_v1";

interface StoredReminderStateMap {
  [reminderId: string]: {
    status: ReminderStatus;
    snoozeUntil?: string;
    completedAt?: string;
  };
}

const DEFAULT_USER_PREFERENCES: ReminderUserPreferences = {
  notificationsEnabled: true,
  quietHoursEnabled: true,
  quietHoursStart: "10:00 PM",
  quietHoursEnd: "07:00 AM",
  snoozeMinutes: 15,
  groupNotifications: true,
  categoriesEnabled: {
    safety: true,
    medication: true,
    appointment: true,
    recovery: true,
    baby_care: true,
    wellbeing: true,
    doctor_brief: true,
  },
};

/**
 * Load user reminder preferences from localStorage
 */
export function getStoredReminderPreferences(): ReminderUserPreferences {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REMINDER_PREFS_KEY);
    if (!raw) return DEFAULT_USER_PREFERENCES;
    return { ...DEFAULT_USER_PREFERENCES, ...JSON.parse(raw) };
  } catch (err) {
    console.error("Failed to parse reminder preferences from localStorage", err);
    return DEFAULT_USER_PREFERENCES;
  }
}

/**
 * Save updated user reminder preferences
 */
export function saveReminderPreferences(prefs: ReminderUserPreferences): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_REMINDER_PREFS_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.error("Failed to save reminder preferences", err);
  }
}

/**
 * Load stored reminder states from localStorage
 */
export function getStoredReminderStates(): StoredReminderStateMap {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REMINDER_STATES_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse reminder states from localStorage", err);
    return {};
  }
}

/**
 * Update status or snooze time for a specific reminder
 */
export function updateReminderState(
  reminderId: string,
  status: ReminderStatus,
  snoozeUntil?: string
): void {
  try {
    const existing = getStoredReminderStates();
    existing[reminderId] = {
      status,
      snoozeUntil: snoozeUntil !== undefined ? snoozeUntil : existing[reminderId]?.snoozeUntil,
      completedAt: status === "completed" ? new Date().toISOString() : undefined,
    };
    localStorage.setItem(LOCAL_STORAGE_REMINDER_STATES_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error("Failed to update reminder state", err);
  }
}

/**
 * FEATURE 22 — CONTEXT-AWARE REMINDER ENGINE
 * 
 * Consumes:
 * - Layer A (Context): F01 Postpartum Stage, F03 Baby Profile, F17 Appointments.
 * - Layer B (Current State): F02 Mother Recovery, F05-F16 Logs.
 * - Layer C (Intelligence): F19 Trends, F20 Anomalies.
 * - Layer D (Safety): F04 Safety Shield Evaluation.
 * - Layer E (Daily Plan): F21 Personalized Daily Plan tasks.
 * 
 * Closed-Loop Rule:
 * Auto-suppresses or completes reminders if the action was already completed in raw logs!
 * Never creates duplicate data entries.
 */
export function evaluateContextReminders(params: {
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
}): ReminderEngineEvaluationResult {
  const todayStr = new Date().toISOString().split("T")[0];
  const userPrefs = getStoredReminderPreferences();
  const storedStates = getStoredReminderStates();

  const dailyPlan = generatePersonalizedDailyPlan(params);
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

  const reminders: ContextAwareReminderItem[] = [];

  // -------------------------------------------------------------
  // 1. 🔴 URGENT SAFETY REMINDERS (Feature 04)
  // -------------------------------------------------------------
  if (safetyEval.overallStatus !== "CLEAR" && userPrefs.categoriesEnabled.safety) {
    const remId = `rem-safety-${todayStr}`;
    const state = storedStates[remId];

    reminders.push({
      id: remId,
      reminderId: remId,
      sourceFeature: "Feature 04 — Safety Shield",
      sourceModulePage: "emergency",
      category: "safety",
      title: "🔴 Clinical Safety Shield Alert",
      description: `Safety Shield flagged ${safetyEval.motherIssues.length + safetyEval.babyIssues.length} observation(s) requiring attention.`,
      priority: "urgent_safety",
      scheduledTimeStr: "Immediate",
      triggerType: "safety_alert",
      status: state?.status || "triggered",
      whyThisReminder: "Validated clinical safety rules identified observations needing review.",
      createdAt: new Date().toISOString(),
      completedAt: state?.completedAt,
    });
  }

  // -------------------------------------------------------------
  // 2. 🟣 MEDICATION REMINDERS (Feature 16) - CLOSED-LOOP SUPPRESSION
  // -------------------------------------------------------------
  if (userPrefs.categoriesEnabled.medication) {
    const activeMeds = (params.medicationItems || []).filter((m) => m.status === "active");
    activeMeds.forEach((med) => {
      const remId = `rem-med-${med.id}-${todayStr}`;
      const state = storedStates[remId];
      const scheduledTime = med.scheduledTimes?.[0] || "02:00 PM";

      // Closed-loop check: Has user already recorded taking this medication today in Feature 16 logs?
      const medLogToday = (params.medicationLogs || []).find(
        (l) => l.medicationId === med.id && l.date === todayStr && l.doseStatus === "taken"
      );

      const isSuppressed = !userPrefs.notificationsEnabled;
      const finalStatus: ReminderStatus = medLogToday
        ? "completed"
        : state?.status || (isSuppressed ? "suppressed" : "scheduled");

      reminders.push({
        id: remId,
        reminderId: remId,
        sourceFeature: "Feature 16 — Medication",
        sourceModulePage: "medication",
        category: "medication",
        title: `💊 Medication Due: ${med.name}`,
        description: `Instructions: ${med.instructions || "Take as prescribed"}. (${med.doseAmount || ""} ${med.unit || ""})`,
        priority: "medication_appointment",
        scheduledTimeStr: scheduledTime,
        triggerType: "fixed_time",
        status: finalStatus,
        whyThisReminder: `Your recorded medication schedule has an upcoming dose at ${scheduledTime}.`,
        createdAt: new Date().toISOString(),
        completedAt: medLogToday ? medLogToday.createdAt : state?.completedAt,
        suppressedReason: isSuppressed ? "User notification preference disabled" : undefined,
      });
    });
  }

  // -------------------------------------------------------------
  // 3. 🟣 APPOINTMENT & DOCTOR BRIEF REMINDERS (Feature 17 / Feature 18)
  // -------------------------------------------------------------
  if (userPrefs.categoriesEnabled.appointment) {
    const appts = (params.appointments || []).filter((a) => a.status === "upcoming" || a.status === "rescheduled");
    const apptToday = appts.find((a) => a.date === todayStr);

    if (apptToday) {
      const remId = `rem-appt-today-${apptToday.id}`;
      const state = storedStates[remId];

      reminders.push({
        id: remId,
        reminderId: remId,
        sourceFeature: "Feature 17 — Appointments",
        sourceModulePage: "appointments",
        category: "appointment",
        title: `📅 Healthcare Appointment Today: ${apptToday.title}`,
        description: `Scheduled at ${apptToday.time} with ${apptToday.providerName || apptToday.clinicHospital || "Healthcare Provider"}.`,
        priority: "medication_appointment",
        scheduledTimeStr: apptToday.time,
        triggerType: "appointment_relative",
        status: state?.status || "upcoming",
        whyThisReminder: `Your appointment is scheduled for today at ${apptToday.time}.`,
        createdAt: new Date().toISOString(),
        completedAt: state?.completedAt,
      });

      // Doctor Brief Prep Reminder
      if (userPrefs.categoriesEnabled.doctor_brief) {
        const briefRemId = `rem-brief-prep-${apptToday.id}`;
        const briefState = storedStates[briefRemId];

        reminders.push({
          id: briefRemId,
          reminderId: briefRemId,
          sourceFeature: "Feature 18 — Doctor Brief",
          sourceModulePage: "postpartum-doctor-brief",
          category: "doctor_brief",
          title: "📋 Review Doctor Brief Before Visit",
          description: "Review selected recovery logs and questions before meeting your clinician today.",
          priority: "medication_appointment",
          scheduledTimeStr: "1 Hour Before Visit",
          triggerType: "appointment_relative",
          status: briefState?.status || "scheduled",
          whyThisReminder: `Upcoming appointment scheduled today: ${apptToday.title}.`,
          createdAt: new Date().toISOString(),
          completedAt: briefState?.completedAt,
        });
      }
    }
  }

  // -------------------------------------------------------------
  // 4. 🟡 RECOVERY CHECK-IN REMINDERS (Feature 02 / Feature 06) - CLOSED-LOOP SUPPRESSION
  // -------------------------------------------------------------
  if (userPrefs.categoriesEnabled.recovery) {
    const remId = `rem-recovery-${todayStr}`;
    const state = storedStates[remId];

    // Closed-loop check: Did user log pain or physical recovery today?
    const hasMotherLogToday = (params.motherLogs || []).some((l) => l.date === todayStr);
    const hasPainLogToday = (params.painLogs || []).some((l) => l.date === todayStr);

    const isDone = hasMotherLogToday || hasPainLogToday;
    const finalStatus: ReminderStatus = isDone
      ? "completed"
      : state?.status || "scheduled";

    reminders.push({
      id: remId,
      reminderId: remId,
      sourceFeature: "Feature 02 — Mother Physical Recovery",
      sourceModulePage: "postpartum-care",
      category: "recovery",
      title: "🩺 Evening Physical Recovery Check-in",
      description: "Take a moment to record today's pain level, energy, mobility, and lochia bleeding status.",
      priority: "recovery",
      scheduledTimeStr: "07:00 PM",
      triggerType: "fixed_time",
      status: finalStatus,
      whyThisReminder: `Your personalized postpartum plan includes a daily recovery check for Day ${dailyPlan.postpartumDay}.`,
      createdAt: new Date().toISOString(),
      completedAt: isDone ? new Date().toISOString() : state?.completedAt,
      suppressedReason: isDone ? "Action completed in Pain/Recovery log early" : undefined,
    });
  }

  // -------------------------------------------------------------
  // 5. 👶 BABY CARE REMINDERS (Feature 10 / Feature 11) - CLOSED-LOOP SUPPRESSION
  // -------------------------------------------------------------
  if (userPrefs.categoriesEnabled.baby_care) {
    const remId = `rem-baby-care-${todayStr}`;
    const state = storedStates[remId];

    // Closed-loop check: Did user log baby feeding or diaper today?
    const hasBabyFeedToday = (params.babyFeedingLogs || []).some((l) => l.date === todayStr) || (params.breastfeedingLogs || []).some((l) => l.date === todayStr);
    const hasDiaperToday = (params.diaperLogs || []).some((l) => l.date === todayStr);
    const isDone = hasBabyFeedToday && hasDiaperToday;

    const babyName = params.babyProfile?.babyName ? ` (${params.babyProfile.babyName})` : "";

    reminders.push({
      id: remId,
      reminderId: remId,
      sourceFeature: "Feature 10 — Baby Care",
      sourceModulePage: "postpartum-care",
      category: "baby_care",
      title: `👶 Baby Feeding & Diaper Log${babyName}`,
      description: "Log today's feeding sessions and wet/dirty diaper counts for infant care tracking.",
      priority: "baby_care",
      scheduledTimeStr: "03:00 PM",
      triggerType: "task_relative",
      status: isDone ? "completed" : state?.status || "scheduled",
      whyThisReminder: "Infant care tracking maintains longitudinal feeding & output baselines.",
      targetBabyId: params.babyProfile?.id,
      babyName: params.babyProfile?.babyName,
      createdAt: new Date().toISOString(),
      completedAt: isDone ? new Date().toISOString() : state?.completedAt,
    });
  }

  // -------------------------------------------------------------
  // 6. 💗 EMOTIONAL WELLBEING REMINDER (Feature 14)
  // -------------------------------------------------------------
  if (userPrefs.categoriesEnabled.wellbeing) {
    const remId = `rem-mood-${todayStr}`;
    const state = storedStates[remId];

    const hasMoodToday = (params.moodLogs || []).some((l) => l.date === todayStr);

    reminders.push({
      id: remId,
      reminderId: remId,
      sourceFeature: "Feature 14 — Mood & Emotional Wellbeing",
      sourceModulePage: "mother-mood",
      category: "wellbeing",
      title: "💗 Daily Emotional Wellbeing Check-in",
      description: "Reflect on how you felt emotionally today and record your stress rating.",
      priority: "wellbeing",
      scheduledTimeStr: "08:30 PM",
      triggerType: "fixed_time",
      status: hasMoodToday ? "completed" : state?.status || "scheduled",
      whyThisReminder: "Daily emotional check-ins help identify maternal stress patterns and support needs.",
      createdAt: new Date().toISOString(),
      completedAt: hasMoodToday ? new Date().toISOString() : state?.completedAt,
    });
  }

  // Calculate statistics
  const upcomingCount = reminders.filter((r) => r.status === "scheduled" || r.status === "upcoming" || r.status === "triggered").length;
  const suppressedCount = reminders.filter((r) => r.status === "suppressed").length;
  const completedCount = reminders.filter((r) => r.status === "completed").length;

  return {
    evaluatedAt: new Date().toISOString(),
    totalRemindersCount: reminders.length,
    upcomingCount,
    suppressedCount,
    completedCount,
    reminders,
    userPreferences: userPrefs,
  };
}

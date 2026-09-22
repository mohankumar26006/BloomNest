import {
  DailyCheckInSubmissionData,
  DailyCheckInEvent,
  DailyCheckInResultSummary,
  PostpartumProfile,
  MotherRecoveryLog,
  PainLog,
  BleedingLog,
  MotherSleepLog,
  MotherMoodWellbeingLog,
  BabyFeedingLog,
  DiaperLog,
  BabySleepLog,
  BabyFeedingMethod,
  DiaperType,
  StoolColor,
  StoolConsistency,
  MotherMoodScore,
  OverwhelmedRating,
  FeltSupportedStatus,
} from "../types";
import { calculatePostpartumDay, calculatePostpartumWeek, getRecoveryStage } from "./postpartumUtils";
import { evaluateSafetyShield } from "./safetyShieldEngine";
import { analyzeAnomalies } from "./anomalyDetectionEngine";
import { updateTaskStatus } from "./dailyPlanEngine";
import { updateReminderState } from "./contextReminderEngine";

export const DAILY_CHECKIN_HISTORY_KEY = "bloomnest_daily_checkin_history_v1";
export const DOCTOR_BRIEF_CUSTOM_QUESTIONS_KEY = "bloomnest_doctor_brief_custom_questions_v1";

const POSTPARTUM_PROFILE_KEY = "bloomnest_postpartum_profile_v1";
const RECOVERY_LOGS_KEY = "bloomnest_mother_recovery_logs_v1";
const PAIN_LOGS_KEY = "bloomnest_pain_logs_v1";
const BLEEDING_LOGS_KEY = "bloomnest_bleeding_logs_v1";
const SLEEP_LOGS_KEY = "bloomnest_mother_sleep_logs_v1";
const MOOD_LOGS_KEY = "bloomnest_mother_mood_logs_v1";
const BABY_FEEDING_LOGS_KEY = "bloomnest_baby_feeding_logs_v1";
const DIAPER_LOGS_KEY = "bloomnest_diaper_logs_v1";
const BABY_SLEEP_LOGS_KEY = "bloomnest_baby_sleep_logs_v1";

/**
 * Get past check-in history from localStorage
 */
export function getCheckInHistory(): DailyCheckInEvent[] {
  try {
    const raw = localStorage.getItem(DAILY_CHECKIN_HISTORY_KEY);
    if (!raw) return [];
    const list: DailyCheckInEvent[] = JSON.parse(raw);
    return list.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  } catch (err) {
    console.error("Failed to parse daily check-in history", err);
    return [];
  }
}

/**
 * Get check-in for a specific date (default: today YYYY-MM-DD)
 */
export function getCheckInForDate(dateStr?: string): DailyCheckInEvent | null {
  const targetDate = dateStr || new Date().toISOString().split("T")[0];
  const history = getCheckInHistory();
  return history.find((e) => e.date === targetDate) || null;
}

/**
 * Helper to safely append to a localStorage JSON array
 */
function appendToLocalStorageArray<T>(key: string, newItem: T): void {
  try {
    const raw = localStorage.getItem(key);
    const existing: T[] = raw ? JSON.parse(raw) : [];
    existing.unshift(newItem);
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (err) {
    console.error(`Failed to append item to ${key}`, err);
  }
}

/**
 * Submit Daily Check-in
 * Feature 23 acts as an orchestration interface, dispatching high-level inputs
 * to source-of-truth modules and returning a closed-loop summary.
 */
export function submitDailyCheckIn(data: DailyCheckInSubmissionData): DailyCheckInResultSummary {
  const todayStr = new Date().toISOString().split("T")[0];
  const nowIso = new Date().toISOString();
  const nowTs = Date.now();

  // 1. Fetch Postpartum Profile for Context
  let profile: PostpartumProfile | null = null;
  try {
    const rawProf = localStorage.getItem(POSTPARTUM_PROFILE_KEY);
    if (rawProf) profile = JSON.parse(rawProf);
  } catch (err) {
    console.error("Failed to load postpartum profile for check-in", err);
  }

  const deliveryDate = profile?.deliveryDate || todayStr;
  const pDay = calculatePostpartumDay(deliveryDate);
  const pWeek = calculatePostpartumWeek(pDay);
  const stage = getRecoveryStage(pDay);

  const linkedRecordIds: string[] = [];

  // 2. Dispatch to Feature 2 — Mother Recovery
  const recoveryLogId = `rec_${nowTs}`;
  const motherRecLog: MotherRecoveryLog = {
    id: recoveryLogId,
    date: todayStr,
    postpartumDay: pDay,
    postpartumWeek: pWeek,
    pain: data.painScore,
    energy: data.energy,
    mobility: data.overallRecovery === "Worse" ? "Difficult" : data.overallRecovery === "Same" ? "Moderate" : "Comfortable",
    rest: data.sleepQuality === "Very good" ? "Good" : data.sleepQuality,
    overallRecovery: data.overallRecovery,
    notes: data.userNote ? `Daily Check-in Note: ${data.userNote}` : "Submitted via Feature 23 Daily Check-in",
    createdAt: nowIso,
  };
  appendToLocalStorageArray<MotherRecoveryLog>(RECOVERY_LOGS_KEY, motherRecLog);
  linkedRecordIds.push(recoveryLogId);

  // 3. Dispatch to Feature 6 — Pain & Recovery Monitoring (if pain > 0)
  if (data.painScore > 0) {
    const painLogId = `pain_${nowTs}`;
    const painLog: PainLog = {
      id: painLogId,
      date: todayStr,
      postpartumDay: pDay,
      postpartumWeek: pWeek,
      pain: data.painScore,
      location: "Abdomen",
      type: "Aching",
      timing: "Comes and goes",
      trend: data.overallRecovery === "Worse" ? "Worsening" : data.overallRecovery === "Better" ? "Improving" : "Same",
      whatHelped: "Rest",
      notes: "Log generated via Feature 23 Daily Check-in",
      createdAt: nowIso,
    };
    appendToLocalStorageArray<PainLog>(PAIN_LOGS_KEY, painLog);
    linkedRecordIds.push(painLogId);
  }

  // 4. Dispatch to Feature 5 — Bleeding Monitoring
  const bleedingLogId = `bleed_${nowTs}`;
  const bleedingLog: BleedingLog = {
    id: bleedingLogId,
    date: todayStr,
    postpartumDay: pDay,
    postpartumWeek: pWeek,
    amount: data.bleedingStatus === "Increased" ? "Moderate" : "Light",
    color: "Pink",
    clots: "None",
    trend: data.bleedingStatus === "Increased" ? "Increasing" : data.bleedingStatus === "Improving" ? "Improving" : "Same",
    notes: `Bleeding status: ${data.bleedingStatus} (Feature 23 Check-in)`,
    createdAt: nowIso,
  };
  appendToLocalStorageArray<BleedingLog>(BLEEDING_LOGS_KEY, bleedingLog);
  linkedRecordIds.push(bleedingLogId);

  // 5. Dispatch to Feature 12 — Mother Sleep
  const sleepLogId = `sleep_${nowTs}`;
  const motherSleepLog: MotherSleepLog = {
    id: sleepLogId,
    date: todayStr,
    startTime: "11:00 PM",
    endTime: "07:00 AM",
    durationMinutes: data.sleepQuality === "Poor" ? 240 : data.sleepQuality === "Fair" ? 360 : 480,
    type: "Night sleep",
    quality: data.sleepQuality === "Very good" ? "Good" : data.sleepQuality,
    awakeningsCount: data.sleepQuality === "Poor" ? 4 : 2,
    postpartumDay: pDay,
    postpartumWeek: pWeek,
    notes: `Sleep status: ${data.sleepQuality} (Feature 23 Check-in)`,
    createdAt: nowIso,
  };
  appendToLocalStorageArray<MotherSleepLog>(SLEEP_LOGS_KEY, motherSleepLog);
  linkedRecordIds.push(sleepLogId);

  // 6. Dispatch to Feature 14 — Mother Mood & Emotional Wellbeing
  const moodLogId = `mood_${nowTs}`;
  const moodScoreNum: MotherMoodScore = data.mood === "Good" ? 5 : data.mood === "Okay" ? 4 : data.mood === "Low" ? 2 : 1;
  const overwRating: OverwhelmedRating = data.mood === "Worried" || data.mood === "Very low" ? "Moderate" : "A little";
  const feltSupp: FeltSupportedStatus = "Yes, very supported";

  const moodLog: MotherMoodWellbeingLog = {
    id: moodLogId,
    date: todayStr,
    time: "10:00 AM",
    timestamp: nowTs,
    postpartumDay: pDay,
    postpartumWeek: pWeek,
    recoveryStage: stage.title,
    moodScore: moodScoreNum,
    emotionalStates: [data.mood],
    stressLevel: data.mood === "Worried" ? 7 : 3,
    worryLevel: data.mood === "Worried" ? 7 : 3,
    overwhelmedRating: overwRating,
    feltSupported: feltSupp,
    notes: `Emotional status: ${data.mood} (Feature 23 Check-in)`,
    createdAt: nowIso,
  };
  appendToLocalStorageArray<MotherMoodWellbeingLog>(MOOD_LOGS_KEY, moodLog);
  linkedRecordIds.push(moodLogId);

  // 7. Dispatch Baby Check-ins to Features 10, 11, 13
  data.babyCheckIns.forEach((bInput, idx) => {
    const feedId = `bfeed_${nowTs}_${idx}`;
    const feedMethod: BabyFeedingMethod = "Direct Breastfeeding";
    const babyFeedLog: BabyFeedingLog = {
      id: feedId,
      babyId: bInput.babyId,
      date: todayStr,
      startTime: "10:00 AM",
      postpartumDay: pDay,
      postpartumWeek: pWeek,
      method: feedMethod,
      behavior: [bInput.feedingStatus === "Going well" ? "Fed comfortably" : "Fussy during feeding"],
      response: bInput.feedingStatus === "Going well" ? "Calm / satisfied font-medium" as any : "Fussy",
      notes: `Baby Feeding: ${bInput.feedingStatus} (Feature 23)`,
      createdAt: nowIso,
    };
    appendToLocalStorageArray<BabyFeedingLog>(BABY_FEEDING_LOGS_KEY, babyFeedLog);
    linkedRecordIds.push(feedId);

    const diaperId = `diaper_${nowTs}_${idx}`;
    const dType: DiaperType = bInput.diaperStatus === "Different today" ? "Dirty" : "Wet + Dirty";
    const sColor: StoolColor = "Yellow / Mustard";
    const sConsistency: StoolConsistency = "Seedy / Grainy";

    const diaperLog: DiaperLog = {
      id: diaperId,
      babyId: bInput.babyId,
      babyName: bInput.babyName,
      date: todayStr,
      time: "10:00 AM",
      timestamp: nowTs,
      postpartumDay: pDay,
      postpartumWeek: pWeek,
      type: dType,
      stoolColor: sColor,
      stoolConsistency: sConsistency,
      notes: `Diaper check: ${bInput.diaperStatus} (Feature 23)`,
      createdAt: nowIso,
    };
    appendToLocalStorageArray<DiaperLog>(DIAPER_LOGS_KEY, diaperLog);
    linkedRecordIds.push(diaperId);

    const bSleepId = `bsleep_${nowTs}_${idx}`;
    const babySleepLog: BabySleepLog = {
      id: bSleepId,
      babyId: bInput.babyId,
      babyName: bInput.babyName,
      date: todayStr,
      startTime: "10:00 AM",
      endTime: "11:30 AM",
      timestamp: nowTs,
      durationMinutes: 90,
      type: "Daytime nap",
      awakeningsCount: bInput.sleepStatus === "More disrupted" ? 3 : 1,
      notes: `Baby Sleep: ${bInput.sleepStatus} (Feature 23)`,
      postpartumDay: pDay,
      postpartumWeek: pWeek,
      createdAt: nowIso,
    };
    appendToLocalStorageArray<BabySleepLog>(BABY_SLEEP_LOGS_KEY, babySleepLog);
    linkedRecordIds.push(bSleepId);
  });

  // 8. Dispatch to Feature 18 — Doctor Brief if user opted in
  if (data.addToDoctorBrief && data.userNote?.trim()) {
    try {
      const rawQuest = localStorage.getItem(DOCTOR_BRIEF_CUSTOM_QUESTIONS_KEY);
      const existingQuest: string[] = rawQuest ? JSON.parse(rawQuest) : [];
      const questText = `Daily Check-in Note (Day ${pDay}): "${data.userNote.trim()}"`;
      if (!existingQuest.includes(questText)) {
        existingQuest.unshift(questText);
        localStorage.setItem(DOCTOR_BRIEF_CUSTOM_QUESTIONS_KEY, JSON.stringify(existingQuest));
      }
    } catch (err) {
      console.error("Failed to add note to Doctor Brief", err);
    }
  }

  // 9. Closed-Loop Tasks & Reminders Auto-Update (Features 21 & 22)
  updateTaskStatus("task_daily_checkin", "completed");
  updateTaskStatus("task_mother_recovery_check", "completed");
  updateTaskStatus("task_baby_care_check", "completed");
  updateReminderState("rem_checkin_01", "completed");

  // 10. Run Safety Shield Evaluation (Feature 04)
  const safetyStatus = evaluateSafetyShield(profile, [motherRecLog], null);

  // 11. Run Anomaly Engine (Feature 20)
  const anomalyAnalysis = analyzeAnomalies({ profile, painLogs: data.painScore > 0 ? [{
    id: `pain_${nowTs}`,
    date: todayStr,
    postpartumDay: pDay,
    postpartumWeek: pWeek,
    pain: data.painScore,
    location: "Abdomen",
    type: "Aching",
    timing: "Comes and goes",
    trend: "Same",
    whatHelped: "Rest",
    createdAt: nowIso,
  }] : [] });

  // 12. Synthesize Categorized Bullets
  const whatIsGoingWell: string[] = [];
  const whatChanged: string[] = [];
  const whatNeedsAttention: string[] = [];

  if (data.overallRecovery === "Better") whatIsGoingWell.push("Overall mother recovery is feeling better today.");
  if (data.energy === "Good") whatIsGoingWell.push("Energy level is reported good.");
  if (data.mood === "Good") whatIsGoingWell.push("Mood and emotional state are upbeat.");
  if (data.bleedingStatus === "Improving") whatIsGoingWell.push("Lochia bleeding pattern is steadily improving.");

  data.babyCheckIns.forEach((b) => {
    if (b.feedingStatus === "Going well") whatIsGoingWell.push(`${b.babyName}'s feeding is going smoothly.`);
    if (b.diaperStatus === "As expected") whatIsGoingWell.push(`${b.babyName}'s diaper output is as expected.`);
    if (b.sleepStatus === "More settled") whatIsGoingWell.push(`${b.babyName} is sleeping more settled today.`);
  });

  if (data.overallRecovery === "Same") whatChanged.push("Recovery progress remains consistent with recent days.");
  if (data.sleepQuality === "Poor") whatChanged.push("Mother sleep quality is reported lower than usual.");
  if (data.bleedingStatus === "Increased") whatChanged.push("Lochia bleeding shows an increase today.");
  if (data.woundStatus === "New change") whatChanged.push("Noticed a change in incision or wound site.");

  if (data.painScore >= 7) whatNeedsAttention.push(`Mother pain score is high at ${data.painScore}/10.`);
  if (data.mood === "Worried" || data.mood === "Very low") whatNeedsAttention.push("Mother reports feeling overwhelmed or very low emotionally.");
  
  data.babyCheckIns.forEach((b) => {
    if (b.feedingStatus === "Concerned" || b.feedingStatus === "More difficult than usual") {
      whatNeedsAttention.push(`${b.babyName}'s feeding feels difficult or concerning today.`);
    }
    if (b.diaperStatus === "Concerned") whatNeedsAttention.push(`${b.babyName}'s diaper output needs attention.`);
  });

  if (whatIsGoingWell.length === 0) whatIsGoingWell.push("Daily check-in data recorded successfully.");

  // Construct Event
  const checkInEvent: DailyCheckInEvent = {
    checkInId: `checkin_${nowTs}`,
    date: todayStr,
    completedAt: nowIso,
    postpartumDay: pDay,
    postpartumWeek: pWeek,
    recoveryStage: stage.title,
    overallMotherStatus: data.overallRecovery,
    overallBabyStatus: data.babyCheckIns[0]?.feedingStatus || "Going well",
    concernFlag: data.painScore >= 7 || data.bleedingStatus === "Increased" || Boolean(data.userNote?.trim()),
    userNote: data.userNote,
    addedToDoctorBrief: data.addToDoctorBrief,
    linkedRecordIds,
    completionStatus: "completed",
    submissionData: data,
  };

  // 13. Save Event to History
  appendToLocalStorageArray<DailyCheckInEvent>(DAILY_CHECKIN_HISTORY_KEY, checkInEvent);

  return {
    event: checkInEvent,
    safetyStatus,
    trendsSummary: `Check-in recorded on Day ${pDay}. Safety tier evaluated as ${safetyStatus.overallStatus}.`,
    anomaliesDetectedCount: anomalyAnalysis.anomalies.length,
    planTasksCompletedCount: 3,
    remindersAutoSuppressedCount: 1,
    whatIsGoingWell,
    whatChanged,
    whatNeedsAttention,
  };
}

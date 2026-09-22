import {
  FollowUpThread,
  FollowUpEngineEvaluationResult,
  FollowUpStatus,
  FollowUpTrendOutcome,
  FollowUpType,
  FollowUpTimelineEntry,
  PostpartumProfile,
  MotherRecoveryLog,
  PainLog,
  BleedingLog,
  WoundLog,
  BreastfeedingLog,
  PumpingLog,
  BabyFeedingLog,
  DiaperLog,
  MotherSleepLog,
  BabySleepLog,
  MotherMoodWellbeingLog,
  MotherMedicationItem,
  MotherBabyAppointment,
} from "../types";
import { calculatePostpartumDay, calculatePostpartumWeek } from "./postpartumUtils";
import { evaluateSafetyShield } from "./safetyShieldEngine";
import { analyzeAnomalies } from "./anomalyDetectionEngine";

export const FOLLOWUP_THREADS_KEY = "bloomnest_followup_threads_v1";

const POSTPARTUM_PROFILE_KEY = "bloomnest_postpartum_profile_v1";
const RECOVERY_LOGS_KEY = "bloomnest_mother_recovery_logs_v1";
const PAIN_LOGS_KEY = "bloomnest_pain_logs_v1";
const BLEEDING_LOGS_KEY = "bloomnest_bleeding_logs_v1";
const WOUND_LOGS_KEY = "bloomnest_wound_logs_v1";
const BREASTFEEDING_LOGS_KEY = "bloomnest_breastfeeding_logs_v1";
const BABY_FEEDING_LOGS_KEY = "bloomnest_baby_feeding_logs_v1";
const DIAPER_LOGS_KEY = "bloomnest_diaper_logs_v1";
const SLEEP_LOGS_KEY = "bloomnest_mother_sleep_logs_v1";
const MOOD_LOGS_KEY = "bloomnest_mother_mood_logs_v1";
const APPOINTMENTS_KEY = "bloomnest_appointments_v1";

/**
 * Load stored follow-up threads from localStorage
 */
export function getStoredFollowUpThreads(): FollowUpThread[] {
  try {
    const raw = localStorage.getItem(FOLLOWUP_THREADS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse follow-up threads from localStorage", err);
    return [];
  }
}

/**
 * Save updated follow-up threads to localStorage
 */
export function saveFollowUpThreads(threads: FollowUpThread[]): void {
  try {
    localStorage.setItem(FOLLOWUP_THREADS_KEY, JSON.stringify(threads));
  } catch (err) {
    console.error("Failed to save follow-up threads", err);
  }
}

/**
 * Manually update a follow-up thread status
 */
export function updateFollowUpStatus(
  followUpId: string,
  status: FollowUpStatus,
  outcome?: FollowUpTrendOutcome,
  userNotes?: string
): void {
  const threads = getStoredFollowUpThreads();
  const index = threads.findIndex((t) => t.followUpId === followUpId);
  if (index >= 0) {
    const target = threads[index];
    target.status = status;
    if (outcome) target.currentOutcome = outcome;
    if (userNotes !== undefined) target.userNotes = userNotes;
    target.lastReviewedAt = new Date().toISOString();
    if (status === "resolved") {
      target.resolvedAt = new Date().toISOString();
    }
    
    // Add timeline entry for status update
    target.timeline.push({
      id: `tl_${Date.now()}`,
      timestamp: new Date().toISOString(),
      dateStr: new Date().toISOString().split("T")[0],
      postpartumDay: target.postpartumDay,
      eventTitle: `Status Changed to ${status.toUpperCase().replace("_", " ")}`,
      description: userNotes || `Follow-up thread marked as ${status}.`,
      sourceModule: "Feature 24 — Continuity",
      outcome: outcome || target.currentOutcome,
    });

    saveFollowUpThreads(threads);
  }
}

/**
 * Create a new custom user follow-up thread
 */
export function createCustomFollowUpThread(threadData: {
  title: string;
  description: string;
  category: "MOTHER_RECOVERY" | "BABY_CARE" | "SAFETY" | "APPOINTMENT" | "MEDICATION" | "DOCTOR_BRIEF";
  type: FollowUpType;
  dueDate?: string;
  targetBabyId?: string;
  babyName?: string;
  userNotes?: string;
}): FollowUpThread {
  const todayStr = new Date().toISOString().split("T")[0];
  const nowIso = new Date().toISOString();
  
  let pDay = 10;
  let pWeek = 2;
  try {
    const rawProf = localStorage.getItem(POSTPARTUM_PROFILE_KEY);
    if (rawProf) {
      const prof: PostpartumProfile = JSON.parse(rawProf);
      pDay = calculatePostpartumDay(prof.deliveryDate);
      pWeek = calculatePostpartumWeek(pDay);
    }
  } catch {}

  const newThread: FollowUpThread = {
    followUpId: `fup_${Date.now()}`,
    createdAt: nowIso,
    postpartumDay: pDay,
    postpartumWeek: pWeek,
    sourceFeature: "Feature 24 — Follow-up",
    sourceRecordIds: [],
    category: threadData.category,
    type: threadData.type,
    title: threadData.title,
    description: threadData.description,
    createdReason: "User-created follow-up monitoring request",
    startDate: todayStr,
    dueDate: threadData.dueDate || todayStr,
    priority: "important",
    status: "active",
    currentOutcome: "pending_review",
    targetBabyId: threadData.targetBabyId,
    babyName: threadData.babyName,
    userNotes: threadData.userNotes,
    timeline: [
      {
        id: `tl_${Date.now()}`,
        timestamp: nowIso,
        dateStr: todayStr,
        postpartumDay: pDay,
        eventTitle: "Follow-up Created",
        description: threadData.description,
        sourceModule: "Feature 24 — Continuity",
        outcome: "pending_review",
      },
    ],
  };

  const existing = getStoredFollowUpThreads();
  existing.unshift(newThread);
  saveFollowUpThreads(existing);
  return newThread;
}

/**
 * Helper to safely read JSON from localStorage
 */
function loadFromStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * FEATURE 24 — MAIN ENGINE EVALUATOR
 * Discovers, updates, and tracks all longitudinal care-loop threads across Features 1–23.
 */
export function evaluateFollowUpThreads(): FollowUpEngineEvaluationResult {
  const todayStr = new Date().toISOString().split("T")[0];
  const nowIso = new Date().toISOString();

  // 1. Fetch Profile & Logs
  let profile: PostpartumProfile | null = null;
  try {
    const rawProf = localStorage.getItem(POSTPARTUM_PROFILE_KEY);
    if (rawProf) profile = JSON.parse(rawProf);
  } catch {}

  const pDay = profile ? calculatePostpartumDay(profile.deliveryDate) : 10;
  const pWeek = profile ? calculatePostpartumWeek(pDay) : 2;

  const motherLogs = loadFromStorage<MotherRecoveryLog>(RECOVERY_LOGS_KEY);
  const painLogs = loadFromStorage<PainLog>(PAIN_LOGS_KEY);
  const bleedingLogs = loadFromStorage<BleedingLog>(BLEEDING_LOGS_KEY);
  const woundLogs = loadFromStorage<WoundLog>(WOUND_LOGS_KEY);
  const breastfeedingLogs = loadFromStorage<BreastfeedingLog>(BREASTFEEDING_LOGS_KEY);
  const babyFeedingLogs = loadFromStorage<BabyFeedingLog>(BABY_FEEDING_LOGS_KEY);
  const diaperLogs = loadFromStorage<DiaperLog>(DIAPER_LOGS_KEY);
  const sleepLogs = loadFromStorage<MotherSleepLog>(SLEEP_LOGS_KEY);
  const moodLogs = loadFromStorage<MotherMoodWellbeingLog>(MOOD_LOGS_KEY);

  // 2. Fetch Stored Threads
  let threads = getStoredFollowUpThreads();

  // Helper to find or create thread (Duplicate Prevention)
  const getOrCreateThread = (
    idKey: string,
    category: FollowUpThread["category"],
    type: FollowUpType,
    title: string,
    description: string,
    priority: FollowUpThread["priority"],
    targetBabyId?: string,
    babyName?: string
  ): FollowUpThread => {
    let found = threads.find(
      (t) => t.followUpId === idKey || (t.title === title && t.status !== "resolved" && t.status !== "cancelled")
    );

    if (!found) {
      found = {
        followUpId: idKey,
        createdAt: nowIso,
        postpartumDay: pDay,
        postpartumWeek: pWeek,
        sourceFeature: "System Evaluated",
        sourceRecordIds: [],
        category,
        type,
        title,
        description,
        createdReason: `Automated care continuity check for ${title}`,
        startDate: todayStr,
        dueDate: todayStr,
        priority,
        status: priority === "urgent_safety" ? "safety_linked" : "active",
        currentOutcome: "pending_review",
        targetBabyId,
        babyName,
        timeline: [
          {
            id: `tl_init_${idKey}`,
            timestamp: nowIso,
            dateStr: todayStr,
            postpartumDay: pDay,
            eventTitle: "Follow-up Created",
            description,
            sourceModule: "Feature 24 Engine",
            outcome: "pending_review",
          },
        ],
      };
      threads.unshift(found);
    }
    return found;
  };

  // -----------------------------------------------------------------
  // 3. SAFETY SHIELD LINKING (Feature 04)
  // -----------------------------------------------------------------
  const safetyEval = evaluateSafetyShield(profile, motherLogs, null, bleedingLogs, painLogs, woundLogs);
  if (safetyEval.overallStatus !== "CLEAR") {
    const safetyThread = getOrCreateThread(
      "fup_safety_eval",
      "SAFETY",
      "safety_followup",
      "Clinical Safety Shield Review Needed",
      `Safety evaluation tier is currently ${safetyEval.overallStatus}. Review flagged issues in Feature 04.`,
      "urgent_safety"
    );
    safetyThread.status = "safety_linked";
    safetyThread.priority = "urgent_safety";
    safetyThread.currentOutcome = "worsening";
  }

  // -----------------------------------------------------------------
  // 4. PAIN PROGRESSION THREAD (Feature 06)
  // -----------------------------------------------------------------
  const latestPain = painLogs[0];
  if (latestPain && latestPain.pain >= 4) {
    const painThread = getOrCreateThread(
      "fup_pain_progression",
      "MOTHER_RECOVERY",
      "recovery_followup",
      "Monitor Physical Pain Progression",
      `Pain level logged at ${latestPain.pain}/10 on ${latestPain.date}. Track pain reduction over upcoming days.`,
      latestPain.pain >= 7 ? "urgent_safety" : "important"
    );

    // Determine outcome from pain history
    const previousPain = painLogs[1];
    if (previousPain) {
      if (latestPain.pain < previousPain.pain) {
        painThread.currentOutcome = "improving";
      } else if (latestPain.pain > previousPain.pain) {
        painThread.currentOutcome = "worsening";
      } else {
        painThread.currentOutcome = "same";
      }
    } else {
      painThread.currentOutcome = "pending_review";
    }

    // Add timeline update if not already logged today
    const existsToday = painThread.timeline.some((tl) => tl.dateStr === todayStr && tl.eventTitle.includes("Pain Logged"));
    if (!existsToday) {
      painThread.timeline.push({
        id: `tl_pain_${Date.now()}`,
        timestamp: nowIso,
        dateStr: todayStr,
        postpartumDay: pDay,
        eventTitle: `Pain Logged (${latestPain.pain}/10)`,
        description: `Pain level recorded at ${latestPain.pain}/10 (${latestPain.location || "Abdomen"}).`,
        sourceModule: "Feature 06 — Pain & Recovery",
        outcome: painThread.currentOutcome,
      });
    }
  }

  // -----------------------------------------------------------------
  // 5. LOCHIA & BLEEDING THREAD (Feature 05)
  // -----------------------------------------------------------------
  const latestBleeding = bleedingLogs[0];
  if (latestBleeding && (latestBleeding.trend === "Increasing" || latestBleeding.amount === "Heavy")) {
    const bleedingThread = getOrCreateThread(
      "fup_bleeding_lochia",
      "MOTHER_RECOVERY",
      "recovery_followup",
      "Observe Lochia Bleeding Trend",
      `Bleeding marked as ${latestBleeding.amount} with ${latestBleeding.trend} trend. Monitor for steady decrease.`,
      latestBleeding.amount === "Heavy" ? "urgent_safety" : "important"
    );
    bleedingThread.currentOutcome = latestBleeding.trend === "Improving" ? "improving" : "worsening";
  }

  // -----------------------------------------------------------------
  // 6. BABY FEEDING THREAD (Features 08 & 10)
  // -----------------------------------------------------------------
  const recentBabyFeeds = babyFeedingLogs.slice(0, 3);
  const difficultFeed = recentBabyFeeds.find((f) => f.behavior?.includes("Fussy during feeding"));
  if (difficultFeed) {
    const feedThread = getOrCreateThread(
      `fup_baby_feed_${difficultFeed.babyId || "default"}`,
      "BABY_CARE",
      "baby_care_followup",
      `Monitor Feeding Latch & Behavior (${difficultFeed.babyId || "Newborn"})`,
      `Fussy feeding behavior recorded on ${difficultFeed.date}. Monitor post-feeding satisfaction.`,
      "important",
      difficultFeed.babyId,
      "Baby"
    );

    const latestFeed = babyFeedingLogs[0];
    if (latestFeed) {
      feedThread.currentOutcome = latestFeed.response === "Calm / satisfied" ? "improving" : "same";
    }
  }

  // -----------------------------------------------------------------
  // 7. MOTHER SLEEP & FATIGUE THREAD (Feature 12)
  // -----------------------------------------------------------------
  const latestSleep = sleepLogs[0];
  if (latestSleep && (latestSleep.durationMinutes < 300 || latestSleep.quality === "Poor")) {
    const sleepThread = getOrCreateThread(
      "fup_mother_sleep",
      "MOTHER_RECOVERY",
      "recovery_followup",
      "Monitor Mother Sleep & Rest Recovery",
      `Recent recorded sleep was ${latestSleep.durationMinutes / 60} hours (${latestSleep.quality} quality). Track rest opportunities.`,
      "routine"
    );

    const prevSleep = sleepLogs[1];
    if (prevSleep) {
      sleepThread.currentOutcome = latestSleep.durationMinutes > prevSleep.durationMinutes ? "improving" : "same";
    } else {
      sleepThread.currentOutcome = "pending_review";
    }
  }

  // -----------------------------------------------------------------
  // 8. MISSING DATA CHECK RULE
  // -----------------------------------------------------------------
  // "No follow-up data does NOT mean improvement!"
  threads.forEach((t) => {
    if (t.status === "active") {
      const daysSinceCreated = (new Date(todayStr).getTime() - new Date(t.startDate).getTime()) / (1000 * 3600 * 24);
      const hasRecentTimeline = t.timeline.some((tl) => tl.dateStr === todayStr);
      if (daysSinceCreated >= 2 && !hasRecentTimeline && t.currentOutcome !== "worsening") {
        t.currentOutcome = "no_recent_update";
        t.status = "needs_review";
      }
    }
  });

  // Save Evaluated State
  saveFollowUpThreads(threads);

  // Compute Summary Counters
  const activeCount = threads.filter((t) => t.status === "active").length;
  const dueCount = threads.filter((t) => t.status === "due").length;
  const needsReviewCount = threads.filter((t) => t.status === "needs_review").length;
  const safetyLinkedCount = threads.filter((t) => t.status === "safety_linked").length;
  const resolvedCount = threads.filter((t) => t.status === "resolved").length;

  return {
    evaluatedAt: nowIso,
    totalThreadsCount: threads.length,
    activeCount,
    dueCount,
    needsReviewCount,
    safetyLinkedCount,
    resolvedCount,
    threads,
  };
}

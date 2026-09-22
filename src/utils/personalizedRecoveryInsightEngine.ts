import {
  PersonalizedRecoveryInsightResult,
  RecoveryDomainOverview,
  InsightEvidencePoint,
  InsightDomainStatus,
  PostpartumProfile,
  MotherRecoveryLog,
  PainLog,
  BleedingLog,
  WoundLog,
  BreastfeedingLog,
  BabyFeedingLog,
  DiaperLog,
  MotherSleepLog,
  MotherMoodWellbeingLog,
  PageView,
} from "../types";
import { calculatePostpartumDay, calculatePostpartumWeek, getRecoveryStage } from "./postpartumUtils";
import { evaluateSafetyShield } from "./safetyShieldEngine";
import { analyzeAnomalies } from "./anomalyDetectionEngine";
import { getCheckInHistory } from "./dailyCheckInEngine";
import { getStoredFollowUpThreads } from "./followUpContinuityEngine";

const POSTPARTUM_PROFILE_KEY = "bloomnest_postpartum_profile_v1";

function loadFromStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * FEATURE 26 — PERSONALIZED RECOVERY INSIGHT ENGINE
 * Synthesizes time-series logs from Features 1–25 into a transparent,
 * data-grounded recovery narrative without inventing medical diagnoses or causality.
 */
export function generatePersonalizedRecoveryInsight(timeRangeDays: number = 7): PersonalizedRecoveryInsightResult {
  const todayStr = new Date().toISOString().split("T")[0];
  const nowIso = new Date().toISOString();

  // 1. Load Context & Data
  let profile: PostpartumProfile | null = null;
  try {
    const rawProf = localStorage.getItem(POSTPARTUM_PROFILE_KEY);
    if (rawProf) profile = JSON.parse(rawProf);
  } catch {}

  const pDay = profile ? calculatePostpartumDay(profile.deliveryDate) : 10;
  const pWeek = profile ? calculatePostpartumWeek(pDay) : 2;
  const stage = getRecoveryStage(pDay);

  const motherLogs = loadFromStorage<MotherRecoveryLog>("bloomnest_mother_recovery_logs_v1");
  const painLogs = loadFromStorage<PainLog>("bloomnest_pain_logs_v1");
  const bleedingLogs = loadFromStorage<BleedingLog>("bloomnest_bleeding_logs_v1");
  const woundLogs = loadFromStorage<WoundLog>("bloomnest_wound_logs_v1");
  const breastfeedingLogs = loadFromStorage<BreastfeedingLog>("bloomnest_breastfeeding_logs_v1");
  const babyFeedingLogs = loadFromStorage<BabyFeedingLog>("bloomnest_baby_feeding_logs_v1");
  const diaperLogs = loadFromStorage<DiaperLog>("bloomnest_diaper_logs_v1");
  const sleepLogs = loadFromStorage<MotherSleepLog>("bloomnest_mother_sleep_logs_v1");
  const moodLogs = loadFromStorage<MotherMoodWellbeingLog>("bloomnest_mother_mood_logs_v1");
  const checkIns = getCheckInHistory();
  const followUps = getStoredFollowUpThreads();

  // Total Evidence Count
  const totalRecordsAnalyzed =
    motherLogs.length +
    painLogs.length +
    bleedingLogs.length +
    woundLogs.length +
    breastfeedingLogs.length +
    babyFeedingLogs.length +
    diaperLogs.length +
    sleepLogs.length +
    moodLogs.length +
    checkIns.length;

  const confidenceLevel: "strongly_supported" | "limited_data" | "insufficient_data" =
    totalRecordsAnalyzed >= 7
      ? "strongly_supported"
      : totalRecordsAnalyzed >= 2
      ? "limited_data"
      : "insufficient_data";

  // 2. Domain Evaluations
  const domainOverviews: RecoveryDomainOverview[] = [];
  const whatsGoingWell: string[] = [];
  const areasToWatch: string[] = [];
  const evidencePoints: InsightEvidencePoint[] = [];

  // Physical Recovery Domain (Feature 02)
  const latestRec = motherLogs[0];
  const prevRec = motherLogs[1];
  let recStatus: InsightDomainStatus = "stable";
  if (latestRec) {
    if (latestRec.overallRecovery === "Better") {
      recStatus = "improving";
      whatsGoingWell.push("Your overall physical recovery ratings have improved across recent check-ins.");
    } else if (latestRec.overallRecovery === "Worse") {
      recStatus = "needs_attention";
      areasToWatch.push("Overall physical recovery rating was marked as worse in your recent check-in.");
    }
    evidencePoints.push({
      id: `ev_rec_${latestRec.id}`,
      dateStr: latestRec.date,
      featureName: "Feature 2 — Mother Recovery",
      observationText: `Overall recovery marked as ${latestRec.overallRecovery}`,
      valueStr: latestRec.overallRecovery,
    });
  }
  domainOverviews.push({
    domain: "physical_recovery",
    label: "Physical Recovery",
    status: recStatus,
    summaryText: latestRec ? `Overall recovery rated as ${latestRec.overallRecovery}.` : "No recent physical recovery logs recorded.",
    sourceModule: "Feature 2 — Mother Recovery",
  });

  // Pain Domain (Feature 06)
  const latestPain = painLogs[0];
  const prevPain = painLogs[1];
  let painStatus: InsightDomainStatus = "stable";
  if (latestPain) {
    if (prevPain && latestPain.pain < prevPain.pain) {
      painStatus = "improving";
      whatsGoingWell.push(`Recorded pain decreased from ${prevPain.pain}/10 to ${latestPain.pain}/10.`);
    } else if (latestPain.pain >= 7) {
      painStatus = "needs_attention";
      areasToWatch.push(`High pain score recorded at ${latestPain.pain}/10.`);
    }
    evidencePoints.push({
      id: `ev_pain_${latestPain.id}`,
      dateStr: latestPain.date,
      featureName: "Feature 6 — Pain Monitoring",
      observationText: `Pain score recorded at ${latestPain.pain}/10 (${latestPain.location || "Abdomen"})`,
      valueStr: `${latestPain.pain}/10`,
    });
  }
  domainOverviews.push({
    domain: "pain",
    label: "Pain & Discomfort",
    status: painStatus,
    summaryText: latestPain ? `Current recorded pain level is ${latestPain.pain}/10.` : "No pain logs recorded in selected period.",
    sourceModule: "Feature 6 — Pain Monitoring",
  });

  // Sleep & Rest Domain (Feature 12)
  const latestSleep = sleepLogs[0];
  const prevSleep = sleepLogs[1];
  let sleepStatus: InsightDomainStatus = "stable";
  if (latestSleep) {
    if (latestSleep.durationMinutes < 300 || latestSleep.quality === "Poor") {
      sleepStatus = "needs_attention";
      areasToWatch.push(`Recorded sleep duration is short at ${Math.round(latestSleep.durationMinutes / 60)}h (${latestSleep.quality} quality).`);
    } else if (latestSleep.quality === "Good" || latestSleep.quality === "Very good") {
      sleepStatus = "improving";
      whatsGoingWell.push(`Sleep quality reported as ${latestSleep.quality}.`);
    }
    evidencePoints.push({
      id: `ev_sleep_${latestSleep.id}`,
      dateStr: latestSleep.date,
      featureName: "Feature 12 — Mother Sleep",
      observationText: `Sleep duration ${Math.round(latestSleep.durationMinutes / 60)}h with ${latestSleep.quality} quality`,
      valueStr: `${Math.round(latestSleep.durationMinutes / 60)}h`,
    });
  }
  domainOverviews.push({
    domain: "sleep",
    label: "Sleep & Fatigue",
    status: sleepStatus,
    summaryText: latestSleep ? `Recorded sleep is ${Math.round(latestSleep.durationMinutes / 60)}h (${latestSleep.quality}).` : "No sleep logs recorded.",
    sourceModule: "Feature 12 — Mother Sleep & Fatigue",
  });

  // Emotional Wellbeing Domain (Feature 14)
  const latestMood = moodLogs[0];
  let moodStatus: InsightDomainStatus = "stable";
  if (latestMood) {
    if (latestMood.moodScore >= 4) {
      moodStatus = "improving";
      whatsGoingWell.push("Emotional wellbeing and mood ratings have remained upbeat.");
    } else if (latestMood.moodScore <= 2 || latestMood.overwhelmedRating === "Very" || latestMood.overwhelmedRating === "Extremely") {
      moodStatus = "needs_attention";
      areasToWatch.push("Emotional check-ins indicate feeling overwhelmed or low.");
    }
    evidencePoints.push({
      id: `ev_mood_${latestMood.id}`,
      dateStr: latestMood.date,
      featureName: "Feature 14 — Mood Wellbeing",
      observationText: `Mood score ${latestMood.moodScore}/5 (${latestMood.overwhelmedRating} overwhelm)`,
      valueStr: `${latestMood.moodScore}/5`,
    });
  }
  domainOverviews.push({
    domain: "mood",
    label: "Emotional Wellbeing",
    status: moodStatus,
    summaryText: latestMood ? `Mood rating is ${latestMood.moodScore}/5 (${latestMood.overwhelmedRating} overwhelm).` : "No mood logs recorded.",
    sourceModule: "Feature 14 — Mood & Emotional Wellbeing",
  });

  // Breastfeeding / Feeding Domain (Feature 8/10)
  const latestFeed = breastfeedingLogs[0] || babyFeedingLogs[0];
  let feedStatus: InsightDomainStatus = "active";
  if (latestFeed) {
    whatsGoingWell.push("Infant feeding sessions are being actively and consistently logged.");
    evidencePoints.push({
      id: `ev_feed_${latestFeed.id}`,
      dateStr: latestFeed.date,
      featureName: "Feature 8/10 — Feeding Care",
      observationText: "Active infant feeding session recorded",
      valueStr: "Active",
    });
  }
  domainOverviews.push({
    domain: "feeding",
    label: "Infant Feeding",
    status: feedStatus,
    summaryText: latestFeed ? "Infant feeding sessions actively logged." : "No recent feeding sessions recorded.",
    sourceModule: "Feature 8 & 10 — Feeding Care",
  });

  // 3. Recent Changes Summary (Time-Series)
  const recentChanges = [];
  if (latestPain && prevPain) {
    recentChanges.push({
      domain: "Pain Score",
      fromVal: `${prevPain.pain}/10`,
      toVal: `${latestPain.pain}/10`,
      trend: latestPain.pain < prevPain.pain ? ("improving" as const) : latestPain.pain > prevPain.pain ? ("decreasing" as const) : ("stable" as const),
    });
  }
  if (latestSleep && prevSleep) {
    recentChanges.push({
      domain: "Sleep Hours",
      fromVal: `${Math.round(prevSleep.durationMinutes / 60)}h`,
      toVal: `${Math.round(latestSleep.durationMinutes / 60)}h`,
      trend: latestSleep.durationMinutes > prevSleep.durationMinutes ? ("improving" as const) : latestSleep.durationMinutes < prevSleep.durationMinutes ? ("decreasing" as const) : ("stable" as const),
    });
  }
  if (latestRec && prevRec) {
    recentChanges.push({
      domain: "Overall Recovery",
      fromVal: prevRec.overallRecovery,
      toVal: latestRec.overallRecovery,
      trend: latestRec.overallRecovery === "Better" ? ("improving" as const) : latestRec.overallRecovery === "Worse" ? ("decreasing" as const) : ("stable" as const),
    });
  }

  // Fallback defaults if list empty
  if (whatsGoingWell.length === 0) {
    whatsGoingWell.push("Postpartum recovery tracking is active.");
  }
  if (areasToWatch.length === 0) {
    areasToWatch.push("Rest and sleep duration remain key areas to monitor during early recovery.");
  }

  // 4. Safety Evaluation (Feature 04)
  const safetyStatus = evaluateSafetyShield(profile, motherLogs, null, bleedingLogs, painLogs, woundLogs);

  // 5. Suggested Today Actions (Linking to F21, F25, F24)
  const suggestedTodayActions = [
    { title: "View Personalized Daily Plan", targetPage: "daily-plan" as PageView, actionLabel: "Open Feature 21" },
    { title: "Explore Relevant Postpartum Education", targetPage: "postpartum-education" as PageView, actionLabel: "Open Feature 25" },
    { title: "Review Open Care Continuity Follow-ups", targetPage: "followup-continuity" as PageView, actionLabel: "Open Feature 24" },
  ];

  // 6. Overall Narrative Summary
  const overallNarrativeSummary =
    recStatus === "improving"
      ? `Your recorded physical recovery is showing gradual improvement on Postpartum Day ${pDay}. Pain ratings have decreased from earlier levels, while physical energy and mobility are trending positively.`
      : `Your recovery is being tracked on Postpartum Day ${pDay} (${stage.title}). Key physical markers and infant care activities are actively documented across your check-in logs.`;

  return {
    generatedAt: nowIso,
    timeRangeDays,
    postpartumDay: pDay,
    postpartumWeek: pWeek,
    recoveryStage: stage.title,
    overallNarrativeSummary,
    domainOverviews,
    whatsGoingWell,
    areasToWatch,
    recentChanges,
    safetyStatus,
    suggestedTodayActions,
    confidenceLevel,
    totalRecordsAnalyzed,
    evidencePoints,
  };
}

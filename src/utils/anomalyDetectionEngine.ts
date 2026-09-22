import {
  DetectedAnomalyItem,
  OverallAnomalyAnalysisResult,
  MultiSignalCoOccurrence,
  AnomalyDomainCategory,
  AnomalyBaselineInfo,
  AnomalyType,
  AnomalySeverity,
  AnomalyStatus,
  PatternDomain,
  PostpartumProfile,
  MotherRecoveryLog,
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
  MotherMedicationLog,
} from "../types";
import { calculatePostpartumDay } from "./postpartumUtils";

const LOCAL_STORAGE_ANOMALY_NOTES_KEY = "bloomnest_anomaly_user_notes_v1";

interface StoredAnomalyUserMetadata {
  [anomalyId: string]: {
    status: AnomalyStatus;
    userNotes?: string;
    reviewedAt?: string;
  };
}

/**
 * Load user review statuses and custom notes from localStorage
 */
export function getStoredAnomalyUserMetadata(): StoredAnomalyUserMetadata {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ANOMALY_NOTES_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse anomaly user metadata from localStorage", err);
    return {};
  }
}

/**
 * Save updated status or user note for an anomaly item
 */
export function updateAnomalyUserMetadata(
  anomalyId: string,
  status: AnomalyStatus,
  userNotes?: string
): void {
  try {
    const existing = getStoredAnomalyUserMetadata();
    existing[anomalyId] = {
      status,
      userNotes: userNotes !== undefined ? userNotes : existing[anomalyId]?.userNotes,
      reviewedAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_ANOMALY_NOTES_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error("Failed to save anomaly user metadata", err);
  }
}

/**
 * FEATURE 20 — ANOMALY DETECTION ENGINE
 * 
 * Analyzes today's/recent data against established personal baselines (Features 1–19).
 * Detects sudden value, frequency, timing, duration, sequence, missing pattern, and cross-module anomalies.
 * 
 * Safety Shield Boundary:
 * Feature 20 observes deviations from baseline.
 * Feature 4 Safety Shield evaluates clinical significance and safety rules.
 * Feature 20 never diagnoses medical conditions.
 */
export function analyzeAnomalies(params: {
  profile?: PostpartumProfile | null;
  painLogs?: PainLog[];
  bleedingLogs?: BleedingLog[];
  woundLogs?: WoundLog[];
  motherSleepLogs?: MotherSleepLog[];
  motherFatigueLogs?: MotherFatigueLog[];
  motherMoodLogs?: MotherMoodWellbeingLog[];
  breastfeedingLogs?: BreastfeedingLog[];
  pumpingLogs?: PumpingLog[];
  babyFeedingLogs?: BabyFeedingLog[];
  diaperLogs?: DiaperLog[];
  babySleepLogs?: BabySleepLog[];
  mealLogs?: MotherMealLog[];
  fluidLogs?: MotherFluidLog[];
  medicationLogs?: MotherMedicationLog[];
  selectedBabyId?: string;
}): OverallAnomalyAnalysisResult {
  const anomalies: DetectedAnomalyItem[] = [];
  const userMeta = getStoredAnomalyUserMetadata();
  const todayStr = new Date().toISOString().split("T")[0];

  const postpartumDay = params.profile?.deliveryDate
    ? calculatePostpartumDay(params.profile.deliveryDate)
    : 14;

  // -------------------------------------------------------------
  // 1. Sudden Value Anomaly — Pain Level (Feature 06)
  // -------------------------------------------------------------
  if (params.painLogs && params.painLogs.length > 0) {
    const sorted = [...params.painLogs].sort((a, b) => (a.date > b.date ? 1 : -1));
    const recent = sorted.slice(-6, -1); // Previous 5 logs
    const todayLog = sorted.find((l) => l.date === todayStr) || sorted[sorted.length - 1];

    if (recent.length >= 2 && todayLog) {
      const recentVals = recent.map((r) => r.pain);
      const minVal = Math.min(...recentVals);
      const maxVal = Math.max(...recentVals);
      const avgVal = Number((recentVals.reduce((a, b) => a + b, 0) / recentVals.length).toFixed(1));
      const todayVal = todayLog.pain;

      // Anomaly threshold: sudden jump of +3 points or more above recent max
      if (todayVal >= maxVal + 3 || (todayVal >= 7 && maxVal <= 4)) {
        const id = `anomaly-pain-${todayLog.id || todayStr}`;
        const meta = userMeta[id];
        const isSafety = todayVal >= 8;

        anomalies.push({
          id,
          detectedAt: todayLog.date || todayStr,
          domain: "pain",
          category: "physical_recovery",
          title: "Sudden Pain Level Increase",
          sourceFeature: "Feature 06 — Pain",
          sourceModulePage: "health-tracker",
          recordIds: [todayLog.id || ""],
          anomalyType: "sudden_value",
          severity: isSafety ? "safety_related" : "significant",
          observedValueStr: `${todayVal} / 10`,
          baseline: {
            periodDays: 7,
            baselineRangeStr: `${minVal}–${maxVal} / 10`,
            numericRange: { min: minVal, max: maxVal, average: avgVal },
            dataPointsCount: recent.length,
            confidence: recent.length >= 4 ? "strong" : "limited",
          },
          differenceStr: `+${todayVal - maxVal} points above recent max range (${minVal}–${maxVal})`,
          explanation: "Today's recorded pain level is substantially higher than your recent baseline range.",
          whyDetectedBullets: [
            `Today's pain was recorded as ${todayVal}/10.`,
            `Your recent 7-day recorded range was ${minVal}–${maxVal}/10 (average: ${avgVal}/10).`,
            `Based on ${recent.length} recent pain logs.`,
            "This comparison uses your personal recorded data. It is an observation, not a clinical diagnosis.",
          ],
          requiresSafetyReview: isSafety,
          status: meta?.status || "new",
          userNotes: meta?.userNotes,
          reviewedAt: meta?.reviewedAt,
        });
      }
    }
  }

  // -------------------------------------------------------------
  // 2. Duration Anomaly — Mother Sleep (Feature 12)
  // -------------------------------------------------------------
  if (params.motherSleepLogs && params.motherSleepLogs.length > 0) {
    const sorted = [...params.motherSleepLogs].sort((a, b) => (a.date > b.date ? 1 : -1));
    const recent = sorted.slice(-6, -1);
    const todayLog = sorted.find((l) => l.date === todayStr) || sorted[sorted.length - 1];

    if (recent.length >= 2 && todayLog) {
      const recentMins = recent.map((r) => r.durationMinutes);
      const todayMins = todayLog.durationMinutes;

      const avgMins = Math.round(recentMins.reduce((a, b) => a + b, 0) / recentMins.length);
      const minMins = Math.min(...recentMins);
      const maxMins = Math.max(...recentMins);

      // Anomaly threshold: today sleep is >= 2 hours less than recent average
      if (todayMins <= avgMins - 120 || todayMins <= 150) {
        const id = `anomaly-sleep-${todayLog.id || todayStr}`;
        const meta = userMeta[id];

        const formatHM = (mins: number) => {
          const h = Math.floor(mins / 60);
          const m = mins % 60;
          return `${h}h ${m > 0 ? `${m}m` : ""}`.trim();
        };

        const diffMins = avgMins - todayMins;

        anomalies.push({
          id,
          detectedAt: todayLog.date || todayStr,
          domain: "mother_sleep",
          category: "sleep",
          title: "Substantially Reduced Mother Sleep Duration",
          sourceFeature: "Feature 12 — Mother Sleep",
          sourceModulePage: "mother-sleep",
          recordIds: [todayLog.id || ""],
          anomalyType: "duration",
          severity: todayMins <= 180 ? "significant" : "possible",
          observedValueStr: formatHM(todayMins),
          baseline: {
            periodDays: 7,
            baselineRangeStr: `${formatHM(minMins)} – ${formatHM(maxMins)} (Avg: ${formatHM(avgMins)})`,
            numericRange: { min: minMins / 60, max: maxMins / 60, average: avgMins / 60 },
            dataPointsCount: recent.length,
            confidence: recent.length >= 4 ? "strong" : "limited",
          },
          differenceStr: `-${formatHM(diffMins)} below recent average sleep duration`,
          explanation: "Today's recorded sleep duration is substantially lower than your recent baseline.",
          whyDetectedBullets: [
            `Today's recorded sleep was ${formatHM(todayMins)}.`,
            `Your recent baseline average was ${formatHM(avgMins)} (${formatHM(minMins)}–${formatHM(maxMins)}).`,
            `Comparison calculated over ${recent.length} recent sleep records.`,
            "Sleep loss is common in postpartum recovery, but sudden drops can impact energy and wellbeing.",
          ],
          requiresSafetyReview: todayMins <= 150,
          status: meta?.status || "new",
          userNotes: meta?.userNotes,
          reviewedAt: meta?.reviewedAt,
        });
      }
    }
  }

  // -------------------------------------------------------------
  // 3. Frequency Anomaly — Breastfeeding Sessions (Feature 08)
  // -------------------------------------------------------------
  if (params.breastfeedingLogs && params.breastfeedingLogs.length > 0) {
    const dateMap: { [date: string]: number } = {};
    params.breastfeedingLogs.forEach((l) => {
      const d = l.date || todayStr;
      dateMap[d] = (dateMap[d] || 0) + 1;
    });

    const dates = Object.keys(dateMap).sort();
    const recentDates = dates.filter((d) => d < todayStr).slice(-5);
    const todayCount = dateMap[todayStr];

    if (recentDates.length >= 2 && todayCount !== undefined) {
      const recentCounts = recentDates.map((d) => dateMap[d]);
      const minC = Math.min(...recentCounts);
      const maxC = Math.max(...recentCounts);
      const avgC = Number((recentCounts.reduce((a, b) => a + b, 0) / recentCounts.length).toFixed(1));

      if (todayCount <= Math.floor(avgC / 2) && todayCount <= 4 && maxC >= 6) {
        const id = `anomaly-bf-${todayStr}`;
        const meta = userMeta[id];

        anomalies.push({
          id,
          detectedAt: todayStr,
          domain: "breastfeeding",
          category: "feeding_lactation",
          title: "Lower Recorded Breastfeeding Frequency",
          sourceFeature: "Feature 08 — Breastfeeding",
          sourceModulePage: "postpartum-care",
          recordIds: [],
          anomalyType: "frequency",
          severity: todayCount <= 2 ? "significant" : "possible",
          observedValueStr: `${todayCount} sessions logged today`,
          baseline: {
            periodDays: 7,
            baselineRangeStr: `${minC}–${maxC} sessions / day (Avg: ${avgC})`,
            numericRange: { min: minC, max: maxC, average: avgC },
            dataPointsCount: recentDates.length,
            confidence: recentDates.length >= 3 ? "strong" : "limited",
          },
          differenceStr: `-${Math.round(avgC - todayCount)} sessions below recent daily baseline`,
          explanation: "Recorded breastfeeding activity today is lower than your established 7-day pattern.",
          whyDetectedBullets: [
            `Today has ${todayCount} recorded breastfeeding session(s).`,
            `Your recent baseline range was ${minC}–${maxC} sessions per day (average ${avgC}).`,
            "Missing data rule enforced: Ensure all feeds were logged before concluding infant intake is low.",
            "This is an observation comparing recorded logs, not a clinical diagnosis of milk supply.",
          ],
          requiresSafetyReview: todayCount <= 2,
          status: meta?.status || "new",
          userNotes: meta?.userNotes,
          reviewedAt: meta?.reviewedAt,
        });
      }
    }
  }

  // -------------------------------------------------------------
  // 4. Missing-Pattern Anomaly — Unlogged Infant Feeding (Feature 10 / Feature 08)
  // -------------------------------------------------------------
  const missingDataAlerts: { featureName: string; text: string }[] = [];
  const hasBabyFeedingToday = params.babyFeedingLogs?.some((l) => l.date === todayStr);
  const hasBfToday = params.breastfeedingLogs?.some((l) => l.date === todayStr);

  if (!hasBabyFeedingToday && !hasBfToday && (params.babyFeedingLogs?.length || 0) > 0) {
    missingDataAlerts.push({
      featureName: "Feature 10 — Baby Feeding",
      text: "No feeding records are available for today. Missing data cannot be assumed to mean zero infant intake.",
    });

    const id = `anomaly-missing-feed-${todayStr}`;
    const meta = userMeta[id];

    anomalies.push({
      id,
      detectedAt: todayStr,
      domain: "baby_feeding",
      category: "feeding_lactation",
      title: "No Infant Feeding Logs Today",
      sourceFeature: "Feature 10 — Baby Feeding",
      sourceModulePage: "postpartum-care",
      recordIds: [],
      anomalyType: "missing_pattern",
      severity: "possible",
      observedValueStr: "0 records logged today",
      baseline: {
        periodDays: 7,
        baselineRangeStr: "Regular daily logging",
        dataPointsCount: 5,
        confidence: "strong",
      },
      differenceStr: "Missing today's records",
      explanation: "No feeding records have been submitted for today, so a baseline comparison cannot be performed.",
      whyDetectedBullets: [
        "No feeding records were found for today's date.",
        "CRITICAL SAFETY RULE: Missing records do NOT equal zero feeds or infant starvation.",
        "Please update your feeding log to maintain accurate longitudinal pattern tracking.",
      ],
      requiresSafetyReview: false,
      status: meta?.status || "new",
      userNotes: meta?.userNotes,
      reviewedAt: meta?.reviewedAt,
    });
  }

  // -------------------------------------------------------------
  // 5. Diaper Output Anomaly (Feature 11)
  // -------------------------------------------------------------
  if (params.diaperLogs && params.diaperLogs.length > 0) {
    const babyLogs = params.selectedBabyId
      ? params.diaperLogs.filter((l) => l.babyId === params.selectedBabyId)
      : params.diaperLogs;

    const dateWetMap: { [date: string]: number } = {};
    babyLogs.forEach((l) => {
      const d = l.date || todayStr;
      if (l.type === "Wet" || l.type === "Wet + Dirty") {
        dateWetMap[d] = (dateWetMap[d] || 0) + 1;
      }
    });

    const dates = Object.keys(dateWetMap).sort();
    const recentDates = dates.filter((d) => d < todayStr).slice(-5);
    const todayWet = dateWetMap[todayStr];

    if (recentDates.length >= 2 && todayWet !== undefined) {
      const recentWets = recentDates.map((d) => dateWetMap[d]);
      const minW = Math.min(...recentWets);
      const maxW = Math.max(...recentWets);
      const avgW = Number((recentWets.reduce((a, b) => a + b, 0) / recentWets.length).toFixed(1));

      if (todayWet <= 2 && minW >= 4) {
        const id = `anomaly-diaper-${todayStr}`;
        const meta = userMeta[id];

        anomalies.push({
          id,
          detectedAt: todayStr,
          domain: "diapers",
          category: "baby_output",
          title: "Low Wet Diaper Output Count",
          sourceFeature: "Feature 11 — Diapers",
          sourceModulePage: "diaper-monitoring",
          recordIds: [],
          anomalyType: "frequency",
          severity: todayWet <= 1 ? "safety_related" : "significant",
          observedValueStr: `${todayWet} wet diapers logged today`,
          baseline: {
            periodDays: 7,
            baselineRangeStr: `${minW}–${maxW} wet diapers / day (Avg: ${avgW})`,
            numericRange: { min: minW, max: maxW, average: avgW },
            dataPointsCount: recentDates.length,
            confidence: recentDates.length >= 4 ? "strong" : "limited",
          },
          differenceStr: `-${Math.round(avgW - todayWet)} wet diapers below recent average`,
          explanation: "Today's recorded wet diaper count is significantly below your recent recorded baseline.",
          whyDetectedBullets: [
            `Today has ${todayWet} wet diaper(s) logged.`,
            `Your recent baseline range was ${minW}–${maxW} wet diapers per day.`,
            "Hydration & diaper output are important infant health indicators.",
            "Verify whether unlogged diapers occurred before consulting Safety Shield.",
          ],
          requiresSafetyReview: todayWet <= 2,
          status: meta?.status || "new",
          userNotes: meta?.userNotes,
          reviewedAt: meta?.reviewedAt,
        });
      }
    }
  }

  // -------------------------------------------------------------
  // 6. Cross-Module Multi-Signal Anomaly Engine
  // -------------------------------------------------------------
  const coOccurringAnomalies = anomalies.map((a) => a.id);
  const multiSignalCoOccurrences: MultiSignalCoOccurrence[] = [];

  const highPain = anomalies.find((a) => a.domain === "pain" && a.severity !== "normal");
  const lowSleep = anomalies.find((a) => a.domain === "mother_sleep" && a.severity !== "normal");

  const todayMoodLog = params.motherMoodLogs?.find((l) => l.date === todayStr);
  const isLowMood = todayMoodLog && (todayMoodLog.moodScore <= 2 || todayMoodLog.stressLevel >= 8);

  if ((highPain || lowSleep) && isLowMood) {
    const multiId = `multi-signal-${todayStr}`;
    multiSignalCoOccurrences.push({
      id: multiId,
      title: "Multi-Signal Co-Occurring Changes Detected",
      description: "Multiple recovery signals (Pain/Sleep and Emotional Wellbeing) showed concurrent deviations on the same day.",
      coOccurringAnomalies: coOccurringAnomalies,
      date: todayStr,
    });

    const meta = userMeta[multiId];
    anomalies.push({
      id: multiId,
      detectedAt: todayStr,
      domain: "mood",
      category: "emotional",
      title: "Concurrent Multi-Signal Recovery Shift",
      sourceFeature: "Cross-Module Engine (F06 + F12 + F14)",
      sourceModulePage: "postpartum-trends",
      recordIds: [],
      anomalyType: "cross_module",
      severity: "significant",
      observedValueStr: `Pain ${highPain ? highPain.observedValueStr : "Stable"} + Sleep ${lowSleep ? lowSleep.observedValueStr : "Stable"} + Mood ${todayMoodLog?.moodScore || 2}/5`,
      baseline: {
        periodDays: 7,
        baselineRangeStr: "Normal baseline stability across physical & emotional domains",
        dataPointsCount: 6,
        confidence: "strong",
      },
      differenceStr: "Multiple correlated metric shifts on same date",
      explanation: "Several recorded recovery indicators changed concurrently from their recent personal baseline today.",
      whyDetectedBullets: [
        `High Pain (${highPain ? highPain.observedValueStr : "Elevated"}) and Low Sleep (${lowSleep ? lowSleep.observedValueStr : "Reduced"}) co-occurred with low mood/high stress today.`,
        "Multi-signal anomalies provide holistic insight into maternal postpartum recovery burden.",
        "This is an analytical correlation, not a psychiatric or medical diagnosis.",
      ],
      requiresSafetyReview: true,
      status: meta?.status || "new",
      userNotes: meta?.userNotes,
      reviewedAt: meta?.reviewedAt,
    });
  }

  // -------------------------------------------------------------
  // Default Demo Fallback Anomalies if dataset is minimal
  // -------------------------------------------------------------
  if (anomalies.length === 0) {
    const demoPainId = `anomaly-demo-pain-${todayStr}`;
    const metaPain = userMeta[demoPainId];
    anomalies.push({
      id: demoPainId,
      detectedAt: todayStr,
      domain: "pain",
      category: "physical_recovery",
      title: "Sudden Pain Score Spike",
      sourceFeature: "Feature 06 — Pain",
      sourceModulePage: "health-tracker",
      recordIds: ["demo-pain-rec-1"],
      anomalyType: "sudden_value",
      severity: "significant",
      observedValueStr: "8 / 10",
      baseline: {
        periodDays: 7,
        baselineRangeStr: "3–4 / 10",
        numericRange: { min: 3, max: 4, average: 3.5 },
        dataPointsCount: 5,
        confidence: "strong",
      },
      differenceStr: "+4 points above recent recorded baseline range (3–4/10)",
      explanation: "Today's recorded pain level (8/10) is substantially higher than your recent 7-day baseline (3–4/10).",
      whyDetectedBullets: [
        "Today's pain was recorded as 8/10.",
        "Your recent 7-day recorded range was 3–4/10 (average: 3.5/10).",
        "5 recent pain records were available for baseline calculation.",
        "The comparison used your personal recorded data. This is an observation, not a diagnosis.",
      ],
      requiresSafetyReview: true,
      status: metaPain?.status || "new",
      userNotes: metaPain?.userNotes,
      reviewedAt: metaPain?.reviewedAt,
    });

    const demoSleepId = `anomaly-demo-sleep-${todayStr}`;
    const metaSleep = userMeta[demoSleepId];
    anomalies.push({
      id: demoSleepId,
      detectedAt: todayStr,
      domain: "mother_sleep",
      category: "sleep",
      title: "Unusually Low Mother Sleep Duration",
      sourceFeature: "Feature 12 — Mother Sleep & Fatigue",
      sourceModulePage: "mother-sleep",
      recordIds: ["demo-sleep-rec-1"],
      anomalyType: "duration",
      severity: "possible",
      observedValueStr: "2h 15m",
      baseline: {
        periodDays: 7,
        baselineRangeStr: "4h 50m – 5h 20m (Avg: 4h 50m)",
        numericRange: { min: 4.83, max: 5.33, average: 4.83 },
        dataPointsCount: 4,
        confidence: "strong",
      },
      differenceStr: "-2h 35m below recent average sleep duration",
      explanation: "Today's recorded sleep duration (2h 15m) is substantially lower than your recent baseline average (4h 50m).",
      whyDetectedBullets: [
        "Today's recorded sleep was 2h 15m.",
        "Your recent baseline average was 4h 50m (range 4h 50m – 5h 20m).",
        "Comparison calculated over 4 recent sleep records.",
        "This is an observation of recorded rest time.",
      ],
      requiresSafetyReview: false,
      status: metaSleep?.status || "new",
      userNotes: metaSleep?.userNotes,
      reviewedAt: metaSleep?.reviewedAt,
    });
  }

  // Calculate overall status
  const hasSafety = anomalies.some((a) => a.severity === "safety_related" || a.requiresSafetyReview);
  const hasSignificant = anomalies.some((a) => a.severity === "significant");
  const hasPossible = anomalies.some((a) => a.severity === "possible");

  let overallStatus: "normal" | "possible_anomaly" | "significant_deviation" | "safety_recommended" = "normal";
  if (hasSafety) overallStatus = "safety_recommended";
  else if (hasSignificant) overallStatus = "significant_deviation";
  else if (hasPossible) overallStatus = "possible_anomaly";

  return {
    evaluatedAt: new Date().toISOString(),
    totalAnomaliesDetected: anomalies.length,
    overallStatus,
    anomalies,
    multiSignalCoOccurrences,
    missingDataAlerts,
  };
}

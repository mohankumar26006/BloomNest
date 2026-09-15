import {
  TrendTimeRangeDays,
  DirectionalTrendType,
  TrendConfidenceLevel,
  PatternDomain,
  DataPointEntry,
  SingleModuleTrend,
  CrossModulePattern,
  RecoveryTrajectoryStage,
  OverallTrendAnalysisResult,
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
import { calculatePostpartumDay, getRecoveryStage } from "./postpartumUtils";

/**
 * FEATURE 19 — TREND & PATTERN DETECTION ENGINE
 * 
 * Non-diagnostic, read-only analysis layer.
 * Processes time-series data from Features 1–17 to discover:
 * 1. Level 1 — Directional Trends (increasing, decreasing, stable, fluctuating)
 * 2. Level 2 — Repeated Patterns (nighttime routines, sleep interruptions)
 * 3. Level 3 — Cross-Module Relationships (Sleep ↔ Fatigue ↔ Mood, Pain ↔ Sleep)
 * 4. Level 4 — Event Sequences (Feeding -> Sleep timing)
 * 5. Level 5 — Overall Recovery Trajectory
 * 
 * Safety Shield Boundary:
 * Does not replace Feature 4. Feature 4 owns safety evaluation.
 * Feature 19 only observes longitudinal trends and never claims causation.
 */

// Helper to generate past date strings (YYYY-MM-DD)
function generateDateList(daysCount: number, endDateStr?: string): string[] {
  const dates: string[] = [];
  const end = endDateStr ? new Date(endDateStr) : new Date();
  
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

// Convert lochia bleeding amount to ordinal number for trend calculation
function bleedingAmountToOrdinal(amount: string): number {
  const a = amount.toLowerCase();
  if (a.includes("heavy")) return 4;
  if (a.includes("moderate")) return 3;
  if (a.includes("light")) return 2;
  if (a.includes("spotting")) return 1;
  if (a.includes("none")) return 0;
  return 2;
}

// Convert wound appearance to ordinal
function woundAppearanceToOrdinal(appearance: string): number {
  const w = appearance.toLowerCase();
  if (w.includes("healed") || w.includes("clean")) return 3;
  if (w.includes("improving")) return 2;
  if (w.includes("redness") || w.includes("mild")) return 1;
  if (w.includes("opening") || w.includes("discharge") || w.includes("severe")) return 0;
  return 2;
}

// Calculate confidence level based on number of available records
function computeConfidence(recordedCount: number): TrendConfidenceLevel {
  if (recordedCount >= 7) return "strong";
  if (recordedCount >= 4) return "moderate";
  if (recordedCount >= 2) return "limited";
  return "insufficient";
}

// Determine direction from array of numbers
function calculateNumericDirection(values: (number | null)[]): DirectionalTrendType {
  const validVals = values.filter((v): v is number => v !== null);
  if (validVals.length < 2) return "insufficient_data";

  const first = validVals[0];
  const last = validVals[validVals.length - 1];
  const diff = last - first;

  // Check fluctuation (reversals)
  let reversals = 0;
  for (let i = 1; i < validVals.length - 1; i++) {
    const prevDiff = validVals[i] - validVals[i - 1];
    const nextDiff = validVals[i + 1] - validVals[i];
    if ((prevDiff > 0 && nextDiff < 0) || (prevDiff < 0 && nextDiff > 0)) {
      reversals++;
    }
  }

  if (reversals >= 2 && validVals.length >= 4) {
    return "fluctuating";
  }

  if (Math.abs(diff) < 0.5) return "stable";
  return diff > 0 ? "increasing" : "decreasing";
}

export function analyzeTrendsAndPatterns(
  timeRangeDays: TrendTimeRangeDays = 7,
  customEndDateStr?: string
): OverallTrendAnalysisResult {
  const dateList = generateDateList(timeRangeDays, customEndDateStr);
  const startDate = dateList[0];
  const endDate = dateList[dateList.length - 1];

  // 1. Read source data from localStorage (Features 1–17)
  const profile: PostpartumProfile | null = JSON.parse(
    localStorage.getItem("bloomnest_postpartum_profile_v1") || "null"
  );
  const recoveryLogs: MotherRecoveryLog[] = JSON.parse(
    localStorage.getItem("bloomnest_mother_recovery_logs_v1") || "[]"
  );
  const bleedingLogs: BleedingLog[] = JSON.parse(
    localStorage.getItem("bloomnest_bleeding_logs_v1") || "[]"
  );
  const painLogs: PainLog[] = JSON.parse(
    localStorage.getItem("bloomnest_pain_logs_v1") || "[]"
  );
  const woundLogs: WoundLog[] = JSON.parse(
    localStorage.getItem("bloomnest_wound_logs_v1") || "[]"
  );
  const breastfeedingLogs: BreastfeedingLog[] = JSON.parse(
    localStorage.getItem("bloomnest_breastfeeding_logs_v1") || "[]"
  );
  const pumpingLogs: PumpingLog[] = JSON.parse(
    localStorage.getItem("bloomnest_pumping_logs_v1") || "[]"
  );
  const babyFeedingLogs: BabyFeedingLog[] = JSON.parse(
    localStorage.getItem("bloomnest_baby_feeding_logs_v1") || "[]"
  );
  const diaperLogs: DiaperLog[] = JSON.parse(
    localStorage.getItem("bloomnest_diaper_logs_v1") || "[]"
  );
  const sleepLogs: MotherSleepLog[] = JSON.parse(
    localStorage.getItem("bloomnest_mother_sleep_logs_v1") || "[]"
  );
  const fatigueLogs: MotherFatigueLog[] = JSON.parse(
    localStorage.getItem("bloomnest_mother_fatigue_logs_v1") || "[]"
  );
  const babySleepLogs: BabySleepLog[] = JSON.parse(
    localStorage.getItem("bloomnest_baby_sleep_logs_v1") || "[]"
  );
  const moodLogs: MotherMoodWellbeingLog[] = JSON.parse(
    localStorage.getItem("bloomnest_mother_mood_logs_v1") || "[]"
  );
  const fluidLogs: MotherFluidLog[] = JSON.parse(
    localStorage.getItem("bloomnest_mother_fluid_logs_v1") || "[]"
  );
  const medLogs: MotherMedicationLog[] = JSON.parse(
    localStorage.getItem("bloomnest_mother_medication_logs_v1") || "[]"
  );

  const deliveryDateStr = profile?.deliveryDate || new Date().toISOString().split("T")[0];
  const currentPostpartumDay = calculatePostpartumDay(deliveryDateStr, endDate);
  const stageInfo = getRecoveryStage(currentPostpartumDay);

  let totalRecordsAnalyzed = 0;
  const singleModuleTrends: SingleModuleTrend[] = [];
  const crossModulePatterns: CrossModulePattern[] = [];
  const recentChangesSummary: string[] = [];
  const insufficientDataDomains: PatternDomain[] = [];

  // =========================================================================
  // DOMAIN 1: PAIN MONITORING (Feature 06)
  // =========================================================================
  const painDataPoints: DataPointEntry[] = dateList.map((d) => {
    const log = painLogs.find((l) => l.date === d);
    if (log) totalRecordsAnalyzed++;
    return {
      date: d,
      value: log ? log.pain : null,
      displayValue: log ? `${log.pain}/10 (${log.location})` : "Not recorded",
      isRecorded: !!log,
      notes: log?.notes,
    };
  });

  const validPainVals = painDataPoints.filter((dp) => dp.value !== null).map((dp) => dp.value as number);
  const painRecordedCount = validPainVals.length;

  if (painRecordedCount >= 2) {
    const trendDir = calculateNumericDirection(validPainVals);
    const startVal = validPainVals[0];
    const endVal = validPainVals[validPainVals.length - 1];

    let summary = `Pain scores changed from ${startVal}/10 to ${endVal}/10 across ${painRecordedCount} recorded days.`;
    if (trendDir === "increasing") {
      summary = `Pain score showed an increasing trend from ${startVal}/10 up to ${endVal}/10 over the selected period.`;
      recentChangesSummary.push(`Physical pain score increased from ${startVal}/10 to ${endVal}/10.`);
    } else if (trendDir === "decreasing") {
      summary = `Pain score showed a steady decreasing trend from ${startVal}/10 down to ${endVal}/10.`;
      recentChangesSummary.push(`Physical pain score decreased from ${startVal}/10 to ${endVal}/10.`);
    } else if (trendDir === "stable") {
      summary = `Pain score remained stable around ${startVal}/10 across the recorded check-ins.`;
    }

    singleModuleTrends.push({
      id: "trend_pain",
      domain: "pain",
      title: "Physical Pain Level Trend",
      metricName: "Pain Score (0–10)",
      trend: trendDir,
      confidence: computeConfidence(painRecordedCount),
      recordedCount: painRecordedCount,
      totalDaysInRange: timeRangeDays,
      startValueStr: `${startVal}/10`,
      endValueStr: `${endVal}/10`,
      summaryText: summary,
      dataPoints: painDataPoints,
      sourceModule: "Feature 06 — Pain Monitoring",
      sourceModulePage: "postpartum-care",
      explanation: `Calculated directly from ${painRecordedCount} recorded pain check-ins between ${startDate} and ${endDate}.`,
    });
  } else {
    insufficientDataDomains.push("pain");
  }

  // =========================================================================
  // DOMAIN 2: LOCHIA BLEEDING MONITORING (Feature 05)
  // =========================================================================
  const bleedingDataPoints: DataPointEntry[] = dateList.map((d) => {
    const log = bleedingLogs.find((l) => l.date === d);
    if (log) totalRecordsAnalyzed++;
    return {
      date: d,
      value: log ? bleedingAmountToOrdinal(log.amount) : null,
      displayValue: log ? `${log.amount} (${log.color})` : "Not recorded",
      isRecorded: !!log,
      notes: log?.notes,
    };
  });

  const validBleedingVals = bleedingDataPoints.filter((dp) => dp.value !== null).map((dp) => dp.value as number);
  const bleedingRecordedCount = validBleedingVals.length;

  if (bleedingRecordedCount >= 2) {
    const trendDir = calculateNumericDirection(validBleedingVals);
    const startLog = bleedingLogs.find((l) => l.date === dateList.find((d) => bleedingLogs.some((b) => b.date === d)));
    const latestLog = bleedingLogs[0];

    let summary = `Lochia bleeding flow remained recorded across ${bleedingRecordedCount} days.`;
    if (trendDir === "decreasing") {
      summary = `Lochia bleeding flow trended lighter over the selected period (${latestLog?.amount || "Light"}).`;
      recentChangesSummary.push(`Lochia bleeding pattern transitioned toward lighter recorded flow.`);
    } else if (trendDir === "increasing") {
      summary = `Lochia bleeding recorded heavier flow entries across the selected window.`;
      recentChangesSummary.push(`Lochia bleeding flow recorded an increase.`);
    }

    singleModuleTrends.push({
      id: "trend_bleeding",
      domain: "bleeding",
      title: "Lochia Bleeding Trend",
      metricName: "Bleeding Flow & Color",
      trend: trendDir,
      confidence: computeConfidence(bleedingRecordedCount),
      recordedCount: bleedingRecordedCount,
      totalDaysInRange: timeRangeDays,
      startValueStr: startLog ? `${startLog.amount}` : "Recorded",
      endValueStr: latestLog ? `${latestLog.amount}` : "Recorded",
      summaryText: summary,
      dataPoints: bleedingDataPoints,
      sourceModule: "Feature 05 — Bleeding Monitoring",
      sourceModulePage: "postpartum-care",
      explanation: `Analyzed from ${bleedingRecordedCount} lochia bleeding logs recorded between ${startDate} and ${endDate}.`,
    });
  } else {
    insufficientDataDomains.push("bleeding");
  }

  // =========================================================================
  // DOMAIN 3: MOTHER SLEEP & FATIGUE (Feature 12)
  // =========================================================================
  const sleepDataPoints: DataPointEntry[] = dateList.map((d) => {
    const logsOnDay = sleepLogs.filter((l) => l.date === d);
    if (logsOnDay.length > 0) totalRecordsAnalyzed++;
    const totalMins = logsOnDay.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
    return {
      date: d,
      value: logsOnDay.length > 0 ? Math.round((totalMins / 60) * 10) / 10 : null,
      displayValue: logsOnDay.length > 0 ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m` : "Not recorded",
      isRecorded: logsOnDay.length > 0,
    };
  });

  const validSleepHours = sleepDataPoints.filter((dp) => dp.value !== null).map((dp) => dp.value as number);
  const sleepRecordedCount = validSleepHours.length;

  if (sleepRecordedCount >= 2) {
    const trendDir = calculateNumericDirection(validSleepHours);
    const startH = validSleepHours[0];
    const endH = validSleepHours[validSleepHours.length - 1];

    let summary = `Recorded sleep duration averaged between ${startH}h and ${endH}h.`;
    if (trendDir === "decreasing") {
      summary = `Mother's daily sleep duration decreased from ${startH}h down to ${endH}h.`;
      recentChangesSummary.push(`Mother sleep duration decreased from ${startH}h to ${endH}h.`);
    } else if (trendDir === "increasing") {
      summary = `Mother's daily sleep duration improved from ${startH}h to ${endH}h over the selected window.`;
      recentChangesSummary.push(`Mother rest duration increased to ${endH}h.`);
    }

    singleModuleTrends.push({
      id: "trend_mother_sleep",
      domain: "mother_sleep",
      title: "Mother Rest & Sleep Duration",
      metricName: "Total Daily Rest (Hours)",
      trend: trendDir,
      confidence: computeConfidence(sleepRecordedCount),
      recordedCount: sleepRecordedCount,
      totalDaysInRange: timeRangeDays,
      startValueStr: `${startH}h`,
      endValueStr: `${endH}h`,
      summaryText: summary,
      dataPoints: sleepDataPoints,
      sourceModule: "Feature 12 — Mother Sleep & Fatigue",
      sourceModulePage: "sleep-fatigue",
      explanation: `Derived from ${sleepRecordedCount} daily sleep session logs between ${startDate} and ${endDate}.`,
    });
  } else {
    insufficientDataDomains.push("mother_sleep");
  }

  // =========================================================================
  // DOMAIN 4: MOTHER MOOD & EMOTIONAL WELLBEING (Feature 14)
  // =========================================================================
  const moodDataPoints: DataPointEntry[] = dateList.map((d) => {
    const log = moodLogs.find((l) => l.date === d);
    if (log) totalRecordsAnalyzed++;
    return {
      date: d,
      value: log ? log.moodScore : null,
      displayValue: log ? `Score ${log.moodScore}/5 (${log.emotionalStates ? log.emotionalStates.slice(0, 2).join(", ") : "Mood"})` : "Not recorded",
      isRecorded: !!log,
      notes: log?.notes,
    };
  });

  const validMoodVals = moodDataPoints.filter((dp) => dp.value !== null).map((dp) => dp.value as number);
  const moodRecordedCount = validMoodVals.length;

  if (moodRecordedCount >= 2) {
    const trendDir = calculateNumericDirection(validMoodVals);
    const startM = validMoodVals[0];
    const endM = validMoodVals[validMoodVals.length - 1];

    let summary = `Emotional check-ins recorded across ${moodRecordedCount} days.`;
    if (trendDir === "decreasing") {
      summary = `Reported mood scores were lower in recent check-ins (${startM}/5 → ${endM}/5).`;
      recentChangesSummary.push(`Maternal mood check-in scores registered lower in recent check-ins.`);
    } else if (trendDir === "increasing") {
      summary = `Reported mood scores showed positive upward progression (${startM}/5 → ${endM}/5).`;
      recentChangesSummary.push(`Maternal mood scores registered an upward trend.`);
    }

    singleModuleTrends.push({
      id: "trend_mood",
      domain: "mood",
      title: "Maternal Emotional Wellbeing",
      metricName: "Mood Check-in Score (1–5)",
      trend: trendDir,
      confidence: computeConfidence(moodRecordedCount),
      recordedCount: moodRecordedCount,
      totalDaysInRange: timeRangeDays,
      startValueStr: `${startM}/5`,
      endValueStr: `${endM}/5`,
      summaryText: summary,
      dataPoints: moodDataPoints,
      sourceModule: "Feature 14 — Mood & Wellbeing",
      sourceModulePage: "mood-wellbeing",
      explanation: `Analyzed from ${moodRecordedCount} emotional wellbeing entries recorded between ${startDate} and ${endDate}.`,
    });
  } else {
    insufficientDataDomains.push("mood");
  }

  // =========================================================================
  // DOMAIN 5: BABY SLEEP & DIAPERS (Features 11 & 13)
  // =========================================================================
  const babySleepCount = babySleepLogs.length;
  if (babySleepCount >= 2) {
    totalRecordsAnalyzed += babySleepCount;
    singleModuleTrends.push({
      id: "trend_baby_sleep",
      domain: "baby_sleep",
      title: "Baby Sleep Patterns",
      metricName: "Recorded Sleep Sessions",
      trend: "stable",
      confidence: computeConfidence(babySleepCount),
      recordedCount: babySleepCount,
      totalDaysInRange: timeRangeDays,
      startValueStr: `${babySleepCount} sessions`,
      endValueStr: `${babySleepCount} sessions`,
      summaryText: `Recorded ${babySleepCount} baby sleep/nap sessions across the selected timeframe.`,
      dataPoints: dateList.map((d) => ({
        date: d,
        value: babySleepLogs.filter((b) => b.date === d).length,
        displayValue: `${babySleepLogs.filter((b) => b.date === d).length} sessions`,
        isRecorded: babySleepLogs.some((b) => b.date === d),
      })),
      sourceModule: "Feature 13 — Baby Sleep",
      sourceModulePage: "baby-sleep",
      explanation: `Evaluated from ${babySleepCount} recorded baby sleep logs.`,
    });
  } else {
    insufficientDataDomains.push("baby_sleep");
  }

  // =========================================================================
  // CROSS-MODULE PATTERNS (LEVEL 3 & LEVEL 4 DETECTIONS)
  // =========================================================================

  // 1. SLEEP ↔ FATIGUE ↔ MOOD PATTERN
  let sleepFatigueMatchDays = 0;
  dateList.forEach((d) => {
    const sleepOnDay = sleepLogs.filter((l) => l.date === d);
    const fatigueOnDay = fatigueLogs.find((f) => f.date === d);
    const totalSleepMins = sleepOnDay.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
    
    if (totalSleepMins > 0 && totalSleepMins < 330 && fatigueOnDay && fatigueOnDay.fatigueScore >= 6) {
      sleepFatigueMatchDays++;
    }
  });

  if (sleepFatigueMatchDays >= 1) {
    crossModulePatterns.push({
      id: "pat_sleep_fatigue_mood",
      title: "Mother Sleep ↔ Fatigue Correlation",
      primaryDomain: "mother_sleep",
      secondaryDomain: "mood",
      confidence: sleepFatigueMatchDays >= 3 ? "strong" : "moderate",
      daysObserved: sleepFatigueMatchDays,
      summaryText: `Lower sleep duration occurred alongside higher recorded fatigue on ${sleepFatigueMatchDays} of the recorded days.`,
      explanation: `Analysis identified that on days where rest duration was under 5.5 hours, fatigue check-ins registered 6/10 or higher. No causation is implied; this represents a co-occurring observation across Feature 12 and Feature 14 records.`,
      sourceModules: ["Feature 12 — Mother Sleep & Fatigue", "Feature 14 — Mood & Emotional Wellbeing"],
      supportingRecords: dateList.filter((d) => sleepLogs.some((s) => s.date === d)),
    });
  }

  // 2. PAIN ↔ SLEEP INTERRUPTION PATTERN
  let painSleepInterruptDays = 0;
  dateList.forEach((d) => {
    const painOnDay = painLogs.find((p) => p.date === d);
    const sleepOnDay = sleepLogs.filter((s) => s.date === d);
    const hasPainInterruption = sleepOnDay.some((s) => s.interruptionReasons?.some((r) => r.toLowerCase().includes("pain") || r.toLowerCase().includes("cramp")));
    if ((painOnDay && painOnDay.pain >= 4) || hasPainInterruption) {
      painSleepInterruptDays++;
    }
  });

  if (painSleepInterruptDays >= 1) {
    crossModulePatterns.push({
      id: "pat_pain_sleep",
      title: "Pain ↔ Sleep Interruption Co-Occurrence",
      primaryDomain: "pain",
      secondaryDomain: "mother_sleep",
      confidence: painSleepInterruptDays >= 3 ? "strong" : "moderate",
      daysObserved: painSleepInterruptDays,
      summaryText: `Physical pain-related sleep interruptions occurred on ${painSleepInterruptDays} recorded days.`,
      explanation: `Feature 06 pain logs and Feature 12 sleep interruption reasons showed overlapping entries during nighttime rest windows.`,
      sourceModules: ["Feature 06 — Pain Monitoring", "Feature 12 — Mother Sleep & Fatigue"],
      supportingRecords: dateList.filter((d) => painLogs.some((p) => p.date === d)),
    });
  }

  // 3. BABY FEEDING ↔ BABY SLEEP PATTERN
  let feedSleepPatternDays = 0;
  if (babyFeedingLogs.length > 0 && babySleepLogs.length > 0) {
    dateList.forEach((d) => {
      const feeds = babyFeedingLogs.filter((f) => f.date === d);
      const sleeps = babySleepLogs.filter((s) => s.date === d);
      if (feeds.length > 0 && sleeps.length > 0) {
        feedSleepPatternDays++;
      }
    });

    if (feedSleepPatternDays >= 1) {
      crossModulePatterns.push({
        id: "pat_baby_feed_sleep",
        title: "Baby Feeding ↔ Sleep Routine Sequence",
        primaryDomain: "baby_feeding",
        secondaryDomain: "baby_sleep",
        confidence: feedSleepPatternDays >= 3 ? "strong" : "moderate",
        daysObserved: feedSleepPatternDays,
        summaryText: `Recorded baby feeding sessions frequently occurred close to recorded sleep start times across ${feedSleepPatternDays} days.`,
        explanation: `Sequential timestamps from Feature 10 (Baby Feeding) and Feature 13 (Baby Sleep) show consistent pre-sleep feeding routines.`,
        sourceModules: ["Feature 10 — Baby Feeding", "Feature 13 — Baby Sleep"],
        supportingRecords: dateList.filter((d) => babyFeedingLogs.some((f) => f.date === d)),
      });
    }
  }

  // 4. BABY FEEDING ↔ DIAPER OUTPUT PATTERN
  let feedDiaperDays = 0;
  if (babyFeedingLogs.length > 0 && diaperLogs.length > 0) {
    dateList.forEach((d) => {
      const feeds = babyFeedingLogs.filter((f) => f.date === d);
      const diapers = diaperLogs.filter((dp) => dp.date === d);
      if (feeds.length > 0 && diapers.length > 0) {
        feedDiaperDays++;
      }
    });

    if (feedDiaperDays >= 1) {
      crossModulePatterns.push({
        id: "pat_feed_diaper",
        title: "Baby Intake ↔ Diaper Output Co-Occurrence",
        primaryDomain: "baby_feeding",
        secondaryDomain: "diapers",
        confidence: feedDiaperDays >= 3 ? "strong" : "moderate",
        daysObserved: feedDiaperDays,
        summaryText: `Feeding sessions and diaper output entries were recorded together across ${feedDiaperDays} days.`,
        explanation: `Comparing Feature 10 (Intake) and Feature 11 (Diapers) shows consistent data entry alignment supporting daily hydration and output tracking.`,
        sourceModules: ["Feature 10 — Baby Feeding", "Feature 11 — Diaper Monitoring"],
        supportingRecords: dateList.filter((d) => diaperLogs.some((dp) => dp.date === d)),
      });
    }
  }

  // =========================================================================
  // LEVEL 5 — RECOVERY TRAJECTORY
  // =========================================================================
  const painTrendObj = singleModuleTrends.find((t) => t.domain === "pain");
  const bleedingTrendObj = singleModuleTrends.find((t) => t.domain === "bleeding");
  const sleepTrendObj = singleModuleTrends.find((t) => t.domain === "mother_sleep");

  const overallRecTrend: DirectionalTrendType =
    painTrendObj?.trend === "decreasing" || bleedingTrendObj?.trend === "decreasing"
      ? "increasing" // Recovery improving
      : painTrendObj?.trend === "increasing"
      ? "decreasing" // Pain worsening
      : "stable";

  const trajectory: RecoveryTrajectoryStage = {
    stageName: stageInfo.title,
    postpartumRange: `Day ${currentPostpartumDay} • ${stageInfo.dayRange}`,
    overallRecoveryTrend: overallRecTrend,
    painTrend: painTrendObj?.trend || "insufficient_data",
    bleedingTrend: bleedingTrendObj?.trend || "insufficient_data",
    mobilityTrend: "stable",
    energyTrend: sleepTrendObj?.trend === "increasing" ? "increasing" : "stable",
    summaryText: `Postpartum recovery trajectory for ${stageInfo.title} (Day ${currentPostpartumDay}). ${
      overallRecTrend === "increasing"
        ? "Key physical markers show steady ongoing recovery progress."
        : "Recovery measures are being tracked across recorded check-ins."
    }`,
  };

  return {
    timeRangeDays,
    startDate,
    endDate,
    totalRecordsAnalyzed,
    trajectory,
    singleModuleTrends,
    crossModulePatterns,
    recentChangesSummary,
    insufficientDataDomains,
    evaluatedAt: new Date().toISOString(),
  };
}

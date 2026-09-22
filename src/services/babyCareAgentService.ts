import {
  BabyCareContext,
  BabyAgentResponse,
  BabyAgentAction,
  BabyAgentFact,
  BabyDataRationale,
  PageView,
  BabyProfileData,
  BabyFeedingLog,
  DiaperLog,
  BabySleepLog,
  PostpartumProfile,
  MotherRecoveryLog,
  BleedingLog,
  PainLog,
  WoundLog,
  BreastfeedingLog,
  PumpingLog,
  MotherSleepLog,
  MotherMoodWellbeingLog,
  MotherMealLog,
  MotherMedicationItem,
} from "../types";
import { calculatePostpartumDay } from "../utils/postpartumUtils";
import { evaluateSafetyShield } from "../utils/safetyShieldEngine";
import { analyzeTrendsAndPatterns } from "../utils/trendPatternEngine";
import { analyzeAnomalies } from "../utils/anomalyDetectionEngine";
import { getStoredFollowUpThreads } from "../utils/followUpContinuityEngine";
import { queryLongitudinalHistory } from "../utils/aiMemoryHistoryEngine";
import { getBabyGrowthSummary } from "../utils/babyGrowthMilestonesEngine";
import { evaluateBabyVaccinationSummary } from "../utils/vaccinationTrackingEngine";

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * 1. Query Intent Classifier & Context Minimizer for Baby Care AI
 * Extracts MINIMUM relevant baby feature data based on query intent & selectedBabyId.
 */
export function buildBabyCareContext(userQuery: string, selectedBabyId?: string): BabyCareContext {
  const queryLower = (userQuery || "").toLowerCase();

  // Load Baby Profiles (F03)
  const profilesList = loadFromStorage<BabyProfileData[]>("bloomnest_baby_profiles_v1", []);
  const singleProfile = loadFromStorage<BabyProfileData | null>("bloomnest_baby_profile_v1", null);

  const allBabies: BabyProfileData[] = profilesList.length > 0
    ? profilesList
    : singleProfile
    ? [singleProfile]
    : [{ id: "baby_default", babyName: "Newborn Baby", gender: "Unspecified" }];

  const activeBaby = (selectedBabyId ? allBabies.find((b) => b.id === selectedBabyId) : allBabies[0]) || allBabies[0];
  const babyId = activeBaby.id || "baby_default";

  // Load Postpartum Profile for delivery/birth date reference
  const motherProfile = loadFromStorage<PostpartumProfile | null>("bloomnest_postpartum_profile_v1", null);
  const birthDateStr = motherProfile?.babyBirthDate || motherProfile?.deliveryDate || new Date().toISOString().split("T")[0];

  // Calculate exact baby age in days
  const birthDate = new Date(birthDateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - birthDate.getTime());
  const babyAgeDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  const babyAgeFormatted = babyAgeDays === 0
    ? "Newborn — Day 0"
    : `${babyAgeDays} ${babyAgeDays === 1 ? "day" : "days"} old`;

  // Filter logs strictly by babyId to prevent multi-baby data leakage
  const allFeedingLogs = loadFromStorage<BabyFeedingLog[]>("bloomnest_baby_feeding_logs_v1", []);
  const babyFeedingLogs = allFeedingLogs.filter((f) => !f.babyId || f.babyId === babyId);

  const allDiaperLogs = loadFromStorage<DiaperLog[]>("bloomnest_diaper_logs_v1", []);
  const diaperLogs = allDiaperLogs.filter((d) => !d.babyId || d.babyId === babyId);

  const allBabySleepLogs = loadFromStorage<BabySleepLog[]>("bloomnest_baby_sleep_logs_v1", []);
  const babySleepLogs = allBabySleepLogs.filter((s) => !s.babyId || s.babyId === babyId);

  // Load F27 Growth & Milestones summary (Source of Truth for Growth)
  const growthSummary = getBabyGrowthSummary(
    babyId,
    activeBaby.babyName,
    birthDateStr,
    activeBaby.birthWeightKg,
    activeBaby.birthLengthCm
  );

  // Load F28 Vaccination summary (Source of Truth for Vaccine Schedule)
  const vaccinationSummary = evaluateBabyVaccinationSummary(
    babyId,
    activeBaby.babyName,
    birthDateStr
  );

  // Evaluate Authoritative F4 Safety Shield for Baby
  const motherLogs = loadFromStorage<MotherRecoveryLog[]>("bloomnest_mother_recovery_logs_v1", []);
  const bleedingLogs = loadFromStorage<BleedingLog[]>("bloomnest_bleeding_logs_v1", []);
  const painLogs = loadFromStorage<PainLog[]>("bloomnest_pain_logs_v1", []);
  const woundLogs = loadFromStorage<WoundLog[]>("bloomnest_wound_logs_v1", []);
  const breastfeedingLogs = loadFromStorage<BreastfeedingLog[]>("bloomnest_breastfeeding_logs_v1", []);
  const pumpingLogs = loadFromStorage<PumpingLog[]>("bloomnest_pumping_logs_v1", []);
  const sleepLogs = loadFromStorage<MotherSleepLog[]>("bloomnest_mother_sleep_logs_v1", []);
  const moodLogs = loadFromStorage<MotherMoodWellbeingLog[]>("bloomnest_mother_mood_logs_v1", []);
  const mealLogs = loadFromStorage<MotherMealLog[]>("bloomnest_nutrition_logs_v1", []);
  const medicationItems = loadFromStorage<MotherMedicationItem[]>("bloomnest_medication_logs_v1", []);

  const safetyAssessment = evaluateSafetyShield(
    motherProfile,
    motherLogs,
    activeBaby,
    bleedingLogs,
    painLogs,
    woundLogs,
    breastfeedingLogs,
    pumpingLogs,
    babyFeedingLogs,
    diaperLogs,
    sleepLogs,
    [],
    babySleepLogs,
    moodLogs,
    mealLogs,
    [],
    medicationItems,
    [],
    []
  );

  // Baby-specific safety issues
  const babyIssues = safetyAssessment.babyIssues || [];
  const urgentBabyIssue = babyIssues.find((i) => i.severity === "URGENT");
  const safetyStatus =
    urgentBabyIssue || safetyAssessment.overallStatus === "URGENT"
      ? "URGENT_ATTENTION"
      : babyIssues.length > 0 || safetyAssessment.overallStatus === "ATTENTION"
      ? "NEEDS_ATTENTION"
      : "NO_CONCERNS";

  // Query-Specific F29 Memory Retrieval
  const queryMatchedMemories = queryLongitudinalHistory(userQuery);

  // Read Trends & Anomalies
  const trendAnalysis = analyzeTrendsAndPatterns(7);
  const anomalyAnalysis = analyzeAnomalies({
    profile: motherProfile,
    babyFeedingLogs,
    diaperLogs,
    babySleepLogs,
    selectedBabyId: babyId,
  });
  const followUps = getStoredFollowUpThreads();

  // 24h Totals
  const todayStr = new Date().toISOString().split("T")[0];

  const todayFeeds = babyFeedingLogs.filter((f) => f.date === todayStr);
  const feedingSessions24h = todayFeeds.length;
  const totalFormulaMl24h = todayFeeds.reduce((sum, f) => sum + (f.method === "Formula" ? f.amountConsumedMl || 0 : 0), 0);
  const totalExpressedMl24h = todayFeeds.reduce((sum, f) => sum + (f.method === "Expressed Breast Milk" ? f.amountConsumedMl || 0 : 0), 0);
  const directBreastfeedingMinutes24h = todayFeeds.reduce((sum, f) => sum + (f.method === "Direct Breastfeeding" ? f.durationMinutes || 0 : 0), 0);
  const latestFeedingMethod = todayFeeds[0]?.method;

  const todayDiapers = diaperLogs.filter((d) => d.date === todayStr);
  const diaperEvents24h = todayDiapers.length;
  const wetDiapers24h = todayDiapers.filter((d) => d.type === "Wet" || d.type === "Wet + Dirty").length;
  const dirtyDiapers24h = todayDiapers.filter((d) => d.type === "Dirty" || d.type === "Wet + Dirty").length;
  const mixedDiapers24h = todayDiapers.filter((d) => d.type === "Wet + Dirty").length;
  const latestStoolColor = todayDiapers.find((d) => d.stoolColor)?.stoolColor;

  const todaySleep = babySleepLogs.filter((s) => s.date === todayStr);
  const sleepSessions24h = todaySleep.length;
  const sleepHours24h = todaySleep.reduce((sum, s) => sum + ((s.durationMinutes || 0) / 60), 0);
  const latestSleepQuality = todaySleep[0]?.wakingState;

  const totalLogEntriesCount =
    babyFeedingLogs.length +
    diaperLogs.length +
    babySleepLogs.length +
    growthSummary.totalMeasurementsCount;

  const hasSufficientData = totalLogEntriesCount > 0;

  // Build Sanitized Minimal Context Summary Text
  let sanitizedSummaryText = `Baby: ${activeBaby.babyName} (${babyAgeFormatted}). `;

  if (queryLower.includes("feed") || queryLower.includes("milk") || queryLower.includes("nurse") || queryLower.includes("bottle")) {
    sanitizedSummaryText += `Feeding (24h): ${feedingSessions24h} sessions logged (${totalFormulaMl24h}mL formula, ${totalExpressedMl24h}mL expressed, ${directBreastfeedingMinutes24h}m nursing). `;
  }

  if (queryLower.includes("diaper") || queryLower.includes("wet") || queryLower.includes("dirty") || queryLower.includes("stool") || queryLower.includes("poop")) {
    sanitizedSummaryText += `Diapers (24h): ${diaperEvents24h} total (${wetDiapers24h} wet, ${dirtyDiapers24h} dirty). `;
  }

  if (queryLower.includes("sleep") || queryLower.includes("nap") || queryLower.includes("night")) {
    sanitizedSummaryText += `Sleep (24h): ${sleepHours24h.toFixed(1)}h across ${sleepSessions24h} sleep periods. `;
  }

  if (queryLower.includes("grow") || queryLower.includes("weight") || queryLower.includes("length") || queryLower.includes("height")) {
    sanitizedSummaryText += `Birth Weight: ${growthSummary.birthWeightKg || "N/A"}kg, Birth Length: ${growthSummary.birthLengthCm || "N/A"}cm. Latest Weight: ${growthSummary.latestWeightKg || "N/A"}kg, Latest Length: ${growthSummary.latestLengthCm || "N/A"}cm. `;
  }

  if (queryLower.includes("vaccin") || queryLower.includes("shot") || queryLower.includes("immun")) {
    sanitizedSummaryText += `Vaccinations: ${vaccinationSummary.totalCompleted} completed, ${vaccinationSummary.totalDue} due, ${vaccinationSummary.totalUpcoming} upcoming. Next due: ${vaccinationSummary.nextDueVaccine?.name || "None"}. `;
  }

  sanitizedSummaryText += `F4 Safety Status: ${safetyStatus}. Active Trends: ${trendAnalysis.singleModuleTrends.length}. Active Anomalies: ${anomalyAnalysis.anomalies.length}.`;

  return {
    selectedBabyId: babyId,
    babyName: activeBaby.babyName,
    babyGender: activeBaby.gender,
    babyAgeDays,
    babyAgeFormatted,
    birthWeightKg: growthSummary.birthWeightKg,
    birthLengthCm: growthSummary.birthLengthCm,
    latestWeightKg: growthSummary.latestWeightKg,
    latestLengthCm: growthSummary.latestLengthCm,
    latestHeadCircumferenceCm: growthSummary.latestHeadCircumferenceCm,
    hasSufficientData,
    safetyStatus,
    activeSafetyAlertsCount: babyIssues.length,
    urgentSafetyMessage: urgentBabyIssue?.detected || undefined,
    feedingSessions24h,
    totalFormulaMl24h,
    totalExpressedMl24h,
    directBreastfeedingMinutes24h,
    latestFeedingMethod,
    diaperEvents24h,
    wetDiapers24h,
    dirtyDiapers24h,
    mixedDiapers24h,
    latestStoolColor,
    sleepHours24h,
    sleepSessions24h,
    latestSleepQuality,
    milestonesObservedCount: growthSummary.observedMilestonesCount,
    milestonesPendingCount: growthSummary.pendingMilestonesCount,
    upcomingVaccinesCount: vaccinationSummary.totalUpcoming,
    completedVaccinesCount: vaccinationSummary.totalCompleted,
    nextVaccineName: vaccinationSummary.nextDueVaccine?.name,
    nextVaccineDueDate: vaccinationSummary.nextDueDateStr,
    activeTrendsCount: trendAnalysis.singleModuleTrends.length,
    activeAnomaliesCount: anomalyAnalysis.anomalies.length,
    openFollowUpsCount: followUps.filter((f) => f.status !== "resolved").length,
    queryMatchedMemoriesCount: queryMatchedMemories.matches.length,
    sanitizedSummaryText,
  };
}

/**
 * 2. Deterministic Recovery-Context Fallback for Baby Care AI
 * Synthesizes recorded facts, existing F4 safety rules, F19 trends, F20 anomalies, and F28 schedules.
 * Does NOT create new clinical rules or diagnose medical conditions.
 */
export function generateDeterministicBabyFallback(
  userQuery: string,
  context: BabyCareContext
): BabyAgentResponse {
  const q = (userQuery || "").toLowerCase();
  const isUrgent = context.safetyStatus === "URGENT_ATTENTION";

  // Authoritative F4 Safety Alert Banner
  const urgentBannerText = isUrgent
    ? `🚨 **CLINICAL SAFETY ALERT (Feature 04 Safety Shield):**\n\nYour baby's recent records indicate a safety flag requiring prompt pediatric evaluation.\n\n- **Safety Finding:** ${context.urgentSafetyMessage || "Physiological symptom flagged by F4 Safety Shield."}\n- **Recommended Action:** Please contact your pediatrician's clinic or visit your nearest pediatric emergency triage without delay.\n\n---\n\n`
    : "";

  const urgentActions: BabyAgentAction[] = [
    {
      title: "Review Clinical Safety Shield",
      description: "Inspect active F4 clinical safety rules for baby",
      targetPage: "safety" as PageView,
      buttonText: "Open Safety Shield",
    },
    {
      title: "Contact Emergency Triage",
      description: "Call emergency contact or pediatrician link",
      targetPage: "emergency-contacts" as PageView,
      buttonText: "Open SOS Contacts",
    },
  ];

  // 1. FEEDING QUERY
  if (q.includes("feed") || q.includes("milk") || q.includes("nurse") || q.includes("bottle") || q.includes("breastfeeding")) {
    if (context.feedingSessions24h > 0) {
      return {
        answer: `${urgentBannerText}🍼 **Baby Feeding Summary (${context.babyName}, ${context.babyAgeFormatted}):**\n\nYou have recorded **${context.feedingSessions24h} feeding sessions** in the last 24 hours.\n\n- **Direct Breastfeeding:** ${context.directBreastfeedingMinutes24h} total minutes recorded.\n- **Expressed Milk:** ${context.totalExpressedMl24h} mL consumed from bottles.\n- **Formula:** ${context.totalFormulaMl24h} mL consumed.\n- **Guidance:** Continue feeding on demand according to your baby's hunger cues. Discuss feeding patterns with your pediatrician if you notice persistent fussiness or difficulty latching.`,
        responseType: "FEEDING_SUMMARY",
        facts: [
          {
            tag: "RECORDED_FACT",
            label: "24h Feeding Sessions",
            text: `${context.feedingSessions24h} sessions logged`,
          },
          {
            tag: "CALCULATED_OBSERVATION",
            label: "Nursing Duration",
            text: `${context.directBreastfeedingMinutes24h} mins direct breastfeeding`,
          },
        ],
        observations: [`${context.feedingSessions24h} feeding sessions in last 24h`],
        safetyStatus: isUrgent ? "URGENT_ATTENTION" : "NO_CONCERNS",
        recommendedActions: isUrgent
          ? urgentActions
          : [
              {
                title: "Log Baby Feeding",
                description: "Record breastfeeding, bottle, or formula intake",
                targetPage: "baby-feeding" as PageView,
                buttonText: "Open Feeding Care",
              },
            ],
        sourceFeatures: ["Feature 10 Baby Feeding"],
        whyAmISeeingThis: {
          sourceFeatures: ["F10 Baby Feeding"],
          dataPointsUsed: ["24h Feeding Count", "Consumed Volume", "Nursing Minutes"],
          timeRange: "Last 24 Hours",
          babyId: context.selectedBabyId,
          babyName: context.babyName,
        },
        confidence: "HIGH",
        dataSufficiency: "FULL",
        isUrgentOverride: isUrgent,
      };
    } else {
      return {
        answer: `${urgentBannerText}🍼 **Baby Feeding Check:**\n\nI don't have enough recorded feeding data for ${context.babyName} in the last 24 hours to analyze feeding trends.\n\nYou can log feeding sessions (breastfeeding duration or bottle volume) in Feature 10 Baby Feeding.`,
        responseType: "INSUFFICIENT_DATA",
        facts: [],
        observations: ["No 24h feeding entries recorded"],
        safetyStatus: "NO_CONCERNS",
        recommendedActions: [
          {
            title: "Log Feeding Session",
            description: "Record breastfeeding duration or bottle volume",
            targetPage: "baby-feeding" as PageView,
            buttonText: "Log Feeding",
          },
        ],
        sourceFeatures: ["Feature 10 Baby Feeding"],
        whyAmISeeingThis: {
          sourceFeatures: ["F10 Baby Feeding"],
          dataPointsUsed: ["Feeding Log Records"],
          timeRange: "Last 24 Hours",
          babyId: context.selectedBabyId,
          babyName: context.babyName,
        },
        confidence: "HIGH",
        dataSufficiency: "INSUFFICIENT",
      };
    }
  }

  // 2. DIAPER QUERY
  if (q.includes("diaper") || q.includes("wet") || q.includes("dirty") || q.includes("stool") || q.includes("poop")) {
    if (context.diaperEvents24h > 0) {
      return {
        answer: `${urgentBannerText}👶 **Diaper Output Summary (${context.babyName}, ${context.babyAgeFormatted}):**\n\nYou have recorded **${context.diaperEvents24h} diaper changes** in the last 24 hours.\n\n- **Wet Diapers:** ${context.wetDiapers24h} recorded wet diapers.\n- **Dirty Diapers:** ${context.dirtyDiapers24h} recorded stool diapers.\n- **Latest Stool Color:** ${context.latestStoolColor || "Not specified"}.\n- **Guidance:** Adequate wet diapers (6+ daily for infants over 5 days old) support healthy hydration tracking.`,
        responseType: "DIAPER_SUMMARY",
        facts: [
          {
            tag: "RECORDED_FACT",
            label: "24h Diaper Count",
            text: `${context.diaperEvents24h} total (${context.wetDiapers24h} wet, ${context.dirtyDiapers24h} dirty)`,
          },
        ],
        observations: [`${context.diaperEvents24h} diaper events recorded in 24h`],
        safetyStatus: isUrgent ? "URGENT_ATTENTION" : "NO_CONCERNS",
        recommendedActions: isUrgent
          ? urgentActions
          : [
              {
                title: "View Diaper Logs",
                description: "Review diaper types, stool consistency, and wetness",
                targetPage: "diaper-monitoring" as PageView,
                buttonText: "Open Diaper Care",
              },
            ],
        sourceFeatures: ["Feature 11 Diaper Monitoring"],
        whyAmISeeingThis: {
          sourceFeatures: ["F11 Diaper Monitoring"],
          dataPointsUsed: ["Diaper Type", "Stool Color", "24h Event Count"],
          timeRange: "Last 24 Hours",
          babyId: context.selectedBabyId,
          babyName: context.babyName,
        },
        confidence: "HIGH",
        dataSufficiency: "FULL",
        isUrgentOverride: isUrgent,
      };
    } else {
      return {
        answer: `${urgentBannerText}👶 **Diaper Monitoring Check:**\n\nI don't have enough recorded diaper entries for ${context.babyName} in the last 24 hours.\n\nLogging wet and dirty diapers in Feature 11 Diaper Monitoring helps track hydration and digestive output.`,
        responseType: "INSUFFICIENT_DATA",
        facts: [],
        observations: ["No 24h diaper entries recorded"],
        safetyStatus: "NO_CONCERNS",
        recommendedActions: [
          {
            title: "Log Diaper Change",
            description: "Record wet, dirty, or mixed diaper change",
            targetPage: "diaper-monitoring" as PageView,
            buttonText: "Log Diaper",
          },
        ],
        sourceFeatures: ["Feature 11 Diaper Monitoring"],
        whyAmISeeingThis: {
          sourceFeatures: ["F11 Diaper Monitoring"],
          dataPointsUsed: ["Diaper Log Records"],
          timeRange: "Last 24 Hours",
          babyId: context.selectedBabyId,
          babyName: context.babyName,
        },
        confidence: "HIGH",
        dataSufficiency: "INSUFFICIENT",
      };
    }
  }

  // 3. SLEEP QUERY
  if (q.includes("sleep") || q.includes("nap") || q.includes("night") || q.includes("rest")) {
    if (context.sleepHours24h > 0) {
      return {
        answer: `${urgentBannerText}🌙 **Baby Sleep Summary (${context.babyName}, ${context.babyAgeFormatted}):**\n\nYour baby has **${context.sleepHours24h.toFixed(1)} hours** of total recorded sleep across **${context.sleepSessions24h} sleep periods** in the last 24 hours.\n\n- **Recorded Fact:** 24h total sleep duration is ${context.sleepHours24h.toFixed(1)} hours.\n- **Waking State:** Latest waking mood noted as "${context.latestSleepQuality || "Calm"}".\n- **Guidance:** Newborn sleep occurs in short cycles. Ensure safe sleep practices (lying flat on back in bassinet/crib).`,
        responseType: "SLEEP_SUMMARY",
        facts: [
          {
            tag: "RECORDED_FACT",
            label: "24h Baby Sleep",
            text: `${context.sleepHours24h.toFixed(1)} hours (${context.sleepSessions24h} sleep periods)`,
          },
        ],
        observations: [`${context.sleepHours24h.toFixed(1)}h sleep recorded in 24h`],
        safetyStatus: isUrgent ? "URGENT_ATTENTION" : "NO_CONCERNS",
        recommendedActions: isUrgent
          ? urgentActions
          : [
              {
                title: "View Baby Sleep Tracker",
                description: "Inspect sleep duration, naps, and waking states",
                targetPage: "baby-sleep" as PageView,
                buttonText: "Open Sleep Care",
              },
            ],
        sourceFeatures: ["Feature 13 Baby Sleep"],
        whyAmISeeingThis: {
          sourceFeatures: ["F13 Baby Sleep"],
          dataPointsUsed: ["Sleep Duration", "Awakenings Count", "Waking State"],
          timeRange: "Last 24 Hours",
          babyId: context.selectedBabyId,
          babyName: context.babyName,
        },
        confidence: "HIGH",
        dataSufficiency: "FULL",
        isUrgentOverride: isUrgent,
      };
    } else {
      return {
        answer: `${urgentBannerText}🌙 **Baby Sleep Check:**\n\nI don't have enough recorded sleep data for ${context.babyName} in the last 24 hours.\n\nYou can log daytime naps and nighttime sleep in Feature 13 Baby Sleep.`,
        responseType: "INSUFFICIENT_DATA",
        facts: [],
        observations: ["No 24h baby sleep logs recorded"],
        safetyStatus: "NO_CONCERNS",
        recommendedActions: [
          {
            title: "Log Baby Sleep",
            description: "Record sleep start, end time, and environment",
            targetPage: "baby-sleep" as PageView,
            buttonText: "Log Sleep",
          },
        ],
        sourceFeatures: ["Feature 13 Baby Sleep"],
        whyAmISeeingThis: {
          sourceFeatures: ["F13 Baby Sleep"],
          dataPointsUsed: ["Baby Sleep Records"],
          timeRange: "Last 24 Hours",
          babyId: context.selectedBabyId,
          babyName: context.babyName,
        },
        confidence: "HIGH",
        dataSufficiency: "INSUFFICIENT",
      };
    }
  }

  // 4. GROWTH & MILESTONES QUERY
  if (q.includes("grow") || q.includes("weight") || q.includes("length") || q.includes("milestone") || q.includes("height")) {
    return {
      answer: `${urgentBannerText}📏 **Baby Growth & Milestones Summary (${context.babyName}, ${context.babyAgeFormatted}):**\n\n- **Birth Weight:** ${context.birthWeightKg ? `${context.birthWeightKg} kg` : "Not recorded"}\n- **Birth Length:** ${context.birthLengthCm ? `${context.birthLengthCm} cm` : "Not recorded"}\n- **Latest Recorded Weight (F27):** ${context.latestWeightKg ? `${context.latestWeightKg} kg` : "No recent growth record"}\n- **Latest Recorded Length (F27):** ${context.latestLengthCm ? `${context.latestLengthCm} cm` : "No recent growth record"}\n- **Milestones:** ${context.milestonesObservedCount} observed milestones logged in Feature 27.\n\n*Note: "Not yet observed" milestones are simply not yet logged and do not indicate a developmental delay.*`,
      responseType: "GROWTH_SUMMARY",
      facts: [
        {
          tag: "RECORDED_FACT",
          label: "Birth Measurements",
          text: `Weight: ${context.birthWeightKg || "N/A"}kg, Length: ${context.birthLengthCm || "N/A"}cm`,
        },
        {
          tag: "RECORDED_FACT",
          label: "Latest Recorded Growth (F27)",
          text: `Weight: ${context.latestWeightKg || "N/A"}kg, Length: ${context.latestLengthCm || "N/A"}cm`,
        },
      ],
      observations: [`Milestones observed: ${context.milestonesObservedCount}`],
      safetyStatus: isUrgent ? "URGENT_ATTENTION" : "NO_CONCERNS",
      recommendedActions: isUrgent
        ? urgentActions
        : [
            {
              title: "View Growth & Milestones",
              description: "Review physical measurements and developmental checkmarks",
              targetPage: "baby-growth" as PageView,
              buttonText: "Open Growth Hub",
            },
          ],
      sourceFeatures: ["Feature 03 Baby Care", "Feature 27 Growth & Milestones"],
      whyAmISeeingThis: {
        sourceFeatures: ["F03 Baby Profile", "F27 Baby Growth & Milestones"],
        dataPointsUsed: ["Birth Weight/Length", "Latest Recorded Growth", "Milestone Observations"],
        timeRange: "Birth to Present",
        babyId: context.selectedBabyId,
        babyName: context.babyName,
      },
      confidence: "HIGH",
      dataSufficiency: "FULL",
      isUrgentOverride: isUrgent,
    };
  }

  // 5. VACCINATION QUERY (Uses F28 Schedule Engine authority)
  if (q.includes("vaccin") || q.includes("shot") || q.includes("immun") || q.includes("dose")) {
    return {
      answer: `${urgentBannerText}💉 **Vaccination Status (F28 Schedule Engine Authority):**\n\n- **Completed Vaccinations:** ${context.completedVaccinesCount} dose administration records.\n- **Upcoming / Due:** ${context.upcomingVaccinesCount} upcoming doses according to F28 schedule.\n- **Next Scheduled Vaccine:** ${context.nextVaccineName || "No pending vaccines due currently"}${context.nextVaccineDueDate ? ` (Estimated due: ${context.nextVaccineDueDate})` : ""}.\n\n*F28 Vaccination Tracking is your primary authority for immunization dates and clinician verification.*`,
      responseType: "VACCINATION_SUMMARY",
      facts: [
        {
          tag: "RECORDED_FACT",
          label: "F28 Vaccine Authority",
          text: `${context.completedVaccinesCount} completed, Next: ${context.nextVaccineName || "None"}`,
        },
      ],
      observations: [`Vaccine schedule evaluated via Feature 28`],
      safetyStatus: isUrgent ? "URGENT_ATTENTION" : "NO_CONCERNS",
      recommendedActions: isUrgent
        ? urgentActions
        : [
            {
              title: "View Vaccination Timeline",
              description: "Inspect upcoming vaccine doses and administration records",
              targetPage: "vaccination-tracking" as PageView,
              buttonText: "Open Vaccine Care",
            },
          ],
      sourceFeatures: ["Feature 28 Vaccination Tracking"],
      whyAmISeeingThis: {
        sourceFeatures: ["F28 Vaccination Tracking"],
        dataPointsUsed: ["F28 UIP Vaccine Schedule", "Administration Records", "Baby Birth Date"],
        timeRange: "Immunization Timeline",
        babyId: context.selectedBabyId,
        babyName: context.babyName,
      },
      confidence: "HIGH",
      dataSufficiency: "FULL",
      isUrgentOverride: isUrgent,
    };
  }

  // 6. PEDIATRICIAN PREPARATION QUERY
  if (q.includes("doctor") || q.includes("pediatrician") || q.includes("pedia") || q.includes("tell") || q.includes("brief")) {
    return {
      answer: `${urgentBannerText}🩺 **Pediatrician Discussion Brief (${context.babyName}):**\n\nKey points to review with your pediatrician:\n\n1. **Growth Progress:** Birth Weight (${context.birthWeightKg || "N/A"}kg) vs Latest Recorded Weight (${context.latestWeightKg || "Not recorded"}).\n2. **Feeding & Diapers:** ${context.feedingSessions24h} feeding sessions and ${context.diaperEvents24h} diaper entries recorded today.\n3. **Vaccinations:** ${context.completedVaccinesCount} completed doses logged; next due is ${context.nextVaccineName || "routine checkup"}.\n4. **Safety & Concerns:** ${isUrgent ? `🚨 Urgent finding: ${context.urgentSafetyMessage}` : "No immediate F4 safety flags."}`,
      responseType: "PEDIATRIC_PREPARATION",
      facts: [
        {
          tag: isUrgent ? "SAFETY_ALERT" : "RECORDED_FACT",
          label: isUrgent ? "Authoritative F4 Alert" : "Pediatric Brief",
          text: isUrgent ? (context.urgentSafetyMessage || "Urgent flag active") : `Age: ${context.babyAgeFormatted}`,
        },
      ],
      observations: ["Synthesized pediatric brief from F10, F11, F27, F28"],
      safetyStatus: isUrgent ? "URGENT_ATTENTION" : "NO_CONCERNS",
      recommendedActions: isUrgent
        ? urgentActions
        : [
            {
              title: "Open Doctor Brief Builder",
              description: "Generate clinical summary for pediatrician appointment",
              targetPage: "doctor-brief" as PageView,
              buttonText: "Open Doctor Brief",
            },
          ],
      sourceFeatures: ["Feature 18 Doctor Brief", "Feature 27 Growth", "Feature 28 Vaccination"],
      whyAmISeeingThis: {
        sourceFeatures: ["F18 Doctor Brief", "F27 Growth", "F28 Vaccination", "F10 Feeding", "F11 Diapers"],
        dataPointsUsed: ["Pediatric Brief Data", "Growth Summary", "Vaccine Schedule"],
        timeRange: "Birth to Present",
        babyId: context.selectedBabyId,
        babyName: context.babyName,
      },
      confidence: "HIGH",
      dataSufficiency: "FULL",
      isUrgentOverride: isUrgent,
    };
  }

  // DEFAULT HOLISTIC BABY CARE SUMMARY
  return {
    answer: `${urgentBannerText}🌸 **Baby Care Journey Summary (${context.babyName}, ${context.babyAgeFormatted}):**\n\n- **Age:** ${context.babyAgeFormatted}\n- **Birth Weight:** ${context.birthWeightKg ? `${context.birthWeightKg} kg` : "Not recorded"}\n- **Latest Weight (F27):** ${context.latestWeightKg ? `${context.latestWeightKg} kg` : "No recent growth record"}\n- **24h Feeding:** ${context.feedingSessions24h} recorded sessions\n- **24h Diapers:** ${context.diaperEvents24h} total (${context.wetDiapers24h} wet, ${context.dirtyDiapers24h} dirty)\n- **24h Sleep:** ${context.sleepHours24h ? `${context.sleepHours24h.toFixed(1)}h` : "Not recorded"}\n- **Vaccinations:** ${context.completedVaccinesCount} completed, Next: ${context.nextVaccineName || "Up to date"}\n- **Safety Status:** ${isUrgent ? "🚨 URGENT ATTENTION (F4 Safety Flag)" : "🟢 Clear (No immediate baby safety concerns)"}`,
    responseType: "SUMMARY",
    facts: [
      {
        tag: isUrgent ? "SAFETY_ALERT" : "RECORDED_FACT",
        label: isUrgent ? "Authoritative F4 Alert" : "Baby Age",
        text: isUrgent ? (context.urgentSafetyMessage || "Urgent safety flag active") : context.babyAgeFormatted,
      },
      {
        tag: "RECORDED_FACT",
        label: "Growth Overview",
        text: `Birth: ${context.birthWeightKg || "N/A"}kg • Latest: ${context.latestWeightKg || "N/A"}kg`,
      },
    ],
    observations: [
      `Baby Age: ${context.babyAgeFormatted}`,
      `Safety Status: ${context.safetyStatus}`,
    ],
    safetyStatus: isUrgent ? "URGENT_ATTENTION" : "NO_CONCERNS",
    recommendedActions: isUrgent
      ? urgentActions
      : [
          {
            title: "View Care Coordination Hub",
            description: "Inspect baby care tasks and provider follow-ups",
            targetPage: "care-coordination" as PageView,
            buttonText: "Open Care Coordination",
          },
        ],
    sourceFeatures: ["Feature 03 Baby Care", "Feature 10 Feeding", "Feature 11 Diapers", "Feature 13 Sleep", "Feature 27 Growth", "Feature 28 Vaccination"],
    whyAmISeeingThis: {
      sourceFeatures: ["F03 Baby Profile", "F10 Feeding", "F11 Diapers", "F13 Sleep", "F27 Growth", "F28 Vaccination"],
      dataPointsUsed: ["Birth Date", "24h Feeding", "24h Diapers", "24h Sleep", "Growth Summary", "Vaccine Schedule"],
      timeRange: "Birth to Present",
      babyId: context.selectedBabyId,
      babyName: context.babyName,
    },
    confidence: "HIGH",
    dataSufficiency: context.hasSufficientData ? "FULL" : "PARTIAL",
    isUrgentOverride: isUrgent,
  };
}

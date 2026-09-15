import {
  MotherRecoveryContext,
  MotherAgentResponse,
  MotherAgentAction,
  MotherAgentFact,
  DataRationale,
  PageView,
  PostpartumProfile,
  MotherRecoveryLog,
  PainLog,
  BleedingLog,
  WoundLog,
  BreastfeedingLog,
  PumpingLog,
  MotherSleepLog,
  MotherMoodWellbeingLog,
  MotherMealLog,
  MotherMedicationItem,
  BabyProfileData,
} from "../types";
import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
  getRecoveryStage,
} from "../utils/postpartumUtils";
import { evaluateSafetyShield } from "../utils/safetyShieldEngine";
import { analyzeTrendsAndPatterns } from "../utils/trendPatternEngine";
import { analyzeAnomalies } from "../utils/anomalyDetectionEngine";
import { getStoredFollowUpThreads } from "../utils/followUpContinuityEngine";
import { queryLongitudinalHistory } from "../utils/aiMemoryHistoryEngine";

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * 1. Query Intent Classifier & Context Minimizer
 * Extracts MINIMUM relevant feature data based on question intent.
 */
export function buildMotherRecoveryContext(userQuery: string): MotherRecoveryContext {
  const queryLower = (userQuery || "").toLowerCase();

  // Read Core Postpartum Profile (F01)
  const profile = loadFromStorage<PostpartumProfile | null>("bloomnest_postpartum_profile_v1", null);
  const deliveryDate = profile?.deliveryDate || new Date().toISOString();
  const deliveryType = profile?.deliveryType || "vaginal";
  const postpartumDay = calculatePostpartumDay(deliveryDate);
  const postpartumWeek = calculatePostpartumWeek(postpartumDay);
  const stageInfo = getRecoveryStage(postpartumDay);

  // Read Feature Logs
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
  const babyProfile = loadFromStorage<BabyProfileData | null>("bloomnest_baby_profile_v1", null);

  // Evaluate Authoritative Safety Status (F04)
  const safetyAssessment = evaluateSafetyShield(
    profile,
    motherLogs,
    babyProfile,
    bleedingLogs,
    painLogs,
    woundLogs,
    breastfeedingLogs,
    pumpingLogs,
    [],
    [],
    sleepLogs,
    [],
    [],
    moodLogs,
    mealLogs,
    [],
    medicationItems,
    [],
    []
  );

  // Determine Authoritative Safety Status
  const activeIssues = [...safetyAssessment.motherIssues, ...safetyAssessment.babyIssues];
  const urgentIssue = activeIssues.find((i) => i.severity === "URGENT");
  const safetyStatus =
    safetyAssessment.overallStatus === "URGENT"
      ? "URGENT_ATTENTION"
      : safetyAssessment.overallStatus === "ATTENTION"
      ? "ATTENTION_NEEDED"
      : "NO_CONCERNS";

  // Retrieve Query-Specific F29 Memories
  const queryMatchedMemories = queryLongitudinalHistory(userQuery);

  // Read Trends & Anomalies
  const trendAnalysis = analyzeTrendsAndPatterns(7);
  const anomalyAnalysis = analyzeAnomalies({
    profile,
    painLogs,
    bleedingLogs,
    woundLogs,
    motherSleepLogs: sleepLogs,
    motherMoodLogs: moodLogs,
  });
  const followUps = getStoredFollowUpThreads();

  const latestRecovery = motherLogs[0];
  const latestBleeding = bleedingLogs[0];
  const latestPain = painLogs[0];
  const latestWound = woundLogs[0];
  const latestSleep = sleepLogs[0];
  const latestMood = moodLogs[0];

  // Calculate 24h totals
  const todayStr = new Date().toISOString().split("T")[0];
  const breastfeedingMinutesToday = breastfeedingLogs
    .filter((n) => n.date === todayStr)
    .reduce((sum, n) => sum + (n.durationMinutes || 0), 0);

  const pumpingVolumeMlToday = pumpingLogs
    .filter((p) => p.date === todayStr)
    .reduce((sum, p) => sum + (p.totalVolumeMl || 0), 0);

  const sleepHours24h = sleepLogs
    .filter((s) => s.date === todayStr)
    .reduce((sum, s) => sum + ((s.durationMinutes || 0) / 60), 0);

  const activeMeds = medicationItems.filter((m) => m.status === "active");

  const totalLogEntriesCount =
    motherLogs.length +
    bleedingLogs.length +
    painLogs.length +
    woundLogs.length +
    sleepLogs.length +
    moodLogs.length;

  const hasSufficientData = totalLogEntriesCount > 0;

  // Build Sanitized Minimal Context Summary Text
  let sanitizedSummaryText = `Postpartum Day ${postpartumDay} (${stageInfo.title}, ${deliveryType} delivery). `;

  if (queryLower.includes("pain") || queryLower.includes("ache") || queryLower.includes("cramp")) {
    if (latestPain) {
      sanitizedSummaryText += `Pain: ${latestPain.pain}/10 (${latestPain.location || "General"}, ${latestPain.type || "Aching"}). `;
    } else {
      sanitizedSummaryText += `Pain: No recent pain entries logged. `;
    }
  }

  if (queryLower.includes("sleep") || queryLower.includes("tired") || queryLower.includes("fatigue")) {
    if (latestSleep) {
      sanitizedSummaryText += `Sleep: ${sleepHours24h.toFixed(1)}h in last 24h, Quality: ${latestSleep.quality || "N/A"}. `;
    } else {
      sanitizedSummaryText += `Sleep: No recent sleep logs recorded. `;
    }
  }

  if (queryLower.includes("bleeding") || queryLower.includes("lochia") || queryLower.includes("pad")) {
    if (latestBleeding) {
      sanitizedSummaryText += `Bleeding: ${latestBleeding.amount} (${latestBleeding.color}), Trend: ${latestBleeding.trend}. `;
    } else {
      sanitizedSummaryText += `Bleeding: No lochia logs recorded. `;
    }
  }

  if (queryLower.includes("mood") || queryLower.includes("anxious") || queryLower.includes("overwhelmed") || queryLower.includes("sad")) {
    if (latestMood) {
      sanitizedSummaryText += `Mood: States "${latestMood.emotionalStates.join(", ")}", Stress: ${latestMood.stressLevel}/10, Worry: ${latestMood.worryLevel}/10. `;
    } else {
      sanitizedSummaryText += `Mood: No recent mood state recorded. `;
    }
  }

  if (queryLower.includes("medication") || queryLower.includes("medicine") || queryLower.includes("pill")) {
    sanitizedSummaryText += `Medications: ${activeMeds.length} active prescriptions recorded. `;
  }

  sanitizedSummaryText += `F4 Safety Status: ${safetyStatus}. Active Trends: ${trendAnalysis.singleModuleTrends.length}. Active Anomalies: ${anomalyAnalysis.anomalies.length}.`;

  return {
    postpartumDay,
    postpartumWeek,
    recoveryStage: stageInfo.title,
    deliveryType,
    hasSufficientData,
    safetyStatus,
    activeSafetyAlertsCount: activeIssues.length,
    urgentSafetyMessage: urgentIssue?.detected || undefined,
    recentRecoveryRating: latestRecovery?.overallRecovery === "Better" ? 8 : latestRecovery?.overallRecovery === "Same" ? 6 : 4,
    recentEnergyLevel: latestRecovery?.energy === "Good" ? 8 : latestRecovery?.energy === "Medium" ? 5 : 2,
    recentPainScore: latestPain?.pain,
    recentPainLocation: latestPain?.location,
    recentLochiaStage: latestBleeding?.amount,
    recentPadsIn2Hours: latestBleeding?.padCount,
    woundAppearance: latestWound?.appearance,
    breastfeedingMinutesToday,
    pumpingVolumeMlToday,
    sleepHours24h,
    recentFatigueLevel: latestSleep ? (latestSleep.quality === "Poor" ? 8 : 4) : undefined,
    recentMoodState: latestMood?.emotionalStates[0] || undefined,
    waterMlToday: 0,
    medicationsTakenCount: activeMeds.length,
    activeMedicationsCount: activeMeds.length,
    activeTrendsCount: trendAnalysis.singleModuleTrends.length,
    activeAnomaliesCount: anomalyAnalysis.anomalies.length,
    openFollowUpsCount: followUps.filter((f) => f.status !== "resolved").length,
    activeCareTasksCount: 0,
    queryMatchedMemoriesCount: queryMatchedMemories.matches.length,
    sanitizedSummaryText,
  };
}

/**
 * 2. Deterministic Recovery-Context Fallback
 * Synthesizes recorded facts, existing F4 safety rules, F19 trends, and F20 anomalies.
 * Does NOT create new clinical rules.
 */
export function generateDeterministicRecoveryFallback(
  userQuery: string,
  context: MotherRecoveryContext
): MotherAgentResponse {
  const q = (userQuery || "").toLowerCase();
  const isUrgent = context.safetyStatus === "URGENT_ATTENTION";

  // Authoritative F4 Safety Banner (Prepended to answer when URGENT_ATTENTION is active)
  const urgentBannerText = isUrgent
    ? `🚨 **CLINICAL SAFETY ALERT (Feature 04 Safety Shield):**\n\nYour recent health logs indicate an urgent safety pattern requiring prompt medical attention.\n\n- **Safety Finding:** ${context.urgentSafetyMessage || "Severe physiological symptom (e.g. Pain 10/10) flagged by F4 Safety Shield."}\n- **Recommended Action:** Please contact your primary OB-GYN or visit your maternity triage center without delay. Do not wait for symptoms to escalate.\n\n---\n\n`
    : "";

  const urgentActions: MotherAgentAction[] = [
    {
      title: "Review Clinical Safety Shield",
      description: "Inspect active F4 clinical safety rules and emergency contacts",
      targetPage: "safety" as PageView,
      buttonText: "Open Safety Shield",
    },
    {
      title: "Contact Emergency Triage",
      description: "Call emergency contact or maternity hospital link",
      targetPage: "emergency-contacts" as PageView,
      buttonText: "Open SOS Contacts",
    },
  ];

  // Handle specific question domains dynamically
  if (q.includes("blood pressure") || q.includes("bp")) {
    return {
      answer: `${urgentBannerText}🌸 **Blood Pressure Log Check:**\n\nI don't have a recorded blood-pressure value for yesterday or today in your postpartum logs.\n\nIf you have recorded vitals in the Health Tracker, your readings remain accessible there. If you experience dizziness, visual blurring, or severe headaches, please log your blood pressure or contact your clinician.`,
      responseType: "INSUFFICIENT_DATA",
      facts: [
        {
          tag: isUrgent ? "SAFETY_ALERT" : "RECORDED_FACT",
          label: isUrgent ? "Authoritative F4 Alert" : "Vitals Log Check",
          text: isUrgent ? (context.urgentSafetyMessage || "Urgent safety flag active") : "No BP entry logged for the requested date.",
        },
      ],
      observations: ["No recorded blood pressure entry found"],
      safetyStatus: isUrgent ? "URGENT_ATTENTION" : "NO_CONCERNS",
      recommendedActions: isUrgent
        ? urgentActions
        : [
            {
              title: "Log Health Vitals",
              description: "Record blood pressure, pulse, and temperature",
              targetPage: "health-tracker" as PageView,
              buttonText: "Open Vitals Tracker",
            },
          ],
      sourceFeatures: ["Feature 02 Mother Recovery", "Health Tracker"],
      whyAmISeeingThis: {
        sourceFeatures: isUrgent ? ["F04 Safety Shield", "Health Tracker Vitals"] : ["Health Tracker Vitals"],
        dataPointsUsed: ["Blood Pressure Field"],
        timeRange: "Last 48 Hours",
      },
      confidence: "HIGH",
      dataSufficiency: "INSUFFICIENT",
      isUrgentOverride: isUrgent,
    };
  }

  if (q.includes("focus") || q.includes("do today") || q.includes("priority") || q.includes("priorities")) {
    return {
      answer: `${urgentBannerText}🌸 **Today's Priorities (Day ${context.postpartumDay} - ${context.recoveryStage}):**\n\n${
        isUrgent
          ? "1. **🚨 URGENT PRIORITY:** Contact your primary OB-GYN clinic or emergency triage immediately regarding your recorded severe pain score.\n2. **Physical Rest:** Lay flat whenever possible to support uterine involution and pelvic healing.\n3. **Hydration & Nourishment:** Maintain steady fluid intake and consume fiber-rich warm meals."
          : "1. **Physical Healing:** Prioritize rest while resting or whenever baby sleeps.\n2. **Symptom Tracking:** Log any changes in lochia bleeding or pain levels.\n3. **Hydration & Meals:** Consume warm, fiber-rich foods and stay hydrated."
      }`,
      responseType: "QUESTION_ANSWER",
      facts: [
        {
          tag: isUrgent ? "SAFETY_ALERT" : "RECORDED_FACT",
          label: isUrgent ? "Authoritative F4 Alert" : "Postpartum Stage",
          text: isUrgent ? (context.urgentSafetyMessage || "Urgent safety flag active") : `Day ${context.postpartumDay} (${context.recoveryStage})`,
        },
      ],
      observations: [`Postpartum Day ${context.postpartumDay} focus guidance generated`],
      safetyStatus: isUrgent ? "URGENT_ATTENTION" : "NO_CONCERNS",
      recommendedActions: isUrgent
        ? urgentActions
        : [
            {
              title: "View Personalized Daily Plan",
              description: "Inspect tailored daily tasks and rest routine",
              targetPage: "daily-plan" as PageView,
              buttonText: "Open Daily Plan",
            },
          ],
      sourceFeatures: ["Feature 01 Postpartum Care", "Feature 21 Daily Plan"],
      whyAmISeeingThis: {
        sourceFeatures: isUrgent ? ["F04 Safety Shield", "F01 Care Context", "F21 Daily Plan"] : ["F01 Care Context", "F21 Daily Plan"],
        dataPointsUsed: ["Postpartum Day", "Recovery Stage", "Safety Status"],
        timeRange: "Today",
      },
      confidence: "HIGH",
      dataSufficiency: "FULL",
      isUrgentOverride: isUrgent,
    };
  }

  if (q.includes("doctor") || q.includes("tell") || q.includes("speak") || q.includes("physician") || q.includes("ob-gyn") || q.includes("brief")) {
    return {
      answer: `${urgentBannerText}🌸 **Doctor Discussion Checklist (Day ${context.postpartumDay}):**\n\nKey points to discuss with your healthcare provider:\n\n1. **${isUrgent ? "🚨 Severe Pain Finding:" : "Pain Level:"}** Share your logged pain score (${context.recentPainScore !== undefined ? `${context.recentPainScore}/10` : "Not recorded"}) and location (${context.recentPainLocation || "General"}).\n2. **Delivery & Stage:** Inform provider you are in Day ${context.postpartumDay} (${context.recoveryStage}, ${context.deliveryType} delivery).\n3. **Lochia & Wound:** Mention lochia bleeding stage (${context.recentLochiaStage || "Not recorded"}) and any incision tenderness.\n4. **Medications:** Review current active medications (${context.activeMedicationsCount} active prescriptions logged).`,
      responseType: "QUESTION_ANSWER",
      facts: [
        {
          tag: isUrgent ? "SAFETY_ALERT" : "RECORDED_FACT",
          label: isUrgent ? "Authoritative F4 Alert" : "Doctor Brief Context",
          text: isUrgent ? (context.urgentSafetyMessage || "Urgent safety flag active") : `Day ${context.postpartumDay} (${context.deliveryType})`,
        },
      ],
      observations: ["Generated clinician discussion points from recorded features"],
      safetyStatus: isUrgent ? "URGENT_ATTENTION" : "NO_CONCERNS",
      recommendedActions: isUrgent
        ? urgentActions
        : [
            {
              title: "Open Doctor Brief Builder",
              description: "Generate structured clinical summary for your appointment",
              targetPage: "doctor-brief" as PageView,
              buttonText: "Open Doctor Brief",
            },
          ],
      sourceFeatures: ["Feature 18 Doctor Brief", "Feature 06 Pain", "Feature 05 Bleeding"],
      whyAmISeeingThis: {
        sourceFeatures: isUrgent ? ["F04 Safety Shield", "F18 Doctor Brief", "F06 Pain", "F05 Bleeding"] : ["F18 Doctor Brief", "F06 Pain", "F05 Bleeding"],
        dataPointsUsed: ["Pain Logs", "Bleeding Logs", "Active Medications"],
        timeRange: "Postpartum Day 0 to Present",
      },
      confidence: "HIGH",
      dataSufficiency: "FULL",
      isUrgentOverride: isUrgent,
    };
  }

  if (q.includes("pain") || q.includes("ache") || q.includes("cramp")) {
    return {
      answer: `${urgentBannerText}🌸 **Pain & Recovery Status (Day ${context.postpartumDay}):**\n\nYour most recent logged pain score is **${context.recentPainScore !== undefined ? `${context.recentPainScore}/10` : "Not recorded"}** (${context.recentPainLocation || "General area"}).\n\n- **Recorded Fact:** Pain score recorded at ${context.recentPainScore !== undefined ? `${context.recentPainScore}/10` : "N/A"}.\n- **Recovery Context:** Day ${context.postpartumDay} (${context.recoveryStage}).\n- **Guidance:** ${isUrgent ? "Severe pain (8/10 or higher) requires prompt medical evaluation." : "Continue taking prescribed pain relief as advised by your doctor."}`,
      responseType: "QUESTION_ANSWER",
      facts: [
        {
          tag: isUrgent ? "SAFETY_ALERT" : "RECORDED_FACT",
          label: isUrgent ? "Authoritative F4 Alert" : "Pain Score",
          text: isUrgent ? (context.urgentSafetyMessage || "Urgent safety flag active") : `${context.recentPainScore !== undefined ? `${context.recentPainScore}/10` : "Not recorded"} (${context.recentPainLocation || "General"})`,
        },
      ],
      observations: [`Pain logged at ${context.recentPainScore}/10`],
      safetyStatus: isUrgent ? "URGENT_ATTENTION" : "NO_CONCERNS",
      recommendedActions: isUrgent
        ? urgentActions
        : [
            {
              title: "View Pain Monitoring Logs",
              description: "Review pain location, intensity, and relief measures",
              targetPage: "pain" as PageView,
              buttonText: "Open Pain Care",
            },
          ],
      sourceFeatures: ["Feature 06 Pain & Recovery Monitoring"],
      whyAmISeeingThis: {
        sourceFeatures: isUrgent ? ["F04 Safety Shield", "F06 Pain Monitoring"] : ["F06 Pain Monitoring"],
        dataPointsUsed: ["Latest Pain Score", "Pain Location"],
        timeRange: "Recent Logs",
      },
      confidence: "HIGH",
      dataSufficiency: "FULL",
      isUrgentOverride: isUrgent,
    };
  }

  if (q.includes("sleep") || q.includes("tired") || q.includes("fatigue")) {
    return {
      answer: `${urgentBannerText}🌸 **Sleep & Fatigue Overview (Day ${context.postpartumDay}):**\n\nYou have **${context.sleepHours24h !== undefined ? context.sleepHours24h.toFixed(1) : "0.0"} hours** of total sleep recorded in the last 24 hours.\n\n- **Recorded Fact:** 24h total sleep is ${context.sleepHours24h !== undefined ? context.sleepHours24h.toFixed(1) : "0.0"} hours.\n- **Fatigue Observation:** Shorter sleep stretches correlate with fatigue. Prioritize resting whenever baby naps today.`,
      responseType: "QUESTION_ANSWER",
      facts: [
        {
          tag: isUrgent ? "SAFETY_ALERT" : "RECORDED_FACT",
          label: isUrgent ? "Authoritative F4 Alert" : "24h Sleep Duration",
          text: isUrgent ? (context.urgentSafetyMessage || "Urgent safety flag active") : `${context.sleepHours24h !== undefined ? context.sleepHours24h.toFixed(1) : "0.0"} hours`,
        },
      ],
      observations: [`24h sleep duration: ${context.sleepHours24h !== undefined ? context.sleepHours24h.toFixed(1) : "0.0"}h`],
      safetyStatus: isUrgent ? "URGENT_ATTENTION" : "NO_CONCERNS",
      recommendedActions: isUrgent
        ? urgentActions
        : [
            {
              title: "View Mother Sleep & Fatigue",
              description: "Review sleep logs, nap times, and rest quality",
              targetPage: "sleep-fatigue" as PageView,
              buttonText: "Open Sleep Tracker",
            },
          ],
      sourceFeatures: ["Feature 12 Mother Sleep & Fatigue"],
      whyAmISeeingThis: {
        sourceFeatures: isUrgent ? ["F04 Safety Shield", "F12 Mother Sleep & Fatigue"] : ["F12 Mother Sleep & Fatigue"],
        dataPointsUsed: ["24h Sleep Duration", "Fatigue Rating"],
        timeRange: "Last 24 Hours",
      },
      confidence: "HIGH",
      dataSufficiency: "FULL",
      isUrgentOverride: isUrgent,
    };
  }

  // Default Recovery Journey / "ennoda recovery epdi iruku" / Holistic Summary Handler
  return {
    answer: `${urgentBannerText}🌸 **Mother Recovery Journey Summary (Day ${context.postpartumDay}):**\n\nYou are on **Day ${context.postpartumDay}** of your postpartum recovery (${context.recoveryStage}, ${context.deliveryType} delivery).\n\n- **Recovery Rating:** ${context.recentRecoveryRating || "N/A"}/10\n- **Energy Level:** ${context.recentEnergyLevel || "N/A"}/10\n- **Recent Pain:** ${context.recentPainScore !== undefined ? `${context.recentPainScore}/10` : "Not recorded"}\n- **24h Sleep:** ${context.sleepHours24h ? `${context.sleepHours24h.toFixed(1)}h` : "Not recorded"}\n- **Safety Status:** ${isUrgent ? "🚨 URGENT ATTENTION (Severe Pain Flagged)" : "🟢 Reassuring (No immediate safety concerns)"}\n\nContinue resting, staying hydrated, and following your care routine.`,
    responseType: "SUMMARY",
    facts: [
      {
        tag: isUrgent ? "SAFETY_ALERT" : "RECORDED_FACT",
        label: isUrgent ? "Authoritative F4 Alert" : "Postpartum Day",
        text: isUrgent ? (context.urgentSafetyMessage || "Urgent safety flag active") : `Day ${context.postpartumDay} (${context.recoveryStage})`,
      },
      {
        tag: "CALCULATED_OBSERVATION",
        label: "Overall Recovery Score",
        text: `${context.recentRecoveryRating || "N/A"}/10`,
      },
    ],
    observations: [
      `Postpartum Day ${context.postpartumDay}`,
      `Safety Status: ${context.safetyStatus}`,
    ],
    safetyStatus: isUrgent ? "URGENT_ATTENTION" : "NO_CONCERNS",
    recommendedActions: isUrgent
      ? urgentActions
      : [
          {
            title: "View Mother Physical Recovery",
            description: "Inspect overall energy, mobility, and recovery trends",
            targetPage: "recovery" as PageView,
            buttonText: "Open Recovery Hub",
          },
          {
            title: "Review Care Coordination",
            description: "Inspect upcoming care tasks and doctor brief prep",
            targetPage: "care-coordination" as PageView,
            buttonText: "Open Care Coordination",
          },
        ],
    sourceFeatures: ["Feature 01 Postpartum Care", "Feature 02 Mother Recovery", "Feature 04 Safety Shield"],
    whyAmISeeingThis: {
      sourceFeatures: isUrgent ? ["F04 Safety Shield", "F01 Postpartum Care", "F02 Mother Recovery", "F12 Sleep", "F06 Pain"] : ["F01 Postpartum Care", "F02 Mother Recovery", "F04 Safety Shield", "F12 Sleep", "F06 Pain"],
      dataPointsUsed: ["Delivery Date", "Recovery Logs", "Safety Assessment", "24h Sleep", "Pain Logs"],
      timeRange: "Postpartum Day 0 to Present",
    },
    confidence: "HIGH",
    dataSufficiency: context.hasSufficientData ? "FULL" : "PARTIAL",
    isUrgentOverride: isUrgent,
  };
}

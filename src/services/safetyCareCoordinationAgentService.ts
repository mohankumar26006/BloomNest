import {
  SafetyCoordinationContext,
  SafetyCoordinationAgentResponse,
  SafetyCoordinationResponseType,
  SafetyCoordinationAction,
  SafetyCoordinationFact,
  SafetyCoordinationRationale,
  PageView,
  PostpartumProfile,
  MotherRecoveryLog,
  PainLog,
  BleedingLog,
  WoundLog,
  MotherSleepLog,
  MotherMoodWellbeingLog,
  MotherMedicationItem,
  BabyProfileData,
  MotherBabyAppointment,
  SafetyStatusTier,
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
import { evaluateBabyVaccinationSummary } from "../utils/vaccinationTrackingEngine";
import { getCareCoordinationItems } from "../utils/careCoordinationEngine";
import { generatePersonalizedDailyPlan } from "../utils/dailyPlanEngine";
import { evaluateContextReminders } from "../utils/contextReminderEngine";

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * 1. Focused Safety & Care Coordination Context Builder
 * Reads outputs across F1-F30 without recalculating or duplicating feature logic.
 */
export function buildSafetyCoordinationContext(
  userQuery: string,
  selectedBabyId?: string
): SafetyCoordinationContext {
  const queryLower = (userQuery || "").toLowerCase();

  // Read Core Postpartum Profile (F01)
  const profile = loadFromStorage<PostpartumProfile | null>("bloomnest_postpartum_profile_v1", null);
  const deliveryDate = profile?.deliveryDate || new Date().toISOString();
  const postpartumDay = calculatePostpartumDay(deliveryDate);
  const postpartumWeek = calculatePostpartumWeek(postpartumDay);
  const stageInfo = getRecoveryStage(postpartumDay);

  // Read Mother Logs
  const motherLogs = loadFromStorage<MotherRecoveryLog[]>("bloomnest_mother_recovery_logs_v1", []);
  const bleedingLogs = loadFromStorage<BleedingLog[]>("bloomnest_bleeding_logs_v1", []);
  const painLogs = loadFromStorage<PainLog[]>("bloomnest_pain_logs_v1", []);
  const woundLogs = loadFromStorage<WoundLog[]>("bloomnest_wound_logs_v1", []);
  const sleepLogs = loadFromStorage<MotherSleepLog[]>("bloomnest_mother_sleep_logs_v1", []);
  const moodLogs = loadFromStorage<MotherMoodWellbeingLog[]>("bloomnest_mother_mood_logs_v1", []);
  const appointments = loadFromStorage<MotherBabyAppointment[]>("bloomnest_appointments_v1", []);

  // Read Baby Profiles (F02/F03)
  const babyProfiles = loadFromStorage<BabyProfileData[]>("bloomnest_baby_profiles_v1", []);
  let targetBaby: BabyProfileData | undefined = undefined;
  if (selectedBabyId) {
    targetBaby = babyProfiles.find((b) => b.id === selectedBabyId);
  } else if (babyProfiles.length > 0) {
    targetBaby = babyProfiles[0];
  } else {
    const single = loadFromStorage<BabyProfileData | null>("bloomnest_baby_profile_v1", null);
    if (single) targetBaby = single;
  }

  const babyName = targetBaby?.babyName || "Baby";
  const babyAgeFormatted = `${postpartumDay} days old`;

  // 1. Authoritative Safety Shield Assessment (F04)
  const safetyEval = evaluateSafetyShield(
    profile,
    motherLogs,
    targetBaby || null,
    bleedingLogs,
    painLogs,
    woundLogs,
    [],
    [],
    [],
    [],
    sleepLogs,
    [],
    [],
    moodLogs,
    [],
    [],
    [],
    [],
    appointments
  );

  const rawSafetyStatus = safetyEval?.overallStatus || "CLEAR";
  const safetyStatus =
    rawSafetyStatus === "URGENT"
      ? "URGENT_ATTENTION"
      : rawSafetyStatus === "ATTENTION"
      ? "NEEDS_ATTENTION"
      : "NO_CONCERNS";

  const allIssues = [...(safetyEval?.motherIssues || []), ...(safetyEval?.babyIssues || [])];
  const urgentIssue = allIssues.find((i) => i.severity === "URGENT");
  const urgentSafetyMessage =
    urgentIssue?.detected || urgentIssue?.title ||
    (safetyStatus === "URGENT_ATTENTION" ? "Physiological alert flagged by F4 Safety Shield." : undefined);

  // 2. Read Appointments (F17)
  const upcomingAppts = appointments.filter(
    (a) => new Date(a.date || "").getTime() >= Date.now() - 86400000
  );
  const nextAppt = upcomingAppts[0];
  const nextApptDateStr = nextAppt?.date ? `${nextAppt.date}${nextAppt.time ? ' ' + nextAppt.time : ''}` : undefined;

  // 3. Read Doctor Brief (F18)
  const doctorBriefRaw = localStorage.getItem("bloomnest_doctor_brief_v1");
  const hasDoctorBriefPrepared = Boolean(doctorBriefRaw && doctorBriefRaw.length > 20);

  // 4. Read Trends (F19) & Anomalies (F20)
  const trendsResult = analyzeTrendsAndPatterns(14);
  const anomalyResult = analyzeAnomalies({ profile });

  // 5. Read Daily Plan (F21) & Reminders (F22)
  const dailyPlan = generatePersonalizedDailyPlan({});
  const remindersResult = evaluateContextReminders({});

  // 6. Read Follow-up Threads (F24) & Care Coordination Items (F30)
  const followUpThreads = getStoredFollowUpThreads();
  const openFollowUps = followUpThreads.filter(
    (t) => t.status !== "resolved" && t.status !== "cancelled"
  );
  const latestFollowUp = openFollowUps[0];

  const careItems = getCareCoordinationItems();
  const openCareTasks = careItems.filter((i) => i.status !== "COMPLETED");

  // 7. Read Vaccines (F28 Schedule Authority)
  const vaccineSummary = evaluateBabyVaccinationSummary(
    targetBaby?.id || "default",
    babyName,
    deliveryDate
  );

  const nextVaccineTitle = vaccineSummary?.nextDueVaccine?.name || vaccineSummary?.nextDueVaccine?.fullTitle;

  // 8. Search Memory (F29)
  const memoryResult = queryLongitudinalHistory(userQuery);

  const hasSufficientData =
    Boolean(profile) || motherLogs.length > 0 || painLogs.length > 0 || openFollowUps.length > 0;

  const totalTrendsCount =
    (trendsResult?.singleModuleTrends?.length || 0) + (trendsResult?.crossModulePatterns?.length || 0);

  // Build sanitized summary text
  const summaryParts: string[] = [];
  summaryParts.push(`Postpartum Day ${postpartumDay} (${stageInfo.title}).`);
  summaryParts.push(`F4 Safety Status: ${safetyStatus}.`);
  if (urgentSafetyMessage) summaryParts.push(`Urgent Alert: ${urgentSafetyMessage}`);
  summaryParts.push(`Open Follow-ups (F24): ${openFollowUps.length}.`);
  summaryParts.push(`Upcoming Appointments (F17): ${upcomingAppts.length}.`);
  if (nextAppt) summaryParts.push(`Next Appt: ${nextAppt.title || nextAppt.providerName} on ${nextApptDateStr}.`);
  summaryParts.push(`Open Care Coordination Tasks (F30): ${openCareTasks.length}.`);
  summaryParts.push(`Active Trends (F19): ${totalTrendsCount}.`);
  summaryParts.push(`Active Anomalies (F20): ${anomalyResult?.anomalies?.length || 0}.`);
  if (nextVaccineTitle) summaryParts.push(`Next Vaccine (F28 Authority): ${nextVaccineTitle}.`);

  return {
    postpartumDay,
    postpartumWeek,
    recoveryStage: stageInfo.title,
    selectedBabyId: targetBaby?.id,
    babyName,
    babyAgeFormatted,
    safetyStatus,
    urgentSafetyMessage,
    activeSafetyAlertsCount: allIssues.length,
    upcomingAppointmentsCount: upcomingAppts.length,
    nextAppointmentTitle: nextAppt?.title || nextAppt?.providerName,
    nextAppointmentDate: nextApptDateStr,
    hasDoctorBriefPrepared,
    activeTrendsCount: totalTrendsCount,
    activeAnomaliesCount: anomalyResult?.anomalies?.length || 0,
    dailyPlanTopPriority: dailyPlan?.focusSummaryText,
    activeRemindersCount: remindersResult?.reminders?.length || 0,
    openFollowUpsCount: openFollowUps.length,
    latestFollowUpTitle: latestFollowUp?.title,
    nextVaccineName: nextVaccineTitle,
    nextVaccineDueDate: vaccineSummary?.nextDueDateStr,
    matchedMemoriesCount: memoryResult?.matches?.length || 0,
    openCareTasksCount: openCareTasks.length,
    hasSufficientData,
    sanitizedSummaryText: summaryParts.join(" "),
  };
}

/**
 * 2. Deterministic Safety & Care Coordination Fallback Engine
 * Handles 21 scenario query types deterministically without LLM dependency.
 */
export function generateDeterministicSafetyCoordinationFallback(
  userQuery: string,
  context: SafetyCoordinationContext
): SafetyCoordinationAgentResponse {
  const queryLower = (userQuery || "").toLowerCase();
  const isUrgent = context.safetyStatus === "URGENT_ATTENTION";

  // Base Facts
  const facts: SafetyCoordinationFact[] = [
    {
      tag: isUrgent ? "SAFETY_ALERT" : "RECORDED_FACT",
      label: "F4 Safety Shield",
      text: isUrgent ? `URGENT_ATTENTION: ${context.urgentSafetyMessage || "Physiological alert"}` : "No immediate urgent alerts",
    },
    {
      tag: "CALCULATED_OBSERVATION",
      label: "Timeline",
      text: `Postpartum Day ${context.postpartumDay} (${context.recoveryStage})`,
    },
    {
      tag: "RECORDED_FACT",
      label: "Open Follow-ups (F24)",
      text: `${context.openFollowUpsCount} active follow-up threads`,
    },
    {
      tag: "RECORDED_FACT",
      label: "Appointments (F17)",
      text: context.nextAppointmentTitle
        ? `Upcoming: ${context.nextAppointmentTitle} (${context.nextAppointmentDate || 'Scheduled'})`
        : "No upcoming appointments scheduled",
    },
  ];

  let answerText = "";
  let responseType: SafetyCoordinationResponseType = "PRIORITY_SUMMARY";
  let recommendedActions: SafetyCoordinationAction[] = [];

  // Urgent Safety Alert Prepending if F4 is URGENT_ATTENTION
  if (isUrgent) {
    answerText = `🚨 **CLINICAL SAFETY ALERT (Feature 04 Safety Shield):**\n` +
      `Your recorded recovery data has triggered an authoritative safety alert requiring prompt clinical evaluation.\n\n` +
      `- **Safety Finding:** ${context.urgentSafetyMessage || "Physiological symptom flag"}\n` +
      `- **Recommended Action:** Please review your Safety Shield guidance immediately and contact your OB-GYN, midwife, or maternity triage center without delay.\n\n---\n\n`;
  }

  // -------------------------------------------------------------
  // SCENARIO 21: Three-Agent Boundary Routing Test
  // -------------------------------------------------------------
  if (queryLower.includes("recovery and what should i do") || queryLower.includes("how is my recovery")) {
    responseType = "MOTHER_BABY_SUMMARY";
    answerText += `### 🌸 Mother Recovery & Care Coordination Overview\n\n` +
      `**From the Care Coordination Perspective (Agent 3):**\n` +
      `- F4 Safety Status: **${context.safetyStatus}**\n` +
      `- Active Follow-ups (F24): **${context.openFollowUpsCount}** open item(s)\n` +
      `- Upcoming Appointments (F17): **${context.upcomingAppointmentsCount}** scheduled\n\n` +
      `*For your detailed physical & emotional recovery trajectory (pain, lochia, sleep, mood), please switch to **Agent 1 (Mother & Recovery AI)**.*`;

    recommendedActions = [
      { title: "Mother & Recovery AI", description: "Get detailed physical & emotional recovery breakdown", targetPage: "mother-recovery-ai", buttonText: "Switch to Agent 1" },
      { title: "Care Coordination", description: "View open care tasks and provider follow-ups", targetPage: "care-coordination", buttonText: "Open Care Coordination" },
    ];
  } else if (queryLower.includes("baby doing and what needs") || queryLower.includes("how is my baby doing")) {
    responseType = "MOTHER_BABY_SUMMARY";
    answerText += `### 👶 Baby Care & Care Coordination Overview\n\n` +
      `**From the Care Coordination Perspective (Agent 3):**\n` +
      `- Scoped Baby: **${context.babyName || 'Baby'}** (${context.babyAgeFormatted || 'Newborn'})\n` +
      `- Next Vaccine (F28 Authority): **${context.nextVaccineName || 'Up to date'}**\n` +
      `- Open Care Tasks (F30): **${context.openCareTasksCount}** item(s)\n\n` +
      `*For your baby's detailed feeding logs, diaper counts, sleep patterns, and growth percentiles, please switch to **Agent 2 (Baby Care AI)**.*`;

    recommendedActions = [
      { title: "Baby Care AI", description: "Get detailed feeding, diaper, sleep, and growth breakdown", targetPage: "baby-care-ai", buttonText: "Switch to Agent 2" },
      { title: "Vaccination Tracking", description: "View F28 immunization schedule authority", targetPage: "vaccinations", buttonText: "Open Vaccines (F28)" },
    ];
  }
  // -------------------------------------------------------------
  // SCENARIO 10: Vaccine Schedule Authority Test
  // -------------------------------------------------------------
  else if (queryLower.includes("vaccine") || queryLower.includes("immunization")) {
    responseType = "VACCINATION_VERIFICATION";
    answerText += `### 💉 Vaccination Schedule Status (F28 Authority)\n\n` +
      `According to Feature 28 Vaccination Schedule Engine (the sole authority for immunization schedules):\n\n` +
      `- **Scoped Baby:** ${context.babyName || 'Baby'} (${context.babyAgeFormatted || 'Newborn'})\n` +
      `- **Next Due Vaccine:** ${context.nextVaccineName || 'All age-appropriate vaccines up to date'}\n` +
      `- **Due Window:** ${context.nextVaccineDueDate || 'According to pediatric schedule'}\n\n` +
      `*Note: Vaccine schedules are maintained strictly by Feature 28's verified engine.*`;

    recommendedActions = [
      { title: "Vaccination Tracking", description: "Open Feature 28 Schedule Engine", targetPage: "vaccinations", buttonText: "Open Vaccines (F28)" },
      { title: "Doctor Brief", description: "Add vaccine question to Doctor Brief", targetPage: "doctor-brief", buttonText: "Prepare Doctor Brief (F18)" },
    ];
  }
  // -------------------------------------------------------------
  // SCENARIO 5 & 12: Open Follow-ups & Continuity Test
  // -------------------------------------------------------------
  else if (queryLower.includes("follow-up") || queryLower.includes("follow up") || queryLower.includes("open concern")) {
    responseType = "FOLLOWUP_CONTINUITY";
    answerText += `### 🔄 Active Follow-ups & Continuity (F24)\n\n` +
      `Here is the current status of your recorded care threads:\n\n` +
      `- **Open Follow-up Threads:** ${context.openFollowUpsCount}\n` +
      `- **Latest Active Thread:** ${context.latestFollowUpTitle || 'No unresolved follow-up threads active'}\n` +
      `- **Safety Shield Baseline:** ${context.safetyStatus}\n\n` +
      `To update a follow-up or mark a concern resolved, open Feature 24 Follow-up Continuity Hub.`;

    recommendedActions = [
      { title: "Follow-up Continuity", description: "Inspect active care threads and outcomes", targetPage: "followup-continuity", buttonText: "Open Follow-ups (F24)" },
      { title: "Care Coordination", description: "Coordinate open tasks with provider", targetPage: "care-coordination", buttonText: "Open Care Coordination (F30)" },
    ];
  }
  // -------------------------------------------------------------
  // SCENARIO 6 & 7: Appointments & Doctor Brief Test
  // -------------------------------------------------------------
  else if (queryLower.includes("appointment") || queryLower.includes("doctor") || queryLower.includes("pediatrician")) {
    responseType = "APPOINTMENT_PREP";
    answerText += `### 📅 Appointment Preparation & Doctor Brief (F17 & F18)\n\n` +
      `Here is your upcoming clinical preparation summary:\n\n` +
      `- **Upcoming Appointments:** ${context.upcomingAppointmentsCount}\n` +
      `- **Next Scheduled:** ${context.nextAppointmentTitle ? `${context.nextAppointmentTitle} (${context.nextAppointmentDate})` : 'None scheduled'}\n` +
      `- **Doctor Brief Prepared (F18):** ${context.hasDoctorBriefPrepared ? 'Ready for provider review' : 'Not generated yet'}\n\n` +
      `You can generate or export your concise Doctor Brief (F18) to share recent trends and open questions with your healthcare provider.`;

    recommendedActions = [
      { title: "Doctor Brief", description: "Generate concise clinical brief for provider", targetPage: "doctor-brief", buttonText: "Open Doctor Brief (F18)" },
      { title: "Appointments", description: "View and manage scheduled visits", targetPage: "appointments", buttonText: "Open Appointments (F17)" },
    ];
  }
  // -------------------------------------------------------------
  // SCENARIO 11: Recent Changes, Trends & Anomalies
  // -------------------------------------------------------------
  else if (queryLower.includes("changed") || queryLower.includes("trend") || queryLower.includes("anomaly")) {
    responseType = "TREND_EXPLANATION";
    answerText += `### 📈 Recent Patterns & Deviations (F19 & F20)\n\n` +
      `Synthesizing your recent log data against established baselines:\n\n` +
      `- **Detected Trends (F19):** ${context.activeTrendsCount} active pattern(s)\n` +
      `- **Anomaly Deviations (F20):** ${context.activeAnomaliesCount} flagged baseline deviation(s)\n` +
      `- **Safety Status (F4):** ${context.safetyStatus}\n\n` +
      `*Note: Observed trends represent statistical correlations in your logged data, not medical causation.*`;

    recommendedActions = [
      { title: "Trend Patterns", description: "View multi-day recovery trend charts", targetPage: "trend-pattern", buttonText: "Open Trends (F19)" },
      { title: "Anomaly Detection", description: "Inspect physiological baseline deviations", targetPage: "anomaly-detection", buttonText: "Open Anomalies (F20)" },
    ];
  }
  // -------------------------------------------------------------
  // SCENARIO 8: Longitudinal Memory Search
  // -------------------------------------------------------------
  else if (queryLower.includes("happened before") || queryLower.includes("previous") || queryLower.includes("history")) {
    responseType = "QUESTION_ANSWER";
    answerText += `### 🧠 Longitudinal Memory Search (F29)\n\n` +
      `Searching your historical BloomNest patient history:\n\n` +
      `- **Matched Memory Records:** ${context.matchedMemoriesCount} matching record(s) found.\n` +
      `- **Postpartum Stage:** Day ${context.postpartumDay} (${context.recoveryStage})\n\n` +
      `*Note: Private journal entries are excluded from external reports and visible only in F29.*`;

    recommendedActions = [
      { title: "AI Memory & History", description: "View full longitudinal patient timeline", targetPage: "ai-memory-history", buttonText: "Open AI Memory (F29)" },
    ];
  }
  // -------------------------------------------------------------
  // SCENARIO 13: Mother + Baby Combined Priorities
  // -------------------------------------------------------------
  else if (queryLower.includes("mother") && queryLower.includes("baby")) {
    responseType = "MOTHER_BABY_SUMMARY";
    answerText += `### 🌸👶 Combined Mother & Baby Priority Summary\n\n` +
      `**Mother Recovery Status (Day ${context.postpartumDay}):**\n` +
      `- Safety Status: ${context.safetyStatus}\n` +
      `- Open Follow-ups: ${context.openFollowUpsCount}\n\n` +
      `**Baby Care Status (${context.babyName}):**\n` +
      `- Age: ${context.babyAgeFormatted}\n` +
      `- Next Vaccine (F28): ${context.nextVaccineName || 'Up to date'}\n\n` +
      `**Top Priority Today:** ${context.dailyPlanTopPriority || 'Review active follow-ups and complete daily check-in.'}`;

    recommendedActions = [
      { title: "Daily Plan", description: "View personalized care plan for mother & baby", targetPage: "daily-plan", buttonText: "Open Daily Plan (F21)" },
      { title: "Care Coordination", description: "View shared care tasks", targetPage: "care-coordination", buttonText: "Open Care Coordination (F30)" },
    ];
  }
  // -------------------------------------------------------------
  // SCENARIO 1, 2, 4: Default Priorities & Safety Status
  // -------------------------------------------------------------
  else {
    responseType = "PRIORITY_SUMMARY";
    answerText += `### 📋 What Needs Attention Today\n\n` +
      `Here is your care coordination picture for Postpartum Day ${context.postpartumDay}:\n\n` +
      `1. **F4 Safety Shield:** ${context.safetyStatus}\n` +
      `2. **Today's Focus (F21):** ${context.dailyPlanTopPriority || 'Maintain routine recovery logging and check-ins.'}\n` +
      `3. **Active Follow-ups (F24):** ${context.openFollowUpsCount > 0 ? `${context.openFollowUpsCount} thread(s) pending review` : 'No unresolved follow-up threads'}\n` +
      `4. **Upcoming Appointments (F17):** ${context.nextAppointmentTitle ? `${context.nextAppointmentTitle} (${context.nextAppointmentDate})` : 'None scheduled'}\n` +
      `5. **Open Care Tasks (F30):** ${context.openCareTasksCount} item(s)\n\n` +
      `*Agent 3 acts strictly as a READ/INTERPRET layer. Record creation requires explicit user action.*`;

    recommendedActions = [
      { title: "Safety Shield", description: "Review authoritative clinical safety guidance", targetPage: "safety", buttonText: "Open Safety Shield (F4)" },
      { title: "Daily Plan", description: "Review today's prioritized checklist", targetPage: "daily-plan", buttonText: "Open Daily Plan (F21)" },
      { title: "Care Coordination", description: "Coordinate tasks with care providers", targetPage: "care-coordination", buttonText: "Open Care Coordination (F30)" },
    ];
  }

  const rationale: SafetyCoordinationRationale = {
    sourceFeatures: [
      "F04 Safety Shield",
      "F17 Appointments",
      "F18 Doctor Brief",
      "F19 Trends",
      "F20 Anomalies",
      "F21 Daily Plan",
      "F24 Follow-ups",
      "F28 Vaccines",
      "F29 Memory",
      "F30 Care Coordination",
    ],
    dataPointsUsed: [
      "Postpartum Day",
      "F4 Safety Status",
      "Open Follow-up Count",
      "Appointment Schedule",
      "Vaccine Due Schedule",
    ],
    timeRange: `Postpartum Day ${context.postpartumDay}`,
    scope: queryLower.includes("baby") ? "BABY" : queryLower.includes("mother") ? "MOTHER" : "BOTH",
    babyId: context.selectedBabyId,
    babyName: context.babyName,
  };

  return {
    answer: answerText,
    responseType,
    facts,
    observations: [
      `F4 Safety Status: ${context.safetyStatus}`,
      `Open Follow-ups: ${context.openFollowUpsCount}`,
      `Upcoming Appointments: ${context.upcomingAppointmentsCount}`,
    ],
    safetyStatus: context.safetyStatus,
    recommendedActions,
    sourceFeatures: rationale.sourceFeatures,
    whyAmISeeingThis: rationale,
    confidence: "HIGH",
    dataSufficiency: context.hasSufficientData ? "FULL" : "PARTIAL",
    isUrgentOverride: isUrgent,
  };
}

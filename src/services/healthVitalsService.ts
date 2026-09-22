import {
  GlucoseContext,
  VitalStatusLevel,
  BpEvaluation,
  PulseEvaluation,
  GlucoseEvaluation,
  SymptomSafetyCheck,
  HealthVitalEvaluation,
  HealthVital,
} from "../types";

/**
 * Authoritative Blood Pressure Evaluation Engine
 * MAP = (Systolic + 2 * Diastolic) / 3
 */
/**
 * Authoritative Blood Pressure Evaluation Engine
 * Normal Pregnancy Target: 90–120 mmHg Systolic AND 60–80 mmHg Diastolic.
 * Any reading above or below normal range triggers the appropriate Clinical Alert.
 */
export function evaluateBloodPressure(systolic: number, diastolic: number): BpEvaluation {
  const map = Math.round((systolic + 2 * diastolic) / 3);

  let status: VitalStatusLevel = "NORMAL";
  let statusText = "Within your target range (Normal: 90–120 / 60–80 mmHg)";
  let isAbnormal = false;
  let requiresUrgentAttention = false;

  // 1. Critical High: Severe-range hypertension (≥160/110 mmHg) -> Preeclampsia alert
  if (systolic >= 160 || diastolic >= 110) {
    status = "SEVERE";
    statusText = "Severe-range blood pressure (≥160/110 mmHg). Urgent medical care required.";
    isAbnormal = true;
    requiresUrgentAttention = true;
  }
  // 2. Critical Low: Shock-range hypotension (<70/<40 mmHg)
  else if ((systolic > 0 && systolic < 70) || (diastolic > 0 && diastolic < 40)) {
    status = "SEVERE";
    statusText = "Critically low blood pressure (<70/<40 mmHg). Urgent medical attention advised.";
    isAbnormal = true;
    requiresUrgentAttention = true;
  }
  // 3. High: Gestational Hypertension (≥140/90 mmHg)
  else if (systolic >= 140 || diastolic >= 90) {
    status = "HIGH";
    statusText = "High blood pressure (Gestational Hypertension ≥140/90 mmHg). Contact doctor.";
    isAbnormal = true;
    requiresUrgentAttention = false;
  }
  // 4. Inverted anomaly (Systolic <= Diastolic)
  else if (systolic > 0 && diastolic > 0 && systolic <= diastolic) {
    status = "ATTENTION";
    statusText = "Atypical reading (Systolic should be higher than Diastolic). Re-check reading.";
    isAbnormal = true;
    requiresUrgentAttention = false;
  }
  // 5. Above Normal Target Range (>120/80 mmHg up to 139/89)
  else if (systolic > 120 || diastolic > 80) {
    status = "ATTENTION";
    statusText = "Elevated blood pressure (>120/80 mmHg). Monitor closely & rest.";
    isAbnormal = true;
    requiresUrgentAttention = false;
  }
  // 6. Below Normal Target Range (<90/<60 mmHg down to 70/40)
  else if ((systolic > 0 && systolic < 90) || (diastolic > 0 && diastolic < 60)) {
    status = "ATTENTION";
    statusText = "Low blood pressure reading (<90/<60 mmHg). Ensure hydration & rest.";
    isAbnormal = true;
    requiresUrgentAttention = false;
  }
  // 7. Normal Target Range (90–120 / 60–80 mmHg)
  else {
    status = "NORMAL";
    statusText = "Within your target range (Normal: 90–120 / 60–80 mmHg)";
    isAbnormal = false;
    requiresUrgentAttention = false;
  }

  return {
    systolic,
    diastolic,
    map,
    status,
    statusText,
    isAbnormal,
    requiresUrgentAttention,
  };
}

/**
 * Authoritative Maternal Pulse / Heart Rate Evaluation Engine
 * Normal resting pulse: 60 – 100 BPM
 * Above normal or below normal triggers Attention or Severe alerts.
 */
export function evaluatePulse(bpm: number): PulseEvaluation {
  let status: VitalStatusLevel = "NORMAL";
  let statusText = "Normal resting heart rate (60–100 BPM)";
  let isAbnormal = false;

  if (bpm >= 120) {
    status = "SEVERE";
    statusText = "Marked tachycardia (≥120 BPM). Consult doctor if accompanied by palpitations.";
    isAbnormal = true;
  } else if (bpm > 0 && bpm < 50) {
    status = "SEVERE";
    statusText = "Resting bradycardia (<50 BPM). Medical evaluation recommended.";
    isAbnormal = true;
  } else if (bpm > 100) {
    status = "ATTENTION";
    statusText = "Elevated resting heart rate (101–119 BPM). Rest and hydrate.";
    isAbnormal = true;
  } else if (bpm > 0 && bpm < 60) {
    status = "ATTENTION";
    statusText = "Low resting heart rate (<60 BPM).";
    isAbnormal = true;
  }

  return {
    bpm,
    status,
    statusText,
    isAbnormal,
  };
}

/**
 * Authoritative Blood Glucose Evaluation Engine
 * Evaluates both above and below normal reference ranges.
 */
export function evaluateGlucose(value: number, context: GlucoseContext = "fasting"): GlucoseEvaluation {
  let status: VitalStatusLevel = "NORMAL";
  let statusText = "Within target range";
  let isAbnormal = false;

  if (context === "fasting") {
    if (value >= 140) {
      status = "SEVERE";
      statusText = "High fasting blood glucose (≥140 mg/dL). Alert doctor.";
      isAbnormal = true;
    } else if (value >= 95) {
      status = "HIGH";
      statusText = "Elevated fasting blood glucose (≥95 mg/dL).";
      isAbnormal = true;
    } else if (value > 0 && value < 65) {
      status = "ATTENTION";
      statusText = "Low fasting blood glucose (<65 mg/dL). Have a wholesome snack.";
      isAbnormal = true;
    } else {
      status = "NORMAL";
      statusText = "Normal fasting range (65–94 mg/dL)";
    }
  } else if (context === "1h_post_meal") {
    if (value >= 180) {
      status = "SEVERE";
      statusText = "Markedly elevated 1h post-meal glucose (≥180 mg/dL).";
      isAbnormal = true;
    } else if (value >= 140) {
      status = "HIGH";
      statusText = "Elevated 1h post-meal glucose (≥140 mg/dL).";
      isAbnormal = true;
    } else if (value > 0 && value < 70) {
      status = "ATTENTION";
      statusText = "Low post-meal blood glucose (<70 mg/dL).";
      isAbnormal = true;
    } else {
      status = "NORMAL";
      statusText = "Normal 1h post-meal range (<140 mg/dL)";
    }
  } else {
    // 2h_post_meal or legacy postprandial
    if (value >= 160) {
      status = "SEVERE";
      statusText = "Markedly elevated 2h post-meal glucose (≥160 mg/dL).";
      isAbnormal = true;
    } else if (value >= 120) {
      status = "HIGH";
      statusText = "Elevated 2h post-meal glucose (≥120 mg/dL).";
      isAbnormal = true;
    } else if (value > 0 && value < 70) {
      status = "ATTENTION";
      statusText = "Low post-meal blood glucose (<70 mg/dL).";
      isAbnormal = true;
    } else {
      status = "NORMAL";
      statusText = "Normal 2h post-meal range (<120 mg/dL)";
    }
  }

  return {
    value,
    context,
    status,
    statusText,
    isAbnormal,
  };
}

/**
 * Evaluates Symptom Safety Flags
 */
export function evaluateSymptoms(check?: SymptomSafetyCheck, customSymptoms: string[] = []): {
  symptomAlerts: string[];
  hasHighRiskSymptoms: boolean;
} {
  const alerts: string[] = [];

  if (check?.headache) alerts.push("Persistent or severe headache");
  if (check?.visionChanges) alerts.push("Vision changes or spots before eyes");
  if (check?.upperAbdominalPain) alerts.push("Upper abdominal or stomach pain");
  if (check?.breathingDifficulty) alerts.push("Shortness of breath or breathing difficulty");
  if (check?.unusualSwelling) alerts.push("Unusual or sudden swelling in face/hands");

  return {
    symptomAlerts: alerts,
    hasHighRiskSymptoms: alerts.length > 0,
  };
}

/**
 * Authoritative Master Health Vital Evaluator
 */
export function evaluateHealthVital(input: Partial<HealthVital>): HealthVitalEvaluation {
  const sys = input.systolicBp || 120;
  const dia = input.diastolicBp || 80;
  const bpEval = evaluateBloodPressure(sys, dia);

  let pulseEval: PulseEvaluation | undefined;
  if (input.pulseBpm !== undefined && input.pulseBpm !== null && input.pulseBpm > 0) {
    pulseEval = evaluatePulse(input.pulseBpm);
  }

  let glucoseEval: GlucoseEvaluation | undefined;
  const rawGlucose = input.glucoseMgDl ?? input.bloodSugarMgDl;
  if (rawGlucose !== undefined && rawGlucose !== null && rawGlucose > 0) {
    glucoseEval = evaluateGlucose(rawGlucose, input.glucoseContext || "fasting");
  }

  const symptomEval = evaluateSymptoms(input.symptomCheck, input.symptoms || []);

  let overallStatus: VitalStatusLevel = "NORMAL";
  let requiresUrgent = bpEval.requiresUrgentAttention || symptomEval.hasHighRiskSymptoms || (pulseEval?.status === "SEVERE");

  if (bpEval.status === "SEVERE" || symptomEval.hasHighRiskSymptoms || pulseEval?.status === "SEVERE") {
    overallStatus = "SEVERE";
  } else if (bpEval.status === "HIGH" || (glucoseEval && glucoseEval.status === "HIGH")) {
    overallStatus = "HIGH";
  } else if (bpEval.status === "ATTENTION" || pulseEval?.status === "ATTENTION" || (glucoseEval && glucoseEval.status === "ATTENTION")) {
    overallStatus = "ATTENTION";
  }

  return {
    bp: bpEval,
    pulse: pulseEval,
    glucose: glucoseEval,
    symptomAlerts: symptomEval.symptomAlerts,
    hasHighRiskSymptoms: symptomEval.hasHighRiskSymptoms,
    overallStatus,
    requiresUrgentAttention: requiresUrgent,
    playAlertSound: requiresUrgent,
  };
}

/**
 * Input Validation Helper - Non-blocking:
 * Accepts any positive numerical input so users can test clinical ranges freely.
 */
export function validateVitalInput(input: Partial<HealthVital>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (input.systolicBp !== undefined) {
    if (isNaN(input.systolicBp) || input.systolicBp <= 0) {
      errors.push("Please enter a valid positive number for Systolic BP.");
    }
  }

  if (input.diastolicBp !== undefined) {
    if (isNaN(input.diastolicBp) || input.diastolicBp <= 0) {
      errors.push("Please enter a valid positive number for Diastolic BP.");
    }
  }

  if (input.pulseBpm !== undefined && input.pulseBpm !== null) {
    if (isNaN(input.pulseBpm) || input.pulseBpm <= 0) {
      errors.push("Please enter a valid positive number for Pulse.");
    }
  }

  const rawGlucose = input.glucoseMgDl ?? input.bloodSugarMgDl;
  if (rawGlucose !== undefined && rawGlucose !== null) {
    if (isNaN(rawGlucose) || rawGlucose <= 0) {
      errors.push("Please enter a valid positive number for Blood Glucose.");
    }
  }

  if (input.weightKg !== undefined) {
    if (isNaN(input.weightKg) || input.weightKg <= 0) {
      errors.push("Please enter a valid weight in kg.");
    }
  }

  if (input.waterMl !== undefined && (isNaN(input.waterMl) || input.waterMl < 0)) {
    errors.push("Water intake cannot be negative.");
  }

  if (input.sleepHours !== undefined && (isNaN(input.sleepHours) || input.sleepHours < 0)) {
    errors.push("Sleep hours cannot be negative.");
  }

  if (input.babyKicksCount !== undefined && (isNaN(input.babyKicksCount) || input.babyKicksCount < 0)) {
    errors.push("Baby kick count cannot be negative.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export interface VitalsTrendAnalysis {
  hasUpwardBpTrend: boolean;
  consecutiveBpRises: number;
  bpDeltaSystolic: number;
  bpDeltaDiastolic: number;
  hasRapidWeightGain: boolean;
  weightDeltaKg: number;
  advisoryLevel: "NONE" | "ADVISORY" | "WARNING";
  advisoryTitle: string;
  advisoryMessage: string;
  recommendations: string[];
}

/**
 * 48-Hour Consecutive Trend Analysis Engine
 * Detects subtle early signs of preeclampsia (e.g. rising BP drift, sudden fluid weight surges)
 * before blood pressure reaches critical clinical diagnostic thresholds.
 */
export function evaluateVitalsTrend(history: HealthVital[]): VitalsTrendAnalysis {
  const result: VitalsTrendAnalysis = {
    hasUpwardBpTrend: false,
    consecutiveBpRises: 0,
    bpDeltaSystolic: 0,
    bpDeltaDiastolic: 0,
    hasRapidWeightGain: false,
    weightDeltaKg: 0,
    advisoryLevel: "NONE",
    advisoryTitle: "",
    advisoryMessage: "",
    recommendations: [],
  };

  if (!history || history.length < 2) {
    return result;
  }

  // Ensure chronological order (oldest to newest among the most recent logs)
  const recentLogs = [...history]
    .filter((v) => v.systolicBp && v.diastolicBp)
    .slice(0, 5)
    .reverse();

  if (recentLogs.length < 2) {
    return result;
  }

  // 1. Analyze Consecutive Blood Pressure Drift
  let consecutiveSysRises = 0;
  for (let i = 1; i < recentLogs.length; i++) {
    const prev = recentLogs[i - 1].systolicBp || 0;
    const curr = recentLogs[i].systolicBp || 0;
    if (curr > prev) {
      consecutiveSysRises++;
    } else {
      consecutiveSysRises = 0;
    }
  }

  const oldest = recentLogs[0];
  const newest = recentLogs[recentLogs.length - 1];
  const deltaSys = (newest.systolicBp || 0) - (oldest.systolicBp || 0);
  const deltaDia = (newest.diastolicBp || 0) - (oldest.diastolicBp || 0);

  result.bpDeltaSystolic = deltaSys;
  result.bpDeltaDiastolic = deltaDia;
  result.consecutiveBpRises = consecutiveSysRises;

  // Upward trend condition: at least 2 consecutive rises AND net rise >= 10 mmHg systolic or >= 8 mmHg diastolic
  if ((consecutiveSysRises >= 2 && deltaSys >= 10) || deltaSys >= 14 || deltaDia >= 10) {
    result.hasUpwardBpTrend = true;
  }

  // 2. Analyze Rapid Acute Weight Gain (Fluid Retention / Edema in <48 hrs)
  const weightLogs = [...history]
    .filter((v) => v.weightKg && v.weightKg > 0)
    .slice(0, 4);

  if (weightLogs.length >= 2) {
    const latestWt = weightLogs[0].weightKg || 0;
    const prevWt = weightLogs[1].weightKg || 0;
    const wtDiff = Math.round((latestWt - prevWt) * 10) / 10;
    result.weightDeltaKg = wtDiff;

    if (wtDiff >= 1.5) {
      result.hasRapidWeightGain = true;
    }
  }

  // 3. Formulate Clinical Advisory
  if (result.hasUpwardBpTrend && result.hasRapidWeightGain) {
    result.advisoryLevel = "WARNING";
    result.advisoryTitle = "Early Preeclampsia Pattern Alert";
    result.advisoryMessage = `Both consecutive upward BP drift (+${deltaSys} mmHg) and a rapid weight surge (+${result.weightDeltaKg} kg) were detected over recent records. This combination warrants prompt clinical attention.`;
    result.recommendations = [
      "Contact your OB-GYN or maternity triage nurse today to review this pattern.",
      "Rest on your left lateral side to enhance uteroplacental blood flow.",
      "Check for headache, visual spots, or sudden face/hand swelling.",
    ];
  } else if (result.hasUpwardBpTrend) {
    result.advisoryLevel = (newest.systolicBp || 0) >= 135 || (newest.diastolicBp || 0) >= 85 ? "WARNING" : "ADVISORY";
    result.advisoryTitle = "Proactive Trend: Upward Blood Pressure Drift";
    result.advisoryMessage = `A consecutive upward drift (+${deltaSys} mmHg) in blood pressure has been recorded across your last ${recentLogs.length} readings.`;
    result.recommendations = [
      "Take 20 minutes of calm, seated rest with feet elevated and re-check.",
      "Limit high-sodium foods and ensure 2–2.5L of water intake.",
      "Mention this upward pattern to your doctor at your upcoming prenatal visit.",
    ];
  } else if (result.hasRapidWeightGain) {
    result.advisoryLevel = "ADVISORY";
    result.advisoryTitle = "Fluid Retention Observation";
    result.advisoryMessage = `A sudden weight gain of +${result.weightDeltaKg} kg was noted between your last two logs. Rapid shifts often reflect physiological fluid retention.`;
    result.recommendations = [
      "Elevate your feet and avoid standing still for long durations.",
      "Check whether your rings or shoes feel unusually tight.",
      "Notify your midwife if accompanied by swelling in your face or hands.",
    ];
  }

  return result;
}


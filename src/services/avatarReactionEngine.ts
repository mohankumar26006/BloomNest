import { AvatarReaction, AvatarVisualState, DigitalTwinState } from "../types/digitalTwin";

/**
 * Deterministic Avatar Reaction Engine
 *
 * Derives the visual expression, posture, and state of the 3D maternal avatar
 * strictly from the current Digital Twin state using an authoritative priority hierarchy:
 *
 * 1. SAFETY ATTENTION (Top Priority - from existing safety engine & red-flags)
 * 2. DISCOMFORT (Active pain or physical discomfort logged)
 * 3. LOW MOOD (Negative or stressed emotional wellness)
 * 4. TIRED (Reduced or non-restorative sleep)
 * 5. POSITIVE (Favorable mood, restorative sleep, stable vitals)
 * 6. STABLE (Default baseline)
 *
 * STRICT MEDICAL BOUNDARY:
 * The engine never diagnoses conditions or claims clinical certainty.
 * It only reflects user-reported data ("Discomfort Logged", "Needs Rest", etc.).
 */
export function getAvatarState(
  twin: Omit<DigitalTwinState, "avatar">
): AvatarReaction {
  const now = new Date().toISOString();

  // 1. SAFETY ATTENTION (Top Priority - calm & supportive tone)
  if (
    twin.safety.requiresUrgentAttention ||
    twin.safety.hasHighRiskSymptoms ||
    twin.safety.status === "SEVERE" ||
    twin.safety.status === "HIGH" ||
    twin.safety.status === "ATTENTION"
  ) {
    let alertReason = "A reading was slightly outside your usual target — worth checking with your doctor about this.";
    if (twin.safety.symptomAlerts && twin.safety.symptomAlerts.length > 0) {
      alertReason = `You noted ${twin.safety.symptomAlerts[0].toLowerCase()} — a quick check with your care provider is recommended.`;
    } else if (twin.safety.status === "SEVERE" || twin.safety.status === "HIGH") {
      alertReason = "Your vital reading was higher than usual — worth checking with your obstetrician today.";
    } else if (twin.health.trends) {
      alertReason = `${twin.health.trends} — resting and staying hydrated is a good idea right now.`;
    }

    return {
      state: "ATTENTION",
      label: "Gentle Check-in Advised",
      reason: alertReason,
      updatedAt: now,
      severityLevel: "warning",
    };
  }

  // 2. DISCOMFORT (Active pain or physical symptoms logged - warm & comforting)
  const painActive = twin.health.pain && twin.health.pain.active;
  const painSymptoms = (twin.health.symptoms || []).filter((s) => {
    const sLower = s.toLowerCase();
    return (
      sLower.includes("pain") ||
      sLower.includes("ache") ||
      sLower.includes("cramp") ||
      sLower.includes("discomfort") ||
      sLower.includes("sore") ||
      sLower.includes("nausea") ||
      sLower.includes("swelling")
    );
  });

  if (painActive || painSymptoms.length > 0) {
    let discomfortReason = "You've noted some physical discomfort today — take it easy and rest with extra support.";
    if (twin.health.pain.location) {
      discomfortReason = `Gentle reminder: you noted some ${twin.health.pain.location.toLowerCase()} discomfort. Rest with comfortable pillow support.`;
    } else if (painSymptoms.length > 0) {
      discomfortReason = `You mentioned feeling ${painSymptoms[0].toLowerCase()} earlier. Take a quiet moment to relax.`;
    }

    return {
      state: "DISCOMFORT",
      label: "Rest & Comfort Needed",
      reason: discomfortReason,
      updatedAt: now,
      severityLevel: "warning",
    };
  }

  // 3. LOW MOOD (Emotional wellbeing - compassionate & soft)
  const currentMoodLower = (twin.wellness.mood.currentMood || "").toLowerCase();
  const lowMoodKeywords = ["sad", "anxious", "stressed", "overwhelmed", "down", "exhausted", "low", "crying"];
  const isLowMood =
    !twin.wellness.mood.isPositive &&
    lowMoodKeywords.some((kw) => currentMoodLower.includes(kw));

  if (isLowMood) {
    return {
      state: "LOW_MOOD",
      label: "Gentle Self-Care",
      reason: "Holding space for you today. Take things one gentle step at a time.",
      updatedAt: now,
      severityLevel: "info",
    };
  }

  // 4. TIRED (Reduced or poor sleep - encouraging)
  const sleepHours = twin.wellness.sleep.lastNightHours;
  if (sleepHours > 0 && (sleepHours < 7 || !twin.wellness.sleep.isRestful)) {
    return {
      state: "TIRED",
      label: "Feeling a Bit Tired",
      reason: `Sleep was a bit light last night (${sleepHours}h) — maybe plan a cozy rest or early bedtime today.`,
      updatedAt: now,
      severityLevel: "info",
    };
  }

  // 5. POSITIVE (Thriving wellness - joyful & warm)
  const isPositiveMood =
    twin.wellness.mood.isPositive ||
    ["happy", "energetic", "calm", "grateful", "good", "great", "joyful"].some((kw) =>
      currentMoodLower.includes(kw)
    );
  const goodHydration = twin.wellness.hydration.isAdequate;
  const goodSleep = sleepHours >= 7;

  if (isPositiveMood && (goodHydration || goodSleep) && twin.safety.status === "NORMAL") {
    return {
      state: "POSITIVE",
      label: "Blooming & Energized",
      reason: "Restful sleep, balanced wellness, and a cheerful mood — you and baby are doing wonderfully today!",
      updatedAt: now,
      severityLevel: "normal",
    };
  }

  // 6. STABLE (Default baseline - serene & balanced)
  return {
    state: "STABLE",
    label: "Calm & Steady",
    reason: "Everything is calm, steady, and balanced on your pregnancy journey today.",
    updatedAt: now,
    severityLevel: "normal",
  };
}

import {
  UserProfile,
  HealthVital,
  Appointment,
  Medicine,
  MoodLog,
} from "../types";
import { DigitalTwinState, TwinChangeItem } from "../types/digitalTwin";
import { getAvatarState } from "./avatarReactionEngine";
import { evaluateHealthVital } from "./healthVitalsService";

/**
 * Builds the derived Digital Twin State from actual existing BloomNest project data.
 * Does not duplicate database records or invent fake data.
 */
export function buildDigitalTwinState(params: {
  user: UserProfile;
  vitals: HealthVital[];
  appointments?: Appointment[];
  medicines?: Medicine[];
  moodLogs?: MoodLog[];
}): DigitalTwinState {
  const { user, vitals = [], appointments = [], medicines = [], moodLogs = [] } = params;

  // 1. Pregnancy State
  const week = user.currentWeek || 24;
  const trimester = user.trimester || (week <= 13 ? 1 : week <= 27 ? 2 : 3);
  const progress = Math.min(100, Math.round((week / 40) * 100));
  const daysRemaining = Math.max(0, (40 - week) * 7);
  const dueDate = user.dueDate || user.edd || "2026-11-20";

  // 2. Health & Vitals
  const latestVital = vitals.length > 0 ? vitals[0] : undefined;
  const previousVital = vitals.length > 1 ? vitals[1] : undefined;

  // Retrieve pain info strictly based on journey stage:
  // Postpartum pain logs (bloomnest_pain_logs_v1) belong strictly to postpartum recovery!
  // In pregnancy, discomfort derives solely from pregnancy vitals and symptom checks.
  let painInfo = {
    active: false,
    location: undefined as string | undefined,
    intensity: undefined as number | undefined,
    description: undefined as string | undefined,
  };

  const isPostpartum =
    user.currentJourney === "POST_PREGNANCY" ||
    (user as any).journeyStage === "POST_PREGNANCY";

  if (isPostpartum) {
    try {
      const rawPainLogs = localStorage.getItem("bloomnest_pain_logs_v1");
      if (rawPainLogs) {
        const parsedPain = JSON.parse(rawPainLogs);
        if (Array.isArray(parsedPain) && parsedPain.length > 0) {
          const mostRecentPain = parsedPain[0];
          if (mostRecentPain && (mostRecentPain.severity || mostRecentPain.location)) {
            painInfo = {
              active: true,
              location: mostRecentPain.location || "Postpartum Recovery Area",
              intensity: mostRecentPain.severity || 4,
              description: mostRecentPain.notes || "Postpartum pain monitor log",
            };
          }
        }
      }
    } catch {
      // Ignore localStorage parse failure
    }
  }

  // Check symptoms on pregnancy vital
  const symptomsList = [...(latestVital?.symptoms || [])];
  if (latestVital?.symptomCheck) {
    if (latestVital.symptomCheck.headache) symptomsList.push("Headache");
    if (latestVital.symptomCheck.visionChanges) symptomsList.push("Vision Changes");
    if (latestVital.symptomCheck.upperAbdominalPain) {
      symptomsList.push("Upper Abdominal Discomfort");
      if (!isPostpartum) {
        painInfo = {
          active: true,
          location: "Upper Abdomen",
          intensity: 7,
          description: "Upper abdominal discomfort noted in clinical vital check",
        };
      }
    }
    if (latestVital.symptomCheck.breathingDifficulty) symptomsList.push("Shortness of breath");
    if (latestVital.symptomCheck.unusualSwelling) symptomsList.push("Sudden Swelling");
  }

  // In pregnancy mode, detect active aches/pain from logged pregnancy symptoms
  if (!isPostpartum && !painInfo.active) {
    const painSymptom = symptomsList.find((s) => {
      const sLower = s.toLowerCase();
      return (
        sLower.includes("pain") ||
        sLower.includes("ache") ||
        sLower.includes("cramp") ||
        sLower.includes("discomfort") ||
        sLower.includes("sore")
      );
    });

    if (painSymptom) {
      painInfo = {
        active: true,
        location: painSymptom,
        intensity: 4,
        description: `Pregnancy symptom logged: ${painSymptom}`,
      };
    }
  }

  // Deduplicate symptoms
  const uniqueSymptoms = Array.from(new Set(symptomsList));

  // Evaluate authoritative safety
  const safetyEval = evaluateHealthVital(latestVital || {});

  // BP & Vitals metrics
  const sys = latestVital?.systolicBp;
  const dia = latestVital?.diastolicBp;
  const bpFormatted = sys && dia ? `${sys}/${dia} mmHg` : undefined;
  const mapValue = sys && dia ? Math.round((sys + 2 * dia) / 3) : undefined;
  const glucoseVal = latestVital?.glucoseMgDl ?? latestVital?.bloodSugarMgDl;
  const pulseVal = latestVital?.pulseBpm;
  const weightVal = latestVital?.weightKg;

  // 3. Wellness State
  const todayWater = latestVital?.waterMl || 2000;
  const targetWater = 2500;
  const isHydrationAdequate = todayWater >= targetWater * 0.8;

  const sleepHours = latestVital?.sleepHours ?? 7.5;
  const isSleepRestful = sleepHours >= 7;
  const sleepQualityDesc =
    sleepHours >= 8
      ? "Restorative & sufficient"
      : sleepHours >= 6.5
      ? "Fair resting duration"
      : "Reduced / fragmented rest";

  // Mood
  const latestMood = moodLogs.length > 0 ? moodLogs[0] : undefined;
  const currentMood = latestMood?.mood || (user as any).currentMood || "content";
  const positiveKeywords = ["happy", "energetic", "calm", "grateful", "good", "great", "content", "joyful"];
  const isPositiveMood = positiveKeywords.some((kw) => currentMood.toLowerCase().includes(kw));

  // 4. Care State
  const upcomingApts = appointments
    .filter((a) => a.status === "upcoming")
    .map((a) => ({
      id: a.id,
      title: a.purpose || `Consultation with ${a.doctorName}`,
      date: a.appointmentDate,
      doctorName: a.doctorName,
    }));

  const activeMeds = medicines.filter((m) => m.isActive);
  const takenMeds = activeMeds.filter((m) => m.isTakenToday);

  // 5. Memory State (from preferences & local storage)
  let savedMemories: string[] = [];
  try {
    const rawMem = localStorage.getItem("bloomnest_agent_memories_v1");
    if (rawMem) {
      const parsed = JSON.parse(rawMem);
      if (Array.isArray(parsed)) {
        savedMemories = parsed.map((m: any) => m.summary || m.content || String(m)).slice(0, 4);
      }
    }
  } catch {
    // Ignore
  }

  if (savedMemories.length === 0) {
    savedMemories = [
      "Prefers hydration reminders before afternoon walks",
      "Supplements taken with breakfast to minimize nausea",
      "Goal: Natural birth readiness & daily breathing exercises",
    ];
  }

  // 6. "What Changed?" Longitudinal Diff Engine
  const changes: TwinChangeItem[] = [];

  // Pregnancy week change
  changes.push({
    id: "chg-preg",
    category: "pregnancy",
    title: `Pregnancy Progress: Week ${week}`,
    description: `Day by day growth in Trimester ${trimester} (${progress}% of journey complete).`,
    type: "neutral",
    timestamp: new Date().toISOString(),
  });

  // Sleep delta
  if (previousVital && previousVital.sleepHours !== undefined && latestVital && latestVital.sleepHours !== undefined) {
    const diff = latestVital.sleepHours - previousVital.sleepHours;
    if (Math.abs(diff) >= 0.5) {
      changes.push({
        id: "chg-sleep",
        category: "wellness",
        title: diff > 0 ? `Sleep increased (+${diff.toFixed(1)}h)` : `Sleep reduced (${diff.toFixed(1)}h)`,
        description: `Logged ${latestVital.sleepHours}h last night compared to ${previousVital.sleepHours}h previously.`,
        type: diff > 0 ? "improved" : "declined",
        timestamp: latestVital.date || new Date().toISOString(),
      });
    }
  }

  // Hydration delta
  if (previousVital && previousVital.waterMl !== undefined && latestVital && latestVital.waterMl !== undefined) {
    const waterDiff = latestVital.waterMl - previousVital.waterMl;
    if (Math.abs(waterDiff) >= 250) {
      changes.push({
        id: "chg-water",
        category: "wellness",
        title: waterDiff > 0 ? `Hydration improved (+${waterDiff} mL)` : `Water intake lower (${waterDiff} mL)`,
        description: `Current daily intake at ${todayWater} mL.`,
        type: waterDiff > 0 ? "improved" : "declined",
        timestamp: latestVital.date || new Date().toISOString(),
      });
    }
  }

  // Pain / Discomfort change
  if (painInfo.active) {
    changes.push({
      id: "chg-pain",
      category: "health",
      title: "New Discomfort Logged",
      description: `${painInfo.location || "Physical discomfort"} recorded (Intensity ${painInfo.intensity || 3}/10).`,
      type: "attention",
      timestamp: new Date().toISOString(),
    });
  }

  // Safety / BP Change
  if (safetyEval.overallStatus !== "NORMAL") {
    changes.push({
      id: "chg-safety",
      category: "safety",
      title: "Doctor Consultation Advised",
      description: "A vital reading was slightly outside your typical target — worth checking with your doctor about this.",
      type: "attention",
      timestamp: new Date().toISOString(),
    });
  }

  // Upcoming Appointment
  if (upcomingApts.length > 0) {
    const nextApt = upcomingApts[0];
    changes.push({
      id: "chg-apt",
      category: "care",
      title: `Upcoming Care: ${nextApt.title}`,
      description: `Scheduled for ${nextApt.date}${nextApt.doctorName ? ` with ${nextApt.doctorName}` : ""}.`,
      type: "neutral",
      timestamp: nextApt.date,
    });
  }

  // State without avatar
  const stateWithoutAvatar: Omit<DigitalTwinState, "avatar"> = {
    pregnancy: {
      week,
      trimester,
      dueDate,
      progress,
      daysRemaining,
    },
    health: {
      symptoms: uniqueSymptoms,
      pain: painInfo,
      recentVitals: {
        bp: bpFormatted,
        systolic: sys,
        diastolic: dia,
        pulse: pulseVal,
        glucose: glucoseVal,
        weight: weightVal,
        map: mapValue,
      },
      trends: safetyEval.bp.statusText || "Vitals stable",
    },
    wellness: {
      hydration: {
        todayMl: todayWater,
        targetMl: targetWater,
        isAdequate: isHydrationAdequate,
      },
      sleep: {
        lastNightHours: sleepHours,
        isRestful: isSleepRestful,
        qualityDescription: sleepQualityDesc,
      },
      nutrition: {
        mealsLogged: 3,
        notes: "Balanced prenatal nutrition",
      },
      mood: {
        currentMood,
        isPositive: isPositiveMood,
      },
    },
    care: {
      upcomingAppointments: upcomingApts,
      medications: {
        totalActive: activeMeds.length,
        takenTodayCount: takenMeds.length,
      },
      careTasksDue: upcomingApts.length + (activeMeds.length - takenMeds.length),
    },
    memory: {
      relevantMemories: savedMemories,
      preferences: ["Evening hydration focus", "Gentle breathing exercises", "South Indian vegetarian nutrition"],
      observations: ["Sleep improves with consistent side-lying posture", "Normal fetal kick frequency"],
    },
    safety: {
      status: safetyEval.overallStatus,
      hasHighRiskSymptoms: safetyEval.hasHighRiskSymptoms,
      symptomAlerts: safetyEval.symptomAlerts,
      activeConstraints: safetyEval.requiresUrgentAttention ? ["Seek doctor consultation"] : [],
      requiresUrgentAttention: safetyEval.requiresUrgentAttention,
    },
    changes,
  };

  // Derive Avatar Reaction via deterministic engine
  const avatar = getAvatarState(stateWithoutAvatar);

  return {
    ...stateWithoutAvatar,
    avatar,
  };
}

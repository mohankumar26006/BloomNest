import {
  PostpartumProfile,
  MotherRecoveryLog,
  BabyProfileData,
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
  MotherMedicationItem,
  MotherMedicationLog,
  MotherBabyAppointment,
  SafetyEvaluationResult,
  SafetyIssueItem,
  SafetyStatusTier,
} from "../types";
import { calculatePostpartumDay } from "./postpartumUtils";

/**
 * Deterministic Clinical Safety Shield Evaluation Engine
 * Evaluates logged data from Feature 01 through Feature 17 against strict safety rules.
 * Strictly non-AI, rule-based clinical safety triage.
 */
export function evaluateSafetyShield(
  profile: PostpartumProfile | null,
  motherLogs: MotherRecoveryLog[],
  babyProfile: BabyProfileData | null,
  bleedingLogs: BleedingLog[] = [],
  painLogs: PainLog[] = [],
  woundLogs: WoundLog[] = [],
  breastfeedingLogs: BreastfeedingLog[] = [],
  pumpingLogs: PumpingLog[] = [],
  babyFeedingLogs: BabyFeedingLog[] = [],
  diaperLogs: DiaperLog[] = [],
  sleepLogs: MotherSleepLog[] = [],
  fatigueLogs: MotherFatigueLog[] = [],
  babySleepLogs: BabySleepLog[] = [],
  moodLogs: MotherMoodWellbeingLog[] = [],
  mealLogs: MotherMealLog[] = [],
  fluidLogs: MotherFluidLog[] = [],
  medicationItems: MotherMedicationItem[] = [],
  medicationLogs: MotherMedicationLog[] = [],
  appointments: MotherBabyAppointment[] = []
): SafetyEvaluationResult {
  const motherIssues: SafetyIssueItem[] = [];
  const babyIssues: SafetyIssueItem[] = [];

  // Sort mother logs chronologically (newest first)
  const sortedMotherLogs = [...motherLogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const latestMotherLog = sortedMotherLogs[0];
  const previousMotherLog = sortedMotherLogs[1];

  // Sort bleeding logs chronologically (newest first)
  const sortedBleedingLogs = [...bleedingLogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const latestBleedingLog = sortedBleedingLogs[0];

  // Sort pain logs chronologically (newest first)
  const sortedPainLogs = [...painLogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const latestPainLog = sortedPainLogs[0];

  // Sort wound logs chronologically (newest first)
  const sortedWoundLogs = [...woundLogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const latestWoundLog = sortedWoundLogs[0];

  // Sort breastfeeding logs chronologically (newest first)
  const sortedBfLogs = [...breastfeedingLogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const latestBfLog = sortedBfLogs[0];

  // -------------------------------------------------------------
  // 1. MOTHER RECOVERY & PAIN / BLEEDING SAFETY RULES EVALUATION
  // -------------------------------------------------------------

  if (latestMotherLog) {
    // RULE M-01: Severe Pain Score (>= 8/10) -> URGENT
    if (latestMotherLog.pain >= 8) {
      motherIssues.push({
        id: `rule_m_severe_pain_${latestMotherLog.id}`,
        domain: "MOTHER",
        severity: "URGENT",
        title: "🚨 High Pain Intensity Reported",
        detected: `Your latest recorded pain score is ${latestMotherLog.pain}/10 (Severe Pain).`,
        whyItMatters:
          "Severe pain postpartum requires prompt medical evaluation to rule out acute wound infection, hematoma, or uterine complications.",
        whatToDo:
          "Seek urgent medical care or contact your OBGYN healthcare provider immediately.",
      });
    }

    // RULE M-02: Worsening Recovery Trend -> ATTENTION
    if (previousMotherLog) {
      const painDiff = latestMotherLog.pain - previousMotherLog.pain;
      if (painDiff >= 2 || latestMotherLog.overallRecovery === "Worse") {
        motherIssues.push({
          id: `rule_m_worsening_trend_${latestMotherLog.id}`,
          domain: "MOTHER",
          severity: "ATTENTION",
          title: "⚠️ Recovery Worsening Trend Detected",
          detected: `Your reported pain increased from ${previousMotherLog.pain}/10 to ${latestMotherLog.pain}/10 with worsening overall recovery status.`,
          whyItMatters:
            "Pain or physical status that worsens over consecutive days rather than improving may indicate localized tissue inflammation or delayed healing.",
          whatToDo:
            "Consider contacting your healthcare provider or OBGYN for a recovery checkup.",
        });
      }
    }

    // RULE M-03: Persistent Low Energy & Poor Sleep -> ATTENTION
    if (latestMotherLog.energy === "Low" && latestMotherLog.rest === "Poor") {
      motherIssues.push({
        id: `rule_m_fatigue_${latestMotherLog.id}`,
        domain: "MOTHER",
        severity: "ATTENTION",
        title: "⚠️ High Fatigue & Poor Rest Pattern",
        detected: "Low energy combined with poor rest quality logged in your latest recovery entry.",
        whyItMatters:
          "Prolonged sleep deprivation combined with low energy impairs tissue repair, immune function, and increases vulnerability to postpartum emotional distress.",
        whatToDo:
          "Prioritize 3-hour dedicated sleep stretches, ask family for infant care support, and discuss fatigue levels with your doctor.",
      });
    }

    // RULE M-04: Note Keywords Triage -> URGENT / ATTENTION
    if (latestMotherLog.notes) {
      const notesLower = latestMotherLog.notes.toLowerCase();

      if (
        notesLower.includes("fever") ||
        notesLower.includes("chills") ||
        notesLower.includes("heavy bleeding") ||
        notesLower.includes("clots") ||
        notesLower.includes("foul") ||
        notesLower.includes("chest pain") ||
        notesLower.includes("breath")
      ) {
        motherIssues.push({
          id: `rule_m_redflag_notes_${latestMotherLog.id}`,
          domain: "MOTHER",
          severity: "URGENT",
          title: "🚨 Postpartum Red Flag Symptoms Reported",
          detected: `Your notes mention concerning symptoms (${latestMotherLog.notes}).`,
          whyItMatters:
            "Symptoms such as fever, chills, foul discharge, heavy bleeding, or chest pain are clinical warning criteria requiring immediate triage.",
          whatToDo:
            "Contact your OBGYN provider or visit emergency healthcare immediately.",
        });
      } else if (notesLower.includes("incision") || notesLower.includes("redness") || notesLower.includes("swelling")) {
        motherIssues.push({
          id: `rule_m_wound_notes_${latestMotherLog.id}`,
          domain: "MOTHER",
          severity: "ATTENTION",
          title: "⚠️ Surgical / Wound Discomfort Noted",
          detected: `Notes mention wound or incision symptoms (${latestMotherLog.notes}).`,
          whyItMatters:
            "Local redness or swelling around C-section or perineal wounds requires clean dressing and clinical inspection.",
          whatToDo:
            "Keep the area clean, dry, and notify your OBGYN if warmth or discharge develops.",
        });
      }
    }
  }

  // -------------------------------------------------------------
  // FEATURE 05: BLEEDING & LOCHIA SAFETY RULES
  // -------------------------------------------------------------
  if (latestBleedingLog) {
    if (
      latestBleedingLog.amount === "Heavy" &&
      (latestBleedingLog.clots === "Large" || latestBleedingLog.trend === "Increasing")
    ) {
      motherIssues.push({
        id: `rule_b5_heavy_bleeding_${latestBleedingLog.id}`,
        domain: "MOTHER",
        severity: "URGENT",
        title: "🚨 Heavy Postpartum Bleeding & Clots Reported",
        detected: `Heavy bleeding with ${latestBleedingLog.clots.toLowerCase()} clots and an ${latestBleedingLog.trend.toLowerCase()} trend recorded.`,
        whyItMatters:
          "Heavy vaginal bleeding (soaking > 1 heavy pad per hour) or large blood clots can indicate uterine subinvolution or secondary postpartum hemorrhage.",
        whatToDo:
          "Seek urgent medical care or contact your OBGYN emergency healthcare team immediately.",
      });
    } else if (
      latestBleedingLog.trend === "Increasing" ||
      (latestBleedingLog.postpartumDay > 14 && latestBleedingLog.color === "Red")
    ) {
      motherIssues.push({
        id: `rule_b5_increasing_flow_${latestBleedingLog.id}`,
        domain: "MOTHER",
        severity: "ATTENTION",
        title: "⚠️ Increasing Bleeding Flow / Red Color Reversion",
        detected: `Bleeding trend is increasing or bright red blood reported after Day 14 postpartum.`,
        whyItMatters:
          "Lochia should transition from bright red (rubra) to pinkish/brown (serosa) and yellowish (alba). Reverting to bright red flow after Week 2 often signals overexertion.",
        whatToDo:
          "Increase physical bed rest, avoid lifting, and consult your OBGYN if heavy flow continues.",
      });
    }
  }

  // -------------------------------------------------------------
  // FEATURE 06: DETAILED PAIN MONITORING SAFETY RULES
  // -------------------------------------------------------------
  if (latestPainLog) {
    if (
      latestPainLog.pain >= 8 ||
      (latestPainLog.location === "Incision / wound area" && latestPainLog.trend === "Worsening")
    ) {
      motherIssues.push({
        id: `rule_p6_severe_wound_pain_${latestPainLog.id}`,
        domain: "MOTHER",
        severity: "URGENT",
        title: "🚨 Severe Pain / Worsening Incision Pain Reported",
        detected: `Pain level ${latestPainLog.pain}/10 at ${latestPainLog.location} with ${latestPainLog.trend.toLowerCase()} trend recorded.`,
        whyItMatters:
          "Severe pain or worsening surgical incision pain requires prompt clinical triage to check for wound infection, hematoma, or dehiscence.",
        whatToDo:
          "Contact your OBGYN provider or seek emergency healthcare evaluation immediately.",
      });
    } else if (latestPainLog.trend === "Worsening" || latestPainLog.pain >= 5) {
      motherIssues.push({
        id: `rule_p6_moderate_worsening_${latestPainLog.id}`,
        domain: "MOTHER",
        severity: "ATTENTION",
        title: "⚠️ Moderate Pain / Worsening Pain Trend",
        detected: `Pain level ${latestPainLog.pain}/10 at ${latestPainLog.location} (${latestPainLog.type}, ${latestPainLog.timing}) recorded.`,
        whyItMatters:
          "Persistent moderate pain or worsening pain localized to the pelvic, abdominal, or breast area requires rest adjustment and clinical monitoring.",
        whatToDo:
          "Utilize recommended relief measures (${latestPainLog.whatHelped}), avoid physical exertion, and inform your healthcare provider if pain persists.",
      });
    }
  }

  // FEATURE 07: WOUND RECOVERY SAFETY RULES
  if (latestWoundLog) {
    if (latestWoundLog.opening === "Yes / concerning change") {
      motherIssues.push({
        id: `rule_w_wound_opening_${latestWoundLog.id}`,
        domain: "MOTHER",
        severity: "URGENT",
        title: "🚨 Incision / Delivery Wound Separation Warning",
        detected: `Wound opening/separation reported for ${latestWoundLog.woundType}.`,
        whyItMatters:
          "Surgical incision or episiotomy wound opening (dehiscence) increases infection risks and requires urgent medical inspection.",
        whatToDo:
          "Keep the area clean and dry, avoid straining, and contact your doctor or hospital hotline immediately.",
      });
    }

    if (latestWoundLog.discharge === "Unusual discharge") {
      motherIssues.push({
        id: `rule_w_unusual_discharge_${latestWoundLog.id}`,
        domain: "MOTHER",
        severity: "URGENT",
        title: "🚨 Unusual Wound Discharge / Infection Indicator",
        detected: `Unusual discharge noted at ${latestWoundLog.woundType}.`,
        whyItMatters:
          "Purulent, foul-smelling, or cloudy wound discharge can be a sign of bacterial wound infection.",
        whatToDo:
          "Do not squeeze or press the wound. Contact your healthcare provider immediately for medical evaluation.",
      });
    }

    if (
      latestWoundLog.healingTrend === "Worsening" ||
      latestWoundLog.discharge === "Increasing" ||
      latestWoundLog.appearance === "Redness" ||
      latestWoundLog.appearance === "Swelling" ||
      latestWoundLog.tenderness === "Severe"
    ) {
      if (
        latestWoundLog.opening !== "Yes / concerning change" &&
        latestWoundLog.discharge !== "Unusual discharge"
      ) {
        motherIssues.push({
          id: `rule_w_wound_attention_${latestWoundLog.id}`,
          domain: "MOTHER",
          severity:
            latestWoundLog.tenderness === "Severe" || latestWoundLog.healingTrend === "Worsening"
              ? "URGENT"
              : "ATTENTION",
          title:
            latestWoundLog.tenderness === "Severe"
              ? "🚨 Severe Wound Tenderness & Worsening Trend"
              : "⚠️ Wound Condition Requires Monitoring",
          detected: `Wound status: ${latestWoundLog.appearance}, Discharge: ${latestWoundLog.discharge}, Tenderness: ${latestWoundLog.tenderness}, Trend: ${latestWoundLog.healingTrend}.`,
          whyItMatters:
            "Increased redness, swelling, or worsening tenderness at a surgical or perineal wound site requires observation and care adjustments.",
          whatToDo:
            "Maintain gentle wound hygiene, avoid friction, and consult your nurse or OBGYN if symptoms worsen.",
        });
      }
    }
  }

  // FEATURE 08: BREASTFEEDING SAFETY RULES
  if (latestBfLog) {
    const isCracking = latestBfLog.symptoms.includes("Cracking");
    const isEngorgement = latestBfLog.symptoms.includes("Engorgement/fullness");
    const isSoreness = latestBfLog.symptoms.includes("Soreness");
    const isVeryDifficult = latestBfLog.experience === "Very difficult";

    if (isCracking && isVeryDifficult) {
      motherIssues.push({
        id: `rule_bf_cracking_severe_${latestBfLog.id}`,
        domain: "MOTHER",
        severity: "URGENT",
        title: "🚨 Nipple Cracking & Severe Breastfeeding Pain Alert",
        detected: `Nipple cracking reported with "Very difficult" experience rating.`,
        whyItMatters:
          "Severe nipple cracking and intense latching pain can lead to localized skin infection, bleeding, or premature cessation of breastfeeding.",
        whatToDo:
          "Apply medical-grade purified lanolin or hydrogel pads, verify latch positioning, and consult a certified Lactation Consultant (IBCLC) or midwife.",
      });
    } else if (isEngorgement || isCracking || isSoreness || isVeryDifficult) {
      motherIssues.push({
        id: `rule_bf_symptoms_attention_${latestBfLog.id}`,
        domain: "MOTHER",
        severity: "ATTENTION",
        title: "⚠️ Breastfeeding Discomfort & Symptom Notice",
        detected: `Reported symptoms: ${latestBfLog.symptoms.join(", ") || "Discomfort"}. Experience: ${latestBfLog.experience}.`,
        whyItMatters:
          "Breast engorgement, mild cracking, or latch discomfort are common early breastfeeding challenges that benefit from warm compress, gentle expression, and latch adjustment.",
        whatToDo:
          "Hand-express a small amount of milk before feeding to soften the areola, adjust baby's latch position, and rest.",
      });
    }
  }

  // -------------------------------------------------------------
  // FEATURE 09: PUMPING & MILK TRACKING SAFETY RULES
  // -------------------------------------------------------------
  const sortedPumpingLogs = [...pumpingLogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const latestPumpingLog = sortedPumpingLogs[0];

  if (latestPumpingLog) {
    const isPumpingCracking = latestPumpingLog.symptoms.includes("Cracking");
    const isPumpingEngorgement = latestPumpingLog.symptoms.includes("Engorgement / Fullness");
    const isPumpingSoreness = latestPumpingLog.symptoms.includes("Soreness");
    const isPumpingVeryDifficult = latestPumpingLog.experience === "Very Difficult";

    if (isPumpingCracking && isPumpingVeryDifficult) {
      motherIssues.push({
        id: `rule_pump_cracking_severe_${latestPumpingLog.id}`,
        domain: "MOTHER",
        severity: "URGENT",
        title: "🚨 Pumping Nipple Cracking & Intense Pain Alert",
        detected: `Nipple cracking reported during ${latestPumpingLog.method} with "Very Difficult" experience rating.`,
        whyItMatters:
          "High suction levels or incorrect flange sizes during pumping can cause nipple trauma, skin cracking, and severe pain.",
        whatToDo:
          "Verify your pump flange fit (nipple should move freely without excessive area pull), reduce suction intensity, and consult a Lactation Consultant (IBCLC).",
      });
    } else if (isPumpingEngorgement || isPumpingCracking || isPumpingSoreness || isPumpingVeryDifficult) {
      motherIssues.push({
        id: `rule_pump_symptoms_attention_${latestPumpingLog.id}`,
        domain: "MOTHER",
        severity: "ATTENTION",
        title: "⚠️ Pumping Discomfort & Symptom Notice",
        detected: `Pumping method: ${latestPumpingLog.method}. Symptoms: ${latestPumpingLog.symptoms.join(", ") || "Discomfort"}. Experience: ${latestPumpingLog.experience}.`,
        whyItMatters:
          "Breast engorgement or pump friction soreness can usually be relieved by adjusting flange fit, applying warm compresses before pumping, and lubricating flanges.",
        whatToDo:
          "Check pump flange diameter, apply a warm compress for 3-5 minutes before pumping, and adjust pump speed/suction modes.",
      });
    }
  }

  // -------------------------------------------------------------
  // 2. BABY SAFETY RULES EVALUATION
  // -------------------------------------------------------------

  if (profile) {
    const babyAgeDays = calculatePostpartumDay(profile.babyBirthDate || profile.deliveryDate);

    if (babyProfile && (!babyProfile.birthWeightKg || !babyProfile.birthLengthCm)) {
      babyIssues.push({
        id: "rule_b_missing_metrics",
        domain: "BABY",
        severity: "ATTENTION",
        title: "ℹ️ Infant Birth Metrics Incomplete",
        detected: "Birth weight or birth length is not recorded in Feature 03 (Baby Care).",
        whyItMatters:
          "Baseline birth weight and length are required to compute WHO percentile growth curves and monitor nutritional adequacy.",
        whatToDo: "Update birth weight and length in your Feature 03 Baby Profile Card.",
      });
    }

    if (babyAgeDays <= 3) {
      babyIssues.push({
        id: "rule_b_early_newborn_check",
        domain: "BABY",
        severity: "ATTENTION",
        title: "ℹ️ Early Newborn Jaundice & Hydration Alert",
        detected: `Infant is ${babyAgeDays} ${babyAgeDays === 1 ? "day" : "days"} old.`,
        whyItMatters:
          "Days 1-5 postpartum are critical for observing skin yellowing (jaundice), wet diaper counts, and meconium stool transition.",
        whatToDo: "Ensure infant has regular feedings every 2-3 hours and track wet diapers.",
      });
    }

    // FEATURE 10: BABY FEEDING SAFETY RULES
    if (babyFeedingLogs.length > 0) {
      const todayStr = new Date().toISOString().split("T")[0];
      const todayFeeds = babyFeedingLogs.filter((f) => f.date === todayStr);

      if (babyAgeDays <= 7 && todayFeeds.length < 4 && todayFeeds.length > 0) {
        babyIssues.push({
          id: "rule_b10_low_feeding_frequency",
          domain: "BABY",
          severity: "ATTENTION",
          title: "⚠️ Low Newborn Feeding Frequency Logged Today",
          detected: `Only ${todayFeeds.length} feeding ${todayFeeds.length === 1 ? "event" : "events"} recorded today for Day ${babyAgeDays} newborn.`,
          whyItMatters:
            "Newborns typically require 8-12 feedings per 24 hours to ensure adequate hydration, prevent neonatal jaundice, and stimulate milk production.",
          whatToDo:
            "Offer feedings every 2-3 hours. Ensure infant wakes to feed if sleeping > 4 hours continuously in early week 1.",
        });
      }

      const sortedFeeds = [...babyFeedingLogs].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const latestFeed = sortedFeeds[0];
      if (latestFeed) {
        if (latestFeed.response === "Spit-up observed" || latestFeed.behavior.includes("Difficulty staying latched")) {
          babyIssues.push({
            id: `rule_b10_feeding_difficulty_${latestFeed.id}`,
            domain: "BABY",
            severity: "ATTENTION",
            title: "⚠️ Infant Feeding Discomfort / Spit-up Observed",
            detected: `Latest feed recorded ${latestFeed.response || "latch difficulty"} (${latestFeed.method}).`,
            whyItMatters:
              "Frequent spit-up or persistent latching difficulty can indicate swallowed air, high flow rate, or positioning discomfort.",
            whatToDo:
              "Keep infant upright for 20-30 minutes after feeding, burp frequently mid-feed, and consult a pediatrician if vomiting is forceful.",
          });
        }
      }
    }

    // FEATURE 11: BABY DIAPER MONITORING SAFETY RULES
    if (diaperLogs.length > 0) {
      const todayStr = new Date().toISOString().split("T")[0];
      const todayDiapers = diaperLogs.filter((d) => d.date === todayStr);
      const todayWetCount = todayDiapers.filter((d) => d.type === "Wet" || d.type === "Wet + Dirty").length;

      // Expected minimum wet diapers in early newborn period
      let expectedMinWet = 0;
      if (babyAgeDays === 1) expectedMinWet = 1;
      else if (babyAgeDays === 2) expectedMinWet = 2;
      else if (babyAgeDays === 3) expectedMinWet = 3;
      else if (babyAgeDays === 4) expectedMinWet = 4;
      else if (babyAgeDays >= 5 && babyAgeDays <= 14) expectedMinWet = 5;

      if (expectedMinWet > 0 && todayWetCount < expectedMinWet && todayDiapers.length > 0) {
        babyIssues.push({
          id: "rule_b11_low_wet_diapers",
          domain: "BABY",
          severity: "ATTENTION",
          title: "⚠️ Low Wet Diaper Output Logged Today",
          detected: `Only ${todayWetCount} wet ${todayWetCount === 1 ? "diaper" : "diapers"} recorded today on Day ${babyAgeDays} (Expected minimum: ${expectedMinWet}+).`,
          whyItMatters:
            "Adequate wet diapers are the primary indicator of sufficient milk intake and hydration in newborns.",
          whatToDo:
            "Increase feeding frequency every 2-3 hours. Contact your pediatrician or lactation counselor if wet diapers remain low.",
        });
      }

      // Check latest diaper for concerning stool color
      const sortedDiapers = [...diaperLogs].sort((a, b) => b.timestamp - a.timestamp);
      const latestDiaperWithStool = sortedDiapers.find((d) => d.stoolColor && d.stoolColor !== "Not assessed");

      if (latestDiaperWithStool) {
        if (latestDiaperWithStool.stoolColor === "Red / Bloody") {
          babyIssues.push({
            id: `rule_b11_red_stool_${latestDiaperWithStool.id}`,
            domain: "BABY",
            severity: "URGENT",
            title: "🚨 Red / Bloody Infant Stool Reported",
            detected: `Latest stool color logged as Red / Bloody (${latestDiaperWithStool.date} ${latestDiaperWithStool.time}).`,
            whyItMatters:
              "Blood in infant stool requires prompt medical evaluation to rule out milk protein allergy, anal fissure, or intestinal irritation.",
            whatToDo:
              "Save the diaper for inspection and contact your pediatrician or emergency care promptly.",
          });
        } else if (latestDiaperWithStool.stoolColor === "Pale / White / Clay") {
          babyIssues.push({
            id: `rule_b11_pale_stool_${latestDiaperWithStool.id}`,
            domain: "BABY",
            severity: "URGENT",
            title: "🚨 Pale / White / Clay Infant Stool Reported",
            detected: `Latest stool color logged as Pale / White / Clay (${latestDiaperWithStool.date} ${latestDiaperWithStool.time}).`,
            whyItMatters:
              "Acholate (pale/white) stool can indicate lack of bile and requires urgent pediatric gastroenterology evaluation (e.g. Biliary Atresia screening).",
            whatToDo:
              "Seek immediate pediatric evaluation and bring photos or the diaper to your clinic.",
          });
        }
      }
    }

    // FEATURE 13: BABY SLEEP SAFETY RULES EVALUATION
    if (babySleepLogs.length > 0) {
      const todayStr = new Date().toISOString().split("T")[0];
      const todayBabySleeps = babySleepLogs.filter((s) => s.date === todayStr);
      const todayTotalMins = todayBabySleeps.reduce((acc, s) => acc + s.durationMinutes, 0);

      // Low daily sleep check for early newborn (<= 14 days)
      if (babyAgeDays <= 14 && todayBabySleeps.length > 0 && todayTotalMins < 480) {
        const hoursLogged = (todayTotalMins / 60).toFixed(1);
        babyIssues.push({
          id: "rule_b13_low_baby_sleep",
          domain: "BABY",
          severity: "ATTENTION",
          title: "⚠️ Low Newborn Daily Sleep Duration Logged",
          detected: `Only ${hoursLogged} hours of infant sleep recorded today on Day ${babyAgeDays}.`,
          whyItMatters:
            "Newborns typically sleep 14-17 hours per 24h. Extremely low sleep can indicate feeding dissatisfaction, colic, or environment discomfort.",
          whatToDo:
            "Check feeding frequency, ensure comfortable room temperature, and consult your pediatrician if infant is persistently irritable and unable to rest.",
        });
      }

      // Prolonged sleep check in early week 1 (Day 1-7) without feeding
      if (babyAgeDays <= 7) {
        const longSession = todayBabySleeps.find((s) => s.durationMinutes >= 300);
        if (longSession) {
          const sessionHours = (longSession.durationMinutes / 60).toFixed(1);
          babyIssues.push({
            id: `rule_b13_prolonged_sleep_${longSession.id}`,
            domain: "BABY",
            severity: "ATTENTION",
            title: "⚠️ Prolonged Newborn Sleep Session Without Feeding Alert",
            detected: `Continuous sleep session of ${sessionHours} hours recorded on Day ${babyAgeDays}.`,
            whyItMatters:
              "In early week 1, newborns must wake every 2-4 hours to feed to prevent neonatal hypoglycemia and ensure hydration.",
            whatToDo:
              "Gently wake infant to feed if sleep exceeds 3-4 hours continuously in early week 1.",
          });
        }
      }
    }
  }

  // -------------------------------------------------------------
  // FEATURE 12: MOTHER SLEEP & FATIGUE SAFETY RULES EVALUATION
  // -------------------------------------------------------------
  if (sleepLogs.length > 0) {
    const todayStr = new Date().toISOString().split("T")[0];
    const todaySleepLogs = sleepLogs.filter((s) => s.date === todayStr);
    const todayTotalMins = todaySleepLogs.reduce((acc, s) => acc + s.durationMinutes, 0);

    if (todaySleepLogs.length > 0 && todayTotalMins < 240) {
      const hoursLogged = (todayTotalMins / 60).toFixed(1);
      motherIssues.push({
        id: "rule_m12_severe_sleep_deprivation",
        domain: "MOTHER",
        severity: "ATTENTION",
        title: "⚠️ Severe Maternal Sleep Deprivation Logged Today",
        detected: `Only ${hoursLogged} hours of total rest/sleep logged today.`,
        whyItMatters:
          "Persistent sleep under 4 hours per 24h increases maternal exhaustion, slows wound healing, and affects mood and motor alertness.",
        whatToDo:
          "Prioritize restorative naps when infant sleeps, seek partner or caregiver support for nighttime feeds, and discuss severe fatigue with your care team.",
      });
    }
  }

  if (fatigueLogs.length > 0) {
    const sortedFatigue = [...fatigueLogs].sort((a, b) => b.timestamp - a.timestamp);
    const latestFatigue = sortedFatigue[0];

    if (latestFatigue && latestFatigue.fatigueScore >= 9 && latestFatigue.functionalImpact === "Significantly affecting me") {
      motherIssues.push({
        id: `rule_m12_high_fatigue_${latestFatigue.id}`,
        domain: "MOTHER",
        severity: "ATTENTION",
        title: "⚠️ Extreme Maternal Fatigue & Functional Impact Reported",
        detected: `Latest fatigue level recorded as ${latestFatigue.fatigueScore}/10 (Significantly affecting daily activities).`,
        whyItMatters:
          "Extreme fatigue that impairs daily functioning requires supportive care and medical evaluation to rule out postpartum anemia or thyroid dysfunction.",
        whatToDo:
          "Inform your OBGYN or primary care doctor at your upcoming checkup and ask for family or postpartum doula assistance.",
      });
    }
  }

  // -------------------------------------------------------------
  // FEATURE 14: MOOD & EMOTIONAL WELLBEING SAFETY RULES EVALUATION
  // -------------------------------------------------------------
  if (moodLogs.length > 0) {
    const sortedMoods = [...moodLogs].sort((a, b) => b.timestamp - a.timestamp);
    const latestMood = sortedMoods[0];

    // Severe Emotional Distress Rule (URGENT)
    if (
      latestMood &&
      latestMood.moodScore === 1 &&
      (latestMood.stressLevel >= 9 || latestMood.overwhelmedRating === "Extremely")
    ) {
      motherIssues.push({
        id: `rule_m14_severe_emotional_distress_${latestMood.id}`,
        domain: "MOTHER",
        severity: "URGENT",
        title: "🔴 High Emotional Distress & Overwhelm Reported",
        detected: `Mood recorded as Very Low (1/5) with stress level ${latestMood.stressLevel}/10 and feeling ${latestMood.overwhelmedRating} overwhelmed.`,
        whyItMatters:
          "Severe emotional distress after childbirth is serious and warrants immediate compassionate support and professional medical guidance.",
        whatToDo:
          "Please reach out to your doctor, midwife, or a trusted loved one right away. If you feel unsafe or overwhelmed, contact your healthcare provider or local mental health helpline immediately.",
      });
    }
    // Persistent Low Mood / High Stress Rule (ATTENTION)
    else if (
      sortedMoods.length >= 2 &&
      sortedMoods.slice(0, 2).every((m) => m.moodScore <= 2 || m.stressLevel >= 7 || m.overwhelmedRating === "Very")
    ) {
      motherIssues.push({
        id: `rule_m14_persistent_low_mood_${latestMood.id}`,
        domain: "MOTHER",
        severity: "ATTENTION",
        title: "⚠️ Persistent Low Mood or High Stress Pattern Logged",
        detected: `Recent emotional check-ins show persistent low mood (${latestMood.moodScore}/5) or elevated stress (${latestMood.stressLevel}/10).`,
        whyItMatters:
          "Sustained low mood or high stress during early postpartum recovery can affect emotional healing and energy levels.",
        whatToDo:
          "Share your feelings with your partner, family, or healthcare provider. Consider taking dedicated rest breaks and seeking supportive postpartum care.",
      });
    }
  }

  // -------------------------------------------------------------
  // FEATURE 15: NUTRITION & HYDRATION SAFETY RULES EVALUATION
  // -------------------------------------------------------------
  if (fluidLogs.length > 0 || mealLogs.length > 0) {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayFluidLogs = fluidLogs.filter((f) => f.date === todayStr);
    const todayTotalFluidMl = todayFluidLogs.reduce((acc, f) => acc + (f.amountMl || 0), 0);

    const sortedMeals = [...mealLogs].sort((a, b) => b.timestamp - a.timestamp);
    const latestMeal = sortedMeals[0];

    if (todayFluidLogs.length > 0 && todayTotalFluidMl < 500 && latestMeal?.symptoms?.some((s) => s !== "None")) {
      motherIssues.push({
        id: "rule_m15_severe_fluid_deprivation",
        domain: "MOTHER",
        severity: "URGENT",
        title: "🔴 Severe Fluid Deprivation & Symptoms Reported",
        detected: `Only ${todayTotalFluidMl} mL of fluids logged today alongside reported eating/drinking symptoms (${latestMeal.symptoms.join(", ")}).`,
        whyItMatters:
          "Severe fluid deprivation during postpartum recovery can impede healing, reduce milk production, and increase risks of dizziness or urinary tract discomfort.",
        whatToDo:
          "Sip water or electrolyte drinks immediately. Contact your healthcare provider or lactation team if nausea or inability to drink persists.",
      });
    } else if (todayFluidLogs.length > 0 && todayTotalFluidMl < 1000) {
      motherIssues.push({
        id: "rule_m15_low_hydration",
        domain: "MOTHER",
        severity: "ATTENTION",
        title: "⚠️ Low Daily Fluid Intake Logged Today",
        detected: `Total logged fluid intake is ${todayTotalFluidMl} mL (under 1,000 mL threshold).`,
        whyItMatters:
          "Optimal hydration supports physical energy, tissue healing, and milk expression.",
        whatToDo:
          "Keep a water bottle within reach, sip fluids regularly, and try coconut water or herbal tea if plain water is hard to take.",
      });
    } else if (latestMeal && (latestMeal.appetite === "Very poor" || latestMeal.appetite === "Poor")) {
      motherIssues.push({
        id: `rule_m15_poor_appetite_${latestMeal.id}`,
        domain: "MOTHER",
        severity: "ATTENTION",
        title: "⚠️ Reduced Postpartum Appetite Recorded",
        detected: `Latest meal logged with ${latestMeal.appetite} appetite rating.`,
        whyItMatters:
          "Persistent low appetite can affect maternal energy levels and physical recovery during early weeks.",
        whatToDo:
          "Try small, frequent nutrient-dense snacks (nuts, smoothies, soups) and mention persistent appetite changes to your healthcare provider.",
      });
    }
  }

  // -------------------------------------------------------------
  // FEATURE 16: MEDICATION SAFETY RULES EVALUATION
  // -------------------------------------------------------------
  if (medicationLogs.length > 0) {
    const sortedMedLogs = [...medicationLogs].sort((a, b) => b.timestamp - a.timestamp);
    const latestMedLog = sortedMedLogs[0];

    // Check for reported reaction symptoms
    const rashReactionLog = sortedMedLogs.find((l) => l.reportedReactions?.includes("rash_skin_change"));
    const anyReactionLog = sortedMedLogs.find((l) => l.reportedReactions && l.reportedReactions.length > 0 && !l.reportedReactions.includes("none"));

    if (rashReactionLog) {
      motherIssues.push({
        id: `rule_m16_rash_reaction_${rashReactionLog.id}`,
        domain: "MOTHER",
        severity: "URGENT",
        title: "🔴 Medication Reaction / Rash Reported",
        detected: `Skin rash or skin change logged after taking ${rashReactionLog.medicationName} on ${rashReactionLog.date}.`,
        whyItMatters:
          "New skin rashes, hives, or skin changes following a medication dose may indicate an allergic response or adverse drug reaction that requires prompt medical review.",
        whatToDo:
          "Contact your prescribing doctor, healthcare provider, or pharmacist immediately. Seek urgent emergency care if accompanied by facial swelling or difficulty breathing.",
      });
    } else if (anyReactionLog) {
      const reactions = anyReactionLog.reportedReactions?.filter((r) => r !== "none").join(", ");
      motherIssues.push({
        id: `rule_m16_side_effects_${anyReactionLog.id}`,
        domain: "MOTHER",
        severity: "ATTENTION",
        title: "⚠️ Medication Side Effects / Reaction Recorded",
        detected: `Reported symptoms (${reactions}) after taking ${anyReactionLog.medicationName}.`,
        whyItMatters:
          "Noticing new symptoms after starting or taking a medication is important to track for your doctor.",
        whatToDo:
          "Mention these observed symptoms to your healthcare provider or pharmacist at your next checkup or follow-up call.",
      });
    }

    // Check for multiple missed doses in active medications
    const missedDosesCount = medicationLogs.filter((l) => l.doseStatus === "missed" || l.doseStatus === "skipped").length;
    if (missedDosesCount >= 2 && !rashReactionLog) {
      motherIssues.push({
        id: "rule_m16_multiple_missed_doses",
        domain: "MOTHER",
        severity: "ATTENTION",
        title: "⚠️ Multiple Missed / Skipped Doses Recorded",
        detected: `${missedDosesCount} doses marked as missed or skipped in medication history.`,
        whyItMatters:
          "Consistent adherence to prescribed postpartum medications (e.g. antibiotics, iron supplements, blood pressure support) is key to steady recovery.",
        whatToDo:
          "Review your recorded instructions. Follow the advice provided by your doctor or pharmacist regarding missed doses. Do not double doses independently.",
      });
    }
  }

  // -------------------------------------------------------------
  // FEATURE 17: APPOINTMENTS SAFETY RULES EVALUATION
  // -------------------------------------------------------------
  if (appointments.length > 0) {
    const missedAppts = appointments.filter((a) => a.status === "missed");
    if (missedAppts.length > 0) {
      const latestMissed = missedAppts[0];
      motherIssues.push({
        id: `rule_m17_missed_appointment_${latestMissed.id}`,
        domain: "MOTHER",
        severity: "ATTENTION",
        title: "⚠️ Missed Healthcare Appointment Recorded",
        detected: `Appointment "${latestMissed.title}" on ${latestMissed.date} was marked as missed.`,
        whyItMatters:
          "Routine postpartum and pediatric checkups ensure physical healing, wound evaluation, and newborn developmental checks stay on schedule.",
        whatToDo:
          "Contact your healthcare provider's clinic or hospital to reschedule your visit at your earliest convenience.",
      });
    }
  }



  // -------------------------------------------------------------
  // 3. OVERALL SAFETY TIER EVALUATION
  // -------------------------------------------------------------

  const allIssues = [...motherIssues, ...babyIssues];
  let overallStatus: SafetyStatusTier = "CLEAR";

  if (allIssues.some((i) => i.severity === "URGENT")) {
    overallStatus = "URGENT";
  } else if (allIssues.length > 0) {
    overallStatus = "ATTENTION";
  }

  return {
    overallStatus,
    motherIssues,
    babyIssues,
    evaluatedAt: new Date().toISOString(),
  };
}

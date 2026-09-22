import {
  EducationTopic,
  EducationCategory,
  UserEducationHistoryItem,
  PersonalizedEducationEvaluationResult,
  PostpartumProfile,
  MotherRecoveryLog,
  PainLog,
  BleedingLog,
  WoundLog,
  BreastfeedingLog,
  BabyFeedingLog,
  MotherSleepLog,
  MotherMoodWellbeingLog,
  MotherBabyAppointment,
} from "../types";
import { calculatePostpartumDay, calculatePostpartumWeek, getRecoveryStage } from "./postpartumUtils";
import { evaluateSafetyShield } from "./safetyShieldEngine";

export const EDUCATION_HISTORY_KEY = "bloomnest_education_history_v1";
const POSTPARTUM_PROFILE_KEY = "bloomnest_postpartum_profile_v1";

/**
 * COMPREHENSIVE CURATED POSTPARTUM EDUCATION DATABASE
 * Non-diagnostic, evidence-based educational library.
 */
export const POSTPARTUM_EDUCATION_DATABASE: EducationTopic[] = [
  {
    topicId: "edu_lochia_progression",
    title: "Understanding Normal Lochia & Bleeding Progression",
    category: "mother_recovery",
    summary: "Learn what to expect as your body clears uterine lining following delivery, from Rubra to Serosa and Alba.",
    whySeeingThis: "Essential baseline learning for early postpartum lochia monitoring.",
    applicableStages: ["immediate_recovery", "early_recovery", "ongoing_recovery"],
    relatedFeatureName: "Feature 5 — Bleeding Monitoring",
    relatedModulePage: "postpartum-care",
    whatItIs: "Lochia is the natural vaginal discharge after childbirth consisting of blood, tissue, and mucus as the uterus heals.",
    whatYouMayNotice: [
      "Days 1–4 (Lochia Rubra): Dark red or bright red discharge, similar to a heavy period.",
      "Days 4–10 (Lochia Serosa): Pinkish-brown or lighter watery discharge.",
      "Days 10–28+ (Lochia Alba): Yellowish-white or cream-colored discharge.",
      "Brief small increases in bleeding may occur during breastfeeding or light walking."
    ],
    whatToKeepTrackOf: [
      "Number of pads soaked per hour.",
      "Presence and size of blood clots (golf-ball size or larger).",
      "Color transitions over days 1–14."
    ],
    whenToPayAttention: [
      "Soaking more than 1 heavy pad per hour for 2 consecutive hours.",
      "Passing blood clots larger than a golf ball.",
      "Bleeding turning bright red again after turning pink/yellow.",
      "Foul-smelling odor or accompanying fever > 100.4°F."
    ],
    questionsForDoctor: [
      "Is my current lochia color and volume appropriate for my postpartum day?",
      "Are small clots expected when standing up after prolonged rest?"
    ],
    readTimeMinutes: 3,
    isSafetyRelated: true,
    contentSource: "ACOG Postpartum Recovery Guidelines",
  },
  {
    topicId: "edu_pain_cramping",
    title: "Postpartum Pain, Afterpains & Uterine Involution",
    category: "mother_recovery",
    summary: "Understand uterine afterpains, perineal discomfort, and effective comfort measures during early recovery.",
    whySeeingThis: "Personalized based on postpartum day and recorded physical discomfort.",
    applicableStages: ["immediate_recovery", "early_recovery"],
    relatedFeatureName: "Feature 6 — Pain & Recovery",
    relatedModulePage: "health-tracker",
    whatItIs: "Afterpains are gentle or strong uterine contractions helping your uterus shrink back to pre-pregnancy size.",
    whatYouMayNotice: [
      "Stronger cramping while breastfeeding due to natural oxytocin release.",
      "Mild to moderate abdominal aching lasting 3 to 7 days.",
      "Perineal soreness or incision tenderness when sitting or changing positions."
    ],
    whatToKeepTrackOf: [
      "Pain score (0–10) and whether rest or prescribed pain relief helps.",
      "Timing of pain (constant vs cramping during feedings).",
      "Location of pain (lower abdomen vs incision site)."
    ],
    whenToPayAttention: [
      "Severe abdominal pain (7/10 or higher) not relieved by prescribed medication.",
      "Sudden sharp pelvic pain accompanied by dizziness or fever.",
      "Pain accompanied by redness, swelling, or foul discharge at wound site."
    ],
    questionsForDoctor: [
      "Which pain relief options are safest for me while breastfeeding?",
      "How long should I expect uterine cramping during feeds?"
    ],
    readTimeMinutes: 4,
    isSafetyRelated: false,
    contentSource: "RCOG Maternal Recovery Standards",
  },
  {
    topicId: "edu_csection_care",
    title: "C-Section Incision Care & Healing Stages",
    category: "mother_recovery",
    summary: "How to inspect, clean, and support your abdominal incision for safe healing and optimal recovery.",
    whySeeingThis: "Recommended for mothers recovering from C-section delivery.",
    applicableStages: ["immediate_recovery", "early_recovery", "ongoing_recovery"],
    relatedFeatureName: "Feature 7 — Wound Recovery",
    relatedModulePage: "postpartum-care",
    whatItIs: "A surgical C-section incision heals in layers over 4 to 6 weeks, requiring clean and dry care.",
    whatYouMayNotice: [
      "Initial redness and slight swelling along the tape/incision line.",
      "Mild numbness or tingling around the lower abdomen as nerves settle.",
      "Gradual lightening of the scar color from red/pink to skin-tone over time."
    ],
    whatToKeepTrackOf: [
      "Cleanliness and dryness of the incision area daily.",
      "Any fluid discharge (clear, yellow, or blood-tinged).",
      "Edge closure integrity (ensuring edges stay together)."
    ],
    whenToPayAttention: [
      "Increased redness spreading beyond the incision line.",
      "Yellow, green, or foul-smelling drainage from the wound.",
      "Incision edges pulling apart or opening.",
      "Fever over 100.4°F or worsening localized incision warmth."
    ],
    questionsForDoctor: [
      "When can steri-strips or incision coverings be safely removed?",
      "What gentle movements help prevent strain on my incision?"
    ],
    readTimeMinutes: 4,
    isSafetyRelated: true,
    contentSource: "Postpartum Surgical Wound Care Protocol",
  },
  {
    topicId: "edu_breastfeeding_latch",
    title: "Breastfeeding Comfort, Latch & Nipple Protection",
    category: "breastfeeding_lactation",
    summary: "Master comfortable latch techniques, positioning, and prevent common nipple soreness.",
    whySeeingThis: "Recommended for lactation support and comfortable feeding positioning.",
    applicableStages: ["immediate_recovery", "early_recovery", "ongoing_recovery"],
    relatedFeatureName: "Feature 8 — Breastfeeding Care",
    relatedModulePage: "postpartum-care",
    whatItIs: "A deep, asymmetrical latch ensures baby receives milk effectively while preventing nipple damage.",
    whatYouMayNotice: [
      "Initial 10-second sensation during latch that quickly softens into comfortable suction.",
      "Audible swallowing sounds during active nursing bursts.",
      "Softening of the breast after a successful feeding session."
    ],
    whatToKeepTrackOf: [
      "Latch comfort (should not feel pinching or severe pain throughout feed).",
      "Nursing duration on each breast.",
      "Nipple appearance after feed (should be rounded, not flattened like lipstick)."
    ],
    whenToPayAttention: [
      "Severe or persistent nipple pain throughout the entire feeding session.",
      "Cracked, bleeding, or blistered nipples.",
      "Hard, hot, painful lumps in breast accompanied by flu-like chills (possible mastitis)."
    ],
    questionsForDoctor: [
      "Can a lactation consultant observe my latch positioning?",
      "Which nipple creams or soothing compresses are safest for baby?"
    ],
    readTimeMinutes: 5,
    isSafetyRelated: false,
    contentSource: "International Lactation Consultant Association",
  },
  {
    topicId: "edu_newborn_feeding_cues",
    title: "Recognizing Newborn Feeding Cues & Rhythm",
    category: "baby_care",
    summary: "Identify early hunger signals (rooting, lip smacking) before crying begins for calmer feeds.",
    whySeeingThis: "Contextualized for newborn infant care and feeding rhythms.",
    applicableStages: ["immediate_recovery", "early_recovery", "ongoing_recovery"],
    relatedFeatureName: "Feature 10 — Baby Feeding",
    relatedModulePage: "postpartum-care",
    whatItIs: "Newborns communicate hunger through progressive body language before crying, which is a late hunger cue.",
    whatYouMayNotice: [
      "Early cues: Stirring, opening mouth, turning head side-to-side (rooting).",
      "Mid cues: Stretching, putting hands to mouth, sucking on fingers.",
      "Late cues: Crying, turning red, agitated body movements."
    ],
    whatToKeepTrackOf: [
      "Feeding frequency (typically 8 to 12 times per 24 hours for newborns).",
      "Baby satisfaction cues (relaxed hands, unclenched fists, falling asleep).",
      "Swallow counts during active feeds."
    ],
    whenToPayAttention: [
      "Newborn feeding fewer than 6 times in 24 hours.",
      "Baby constantly lethargic or difficult to wake for feeds.",
      "Persistent weak or ineffective sucking."
    ],
    questionsForDoctor: [
      "How do I know my newborn is getting adequate colostrum/milk before weight checks?",
      "What is the recommended weight recovery timeline for newborns?"
    ],
    readTimeMinutes: 3,
    isSafetyRelated: false,
    contentSource: "AAP Newborn Nutrition Committee",
  },
  {
    topicId: "edu_diaper_output_hydration",
    title: "Newborn Diaper Patterns & Hydration Markers",
    category: "baby_care",
    summary: "Track wet and dirty diapers from meconium to seedy mustard stools as an indicator of baby's intake.",
    whySeeingThis: "Connected to Feature 11 Diaper & Output Monitoring.",
    applicableStages: ["immediate_recovery", "early_recovery", "ongoing_recovery"],
    relatedFeatureName: "Feature 11 — Diaper Monitoring",
    relatedModulePage: "diapers",
    whatItIs: "Diaper count and stool color transitions provide direct clinical evidence of newborn hydration and calorie intake.",
    whatYouMayNotice: [
      "Day 1–2: Black/tarry meconium stools (1–2 wet diapers).",
      "Day 3–4: Transitional greenish-brown stools (3–4 wet diapers).",
      "Day 5+: Yellow seedy/soft stools (5–6+ heavy wet diapers per day)."
    ],
    whatToKeepTrackOf: [
      "Number of wet diapers per 24 hours.",
      "Stool color and consistency transitions.",
      "Color of urine (should be pale yellow/clear, not dark orange)."
    ],
    whenToPayAttention: [
      "Fewer than 4 wet diapers per 24 hours after Day 5.",
      "Brick-red urate crystals in diaper continuing past Day 4.",
      "Stool that is pale white, clay-colored, or contains visible red blood.",
      "Dry mouth or sunken fontanelle (soft spot)."
    ],
    questionsForDoctor: [
      "Are my baby's diaper counts appropriate for their age in days?",
      "What stool consistency changes are normal during feeding growth spurts?"
    ],
    readTimeMinutes: 4,
    isSafetyRelated: true,
    contentSource: "Pediatric Clinical Output Standards",
  },
  {
    topicId: "edu_safe_sleep_infant",
    title: "Safe Infant Sleep & ABC Guidelines",
    category: "baby_care",
    summary: "Essential ABC safe sleep rules (Alone, Back, Crib) to reduce SIDS risk and ensure restful baby sleep.",
    whySeeingThis: "Core infant safety education for all postpartum parents.",
    applicableStages: ["immediate_recovery", "early_recovery", "ongoing_recovery", "extended_postpartum"],
    relatedFeatureName: "Feature 13 — Baby Sleep",
    relatedModulePage: "baby-sleep",
    whatItIs: "The ABC safe sleep principles create a secure, clear sleep environment for your newborn.",
    whatYouMayNotice: [
      "Newborns sleep in short 2 to 4 hour intervals around the clock.",
      "Noisy sleep (grunting, soft squeaks, rapid breathing) is common and normal for newborns."
    ],
    whatToKeepTrackOf: [
      "Always placing baby on their BACK for every sleep.",
      "Firm, flat mattress in a bassinet/crib with a fitted sheet only.",
      "Room temperature (comfortable for a light layer, avoid overheating)."
    ],
    whenToPayAttention: [
      "Never place loose blankets, pillows, stuffed animals, or crib bumpers in sleep space.",
      "Avoid sleeping with baby on a couch, armchair, or soft mattress.",
      "Seek medical review if baby shows unusual blueish lip discoloration or gasping."
    ],
    questionsForDoctor: [
      "What swaddling methods are safe for sleep and hip development?",
      "When should swaddling be stopped once baby shows rolling attempts?"
    ],
    readTimeMinutes: 4,
    isSafetyRelated: true,
    contentSource: "AAP Task Force on Sudden Infant Death Syndrome",
  },
  {
    topicId: "edu_mother_sleep_fatigue",
    title: "Maternal Sleep Recovery & Fragmented Rest Strategies",
    category: "sleep_fatigue",
    summary: "Understand why fragmented sleep happens and practical ways to protect physical rest during recovery.",
    whySeeingThis: "Personalized based on maternal sleep logs and fatigue observations.",
    applicableStages: ["immediate_recovery", "early_recovery", "ongoing_recovery"],
    relatedFeatureName: "Feature 12 — Mother Sleep & Fatigue",
    relatedModulePage: "sleep-fatigue",
    whatItIs: "Postpartum sleep is naturally fragmented by newborn feeding demands, requiring strategic rest windows.",
    whatYouMayNotice: [
      "Short 90-minute sleep cycles aligning with baby's sleep blocks.",
      "Postpartum night sweats as hormonal levels recalibrate."
    ],
    whatToKeepTrackOf: [
      "Total accumulated rest hours across 24 hours (naps + night sleep).",
      "Fatigue score (0–10) and functional energy.",
      "Accepting help from partner/family for non-feeding care."
    ],
    whenToPayAttention: [
      "Extreme exhaustion causing difficulty safely holding or feeding baby.",
      "Inability to sleep even when baby is peacefully sleeping (hyperarousal/insomnia).",
      "Feeling completely overwhelmed by fatigue."
    ],
    questionsForDoctor: [
      "What strategies can help manage nighttime anxiety interfering with rest?",
      "Are there safe nutrition or rest guidelines for postpartum stamina?"
    ],
    readTimeMinutes: 3,
    isSafetyRelated: false,
    contentSource: "Postpartum Maternal Rest Research Study",
  },
  {
    topicId: "edu_postpartum_blues_mood",
    title: "Postpartum Emotional Wellbeing & Baby Blues Awareness",
    category: "mood_wellbeing",
    summary: "Distinguish normal hormonal baby blues (days 3–14) from postpartum depression or anxiety.",
    whySeeingThis: "Connected to Feature 14 Mood & Emotional Wellbeing.",
    applicableStages: ["immediate_recovery", "early_recovery", "ongoing_recovery", "extended_postpartum"],
    relatedFeatureName: "Feature 14 — Mood & Emotional Wellbeing",
    relatedModulePage: "mood-wellbeing",
    whatItIs: "Rapid shifts in estrogen and progesterone post-birth commonly trigger 'baby blues' mood fluctuations in 70-80% of mothers.",
    whatYouMayNotice: [
      "Days 3–10: Tearfulness, mood swings, feeling emotionally tender or easily overwhelmed.",
      "Gradual leveling of mood as routines settle past week 2."
    ],
    whatToKeepTrackOf: [
      "Daily mood check-ins (Good, Okay, Low, Worried).",
      "Overwhelm level and available social support.",
      "Open conversation with your partner or healthcare provider."
    ],
    whenToPayAttention: [
      "Low mood or anxiety lasting longer than 2 weeks without improvement.",
      "Persistent loss of interest, severe dread, or intrusive thoughts.",
      "Difficulty bonding with baby or feeling detached.",
      "Thoughts of harming yourself or baby (requires immediate emergency medical support)."
    ],
    questionsForDoctor: [
      "What support options or resources are available for postpartum mood?",
      "How can I share emotional check-in notes with my provider?"
    ],
    readTimeMinutes: 4,
    isSafetyRelated: true,
    contentSource: "Postpartum Support International & ACOG",
  },
  {
    topicId: "edu_postpartum_nutrition_hydration",
    title: "Postpartum Nutrition, Iron & Hydration Guidance",
    category: "nutrition_hydration",
    summary: "Fuel your tissue recovery, blood volume restoration, and milk production with balanced nourishment.",
    whySeeingThis: "Connected to Feature 15 Nutrition & Hydration Care.",
    applicableStages: ["immediate_recovery", "early_recovery", "ongoing_recovery", "extended_postpartum"],
    relatedFeatureName: "Feature 15 — Nutrition & Hydration",
    relatedModulePage: "postpartum-nutrition",
    whatItIs: "Healing tissue, replacing blood loss, and producing breastmilk demand nutrient-dense foods and generous hydration.",
    whatYouMayNotice: [
      "Increased thirst, especially at the start of breastfeeding sessions.",
      "Need for simple, nutrient-dense snacks available throughout the day."
    ],
    whatToKeepTrackOf: [
      "Daily fluid intake (drinking to satisfy thirst, clear pale urine).",
      "Iron-rich foods (lean meats, leafy greens, legumes) to replenish blood loss.",
      "Fiber and warm liquids to support comfortable digestion."
    ],
    whenToPayAttention: [
      "Dizziness or lightheadedness upon standing (may indicate anemia or dehydration).",
      "Severe constipation or painful bowel movements.",
      "Inability to keep fluids or food down."
    ],
    questionsForDoctor: [
      "Should I continue taking my prenatal vitamin and iron supplement postpartum?",
      "Which foods support comfortable digestion during early recovery?"
    ],
    readTimeMinutes: 3,
    isSafetyRelated: false,
    contentSource: "Academy of Nutrition and Dietetics",
  },
];

/**
 * Load user education history from localStorage
 */
export function getStoredEducationHistory(): Record<string, UserEducationHistoryItem> {
  try {
    const raw = localStorage.getItem(EDUCATION_HISTORY_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse education history from localStorage", err);
    return {};
  }
}

/**
 * Toggle saved status for an educational topic
 */
export function toggleSaveEducationTopic(topicId: string): boolean {
  try {
    const history = getStoredEducationHistory();
    const existing = history[topicId] || {
      topicId,
      viewedAt: new Date().toISOString(),
      isSaved: false,
      isCompleted: false,
    };

    existing.isSaved = !existing.isSaved;
    history[topicId] = existing;
    localStorage.setItem(EDUCATION_HISTORY_KEY, JSON.stringify(history));
    return existing.isSaved;
  } catch (err) {
    console.error("Failed to toggle save education topic", err);
    return false;
  }
}

/**
 * Mark an educational topic as completed
 */
export function markEducationTopicCompleted(topicId: string): void {
  try {
    const history = getStoredEducationHistory();
    const existing = history[topicId] || {
      topicId,
      viewedAt: new Date().toISOString(),
      isSaved: false,
      isCompleted: false,
    };

    existing.isCompleted = true;
    existing.viewedAt = new Date().toISOString();
    history[topicId] = existing;
    localStorage.setItem(EDUCATION_HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    console.error("Failed to mark education topic completed", err);
  }
}

/**
 * FEATURE 25 — PERSONALIZATION ENGINE
 * Evaluates Postpartum Profile (F1), logs (F2, F5-F16), Safety (F4), Daily Plan (F21),
 * Daily Check-in (F23), and Follow-ups (F24) to personalize educational content.
 */
export function evaluatePersonalizedEducation(): PersonalizedEducationEvaluationResult {
  const history = getStoredEducationHistory();

  // Load Postpartum Profile
  let profile: PostpartumProfile | null = null;
  try {
    const rawProf = localStorage.getItem(POSTPARTUM_PROFILE_KEY);
    if (rawProf) profile = JSON.parse(rawProf);
  } catch {}

  const pDay = profile ? calculatePostpartumDay(profile.deliveryDate) : 10;
  const pWeek = profile ? calculatePostpartumWeek(pDay) : 2;
  const stage = getRecoveryStage(pDay);

  // Load Recent Logs for Data-driven Recommendations
  let hasPain = false;
  let painScoreVal = 0;
  try {
    const rawPain = localStorage.getItem("bloomnest_pain_logs_v1");
    if (rawPain) {
      const logs = JSON.parse(rawPain);
      if (logs.length > 0) {
        hasPain = true;
        painScoreVal = logs[0].pain;
      }
    }
  } catch {}

  let hasCSection = profile?.deliveryType === "c_section";

  // Map and personalize topics
  const topicsWithRationale: EducationTopic[] = POSTPARTUM_EDUCATION_DATABASE.map((t) => {
    let customRationale = `Recommended for Postpartum Day ${pDay} (${stage.title}).`;

    if (t.topicId === "edu_lochia_progression") {
      customRationale = `Recommended for Day ${pDay} to understand expected bleeding transitions from Rubra to Serosa.`;
    } else if (t.topicId === "edu_pain_cramping" && hasPain) {
      customRationale = `Recommended because you recently logged a pain score of ${painScoreVal}/10 in Feature 6.`;
    } else if (t.topicId === "edu_csection_care" && hasCSection) {
      customRationale = `Recommended because your profile records a C-section delivery context (Feature 1).`;
    } else if (t.topicId === "edu_breastfeeding_latch") {
      customRationale = `Recommended for Week ${pWeek} lactation positioning and nipple protection.`;
    } else if (t.topicId === "edu_diaper_output_hydration") {
      customRationale = `Recommended for tracking newborn hydration markers in Feature 11.`;
    } else if (t.topicId === "edu_postpartum_blues_mood") {
      customRationale = `Recommended for understanding emotional adjustment during early postpartum.`;
    }

    return {
      ...t,
      whySeeingThis: customRationale,
    };
  });

  // Categorize Topics
  const learnTodayTopics = topicsWithRationale.slice(0, 3);
  const basedOnRecordsTopics = topicsWithRationale.filter(
    (t) =>
      (t.topicId === "edu_pain_cramping" && hasPain) ||
      (t.topicId === "edu_csection_care" && hasCSection) ||
      t.topicId === "edu_lochia_progression" ||
      t.topicId === "edu_breastfeeding_latch"
  );

  const motherRecoveryTopics = topicsWithRationale.filter((t) => t.category === "mother_recovery" || t.category === "sleep_fatigue" || t.category === "mood_wellbeing" || t.category === "nutrition_hydration");
  const babyCareTopics = topicsWithRationale.filter((t) => t.category === "baby_care" || t.category === "breastfeeding_lactation");

  const savedTopics = topicsWithRationale.filter((t) => history[t.topicId]?.isSaved);
  const completedCount = Object.values(history).filter((h) => h.isCompleted).length;

  return {
    evaluatedAt: new Date().toISOString(),
    learnTodayTopics,
    basedOnRecordsTopics,
    motherRecoveryTopics,
    babyCareTopics,
    savedTopics,
    completedCount,
  };
}

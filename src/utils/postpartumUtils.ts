import { PostpartumProfile, PostpartumContext, PostpartumDeliveryType } from "../types";

export type RecoveryStageKey = "immediate_recovery" | "early_recovery" | "ongoing_recovery" | "extended_postpartum";

export interface RecoveryStageInfo {
  key: RecoveryStageKey;
  stageNumber: 1 | 2 | 3 | 4;
  title: string;
  dayRange: string;
  focusPoints: string[];
  description: string;
  guidanceCategories: {
    title: string;
    items: string[];
  }[];
}

/**
 * Calculates current Postpartum Day (Delivery Date = Day 0)
 * Uses currentDate - deliveryDate
 */
export function calculatePostpartumDay(deliveryDateStr: string | Date, referenceDateStr?: string | Date): number {
  if (!deliveryDateStr) return 0;
  const delivery = new Date(deliveryDateStr);
  const ref = referenceDateStr ? new Date(referenceDateStr) : new Date();

  // Reset to midnight UTC to compare calendar days accurately
  const delMidnight = new Date(Date.UTC(delivery.getFullYear(), delivery.getMonth(), delivery.getDate()));
  const refMidnight = new Date(Date.UTC(ref.getFullYear(), ref.getMonth(), ref.getDate()));

  const diffMs = refMidnight.getTime() - delMidnight.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays < 0 ? 0 : diffDays;
}

/**
 * Calculates current Postpartum Week
 * Days 0-6 -> Week 1, Days 7-13 -> Week 2, Days 14-20 -> Week 3, etc.
 */
export function calculatePostpartumWeek(postpartumDay: number): number {
  if (postpartumDay < 0) return 1;
  return Math.floor(postpartumDay / 7) + 1;
}

/**
 * Formats user-friendly time string, e.g. "1 week + 5 days postpartum"
 */
export function formatPostpartumTime(postpartumDay: number): { weeks: number; days: number; formatted: string } {
  const safeDay = Math.max(0, postpartumDay);
  const weeks = Math.floor(safeDay / 7);
  const days = safeDay % 7;

  if (weeks === 0) {
    return { weeks: 0, days, formatted: `${days} ${days === 1 ? "day" : "days"} postpartum` };
  }
  if (days === 0) {
    return { weeks, days: 0, formatted: `${weeks} ${weeks === 1 ? "week" : "weeks"} postpartum` };
  }
  return {
    weeks,
    days,
    formatted: `${weeks} ${weeks === 1 ? "week" : "weeks"} + ${days} ${days === 1 ? "day" : "days"} postpartum`,
  };
}

/**
 * Formats user-friendly baby age string, e.g. "1 day old", "2 weeks old"
 */
export function formatBabyAge(babyAgeDays: number): { weeks: number; days: number; formatted: string } {
  const safeDay = Math.max(0, babyAgeDays);
  const weeks = Math.floor(safeDay / 7);
  const days = safeDay % 7;

  if (weeks === 0) {
    return { weeks: 0, days, formatted: `${days} ${days === 1 ? "day" : "days"} old` };
  }
  if (days === 0) {
    return { weeks, days: 0, formatted: `${weeks} ${weeks === 1 ? "week" : "weeks"} old` };
  }
  return {
    weeks,
    days,
    formatted: `${weeks} ${weeks === 1 ? "week" : "weeks"} + ${days} ${days === 1 ? "day" : "days"} old`,
  };
}

/**
 * Gets exact recovery stage based on non-overlapping day ranges:
 * 0–6   -> Stage 1: Immediate Recovery
 * 7–14  -> Stage 2: Early Recovery
 * 15–42 -> Stage 3: Ongoing Recovery
 * >42   -> Stage 4: Extended Postpartum
 */
export function getRecoveryStage(postpartumDay: number): RecoveryStageInfo {
  const day = Math.max(0, postpartumDay);

  if (day <= 6) {
    return {
      key: "immediate_recovery",
      stageNumber: 1,
      title: "Immediate Recovery",
      dayRange: "Days 0–6",
      description: "Focus on maximum physical rest, uterine involution, bleeding monitoring, and initiating infant feeding.",
      focusPoints: ["Rest & Sleep", "Bleeding Monitoring (Lochia)", "Pain & Perineal/Incision Care", "Feeding Support", "Hydration"],
      guidanceCategories: [
        {
          title: "Rest & Physical Healing",
          items: [
            "Prioritize lying flat or resting whenever baby sleeps to support uterine involution.",
            "Use ice packs or witch hazel pads for perineal relief as recommended by your care team.",
            "Avoid lifting anything heavier than your baby.",
          ],
        },
        {
          title: "Bleeding & Pain Tracking",
          items: [
            "Lochia rubra (bright red bleeding) is expected during week 1.",
            "Take prescribed pain medications strictly on schedule if recommended by your physician.",
            "Contact your healthcare provider if you soak more than 1 heavy pad per hour for 2 consecutive hours.",
          ],
        },
        {
          title: "Hydration & Fluid Intake",
          items: [
            "Aim for 2.5 to 3 liters of water daily, especially if breastfeeding.",
            "Keep warm fluids and electrolyte-rich broths near your resting area.",
          ],
        },
      ],
    };
  }

  if (day <= 14) {
    return {
      key: "early_recovery",
      stageNumber: 2,
      title: "Early Recovery",
      dayRange: "Days 7–14",
      description: "Focus on incision/wound healing progression, milk supply stabilization, emotional adjustment, and gentle mobility.",
      focusPoints: ["Wound & Incision Monitoring", "Sleep & Fatigue", "Emotional Mood Check", "Nourishing Foods", "Follow-up Preparation"],
      guidanceCategories: [
        {
          title: "Wound & Surgical Care",
          items: [
            "Keep C-section incisions clean, dry, and exposed to air when resting.",
            "Monitor for redness, localized warmth, or unusual drainage around suture lines.",
            "Continue gentle perineal rinse routines after voiding.",
          ],
        },
        {
          title: "Emotional Wellbeing",
          items: [
            "Hormonal shifts around days 3–10 can trigger 'baby blues'. Sharing feelings with loved ones is essential.",
            "Ensure you have at least one dedicated 3-hour sleep stretch daily if possible.",
          ],
        },
        {
          title: "Nutrition & Bowel Care",
          items: [
            "Eat fiber-rich warm foods, legumes, and healthy fats to ease bowel movements.",
            "Continue prenatal vitamins or postpartum iron supplements as prescribed.",
          ],
        },
      ],
    };
  }

  if (day <= 42) {
    return {
      key: "ongoing_recovery",
      stageNumber: 3,
      title: "Ongoing Recovery",
      dayRange: "Days 15–42",
      description: "Focus on gradual energy rebuilding, light walking, pelvic floor awareness, and preparing for 6-week postpartum checkup.",
      focusPoints: ["Energy Rebuilding", "Gentle Mobility", "Emotional Wellbeing", "Recovery Trends", "6-Week Checkup Preparation"],
      guidanceCategories: [
        {
          title: "Mobility & Strength",
          items: [
            "Engage in short, relaxed walking if comfortable.",
            "Practice gentle pelvic floor Kegel activations without straining core muscles.",
          ],
        },
        {
          title: "Mood & Recovery Trends",
          items: [
            "Lochia transitions from serosa (pinkish/brown) to alba (yellowish/white).",
            "Monitor for lingering anxiety, sadness, or extreme exhaustion that lasts beyond 2 weeks.",
          ],
        },
        {
          title: "Healthcare Follow-Up",
          items: [
            "Write down questions for your upcoming 6-week obstetric/gynaecology appointment.",
            "Discuss family planning options and physical activity clearance with your provider.",
          ],
        },
      ],
    };
  }

  return {
    key: "extended_postpartum",
    stageNumber: 4,
    title: "Extended Postpartum",
    dayRange: "After Day 42",
    description: "Focus on longer-term maternal wellness, gradual return to routine, infant routine consolidation, and ongoing self-care.",
    focusPoints: ["Continued Recovery", "Long-term Wellbeing", "Return to Routine", "Ongoing Follow-up", "Nutritional Reconstitution"],
    guidanceCategories: [
      {
        title: "Long-term Maternal Health",
        items: [
          "Gradually reintroduce core & cardiovascular exercises after receiving clinical clearance.",
          "Maintain balanced nutrition to support prolonged lactation and bone density.",
        ],
      },
      {
        title: "Routine Integration",
        items: [
          "Establish sustainable sleep and feeding routines with partner or support family.",
          "Schedule annual wellness checkups and screen for delayed postpartum thyroid or iron imbalances.",
        ],
      },
    ],
  };
}

/**
 * Formats delivery type label for user UI
 */
export function formatDeliveryType(type: PostpartumDeliveryType): string {
  switch (type) {
    case "vaginal":
      return "Vaginal Delivery";
    case "c_section":
      return "C-Section";
    case "assisted_vaginal":
      return "Assisted Vaginal Delivery";
    case "other":
    default:
      return "Other / Custom Delivery";
  }
}

/**
 * Constructs clean PostpartumContext data object for future AI Agents
 */
export function getPostpartumContext(profile: PostpartumProfile): PostpartumContext {
  const postpartumDay = calculatePostpartumDay(profile.deliveryDate);
  const postpartumWeek = calculatePostpartumWeek(postpartumDay);
  const stageInfo = getRecoveryStage(postpartumDay);

  return {
    deliveryDate: profile.deliveryDate,
    deliveryType: profile.deliveryType,
    postpartumDay,
    postpartumWeek,
    recoveryStage: stageInfo.key,
    numberOfBabies: profile.numberOfBabies || 1,
    babyBirthDate: profile.babyBirthDate || profile.deliveryDate,
    deliveryLocation: profile.deliveryLocation,
    healthcareProvider: profile.healthcareProvider,
    hospital: profile.hospital,
    notes: profile.notes,
  };
}

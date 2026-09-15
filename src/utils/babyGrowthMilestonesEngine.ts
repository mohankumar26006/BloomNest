import {
  GrowthRecord,
  MilestoneDefinition,
  MilestoneObservation,
  MilestoneStatus,
  MilestoneCategory,
  BabyGrowthSummary,
  GrowthMeasurementSource,
} from "../types";

const STORAGE_KEY_GROWTH = "bloomnest_baby_growth_records_v1";
const STORAGE_KEY_MILESTONES = "bloomnest_baby_milestone_obs_v1";

// ==========================================
// TRUSTED DEVELOPMENTAL MILESTONES DATABASE
// (Based on CDC & AAP Developmental Guidance)
// ==========================================

export const BUILTIN_MILESTONES: MilestoneDefinition[] = [
  // 0 - 2 MONTHS (WEEKS 0 - 8)
  {
    milestoneId: "ms_m1_head_control",
    title: "Briefly Lifts Head During Tummy Time",
    category: "GROSS_MOTOR",
    ageRangeWeeks: [0, 8],
    ageRangeLabel: "0 - 2 Months",
    description: "Lifts head briefly off the surface when placed on belly during supervised tummy time.",
    tipsForParents: "Start tummy time for 2-3 minutes at a time while baby is awake and supervised.",
  },
  {
    milestoneId: "ms_fm1_hands_fisted",
    title: "Opens & Closes Hands",
    category: "FINE_MOTOR",
    ageRangeWeeks: [0, 8],
    ageRangeLabel: "0 - 2 Months",
    description: "Moves arms together and occasionally uncurls fists from tight newborn grasp.",
    tipsForParents: "Gently place your finger in baby's palm to encourage grasp reflex.",
  },
  {
    milestoneId: "ms_c1_cooing",
    title: "Makes Cooing & Gurgling Sounds",
    category: "COMMUNICATION",
    ageRangeWeeks: [2, 8],
    ageRangeLabel: "0 - 2 Months",
    description: "Produces soft vowel sounds ('ooh', 'aah') in response to talking or soothing voices.",
    tipsForParents: "Talk, sing, and respond to your baby's vocalizations with gentle eye contact.",
  },
  {
    milestoneId: "ms_se1_social_smile",
    title: "First Social Smile",
    category: "SOCIAL_EMOTIONAL",
    ageRangeWeeks: [4, 8],
    ageRangeLabel: "1 - 2 Months",
    description: "Smiles intentionally in response to your face or comforting voice.",
    tipsForParents: "Smile warmly at baby during eye contact, feeding, and diaper changes.",
  },
  {
    milestoneId: "ms_cog1_visual_tracking",
    title: "Tracks Moving Objects or Faces",
    category: "COGNITIVE",
    ageRangeWeeks: [2, 8],
    ageRangeLabel: "0 - 2 Months",
    description: "Follows a high-contrast toy or your moving face across their line of sight.",
    tipsForParents: "Hold black-and-white contrast cards or your face about 8-12 inches from baby's eyes.",
  },

  // 2 - 4 MONTHS (WEEKS 8 - 16)
  {
    milestoneId: "ms_gm2_pushes_up",
    title: "Pushes Up on Forearms During Tummy Time",
    category: "GROSS_MOTOR",
    ageRangeWeeks: [8, 16],
    ageRangeLabel: "2 - 4 Months",
    description: "Pushes chest up from surface with elbows positioned under shoulders.",
    tipsForParents: "Place a rolled towel under baby's chest during tummy time for comfort.",
  },
  {
    milestoneId: "ms_fm2_reaches_toy",
    title: "Reaches for dangling toys",
    category: "FINE_MOTOR",
    ageRangeWeeks: [8, 16],
    ageRangeLabel: "2 - 4 Months",
    description: "Swats at or reaches toward toys hanging above activity gym or crib.",
    tipsForParents: "Place play arches above baby during play time to encourage reaching.",
  },
  {
    milestoneId: "ms_c2_turns_to_sound",
    title: "Turns Head Toward Voice or Sounds",
    category: "COMMUNICATION",
    ageRangeWeeks: [8, 16],
    ageRangeLabel: "2 - 4 Months",
    description: "Turns head left or right when hearing familiar voices or gentle rattles.",
    tipsForParents: "Shake a quiet rattle on one side and call your baby's name gently.",
  },
  {
    milestoneId: "ms_se2_laughs",
    title: "Chuckles & Expresses Joy",
    category: "SOCIAL_EMOTIONAL",
    ageRangeWeeks: [10, 16],
    ageRangeLabel: "2 - 4 Months",
    description: "Smiles broadly, chuckles, or makes excited squealing sounds during play.",
    tipsForParents: "Play peek-a-boo and make gentle silly sounds to spark laughter.",
  },
  {
    milestoneId: "ms_cog2_hands_mouth",
    title: "Brings Hands to Mouth to Explore",
    category: "COGNITIVE",
    ageRangeWeeks: [8, 16],
    ageRangeLabel: "2 - 4 Months",
    description: "Brings fists or fingers to mouth deliberately as part of self-soothing and sensorimotor discovery.",
    tipsForParents: "Keep baby's hands clean and provide safe, soft teether rings.",
  },

  // 4 - 6 MONTHS (WEEKS 16 - 24)
  {
    milestoneId: "ms_gm3_rolls_over",
    title: "Rolls Over (Tummy to Back / Back to Tummy)",
    category: "GROSS_MOTOR",
    ageRangeWeeks: [16, 24],
    ageRangeLabel: "4 - 6 Months",
    description: "Rolls from belly to back or back to belly independently.",
    tipsForParents: "Provide safe floor space on a mat. Stop swaddling once baby shows signs of rolling.",
  },
  {
    milestoneId: "ms_fm3_transfers_hand",
    title: "Transfers Toys From One Hand to Another",
    category: "FINE_MOTOR",
    ageRangeWeeks: [16, 24],
    ageRangeLabel: "4 - 6 Months",
    description: "Passes a small toy or teether from right hand to left hand smoothly.",
    tipsForParents: "Offer lightweight rattles or textured rings directly into baby's hands.",
  },
  {
    milestoneId: "ms_c3_babbles_consonants",
    title: "Babbles with Consonant Sounds ('ba-ba', 'ma-ma')",
    category: "COMMUNICATION",
    ageRangeWeeks: [16, 24],
    ageRangeLabel: "4 - 6 Months",
    description: "Repeats consonant sounds like 'm', 'b', 'p' when cooing or playing.",
    tipsForParents: "Repeat baby's babbling sounds back to them in conversational rhythm.",
  },
  {
    milestoneId: "ms_se3_recognizes_caregivers",
    title: "Recognizes Familiar People & Caregivers",
    category: "SOCIAL_EMOTIONAL",
    ageRangeWeeks: [16, 24],
    ageRangeLabel: "4 - 6 Months",
    description: "Shows excitement when seeing parents/caregivers and reacts differently to strangers.",
    tipsForParents: "Encourage gentle introductions with extended family and friends.",
  },
  {
    milestoneId: "ms_cog3_looks_at_dropped",
    title: "Looks Down When a Toy Drops",
    category: "COGNITIVE",
    ageRangeWeeks: [16, 24],
    ageRangeLabel: "4 - 6 Months",
    description: "Tracks objects as they fall, demonstrating early cause-and-effect understanding.",
    tipsForParents: "Play dropping games with soft toys into a safe basket.",
  },
];

// ==========================================
// LOCAL STORAGE DATA ACCESS HELPERS
// ==========================================

export function getGrowthRecords(babyId: string): GrowthRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GROWTH);
    if (!raw) {
      const seeded = getInitialSeededGrowthRecords(babyId);
      localStorage.setItem(STORAGE_KEY_GROWTH, JSON.stringify(seeded));
      return seeded.filter((r) => r.babyId === babyId);
    }
    const parsed: GrowthRecord[] = JSON.parse(raw);
    const filtered = parsed.filter((r) => r.babyId === babyId);

    if (filtered.length === 0) {
      const seeded = getInitialSeededGrowthRecords(babyId);
      const updated = [...parsed, ...seeded];
      localStorage.setItem(STORAGE_KEY_GROWTH, JSON.stringify(updated));
      return seeded;
    }

    return filtered.sort((a, b) => new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime());
  } catch (err) {
    console.error("Error reading growth records:", err);
    return [];
  }
}

export function saveGrowthRecord(record: Omit<GrowthRecord, "growthRecordId" | "recordedAt">): GrowthRecord {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GROWTH);
    const existing: GrowthRecord[] = raw ? JSON.parse(raw) : [];

    const newRecord: GrowthRecord = {
      ...record,
      growthRecordId: `gr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      recordedAt: new Date().toISOString(),
    };

    existing.push(newRecord);
    localStorage.setItem(STORAGE_KEY_GROWTH, JSON.stringify(existing));
    return newRecord;
  } catch (err) {
    console.error("Error saving growth record:", err);
    throw err;
  }
}

export function deleteGrowthRecord(growthRecordId: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GROWTH);
    if (!raw) return;
    const existing: GrowthRecord[] = JSON.parse(raw);
    const filtered = existing.filter((r) => r.growthRecordId !== growthRecordId);
    localStorage.setItem(STORAGE_KEY_GROWTH, JSON.stringify(filtered));
  } catch (err) {
    console.error("Error deleting growth record:", err);
  }
}

// Milestone Observations Storage
export function getMilestoneObservations(babyId: string): MilestoneObservation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MILESTONES);
    if (!raw) {
      const seeded = getInitialSeededMilestones(babyId);
      localStorage.setItem(STORAGE_KEY_MILESTONES, JSON.stringify(seeded));
      return seeded.filter((m) => m.babyId === babyId);
    }
    const parsed: MilestoneObservation[] = JSON.parse(raw);
    const filtered = parsed.filter((m) => m.babyId === babyId);

    if (filtered.length === 0) {
      const seeded = getInitialSeededMilestones(babyId);
      const updated = [...parsed, ...seeded];
      localStorage.setItem(STORAGE_KEY_MILESTONES, JSON.stringify(updated));
      return seeded;
    }

    return filtered;
  } catch (err) {
    console.error("Error reading milestone observations:", err);
    return [];
  }
}

export function updateMilestoneStatus(
  babyId: string,
  milestoneId: string,
  status: MilestoneStatus,
  notes?: string
): MilestoneObservation {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MILESTONES);
    const existing: MilestoneObservation[] = raw ? JSON.parse(raw) : [];

    const index = existing.findIndex((m) => m.babyId === babyId && m.milestoneId === milestoneId);
    const today = new Date().toISOString().split("T")[0];

    let updated: MilestoneObservation;

    if (index >= 0) {
      updated = {
        ...existing[index],
        status,
        userNotes: notes !== undefined ? notes : existing[index].userNotes,
        firstObservedAt:
          status === "OBSERVED" || status === "CONSISTENTLY_OBSERVED"
            ? existing[index].firstObservedAt || today
            : existing[index].firstObservedAt,
        consistentlyObservedAt:
          status === "CONSISTENTLY_OBSERVED" ? today : existing[index].consistentlyObservedAt,
      };
      existing[index] = updated;
    } else {
      updated = {
        observationId: `mo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        babyId,
        milestoneId,
        status,
        firstObservedAt: status === "OBSERVED" || status === "CONSISTENTLY_OBSERVED" ? today : undefined,
        consistentlyObservedAt: status === "CONSISTENTLY_OBSERVED" ? today : undefined,
        userNotes: notes,
      };
      existing.push(updated);
    }

    localStorage.setItem(STORAGE_KEY_MILESTONES, JSON.stringify(existing));
    return updated;
  } catch (err) {
    console.error("Error updating milestone status:", err);
    throw err;
  }
}

// Initial Seed Generators
function getInitialSeededGrowthRecords(babyId: string): GrowthRecord[] {
  const today = new Date();
  const d1 = new Date(today);
  d1.setDate(d1.getDate() - 14); // Birth 2 weeks ago
  const d2 = new Date(today);
  d2.setDate(d2.getDate() - 10); // Day 4 visit
  const d3 = new Date(today);
  d3.setDate(d3.getDate() - 2); // Day 12 pediatric check

  return [
    {
      growthRecordId: `gr_seed_1_${babyId}`,
      babyId,
      recordedAt: d1.toISOString(),
      measurementDate: d1.toISOString().split("T")[0],
      weightKg: 3.2,
      lengthCm: 50.0,
      headCircumferenceCm: 34.5,
      measurementSource: "PEDIATRICIAN_VISIT",
      measurementLocation: "City Hospital Delivery Ward",
      measurementNotes: "Birth measurement recorded in medical chart.",
    },
    {
      growthRecordId: `gr_seed_2_${babyId}`,
      babyId,
      recordedAt: d2.toISOString(),
      measurementDate: d2.toISOString().split("T")[0],
      weightKg: 3.05,
      lengthCm: 50.2,
      headCircumferenceCm: 34.7,
      measurementSource: "PEDIATRICIAN_VISIT",
      measurementLocation: "Pediatric Clinic - Day 4 Checkup",
      measurementNotes: "Expected initial physiological weight dip (approx 4.6% birth weight). Feeding active.",
    },
    {
      growthRecordId: `gr_seed_3_${babyId}`,
      babyId,
      recordedAt: d3.toISOString(),
      measurementDate: d3.toISOString().split("T")[0],
      weightKg: 3.42,
      lengthCm: 51.0,
      headCircumferenceCm: 35.2,
      measurementSource: "PEDIATRICIAN_VISIT",
      measurementLocation: "Pediatric Clinic - 2 Week Visit",
      measurementNotes: "Regained birth weight + 220g increase. Good head circumference growth.",
    },
  ];
}

function getInitialSeededMilestones(babyId: string): MilestoneObservation[] {
  const today = new Date().toISOString().split("T")[0];
  return [
    {
      observationId: `mo_seed_1_${babyId}`,
      babyId,
      milestoneId: "ms_m1_head_control",
      status: "OBSERVED",
      firstObservedAt: today,
      userNotes: "Lifts head briefly during 3-min tummy time session on play mat.",
      isFirstMemory: true,
    },
    {
      observationId: `mo_seed_2_${babyId}`,
      babyId,
      milestoneId: "ms_fm1_hands_fisted",
      status: "CONSISTENTLY_OBSERVED",
      firstObservedAt: today,
      userNotes: "Grasps mother's pinky finger firmly during feedings.",
    },
    {
      observationId: `mo_seed_3_${babyId}`,
      babyId,
      milestoneId: "ms_c1_cooing",
      status: "OBSERVED",
      firstObservedAt: today,
      userNotes: "Made cute 'ooh' sounds after morning nursing.",
      isFirstMemory: true,
    },
    {
      observationId: `mo_seed_4_${babyId}`,
      babyId,
      milestoneId: "ms_se1_social_smile",
      status: "NOT_YET_OBSERVED",
      userNotes: "Reacting to voices with eye contact.",
    },
    {
      observationId: `mo_seed_5_${babyId}`,
      babyId,
      milestoneId: "ms_cog1_visual_tracking",
      status: "OBSERVED",
      firstObservedAt: today,
      userNotes: "Follows black & white flashcards slowly.",
    },
  ];
}

// ==========================================
// SUMMARY ENGINE CALCULATOR
// ==========================================

export function getBabyGrowthSummary(
  babyId: string,
  babyName: string,
  birthDateStr: string,
  canonicalBirthWeightKg?: number,
  canonicalBirthLengthCm?: number
): BabyGrowthSummary {
  const records = getGrowthRecords(babyId);
  const observations = getMilestoneObservations(babyId);

  const birthDate = new Date(birthDateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - birthDate.getTime());
  const ageDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  const ageWeeks = Math.max(1, Math.floor(ageDays / 7));

  // Sort growth records chronologically (oldest to newest)
  const chronoRecords = [...records].sort(
    (a, b) => new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime()
  );

  const latest = chronoRecords.length > 0 ? chronoRecords[chronoRecords.length - 1] : null;
  const previous = chronoRecords.length > 1 ? chronoRecords[chronoRecords.length - 2] : null;

  const birthWeightKg = canonicalBirthWeightKg || (chronoRecords.length > 0 ? chronoRecords[0].weightKg : undefined);
  const birthLengthCm = canonicalBirthLengthCm || (chronoRecords.length > 0 ? chronoRecords[0].lengthCm : undefined);

  let recordedWeightChangeKg: number | undefined = undefined;
  if (latest && latest.weightKg !== undefined && previous && previous.weightKg !== undefined) {
    recordedWeightChangeKg = Number((latest.weightKg - previous.weightKg).toFixed(2));
  } else if (latest && latest.weightKg !== undefined && birthWeightKg !== undefined) {
    recordedWeightChangeKg = Number((latest.weightKg - birthWeightKg).toFixed(2));
  }

  const observedCount = observations.filter(
    (o) => o.status === "OBSERVED" || o.status === "CONSISTENTLY_OBSERVED"
  ).length;

  const discussCount = observations.filter((o) => o.status === "DISCUSS_WITH_PEDIA").length;
  const pendingCount = BUILTIN_MILESTONES.length - observedCount;

  return {
    babyId,
    babyName: babyName || "Baby",
    ageDays,
    ageWeeks,
    birthWeightKg,
    birthLengthCm,
    latestWeightKg: latest?.weightKg,
    latestLengthCm: latest?.lengthCm,
    latestHeadCircumferenceCm: latest?.headCircumferenceCm,
    latestMeasurementDate: latest?.measurementDate,
    previousWeightKg: previous?.weightKg,
    recordedWeightChangeKg,
    totalMeasurementsCount: records.length,
    observedMilestonesCount: observedCount,
    pendingMilestonesCount: Math.max(0, pendingCount),
    itemsToDiscussWithPediaCount: discussCount,
  };
}

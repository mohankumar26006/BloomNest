import {
  CareCoordinationItem,
  CareTeamMember,
  CareCoordinationSummary,
  CareCoordinationStatus,
  CareCoordinationPriority,
  CareActionType,
} from "../types";

const STORAGE_KEY_ITEMS = "bloomnest_care_coordination_items_v1";
const STORAGE_KEY_TEAM = "bloomnest_care_team_v1";

// ==========================================
// SEEDED INITIAL CARE TEAM MEMBERS
// ==========================================

function getInitialSeededCareTeam(): CareTeamMember[] {
  return [
    {
      memberId: "ctm_pedia_1",
      name: "Dr. A. Sharma, MD Pediatrics",
      role: "PEDIATRICIAN",
      specialty: "Newborn & Infant Care Specialist",
      clinicName: "City Children's Hospital Clinic",
      phone: "+91 98765 43210",
      email: "dr.sharma@citychildrens.org",
      notes: "Primary pediatrician for Baby A.",
    },
    {
      memberId: "ctm_obgyn_1",
      name: "Dr. M. Iyer, DGO, MD OB-GYN",
      role: "OBSTETRICIAN",
      specialty: "Maternal-Fetal Recovery Specialist",
      clinicName: "City Women's & General Hospital",
      phone: "+91 98765 12345",
      email: "dr.iyer@citywomens.org",
      notes: "Attending obstetrician during delivery and postpartum 6-week recovery checkup.",
    },
    {
      memberId: "ctm_lactation_1",
      name: "Sarah Jenkins, IBCLC",
      role: "LACTATION_CONSULTANT",
      specialty: "Lactation & Newborn Feeding Support",
      clinicName: "BloomNest Lactation Care Center",
      phone: "+91 98765 88888",
      email: "sarah.jenkins@bloomnest.org",
      notes: "Lactation consultant for latching comfort and nursing guidance.",
    },
  ];
}

// ==========================================
// SEEDED INITIAL CARE COORDINATION ITEMS
// ==========================================

function getInitialSeededItems(): CareCoordinationItem[] {
  const today = new Date();
  const dNextWeek = new Date(today);
  dNextWeek.setDate(dNextWeek.getDate() + 7);
  const dTomorrow = new Date(today);
  dTomorrow.setDate(dTomorrow.getDate() + 1);

  return [
    {
      coordinationId: "coord_1_prep_brief",
      createdAt: today.toISOString(),
      updatedAt: today.toISOString(),
      personType: "MOTHER",
      category: "DOCTOR_BRIEF",
      title: "Prepare Doctor Brief for 6-Week Postpartum Recovery Check",
      description: "Synthesize physical recovery ratings, lochia changes, and pain records for Dr. M. Iyer's upcoming checkup.",
      priority: "HIGH",
      status: "ACTION_REQUIRED",
      sourceFeature: "Feature 18",
      sourceRecordIds: ["db_summary_14d"],
      actionType: "PREPARE_DOCTOR_BRIEF",
      dueDate: dNextWeek.toISOString().split("T")[0],
      careTeamMemberId: "ctm_obgyn_1",
      linkedDoctorBriefId: "db_summary_14d",
      userNotes: "Include recent nursing discomfort questions.",
    },
    {
      coordinationId: "coord_2_vax_check",
      createdAt: today.toISOString(),
      updatedAt: today.toISOString(),
      personType: "BABY",
      category: "VACCINATION",
      title: "Verify Baby A's 6-Week Immunization Schedule",
      description: "Confirm appointment date for Pentavalent-1, fIPV-1, Rotavirus-1, and PCV-1 doses.",
      priority: "MEDIUM",
      status: "SCHEDULED",
      sourceFeature: "Feature 28",
      sourceRecordIds: ["vac_dtp_1", "vac_ipv_1"],
      actionType: "VERIFY_VACCINE_RECORD",
      dueDate: dNextWeek.toISOString().split("T")[0],
      careTeamMemberId: "ctm_pedia_1",
      linkedAppointmentId: "apt_pedia_6w",
    },
    {
      coordinationId: "coord_3_latch_followup",
      createdAt: today.toISOString(),
      updatedAt: today.toISOString(),
      personType: "MOTHER",
      category: "FOLLOW_UP",
      title: "Breastfeeding Latch Comfort Follow-Up",
      description: "Monitor evening nursing sessions following lactation consultation advice.",
      priority: "HIGH",
      status: "IN_PROGRESS",
      sourceFeature: "Feature 24",
      sourceRecordIds: ["fu_802_latch"],
      actionType: "COMPLETE_FOLLOW_UP",
      dueDate: dTomorrow.toISOString().split("T")[0],
      careTeamMemberId: "ctm_lactation_1",
      linkedFollowUpId: "fu_802_latch",
      userNotes: "Apply warm compress prior to latching.",
    },
    {
      coordinationId: "coord_4_growth_recheck",
      createdAt: today.toISOString(),
      updatedAt: today.toISOString(),
      personType: "BABY",
      category: "GROWTH",
      title: "Log 1-Month Weight & Length Measurement",
      description: "Record new weight and head circumference check at pediatric clinic.",
      priority: "MEDIUM",
      status: "NEEDS_REVIEW",
      sourceFeature: "Feature 27",
      sourceRecordIds: ["gr_seed_3_baby_1"],
      actionType: "LOG_GROWTH_CHECK",
      dueDate: dTomorrow.toISOString().split("T")[0],
      careTeamMemberId: "ctm_pedia_1",
    },
    {
      coordinationId: "coord_5_wound_safety_done",
      createdAt: today.toISOString(),
      updatedAt: today.toISOString(),
      personType: "MOTHER",
      category: "SAFETY",
      title: "2-Week Postpartum Safety Check Completed",
      description: "Clinical Safety Shield review confirmed no fever or heavy lochia warning signs.",
      priority: "ROUTINE",
      status: "COMPLETED",
      sourceFeature: "Feature 04",
      sourceRecordIds: ["safety_eval_004"],
      actionType: "REVIEW_SAFETY_ALERT",
      completedAt: today.toISOString().split("T")[0],
      outcome: "Confirmed normal involution without infectious warning signs.",
    },
  ];
}

// ==========================================
// LOCAL STORAGE ACCESS HELPERS
// ==========================================

export function getCareTeamMembers(): CareTeamMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEAM);
    if (!raw) {
      const seeded = getInitialSeededCareTeam();
      localStorage.setItem(STORAGE_KEY_TEAM, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading care team members:", err);
    return [];
  }
}

export function addCareTeamMember(
  member: Omit<CareTeamMember, "memberId">
): CareTeamMember {
  try {
    const members = getCareTeamMembers();
    const newMember: CareTeamMember = {
      ...member,
      memberId: `ctm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    members.push(newMember);
    localStorage.setItem(STORAGE_KEY_TEAM, JSON.stringify(members));
    return newMember;
  } catch (err) {
    console.error("Error adding care team member:", err);
    throw err;
  }
}

export function getCareCoordinationItems(): CareCoordinationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
    if (!raw) {
      const seeded = getInitialSeededItems();
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(seeded));
      return seeded;
    }
    const parsed: CareCoordinationItem[] = JSON.parse(raw);
    return parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error("Error reading care coordination items:", err);
    return [];
  }
}

export function addCareCoordinationItem(
  item: Omit<CareCoordinationItem, "coordinationId" | "createdAt" | "updatedAt">
): CareCoordinationItem {
  try {
    const items = getCareCoordinationItems();
    const now = new Date().toISOString();

    const newItem: CareCoordinationItem = {
      ...item,
      coordinationId: `coord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };

    items.push(newItem);
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    return newItem;
  } catch (err) {
    console.error("Error adding care coordination item:", err);
    throw err;
  }
}

export function updateCareItemStatus(
  coordinationId: string,
  status: CareCoordinationStatus,
  outcome?: string
): CareCoordinationItem {
  try {
    const items = getCareCoordinationItems();
    const index = items.findIndex((i) => i.coordinationId === coordinationId);
    if (index === -1) throw new Error("Care item not found");

    const now = new Date().toISOString();
    const updated: CareCoordinationItem = {
      ...items[index],
      status,
      updatedAt: now,
      completedAt: status === "COMPLETED" || status === "RESOLVED_CLOSED" ? now.split("T")[0] : items[index].completedAt,
      outcome: outcome !== undefined ? outcome : items[index].outcome,
    };

    items[index] = updated;
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    return updated;
  } catch (err) {
    console.error("Error updating care item status:", err);
    throw err;
  }
}

export function deleteCareCoordinationItem(coordinationId: string): void {
  try {
    const items = getCareCoordinationItems();
    const filtered = items.filter((i) => i.coordinationId !== coordinationId);
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(filtered));
  } catch (err) {
    console.error("Error deleting care coordination item:", err);
  }
}

// ==========================================
// SUMMARY ENGINE CALCULATOR
// ==========================================

export function evaluateCareCoordinationSummary(): CareCoordinationSummary {
  const items = getCareCoordinationItems();
  const team = getCareTeamMembers();

  const needsAttention = items.filter(
    (i) => i.status === "ACTION_REQUIRED" || i.status === "NEEDS_REVIEW" || i.status === "DETECTED"
  ).length;

  const upcoming = items.filter((i) => i.status === "SCHEDULED").length;
  const inProgress = items.filter((i) => i.status === "IN_PROGRESS" || i.status === "AWAITING_OUTCOME").length;
  const completed = items.filter((i) => i.status === "COMPLETED" || i.status === "RESOLVED_CLOSED").length;
  const urgent = items.filter((i) => i.priority === "URGENT").length;

  return {
    totalItemsCount: items.length,
    needsAttentionCount: needsAttention,
    upcomingCount: upcoming,
    inProgressCount: inProgress,
    completedCount: completed,
    urgentCount: urgent,
    careTeamMembersCount: team.length,
  };
}

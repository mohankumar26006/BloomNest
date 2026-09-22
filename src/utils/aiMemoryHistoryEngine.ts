import {
  PatientMemoryItem,
  PatientHistorySummary,
  MemoryType,
  MemoryConfidence,
  MemoryVisibility,
} from "../types";

const STORAGE_KEY_MEMORY = "bloomnest_ai_memory_graph_v1";

// ==========================================
// INITIAL SEEDED MEMORY GRAPH
// (References Features 1–28 Source Records)
// ==========================================

function getInitialSeededMemories(): PatientMemoryItem[] {
  const today = new Date();
  const d1 = new Date(today);
  d1.setDate(d1.getDate() - 14); // 2 weeks ago
  const d2 = new Date(today);
  d2.setDate(d2.getDate() - 10);
  const d3 = new Date(today);
  d3.setDate(d3.getDate() - 4);
  const d4 = new Date(today);
  d4.setDate(d4.getDate() - 1);

  const birthDateStr = d1.toISOString().split("T")[0];

  return [
    {
      memoryId: "mem_ctx_delivery",
      createdAt: d1.toISOString(),
      updatedAt: d1.toISOString(),
      memoryType: "PATIENT_CONTEXT",
      category: "MOTHER",
      title: "Delivery & Postpartum Journey Start",
      summary: `Vaginal delivery completed on ${birthDateStr}. Mother & Baby A birth records established.`,
      sourceFeature: "Feature 01",
      sourceRecordIds: ["profile_postpartum_main"],
      eventDate: birthDateStr,
      importance: "HIGH",
      confidence: "DIRECT_RECORDED",
      status: "ACTIVE",
      userConfirmed: true,
      visibility: "USER_SELECTED_FOR_DOCTOR",
      notes: "Canonical postpartum timeline anchor date.",
    },
    {
      memoryId: "mem_vac_birth",
      createdAt: d1.toISOString(),
      updatedAt: d1.toISOString(),
      memoryType: "CARE_EVENT",
      category: "BABY",
      title: "Newborn Birth Immunizations Administered",
      summary: "BCG, OPV-0, and Hepatitis B birth doses documented from hospital discharge record.",
      sourceFeature: "Feature 28",
      sourceRecordIds: ["vr_seed_bcg_baby_1", "vr_seed_opv_baby_1", "vr_seed_hepb_baby_1"],
      eventDate: birthDateStr,
      importance: "HIGH",
      confidence: "PROVIDER_VERIFIED",
      status: "RESOLVED",
      userConfirmed: true,
      visibility: "USER_SELECTED_FOR_DOCTOR",
      notes: "Provider verified in hospital discharge card.",
    },
    {
      memoryId: "mem_pain_dip",
      createdAt: d2.toISOString(),
      updatedAt: d2.toISOString(),
      memoryType: "SYMPTOM_HISTORY",
      category: "MOTHER",
      title: "Initial Postpartum Abdominal Cramping",
      summary: "Pain score 6/10 recorded on Day 4 following nursing sessions. Safety Shield evaluated normal involution cramping.",
      sourceFeature: "Feature 06",
      sourceRecordIds: ["pain_rec_004"],
      eventDate: d2.toISOString().split("T")[0],
      importance: "MEDIUM",
      confidence: "DIRECT_RECORDED",
      status: "RESOLVED",
      userConfirmed: fontConfirm(true),
      linkedSafetyReference: "safety_eval_004",
      visibility: "APP_ONLY",
      notes: "Responded well to warm compress and prescribed hydration.",
    },
    {
      memoryId: "mem_bf_concern",
      createdAt: d3.toISOString(),
      updatedAt: d4.toISOString(),
      memoryType: "CONCERN",
      category: "MOTHER",
      title: "Nipple Latch Comfort Monitoring",
      summary: "Latching discomfort reported during evening feedings. Care continuity follow-up thread active.",
      sourceFeature: "Feature 08",
      sourceRecordIds: ["bf_session_802"],
      eventDate: d3.toISOString().split("T")[0],
      importance: "HIGH",
      confidence: "USER_ENTERED",
      status: "UNDER_MONITORING",
      userConfirmed: true,
      linkedFollowUpId: "fu_802_latch",
      visibility: "USER_SELECTED_FOR_DOCTOR",
      notes: "Lactation consultant visit recommended if persistent.",
    },
    {
      memoryId: "mem_pedia_visit",
      createdAt: d4.toISOString(),
      updatedAt: d4.toISOString(),
      memoryType: "APPOINTMENT_OUTCOME",
      category: "CARE_JOURNEY",
      title: "2-Week Pediatric Checkup & Doctor Brief",
      summary: "Pediatric visit completed. Weight gain (+220g) confirmed. Doctor Brief export generated.",
      sourceFeature: "Feature 17",
      sourceRecordIds: ["apt_pedia_14d"],
      eventDate: d4.toISOString().split("T")[0],
      importance: "HIGH",
      confidence: "PROVIDER_VERIFIED",
      status: "RESOLVED",
      userConfirmed: true,
      linkedAppointmentId: "apt_pedia_14d",
      linkedDoctorBriefId: "db_summary_14d",
      visibility: "USER_SELECTED_FOR_DOCTOR",
      notes: "Pediatrician confirmed healthy growth velocity.",
    },
    {
      memoryId: "mem_pref_reminders",
      createdAt: today.toISOString(),
      updatedAt: today.toISOString(),
      memoryType: "USER_PREFERENCE",
      category: "PREFERENCE",
      title: "Preferred Evening Check-in & Medication Notification Time",
      summary: "User prefers gentle daily check-in reminders at 8:00 PM.",
      sourceFeature: "Feature 22",
      eventDate: today.toISOString().split("T")[0],
      importance: "LOW",
      confidence: "USER_ENTERED",
      status: "ACTIVE",
      userConfirmed: true,
      visibility: "PRIVATE",
      notes: "Configured in Context-Aware Reminders (Feature 22).",
    },
  ];
}

function fontConfirm(val: boolean): boolean {
  return val;
}

// ==========================================
// LOCAL STORAGE ACCESS HELPERS
// ==========================================

export function getPatientMemoryGraph(): PatientMemoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEMORY);
    if (!raw) {
      const seeded = getInitialSeededMemories();
      localStorage.setItem(STORAGE_KEY_MEMORY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed: PatientMemoryItem[] = JSON.parse(raw);
    return parsed.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  } catch (err) {
    console.error("Error reading patient memory graph:", err);
    return [];
  }
}

export function addCustomMemory(
  item: Omit<PatientMemoryItem, "memoryId" | "createdAt" | "updatedAt">
): PatientMemoryItem {
  try {
    const memories = getPatientMemoryGraph();
    const now = new Date().toISOString();

    const newMemory: PatientMemoryItem = {
      ...item,
      memoryId: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };

    memories.push(newMemory);
    localStorage.setItem(STORAGE_KEY_MEMORY, JSON.stringify(memories));
    return newMemory;
  } catch (err) {
    console.error("Error adding custom memory:", err);
    throw err;
  }
}

export function updateMemoryStatus(
  memoryId: string,
  status: PatientMemoryItem["status"]
): PatientMemoryItem {
  try {
    const memories = getPatientMemoryGraph();
    const index = memories.findIndex((m) => m.memoryId === memoryId);
    if (index === -1) throw new Error("Memory not found");

    const updated = {
      ...memories[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    memories[index] = updated;
    localStorage.setItem(STORAGE_KEY_MEMORY, JSON.stringify(memories));
    return updated;
  } catch (err) {
    console.error("Error updating memory status:", err);
    throw err;
  }
}

// ==========================================
// LONGITUDINAL QUERY & SEARCH ENGINE
// ==========================================

export function queryLongitudinalHistory(promptQuery: string): {
  matches: PatientMemoryItem[];
  explanation: string;
} {
  const memories = getPatientMemoryGraph();
  const q = promptQuery.toLowerCase().trim();

  if (!q) {
    return {
      matches: memories.slice(0, 5),
      explanation: "Showing recent longitudinal memory milestones.",
    };
  }

  const matches = memories.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.sourceFeature.toLowerCase().includes(q) ||
      (m.notes && m.notes.toLowerCase().includes(q))
  );

  return {
    matches,
    explanation:
      matches.length > 0
        ? `Found ${matches.length} longitudinal memory references matching '${promptQuery}'.`
        : `No explicit memory matches found for '${promptQuery}'. Grounded in recorded feature history.`,
  };
}

// ==========================================
// HISTORY SUMMARY CALCULATOR
// ==========================================

export function evaluatePatientHistorySummary(): PatientHistorySummary {
  const memories = getPatientMemoryGraph();

  const activeConcerns = memories.filter((m) => m.memoryType === "CONCERN" && m.status === "ACTIVE" || m.status === "UNDER_MONITORING").length;
  const resolvedConcerns = memories.filter((m) => m.memoryType === "CONCERN" && m.status === "RESOLVED").length;
  const keyEvents = memories.filter((m) => m.memoryType === "IMPORTANT_EVENT" || m.memoryType === "PATIENT_CONTEXT" || m.memoryType === "CARE_EVENT").length;
  const prefs = memories.filter((m) => m.category === "PREFERENCE").length;

  return {
    totalMemoriesCount: memories.length,
    activeConcernsCount: activeConcerns,
    resolvedConcernsCount: resolvedConcerns,
    keyEventsCount: keyEvents,
    userPreferencesCount: prefs,
    latestEvent: memories.length > 0 ? memories[0] : undefined,
  };
}

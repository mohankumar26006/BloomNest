import {
  VaccineDefinition,
  VaccinationRecord,
  VaccineDoseStatus,
  BabyVaccinationSummary,
  VaccineVerificationSource,
} from "../types";

const STORAGE_KEY_VACCINES = "bloomnest_baby_vaccinations_v1";

// ==========================================
// CONFIGURABLE IMMUNIZATION SCHEDULE
// (Default: National Immunization Program / UIP Standard)
// ==========================================

export const INDIAN_UIP_VACCINE_SCHEDULE: VaccineDefinition[] = [
  // BIRTH VACCINES (WEEK 0)
  {
    vaccineId: "vac_bcg_0",
    code: "BCG",
    name: "BCG Vaccine",
    fullTitle: "Bacillus Calmette–Guérin (BCG)",
    targetDiseases: ["Tuberculosis"],
    recommendedAgeWeeks: 0,
    recommendedAgeLabel: "Birth",
    doseNumber: 1,
    totalDoses: 1,
    description: "Single birth dose for protection against severe tuberculosis forms (TB meningitis).",
    isEssential: true,
  },
  {
    vaccineId: "vac_opv_0",
    code: "OPV-0",
    name: "OPV Birth Dose",
    fullTitle: "Oral Polio Vaccine (OPV Birth Dose)",
    targetDiseases: ["Poliomyelitis"],
    recommendedAgeWeeks: 0,
    recommendedAgeLabel: "Birth",
    doseNumber: 1,
    totalDoses: 4,
    description: "Oral drops given at birth for mucosal gut immunity against wild poliovirus.",
    isEssential: true,
  },
  {
    vaccineId: "vac_hepb_0",
    code: "HepB-0",
    name: "Hepatitis B Birth Dose",
    fullTitle: "Hepatitis B Vaccine (Birth Dose)",
    targetDiseases: ["Hepatitis B"],
    recommendedAgeWeeks: 0,
    recommendedAgeLabel: "Birth",
    doseNumber: 1,
    totalDoses: 4,
    description: "Administered within 24 hours of birth to prevent perinatal transmission.",
    isEssential: true,
  },

  // 6 WEEKS (WEEK 6)
  {
    vaccineId: "vac_dtp_1",
    code: "DTP-1 / Pentavalent-1",
    name: "Pentavalent / DTP-1",
    fullTitle: "Diphtheria, Tetanus, Pertussis, HepB, Hib (Dose 1)",
    targetDiseases: ["Diphtheria", "Tetanus", "Pertussis (Whooping Cough)", "Hepatitis B", "Hib"],
    recommendedAgeWeeks: 6,
    recommendedAgeLabel: "6 Weeks",
    doseNumber: 1,
    totalDoses: 3,
    description: "Combination vaccine protecting against 5 life-threatening childhood infections.",
    isEssential: true,
  },
  {
    vaccineId: "vac_ipv_1",
    code: "fIPV-1",
    name: "Inactivated Polio (fIPV-1)",
    fullTitle: "Fractional Inactivated Polio Vaccine (Dose 1)",
    targetDiseases: ["Poliomyelitis"],
    recommendedAgeWeeks: 6,
    recommendedAgeLabel: "6 Weeks",
    doseNumber: 1,
    totalDoses: 3,
    description: "Injectable polio vaccine boosting systemic humoral immunity.",
    isEssential: true,
  },
  {
    vaccineId: "vac_rota_1",
    code: "Rotavirus-1",
    name: "Rotavirus Vaccine (Dose 1)",
    fullTitle: "Rotavirus Oral Vaccine (Dose 1)",
    targetDiseases: ["Rotavirus Diarrhea"],
    recommendedAgeWeeks: 6,
    recommendedAgeLabel: "6 Weeks",
    doseNumber: 1,
    totalDoses: 3,
    description: "Oral drops providing severe diarrheal protection.",
    isEssential: true,
  },
  {
    vaccineId: "vac_pcv_1",
    code: "PCV-1",
    name: "Pneumococcal Conjugate (Dose 1)",
    fullTitle: "Pneumococcal Conjugate Vaccine (PCV Dose 1)",
    targetDiseases: ["Pneumonia", "Pneumococcal Meningitis"],
    recommendedAgeWeeks: 6,
    recommendedAgeLabel: "6 Weeks",
    doseNumber: 1,
    totalDoses: 3,
    description: "Protects against invasive pneumococcal respiratory infections.",
    isEssential: true,
  },

  // 10 WEEKS (WEEK 10)
  {
    vaccineId: "vac_dtp_2",
    code: "DTP-2 / Pentavalent-2",
    name: "Pentavalent / DTP-2",
    fullTitle: "Diphtheria, Tetanus, Pertussis, HepB, Hib (Dose 2)",
    targetDiseases: ["Diphtheria", "Tetanus", "Pertussis", "Hepatitis B", "Hib"],
    recommendedAgeWeeks: 10,
    recommendedAgeLabel: "10 Weeks",
    doseNumber: 2,
    totalDoses: 3,
    description: "Second primary dose of combination vaccine.",
    isEssential: true,
  },
  {
    vaccineId: "vac_rota_2",
    code: "Rotavirus-2",
    name: "Rotavirus Vaccine (Dose 2)",
    fullTitle: "Rotavirus Oral Vaccine (Dose 2)",
    targetDiseases: ["Rotavirus Diarrhea"],
    recommendedAgeWeeks: 10,
    recommendedAgeLabel: "10 Weeks",
    doseNumber: 2,
    totalDoses: 3,
    description: "Second oral dose for rotavirus protection.",
    isEssential: true,
  },

  // 14 WEEKS (WEEK 14)
  {
    vaccineId: "vac_dtp_3",
    code: "DTP-3 / Pentavalent-3",
    name: "Pentavalent / DTP-3",
    fullTitle: "Diphtheria, Tetanus, Pertussis, HepB, Hib (Dose 3)",
    targetDiseases: ["Diphtheria", "Tetanus", "Pertussis", "Hepatitis B", "Hib"],
    recommendedAgeWeeks: 14,
    recommendedAgeLabel: "14 Weeks",
    doseNumber: 3,
    totalDoses: 3,
    description: "Third primary dose completing primary childhood series.",
    isEssential: true,
  },
  {
    vaccineId: "vac_ipv_2",
    code: "fIPV-2",
    name: "Inactivated Polio (fIPV-2)",
    fullTitle: "Fractional Inactivated Polio Vaccine (Dose 2)",
    targetDiseases: ["Poliomyelitis"],
    recommendedAgeWeeks: 14,
    recommendedAgeLabel: "14 Weeks",
    doseNumber: 2,
    totalDoses: 3,
    description: "Second fIPV dose for long-term polio immunity.",
    isEssential: true,
  },
  {
    vaccineId: "vac_pcv_2",
    code: "PCV-2",
    name: "Pneumococcal Conjugate (Dose 2)",
    fullTitle: "Pneumococcal Conjugate Vaccine (PCV Dose 2)",
    targetDiseases: ["Pneumonia", "Meningitis"],
    recommendedAgeWeeks: 14,
    recommendedAgeLabel: "14 Weeks",
    doseNumber: 2,
    totalDoses: 3,
    description: "Second PCV primary series dose.",
    isEssential: true,
  },

  // 9 MONTHS (WEEK 36)
  {
    vaccineId: "vac_mr_1",
    code: "MR-1",
    name: "Measles & Rubella (Dose 1)",
    fullTitle: "Measles & Rubella Vaccine (MR Dose 1)",
    targetDiseases: ["Measles", "Rubella"],
    recommendedAgeWeeks: 36,
    recommendedAgeLabel: "9 Months",
    doseNumber: 1,
    totalDoses: 2,
    description: "First dose for measles and congenital rubella protection.",
    isEssential: true,
  },
];

// ==========================================
// LOCAL STORAGE HELPERS
// ==========================================

export function getVaccinationRecords(babyId: string): VaccinationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VACCINES);
    if (!raw) {
      const seeded = getInitialSeededVaccineRecords(babyId);
      localStorage.setItem(STORAGE_KEY_VACCINES, JSON.stringify(seeded));
      return seeded.filter((r) => r.babyId === babyId);
    }
    const parsed: VaccinationRecord[] = JSON.parse(raw);
    const filtered = parsed.filter((r) => r.babyId === babyId);

    if (filtered.length === 0) {
      const seeded = getInitialSeededVaccineRecords(babyId);
      const updated = [...parsed, ...seeded];
      localStorage.setItem(STORAGE_KEY_VACCINES, JSON.stringify(updated));
      return seeded;
    }

    return filtered.sort((a, b) => new Date(b.administeredDate).getTime() - new Date(a.administeredDate).getTime());
  } catch (err) {
    console.error("Error reading vaccination records:", err);
    return [];
  }
}

export function saveVaccinationRecord(
  record: Omit<VaccinationRecord, "vaccinationRecordId">
): VaccinationRecord {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VACCINES);
    const existing: VaccinationRecord[] = raw ? JSON.parse(raw) : [];

    const newRecord: VaccinationRecord = {
      ...record,
      vaccinationRecordId: `vr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };

    existing.push(newRecord);
    localStorage.setItem(STORAGE_KEY_VACCINES, JSON.stringify(existing));
    return newRecord;
  } catch (err) {
    console.error("Error saving vaccination record:", err);
    throw err;
  }
}

export function deleteVaccinationRecord(vaccinationRecordId: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VACCINES);
    if (!raw) return;
    const existing: VaccinationRecord[] = JSON.parse(raw);
    const filtered = existing.filter((r) => r.vaccinationRecordId !== vaccinationRecordId);
    localStorage.setItem(STORAGE_KEY_VACCINES, JSON.stringify(filtered));
  } catch (err) {
    console.error("Error deleting vaccination record:", err);
  }
}

export function getVaccineScheduleDefinitions(): VaccineDefinition[] {
  return INDIAN_UIP_VACCINE_SCHEDULE;
}

// Initial Seed Generator (Birth Dose Records)
function getInitialSeededVaccineRecords(babyId: string): VaccinationRecord[] {
  const today = new Date();
  const birthDateStr = new Date(today.setDate(today.getDate() - 14)).toISOString().split("T")[0];

  return [
    {
      vaccinationRecordId: `vr_seed_bcg_${babyId}`,
      babyId,
      vaccineId: "vac_bcg_0",
      doseNumber: 1,
      administeredDate: birthDateStr,
      administeredTime: "10:15 AM",
      provider: "Dr. A. Sharma, MD Pediatrics",
      clinicLocation: "City Hospital Delivery Ward",
      batchLotNumber: "BCG-2026-9042",
      verificationSource: "HOSPITAL_RECORD",
      verificationStatus: "VERIFIED",
      notes: "Birth dose administered intra-dermally in left upper arm.",
    },
    {
      vaccinationRecordId: `vr_seed_opv_${babyId}`,
      babyId,
      vaccineId: "vac_opv_0",
      doseNumber: 1,
      administeredDate: birthDateStr,
      administeredTime: "10:20 AM",
      provider: "Staff Nurse Priya",
      clinicLocation: "City Hospital Delivery Ward",
      batchLotNumber: "OPV-2026-1180",
      verificationSource: "HOSPITAL_RECORD",
      verificationStatus: "VERIFIED",
      notes: "2 drops administered orally.",
    },
    {
      vaccinationRecordId: `vr_seed_hepb_${babyId}`,
      babyId,
      vaccineId: "vac_hepb_0",
      doseNumber: 1,
      administeredDate: birthDateStr,
      administeredTime: "11:00 AM",
      provider: "Dr. A. Sharma",
      clinicLocation: "City Hospital Delivery Ward",
      batchLotNumber: "HEPB-2026-5531",
      verificationSource: "HOSPITAL_RECORD",
      verificationStatus: "VERIFIED",
      notes: "IM injection in anterolateral thigh.",
    },
  ];
}

// ==========================================
// VACCINATION SUMMARY CALCULATOR
// ==========================================

export function evaluateBabyVaccinationSummary(
  babyId: string,
  babyName: string,
  birthDateStr: string
): BabyVaccinationSummary {
  const records = getVaccinationRecords(babyId);
  const definitions = getVaccineScheduleDefinitions();

  const birthDate = new Date(birthDateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - birthDate.getTime());
  const ageDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  const ageWeeks = Math.max(1, Math.floor(ageDays / 7));

  // Determine completed vaccine IDs
  const completedVaccineIds = new Set(records.map((r) => r.vaccineId));

  const completed = records.length;
  let upcoming = 0;
  let due = 0;
  let nextDueVaccine: VaccineDefinition | undefined = undefined;

  // Find next due vaccine
  const pendingDefinitions = definitions.filter((d) => !completedVaccineIds.has(d.vaccineId));

  pendingDefinitions.forEach((d) => {
    if (ageWeeks >= d.recommendedAgeWeeks) {
      due++;
    } else {
      upcoming++;
    }
  });

  if (pendingDefinitions.length > 0) {
    nextDueVaccine = pendingDefinitions.sort(
      (a, b) => a.recommendedAgeWeeks - b.recommendedAgeWeeks
    )[0];
  }

  // Calculate estimated next due date string based on DOB + recommended age weeks
  let nextDueDateStr: string | undefined = undefined;
  if (nextDueVaccine) {
    const targetDate = new Date(birthDate);
    targetDate.setDate(targetDate.getDate() + nextDueVaccine.recommendedAgeWeeks * 7);
    nextDueDateStr = targetDate.toISOString().split("T")[0];
  }

  const needsVerificationCount = records.filter(
    (r) => r.verificationStatus === "NEEDS_VERIFICATION" || r.verificationStatus === "USER_REPORTED"
  ).length;

  return {
    babyId,
    babyName: babyName || "Baby",
    ageDays,
    ageWeeks,
    totalCompleted: completed,
    totalUpcoming: upcoming,
    totalDue: due,
    totalNeedsVerification: needsVerificationCount,
    nextDueVaccine,
    nextDueDateStr,
  };
}

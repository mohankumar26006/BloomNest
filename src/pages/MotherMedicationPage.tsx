import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  PostpartumProfile,
  BabyProfileData,
  BreastfeedingLog,
  PumpingLog,
  MotherMedicationItem,
  MotherMedicationLog,
  MedicationType,
  MedicationSchedule,
  MedicationStatus,
  MedicationDoseStatus,
  MedicationReactionSymptom,
} from "../types";
import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
  getRecoveryStage,
  formatDeliveryType,
} from "../utils/postpartumUtils";
import {
  Pill,
  Plus,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Activity,
  FileText,
  Trash2,
  ChevronRight,
  ShieldAlert,
  Printer,
  Info,
  Heart,
  Baby,
  Utensils,
  Moon,
  Sparkles,
  Droplets,
  AlertTriangle,
} from "lucide-react";

const MOTHER_MEDICATIONS_KEY = "bloomnest_mother_medications_v1";
const MOTHER_MEDICATION_LOGS_KEY = "bloomnest_mother_medication_logs_v1";

interface MotherMedicationPageProps {
  onNavigateSubPage?: (page: string) => void;
}

export const MotherMedicationPage: React.FC<MotherMedicationPageProps> = ({
  onNavigateSubPage,
}) => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<"medications" | "adherence" | "timeline" | "doctor_report">("medications");

  // Contexts
  const [profile, setProfile] = useState<PostpartumProfile | null>(null);
  const [babyProfile, setBabyProfile] = useState<BabyProfileData | null>(null);
  const [isLactating, setIsLactating] = useState<boolean>(false);

  // State
  const [medications, setMedications] = useState<MotherMedicationItem[]>([]);
  const [medLogs, setMedLogs] = useState<MotherMedicationLog[]>([]);

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [selectedMedForLog, setSelectedMedForLog] = useState<MotherMedicationItem | null>(null);

  // Form State: Add Medication
  const [name, setName] = useState<string>("");
  const [type, setType] = useState<MedicationType>("prescription");
  const [purpose, setPurpose] = useState<string>("");
  const [prescribedBy, setPrescribedBy] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [doseAmount, setDoseAmount] = useState<string>("");
  const [unit, setUnit] = useState<string>("tablet");
  const [frequency, setFrequency] = useState<string>("Twice daily");
  const [route, setRoute] = useState<string>("Oral");
  const [schedule, setSchedule] = useState<MedicationSchedule>("twice_daily");
  const [isAsNeeded, setIsAsNeeded] = useState<boolean>(false);

  // Form State: Log Dose
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [actualTime, setActualTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
  );
  const [doseStatus, setDoseStatus] = useState<MedicationDoseStatus>("taken");
  const [prePainScore, setPrePainScore] = useState<number | undefined>(undefined);
  const [postPainScore, setPostPainScore] = useState<number | undefined>(undefined);
  const [postEffect, setPostEffect] = useState<"better" | "same" | "worse" | "not_sure" | undefined>(undefined);
  const [selectedReactions, setSelectedReactions] = useState<MedicationReactionSymptom[]>([]);
  const [logNotes, setLogNotes] = useState<string>("");

  // Load context and stored data
  useEffect(() => {
    // 1. Feature 01 Context
    const savedProfile = localStorage.getItem("bloomnest_postpartum_profile_v1");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else if (user?.journeyStage === "POST_PREGNANCY") {
      setProfile({
        deliveryDate: new Date().toISOString().split("T")[0],
        deliveryType: "vaginal",
        numberOfBabies: 1,
      });
    }

    // 2. Feature 03 Baby Context
    const savedBaby = localStorage.getItem("bloomnest_baby_profile_v1");
    if (savedBaby) {
      setBabyProfile(JSON.parse(savedBaby));
    }

    // 3. Lactation Context (Feat 08 / 09)
    const bfLogs = localStorage.getItem("bloomnest_breastfeeding_logs_v1");
    const pumpLogs = localStorage.getItem("bloomnest_pumping_logs_v1");
    if ((bfLogs && JSON.parse(bfLogs).length > 0) || (pumpLogs && JSON.parse(pumpLogs).length > 0)) {
      setIsLactating(true);
    }

    // 4. Feature 16 Medications
    const savedMeds = localStorage.getItem(MOTHER_MEDICATIONS_KEY);
    if (savedMeds) {
      setMedications(JSON.parse(savedMeds));
    } else {
      // Default initial sample active medication if empty
      const initialMeds: MotherMedicationItem[] = [
        {
          id: "med_init_1",
          name: "Ibuprofen / Postpartum Pain Support",
          type: "otc",
          purpose: "Uterine cramping & perineal pain relief",
          prescribedBy: "Hospital Discharge Instructions",
          startDate: new Date().toISOString().split("T")[0],
          instructions: "Take 1 tablet after meals as instructed by clinician.",
          doseAmount: "400",
          unit: "mg",
          frequency: "Every 6-8 hours as needed",
          route: "Oral",
          schedule: "as_needed",
          isAsNeeded: true,
          status: "active",
          createdAt: new Date().toISOString(),
        },
        {
          id: "med_init_2",
          name: "Iron Supplement & Vitamin C",
          type: "supplement",
          purpose: "Postpartum hemoglobin & energy restoration",
          prescribedBy: "OB/GYN Clinician",
          startDate: new Date().toISOString().split("T")[0],
          instructions: "Take 1 capsule daily with morning juice/water. Avoid taking with coffee/tea.",
          doseAmount: "100",
          unit: "mg",
          frequency: "Once daily",
          route: "Oral",
          schedule: "once_daily",
          scheduledTimes: ["08:00 AM"],
          isAsNeeded: false,
          status: "active",
          createdAt: new Date().toISOString(),
        },
      ];
      setMedications(initialMeds);
      localStorage.setItem(MOTHER_MEDICATIONS_KEY, JSON.stringify(initialMeds));
    }

    // 5. Feature 16 Medication Logs
    const savedLogs = localStorage.getItem(MOTHER_MEDICATION_LOGS_KEY);
    if (savedLogs) {
      setMedLogs(JSON.parse(savedLogs));
    }
  }, [user]);

  // Derived postpartum stats
  const deliveryDateStr = profile?.deliveryDate || new Date().toISOString().split("T")[0];
  const postpartumDay = calculatePostpartumDay(deliveryDateStr);
  const postpartumWeek = calculatePostpartumWeek(postpartumDay);
  const recoveryStage = getRecoveryStage(postpartumDay).title;

  // Save Handlers
  const handleSaveMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMed: MotherMedicationItem = {
      id: `med_${Date.now()}`,
      userId: user?.id?.toString(),
      name: name.trim(),
      type,
      purpose: purpose.trim() || undefined,
      prescribedBy: prescribedBy.trim() || undefined,
      startDate,
      endDate: endDate || undefined,
      instructions: instructions.trim() || "Follow recorded instructions.",
      doseAmount: doseAmount.trim() || undefined,
      unit,
      frequency,
      route,
      schedule,
      isAsNeeded,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    const updated = [newMed, ...medications];
    setMedications(updated);
    localStorage.setItem(MOTHER_MEDICATIONS_KEY, JSON.stringify(updated));

    // Reset Form
    setName("");
    setPurpose("");
    setPrescribedBy("");
    setInstructions("");
    setDoseAmount("");
    setShowAddModal(false);
  };

  const handleOpenLogModal = (med: MotherMedicationItem) => {
    setSelectedMedForLog(med);
    setActualTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }));
    setDoseStatus("taken");
    setPrePainScore(undefined);
    setPostPainScore(undefined);
    setPostEffect(undefined);
    setSelectedReactions([]);
    setLogNotes("");
    setShowLogModal(true);
  };

  const handleSaveDoseLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedForLog) return;

    const newLog: MotherMedicationLog = {
      id: `medlog_${Date.now()}`,
      userId: user?.id?.toString(),
      medicationId: selectedMedForLog.id,
      medicationName: selectedMedForLog.name,
      date: logDate,
      actualTime,
      timestamp: new Date(`${logDate} ${actualTime}`).getTime() || Date.now(),
      postpartumDay,
      postpartumWeek,
      doseStatus,
      isPRN: selectedMedForLog.isAsNeeded,
      preMedicationSymptom: prePainScore !== undefined ? { symptom: "Pain", score: prePainScore } : undefined,
      postMedicationEffect: postEffect,
      postMedicationSymptomScore: postPainScore,
      reportedReactions: selectedReactions.length > 0 ? selectedReactions : undefined,
      notes: logNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedLogs = [newLog, ...medLogs];
    setMedLogs(updatedLogs);
    localStorage.setItem(MOTHER_MEDICATION_LOGS_KEY, JSON.stringify(updatedLogs));

    setShowLogModal(false);
  };

  const handleDeleteMedication = (id: string) => {
    if (confirm("Are you sure you want to remove this medication record?")) {
      const updated = medications.filter((m) => m.id !== id);
      setMedications(updated);
      localStorage.setItem(MOTHER_MEDICATIONS_KEY, JSON.stringify(updated));
    }
  };

  const handleDeleteLog = (id: string) => {
    if (confirm("Delete this logged dose entry?")) {
      const updated = medLogs.filter((l) => l.id !== id);
      setMedLogs(updated);
      localStorage.setItem(MOTHER_MEDICATION_LOGS_KEY, JSON.stringify(updated));
    }
  };

  const handleToggleMedStatus = (id: string, newStatus: MedicationStatus) => {
    const updated = medications.map((m) => (m.id === id ? { ...m, status: newStatus } : m));
    setMedications(updated);
    localStorage.setItem(MOTHER_MEDICATIONS_KEY, JSON.stringify(updated));
  };

  // Calculations for neutral adherence
  const activeMeds = medications.filter((m) => m.status === "active");
  const totalLogsCount = medLogs.length;
  const takenCount = medLogs.filter((l) => l.doseStatus === "taken").length;
  const missedCount = medLogs.filter((l) => l.doseStatus === "missed").length;
  const skippedCount = medLogs.filter((l) => l.doseStatus === "skipped").length;

  return (
    <div className="min-h-screen bg-purple-50/40 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* TOP HEADER WITH POSTPARTUM STAGE CONTEXT */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-200">
                Feature 16 • Postpartum Care
              </span>
              <span className="bg-pink-100 text-pink-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Day {postpartumDay} • Week {postpartumWeek}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Pill className="w-8 h-8 text-purple-600" />
              Mother Medication Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Record prescribed medications, instructions, taken doses, neutral adherence, and side-effect observations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Medication
            </button>
          </div>
        </div>

        {/* LACTATION CONTEXT BANNER IF BREASTFEEDING/PUMPING ACTIVE */}
        {isLactating && (
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-start gap-3 text-sky-900">
            <Droplets className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm">
              <p className="font-semibold text-sky-950">
                Breastfeeding / Lactation Context Detected
              </p>
              <p className="text-sky-800 mt-0.5">
                Breastfeeding activity is recorded in your profile. Always verify medication compatibility with a trusted medication/lactation reference or your OB/GYN healthcare professional.
              </p>
            </div>
          </div>
        )}

        {/* NON-DIAGNOSTIC DISCLAIMER CARD */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-900">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs md:text-sm">
            <span className="font-semibold text-amber-950">Safety Boundary & Instructions Record:</span>{" "}
            BloomNest stores clinician/user recorded instructions for tracking. The app does not prescribe medications or alter dosages. Always follow your clinician or pharmacist's direct guidance.
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-gray-200 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab("medications")}
            className={`py-2.5 px-4 font-medium text-sm border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "medications"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Pill className="w-4 h-4" />
            Active Medications ({activeMeds.length})
          </button>

          <button
            onClick={() => setActiveTab("adherence")}
            className={`py-2.5 px-4 font-medium text-sm border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "adherence"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Activity className="w-4 h-4" />
            Adherence & History
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            className={`py-2.5 px-4 font-medium text-sm border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "timeline"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Clock className="w-4 h-4" />
            Connected Recovery Timeline
          </button>

          <button
            onClick={() => setActiveTab("doctor_report")}
            className={`py-2.5 px-4 font-medium text-sm border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "doctor_report"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="w-4 h-4" />
            Doctor Summary Report
          </button>
        </div>

        {/* TAB 1: ACTIVE MEDICATIONS & LOG DOSE */}
        {activeTab === "medications" && (
          <div className="space-y-6">
            {activeMeds.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
                <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800">No Active Medications Logged</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-4">
                  Add prescribed medications, supplements, or as-needed pain relief instructions to set up your schedule.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add First Medication
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeMeds.map((med) => {
                  const lastLog = medLogs.find((l) => l.medicationId === med.id);
                  return (
                    <div
                      key={med.id}
                      className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span
                              className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                med.type === "prescription"
                                  ? "bg-purple-100 text-purple-700"
                                  : med.type === "otc"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {med.type}
                            </span>
                            <h3 className="text-lg font-bold text-gray-900 mt-1">{med.name}</h3>
                          </div>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                            {med.isAsNeeded ? "As Needed (PRN)" : med.frequency || med.schedule}
                          </span>
                        </div>

                        {med.purpose && (
                          <p className="text-xs text-purple-700 font-medium mb-3">
                            Purpose: {med.purpose}
                          </p>
                        )}

                        <div className="bg-purple-50/50 rounded-xl p-3 text-xs text-gray-700 space-y-1.5 mb-4 border border-purple-100/60">
                          <div className="flex items-start gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>Recorded Instructions:</strong> {med.instructions}
                            </span>
                          </div>
                          {med.doseAmount && (
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              <span>
                                <strong>Dose:</strong> {med.doseAmount} {med.unit} ({med.route})
                              </span>
                            </div>
                          )}
                          {med.prescribedBy && (
                            <div className="text-gray-500 italic">
                              Prescribed/Recommended by: {med.prescribedBy}
                            </div>
                          )}
                        </div>

                        {lastLog && (
                          <div className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            Last logged: <strong className="text-gray-700">{lastLog.actualTime}</strong> on {lastLog.date} ({lastLog.doseStatus})
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
                        <button
                          onClick={() => handleToggleMedStatus(med.id, "completed")}
                          className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                        >
                          Mark Completed
                        </button>
                        <button
                          onClick={() => handleOpenLogModal(med)}
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Log Dose Taken / Status
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ADHERENCE & HISTORY */}
        {activeTab === "adherence" && (
          <div className="space-y-6">
            {/* NEUTRAL ADHERENCE SUMMARY CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm text-center">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Recorded Logs</p>
                <p className="text-3xl font-black text-purple-600 mt-1">{totalLogsCount}</p>
                <p className="text-xs text-gray-500 mt-1">Doses recorded by mother</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm text-center">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Marked as Taken</p>
                <p className="text-3xl font-black text-emerald-600 mt-1">{takenCount}</p>
                <p className="text-xs text-emerald-700 mt-1 font-medium">
                  {totalLogsCount > 0 ? `${takenCount} of ${totalLogsCount} recorded doses taken` : "No logs yet"}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm text-center">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Missed / Skipped</p>
                <p className="text-3xl font-black text-amber-600 mt-1">{missedCount + skippedCount}</p>
                <p className="text-xs text-amber-700 mt-1 font-medium">
                  {missedCount} missed • {skippedCount} skipped
                </p>
              </div>
            </div>

            {/* LOG HISTORY TABLE */}
            <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Medication Dose History
              </h3>

              {medLogs.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-6">No medication doses logged yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-purple-50/50 text-gray-700 font-semibold border-b border-purple-100">
                      <tr>
                        <th className="p-3">Date & Time</th>
                        <th className="p-3">Medication</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Before/After Pain</th>
                        <th className="p-3">Reported Reactions</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {medLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-purple-50/20">
                          <td className="p-3 font-medium text-gray-900">
                            {log.date} <span className="text-gray-400">({log.actualTime})</span>
                          </td>
                          <td className="p-3 font-semibold text-purple-900">{log.medicationName}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                                log.doseStatus === "taken"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : log.doseStatus === "missed"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {log.doseStatus}
                            </span>
                          </td>
                          <td className="p-3 text-gray-700">
                            {log.preMedicationSymptom?.score !== undefined || log.postMedicationSymptomScore !== undefined ? (
                              <span>
                                {log.preMedicationSymptom?.score !== undefined ? `${log.preMedicationSymptom.score}/10` : "—"} →{" "}
                                {log.postMedicationSymptomScore !== undefined ? `${log.postMedicationSymptomScore}/10` : "—"}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="p-3">
                            {log.reportedReactions && log.reportedReactions.length > 0 ? (
                              <span className="text-rose-600 font-medium">
                                {log.reportedReactions.join(", ")}
                              </span>
                            ) : (
                              <span className="text-emerald-600">None</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CONNECTED RECOVERY TIMELINE */}
        {activeTab === "timeline" && (
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Connected Recovery & Medication Timeline
            </h3>
            <p className="text-xs text-gray-500">
              Chronological log connecting meals (Feat 15), medication events (Feat 16), pain observations (Feat 6), and lactation (Feat 8/9).
            </p>

            {medLogs.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-6 text-center">Log dose events to generate your recovery timeline.</p>
            ) : (
              <div className="relative border-l-2 border-purple-200 ml-4 space-y-6 py-2">
                {medLogs.map((log) => (
                  <div key={log.id} className="relative pl-6">
                    <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-purple-600 border-2 border-white" />
                    <div className="bg-purple-50/60 rounded-xl p-3 border border-purple-100 text-xs">
                      <div className="flex items-center justify-between text-gray-500 mb-1">
                        <span className="font-semibold text-purple-900">{log.actualTime} • {log.date}</span>
                        <span className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded text-[10px]">
                          Feature 16
                        </span>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">
                        {log.medicationName} — <span className="capitalize">{log.doseStatus}</span>
                      </p>
                      {log.preMedicationSymptom && (
                        <p className="text-gray-600 mt-1">
                          Pain score recorded before dose: <strong>{log.preMedicationSymptom.score}/10</strong>
                        </p>
                      )}
                      {log.postMedicationSymptomScore !== undefined && (
                        <p className="text-gray-600">
                          Pain score recorded after dose: <strong>{log.postMedicationSymptomScore}/10</strong>
                        </p>
                      )}
                      {log.notes && <p className="text-gray-500 italic mt-1">"{log.notes}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DOCTOR SUMMARY REPORT */}
        {activeTab === "doctor_report" && (
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Postpartum Medication Summary for Healthcare Provider</h3>
                <p className="text-xs text-gray-500">
                  Exportable summary of active medications, recorded clinician instructions, and logged dose adherence.
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
            </div>

            <div className="p-4 bg-purple-50/40 rounded-xl border border-purple-100 text-xs space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-gray-700">
                <div><strong>Patient Status:</strong> Postpartum Day {postpartumDay}</div>
                <div><strong>Delivery Stage:</strong> Week {postpartumWeek}</div>
                <div><strong>Lactation:</strong> {isLactating ? "Active Breastfeeding/Pumping" : "Formula/Other"}</div>
                <div><strong>Active Meds:</strong> {activeMeds.length} Items</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-800">Current Prescribed / Recorded Medication List</h4>
              {activeMeds.map((m) => (
                <div key={m.id} className="p-3 border border-gray-200 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>{m.name} ({m.type.toUpperCase()})</span>
                    <span>{m.doseAmount ? `${m.doseAmount} ${m.unit}` : m.frequency}</span>
                  </div>
                  <p className="text-gray-600"><strong>Instructions:</strong> {m.instructions}</p>
                  {m.prescribedBy && <p className="text-gray-500"><strong>Source/Prescriber:</strong> {m.prescribedBy}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: ADD MEDICATION */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-purple-100 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-purple-600" />
                Add Prescribed Medication / Supplement
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMedication} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Medication Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ibuprofen, Ferrous Sulfate, Paracetamol"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as MedicationType)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm"
                  >
                    <option value="prescription">Prescription</option>
                    <option value="otc">Over-The-Counter (OTC)</option>
                    <option value="supplement">Supplement / Vitamin</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Prescribed By (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Hospital Doctor / OBGYN"
                    value={prescribedBy}
                    onChange={(e) => setPrescribedBy(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Purpose / Indication</label>
                <input
                  type="text"
                  placeholder="e.g. Pain relief, Antibiotic, Hemoglobin restoration"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Recorded Clinician Instructions *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Take 1 tablet twice daily after meals. Do not take on empty stomach."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Record the exact instructions provided by your doctor or pharmacist.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Dose Amount</label>
                  <input
                    type="text"
                    placeholder="e.g. 400"
                    value={doseAmount}
                    onChange={(e) => setDoseAmount(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-xl"
                  >
                    <option value="mg">mg</option>
                    <option value="tablet">tablet</option>
                    <option value="capsule">capsule</option>
                    <option value="mL">mL</option>
                    <option value="drops">drops</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Frequency</label>
                  <select
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value as MedicationSchedule)}
                    className="w-full p-2 border border-gray-300 rounded-xl"
                  >
                    <option value="once_daily">Once daily</option>
                    <option value="twice_daily">Twice daily</option>
                    <option value="three_times_daily">Three times daily</option>
                    <option value="as_needed">As needed (PRN)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="asNeededCheck"
                  checked={isAsNeeded}
                  onChange={(e) => setIsAsNeeded(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <label htmlFor="asNeededCheck" className="text-gray-700 font-medium">
                  This is an As-Needed (PRN) medication
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700"
                >
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LOG DOSE TAKEN / STATUS */}
      {showLogModal && selectedMedForLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-purple-100 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Log Dose: {selectedMedForLog.name}
              </h3>
              <button onClick={() => setShowLogModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDoseLog} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Actual Time Taken</label>
                  <input
                    type="text"
                    value={actualTime}
                    onChange={(e) => setActualTime(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Dose Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["taken", "skipped", "missed"] as MedicationDoseStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setDoseStatus(st)}
                      className={`p-2.5 rounded-xl border font-bold capitalize text-center ${
                        doseStatus === st
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* PAIN BEFORE & AFTER OPTIONAL */}
              <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100 space-y-3">
                <p className="font-semibold text-purple-900">Optional Before / After Symptom Observation</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-600 block mb-1">Pain Before Dose (0-10)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      placeholder="e.g. 7"
                      value={prePainScore !== undefined ? prePainScore : ""}
                      onChange={(e) => setPrePainScore(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-gray-600 block mb-1">Pain After Dose (0-10)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      placeholder="e.g. 4"
                      value={postPainScore !== undefined ? postPainScore : ""}
                      onChange={(e) => setPostPainScore(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* REPORTED REACTIONS */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Reported Side Effects / Reactions</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "nausea", label: "Nausea" },
                    { id: "dizziness", label: "Dizziness" },
                    { id: "headache", label: "Headache" },
                    { id: "stomach_discomfort", label: "Stomach Discomfort" },
                    { id: "sleepiness", label: "Sleepiness" },
                    { id: "rash_skin_change", label: "Rash / Skin Change" },
                  ].map((r) => {
                    const isSel = selectedReactions.includes(r.id as MedicationReactionSymptom);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          if (isSel) {
                            setSelectedReactions(selectedReactions.filter((x) => x !== r.id));
                          } else {
                            setSelectedReactions([...selectedReactions, r.id as MedicationReactionSymptom]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${
                          isSel
                            ? "bg-rose-600 text-white border-rose-600"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Optional notes"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700"
                >
                  Save Dose Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MotherMedicationPage;

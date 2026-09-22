import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { PageView } from "../types";
import {
  getVaccinationRecords,
  saveVaccinationRecord,
  deleteVaccinationRecord,
  getVaccineScheduleDefinitions,
  evaluateBabyVaccinationSummary,
} from "../utils/vaccinationTrackingEngine";
import {
  VaccinationRecord,
  VaccineDefinition,
  VaccineVerificationSource,
} from "../types";
import {
  Syringe,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  FileText,
  ChevronRight,
  Info,
  Building2,
  User,
  Sparkles,
  HelpCircle,
  Award,
} from "lucide-react";

export const VaccinationPage: React.FC<{
  onNavigateSubPage?: (page: string) => void;
}> = ({ onNavigateSubPage }) => {
  const { user, setActivePage } = useApp();

  const profile = user.postpartumProfile || {
    deliveryDate: new Date().toISOString().split("T")[0],
    numberOfBabies: 1,
    deliveryType: "vaginal" as const,
  };

  const [selectedBabyId, setSelectedBabyId] = useState<string>("baby_1");
  const [activeTab, setActiveTab] = useState<"card" | "timeline" | "prep">("card");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVaccineId, setSelectedVaccineId] = useState<string>("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formTime, setFormTime] = useState("10:00 AM");
  const [formProvider, setFormProvider] = useState("");
  const [formClinic, setFormClinic] = useState("");
  const [formLot, setFormLot] = useState("");
  const [formSource, setFormSource] = useState<VaccineVerificationSource>("VACCINATION_CARD");
  const [formNotes, setFormNotes] = useState("");

  // "Why is this due?" Modal State
  const [selectedWhyVaccine, setSelectedWhyVaccine] = useState<VaccineDefinition | null>(null);

  const babyName = selectedBabyId === "baby_2" ? "Baby B" : "Baby A";
  const birthDate = profile.deliveryDate;

  // Datasets & Summary
  const summary = evaluateBabyVaccinationSummary(selectedBabyId, babyName, birthDate);
  const records = getVaccinationRecords(selectedBabyId);
  const scheduleDefinitions = getVaccineScheduleDefinitions();

  const handleSaveVaccination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVaccineId) {
      alert("Please select a vaccine from the schedule.");
      return;
    }

    const def = scheduleDefinitions.find((d) => d.vaccineId === selectedVaccineId);
    if (!def) return;

    saveVaccinationRecord({
      babyId: selectedBabyId,
      vaccineId: selectedVaccineId,
      doseNumber: def.doseNumber,
      administeredDate: formDate,
      administeredTime: formTime,
      provider: formProvider || undefined,
      clinicLocation: formClinic || undefined,
      batchLotNumber: formLot || undefined,
      verificationSource: formSource,
      verificationStatus: formSource === "PARENT_MEMORY" ? "USER_REPORTED" : "VERIFIED",
      notes: formNotes || undefined,
    });

    setIsAddModalOpen(false);
    setSelectedVaccineId("");
    setFormProvider("");
    setFormClinic("");
    setFormLot("");
    setFormNotes("");
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm("Are you sure you want to delete this vaccination record?")) {
      deleteVaccinationRecord(id);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const completedVaccineIds = new Set(records.map((r) => r.vaccineId));

  // Group definitions by age label
  const ageGroups: { [key: string]: VaccineDefinition[] } = {};
  scheduleDefinitions.forEach((def) => {
    if (!ageGroups[def.recommendedAgeLabel]) {
      ageGroups[def.recommendedAgeLabel] = [];
    }
    ageGroups[def.recommendedAgeLabel].push(def);
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 px-4 sm:px-6">
      {/* 1. HERO HEADER */}
      <section className="bg-teal-600 rounded-3xl p-6 sm:p-10 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                Feature 28 • Preventive Care
              </span>
              <span className="px-3 py-1 rounded-full bg-teal-300 text-slate-900 text-xs font-black">
                {summary.ageDays} Days Old (Week {summary.ageWeeks})
              </span>
            </div>

            {/* Multi-Baby Switcher */}
            {profile.numberOfBabies > 1 && (
              <div className="flex bg-white/20 backdrop-blur-md p-1 rounded-2xl border border-white/30">
                <button
                  onClick={() => setSelectedBabyId("baby_1")}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedBabyId === "baby_1" ? "bg-white text-teal-900 shadow-sm" : "text-white hover:bg-white/10"
                  }`}
                >
                  Baby A
                </button>
                <button
                  onClick={() => setSelectedBabyId("baby_2")}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedBabyId === "baby_2" ? "bg-white text-teal-900 shadow-sm" : "text-white hover:bg-white/10"
                  }`}
                >
                  Baby B
                </button>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              {babyName}'s Vaccination Tracking
            </h1>
            <p className="text-sm sm:text-base text-teal-100 max-w-3xl leading-relaxed">
              Living preventive-care & immunization timeline. Tracks scheduled vs. verified administered doses with complete verification transparency.
            </p>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
              <span className="text-[10px] uppercase font-bold text-teal-200 block">Completed</span>
              <span className="text-xl sm:text-2xl font-black text-white">
                {summary.totalCompleted} Doses
              </span>
              <span className="text-[11px] text-emerald-300 font-bold block mt-0.5">✓ Recorded</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
              <span className="text-[10px] uppercase font-bold text-teal-200 block">Due Now</span>
              <span className="text-xl sm:text-2xl font-black text-white">
                {summary.totalDue} Doses
              </span>
              <span className="text-[11px] text-amber-300 font-bold block mt-0.5">According to schedule</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
              <span className="text-[10px] uppercase font-bold text-teal-200 block">Upcoming</span>
              <span className="text-xl sm:text-2xl font-black text-white">
                {summary.totalUpcoming} Doses
              </span>
              <span className="text-[11px] text-teal-200 font-medium block mt-0.5">Future milestones</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
              <span className="text-[10px] uppercase font-bold text-teal-200 block">Next Due Vaccine</span>
              <span className="text-sm font-extrabold text-white truncate block">
                {summary.nextDueVaccine ? summary.nextDueVaccine.code : "Schedule Complete"}
              </span>
              {summary.nextDueDateStr && (
                <span className="text-[11px] text-amber-200 font-bold block mt-0.5">
                  Est: {summary.nextDueDateStr}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. NAVIGATION TABS */}
      <div className="flex border-b border-rose-100 dark:border-rose-900/40 space-x-2 sm:space-x-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("card")}
          className={`py-3 px-4 font-bold text-xs sm:text-sm rounded-t-2xl border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "card"
              ? "border-teal-600 text-teal-600 dark:text-teal-400 bg-white dark:bg-[#1a1420] shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-rose-300 dark:hover:text-white"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Digital Vaccine Card</span>
        </button>

        <button
          onClick={() => setActiveTab("timeline")}
          className={`py-3 px-4 font-bold text-xs sm:text-sm rounded-t-2xl border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "timeline"
              ? "border-teal-600 text-teal-600 dark:text-teal-400 bg-white dark:bg-[#1a1420] shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-rose-300 dark:hover:text-white"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Immunization Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab("prep")}
          className={`py-3 px-4 font-bold text-xs sm:text-sm rounded-t-2xl border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "prep"
              ? "border-teal-600 text-teal-600 dark:text-teal-400 bg-white dark:bg-[#1a1420] shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-rose-300 dark:hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Pediatric Visit Prep</span>
        </button>
      </div>

      {/* ========================================== */}
      {/* TAB 1: DIGITAL VACCINE CARD */}
      {/* ========================================== */}
      {activeTab === "card" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-rose-100">Digital Immunization Record</h2>
              <p className="text-xs text-slate-500 dark:text-rose-300">
                Verified documentation of administered vaccines, lot numbers, and clinic sources.
              </p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md inline-flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Administered Vaccine</span>
            </button>
          </div>

          {/* Transparency Rule Box */}
          <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 flex items-start gap-3">
            <Info className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div className="text-xs text-teal-900 dark:text-teal-200 space-y-1">
              <p className="font-bold">Architecture Rule: "No Record" ≠ "Not Vaccinated"</p>
              <p>
                A missing record simply means administration has not been documented in the app yet. Always verify immunization history with your pediatrician or physical vaccination card.
              </p>
            </div>
          </div>

          {/* Administered Vaccine Records */}
          {records.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#1a1420] rounded-3xl border border-rose-100 dark:border-rose-900/30 space-y-3">
              <Syringe className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-rose-200">No Administered Vaccines Logged Yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tap "Log Administered Vaccine" above to record vaccines from your hospital or pediatrician card.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {records.map((r) => {
                const def = scheduleDefinitions.find((d) => d.vaccineId === r.vaccineId);
                return (
                  <div
                    key={r.vaccinationRecordId}
                    className="p-5 bg-white dark:bg-[#1a1420] rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {r.verificationStatus === "VERIFIED" ? "Provider Verified" : "User Reported"}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-rose-300">
                          {r.administeredDate}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-rose-100">
                        {def?.name || "Vaccine"}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-rose-300 font-medium">
                        {def?.fullTitle}
                      </p>

                      <div className="space-y-1 pt-1 text-[11px] text-slate-600 dark:text-rose-200">
                        {r.provider && (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-teal-600" />
                            <span>Provider: <strong>{r.provider}</strong></span>
                          </div>
                        )}

                        {r.clinicLocation && (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-teal-600" />
                            <span>Location: <strong>{r.clinicLocation}</strong></span>
                          </div>
                        )}

                        {r.batchLotNumber && (
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Batch/Lot: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px]">{r.batchLotNumber}</code></span>
                          </div>
                        )}
                      </div>

                      {r.notes && (
                        <p className="text-[11px] text-slate-500 italic pt-1">
                          "{r.notes}"
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-rose-100 dark:border-rose-900/30 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Source: {r.verificationSource.replace("_", " ")}
                      </span>
                      <button
                        onClick={() => handleDeleteRecord(r.vaccinationRecordId)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: IMMUNIZATION TIMELINE */}
      {/* ========================================== */}
      {activeTab === "timeline" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-rose-100">Immunization Timeline Schedule</h2>
              <p className="text-xs text-slate-500 dark:text-rose-300">
                Configured national immunization schedule mapped to {babyName}'s birth date.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {Object.keys(ageGroups).map((ageLabel) => (
              <div
                key={ageLabel}
                className="p-6 bg-white dark:bg-[#1a1420] rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-rose-100 dark:border-rose-900/30 pb-3">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-rose-100">
                    Age Milestone: {ageLabel}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ageGroups[ageLabel].map((def) => {
                    const isCompleted = completedVaccineIds.has(def.vaccineId);
                    const isDue = !isCompleted && summary.ageWeeks >= def.recommendedAgeWeeks;

                    return (
                      <div
                        key={def.vaccineId}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          isCompleted
                            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                            : isDue
                            ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-900/50"
                            : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-slate-900 dark:text-rose-100">
                              {def.code}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                isCompleted
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : isDue
                                  ? "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200"
                                  : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              {isCompleted ? "Completed" : isDue ? "Due Now" : "Upcoming"}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-rose-300 font-medium">
                            {def.fullTitle}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-rose-400">
                            Prevents: {def.targetDiseases.join(", ")}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                          <button
                            onClick={() => setSelectedWhyVaccine(def)}
                            className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Why is this due?</span>
                          </button>

                          {!isCompleted && (
                            <button
                              onClick={() => {
                                setSelectedVaccineId(def.vaccineId);
                                setIsAddModalOpen(true);
                              }}
                              className="px-3 py-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-[11px] shadow-sm transition-all"
                            >
                              Log Dose
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: PEDIATRIC VISIT PREP */}
      {/* ========================================== */}
      {activeTab === "prep" && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-[#1a1420] rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-rose-100">
                  Pediatric Immunization Brief
                </h2>
                <p className="text-xs text-slate-500">
                  Synthesize completed and upcoming vaccines directly into your Doctor Brief (Feature 18).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-rose-100">
                Summary for Pediatrician:
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-rose-200">
                <li>
                  Total Completed Doses: <strong>{summary.totalCompleted}</strong> (Birth series documented)
                </li>
                <li>
                  Current Due Doses: <strong>{summary.totalDue}</strong>
                </li>
                {summary.nextDueVaccine && (
                  <li>
                    Next Scheduled Vaccine: <strong>{summary.nextDueVaccine.fullTitle}</strong> (Target Age: {summary.nextDueVaccine.recommendedAgeLabel})
                  </li>
                )}
              </ul>
            </div>

            <div className="pt-4 border-t border-rose-100 dark:border-rose-900/30 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Send vaccination summary to Doctor Brief?
              </span>
              <button
                onClick={() => {
                  if (onNavigateSubPage) onNavigateSubPage("doctor-brief");
                  else setActivePage("doctor-brief" as PageView);
                }}
                className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md inline-flex items-center gap-2 transition-all"
              >
                <span>Open Doctor Brief Generator (Feature 18)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: LOG ADMINISTERED VACCINE */}
      {/* ========================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a1420] rounded-3xl p-6 max-w-md w-full border border-rose-100 dark:border-rose-900/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/30 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-rose-100">
                Log Administered Vaccine
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-rose-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVaccination} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                  Select Vaccine:
                </label>
                <select
                  value={selectedVaccineId}
                  onChange={(e) => setSelectedVaccineId(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                  required
                >
                  <option value="">-- Select Vaccine from Schedule --</option>
                  {scheduleDefinitions.map((d) => (
                    <option key={d.vaccineId} value={d.vaccineId}>
                      {d.code} - {d.fullTitle} ({d.recommendedAgeLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                    Date Given:
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                    Time Given:
                  </label>
                  <input
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                  Provider Name (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. A. Sharma"
                  value={formProvider}
                  onChange={(e) => setFormProvider(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                  Clinic / Hospital Location:
                </label>
                <input
                  type="text"
                  placeholder="e.g. City Hospital Vaccination Center"
                  value={formClinic}
                  onChange={(e) => setFormClinic(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                  Batch / Lot Number (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. HEPB-2026-904"
                  value={formLot}
                  onChange={(e) => setFormLot(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                  Verification Record Source:
                </label>
                <select
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value as VaccineVerificationSource)}
                  className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                >
                  <option value="VACCINATION_CARD">Physical Vaccination Card</option>
                  <option value="HOSPITAL_RECORD">Hospital / Clinic Discharge Summary</option>
                  <option value="PEDIATRICIAN_CLINIC">Pediatrician Direct Record</option>
                  <option value="PARENT_MEMORY">Parent Memory / Unverified</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                  Notes:
                </label>
                <textarea
                  rows={2}
                  placeholder="Add optional notes..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 font-extrabold text-slate-600 dark:text-rose-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold shadow-md"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: WHY IS THIS DUE? */}
      {/* ========================================== */}
      {selectedWhyVaccine && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a1420] rounded-3xl p-6 max-w-md w-full border border-rose-100 dark:border-rose-900/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/30 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-rose-100">
                  Why is this vaccine due?
                </h3>
              </div>
              <button
                onClick={() => setSelectedWhyVaccine(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-rose-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-rose-200">
              <p>
                <strong>Vaccine:</strong> {selectedWhyVaccine.fullTitle} ({selectedWhyVaccine.code})
              </p>
              <p>
                <strong>Target Diseases:</strong> {selectedWhyVaccine.targetDiseases.join(", ")}
              </p>
              <p>
                <strong>Schedule Rationale:</strong> This dose is recommended at <strong>{selectedWhyVaccine.recommendedAgeLabel}</strong> according to the national immunization schedule.
              </p>
              <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/50">
                <p className="text-teal-900 dark:text-teal-200">
                  {selectedWhyVaccine.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedWhyVaccine(null)}
              className="w-full py-3 rounded-2xl bg-teal-600 text-white font-extrabold shadow-md"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

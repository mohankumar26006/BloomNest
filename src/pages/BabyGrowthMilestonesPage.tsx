import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { PageView } from "../types";
import {
  getGrowthRecords,
  saveGrowthRecord,
  deleteGrowthRecord,
  getMilestoneObservations,
  updateMilestoneStatus,
  getBabyGrowthSummary,
  BUILTIN_MILESTONES,
} from "../utils/babyGrowthMilestonesEngine";
import {
  GrowthRecord,
  MilestoneObservation,
  MilestoneStatus,
  MilestoneCategory,
  GrowthMeasurementSource,
} from "../types";
import {
  TrendingUp,
  Scale,
  Ruler,
  Brain,
  Baby,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Calendar,
  FileText,
  ChevronRight,
  Info,
  Heart,
  ChevronDown,
  BookOpen,
} from "lucide-react";

export const BabyGrowthMilestonesPage: React.FC<{
  onNavigateSubPage?: (page: string) => void;
}> = ({ onNavigateSubPage }) => {
  const { user, setActivePage } = useApp();

  const profile = user.postpartumProfile || {
    deliveryDate: new Date().toISOString().split("T")[0],
    numberOfBabies: 1,
    deliveryType: "vaginal" as const,
  };

  // Selected Baby ID (Multi-baby support for twins/multiples)
  const [selectedBabyId, setSelectedBabyId] = useState<string>("baby_1");
  const [activeTab, setActiveTab] = useState<"growth" | "milestones" | "story" | "prep">("growth");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Growth Form Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formWeight, setFormWeight] = useState<string>("");
  const [formLength, setFormLength] = useState<string>("");
  const [formHead, setFormHead] = useState<string>("");
  const [formSource, setFormSource] = useState<GrowthMeasurementSource>("PEDIATRICIAN_VISIT");
  const [formLocation, setFormLocation] = useState<string>("");
  const [formNotes, setFormNotes] = useState<string>("");

  // Reload trigger for reactive state updates
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const babyName = selectedBabyId === "baby_2" ? "Baby B" : "Baby A";
  const birthDate = profile.deliveryDate;

  // Load summary and datasets
  const summary = getBabyGrowthSummary(selectedBabyId, babyName, birthDate);
  const growthRecords = getGrowthRecords(selectedBabyId);
  const milestoneObs = getMilestoneObservations(selectedBabyId);

  const handleSaveGrowth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formWeight && !formLength && !formHead) {
      alert("Please enter at least one measurement (weight, length, or head circumference).");
      return;
    }

    saveGrowthRecord({
      babyId: selectedBabyId,
      measurementDate: formDate,
      weightKg: formWeight ? parseFloat(formWeight) : undefined,
      lengthCm: formLength ? parseFloat(formLength) : undefined,
      headCircumferenceCm: formHead ? parseFloat(formHead) : undefined,
      measurementSource: formSource,
      measurementLocation: formLocation || undefined,
      measurementNotes: formNotes || undefined,
    });

    setIsAddModalOpen(false);
    setFormWeight("");
    setFormLength("");
    setFormHead("");
    setFormNotes("");
    setFormLocation("");
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDeleteGrowth = (id: string) => {
    if (confirm("Are you sure you want to delete this measurement record?")) {
      deleteGrowthRecord(id);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const handleMilestoneStatusChange = (milestoneId: string, newStatus: MilestoneStatus) => {
    updateMilestoneStatus(selectedBabyId, milestoneId, newStatus);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleMilestoneNotesChange = (milestoneId: string, notes: string) => {
    const existing = milestoneObs.find((m) => m.milestoneId === milestoneId);
    const currentStatus = existing ? existing.status : "NOT_YET_OBSERVED";
    updateMilestoneStatus(selectedBabyId, milestoneId, currentStatus, notes);
    setRefreshTrigger((prev) => prev + 1);
  };

  const getObservation = (milestoneId: string): MilestoneObservation | undefined => {
    return milestoneObs.find((m) => m.milestoneId === milestoneId);
  };

  // Milestone Category Filter
  const filteredMilestones = BUILTIN_MILESTONES.filter((m) => {
    if (selectedCategory === "ALL") return true;
    return m.category === selectedCategory;
  });

  const getCategoryBadgeColor = (cat: MilestoneCategory) => {
    switch (cat) {
      case "GROSS_MOTOR":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300";
      case "FINE_MOTOR":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300";
      case "COMMUNICATION":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300";
      case "SOCIAL_EMOTIONAL":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300";
      case "COGNITIVE":
        return "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 px-4 sm:px-6">
      {/* 1. HERO HEADER */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                Feature 27 • Longitudinal Layer
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-xs font-black">
                {summary.ageDays} Days Old (Week {summary.ageWeeks})
              </span>
            </div>

            {/* Multi-Baby Switcher */}
            {profile.numberOfBabies > 1 && (
              <div className="flex bg-white/20 backdrop-blur-md p-1 rounded-2xl border border-white/30">
                <button
                  onClick={() => setSelectedBabyId("baby_1")}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedBabyId === "baby_1" ? "bg-white text-indigo-900 shadow-sm" : "text-white hover:bg-white/10"
                  }`}
                >
                  Baby A
                </button>
                <button
                  onClick={() => setSelectedBabyId("baby_2")}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedBabyId === "baby_2" ? "bg-white text-indigo-900 shadow-sm" : "text-white hover:bg-white/10"
                  }`}
                >
                  Baby B
                </button>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              {babyName}'s Growth & Milestones 👶🏻
            </h1>
            <p className="text-sm sm:text-base text-indigo-100 max-w-3xl leading-relaxed">
              Track physical measurements and age-appropriate developmental observations over time. Derived from canonical baby profile context without clinical diagnoses.
            </p>
          </div>

          {/* Quick Metrics Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
              <span className="text-[10px] uppercase font-bold text-indigo-200 block">Latest Weight</span>
              <span className="text-xl sm:text-2xl font-black text-white">
                {summary.latestWeightKg ? `${summary.latestWeightKg} kg` : "Not recorded"}
              </span>
              {summary.recordedWeightChangeKg !== undefined && (
                <span className="text-[11px] text-emerald-300 font-bold block mt-0.5">
                  {summary.recordedWeightChangeKg >= 0 ? `+${summary.recordedWeightChangeKg} kg` : `${summary.recordedWeightChangeKg} kg`} vs prev
                </span>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
              <span className="text-[10px] uppercase font-bold text-indigo-200 block">Latest Length</span>
              <span className="text-xl sm:text-2xl font-black text-white">
                {summary.latestLengthCm ? `${summary.latestLengthCm} cm` : "Not recorded"}
              </span>
              <span className="text-[11px] text-indigo-200 font-medium block mt-0.5">Height trajectory</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
              <span className="text-[10px] uppercase font-bold text-indigo-200 block">Head Circumference</span>
              <span className="text-xl sm:text-2xl font-black text-white">
                {summary.latestHeadCircumferenceCm ? `${summary.latestHeadCircumferenceCm} cm` : "Not recorded"}
              </span>
              <span className="text-[11px] text-indigo-200 font-medium block mt-0.5">Cranial growth</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
              <span className="text-[10px] uppercase font-bold text-indigo-200 block">Observed Milestones</span>
              <span className="text-xl sm:text-2xl font-black text-white">
                {summary.observedMilestonesCount} / {BUILTIN_MILESTONES.length}
              </span>
              <span className="text-[11px] text-amber-200 font-bold block mt-0.5">
                {summary.itemsToDiscussWithPediaCount > 0 ? `${summary.itemsToDiscussWithPediaCount} to discuss` : "Age-appropriate"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. NAVIGATION TABS */}
      <div className="flex border-b border-rose-100 dark:border-rose-900/40 space-x-2 sm:space-x-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("growth")}
          className={`py-3 px-4 font-bold text-xs sm:text-sm rounded-t-2xl border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "growth"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#1a1420] shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-rose-300 dark:hover:text-white"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Physical Growth</span>
        </button>

        <button
          onClick={() => setActiveTab("milestones")}
          className={`py-3 px-4 font-bold text-xs sm:text-sm rounded-t-2xl border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "milestones"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#1a1420] shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-rose-300 dark:hover:text-white"
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Developmental Milestones</span>
        </button>

        <button
          onClick={() => setActiveTab("story")}
          className={`py-3 px-4 font-bold text-xs sm:text-sm rounded-t-2xl border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "story"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#1a1420] shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-rose-300 dark:hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Growth Story & Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab("prep")}
          className={`py-3 px-4 font-bold text-xs sm:text-sm rounded-t-2xl border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "prep"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#1a1420] shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-rose-300 dark:hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Pediatrician Visit Prep</span>
          {summary.itemsToDiscussWithPediaCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
              {summary.itemsToDiscussWithPediaCount}
            </span>
          )}
        </button>
      </div>

      {/* ========================================== */}
      {/* TAB 1: PHYSICAL GROWTH & MEASUREMENTS */}
      {/* ========================================== */}
      {activeTab === "growth" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-rose-100">Growth Records & Timeline</h2>
              <p className="text-xs text-slate-500 dark:text-rose-300">
                Log physical growth measurements (weight, length, head circumference) from pediatric visits or home.
              </p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md inline-flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Growth Measurement</span>
            </button>
          </div>

          {/* Reference Notice */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
              <p className="font-bold">Growth Measurement Transparency Standard</p>
              <p>
                Recorded values represent actual measured entries. Growth interpretation varies by age, sex, and measurement technique. Discuss growth charts with your pediatrician during routine checkups.
              </p>
            </div>
          </div>

          {/* Growth Records Timeline */}
          {growthRecords.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#1a1420] rounded-3xl border border-rose-100 dark:border-rose-900/30 space-y-3">
              <Scale className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-rose-200">No Growth Measurements Recorded Yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tap "Log New Growth Measurement" above to record your baby's weight, length, or head circumference.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {growthRecords.map((r, idx) => (
                <div
                  key={r.growthRecordId}
                  className="p-5 bg-white dark:bg-[#1a1420] rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-indigo-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 font-black text-sm">
                      #{growthRecords.length - idx}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-slate-900 dark:text-rose-100">
                          {r.measurementDate}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                          {r.measurementSource === "PEDIATRICIAN_VISIT"
                            ? "🩺 Pediatric Visit"
                            : r.measurementSource === "HOME_SCALE"
                            ? "🏡 Home Scale"
                            : "🏥 Clinic"}
                        </span>
                        {r.measurementLocation && (
                          <span className="text-[11px] text-slate-400 dark:text-rose-300 font-medium">
                            • {r.measurementLocation}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-700 dark:text-rose-200 pt-1">
                        {r.weightKg !== undefined && (
                          <span className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-xl text-indigo-900 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-900/40">
                            <Scale className="w-3.5 h-3.5 text-indigo-600" />
                            Weight: <strong className="font-extrabold">{r.weightKg} kg</strong>
                          </span>
                        )}

                        {r.lengthCm !== undefined && (
                          <span className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-xl text-emerald-900 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-900/40">
                            <Ruler className="w-3.5 h-3.5 text-emerald-600" />
                            Length: <strong className="font-extrabold">{r.lengthCm} cm</strong>
                          </span>
                        )}

                        {r.headCircumferenceCm !== undefined && (
                          <span className="flex items-center gap-1 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded-xl text-purple-900 dark:text-purple-200 border border-purple-100 dark:border-purple-900/40">
                            <Brain className="w-3.5 h-3.5 text-purple-600" />
                            Head Circ: <strong className="font-extrabold">{r.headCircumferenceCm} cm</strong>
                          </span>
                        )}
                      </div>

                      {r.measurementNotes && (
                        <p className="text-xs text-slate-500 dark:text-rose-300 italic pt-1">
                          "{r.measurementNotes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => handleDeleteGrowth(r.growthRecordId)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all"
                      title="Delete measurement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: DEVELOPMENTAL MILESTONES */}
      {/* ========================================== */}
      {activeTab === "milestones" && (
        <div className="space-y-6">
          {/* Reassurance Banner */}
          <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-800 dark:text-amber-100 space-y-1">
              <p className="font-bold text-amber-900 dark:text-amber-300">
                Core Safety & Guidance Rule: "Not Yet Observed" ≠ "Delayed"
              </p>
              <p>
                Every baby develops at their own unique pace within wide age windows. "Not yet observed" simply means you haven't seen the behavior yet—it is not a diagnosis of delay. If you have questions, mark "Discuss with Pediatrician".
              </p>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "ALL", label: "All Categories" },
              { id: "GROSS_MOTOR", label: "🏃 Gross Motor" },
              { id: "FINE_MOTOR", label: "✋ Fine Motor" },
              { id: "COMMUNICATION", label: "🗣️ Communication" },
              { id: "SOCIAL_EMOTIONAL", label: "💕 Social / Emotional" },
              { id: "COGNITIVE", label: "🧠 Cognitive" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white dark:bg-[#1a1420] text-slate-600 dark:text-rose-200 border border-rose-100 dark:border-rose-900/40 hover:bg-rose-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Milestones List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMilestones.map((m) => {
              const obs = getObservation(m.milestoneId);
              const status: MilestoneStatus = obs ? obs.status : "NOT_YET_OBSERVED";

              return (
                <div
                  key={m.milestoneId}
                  className="p-5 bg-white dark:bg-[#1a1420] rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${getCategoryBadgeColor(m.category)}`}>
                        {m.category.replace("_", " ")}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-rose-300">
                        {m.ageRangeLabel}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-rose-100 leading-tight">
                      {m.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-rose-200 leading-relaxed">
                      {m.description}
                    </p>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-rose-300 space-y-0.5">
                      <strong className="text-indigo-600 dark:text-indigo-400 block font-bold">Parent Tip:</strong>
                      <span>{m.tipsForParents}</span>
                    </div>
                  </div>

                  {/* Status Selector Dropdown */}
                  <div className="pt-2 border-t border-rose-100 dark:border-rose-900/30 space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-rose-300 block">
                      Observation Status:
                    </label>
                    <select
                      value={status}
                      onChange={(e) => handleMilestoneStatusChange(m.milestoneId, e.target.value as MilestoneStatus)}
                      className={`w-full p-2.5 rounded-2xl text-xs font-extrabold border transition-all ${
                        status === "OBSERVED" || status === "CONSISTENTLY_OBSERVED"
                          ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200"
                          : status === "DISCUSS_WITH_PEDIA"
                          ? "bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/60 dark:text-rose-200"
                          : "bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-900 dark:text-rose-100"
                      }`}
                    >
                      <option value="NOT_YET_OBSERVED">○ Not yet observed</option>
                      <option value="OBSERVED">✓ Observed</option>
                      <option value="CONSISTENTLY_OBSERVED">🌟 Consistently observed</option>
                      <option value="DISCUSS_WITH_PEDIA">🩺 Discuss with pediatrician</option>
                      <option value="NOT_APPLICABLE">⚪ Not applicable / Unsure</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Add observation note (optional)..."
                      value={obs?.userNotes || ""}
                      onChange={(e) => handleMilestoneNotesChange(m.milestoneId, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs border border-rose-100 dark:border-rose-900/40 bg-white dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: BABY'S GROWTH STORY & TIMELINE */}
      {/* ========================================== */}
      {activeTab === "story" && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-[#1a1420] rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-rose-100">
                  {babyName}'s Living Growth Story
                </h2>
                <p className="text-xs text-slate-500">
                  Chronological timeline connecting birth records, physical growth, and first developmental memories.
                </p>
              </div>
            </div>

            {/* Timeline Stream */}
            <div className="relative pl-6 border-l-2 border-indigo-200 dark:border-indigo-900/50 space-y-6 pt-2">
              {/* Event 1: Birth */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white dark:border-[#1a1420]" />
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    Day 1 • Birth
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-rose-100">Welcome to the World! 💖</h4>
                  <p className="text-xs text-slate-600 dark:text-rose-300">
                    Birth Weight recorded: <strong>{summary.birthWeightKg || "3.2"} kg</strong> • Delivery: {profile.deliveryType.replace("_", " ")}
                  </p>
                </div>
              </div>

              {/* Event 2: Growth Measurements */}
              {growthRecords.map((g) => (
                <div key={g.growthRecordId} className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1a1420]" />
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {g.measurementDate} • Growth Check
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-rose-100">
                      Physical Growth Recorded
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-rose-300">
                      Weight: <strong>{g.weightKg || "--"} kg</strong> | Length: <strong>{g.lengthCm || "--"} cm</strong> | Head: <strong>{g.headCircumferenceCm || "--"} cm</strong>
                    </p>
                    {g.measurementNotes && (
                      <p className="text-[11px] text-slate-500 italic">"{g.measurementNotes}"</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Event 3: Observed Milestones */}
              {milestoneObs
                .filter((m) => m.status === "OBSERVED" || m.status === "CONSISTENTLY_OBSERVED")
                .map((m) => {
                  const def = BUILTIN_MILESTONES.find((b) => b.milestoneId === m.milestoneId);
                  return (
                    <div key={m.observationId} className="relative">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-white dark:border-[#1a1420]" />
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          ✨ First Memory • {m.firstObservedAt || "Recent"}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-rose-100">
                          Milestone Observed: {def?.title || "Skill"}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-rose-300">
                          {def?.description}
                        </p>
                        {m.userNotes && (
                          <p className="text-[11px] text-amber-800 dark:text-amber-200 font-medium">
                            Notes: "{m.userNotes}"
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 4: PEDIATRICIAN VISIT PREP */}
      {/* ========================================== */}
      {activeTab === "prep" && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-[#1a1420] rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-rose-100">
                  Pediatric Visit Discussion Items
                </h2>
                <p className="text-xs text-slate-500">
                  Items marked for pediatrician review can be easily added to your Doctor Brief (Feature 18).
                </p>
              </div>
            </div>

            {/* List of items tagged DISCUSS_WITH_PEDIA */}
            {milestoneObs.filter((m) => m.status === "DISCUSS_WITH_PEDIA").length === 0 ? (
              <div className="p-6 text-center bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/30 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-rose-200">
                  No Milestone Concerns Flagged For Pediatrician Review
                </p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  If you have a question about a specific milestone, select "Discuss with pediatrician" on the Milestones tab.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {milestoneObs
                  .filter((m) => m.status === "DISCUSS_WITH_PEDIA")
                  .map((m) => {
                    const def = BUILTIN_MILESTONES.find((b) => b.milestoneId === m.milestoneId);
                    return (
                      <div
                        key={m.observationId}
                        className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400 block">
                            Milestone Question • {def?.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-rose-100">
                            {def?.title}
                          </h4>
                          {m.userNotes && (
                            <p className="text-xs text-slate-600 dark:text-rose-300 italic mt-0.5">
                              "{m.userNotes}"
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            if (onNavigateSubPage) onNavigateSubPage("doctor-brief");
                            else setActivePage("doctor-brief" as PageView);
                          }}
                          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-rose-600 font-extrabold text-xs border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-all shrink-0 self-start sm:self-center"
                        >
                          + Send to Doctor Brief (F18)
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}

            <div className="pt-4 border-t border-rose-100 dark:border-rose-900/30 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Ready to review clinician brief?
              </span>
              <button
                onClick={() => {
                  if (onNavigateSubPage) onNavigateSubPage("doctor-brief");
                  else setActivePage("doctor-brief" as PageView);
                }}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md inline-flex items-center gap-2 transition-all"
              >
                <span>Open Doctor Brief Generator (Feature 18)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: LOG NEW GROWTH MEASUREMENT */}
      {/* ========================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a1420] rounded-3xl p-6 max-w-md w-full border border-rose-100 dark:border-rose-900/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/30 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-rose-100">
                Log New Growth Measurement
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-rose-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGrowth} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                  Measurement Date:
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                    Weight (kg):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 3.4"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                    Length (cm):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 51.0"
                    value={formLength}
                    onChange={(e) => setFormLength(e.target.value)}
                    className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                    Head (cm):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 35.0"
                    value={formHead}
                    onChange={(e) => setFormHead(e.target.value)}
                    className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                  Measurement Source:
                </label>
                <select
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value as GrowthMeasurementSource)}
                  className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="PEDIATRICIAN_VISIT">🩺 Pediatrician Visit</option>
                  <option value="HOME_SCALE">🏡 Home Scale</option>
                  <option value="CLINIC">🏥 Community Clinic</option>
                  <option value="OTHER">⚪ Other</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                  Clinic / Location Name (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. City Children's Hospital"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                  Notes / Observations:
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 2-week checkup. Doctor confirmed healthy weight gain."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
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
                  className="w-1/2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md"
                >
                  Save Measurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

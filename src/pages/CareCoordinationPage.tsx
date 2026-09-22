import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { PageView } from "../types";
import {
  getCareCoordinationItems,
  getCareTeamMembers,
  addCareCoordinationItem,
  addCareTeamMember,
  updateCareItemStatus,
  deleteCareCoordinationItem,
  evaluateCareCoordinationSummary,
} from "../utils/careCoordinationEngine";
import {
  CareCoordinationItem,
  CareTeamMember,
  CareCoordinationStatus,
  CareCoordinationPriority,
  CareActionType,
} from "../types";
import {
  Network,
  Layers,
  CheckSquare,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ChevronRight,
  Info,
  Calendar,
  Building2,
  Phone,
  Mail,
  UserCheck,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export const CareCoordinationPage: React.FC<{
  onNavigateSubPage?: (page: string) => void;
}> = ({ onNavigateSubPage }) => {
  const { user, setActivePage } = useApp();

  const [activeTab, setActiveTab] = useState<"active" | "team" | "graph">("active");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Task Creation Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPersonType, setFormPersonType] = useState<"MOTHER" | "BABY">("MOTHER");
  const [formCategory, setFormCategory] = useState<CareCoordinationItem["category"]>("APPOINTMENT");
  const [formPriority, setFormPriority] = useState<CareCoordinationPriority>("MEDIUM");
  const [formActionType, setFormActionType] = useState<CareActionType>("SCHEDULE_APPOINTMENT");
  const [formDueDate, setFormDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [formMemberId, setFormMemberId] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Provider Creation Modal State
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [provName, setProvName] = useState("");
  const [provRole, setProvRole] = useState<CareTeamMember["role"]>("PEDIATRICIAN");
  const [provSpecialty, setProvSpecialty] = useState("");
  const [provClinic, setProvClinic] = useState("");
  const [provPhone, setProvPhone] = useState("");
  const [provEmail, setProvEmail] = useState("");

  // Datasets & Summary
  const summary = evaluateCareCoordinationSummary();
  const items = getCareCoordinationItems();
  const teamMembers = getCareTeamMembers();

  const handleStatusChange = (coordinationId: string, newStatus: CareCoordinationStatus) => {
    updateCareItemStatus(coordinationId, newStatus);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Are you sure you want to remove this care coordination task?")) {
      deleteCareCoordinationItem(id);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;

    addCareCoordinationItem({
      personType: formPersonType,
      category: formCategory,
      title: formTitle,
      description: formDesc,
      priority: formPriority,
      status: "ACTION_REQUIRED",
      sourceFeature: "Feature 30",
      actionType: formActionType,
      dueDate: formDueDate,
      careTeamMemberId: formMemberId || undefined,
      userNotes: formNotes || undefined,
    });

    setIsTaskModalOpen(false);
    setFormTitle("");
    setFormDesc("");
    setFormNotes("");
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSaveProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provName || !provClinic) return;

    addCareTeamMember({
      name: provName,
      role: provRole,
      specialty: provSpecialty || "Specialist Care",
      clinicName: provClinic,
      phone: provPhone || undefined,
      email: provEmail || undefined,
    });

    setIsProviderModalOpen(false);
    setProvName("");
    setProvSpecialty("");
    setProvClinic("");
    setProvPhone("");
    setProvEmail("");
    setRefreshTrigger((prev) => prev + 1);
  };

  const getPriorityBadgeColor = (p: CareCoordinationPriority) => {
    switch (p) {
      case "URGENT":
        return "bg-rose-500 text-white animate-pulse font-black";
      case "HIGH":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-extrabold";
      case "MEDIUM":
        return "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-bold";
      case "ROUTINE":
        return "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-medium";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
    }
  };

  const getStatusBadgeColor = (s: CareCoordinationStatus) => {
    switch (s) {
      case "ACTION_REQUIRED":
      case "NEEDS_REVIEW":
      case "DETECTED":
        return "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200";
      case "SCHEDULED":
        return "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200";
      case "IN_PROGRESS":
      case "AWAITING_OUTCOME":
        return "bg-purple-50 border-purple-200 text-purple-900 dark:bg-purple-950/40 dark:text-purple-200";
      case "COMPLETED":
      case "RESOLVED_CLOSED":
        return "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200";
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 px-4 sm:px-6">
      {/* 1. HERO HEADER */}
      <section className="bg-gradient-to-br from-indigo-700 via-purple-700 to-teal-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
              Feature 30 • Final Orchestration Layer
            </span>
            <span className="px-3 py-1 rounded-full bg-teal-300 text-slate-900 text-xs font-black">
              Care Coordination Backbone
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Care Coordination & Orchestration Hub 🕸️
            </h1>
            <p className="text-sm sm:text-base text-indigo-100 max-w-3xl leading-relaxed">
              Connects detection → review → safety → appointment → doctor brief → provider outcome → follow-up → monitoring → resolution into a seamless care journey.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
              <span className="text-[10px] uppercase font-bold text-indigo-200 block">Needs Attention</span>
              <span className="text-xl sm:text-2xl font-black text-rose-300">
                {summary.needsAttentionCount} Items
              </span>
              <span className="text-[11px] text-rose-200 font-bold block mt-0.5">Action required</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
              <span className="text-[10px] uppercase font-bold text-indigo-200 block">Upcoming Visits</span>
              <span className="text-xl sm:text-2xl font-black text-amber-300">
                {summary.upcomingCount} Scheduled
              </span>
              <span className="text-[11px] text-amber-200 font-bold block mt-0.5">Visits & Vax</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
              <span className="text-[10px] uppercase font-bold text-indigo-200 block">In Progress</span>
              <span className="text-xl sm:text-2xl font-black text-purple-300">
                {summary.inProgressCount} Active
              </span>
              <span className="text-[11px] text-purple-200 font-medium block mt-0.5">Care threads open</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
              <span className="text-[10px] uppercase font-bold text-indigo-200 block">Completed</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-300">
                {summary.completedCount} Resolved
              </span>
              <span className="text-[11px] text-emerald-200 font-bold block mt-0.5">Closed workflows</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-indigo-200 block">Care Team</span>
              <span className="text-xl sm:text-2xl font-black text-white">
                {summary.careTeamMembersCount} Specialists
              </span>
              <span className="text-[11px] text-indigo-200 font-medium block mt-0.5">Pediatric & OB-GYN</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. NAVIGATION TABS */}
      <div className="flex border-b border-rose-100 dark:border-rose-900/40 space-x-2 sm:space-x-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("active")}
          className={`py-3 px-4 font-bold text-xs sm:text-sm rounded-t-2xl border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "active"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#1a1420] shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-rose-300 dark:hover:text-white"
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Care Orchestration Hub</span>
        </button>

        <button
          onClick={() => setActiveTab("team")}
          className={`py-3 px-4 font-bold text-xs sm:text-sm rounded-t-2xl border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "team"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#1a1420] shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-rose-300 dark:hover:text-white"
          }`}
        >
          <Users className="w-4 h-4 text-purple-600" />
          <span>Care Team Directory</span>
        </button>

        <button
          onClick={() => setActiveTab("graph")}
          className={`py-3 px-4 font-bold text-xs sm:text-sm rounded-t-2xl border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "graph"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#1a1420] shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-rose-300 dark:hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4 text-teal-600" />
          <span>Care Flow Pipeline Visualizer</span>
        </button>
      </div>

      {/* ========================================== */}
      {/* TAB 1: CARE ORCHESTRATION HUB */}
      {/* ========================================== */}
      {activeTab === "active" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-rose-100">Care Action Workflows</h2>
              <p className="text-xs text-slate-500 dark:text-rose-300">
                Orchestrated tasks linking safety alerts, doctor briefs, appointments, vaccinations, and follow-ups.
              </p>
            </div>

            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md inline-flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Care Task</span>
            </button>
          </div>

          {/* Swimlanes / List */}
          <div className="space-y-4">
            {items.map((item) => {
              const assignedMember = teamMembers.find((m) => m.memberId === item.careTeamMemberId);

              return (
                <div
                  key={item.coordinationId}
                  className={`p-5 bg-white dark:bg-[#1a1420] rounded-3xl border shadow-sm space-y-3 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${getStatusBadgeColor(
                    item.status
                  )}`}
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase ${getPriorityBadgeColor(item.priority)}`}>
                        {item.priority} Priority
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                        {item.personType === "BABY" ? "👶 Baby Care" : "💗 Mother Care"}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-[10px] font-bold">
                        {item.sourceFeature}
                      </span>
                      {item.dueDate && (
                        <span className="text-[11px] font-bold text-slate-500 dark:text-rose-300 ml-auto">
                          Due: {item.dueDate}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-rose-100">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-rose-200 leading-relaxed">
                      {item.description}
                    </p>

                    {assignedMember && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-rose-300">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Assigned Specialist: <strong>{assignedMember.name}</strong> ({assignedMember.clinicName})</span>
                      </div>
                    )}

                    {item.userNotes && (
                      <p className="text-[11px] text-slate-500 italic pt-0.5">
                        "{item.userNotes}"
                      </p>
                    )}
                  </div>

                  {/* Actions & Lifecycle Selectors */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {/* Action Bridges */}
                    {item.actionType === "PREPARE_DOCTOR_BRIEF" && (
                      <button
                        onClick={() => {
                          if (onNavigateSubPage) onNavigateSubPage("doctor-brief");
                          else setActivePage("doctor-brief" as PageView);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-sm inline-flex items-center gap-1"
                      >
                        <span>Open Brief (F18)</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {item.actionType === "SCHEDULE_APPOINTMENT" && (
                      <button
                        onClick={() => {
                          if (onNavigateSubPage) onNavigateSubPage("appointments");
                          else setActivePage("appointments" as PageView);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-sm inline-flex items-center gap-1"
                      >
                        <span>Open Visits (F17)</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {item.actionType === "VERIFY_VACCINE_RECORD" && (
                      <button
                        onClick={() => {
                          if (onNavigateSubPage) onNavigateSubPage("vaccines");
                          else setActivePage("vaccinations" as PageView);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-sm inline-flex items-center gap-1"
                      >
                        <span>Vaccine Card (F28)</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.coordinationId, e.target.value as CareCoordinationStatus)}
                      className="p-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-rose-100"
                    >
                      <option value="ACTION_REQUIRED">🔴 Action Required</option>
                      <option value="NEEDS_REVIEW">🟠 Needs Review</option>
                      <option value="SCHEDULED">🗓️ Scheduled</option>
                      <option value="IN_PROGRESS">🔵 In Progress</option>
                      <option value="COMPLETED">🟢 Completed</option>
                      <option value="RESOLVED_CLOSED">✓ Closed</option>
                    </select>

                    <button
                      onClick={() => handleDeleteItem(item.coordinationId)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: CARE TEAM DIRECTORY */}
      {/* ========================================== */}
      {activeTab === "team" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-rose-100">Care Team Directory</h2>
              <p className="text-xs text-slate-500 dark:text-rose-300">
                Connected healthcare professionals (Pediatrician, OB-GYN, Lactation Consultant).
              </p>
            </div>

            <button
              onClick={() => setIsProviderModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md inline-flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Care Team Specialist</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teamMembers.map((m) => (
              <div
                key={m.memberId}
                className="p-5 bg-white dark:bg-[#1a1420] rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[10px] font-extrabold uppercase">
                      {m.role.replace("_", " ")}
                    </span>
                    <Building2 className="w-4 h-4 text-purple-500" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-rose-100">
                    {m.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-rose-300 font-medium">
                    {m.specialty}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-rose-400">
                    🏥 {m.clinicName}
                  </p>

                  <div className="space-y-1 pt-2 text-[11px] text-slate-600 dark:text-rose-200">
                    {m.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-purple-600" />
                        <span>{m.phone}</span>
                      </div>
                    )}

                    {m.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-purple-600" />
                        <span>{m.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-rose-100 dark:border-rose-900/30 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      if (onNavigateSubPage) onNavigateSubPage("doctor-brief");
                      else setActivePage("doctor-brief" as PageView);
                    }}
                    className="w-1/2 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-xs text-center border border-purple-200 transition-all"
                  >
                    Brief (F18)
                  </button>
                  <button
                    onClick={() => {
                      if (onNavigateSubPage) onNavigateSubPage("appointments");
                      else setActivePage("appointments" as PageView);
                    }}
                    className="w-1/2 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs text-center border border-indigo-200 transition-all"
                  >
                    Visit (F17)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: CARE FLOW PIPELINE VISUALIZER */}
      {/* ========================================== */}
      {activeTab === "graph" && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-[#1a1420] rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-rose-100">
                  Closed-Loop Care Flow Pipeline
                </h2>
                <p className="text-xs text-slate-500">
                  How BloomNest connects every care event from detection to doctor brief, appointment, and resolution.
                </p>
              </div>
            </div>

            {/* Pipeline Visual Flow */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center pt-2">
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-1">
                <span className="text-[10px] font-black uppercase text-rose-600 block">Step 1 • Detection</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-rose-100">Record / Anomaly</h4>
                <p className="text-[11px] text-slate-500">F2-F16 / F19-F20</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-600 block">Step 2 • Safety Review</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-rose-100">Clinical Safety Shield</h4>
                <p className="text-[11px] text-slate-500">Feature 04 Evaluation</p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 space-y-1">
                <span className="text-[10px] font-black uppercase text-purple-600 block">Step 3 • Visit Prep</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-rose-100">Brief & Appointment</h4>
                <p className="text-[11px] text-slate-500">F17 & F18 Doctor Brief</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-600 block">Step 4 • Continuity</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-rose-100">Follow-up & Memory</h4>
                <p className="text-[11px] text-slate-500">F24, F29 & F30</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: CREATE CARE TASK */}
      {/* ========================================== */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a1420] rounded-3xl p-6 max-w-md w-full border border-rose-100 dark:border-rose-900/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/30 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-rose-100">
                Create Custom Care Task
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-rose-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                  Task Title:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Schedule Pediatric 6-Week Growth Check"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                  Task Description:
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the care coordination task..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                    Care Recipient:
                  </label>
                  <select
                    value={formPersonType}
                    onChange={(e) => setFormPersonType(e.target.value as "MOTHER" | "BABY")}
                    className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="MOTHER">💗 Mother Care</option>
                    <option value="BABY">👶 Baby Care</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                    Priority Level:
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as CareCoordinationPriority)}
                    className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="HIGH">🔴 High Priority</option>
                    <option value="MEDIUM">🟡 Medium Priority</option>
                    <option value="ROUTINE">🟢 Routine</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                  Target Due Date:
                </label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                  Assign Specialist (Optional):
                </label>
                <select
                  value={formMemberId}
                  onChange={(e) => setFormMemberId(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="">-- Select Specialist --</option>
                  {teamMembers.map((m) => (
                    <option key={m.memberId} value={m.memberId}>
                      {m.name} ({m.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="w-1/2 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 font-extrabold text-slate-600 dark:text-rose-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: ADD CARE TEAM PROVIDER */}
      {/* ========================================== */}
      {isProviderModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a1420] rounded-3xl p-6 max-w-md w-full border border-rose-100 dark:border-rose-900/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/30 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-rose-100">
                Add Care Team Specialist
              </h3>
              <button
                onClick={() => setIsProviderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-rose-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProvider} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                  Doctor / Provider Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. A. Sharma"
                  value={provName}
                  onChange={(e) => setProvName(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                  Provider Role:
                </label>
                <select
                  value={provRole}
                  onChange={(e) => setProvRole(e.target.value as CareTeamMember["role"])}
                  className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                >
                  <option value="PEDIATRICIAN">🩺 Pediatrician</option>
                  <option value="OBSTETRICIAN">💗 Obstetrician / Gynecologist</option>
                  <option value="LACTATION_CONSULTANT">🤱 Lactation Consultant</option>
                  <option value="PRIMARY_CARE">🏥 Primary Care Physician</option>
                  <option value="OTHER">⚪ Other Specialist</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                  Specialty:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Newborn Care Specialist"
                  value={provSpecialty}
                  onChange={(e) => setProvSpecialty(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                  Clinic / Hospital Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. City Children's Hospital"
                  value={provClinic}
                  onChange={(e) => setProvClinic(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                    Phone Number:
                  </label>
                  <input
                    type="text"
                    placeholder="+91..."
                    value={provPhone}
                    onChange={(e) => setProvPhone(e.target.value)}
                    className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-rose-200 block mb-1">
                    Email Address:
                  </label>
                  <input
                    type="email"
                    placeholder="doctor@..."
                    value={provEmail}
                    onChange={(e) => setProvEmail(e.target.value)}
                    className="w-full p-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProviderModalOpen(false)}
                  className="w-1/2 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 font-extrabold text-slate-600 dark:text-rose-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold shadow-md"
                >
                  Save Specialist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

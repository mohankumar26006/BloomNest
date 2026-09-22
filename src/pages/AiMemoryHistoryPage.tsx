import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { PageView } from "../types";
import {
  getPatientMemoryGraph,
  updateMemoryStatus,
  queryLongitudinalHistory,
  evaluatePatientHistorySummary,
} from "../utils/aiMemoryHistoryEngine";
import { PatientMemoryItem, MemoryType } from "../types";
import {
  Brain,
  Database,
  Search,
  Sparkles,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ChevronRight,
  Info,
  Lock,
  Heart,
  Baby,
  Activity,
  Layers,
  HelpCircle,
  RotateCcw,
  User,
  Filter,
} from "lucide-react";

export const AiMemoryHistoryPage: React.FC<{
  onNavigateSubPage?: (page: string) => void;
}> = ({ onNavigateSubPage }) => {
  const { user, setActivePage } = useApp();

  const [activeTab, setActiveTab] = useState<"graph" | "mother" | "baby" | "concerns" | "preferences">("graph");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemory, setSelectedMemory] = useState<PatientMemoryItem | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Datasets & Summary
  const summary = evaluatePatientHistorySummary();
  const memories = getPatientMemoryGraph();
  const searchResults = queryLongitudinalHistory(searchQuery);

  const handleStatusToggle = (memoryId: string, currentStatus: PatientMemoryItem["status"]) => {
    const nextStatus = currentStatus === "RESOLVED" ? "ACTIVE" : "RESOLVED";
    updateMemoryStatus(memoryId, nextStatus);
    setRefreshTrigger((prev) => prev + 1);
  };

  const getCategoryBadgeColor = (cat: PatientMemoryItem["category"]) => {
    switch (cat) {
      case "MOTHER":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300";
      case "BABY":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300";
      case "CARE_JOURNEY":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300";
      case "PREFERENCE":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
    }
  };

  const getConfidenceBadgeColor = (conf: PatientMemoryItem["confidence"]) => {
    switch (conf) {
      case "PROVIDER_VERIFIED":
        return "bg-emerald-500 text-white";
      case "DIRECT_RECORDED":
        return "bg-indigo-600 text-white";
      case "USER_ENTERED":
        return "bg-purple-600 text-white";
      case "PATTERN_DETECTED":
        return "bg-amber-500 text-slate-900";
      default:
        return "bg-slate-500 text-white";
    }
  };

  // Filter memories by active tab
  const filteredMemories = memories.filter((m) => {
    if (activeTab === "mother") return m.category === "MOTHER";
    if (activeTab === "baby") return m.category === "BABY";
    if (activeTab === "concerns") return m.memoryType === "CONCERN" || m.memoryType === "SAFETY_EVENT";
    if (activeTab === "preferences") return m.category === "PREFERENCE";
    return true; // "graph" tab shows all
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 px-4 sm:px-6">
      {/* 1. HERO HEADER */}
      <section className="bg-purple-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
              Feature 29 • Longitudinal Memory Backbone
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-xs font-black">
              Memory Graph Infrastructure
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              AI Memory & Patient History
            </h1>
            <p className="text-sm sm:text-base text-purple-100 max-w-3xl leading-relaxed">
              "BloomNest remembers your journey, not just your data." Connects maternal, baby, safety, and appointment events across Features 1–28 through source references without duplicating records.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
              <span className="text-[10px] uppercase font-bold text-purple-200 block">Total Memories</span>
              <span className="text-xl sm:text-2xl font-black text-white">
                {summary.totalMemoriesCount} Nodes
              </span>
              <span className="text-[11px] text-purple-200 font-medium block mt-0.5">F1–F28 Linked</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
              <span className="text-[10px] uppercase font-bold text-purple-200 block">Active Concerns</span>
              <span className="text-xl sm:text-2xl font-black text-amber-300">
                {summary.activeConcernsCount} Active
              </span>
              <span className="text-[11px] text-amber-200 font-bold block mt-0.5">Care threads open</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
              <span className="text-[10px] uppercase font-bold text-purple-200 block">Resolved Concerns</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-300">
                {summary.resolvedConcernsCount} Resolved
              </span>
              <span className="text-[11px] text-emerald-200 font-bold block mt-0.5">Historical resolution</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
              <span className="text-[10px] uppercase font-bold text-purple-200 block">Key Milestones</span>
              <span className="text-xl sm:text-2xl font-black text-white">
                {summary.keyEventsCount} Events
              </span>
              <span className="text-[11px] text-purple-200 font-medium block mt-0.5">Delivery to present</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-purple-200 block">User Preferences</span>
              <span className="text-xl sm:text-2xl font-black text-white">
                {summary.userPreferencesCount} Saved
              </span>
              <span className="text-[11px] text-purple-200 font-medium block mt-0.5">Reminders & Units</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE "ASK BLOOMNEST HISTORY" QUERY BAR */}
      <section className="bg-white dark:bg-[#1a1420] rounded-3xl p-6 border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-rose-100">
              Query Longitudinal History ("Ask BloomNest")
            </h2>
            <p className="text-xs text-slate-500">
              Search memory nodes and trace historical events across your entire care journey.
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search longitudinal history (e.g. 'pain', 'vaccination', 'pediatrician', 'latching')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-rose-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Query Suggestion Chips */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-400 self-center">Try asking:</span>
          {[
            "pain",
            "vaccination",
            "pediatric checkup",
            "breastfeeding latching",
            "reminder preference",
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => setSearchQuery(chip)}
              className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold border border-purple-100 dark:border-purple-900/40 hover:bg-purple-100 transition-all text-[11px]"
            >
              "{chip}"
            </button>
          ))}
        </div>

        {/* Search Traceability Response Box */}
        {searchQuery && (
          <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-900 dark:text-purple-200">
                {searchResults.explanation}
              </span>
              <button
                onClick={() => setSearchQuery("")}
                className="text-[10px] text-purple-600 dark:text-purple-300 underline font-bold"
              >
                Clear Search
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {searchResults.matches.map((m) => (
                <div
                  key={m.memoryId}
                  onClick={() => setSelectedMemory(m)}
                  className="p-3 bg-white dark:bg-[#1a1420] rounded-xl border border-purple-100 dark:border-purple-900/40 flex items-center justify-between cursor-pointer hover:border-purple-300 transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-rose-100">{m.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-extrabold">
                        {m.sourceFeature}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-rose-300 leading-snug">{m.summary}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. NAVIGATION TABS */}
      <div className="flex border-b border-rose-100 dark:border-rose-900/40 space-x-2 sm:space-x-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("graph")}
          className={`py-3 px-4 font-bold text-xs sm:text-sm rounded-t-2xl border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "graph"
              ? "border-purple-600 text-purple-600 dark:text-purple-400 bg-white dark:bg-[#1a1420] shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-rose-300 dark:hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Complete Journey Graph</span>
        </button>

        <button
          onClick={() => setActiveTab("mother")}
          className={`py-3 px-4 font-bold text-xs sm:text-sm rounded-t-2xl border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "mother"
              ? "border-purple-600 text-purple-600 dark:text-purple-400 bg-white dark:bg-[#1a1420] shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-rose-300 dark:hover:text-white"
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" />
          <span>Mother Journey</span>
        </button>

        <button
          onClick={() => setActiveTab("baby")}
          className={`py-3 px-4 font-bold text-xs sm:text-sm rounded-t-2xl border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "baby"
              ? "border-purple-600 text-purple-600 dark:text-purple-400 bg-white dark:bg-[#1a1420] shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-rose-300 dark:hover:text-white"
          }`}
        >
          <Baby className="w-4 h-4 text-indigo-500" />
          <span>Baby Journey</span>
        </button>

        <button
          onClick={() => setActiveTab("concerns")}
          className={`py-3 px-4 font-bold text-xs sm:text-sm rounded-t-2xl border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "concerns"
              ? "border-purple-600 text-purple-600 dark:text-purple-400 bg-white dark:bg-[#1a1420] shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-rose-300 dark:hover:text-white"
          }`}
        >
          <RotateCcw className="w-4 h-4 text-amber-500" />
          <span>Concerns & Care Threads</span>
          {summary.activeConcernsCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-900 text-[10px] font-black flex items-center justify-center">
              {summary.activeConcernsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("preferences")}
          className={`py-3 px-4 font-bold text-xs sm:text-sm rounded-t-2xl border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "preferences"
              ? "border-purple-600 text-purple-600 dark:text-purple-400 bg-white dark:bg-[#1a1420] shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-rose-300 dark:hover:text-white"
          }`}
        >
          <Lock className="w-4 h-4 text-emerald-500" />
          <span>Preferences & Privacy</span>
        </button>
      </div>

      {/* ========================================== */}
      {/* MEMORY GRAPH / LIST VIEW */}
      {/* ========================================== */}
      <div className="space-y-4">
        {filteredMemories.map((m) => (
          <div
            key={m.memoryId}
            className="p-5 bg-white dark:bg-[#1a1420] rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-3 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-purple-300"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${getCategoryBadgeColor(m.category)}`}>
                  {m.category}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${getConfidenceBadgeColor(m.confidence)}`}>
                  {m.confidence.replace("_", " ")}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                  {m.sourceFeature}
                </span>
                <span className="text-[11px] font-bold text-slate-400 dark:text-rose-300 ml-auto">
                  {m.eventDate}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-rose-100">
                {m.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-rose-200 leading-relaxed">
                {m.summary}
              </p>

              {m.notes && (
                <p className="text-[11px] text-slate-500 italic pt-0.5">
                  "{m.notes}"
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
              {m.memoryType === "CONCERN" && (
                <button
                  onClick={() => handleStatusToggle(m.memoryId, m.status)}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                    m.status === "RESOLVED"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {m.status === "RESOLVED" ? "✓ Resolved" : "⚠ Active Concern"}
                </button>
              )}

              <button
                onClick={() => setSelectedMemory(m)}
                className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 text-slate-800 dark:text-rose-100 font-extrabold text-xs inline-flex items-center gap-1 transition-all"
              >
                <span>Inspect Node</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================== */}
      {/* MODAL: MEMORY NODE INSPECTOR */}
      {/* ========================================== */}
      {selectedMemory && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a1420] rounded-3xl p-6 max-w-lg w-full border border-rose-100 dark:border-rose-900/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/30 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-rose-100">
                  Memory Node Inspector
                </h3>
              </div>
              <button
                onClick={() => setSelectedMemory(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-rose-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-rose-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${getCategoryBadgeColor(selectedMemory.category)}`}>
                  {selectedMemory.category}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${getConfidenceBadgeColor(selectedMemory.confidence)}`}>
                  {selectedMemory.confidence.replace("_", " ")}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[10px] font-bold">
                  {selectedMemory.sourceFeature}
                </span>
              </div>

              <h4 className="text-base font-extrabold text-slate-900 dark:text-rose-100">
                {selectedMemory.title}
              </h4>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-rose-100 block">Summary:</span>
                <p>{selectedMemory.summary}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <strong className="text-slate-500">Event Date:</strong>
                  <span className="block font-bold">{selectedMemory.eventDate}</span>
                </div>
                <div>
                  <strong className="text-slate-500">Importance:</strong>
                  <span className="block font-bold">{selectedMemory.importance}</span>
                </div>
                <div>
                  <strong className="text-slate-500">Status:</strong>
                  <span className="block font-bold">{selectedMemory.status}</span>
                </div>
                <div>
                  <strong className="text-slate-500">User Confirmed:</strong>
                  <span className="block font-bold">{selectedMemory.userConfirmed ? "Yes ✓" : "No"}</span>
                </div>
              </div>

              {selectedMemory.sourceRecordIds && selectedMemory.sourceRecordIds.length > 0 && (
                <div className="pt-1">
                  <strong className="text-slate-500 text-[11px]">Source Record References:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedMemory.sourceRecordIds.map((id) => (
                      <code key={id} className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-[10px]">
                        {id}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-rose-100 dark:border-rose-900/30 flex justify-end">
              <button
                onClick={() => setSelectedMemory(null)}
                className="px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-extrabold text-xs shadow-md"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

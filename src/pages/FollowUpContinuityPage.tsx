import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  FollowUpThread,
  FollowUpEngineEvaluationResult,
  FollowUpStatus,
  FollowUpType,
  FollowUpTrendOutcome,
  PageView,
} from "../types";
import {
  evaluateFollowUpThreads,
  updateFollowUpStatus,
  createCustomFollowUpThread,
} from "../utils/followUpContinuityEngine";
import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
  getRecoveryStage,
} from "../utils/postpartumUtils";
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Plus,
  Filter,
  Check,
  FileText,
  Activity,
  Heart,
  Baby,
  Pill,
  X,
  History,
  MessageSquare,
  Info,
  AlertCircle,
} from "lucide-react";

const POSTPARTUM_PROFILE_KEY = "bloomnest_postpartum_profile_v1";

interface FollowUpContinuityPageProps {
  onNavigateSubPage?: (page: PageView) => void;
}

export const FollowUpContinuityPage: React.FC<FollowUpContinuityPageProps> = ({ onNavigateSubPage }) => {
  const { showToast } = useApp();

  const [evaluation, setEvaluation] = useState<FollowUpEngineEvaluationResult | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "attention" | "active" | "needs_review" | "resolved">("all");
  const [selectedThread, setSelectedThread] = useState<FollowUpThread | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New Thread Form State
  const [newTitle, setNewTitle] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");
  const [newCategory, setNewCategory] = useState<FollowUpThread["category"]>("MOTHER_RECOVERY");
  const [newType, setNewType] = useState<FollowUpType>("monitor");
  const [newDueDate, setNewDueDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [newNotes, setNewNotes] = useState<string>("");

  useEffect(() => {
    runEvaluation();
  }, []);

  const runEvaluation = () => {
    const res = evaluateFollowUpThreads();
    setEvaluation(res);
  };

  const handleStatusChange = (threadId: string, newStatus: FollowUpStatus) => {
    updateFollowUpStatus(threadId, newStatus);
    runEvaluation();
    if (selectedThread && selectedThread.followUpId === threadId) {
      setSelectedThread({ ...selectedThread, status: newStatus });
    }
    showToast(`Follow-up thread status updated to ${newStatus.toUpperCase()}`);
  };

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createCustomFollowUpThread({
      title: newTitle,
      description: newDescription,
      category: newCategory,
      type: newType,
      dueDate: newDueDate,
      userNotes: newNotes,
    });

    setIsAddModalOpen(false);
    setNewTitle("");
    setNewDescription("");
    runEvaluation();
    showToast("Custom follow-up thread created!");
  };

  // Filter threads
  const threads = evaluation?.threads || [];
  const filteredThreads = threads.filter((t) => {
    if (activeFilter === "attention") return t.status === "safety_linked" || t.status === "due";
    if (activeFilter === "active") return t.status === "active";
    if (activeFilter === "needs_review") return t.status === "needs_review";
    if (activeFilter === "resolved") return t.status === "resolved";
    return true;
  });

  // Calculate Postpartum Context
  let pDay = 10;
  let pWeek = 2;
  try {
    const rawProf = localStorage.getItem(POSTPARTUM_PROFILE_KEY);
    if (rawProf) {
      const prof = JSON.parse(rawProf);
      pDay = calculatePostpartumDay(prof.deliveryDate);
      pWeek = calculatePostpartumWeek(pDay);
    }
  } catch {}
  const stage = getRecoveryStage(pDay);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] text-slate-800 dark:text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* TOP HERO BANNER */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-white border border-white/30">
                  Feature 24 — Continuity Engine
                </span>
                <span className="bg-purple-400/30 text-purple-100 text-xs px-3 py-1 rounded-full font-medium">
                  Open Care-Loop Companion
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Follow-up & Care Continuity
              </h1>
              <p className="text-purple-100 mt-1 text-sm md:text-base max-w-xl">
                BloomNest doesn't just remember what happened — it remembers what still needs to happen next until it's resolved.
              </p>
            </div>

            {/* Actions & Context Badge */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2.5 bg-white text-purple-700 font-bold rounded-2xl shadow-md hover:bg-purple-50 transition flex items-center justify-center gap-1.5 text-xs"
              >
                <Plus className="w-4 h-4" /> Create Custom Follow-up
              </button>

              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-center min-w-[140px]">
                <div className="text-[10px] text-purple-100 font-medium">Postpartum Context</div>
                <div className="text-base font-bold text-white mt-0.5">Day {pDay} • Wk {pWeek}</div>
              </div>
            </div>
          </div>
        </div>

        {/* SUMMARY COUNTER CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white dark:bg-[#1A1523] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-rose-500 font-semibold mb-1">
              <span>Safety-Linked</span>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
              {evaluation?.safetyLinkedCount || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Requires safety review</div>
          </div>

          <div className="bg-white dark:bg-[#1A1523] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-amber-500 font-semibold mb-1">
              <span>Due Today</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
              {evaluation?.dueCount || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Follow-up action due</div>
          </div>

          <div className="bg-white dark:bg-[#1A1523] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-indigo-500 font-semibold mb-1">
              <span>Active Threads</span>
              <Activity className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
              {evaluation?.activeCount || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Being monitored</div>
          </div>

          <div className="bg-white dark:bg-[#1A1523] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-purple-500 font-semibold mb-1">
              <span>Needs Review</span>
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
              {evaluation?.needsReviewCount || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Missing data != improved</div>
          </div>

          <div className="bg-white dark:bg-[#1A1523] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-xs text-emerald-500 font-semibold mb-1">
              <span>Resolved</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
              {evaluation?.resolvedCount || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Completed care loops</div>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Threads", count: threads.length },
            { id: "attention", label: "🔴 Needs Attention", count: (evaluation?.safetyLinkedCount || 0) + (evaluation?.dueCount || 0) },
            { id: "active", label: "🔵 Active Continuity", count: evaluation?.activeCount || 0 },
            { id: "needs_review", label: "🟠 Needs Review", count: evaluation?.needsReviewCount || 0 },
            { id: "resolved", label: "🟢 Resolved", count: evaluation?.resolvedCount || 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-white dark:bg-[#1A1523] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* FOLLOW-UP CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredThreads.length > 0 ? (
            filteredThreads.map((thread) => {
              const isSafety = thread.status === "safety_linked";
              const isResolved = thread.status === "resolved";
              const isNeedsReview = thread.status === "needs_review";

              return (
                <div
                  key={thread.followUpId}
                  className={`bg-white dark:bg-[#1A1523] rounded-3xl p-6 border shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                    isSafety
                      ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10"
                      : isResolved
                      ? "border-emerald-200 dark:border-emerald-900/40 opacity-80"
                      : isNeedsReview
                      ? "border-purple-200 dark:border-purple-900/40"
                      : "border-slate-200/80 dark:border-slate-800"
                  }`}
                >
                  {/* Card Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {thread.category.replace("_", " ")}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                          isSafety
                            ? "bg-rose-500 text-white"
                            : thread.status === "due"
                            ? "bg-amber-500 text-white"
                            : isNeedsReview
                            ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                            : isResolved
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                            : "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                        }`}
                      >
                        {thread.status.replace("_", " ")}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {thread.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {thread.description}
                    </p>
                  </div>

                  {/* Outcome Trend Indicator */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Latest Trend Outcome</span>
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          thread.currentOutcome === "improving"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : thread.currentOutcome === "worsening"
                            ? "text-rose-600 dark:text-rose-400"
                            : thread.currentOutcome === "no_recent_update"
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {thread.currentOutcome === "improving" && <TrendingUp className="w-3.5 h-3.5" />}
                        {thread.currentOutcome === "worsening" && <AlertTriangle className="w-3.5 h-3.5" />}
                        {thread.currentOutcome === "same" && <RotateCcw className="w-3.5 h-3.5" />}
                        {thread.currentOutcome === "no_recent_update" && <Clock className="w-3.5 h-3.5" />}
                        <span className="capitalize">{thread.currentOutcome.replace("_", " ")}</span>
                      </span>
                    </div>

                    {/* Timeline Snippet */}
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Started Day {thread.postpartumDay} • {thread.timeline.length} timeline event(s) recorded
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setSelectedThread(thread)}
                      className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Timeline ({thread.timeline.length})
                    </button>

                    {!isResolved ? (
                      <button
                        onClick={() => handleStatusChange(thread.followUpId, "resolved")}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl transition flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark Resolved
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Care Loop Closed
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 bg-white dark:bg-[#1A1523] p-12 rounded-3xl text-center space-y-3 border border-slate-200/80 dark:border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                No follow-up threads in this filter
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                BloomNest automatically opens follow-up threads whenever recovery concerns, safety alerts, or appointments occur.
              </p>
            </div>
          )}
        </div>

        {/* TIMELINE DETAILED MODAL */}
        {selectedThread && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1A1523] rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-full">
                    Care Continuity Timeline
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {selectedThread.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedThread(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Thread Metadata */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-semibold">{selectedThread.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Source Feature:</span>
                  <span className="font-semibold">{selectedThread.sourceFeature}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Status:</span>
                  <span className="font-bold uppercase text-purple-600">{selectedThread.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trend Outcome:</span>
                  <span className="font-bold capitalize">{selectedThread.currentOutcome.replace("_", " ")}</span>
                </div>
              </div>

              {/* Timeline Events */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-purple-500" /> Chronological Event History
                </h3>

                <div className="relative border-l-2 border-purple-200 dark:border-purple-900 ml-4 space-y-6 pl-6">
                  {selectedThread.timeline.map((event) => (
                    <div key={event.id} className="relative group">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-purple-600 border-4 border-white dark:border-[#1A1523]" />
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {event.eventTitle}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {event.dateStr} (Day {event.postpartumDay})
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {event.description}
                        </p>
                        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          Module: {event.sourceModule}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedThread(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Close Timeline
                </button>
                {selectedThread.status !== "resolved" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedThread.followUpId, "resolved")}
                    className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                  >
                    Mark Follow-up Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ADD CUSTOM FOLLOW-UP MODAL */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <form
              onSubmit={handleCreateThread}
              className="bg-white dark:bg-[#1A1523] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-purple-500" /> Create Custom Follow-up Thread
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Follow-up Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Monitor abdominal pain after evening walk"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                  >
                    <option value="MOTHER_RECOVERY">Mother Physical Recovery</option>
                    <option value="BABY_CARE">Newborn Baby Care</option>
                    <option value="SAFETY">Clinical Safety</option>
                    <option value="APPOINTMENT">Appointment Follow-up</option>
                    <option value="MEDICATION">Medication</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Description / Goal</label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="What specific observations should continue until resolved?"
                    rows={3}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition"
                >
                  Create Follow-up
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

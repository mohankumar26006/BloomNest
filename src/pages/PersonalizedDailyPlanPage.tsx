import React, { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  FileText,
  HelpCircle,
  ArrowLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  Layers,
  Activity,
  Heart,
  Pill,
  Baby,
  Utensils,
  Smile,
  ShieldCheck,
  CheckSquare,
  Circle,
} from "lucide-react";
import {
  PageView,
  PostpartumProfile,
  DailyPlanTaskItem,
  PersonalizedDailyPlanResult,
  DailyPlanTimeOfDay,
  DailyPlanTaskPriority,
} from "../types";
import {
  generatePersonalizedDailyPlan,
  updateTaskStatus,
} from "../utils/dailyPlanEngine";
import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
  getRecoveryStage,
} from "../utils/postpartumUtils";

interface DailyPlanPageProps {
  onNavigate?: (page: PageView) => void;
  profile?: PostpartumProfile | null;
  darkMode?: boolean;
}

export const PersonalizedDailyPlanPage: React.FC<DailyPlanPageProps> = ({
  onNavigate,
  profile,
  darkMode = false,
}) => {
  const [planResult, setPlanResult] = useState<PersonalizedDailyPlanResult | null>(null);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>("all");
  const [activeWhyTask, setActiveWhyTask] = useState<DailyPlanTaskItem | null>(null);

  const deliveryDateStr = profile?.deliveryDate || new Date().toISOString().split("T")[0];
  const postpartumDay = calculatePostpartumDay(deliveryDateStr);
  const postpartumWeek = calculatePostpartumWeek(postpartumDay);
  const recoveryStage = getRecoveryStage(postpartumDay).title;

  const refreshPlan = () => {
    const res = generatePersonalizedDailyPlan({ profile });
    setPlanResult(res);
  };

  useEffect(() => {
    refreshPlan();
  }, [profile]);

  if (!planResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] dark:bg-[#120E18] text-slate-800 dark:text-slate-200">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-6 h-6 text-rose-500 animate-spin" />
          <span className="text-sm font-semibold">Orchestrating today's personalized daily plan...</span>
        </div>
      </div>
    );
  }

  // Filter tasks based on selected tab
  const filteredTasks = planResult.tasks.filter((t) => {
    if (selectedTimeFilter === "all") return true;
    if (selectedTimeFilter === "priority") return t.priority === "priority";
    return t.timeOfDay === selectedTimeFilter;
  });

  const handleToggleTask = (task: DailyPlanTaskItem) => {
    const nextStatus = task.status === "completed" ? "suggested" : "completed";
    updateTaskStatus(task.taskId, nextStatus);
    refreshPlan();
  };

  const getPriorityBadge = (priority: DailyPlanTaskPriority) => {
    switch (priority) {
      case "priority":
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> High Priority
          </span>
        );
      case "recommended":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Recommended
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Routine Care
          </span>
        );
    }
  };

  const getTimeOfDayIcon = (time: DailyPlanTimeOfDay) => {
    switch (time) {
      case "morning": return <Sun className="w-4 h-4 text-amber-500" />;
      case "afternoon": return <Sun className="w-4 h-4 text-orange-500" />;
      case "evening": return <Moon className="w-4 h-4 text-indigo-500" />;
      case "rest_recovery": return <Heart className="w-4 h-4 text-rose-500" />;
    }
  };

  const completionPercentage = Math.round((planResult.completedCount / (planResult.totalTasks || 1)) * 100);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] text-slate-800 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto transition-colors">
      
      {/* TOP HEADER WITH POSTPARTUM CONTEXT (BloomNest Standard Header) */}
      <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 text-xs font-semibold rounded-full flex items-center gap-1.5 border border-rose-200 dark:border-rose-800">
              <Sparkles className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              Feature 21 • Postpartum Care
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full">
              Day {postpartumDay} • Week {postpartumWeek}
            </span>
            <span className="px-3 py-1 rounded-full bg-rose-500 text-white font-extrabold text-xs">
              {recoveryStage}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-8 h-8 text-rose-500" />
            Personalized Daily Plan
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Answers: <span className="font-semibold text-slate-700 dark:text-slate-200">“Based on where I am in my postpartum journey and what has been happening recently, what should my day look like?”</span>
          </p>
        </div>

        {/* Quick Nav Actions */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          {onNavigate && (
            <button
              onClick={() => onNavigate("emergency")}
              className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Safety (Feat 04)
            </button>
          )}
          {onNavigate && (
            <button
              onClick={() => onNavigate("postpartum-trends")}
              className="px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Trends (Feat 19)
            </button>
          )}
          {onNavigate && (
            <button
              onClick={() => onNavigate("postpartum-anomalies")}
              className="px-3.5 py-2 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Anomalies (Feat 20)
            </button>
          )}
        </div>
      </div>

      {/* PLAN PROGRESS OVERVIEW CARD */}
      <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Care Orchestration</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {planResult.focusSummaryText}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {planResult.completedCount} of {planResult.totalTasks} tasks completed ({completionPercentage}%) • {planResult.priorityCount} high priority focus item(s).
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-2xl font-black text-rose-500">{completionPercentage}%</span>
              <span className="text-[11px] block text-slate-400">Done Today</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
          <div
            className="bg-rose-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Rest Opportunity Banner */}
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-900 dark:text-rose-200 flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{planResult.restOpportunityNote}</span>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {[
          { id: "all", label: `All Tasks (${planResult.totalTasks})` },
          { id: "priority", label: `High Priority (${planResult.priorityCount})` },
          { id: "morning", label: "Morning" },
          { id: "afternoon", label: "Afternoon" },
          { id: "evening", label: "Evening" },
          { id: "rest_recovery", label: "Rest & Recovery" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTimeFilter(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedTimeFilter === tab.id
                ? "bg-rose-500 text-white shadow-sm"
                : "bg-white dark:bg-[#1A1523] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TASKS LIST */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#1A1523] rounded-3xl border border-slate-100 dark:border-slate-800/80 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Tasks Completed for this Filter</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Great job! You have addressed all plan items in this section.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === "completed";

            return (
              <div
                key={task.id}
                className={`bg-white dark:bg-[#1A1523] rounded-3xl p-6 shadow-sm border transition-all ${
                  isCompleted
                    ? "opacity-60 border-slate-200 dark:border-slate-800"
                    : task.priority === "priority"
                    ? "border-rose-300 dark:border-rose-800/60"
                    : "border-slate-100 dark:border-slate-800/80"
                } space-y-4`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleTask(task)}
                      className="mt-1 transition-colors hover:scale-110"
                      title={isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
                    >
                      {isCompleted ? (
                        <CheckSquare className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-300 hover:text-slate-500" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getPriorityBadge(task.priority)}
                        <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                          {task.sourceFeature}
                        </span>
                        {task.dueTimeStr && (
                          <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-mono bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Due {task.dueTimeStr}
                          </span>
                        )}
                      </div>

                      <h3 className={`text-base sm:text-lg font-bold text-slate-900 dark:text-white ${isCompleted ? "line-through text-slate-400" : ""}`}>
                        {task.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  {/* Task Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => setActiveWhyTask(task)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 flex items-center gap-1 transition-all"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> Why this?
                    </button>

                    {onNavigate && (
                      <button
                        onClick={() => onNavigate(task.sourceModulePage)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 flex items-center gap-1 transition-all shadow-sm"
                      >
                        Open Module <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Transparency Rationale Bar */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#231C30] border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span><span className="font-semibold text-slate-700 dark:text-slate-300">Context Rationale:</span> {task.reason}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: "Why Was This Task Recommended?" */}
      {activeWhyTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A1523] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold">Why is this task in today's plan?</h3>
              </div>
              <button
                onClick={() => setActiveWhyTask(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                {activeWhyTask.title} ({activeWhyTask.sourceFeature})
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#231C30] border border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="font-semibold text-slate-900 dark:text-white">Orchestration Rationale:</div>
                <p>{activeWhyTask.reason}</p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-400">
                  Postpartum Stage: <span className="font-semibold text-slate-700 dark:text-slate-200">Day {postpartumDay} ({recoveryStage})</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-500" /> Single Source of Truth Preserved
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Feature 21 orchestrates daily tasks based on recorded data. Clicking "Open Module" takes you directly to the underlying feature log without duplicating records.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveWhyTask(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-sm"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

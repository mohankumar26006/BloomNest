import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  EducationTopic,
  PersonalizedEducationEvaluationResult,
  PageView,
} from "../types";
import {
  evaluatePersonalizedEducation,
  toggleSaveEducationTopic,
  markEducationTopicCompleted,
  getStoredEducationHistory,
} from "../utils/postpartumEducationEngine";
import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
  getRecoveryStage,
} from "../utils/postpartumUtils";
import {
  BookOpen,
  Sparkles,
  Heart,
  Baby,
  ShieldAlert,
  ShieldCheck,
  Search,
  Bookmark,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FileText,
  X,
  AlertTriangle,
  Info,
  Check,
  Share2,
} from "lucide-react";

const POSTPARTUM_PROFILE_KEY = "bloomnest_postpartum_profile_v1";
const DOCTOR_BRIEF_CUSTOM_QUESTIONS_KEY = "bloomnest_doctor_brief_custom_questions_v1";

interface PostpartumEducationPageProps {
  onNavigateSubPage?: (page: PageView) => void;
}

export const PostpartumEducationPage: React.FC<PostpartumEducationPageProps> = ({ onNavigateSubPage }) => {
  const { showToast } = useApp();

  const [evaluation, setEvaluation] = useState<PersonalizedEducationEvaluationResult | null>(null);
  const [activeTab, setActiveTab] = useState<"learn_today" | "based_on_records" | "mother" | "baby" | "saved">("learn_today");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<EducationTopic | null>(null);
  const [historyMap, setHistoryMap] = useState<Record<string, { isSaved: boolean; isCompleted: boolean }>>({});

  useEffect(() => {
    runEvaluation();
  }, []);

  const runEvaluation = () => {
    const res = evaluatePersonalizedEducation();
    setEvaluation(res);

    const hist = getStoredEducationHistory();
    const mapped: Record<string, { isSaved: boolean; isCompleted: boolean }> = {};
    Object.keys(hist).forEach((k) => {
      mapped[k] = { isSaved: hist[k].isSaved, isCompleted: hist[k].isCompleted };
    });
    setHistoryMap(mapped);
  };

  const handleToggleSave = (topicId: string) => {
    const isNowSaved = toggleSaveEducationTopic(topicId);
    runEvaluation();
    showToast(isNowSaved ? "Topic saved to your learning list!" : "Topic removed from saved list.");
  };

  const handleMarkCompleted = (topicId: string) => {
    markEducationTopicCompleted(topicId);
    runEvaluation();
    showToast("Topic marked as completed!");
  };

  const handleAddQuestionToDoctorBrief = (questionText: string) => {
    try {
      const raw = localStorage.getItem(DOCTOR_BRIEF_CUSTOM_QUESTIONS_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(questionText)) {
        list.unshift(questionText);
        localStorage.setItem(DOCTOR_BRIEF_CUSTOM_QUESTIONS_KEY, JSON.stringify(list));
        showToast("Question added to your Doctor Brief (Feature 18)!");
      } else {
        showToast("Question is already in your Doctor Brief.");
      }
    } catch (err) {
      console.error("Failed to add question to Doctor Brief", err);
    }
  };

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

  // Tab Filtering Topics
  let displayTopics: EducationTopic[] = [];
  if (activeTab === "learn_today") displayTopics = evaluation?.learnTodayTopics || [];
  else if (activeTab === "based_on_records") displayTopics = evaluation?.basedOnRecordsTopics || [];
  else if (activeTab === "mother") displayTopics = evaluation?.motherRecoveryTopics || [];
  else if (activeTab === "baby") displayTopics = evaluation?.babyCareTopics || [];
  else if (activeTab === "saved") displayTopics = evaluation?.savedTopics || [];

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayTopics = displayTopics.filter(
      (t) => t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] text-slate-800 dark:text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* TOP HERO BANNER */}
        <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-white border border-white/30">
                  Feature 25 — Education Layer
                </span>
                <span className="bg-emerald-400/30 text-emerald-100 text-xs px-3 py-1 rounded-full font-medium">
                  Context-Aware Learning
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Postpartum Recovery & Baby Care Education
              </h1>
              <p className="text-teal-100 mt-1 text-sm md:text-base max-w-xl">
                BloomNest doesn't just give you random articles — we explain why each topic matters to you today.
              </p>
            </div>

            {/* Context Badge */}
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[180px] text-center">
              <div className="text-[10px] text-teal-100 font-medium uppercase tracking-wider">Current Stage</div>
              <div className="text-lg font-bold text-white mt-0.5">Day {pDay} • Week {pWeek}</div>
              <div className="text-xs text-teal-200 mt-0.5 font-medium">{stage.title}</div>
            </div>
          </div>
        </div>

        {/* SEARCH & TAB BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: "learn_today", label: "🌿 Learn Today", count: evaluation?.learnTodayTopics.length || 0 },
              { id: "based_on_records", label: "📊 Based on My Records", count: evaluation?.basedOnRecordsTopics.length || 0 },
              { id: "mother", label: "💗 Mother Recovery", count: evaluation?.motherRecoveryTopics.length || 0 },
              { id: "baby", label: "👶 Baby Care", count: evaluation?.babyCareTopics.length || 0 },
              { id: "saved", label: "🔖 Saved Topics", count: evaluation?.savedTopics.length || 0 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                    : "bg-white dark:bg-[#1A1523] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search education topics..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1A1523] text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* TOPICS CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayTopics.length > 0 ? (
            displayTopics.map((topic) => {
              const isSaved = historyMap[topic.topicId]?.isSaved;
              const isCompleted = historyMap[topic.topicId]?.isCompleted;

              return (
                <div
                  key={topic.topicId}
                  className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-teal-300 dark:hover:border-teal-900 transition-all"
                >
                  <div className="space-y-3">
                    {/* Category & Save Button */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                        {topic.category.replace("_", " ")}
                      </span>

                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Read
                          </span>
                        )}
                        <button
                          onClick={() => handleToggleSave(topic.topicId)}
                          className={`p-1.5 rounded-xl transition ${
                            isSaved
                              ? "text-teal-600 bg-teal-50 dark:bg-teal-950/60"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                          title="Save topic"
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? "fill-teal-600" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {/* Title & Summary */}
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {topic.summary}
                    </p>

                    {/* "WHY ARE YOU SEEING THIS?" TRANSPARENT RATIONALE BOX */}
                    <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Why am I seeing this?
                      </div>
                      <p className="text-[11px] text-indigo-950 dark:text-indigo-200">
                        {topic.whySeeingThis}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5" /> {topic.readTimeMinutes} min read
                    </span>

                    <button
                      onClick={() => setSelectedTopic(topic)}
                      className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold text-xs hover:bg-teal-700 transition flex items-center gap-1 shadow-xs"
                    >
                      Read Topic <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 bg-white dark:bg-[#1A1523] p-12 rounded-3xl text-center space-y-3 border border-slate-200/80 dark:border-slate-800">
              <BookOpen className="w-12 h-12 text-teal-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                No educational topics found
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                BloomNest continuously matches relevant recovery and baby care topics based on your logged records and stage.
              </p>
            </div>
          )}
        </div>

        {/* FULL TOPIC READER MODAL */}
        {selectedTopic && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1A1523] rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-full">
                    {selectedTopic.category.replace("_", " ")} • {selectedTopic.readTimeMinutes} min read
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {selectedTopic.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Rationale Banner */}
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="w-4 h-4 text-indigo-500" /> Why am I seeing this recommendation?
                </div>
                <p className="text-xs text-indigo-950 dark:text-indigo-200">
                  {selectedTopic.whySeeingThis}
                </p>
              </div>

              {/* 1. What it is */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">What It Is</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                  {selectedTopic.whatItIs}
                </p>
              </div>

              {/* 2. What you may notice */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">What You May Notice</h3>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                  {selectedTopic.whatYouMayNotice.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-teal-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. What to keep track of */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">What To Keep Track Of</h3>
                  {onNavigateSubPage && (
                    <button
                      onClick={() => {
                        onNavigateSubPage(selectedTopic.relatedModulePage);
                        setSelectedTopic(null);
                      }}
                      className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1"
                    >
                      Open {selectedTopic.relatedFeatureName} <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 bg-teal-50/50 dark:bg-teal-950/30 p-4 rounded-2xl border border-teal-100 dark:border-teal-900/40">
                  {selectedTopic.whatToKeepTrackOf.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 4. When to pay attention (Clinical Warning Signs) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-500" /> When to Pay Attention (Warning Signs)
                  </h3>
                  {onNavigateSubPage && (
                    <button
                      onClick={() => {
                        onNavigateSubPage("emergency");
                        setSelectedTopic(null);
                      }}
                      className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      View Feature 04 Safety Shield <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <ul className="space-y-1.5 text-xs text-rose-950 dark:text-rose-200 bg-rose-50/60 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/40">
                  {selectedTopic.whenToPayAttention.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 5. Questions to ask your doctor */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-500" /> Questions for Your Healthcare Provider
                </h3>
                <div className="space-y-2 bg-purple-50/50 dark:bg-purple-950/30 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/40">
                  {selectedTopic.questionsForDoctor.map((qText, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 text-xs text-purple-950 dark:text-purple-200">
                      <span>• {qText}</span>
                      <button
                        onClick={() => handleAddQuestionToDoctorBrief(qText)}
                        className="px-2.5 py-1 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shrink-0"
                      >
                        + Add to Doctor Brief (F18)
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTopic(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Close Reader
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleSave(selectedTopic.topicId)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-1"
                  >
                    <Bookmark className="w-3.5 h-3.5" /> Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleMarkCompleted(selectedTopic.topicId);
                      setSelectedTopic(null);
                    }}
                    className="px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark Completed
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

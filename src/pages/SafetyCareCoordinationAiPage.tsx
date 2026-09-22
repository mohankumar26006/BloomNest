import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "../services/apiClient";
import {
  SafetyCoordinationContext,
  SafetyCoordinationAgentResponse,
  PageView,
  BabyProfileData,
} from "../types";
import {
  buildSafetyCoordinationContext,
  generateDeterministicSafetyCoordinationFallback,
} from "../services/safetyCareCoordinationAgentService";
import {
  ShieldCheck,
  Bot,
  Sparkles,
  Shield,
  Activity,
  Calendar,
  Send,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Info,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Baby,
  HeartPulse,
  ListTodo,
  Stethoscope,
  Clock,
} from "lucide-react";

interface SafetyCareCoordinationAiPageProps {
  onNavigatePage: (page: PageView) => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  timestamp: string;
  text: string;
  responsePayload?: SafetyCoordinationAgentResponse;
}

export const SafetyCareCoordinationAiPage: React.FC<SafetyCareCoordinationAiPageProps> = ({
  onNavigatePage,
}) => {
  const [babies, setBabies] = useState<BabyProfileData[]>([]);
  const [selectedBabyId, setSelectedBabyId] = useState<string | undefined>(undefined);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [context, setContext] = useState<SafetyCoordinationContext | null>(null);
  const [showDataRationaleId, setShowDataRationaleId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load available babies on mount
  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem("bloomnest_baby_profiles_v1") || "[]");
      if (list && list.length > 0) {
        setBabies(list);
        setSelectedBabyId(list[0].id);
      } else {
        const single = JSON.parse(localStorage.getItem("bloomnest_baby_profile_v1") || "null");
        if (single) {
          setBabies([single]);
          setSelectedBabyId(single.id);
        } else {
          const defaultB: BabyProfileData = { id: "baby_default", babyName: "Newborn Baby", gender: "Unspecified" };
          setBabies([defaultB]);
          setSelectedBabyId(defaultB.id);
        }
      }
    } catch {
      const defaultB: BabyProfileData = { id: "baby_default", babyName: "Newborn Baby", gender: "Unspecified" };
      setBabies([defaultB]);
      setSelectedBabyId(defaultB.id);
    }
  }, []);

  // Initialize context & welcome message when selectedBabyId changes
  useEffect(() => {
    const initialCtx = buildSafetyCoordinationContext("overview", selectedBabyId);
    setContext(initialCtx);

    const initialWelcome: ChatMessage = {
      id: "welcome-msg",
      sender: "agent",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: `Hello! I am **Safety & Care Coordination AI** (Agent 3 of BloomNest).\n\nI connect your recorded recovery data, F04 Safety Shield guidance, F17 Appointments, F18 Doctor Brief, F19 Trends, F20 Anomalies, F21 Daily Plan, F24 Follow-ups, F28 Vaccine Schedule, and F30 Care Coordination to answer:\n> *"What needs attention, what should happen next, and how do we keep your care journey connected?"*`,
      responsePayload: {
        answer: "",
        responseType: "PRIORITY_SUMMARY",
        facts: [
          { tag: "RECORDED_FACT", label: "Postpartum Timeline", text: `Day ${initialCtx.postpartumDay} (${initialCtx.recoveryStage})` },
          { tag: "CALCULATED_OBSERVATION", label: "F4 Safety Shield", text: `Safety Status: ${initialCtx.safetyStatus}` },
          { tag: "RECORDED_FACT", label: "Active Follow-ups (F24)", text: `${initialCtx.openFollowUpsCount} open thread(s)` },
          { tag: "RECORDED_FACT", label: "Appointments (F17)", text: `${initialCtx.upcomingAppointmentsCount} upcoming visit(s)` },
          { tag: "RECORDED_FACT", label: "Care Coordination (F30)", text: `${initialCtx.openCareTasksCount} active task(s)` },
        ],
        observations: [`Tracking Postpartum Day ${initialCtx.postpartumDay}`],
        safetyStatus: initialCtx.safetyStatus,
        sourceFeatures: [
          "F04 Safety Shield",
          "F17 Appointments",
          "F18 Doctor Brief",
          "F19 Trends",
          "F20 Anomalies",
          "F21 Daily Plan",
          "F24 Follow-ups",
          "F28 Vaccines",
          "F30 Care Coordination",
        ],
        whyAmISeeingThis: {
          sourceFeatures: ["F04 Safety Shield", "F17 Appointments", "F21 Daily Plan", "F24 Follow-ups", "F30 Care Coordination"],
          dataPointsUsed: ["Safety Baseline", "Upcoming Visits", "Active Follow-ups", "Daily Priorities"],
          timeRange: `Postpartum Day ${initialCtx.postpartumDay}`,
          scope: "BOTH",
          babyId: initialCtx.selectedBabyId,
          babyName: initialCtx.babyName,
        },
        recommendedActions: [
          { title: "Safety Shield", description: "Review authoritative clinical safety guidance", targetPage: "safety", buttonText: "Open Safety Shield (F4)" },
          { title: "Daily Plan", description: "Review today's prioritized checklist", targetPage: "daily-plan", buttonText: "Open Daily Plan (F21)" },
          { title: "Care Coordination", description: "Coordinate tasks with care providers", targetPage: "care-coordination", buttonText: "Open Care Coordination (F30)" },
        ],
        confidence: "HIGH",
        dataSufficiency: initialCtx.hasSufficientData ? "FULL" : "PARTIAL",
      },
    };

    setChatHistory([initialWelcome]);
  }, [selectedBabyId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  const handleSendQuery = async (queryText?: string) => {
    const messageText = queryText || inputQuery;
    if (!messageText.trim() || isLoading) return;

    setInputQuery("");
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: messageText,
    };
    setChatHistory((prev) => [...prev, userMsg]);

    const currentCtx = buildSafetyCoordinationContext(messageText, selectedBabyId);
    setContext(currentCtx);

    try {
      const res = await apiFetch("/api/agent/safety-care-coordination", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, babyId: selectedBabyId, context: currentCtx }),
      });

      if (res.ok) {
        const payload: SafetyCoordinationAgentResponse = await res.json();
        const agentMsg: ChatMessage = {
          id: `agt-${Date.now()}`,
          sender: "agent",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          text: payload.answer,
          responsePayload: payload,
        };
        setChatHistory((prev) => [...prev, agentMsg]);
      } else {
        throw new Error("Server response error");
      }
    } catch {
      const fallbackResponse = generateDeterministicSafetyCoordinationFallback(messageText, currentCtx);
      const fallbackMsg: ChatMessage = {
        id: `agt-${Date.now()}`,
        sender: "agent",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: fallbackResponse.answer,
        responsePayload: fallbackResponse,
      };
      setChatHistory((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestedQuestions = (): string[] => {
    return [
      "What needs my attention today?",
      "Is anything concerning right now?",
      "What should I do next?",
      "What follow-ups are still open?",
      "What should I ask my doctor?",
      "What changed recently?",
      "What should I focus on for myself and my baby today?",
      "What vaccine is due?",
    ];
  };

  const getFactBadgeStyle = (tag: string) => {
    switch (tag) {
      case "SAFETY_ALERT":
        return "bg-rose-100 text-rose-800 border-rose-300 font-bold";
      case "RECORDED_FACT":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "CALCULATED_OBSERVATION":
        return "bg-sky-100 text-sky-800 border-sky-300";
      case "DETECTED_PATTERN":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "AI_SUGGESTION":
      default:
        return "bg-purple-100 text-purple-800 border-purple-300";
    }
  };

  const formatFactTagLabel = (tag: string) => {
    switch (tag) {
      case "RECORDED_FACT":
        return "📌 Recorded Fact";
      case "CALCULATED_OBSERVATION":
        return "📊 Calculated Observation";
      case "DETECTED_PATTERN":
        return "📈 Detected Pattern";
      case "SAFETY_ALERT":
        return "🚨 Safety Alert";
      case "AI_SUGGESTION":
      default:
        return "💡 AI Suggestion";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-500/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-md">
                🛡️ Agent 3 of 3 • Safety & Care Coordination AI
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-400/30 text-emerald-100 font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> F4 Safety Guard Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Safety, Prioritization & Care Continuity Copilot
            </h1>

            <p className="text-xs sm:text-sm text-purple-100 max-w-2xl">
              Connected to F4 Safety Shield, F17 Appointments, F18 Doctor Brief, F19 Trends, F20 Anomalies, F21 Daily Plan, F24 Follow-ups, F28 Vaccines, F29 Memory, and F30 Care Coordination.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/15 p-3.5 rounded-2xl backdrop-blur-md border border-white/20 text-xs font-semibold shrink-0">
            <ShieldCheck className="w-8 h-8 text-purple-200" />
            <div>
              <div className="font-extrabold">Agent 3 Connected</div>
              <div className="text-[10px] text-purple-200">Care Coordination Layer</div>
            </div>
          </div>
        </div>

        {/* CONTEXT SUB-STRIP */}
        {context && (
          <div className="mt-6 pt-4 border-t border-white/20 flex flex-wrap items-center gap-4 text-xs font-medium text-purple-100">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
              <Calendar className="w-3.5 h-3.5" />
              <span>Postpartum Day <strong>{context.postpartumDay}</strong> ({context.recoveryStage})</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Safety Status: <strong>{context.safetyStatus}</strong></span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
              <ListTodo className="w-3.5 h-3.5" />
              <span>Open Follow-ups: <strong>{context.openFollowUpsCount}</strong></span>
            </div>

            {context.nextAppointmentTitle && (
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Next Visit: <strong>{context.nextAppointmentTitle}</strong></span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SCOPE & CONTEXT SUMMARY CARD */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Cross-Journey Care Scope</div>
            <div className="text-base font-extrabold text-slate-900">
              Mother & Baby Care Coordination
            </div>
          </div>
        </div>

        {context && (
          <div className="flex items-center gap-3 flex-wrap">
            {babies.length > 1 && (
              <select
                value={selectedBabyId}
                onChange={(e) => setSelectedBabyId(e.target.value)}
                className="px-3 py-1.5 bg-slate-100 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
              >
                {babies.map((b) => (
                  <option key={b.id} value={b.id}>
                    👶 {b.babyName}
                  </option>
                ))}
              </select>
            )}

            {context.safetyStatus === "URGENT_ATTENTION" ? (
              <span className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 animate-pulse shadow-md shadow-rose-500/20">
                <AlertTriangle className="w-4 h-4" /> URGENT ALERT
              </span>
            ) : context.safetyStatus === "ATTENTION_NEEDED" ? (
              <span className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20">
                <Shield className="w-4 h-4" /> ATTENTION NEEDED
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" /> SAFETY CLEAR
              </span>
            )}
          </div>
        )}
      </div>

      {/* STATS STRIP (F4, F17, F24, F30) */}
      {context && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">F4 Safety Shield</div>
            <div className="text-base font-extrabold text-slate-900 mt-1">
              {context.safetyStatus}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">F24 Open Follow-ups</div>
            <div className="text-base font-extrabold text-purple-900 mt-1">
              {context.openFollowUpsCount} thread(s)
            </div>
          </div>
          <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200 shadow-sm text-center">
            <div className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">F17 Upcoming Visits</div>
            <div className="text-base font-extrabold text-purple-900 mt-1 truncate">
              {context.nextAppointmentTitle || "None scheduled"}
            </div>
          </div>
          <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-200 shadow-sm text-center">
            <div className="text-[11px] font-semibold text-pink-700 uppercase tracking-wider">F30 Open Tasks</div>
            <div className="text-base font-extrabold text-pink-900 mt-1">
              {context.openCareTasksCount} care task(s)
            </div>
          </div>
        </div>
      )}

      {/* URGENT SAFETY OVERRIDE BANNER IF F4 ACTIVE */}
      {context?.safetyStatus === "URGENT_ATTENTION" && (
        <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-500 shadow-md flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <h3 className="text-sm font-extrabold text-rose-900">
              CLINICAL SAFETY ALERT (Feature 04 Safety Shield Active)
            </h3>
            <p className="text-xs text-rose-800">
              {context.urgentSafetyMessage || "A critical physiological symptom has been flagged by Safety Shield. Agent 3 preserves the exact urgency determined by F4."}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => onNavigatePage("safety")}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Open Safety Shield (F4)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHAT STREAM CONTAINER */}
      <div className="bg-white rounded-3xl border border-purple-100 p-4 sm:p-6 shadow-sm space-y-6">
        {/* Quick Topic Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => handleSendQuery("What needs my attention today?")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50/80 hover:bg-purple-100 border border-purple-200 text-slate-700 font-semibold rounded-xl whitespace-nowrap transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Priorities
          </button>
          <button
            onClick={() => handleSendQuery("Is anything concerning right now?")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50/80 hover:bg-purple-100 border border-purple-200 text-slate-700 font-semibold rounded-xl whitespace-nowrap transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Safety Status (F4)
          </button>
          <button
            onClick={() => handleSendQuery("What follow-ups are still open?")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50/80 hover:bg-purple-100 border border-purple-200 text-slate-700 font-semibold rounded-xl whitespace-nowrap transition-colors"
          >
            <ListTodo className="w-3.5 h-3.5 text-amber-500" /> Follow-ups (F24)
          </button>
          <button
            onClick={() => handleSendQuery("What should I ask my doctor?")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50/80 hover:bg-purple-100 border border-purple-200 text-slate-700 font-semibold rounded-xl whitespace-nowrap transition-colors"
          >
            <Stethoscope className="w-3.5 h-3.5 text-sky-500" /> Doctor Prep (F18)
          </button>
          <button
            onClick={() => handleSendQuery("What changed recently?")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50/80 hover:bg-purple-100 border border-purple-200 text-slate-700 font-semibold rounded-xl whitespace-nowrap transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Trends (F19/F20)
          </button>
          <button
            onClick={() => handleSendQuery("What should I focus on for myself and my baby today?")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50/80 hover:bg-purple-100 border border-purple-200 text-slate-700 font-semibold rounded-xl whitespace-nowrap transition-colors"
          >
            <Baby className="w-3.5 h-3.5 text-pink-500" /> Mother + Baby
          </button>
        </div>

        {/* Chat History */}
        <div className="space-y-4 min-h-[320px] max-h-[560px] overflow-y-auto pr-1">
          {chatHistory.map((msg) => {
            const isAgent = msg.sender === "agent";
            const payload = msg.responsePayload;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAgent ? "items-start" : "items-end justify-end"}`}
              >
                {isAgent && (
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center font-black text-xs shadow-md shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-3xl p-4 sm:p-5 space-y-3 text-xs sm:text-sm ${
                    isAgent
                      ? "bg-purple-50/70 text-slate-800 border border-purple-100"
                      : "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md font-medium"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 border-b border-purple-200/50 pb-2">
                    <span className="font-extrabold text-[11px] opacity-80">
                      {isAgent ? "Safety & Care Coordination AI Agent" : "You"}
                    </span>
                    <span className="text-[10px] opacity-60">{msg.timestamp}</span>
                  </div>

                  {/* Message Body */}
                  <div className="leading-relaxed whitespace-pre-line">
                    {msg.text}
                  </div>

                  {/* Fact Badges */}
                  {isAgent && payload && payload.facts && payload.facts.length > 0 && (
                    <div className="pt-2 border-t border-purple-200/50 space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Fact & Observation Breakdown
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {payload.facts.map((fact, idx) => (
                          <div
                            key={idx}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold border flex items-center gap-1.5 ${getFactBadgeStyle(
                              fact.tag
                            )}`}
                          >
                            <span>{formatFactTagLabel(fact.tag)}:</span>
                            <span className="font-bold">{fact.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Data Rationale Accordion */}
                  {isAgent && payload && payload.whyAmISeeingThis && (
                    <div className="pt-2 border-t border-purple-200/40">
                      <button
                        onClick={() =>
                          setShowDataRationaleId(
                            showDataRationaleId === msg.id ? null : msg.id
                          )
                        }
                        className="flex items-center gap-1.5 text-[11px] font-bold text-purple-700 hover:underline"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Why am I seeing this? (Data Rationale)</span>
                        {showDataRationaleId === msg.id ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {showDataRationaleId === msg.id && (
                        <div className="mt-2.5 p-3 rounded-2xl bg-white border border-purple-200/80 space-y-1.5 text-[11px]">
                          <div>
                            <span className="font-bold text-slate-700">Source Features: </span>
                            <span className="text-slate-600">
                              {payload.whyAmISeeingThis.sourceFeatures.join(" • ")}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700">Data Points Used: </span>
                            <span className="text-slate-600">
                              {payload.whyAmISeeingThis.dataPointsUsed.join(" • ")}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700">Time Horizon: </span>
                            <span className="text-slate-600">
                              {payload.whyAmISeeingThis.timeRange}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700">Care Scope: </span>
                            <span className="text-slate-600">
                              {payload.whyAmISeeingThis.scope}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Direct Feature Navigation Actions */}
                  {isAgent && payload && payload.recommendedActions && payload.recommendedActions.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      {payload.recommendedActions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => onNavigatePage(act.targetPage)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-purple-300 text-purple-700 hover:bg-purple-50 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <span>{act.buttonText || act.title}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-purple-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-purple-600 font-semibold p-3 bg-purple-50/50 rounded-2xl">
              <Bot className="w-4 h-4 animate-bounce" />
              <span>Safety & Care Coordination AI is synthesizing care outputs...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* SUGGESTED QUESTION CHIPS */}
        <div className="space-y-2 pt-2 border-t border-purple-100">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
            <span>Context-Aware Suggested Questions</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {getSuggestedQuestions().map((qText, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuery(qText)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-2xl bg-purple-50/80 hover:bg-purple-100 border border-purple-200/70 text-slate-700 text-xs font-medium transition-colors"
              >
                {qText}
              </button>
            ))}
          </div>
        </div>

        {/* QUERY INPUT BAR */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="flex items-center gap-2 pt-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask Safety & Care Coordination AI about priorities, follow-ups, appointments..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-purple-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold text-xs transition-colors flex items-center gap-2 shadow-md shadow-purple-500/20"
          >
            <span>Ask AI</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SafetyCareCoordinationAiPage;

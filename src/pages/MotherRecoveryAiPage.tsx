import React, { useState, useEffect } from "react";
import { apiFetch } from "../services/apiClient";
import {
  Sparkles,
  Bot,
  ShieldAlert,
  Send,
  HelpCircle,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Moon,
  Activity,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FileText,
  Calendar,
  RotateCcw,
} from "lucide-react";
import {
  MotherRecoveryContext,
  MotherAgentResponse,
  MotherAgentFact,
  PageView,
} from "../types";
import {
  buildMotherRecoveryContext,
  generateDeterministicRecoveryFallback,
} from "../services/motherRecoveryAgentService";

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  timestamp: string;
  text: string;
  responsePayload?: MotherAgentResponse;
}

export interface MotherRecoveryAiPageProps {
  onNavigateSubPage?: (page: string) => void;
}

export const MotherRecoveryAiPage: React.FC<MotherRecoveryAiPageProps> = ({
  onNavigateSubPage,
}) => {
  const [queryInput, setQueryInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [context, setContext] = useState<MotherRecoveryContext | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [expandedRationaleId, setExpandedRationaleId] = useState<string | null>(null);

  // Initialize Agent Context on load
  useEffect(() => {
    const ctx = buildMotherRecoveryContext("");
    setContext(ctx);

    // Initial greeting message
    const initialGreeting: ChatMessage = {
      id: "msg-init",
      sender: "agent",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: `Hello Mama! I am **Mother & Recovery AI** (Agent 1 of BloomNest).\n\nI am connected to your recorded recovery context for **Postpartum Day ${ctx.postpartumDay}** (${ctx.recoveryStage}). I can help you understand your pain trajectories, lochia bleeding patterns, sleep quality, and daily priorities using your actual BloomNest logs.`,
      responsePayload: {
        answer: "",
        responseType: "SUMMARY",
        facts: [
          {
            tag: "RECORDED_FACT",
            label: "Postpartum Stage",
            text: `Day ${ctx.postpartumDay} (${ctx.recoveryStage}, ${ctx.deliveryType} delivery)`,
          },
          {
            tag: "CALCULATED_OBSERVATION",
            label: "Safety Status",
            text: `F4 Safety Shield: ${ctx.safetyStatus}`,
          },
        ],
        observations: [`Day ${ctx.postpartumDay} Recovery Context Active`],
        safetyStatus: ctx.safetyStatus as any,
        recommendedActions: [
          {
            title: "View Physical Recovery Hub",
            description: "Inspect overall energy & mobility",
            targetPage: "recovery" as PageView,
            buttonText: "Open Recovery Hub",
          },
        ],
        sourceFeatures: ["Feature 01 Postpartum Care", "Feature 02 Mother Recovery", "Feature 04 Safety Shield"],
        whyAmISeeingThis: {
          sourceFeatures: ["F01 Postpartum Care", "F02 Mother Recovery", "F04 Safety Shield"],
          dataPointsUsed: ["Delivery Date", "Recovery Logs", "Safety Assessment"],
          timeRange: `Postpartum Day 0 to ${ctx.postpartumDay}`,
        },
        confidence: "HIGH",
        dataSufficiency: ctx.hasSufficientData ? "FULL" : "PARTIAL",
      },
    };

    setChatHistory([initialGreeting]);
  }, []);

  const handleSendQuery = async (customQuery?: string) => {
    const messageText = (customQuery || queryInput).trim();
    if (!messageText || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: messageText,
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setQueryInput("");
    setIsLoading(true);

    // Build Query-Specific Minimized Context
    const currentCtx = buildMotherRecoveryContext(messageText);
    setContext(currentCtx);

    try {
      // 1. Call Server API Endpoint /api/agent/mother-recovery
      const res = await apiFetch("/api/agent/mother-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, context: currentCtx }),
      });

      if (res.ok) {
        const payload: MotherAgentResponse = await res.json();
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
      // 3. Fallback to Deterministic Recovery-Context Synthesizer
      const fallbackResponse = generateDeterministicRecoveryFallback(messageText, currentCtx);
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

  // Dynamic Suggested Question Chips based on actual user context
  const getSuggestedQuestions = (): string[] => {
    const list = [
      "How is my recovery going?",
      "What should I focus on today?",
      "What should I tell my doctor?",
    ];

    if (context?.recentPainScore !== undefined) {
      list.push("How has my pain been changing?");
    }
    if (context?.sleepHours24h !== undefined && context.sleepHours24h > 0) {
      list.push("Why am I feeling tired lately?");
    }
    if (context?.activeTrendsCount && context.activeTrendsCount > 0) {
      list.push("What changed this week?");
    }
    if (context?.activeAnomaliesCount && context.activeAnomaliesCount > 0) {
      list.push("Why was this flagged?");
    }

    // Add Test 11 verification prompt
    list.push("What was my blood pressure yesterday?");

    return list;
  };

  const getFactBadgeStyle = (tag: string) => {
    switch (tag) {
      case "RECORDED_FACT":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300";
      case "CALCULATED_OBSERVATION":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300";
      case "DETECTED_PATTERN":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300";
      case "SAFETY_ALERT":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-300 font-bold";
      case "AI_SUGGESTION":
      default:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300";
    }
  };

  const formatFactTagLabel = (tag: string) => {
    switch (tag) {
      case "RECORDED_FACT":
        return "Recorded Fact";
      case "CALCULATED_OBSERVATION":
        return "Calculated Observation";
      case "DETECTED_PATTERN":
        return "Detected Pattern";
      case "SAFETY_ALERT":
        return "Safety Alert";
      case "AI_SUGGESTION":
      default:
        return "AI Suggestion";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* HEADER BANNER */}
      <div className="bg-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-md">
                Agent 1 of 3 • Mother & Recovery AI
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-400/30 text-emerald-100 font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> F4 Safety Guard Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Maternal Physical & Emotional Recovery Copilot
            </h1>

            <p className="text-xs sm:text-sm text-rose-100 max-w-2xl">
              Connected to your BloomNest recovery logs, F04 Safety Shield, F19 Trends, F20 Anomalies, F29 Memory, and F30 Care Coordination.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/15 p-3 rounded-2xl backdrop-blur-md border border-white/20 text-xs font-semibold shrink-0">
            <Bot className="w-8 h-8 text-rose-200" />
            <div>
              <div className="font-extrabold">Agent 1 Connected</div>
              <div className="text-[10px] text-rose-200">Non-Diagnostic Intelligence</div>
            </div>
          </div>
        </div>

        {/* CONTEXT STRIP */}
        {context && (
          <div className="mt-6 pt-4 border-t border-white/20 flex flex-wrap items-center gap-4 text-xs font-medium text-rose-100">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
              <Calendar className="w-3.5 h-3.5" />
              <span>Postpartum Day <strong>{context.postpartumDay}</strong> ({context.recoveryStage})</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Safety Status: <strong>{context.safetyStatus}</strong></span>
            </div>

            {context.recentPainScore !== undefined && (
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
                <Activity className="w-3.5 h-3.5" />
                <span>Recent Pain: <strong>{context.recentPainScore}/10</strong></span>
              </div>
            )}

            {context.sleepHours24h !== undefined && context.sleepHours24h > 0 && (
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
                <Moon className="w-3.5 h-3.5" />
                <span>24h Sleep: <strong>{context.sleepHours24h.toFixed(1)}h</strong></span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* URGENT SAFETY OVERRIDE BANNER IF F4 ACTIVE */}
      {context?.safetyStatus === "URGENT_ATTENTION" && (
        <div className="p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-500 shadow-md flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <h3 className="text-sm font-extrabold text-rose-900 dark:text-rose-100">
              URGENT CLINICAL SAFETY ALERT (Feature 04 Safety Shield Active)
            </h3>
            <p className="text-xs text-rose-800 dark:text-rose-300">
              {context.urgentSafetyMessage || "A critical physiological symptom has been flagged by Safety Shield. Agent 1 will prioritize emergency guidance."}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => onNavigateSubPage && onNavigateSubPage("safety")}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Open Safety Shield</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHAT STREAM CONTAINER */}
      <div className="bg-white dark:bg-[#1a1420] rounded-3xl border border-rose-100 dark:border-rose-900/40 p-4 sm:p-6 shadow-sm space-y-6">
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
                  <div className="w-9 h-9 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-xs shadow-md shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-3xl p-4 sm:p-5 space-y-3 text-xs sm:text-sm ${
                    isAgent
                      ? "bg-rose-50/70 dark:bg-rose-950/30 text-slate-800 dark:text-rose-100 border border-rose-100 dark:border-rose-900/40"
                      : "bg-rose-600 text-white shadow-md font-medium"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 border-b border-rose-200/50 dark:border-rose-900/40 pb-2">
                    <span className="font-extrabold text-[11px] opacity-80">
                      {isAgent ? "Mother & Recovery AI Agent" : "You"}
                    </span>
                    <span className="text-[10px] opacity-60">{msg.timestamp}</span>
                  </div>

                  {/* Message Content Body */}
                  <div className="leading-relaxed whitespace-pre-line">
                    {msg.text}
                  </div>

                  {/* Fact Badges Section */}
                  {isAgent && payload && payload.facts && payload.facts.length > 0 && (
                    <div className="pt-2 border-t border-rose-200/50 dark:border-rose-900/40 space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 dark:text-rose-300 uppercase tracking-wider">
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

                  {/* "WHY AM I SEEING THIS?" EXPANDABLE ACCORDION */}
                  {isAgent && payload && payload.whyAmISeeingThis && (
                    <div className="pt-2 border-t border-rose-200/40 dark:border-rose-900/40">
                      <button
                        onClick={() =>
                          setExpandedRationaleId(
                            expandedRationaleId === msg.id ? null : msg.id
                          )
                        }
                        className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:underline"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Why am I seeing this? (Data Rationale)</span>
                        {expandedRationaleId === msg.id ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {expandedRationaleId === msg.id && (
                        <div className="mt-2.5 p-3 rounded-2xl bg-white dark:bg-[#231a2c] border border-rose-200/80 dark:border-rose-800/40 space-y-1.5 text-[11px]">
                          <div>
                            <span className="font-bold text-slate-700 dark:text-rose-200">
                              Source Features:{" "}
                            </span>
                            <span className="text-slate-600 dark:text-rose-300">
                              {payload.whyAmISeeingThis.sourceFeatures.join(" • ")}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 dark:text-rose-200">
                              Data Points Used:{" "}
                            </span>
                            <span className="text-slate-600 dark:text-rose-300">
                              {payload.whyAmISeeingThis.dataPointsUsed.join(" • ")}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 dark:text-rose-200">
                              Time Horizon:{" "}
                            </span>
                            <span className="text-slate-600 dark:text-rose-300">
                              {payload.whyAmISeeingThis.timeRange}
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
                          onClick={() => onNavigateSubPage && onNavigateSubPage(act.targetPage)}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#231a2c] border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-200 hover:bg-rose-50 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <span>{act.buttonText}</span>
                          <ArrowRight className="w-3 h-3 text-rose-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-rose-600 dark:text-rose-400 font-semibold p-3 bg-rose-50/50 dark:bg-rose-950/30 rounded-2xl">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Mother & Recovery AI is reading your BloomNest context...</span>
            </div>
          )}
        </div>

        {/* SUGGESTED QUESTION CHIPS */}
        <div className="space-y-2 pt-2 border-t border-rose-100 dark:border-rose-900/40">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Context-Aware Suggested Questions</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {getSuggestedQuestions().map((qText, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuery(qText)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/70 dark:border-rose-800/40 text-slate-700 dark:text-rose-200 text-xs font-medium transition-colors"
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
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Ask Mother & Recovery AI about your recovery, pain, sleep, bleeding..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#231a2c] border border-rose-200 dark:border-rose-800 text-xs sm:text-sm text-slate-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />

          <button
            type="submit"
            disabled={isLoading || !queryInput.trim()}
            className="px-5 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-extrabold text-xs transition-colors flex items-center gap-2 shadow-md"
          >
            <span>Ask AI</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

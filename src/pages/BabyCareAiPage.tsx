import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "../services/apiClient";
import {
  BabyCareContext,
  BabyAgentResponse,
  BabyAgentFact,
  PageView,
  BabyProfileData,
} from "../types";
import {
  buildBabyCareContext,
  generateDeterministicBabyFallback,
} from "../services/babyCareAgentService";
import {
  Baby,
  Bot,
  Sparkles,
  Shield,
  ShieldCheck,
  Activity,
  Calendar,
  Send,
  UserCheck,
  TrendingUp,
  FileText,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Heart,
  Droplet,
  Utensils,
  Moon,
  Syringe,
  Stethoscope,
  Info,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface BabyCareAiPageProps {
  onNavigatePage: (page: PageView) => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  timestamp: string;
  text: string;
  responsePayload?: BabyAgentResponse;
}

export const BabyCareAiPage: React.FC<BabyCareAiPageProps> = ({ onNavigatePage }) => {
  const [babies, setBabies] = useState<BabyProfileData[]>([]);
  const [selectedBabyId, setSelectedBabyId] = useState<string | undefined>(undefined);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [context, setContext] = useState<BabyCareContext | null>(null);
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

  // Initialize context and welcome message whenever selectedBabyId changes
  useEffect(() => {
    const initialCtx = buildBabyCareContext("overview", selectedBabyId);
    setContext(initialCtx);

    const initialWelcome: ChatMessage = {
      id: "welcome-msg",
      sender: "agent",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: `Hello! I am **Baby Care AI** (Agent 2 of BloomNest).\n\nI am connected to your baby records for **${initialCtx.babyName}** (${initialCtx.babyAgeFormatted}). I can help you understand feeding patterns, diaper counts, sleep trends, growth records, milestone progress, and vaccination schedules using your actual BloomNest logs.`,
      responsePayload: {
        answer: "",
        responseType: "SUMMARY",
        facts: [
          { tag: "RECORDED_FACT", label: "Baby Context", text: `Baby: ${initialCtx.babyName} (${initialCtx.babyAgeFormatted})` },
          { tag: "CALCULATED_OBSERVATION", label: "Safety Shield", text: `Safety Status: ${initialCtx.safetyStatus}` },
          { tag: "RECORDED_FACT", label: "Birth Weight", text: `Birth Weight: ${initialCtx.birthWeightKg ? initialCtx.birthWeightKg + ' kg' : 'Not recorded'}` },
          { tag: "RECORDED_FACT", label: "Latest Weight (F27)", text: `Latest Weight: ${initialCtx.latestWeightKg ? initialCtx.latestWeightKg + ' kg' : 'Not logged'}` },
          { tag: "RECORDED_FACT", label: "Next Vaccine (F28)", text: `Next Vaccine: ${initialCtx.nextVaccineName || 'Up to date'}` },
        ],
        observations: [`Tracking ${initialCtx.babyName}`],
        safetyStatus: initialCtx.safetyStatus,
        sourceFeatures: ["F02 Baby Profile", "F10 Feeding", "F11 Diaper", "F13 Sleep", "F27 Growth", "F28 Vaccines", "F04 Safety Shield"],
        whyAmISeeingThis: {
          sourceFeatures: ["F02 Baby Profile", "F10 Feeding", "F11 Diaper", "F13 Sleep", "F27 Growth", "F28 Vaccines", "F04 Safety Shield"],
          dataPointsUsed: ["Birth & Current Growth", "24h Diaper Count", "24h Feeding Summary", "24h Sleep Duration", "Vaccine Due Schedule"],
          timeRange: "Full Historical Records",
          babyName: initialCtx.babyName,
        },
        recommendedActions: [
          { title: "Baby Care AI", description: "Ask questions about baby care", buttonText: "Open Baby Care AI", targetPage: "baby-care-ai" },
          { title: "Growth & Milestones", description: "Track height, weight, and developmental progress", buttonText: "Open Growth Hub", targetPage: "baby-growth-milestones" },
          { title: "Care Coordination", description: "Share records with your pediatrician", buttonText: "Open Care Coordination", targetPage: "care-coordination" },
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

    const currentCtx = buildBabyCareContext(messageText, selectedBabyId);
    setContext(currentCtx);

    try {
      const res = await apiFetch("/api/agent/baby-care", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, babyId: selectedBabyId, context: currentCtx }),
      });

      if (res.ok) {
        const payload: BabyAgentResponse = await res.json();
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
      const fallbackResponse = generateDeterministicBabyFallback(messageText, currentCtx);
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
      "How is my baby doing?",
      "How has my baby's feeding been?",
      "How many diapers has my baby had?",
      "How has my baby's sleep been?",
      "How is my baby growing?",
      "What vaccine is coming up next?",
      "What should I tell my pediatrician?",
      "What changed this week?",
    ];
  };

  const getFactBadgeStyle = (tag: string) => {
    switch (tag) {
      case "SAFETY_ALERT":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-bold";
      case "RECORDED_FACT":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
      case "CALCULATED_OBSERVATION":
        return "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300 dark:border-sky-800";
      case "DETECTED_PATTERN":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800";
      case "AI_SUGGESTION":
      default:
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800";
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
      <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-pink-500/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-md">
                👶 Agent 2 of 3 • Baby Care AI
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-400/30 text-emerald-100 font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> F4 Safety Guard Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Infant Care, Growth & Vaccination Intelligence Copilot
            </h1>

            <p className="text-xs sm:text-sm text-pink-100 max-w-2xl">
              Connected to F10 Feeding, F11 Diaper, F13 Sleep, F27 Growth, F28 Vaccines, F18 Pediatrician Prep, and F04 Safety Shield.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/15 p-3.5 rounded-2xl backdrop-blur-md border border-white/20 text-xs font-semibold shrink-0">
            <Bot className="w-8 h-8 text-pink-200" />
            <div>
              <div className="font-extrabold">Agent 2 Connected</div>
              <div className="text-[10px] text-pink-200">Pediatric Intelligence Layer</div>
            </div>
          </div>
        </div>

        {/* CONTEXT SUB-STRIP */}
        {context && (
          <div className="mt-6 pt-4 border-t border-white/20 flex flex-wrap items-center gap-4 text-xs font-medium text-pink-100">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
              <Baby className="w-3.5 h-3.5" />
              <span>Baby: <strong>{context.babyName}</strong> ({context.babyAgeFormatted})</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Safety Status: <strong>{context.safetyStatus}</strong></span>
            </div>

            {context.latestWeightKg !== undefined && (
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Current Weight: <strong>{context.latestWeightKg} kg</strong></span>
              </div>
            )}

            {context.nextVaccineName && (
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
                <Syringe className="w-3.5 h-3.5" />
                <span>Next Vaccine: <strong>{context.nextVaccineName}</strong></span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BABY SELECTION & CONTEXT CARD */}
      <div className="bg-white dark:bg-[#1a1420] rounded-3xl p-5 shadow-sm border border-rose-100 dark:border-rose-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold">
            <Baby className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Scoped Baby Profile</div>
            {babies.length > 1 ? (
              <select
                value={selectedBabyId}
                onChange={(e) => setSelectedBabyId(e.target.value)}
                className="mt-0.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold rounded-xl focus:ring-2 focus:ring-pink-400 focus:outline-none"
              >
                {babies.map((b) => (
                  <option key={b.id} value={b.id}>
                    👶 {b.babyName}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-base font-extrabold text-slate-900 dark:text-rose-100">
                {context?.babyName || "Baby"}
              </div>
            )}
          </div>
        </div>

        {context && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1.5 rounded-xl bg-pink-50 dark:bg-pink-950/50 border border-pink-200 dark:border-pink-900/50 text-pink-800 dark:text-pink-300 text-xs font-bold">
              Age: {context.babyAgeFormatted}
            </span>
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
                <ShieldCheck className="w-4 h-4" /> SAFETY CLEAR
              </span>
            )}
          </div>
        )}
      </div>

      {/* STATS STRIP (Birth vs Current Growth) */}
      {context && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-[#1a1420] p-4 rounded-2xl border border-slate-200 dark:border-rose-900/40 shadow-sm text-center">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Birth Weight</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              {context.birthWeightKg ? `${context.birthWeightKg} kg` : "N/A"}
            </div>
          </div>
          <div className="bg-white dark:bg-[#1a1420] p-4 rounded-2xl border border-slate-200 dark:border-rose-900/40 shadow-sm text-center">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Birth Length</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              {context.birthLengthCm ? `${context.birthLengthCm} cm` : "N/A"}
            </div>
          </div>
          <div className="bg-pink-50/50 dark:bg-pink-950/20 p-4 rounded-2xl border border-pink-200 dark:border-pink-900/40 shadow-sm text-center">
            <div className="text-[11px] font-semibold text-pink-700 dark:text-pink-400 uppercase tracking-wider">Latest Weight (F27)</div>
            <div className="text-base font-extrabold text-pink-900 dark:text-pink-200 mt-1">
              {context.latestWeightKg ? `${context.latestWeightKg} kg` : "Not logged"}
            </div>
          </div>
          <div className="bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-2xl border border-purple-200 dark:border-purple-900/40 shadow-sm text-center">
            <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Next Vaccine (F28)</div>
            <div className="text-base font-extrabold text-purple-900 dark:text-purple-200 mt-1 truncate">
              {context.nextVaccineName || "Up to date"}
            </div>
          </div>
        </div>
      )}

      {/* URGENT SAFETY OVERRIDE BANNER IF F4 ACTIVE */}
      {context?.safetyStatus === "URGENT_ATTENTION" && (
        <div className="p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-500 shadow-md flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <h3 className="text-sm font-extrabold text-rose-900 dark:text-rose-100">
              URGENT PEDIATRIC SAFETY ALERT (Feature 04 Safety Shield Active)
            </h3>
            <p className="text-xs text-rose-800 dark:text-rose-300">
              {context.urgentSafetyMessage || "An urgent health indicator has been flagged by Safety Shield. Agent 2 will prioritize emergency triage guidance."}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => onNavigatePage("safety")}
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
        {/* Quick Topic Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => handleSendQuery("How is my baby doing?")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/70 dark:border-rose-800/40 text-slate-700 dark:text-rose-200 font-semibold rounded-xl whitespace-nowrap transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-500" /> Overview
          </button>
          <button
            onClick={() => handleSendQuery("How has my baby's feeding been?")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/70 dark:border-rose-800/40 text-slate-700 dark:text-rose-200 font-semibold rounded-xl whitespace-nowrap transition-colors"
          >
            <Utensils className="w-3.5 h-3.5 text-amber-500" /> Feeding (F10)
          </button>
          <button
            onClick={() => handleSendQuery("How many diapers has my baby had?")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/70 dark:border-rose-800/40 text-slate-700 dark:text-rose-200 font-semibold rounded-xl whitespace-nowrap transition-colors"
          >
            <Droplet className="w-3.5 h-3.5 text-blue-500" /> Diapers (F11)
          </button>
          <button
            onClick={() => handleSendQuery("How has my baby's sleep been?")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/70 dark:border-rose-800/40 text-slate-700 dark:text-rose-200 font-semibold rounded-xl whitespace-nowrap transition-colors"
          >
            <Moon className="w-3.5 h-3.5 text-purple-500" /> Sleep (F13)
          </button>
          <button
            onClick={() => handleSendQuery("How is my baby growing?")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/70 dark:border-rose-800/40 text-slate-700 dark:text-rose-200 font-semibold rounded-xl whitespace-nowrap transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Growth (F27)
          </button>
          <button
            onClick={() => handleSendQuery("What vaccine is coming up next?")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/70 dark:border-rose-800/40 text-slate-700 dark:text-rose-200 font-semibold rounded-xl whitespace-nowrap transition-colors"
          >
            <Syringe className="w-3.5 h-3.5 text-rose-500" /> Vaccines (F28)
          </button>
          <button
            onClick={() => handleSendQuery("What should I tell my pediatrician?")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/70 dark:border-rose-800/40 text-slate-700 dark:text-rose-200 font-semibold rounded-xl whitespace-nowrap transition-colors"
          >
            <Stethoscope className="w-3.5 h-3.5 text-sky-500" /> Doctor Prep (F18)
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
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center font-black text-xs shadow-md shrink-0">
                    <Baby className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-3xl p-4 sm:p-5 space-y-3 text-xs sm:text-sm ${
                    isAgent
                      ? "bg-pink-50/70 dark:bg-pink-950/30 text-slate-800 dark:text-pink-100 border border-pink-100 dark:border-pink-900/40"
                      : "bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md font-medium"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 border-b border-pink-200/50 dark:border-pink-900/40 pb-2">
                    <span className="font-extrabold text-[11px] opacity-80">
                      {isAgent ? "Baby Care AI Agent" : "You"}
                    </span>
                    <span className="text-[10px] opacity-60">{msg.timestamp}</span>
                  </div>

                  {/* Message Body */}
                  <div className="leading-relaxed whitespace-pre-line">
                    {msg.text}
                  </div>

                  {/* Fact Badges */}
                  {isAgent && payload && payload.facts && payload.facts.length > 0 && (
                    <div className="pt-2 border-t border-pink-200/50 dark:border-pink-900/40 space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 dark:text-pink-300 uppercase tracking-wider">
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
                    <div className="pt-2 border-t border-pink-200/40 dark:border-pink-900/40">
                      <button
                        onClick={() =>
                          setShowDataRationaleId(
                            showDataRationaleId === msg.id ? null : msg.id
                          )
                        }
                        className="flex items-center gap-1.5 text-[11px] font-bold text-pink-700 dark:text-pink-300 hover:underline"
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
                        <div className="mt-2.5 p-3 rounded-2xl bg-white dark:bg-[#231a2c] border border-pink-200/80 dark:border-pink-800/40 space-y-1.5 text-[11px]">
                          <div>
                            <span className="font-bold text-slate-700 dark:text-pink-200">
                              Source Features:{" "}
                            </span>
                            <span className="text-slate-600 dark:text-pink-300">
                              {payload.whyAmISeeingThis.sourceFeatures.join(" • ")}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 dark:text-pink-200">
                              Data Points Used:{" "}
                            </span>
                            <span className="text-slate-600 dark:text-pink-300">
                              {payload.whyAmISeeingThis.dataPointsUsed.join(" • ")}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 dark:text-pink-200">
                              Time Horizon:{" "}
                            </span>
                            <span className="text-slate-600 dark:text-pink-300">
                              {payload.whyAmISeeingThis.timeRange}
                            </span>
                          </div>
                          {payload.whyAmISeeingThis.babyName && (
                            <div>
                              <span className="font-bold text-slate-700 dark:text-pink-200">
                                Scoped Baby:{" "}
                              </span>
                              <span className="text-slate-600 dark:text-pink-300">
                                {payload.whyAmISeeingThis.babyName}
                              </span>
                            </div>
                          )}
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
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#231a2c] border border-pink-300 dark:border-pink-800 text-pink-700 dark:text-pink-200 hover:bg-pink-50 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <span>{act.buttonText || act.title}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-pink-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-pink-600 dark:text-pink-400 font-semibold p-3 bg-pink-50/50 dark:bg-pink-950/30 rounded-2xl">
              <Bot className="w-4 h-4 animate-bounce" />
              <span>Baby Care AI is synthesizing infant care records...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* SUGGESTED QUESTION CHIPS */}
        <div className="space-y-2 pt-2 border-t border-rose-100 dark:border-rose-900/40">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-pink-500" />
            <span>Context-Aware Suggested Questions</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {getSuggestedQuestions().map((qText, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuery(qText)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-2xl bg-pink-50/80 dark:bg-pink-950/40 hover:bg-pink-100 dark:hover:bg-pink-900/60 border border-pink-200/70 dark:border-rose-800/40 text-slate-700 dark:text-pink-200 text-xs font-medium transition-colors"
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
            placeholder="Ask Baby Care AI about feeding, sleep, diapers, growth, vaccines..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#231a2c] border border-pink-200 dark:border-pink-800 text-xs sm:text-sm text-slate-800 dark:text-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />

          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="px-5 py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-extrabold text-xs transition-colors flex items-center gap-2 shadow-md shadow-pink-500/20"
          >
            <span>Ask AI</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default BabyCareAiPage;

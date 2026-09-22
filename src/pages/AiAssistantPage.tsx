import React, { useState, useRef, useEffect } from "react";
import { apiFetch } from "../services/apiClient";
import { useApp } from "../context/AppContext";
import {
  Bot,
  Send,
  User,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  FileText,
  Printer,
  Copy,
  Mic,
  MicOff,
  Stethoscope,
  Activity,
  Clock,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Layers,
  HeartPulse,
  Flame,
  HelpCircle,
  Share2
} from "lucide-react";
import { AgentResponse, AgentName, AgentObservation, AgentAction } from "../services/agents/types";
import { InteractiveAgentMessage, InteractiveSectionsData } from "../components/InteractiveAgentMessage";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
  evidenceBadge?: string;
  sources?: { title: string; source: string }[];
  isRedFlagAlert?: boolean;
  agentsInvolved?: AgentName[];
  observations?: AgentObservation[];
  actions?: AgentAction[];
  safetyLevel?: "INFO" | "ATTENTION" | "URGENT";
  reasoningSteps?: string[];
  toolsExecuted?: { toolName: string; durationMs: number }[];
  suggestedFollowUps?: string[];
  interactiveSections?: InteractiveSectionsData;
}

export const AiAssistantPage: React.FC = () => {
  const { user, setActivePage, t, language } = useApp();

  // Active Sub-tab
  const [activeTab, setActiveTab] = useState<"copilot" | "care-planner" | "doctor-brief">("copilot");

  // Chat state
  const greetingFallback = `Hello, Dear Mama ${user.fullName}! 🌸 I am **BloomNest 2.0 Agentic Copilot**.\n\nYou are in **Week ${user.currentWeek} (Trimester ${user.trimester})**. Unlike ordinary chatbots, I coordinate specialized clinical agents:\n• 👶 **Journey Agent** (Fetal milestones)\n• 🥗 **Wellness Agent** (ICMR maternal diet & recipes)\n• 🚨 **Safety Agent** (ACOG clinical guardrails & red flags)\n• 📋 **Care Planner Agent** (Daily routines)\n• 🩺 **Doctor Brief Agent** (SBAR handover summaries)\n\nAsk me anything in English or Tamil / Tanglish!`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init_1",
      sender: "ai",
      text: greetingFallback,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      evidenceBadge: "ACOG & ICMR Multi-Agent Verified",
      agentsInvolved: ["ORCHESTRATOR", "SAFETY", "WELLNESS"],
      safetyLevel: "INFO",
      sources: [{ title: "BloomNest 2.0 Multi-Agent Clinical Core", source: "ACOG / ICMR Guidelines" }],
      suggestedFollowUps: [
        "Is papaya safe in 2nd trimester?",
        "Enaku 2 naala kaal veengirukku and headache irukku",
        "Generate my Week " + user.currentWeek + " daily care plan",
        "Suggest a high-protein South Indian pregnancy recipe"
      ]
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeOrchestrationSteps, setActiveOrchestrationSteps] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Care Planner State
  const [carePlanData, setCarePlanData] = useState<any>(null);
  const [loadingCarePlan, setLoadingCarePlan] = useState(false);
  const [addedTasks, setAddedTasks] = useState<Record<string, boolean>>({});

  // Doctor Brief SBAR State
  const [sbarData, setSbarData] = useState<any>(null);
  const [loadingSbar, setLoadingSbar] = useState(false);
  const [sbarSymptomInput, setSbarSymptomInput] = useState("Routine prenatal follow-up & vitals review");
  const [copiedBrief, setCopiedBrief] = useState(false);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = language === "ta" ? "ta-IN" : "en-US";
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
    }
  }, [language]);

  const toggleSpeech = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = language === "ta" ? "ta-IN" : "en-US";
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Speech recognition error:", err);
      }
    }
  };

  const OBSTETRIC_PROMPTS = [
    { label: "🥑 Is papaya safe in 2nd trimester?", text: "Is papaya safe during pregnancy in 2nd trimester?" },
    { label: "🚨 Headache + BP 140/90 (Triage)", text: "I have sudden headache and my BP is 140/92, what should I do?" },
    { label: "📋 Generate Week " + user.currentWeek + " Care Plan", text: "Create my personalized daily care plan for week " + user.currentWeek },
    { label: "🩺 Compile Doctor's SBAR Brief", text: "Generate my clinical doctor brief SBAR handover report" },
    { label: "🌾 High-protein South Indian meal", text: "Suggest a healthy South Indian pregnancy recipe with iron and calcium" },
    { label: "🗣️ 'Kaal veengirukku' (Tanglish triage)", text: "Enaku 2 naala kaal veengirukku and mild headache irukku" }
  ];

  useEffect(() => {
    // Prevent auto-scrolling whole page down to bottom on initial mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, activeOrchestrationSteps]);

  // Ensure page always starts at the top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Load Care Plan on tab switch or first time
  const fetchCarePlan = async () => {
    setLoadingCarePlan(true);
    try {
      const res = await apiFetch(`/api/agent/care-plan?week=${user.currentWeek || 24}&trimester=${user.trimester || 2}`);
      if (res.ok) {
        const data = await res.json();
        setCarePlanData(data);
      }
    } catch (err) {
      console.error("Failed to load care plan:", err);
    } finally {
      setLoadingCarePlan(false);
    }
  };

  // Load Doctor SBAR Brief
  const fetchDoctorBrief = async (symptom?: string) => {
    setLoadingSbar(true);
    try {
      const querySymptom = symptom || sbarSymptomInput;
      const patientName = user.fullName || "Sarah Jenkins";
      const doctorName = user.doctorName || "Dr. Ananya Sharma, MD";
      const hospitalName = user.hospitalName || "Apollo Cradle Maternity";
      const bloodGroup = user.bloodGroup || "O+";
      const age = user.age || 28;
      const res = await apiFetch(
        `/api/agent/doctor-brief?week=${user.currentWeek || 24}&trimester=${user.trimester || 2}&symptom=${encodeURIComponent(querySymptom)}&patientName=${encodeURIComponent(patientName)}&doctorName=${encodeURIComponent(doctorName)}&hospitalName=${encodeURIComponent(hospitalName)}&bloodGroup=${encodeURIComponent(bloodGroup)}&age=${age}`
      );
      if (res.ok) {
        const data = await res.json();
        setSbarData(data);
      }
    } catch (err) {
      console.error("Failed to load SBAR brief:", err);
    } finally {
      setLoadingSbar(false);
    }
  };

  useEffect(() => {
    if (activeTab === "care-planner" && !carePlanData) {
      fetchCarePlan();
    } else if (activeTab === "doctor-brief" && !sbarData) {
      fetchDoctorBrief();
    }
  }, [activeTab]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Dynamic visual orchestration steps
    setActiveOrchestrationSteps([
      "🧠 Agent Orchestrator: Parsing intent & patient context graph...",
      "🚨 Safety Agent: Evaluating ACOG preeclampsia & vital thresholds...",
      "🥗 Wellness Agent: Cross-referencing ICMR maternal guidelines...",
      "💾 Maternal Memory: Syncing with PostgreSQL context store..."
    ]);

    try {
      const response = await apiFetch("/api/agent/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          userWeek: user.currentWeek || 24,
          trimester: user.trimester || 2,
          language: language,
        }),
      });

      const data: AgentResponse = await response.json();

      if (response.ok && data) {
        const isUrgent = data.safetyLevel === "URGENT" || data.safetyLevel === "ATTENTION";
        setMessages((prev) => [
          ...prev,
          {
            id: data.requestId || `ai_${Date.now()}`,
            sender: "ai",
            text: data.message,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            evidenceBadge: `Multi-Agent: ${(data.agentsInvolved || ["ORCHESTRATOR"]).join(" + ")}`,
            sources: data.sources,
            isRedFlagAlert: isUrgent,
            agentsInvolved: data.agentsInvolved,
            observations: data.observations,
            actions: data.actions,
            safetyLevel: data.safetyLevel,
            reasoningSteps: data.trace?.reasoningSteps,
            toolsExecuted: data.trace?.toolsExecuted?.map((t: any) => ({
              toolName: t.toolName,
              durationMs: t.durationMs || 12
            })),
            suggestedFollowUps: data.suggestedFollowUps,
            interactiveSections: data.interactiveSections
          },
        ]);
      } else {
        // Fallback
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_err_${Date.now()}`,
            sender: "ai",
            text: "🌸 Dear Mama: Stay hydrated and rest. For acute maternal symptoms, consult Dr. Ananya Sharma or call 108 immediately.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            evidenceBadge: "Clinical Safety Fallback",
            agentsInvolved: ["ORCHESTRATOR", "SAFETY"],
            safetyLevel: "INFO"
          },
        ]);
      }
    } catch (e) {
      console.error("AI Agent error:", e);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_exc_${Date.now()}`,
          sender: "ai",
          text: "I am experiencing a brief network sync delay, Mama. If you have an urgent medical query, please connect directly to our Emergency Triage.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          evidenceBadge: "Emergency Fallback",
          agentsInvolved: ["SAFETY"],
          safetyLevel: "ATTENTION",
          isRedFlagAlert: true
        },
      ]);
    } finally {
      setIsLoading(false);
      setActiveOrchestrationSteps([]);
    }
  };

  const handlePrintSbar = () => {
    window.print();
  };

  const handleCopySbar = () => {
    if (!sbarData) return;
    const text = `BLOOMNEST 2.0 CLINICAL SBAR HANDOVER BRIEF
Patient: ${sbarData.patientDetails?.name} | Age: ${sbarData.patientDetails?.age} | GA: ${sbarData.patientDetails?.gestationalAge}
Attending: ${sbarData.patientDetails?.attendingDoctor} (${sbarData.patientDetails?.facility})
Date: ${new Date().toLocaleDateString()}

S — SITUATION:
${sbarData.sbar?.situation?.summary}
${sbarData.sbar?.situation?.keyConcern}

B — BACKGROUND:
${sbarData.sbar?.background?.summary}
Allergies: ${sbarData.sbar?.background?.allergies}
Immunizations: ${sbarData.sbar?.background?.immunizations}

A — ASSESSMENT:
${sbarData.sbar?.assessment?.summary}
Vitals: ${sbarData.sbar?.assessment?.vitalsSummary?.map((v: any) => `${v.metric}: ${v.value} (${v.status})`).join(", ")}
Clinical Risk: ${sbarData.sbar?.assessment?.clinicalRiskScore}

R — RECOMMENDATIONS:
${sbarData.sbar?.recommendation?.points?.map((p: string, i: number) => `${i + 1}. ${p}`).join("\n")}

Disclaimer: ${sbarData.disclaimer}`;

    navigator.clipboard.writeText(text);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2500);
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300 max-w-6xl mx-auto">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-rose-50 to-rose-100 dark:from-[#1a1523] dark:via-[#1e172a] dark:to-[#171422] p-6 rounded-3xl border border-rose-200/70 dark:border-rose-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <Cpu className="w-4 h-4 text-rose-500" />
            <span>BloomNest 2.0 Autonomous Multi-Agent System</span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            Maternal Clinical Multi-Agent Copilot
          </h1>
          <p className="text-xs text-gray-600 dark:text-rose-300 mt-1 max-w-2xl leading-relaxed">
            Multi-agent consensus architecture coordinating <strong>Journey, Wellness, Safety, Care Planner & Doctor Brief Agents</strong> backed by clinical guidelines (ACOG, ICMR 2024) and longitudinal PostgreSQL memory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePage("emergency")}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all shrink-0"
          >
            <PhoneCall className="w-4 h-4 text-white animate-bounce" />
            <span>{t("Emergency SOS (108)")}</span>
          </button>
        </div>
      </div>

      {/* Multi-Agent Mode Switcher Tabs */}
      <div className="flex items-center justify-start gap-2 bg-white dark:bg-[#1a1523] p-1.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab("copilot")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "copilot"
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm"
              : "text-gray-600 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Multi-Agent Copilot (Chat & Triage)</span>
        </button>

        <button
          onClick={() => setActiveTab("care-planner")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "care-planner"
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm"
              : "text-gray-600 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Care Planner Agent</span>
          <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-rose-200 dark:bg-rose-800 text-rose-900 dark:text-white font-extrabold">Auto-Routine</span>
        </button>

        <button
          onClick={() => setActiveTab("doctor-brief")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "doctor-brief"
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm"
              : "text-gray-600 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctor Brief Agent (SBAR)</span>
          <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-white font-extrabold">Hospital Brief</span>
        </button>
      </div>

      {/* ======================= TAB 1: MULTI-AGENT COPILOT ======================= */}
      {activeTab === "copilot" && (
        <div className="space-y-4">
          {/* Quick Consultation Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>Multi-Agent Test Prompts (English & Tanglish):</span>
              </span>
              <span className="text-[11px] text-rose-500 dark:text-rose-400 font-semibold">
                Tap to test autonomous triage & tools
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {OBSTETRIC_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.text)}
                  className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#1a1523] border border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-xs transition-all text-left flex items-center gap-2"
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Chain-of-Thought Visualizer Banner when thinking */}
          {isLoading && activeOrchestrationSteps.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/90 to-rose-900/90 text-white shadow-md border border-purple-400/30 animate-pulse space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-200">
                <Layers className="w-4 h-4 text-purple-300 animate-spin" />
                <span>Autonomous Multi-Agent Consensus in Progress:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-purple-100">
                {activeOrchestrationSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-black/20 p-2 rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Box Container */}
          <div className="bg-white dark:bg-[#1a1523] rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm overflow-hidden flex flex-col h-[560px]">
            {/* Messages Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col space-y-2 ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`flex gap-3 max-w-3xl ${
                      msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                        msg.sender === "user"
                          ? "bg-rose-500 text-white"
                          : "bg-gradient-to-tr from-purple-600 via-rose-500 to-pink-500 text-white"
                      }`}
                    >
                      {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed space-y-2.5 shadow-xs w-full ${
                        msg.sender === "user"
                          ? "bg-rose-500 text-white rounded-tr-none shadow-md max-w-xl"
                          : "bg-rose-50/70 dark:bg-[#201a2c] border border-rose-100 dark:border-rose-900/40 text-gray-800 dark:text-rose-100 rounded-tl-none"
                      }`}
                    >
                      {msg.sender === "user" ? (
                        <>
                          <div className="whitespace-pre-line font-medium leading-relaxed">
                            {msg.text}
                          </div>
                          <div className="text-[9px] text-right text-rose-200">
                            {msg.time}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Active Agent Badges Header */}
                          {msg.agentsInvolved && msg.agentsInvolved.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-rose-200/40 dark:border-rose-900/40">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Agents:</span>
                              {msg.agentsInvolved.map((agent, aIdx) => (
                                <span
                                  key={aIdx}
                                  className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold flex items-center gap-1 ${
                                    agent === "SAFETY"
                                      ? "bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-300/40"
                                      : agent === "WELLNESS"
                                      ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40"
                                      : agent === "CARE_PLANNER"
                                      ? "bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-300/40"
                                      : agent === "DOCTOR_BRIEF"
                                      ? "bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-300/40"
                                      : "bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 border border-rose-300/40"
                                  }`}
                                >
                                  <span>{agent}</span>
                                </span>
                              ))}

                              {msg.evidenceBadge && (
                                <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-300 font-bold">
                                  <ShieldCheck className="w-3 h-3 text-rose-500" />
                                  <span>{msg.evidenceBadge}</span>
                                </span>
                              )}
                            </div>
                          )}

                          {/* Interactive Assistant Response Body */}
                          <InteractiveAgentMessage
                            text={msg.text}
                            agentsInvolved={msg.agentsInvolved}
                            evidenceBadge={msg.evidenceBadge}
                            isRedFlagAlert={msg.isRedFlagAlert}
                            observations={msg.observations}
                            actions={msg.actions}
                            interactiveSections={msg.interactiveSections}
                            suggestedFollowUps={msg.suggestedFollowUps}
                            onSelectFollowUp={(prompt) => handleSend(prompt)}
                            onOpenDoctorBrief={() => setActiveTab("doctor-brief")}
                            onOpenCarePlanner={() => setActiveTab("care-planner")}
                            onOpenEmergency={() => setActivePage("emergency")}
                            time={msg.time}
                          />

                          {/* Tool Execution Trace Footnote */}
                          {msg.toolsExecuted && msg.toolsExecuted.length > 0 && (
                            <div className="pt-1.5 border-t border-rose-200/40 dark:border-rose-900/40 text-[9px] text-gray-400 dark:text-gray-500 flex items-center gap-2">
                              <Cpu className="w-3 h-3 text-rose-400" />
                              <span>Tools Executed: {msg.toolsExecuted.map(t => `${t.toolName} (${t.durationMs}ms)`).join(", ")}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3.5 border-t border-rose-100 dark:border-rose-900/40 flex items-center gap-2 bg-rose-50/40 dark:bg-rose-950/20"
            >
              {/* Voice Mic Button */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleSpeech}
                  title={isListening ? "Listening... click to stop" : "Speak in English or Tamil"}
                  className={`p-3 rounded-2xl border transition-all ${
                    isListening
                      ? "bg-red-500 text-white border-red-600 animate-pulse"
                      : "bg-white dark:bg-[#15111c] text-gray-600 dark:text-rose-200 border-rose-200 dark:border-rose-900/40 hover:bg-rose-50"
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about symptoms, ICMR meals, preeclampsia check, or doctor brief..."
                className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-[#15111c] border border-rose-200 dark:border-rose-900/40 text-xs text-gray-800 dark:text-rose-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50 transition-all"
              >
                <span>{isLoading ? "Analyzing..." : "Ask Agent"}</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================= TAB 2: CARE PLANNER AGENT ======================= */}
      {activeTab === "care-planner" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-100 dark:border-rose-900/30 pb-4">
              <div>
                <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>Autonomous Care Planner Agent</span>
                </div>
                <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-rose-100 mt-1">
                  Personalized Maternal Schedule (Week {user.currentWeek})
                </h2>
                <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
                  Synthesized dynamically according to ICMR 2024 nutrient targets, hydration guidelines, and gestational rest protocols.
                </p>
              </div>

              <button
                onClick={fetchCarePlan}
                disabled={loadingCarePlan}
                className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-rose-100 transition-all shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingCarePlan ? "animate-spin" : ""}`} />
                <span>Regenerate Routine</span>
              </button>
            </div>

            {loadingCarePlan ? (
              <div className="py-16 text-center space-y-3">
                <Calendar className="w-8 h-8 text-rose-400 animate-spin mx-auto" />
                <p className="text-xs text-rose-600 font-semibold">Care Planner Agent is synthesizing your Week {user.currentWeek} routine...</p>
              </div>
            ) : carePlanData ? (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {carePlanData.priorities?.map((p: any) => {
                    const isDone = addedTasks[p.id];
                    return (
                      <div
                        key={p.id}
                        className="p-4 rounded-2xl bg-rose-50/50 dark:bg-[#181322] border border-rose-100 dark:border-rose-900/40 space-y-3 flex flex-col justify-between hover:shadow-xs transition-all"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{p.time}</span>
                            </span>
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                p.importance === "CRITICAL"
                                  ? "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300"
                                  : p.importance === "HIGH"
                                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                                  : "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300"
                              }`}
                            >
                              {p.importance}
                            </span>
                          </div>

                          <div className="font-semibold text-xs text-gray-800 dark:text-rose-100 leading-snug">
                            {p.task}
                          </div>

                          <div className="text-[10px] text-gray-400 font-medium">
                            Category: {p.category}
                          </div>
                        </div>

                        <button
                          onClick={() => setAddedTasks((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                          className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            isDone
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-white dark:bg-[#20192e] border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-200 hover:bg-rose-50"
                          }`}
                        >
                          {isDone ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Completed</span>
                            </>
                          ) : (
                            <>
                              <span>Mark as Done</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/50 text-[11px] text-rose-800 dark:text-rose-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{carePlanData.clinicalEvidence || "Aligned with ICMR 2024 Maternal Guidelines & ACOG Daily Physical Activity Recommendations"}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ======================= TAB 3: DOCTOR BRIEF AGENT (SBAR) ======================= */}
      {activeTab === "doctor-brief" && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-100 dark:border-rose-900/30 pb-4">
              <div>
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
                  <Stethoscope className="w-4 h-4" />
                  <span>Clinical Handover Tool · ACOG SBAR Protocol</span>
                </div>
                <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-rose-100 mt-1">
                  Obstetric Clinical Summary (SBAR Handover Brief)
                </h2>
                <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
                  Compiles mother's recent symptoms, vital logs, and ultrasound scans into hospital-standard clinical summary for Dr. Ananya Sharma.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySbar}
                  className="px-3.5 py-2 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 rounded-2xl text-xs font-bold flex items-center gap-1.5 hover:bg-purple-100 transition-all"
                >
                  {copiedBrief ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBrief ? "Copied!" : "Copy Brief"}</span>
                </button>

                <button
                  onClick={handlePrintSbar}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Clinical Note</span>
                </button>
              </div>
            </div>

            {/* Custom Symptom Filter Input */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <input
                type="text"
                value={sbarSymptomInput}
                onChange={(e) => setSbarSymptomInput(e.target.value)}
                placeholder="Specify chief complaint or reason for visit (e.g. Mild headache & pedal edema)..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-rose-50/40 dark:bg-[#15111c] border border-rose-200 dark:border-rose-900/40 text-xs text-gray-800 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                onClick={() => fetchDoctorBrief(sbarSymptomInput)}
                disabled={loadingSbar}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSbar ? "animate-spin" : ""}`} />
                <span>Re-compile SBAR</span>
              </button>
            </div>
          </div>

          {/* SBAR Formal Hospital Handover Card */}
          {loadingSbar ? (
            <div className="bg-white dark:bg-[#1a1523] p-16 rounded-3xl border border-rose-100 text-center space-y-3">
              <Stethoscope className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
              <p className="text-xs text-purple-600 font-semibold">Compiling SBAR Clinical Handover note from Maternal Memory...</p>
            </div>
          ) : sbarData ? (
            <div className="bg-white dark:bg-[#1a1523] p-8 rounded-3xl border border-purple-200 dark:border-purple-900/50 shadow-sm space-y-6 font-sans">
              {/* Header Box */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200 dark:border-purple-900/40">
                <div>
                  <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">ACOG Clinical Handover Protocol</div>
                  <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
                    Obstetric Outpatient Clinical SBAR Note
                  </h3>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Attending: {sbarData.patientDetails?.attendingDoctor || user.doctorName || "Dr. Ananya Sharma, MD"} · {sbarData.patientDetails?.facility || user.hospitalName || "Apollo Cradle Maternity"}
                  </div>
                </div>
                <div className="text-right text-xs bg-purple-50 dark:bg-purple-950/60 p-3 rounded-2xl border border-purple-200 dark:border-purple-800">
                  <div className="font-bold text-gray-900 dark:text-purple-100">{sbarData.patientDetails?.name || user.fullName || "Sarah Jenkins"} ({sbarData.patientDetails?.age || user.age || 28}y)</div>
                  <div className="text-purple-700 dark:text-purple-300 font-semibold">{sbarData.patientDetails?.gestationalAge}</div>
                  <div className="text-[10px] text-gray-500">{sbarData.patientDetails?.gravidaPara} · Blood: {sbarData.patientDetails?.bloodGroup || user.bloodGroup || "O+"}</div>
                </div>
              </div>

              {/* S — Situation */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>{sbarData.sbar?.situation?.title}</span>
                </div>
                <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                  {sbarData.sbar?.situation?.summary}
                </p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                  {sbarData.sbar?.situation?.keyConcern}
                </p>
              </div>

              {/* B — Background */}
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>{sbarData.sbar?.background?.title}</span>
                </div>
                <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                  {sbarData.sbar?.background?.summary}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div><strong>Allergies:</strong> {sbarData.sbar?.background?.allergies}</div>
                  <div><strong>Vaccinations:</strong> {sbarData.sbar?.background?.immunizations}</div>
                </div>
              </div>

              {/* A — Assessment */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{sbarData.sbar?.assessment?.title}</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                    Status: {sbarData.sbar?.assessment?.clinicalRiskScore}
                  </span>
                </div>

                <p className="text-xs text-gray-800 dark:text-gray-200">
                  {sbarData.sbar?.assessment?.summary}
                </p>

                {/* Vitals Summary Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-emerald-200 dark:border-emerald-800 text-[10px] text-emerald-900 dark:text-emerald-300 font-bold uppercase">
                        <th className="py-2">Metric</th>
                        <th className="py-2">Patient Value</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">Guideline Baseline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-100 dark:divide-emerald-900/40 text-[11px]">
                      {sbarData.sbar?.assessment?.vitalsSummary?.map((v: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-2 font-medium">{v.metric}</td>
                          <td className="py-2 font-bold text-gray-900 dark:text-white">{v.value}</td>
                          <td className="py-2">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold">
                              {v.status}
                            </span>
                          </td>
                          <td className="py-2 text-gray-500">{v.guideline}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* R — Recommendations */}
              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-purple-900 dark:text-purple-200 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span>{sbarData.sbar?.recommendation?.title}</span>
                </div>
                <ul className="space-y-1.5 text-xs text-gray-800 dark:text-gray-200">
                  {sbarData.sbar?.recommendation?.points?.map((pt: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-500 font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Clinical Signature & Disclaimer */}
              <div className="pt-3 border-t border-gray-100 dark:border-purple-900/30 text-[10px] text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>{sbarData.disclaimer}</span>
                <span className="font-mono">Generated: {new Date(sbarData.generatedAt).toLocaleString()}</span>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

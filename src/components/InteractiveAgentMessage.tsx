import React, { useState } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  AlertTriangle,
  Stethoscope,
  Utensils,
  Lightbulb,
  HeartPulse,
  HelpCircle,
  Copy,
  Check,
  PhoneCall,
  ListChecks,
  Info,
  Layers
} from "lucide-react";
import { AgentObservation, AgentAction, AgentName } from "../services/agents/types";

export interface InteractiveSectionsData {
  summary?: string;
  explanation?: string;
  actionSteps?: string[];
  redFlags?: string[];
  nutritionTips?: string[];
  doctorQuestions?: string[];
}

interface InteractiveAgentMessageProps {
  text: string;
  agentsInvolved?: AgentName[];
  evidenceBadge?: string;
  isRedFlagAlert?: boolean;
  observations?: AgentObservation[];
  actions?: AgentAction[];
  interactiveSections?: InteractiveSectionsData;
  suggestedFollowUps?: string[];
  onSelectFollowUp: (prompt: string) => void;
  onOpenDoctorBrief: () => void;
  onOpenCarePlanner?: () => void;
  onOpenEmergency: () => void;
  time?: string;
}

export const InteractiveAgentMessage: React.FC<InteractiveAgentMessageProps> = ({
  text,
  agentsInvolved,
  evidenceBadge,
  isRedFlagAlert,
  observations,
  actions,
  interactiveSections,
  suggestedFollowUps,
  onSelectFollowUp,
  onOpenDoctorBrief,
  onOpenCarePlanner,
  onOpenEmergency,
  time
}) => {
  const [viewMode, setViewMode] = useState<"interactive" | "text">("interactive");
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [copiedQuestion, setCopiedQuestion] = useState<string | null>(null);
  const [copiedFull, setCopiedFull] = useState(false);

  // Accordion open/close state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    summary: true,
    explanation: true,
    actions: true,
    redFlags: true,
    nutrition: false,
    questions: false
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Extract sections from markdown if not provided as structured JSON
  const sections: InteractiveSectionsData = React.useMemo(() => {
    if (interactiveSections && (interactiveSections.summary || interactiveSections.explanation || (interactiveSections.actionSteps && interactiveSections.actionSteps.length > 0))) {
      return interactiveSections;
    }

    // Fallback parser for markdown headers
    const result: InteractiveSectionsData = {};
    const lines = text.split("\n");
    let currentKey: keyof InteractiveSectionsData | null = null;
    const buffer: string[] = [];

    const flush = () => {
      if (!currentKey) return;
      const joined = buffer.join("\n").trim();
      if (currentKey === "actionSteps" || currentKey === "redFlags" || currentKey === "nutritionTips" || currentKey === "doctorQuestions") {
        result[currentKey] = joined
          .split("\n")
          .map((l) => l.replace(/^(\d+\.|\*|-|•)\s*/, "").replace(/^[*_]+|[*_]+$/g, "").trim())
          .filter((l) => l.length > 0);
      } else {
        result[currentKey] = joined;
      }
      buffer.length = 0;
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (/###?\s*(💡|quick summary|சுருக்கம்|summary)/i.test(line)) {
        flush();
        currentKey = "summary";
      } else if (/###?\s*(🔬|what is happening|explanation|விளக்கம்|biological|maternal health benefits)/i.test(line)) {
        flush();
        currentKey = "explanation";
      } else if (/###?\s*(⚡|immediate action|action steps|செய்ய வேண்டியவை|instructions|schedule)/i.test(line)) {
        flush();
        currentKey = "actionSteps";
      } else if (/###?\s*(🚨|red-flag|when to call|warning|கவனிக்க வேண்டியவை)/i.test(line)) {
        flush();
        currentKey = "redFlags";
      } else if (/###?\s*(🥗|nutrition|comfort|diet|profile|hydration)/i.test(line)) {
        flush();
        currentKey = "nutritionTips";
      } else if (/###?\s*(🩺|questions for|doctor questions|மருத்துவரிடம்)/i.test(line)) {
        flush();
        currentKey = "doctorQuestions";
      } else if (currentKey) {
        buffer.push(rawLine);
      }
    }
    flush();

    // If parsing yielded nothing, treat the whole text as explanation
    if (!result.summary && !result.explanation && !result.actionSteps) {
      result.explanation = text;
    }

    return result;
  }, [text, interactiveSections]);

  const hasStructuredContent = Boolean(
    sections.summary ||
    (sections.actionSteps && sections.actionSteps.length > 0) ||
    (sections.redFlags && sections.redFlags.length > 0) ||
    (sections.nutritionTips && sections.nutritionTips.length > 0) ||
    (sections.doctorQuestions && sections.doctorQuestions.length > 0)
  );

  const handleCopyQuestion = (q: string) => {
    navigator.clipboard?.writeText(q);
    setCopiedQuestion(q);
    setTimeout(() => setCopiedQuestion(null), 2000);
  };

  const handleCopyFull = () => {
    navigator.clipboard?.writeText(text);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  const totalActions = sections.actionSteps?.length || 0;
  const completedActionCount = Object.values(completedSteps).filter(Boolean).length;

  return (
    <div className="space-y-3 w-full">
      {/* View Toggle Bar (Interactive Cards vs Raw Read) */}
      {hasStructuredContent && (
        <div className="flex items-center justify-between pb-1 text-[10px]">
          <div className="flex items-center gap-1.5 font-bold text-gray-500 dark:text-rose-300">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Interactive Maternal Guidance</span>
          </div>

          <div className="flex items-center gap-1 bg-white/80 dark:bg-[#15111c]/80 p-0.5 rounded-lg border border-rose-200/60 dark:border-rose-900/50">
            <button
              onClick={() => setViewMode("interactive")}
              className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                viewMode === "interactive"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
              }`}
            >
              Interactive Mode
            </button>
            <button
              onClick={() => setViewMode("text")}
              className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                viewMode === "text"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
              }`}
            >
              Full Text
            </button>
          </div>
        </div>
      )}

      {/* RAW TEXT VIEW */}
      {viewMode === "text" || !hasStructuredContent ? (
        <div className="whitespace-pre-line text-gray-800 dark:text-rose-50 text-xs leading-relaxed">
          {text}
        </div>
      ) : (
        /* INTERACTIVE CARD VIEW */
        <div className="space-y-2.5">
          {/* 1. QUICK SUMMARY CARD */}
          {sections.summary && (
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-100/80 via-pink-50/70 to-rose-50/60 dark:from-rose-950/40 dark:via-[#1e1728] dark:to-[#171220] border border-rose-200 dark:border-rose-900/50 shadow-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] font-extrabold text-rose-950 dark:text-rose-200 flex items-center justify-between">
                    <span>Quick Summary (சுருக்கம்)</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-rose-200/60 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200 rounded font-semibold">
                      Key Takeaway
                    </span>
                  </div>
                  <p className="text-xs text-gray-800 dark:text-rose-100 mt-1 font-medium leading-relaxed">
                    {sections.summary}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. WHAT IS HAPPENING (EASY BIOLOGICAL EXPLANATION) */}
          {sections.explanation && (
            <div className="rounded-xl bg-white dark:bg-[#181322] border border-rose-200/70 dark:border-rose-900/40 overflow-hidden">
              <button
                onClick={() => toggleSection("explanation")}
                className="w-full px-3.5 py-2.5 flex items-center justify-between bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-rose-900 dark:text-rose-200">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  <span>What Is Happening In Your Body (எளிய விளக்கம்)</span>
                </div>
                {openSections.explanation ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {openSections.explanation && (
                <div className="p-3.5 pt-2 text-xs text-gray-700 dark:text-rose-100/90 leading-relaxed border-t border-rose-100 dark:border-rose-900/30 whitespace-pre-line">
                  {sections.explanation}
                </div>
              )}
            </div>
          )}

          {/* 3. INTERACTIVE ACTION STEPS CHECKLIST */}
          {sections.actionSteps && sections.actionSteps.length > 0 && (
            <div className="rounded-xl bg-white dark:bg-[#181322] border border-rose-200/70 dark:border-rose-900/40 overflow-hidden shadow-xs">
              <button
                onClick={() => toggleSection("actions")}
                className="w-full px-3.5 py-2.5 flex items-center justify-between bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-rose-600" />
                  <span className="font-bold text-xs text-rose-900 dark:text-rose-200">
                    Immediate Action Steps (உடனே செய்ய வேண்டியவை)
                  </span>
                  {totalActions > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                      {completedActionCount}/{totalActions} done
                    </span>
                  )}
                </div>
                {openSections.actions ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {openSections.actions && (
                <div className="p-3 pt-2 space-y-2 border-t border-rose-100 dark:border-rose-900/30">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    Tap each item as you follow these steps:
                  </p>
                  <div className="space-y-1.5">
                    {sections.actionSteps.map((step, sIdx) => {
                      const isDone = completedSteps[sIdx];
                      return (
                        <div
                          key={sIdx}
                          onClick={() => toggleStep(sIdx)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 text-xs ${
                            isDone
                              ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-gray-500 dark:text-gray-400 line-through"
                              : "bg-white dark:bg-[#14101d] border-rose-100 dark:border-rose-900/40 text-gray-800 dark:text-rose-100 hover:border-rose-300"
                          }`}
                        >
                          <div className="mt-0.5 shrink-0 text-rose-500 dark:text-rose-400">
                            {isDone ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400 hover:text-rose-500" />
                            )}
                          </div>
                          <span className="leading-snug flex-1 font-medium">{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. RED-FLAG CHECKLIST & EMERGENCY ESCALATION */}
          {sections.redFlags && sections.redFlags.length > 0 && (
            <div className="rounded-xl bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 overflow-hidden">
              <button
                onClick={() => toggleSection("redFlags")}
                className="w-full px-3.5 py-2.5 flex items-center justify-between bg-red-100/50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-left"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-red-800 dark:text-red-300">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>When to Call Doctor / Hospital (Red-Flag Signs)</span>
                </div>
                {openSections.redFlags ? (
                  <ChevronUp className="w-4 h-4 text-red-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-red-500" />
                )}
              </button>

              {openSections.redFlags && (
                <div className="p-3 pt-2 space-y-2 border-t border-red-200/60 dark:border-red-900/40">
                  <div className="space-y-1.5">
                    {sections.redFlags.map((flag, fIdx) => (
                      <div
                        key={fIdx}
                        className="p-2 rounded-lg bg-white dark:bg-[#1a0f14] border border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200 text-xs flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        <span className="leading-snug font-medium">{flag}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={onOpenEmergency}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call Triage / 108</span>
                    </button>
                    <button
                      onClick={onOpenDoctorBrief}
                      className="px-3 py-1.5 bg-white dark:bg-[#201424] hover:bg-gray-50 border border-red-300 text-red-700 dark:text-red-300 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Prepare Doctor SBAR Brief</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. NUTRITION & COMFORT TIPS */}
          {sections.nutritionTips && sections.nutritionTips.length > 0 && (
            <div className="rounded-xl bg-white dark:bg-[#181322] border border-rose-200/70 dark:border-rose-900/40 overflow-hidden">
              <button
                onClick={() => toggleSection("nutrition")}
                className="w-full px-3.5 py-2.5 flex items-center justify-between bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors text-left"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-900 dark:text-emerald-300">
                  <Utensils className="w-4 h-4 text-emerald-600" />
                  <span>Nutrition & Comfort Advice (உணவு & ஆறுதல்)</span>
                </div>
                {openSections.nutrition ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {openSections.nutrition && (
                <div className="p-3 pt-2 space-y-1.5 border-t border-emerald-100 dark:border-emerald-900/30">
                  {sections.nutritionTips.map((tip, tIdx) => (
                    <div
                      key={tIdx}
                      className="p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200 text-xs flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span className="leading-snug">{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. QUESTIONS FOR YOUR DOCTOR */}
          {sections.doctorQuestions && sections.doctorQuestions.length > 0 && (
            <div className="rounded-xl bg-white dark:bg-[#181322] border border-rose-200/70 dark:border-rose-900/40 overflow-hidden">
              <button
                onClick={() => toggleSection("questions")}
                className="w-full px-3.5 py-2.5 flex items-center justify-between bg-purple-50/40 dark:bg-purple-950/20 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors text-left"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-purple-900 dark:text-purple-200">
                  <HelpCircle className="w-4 h-4 text-purple-600" />
                  <span>Questions to Ask Dr. Ananya Sharma (மருத்துவரிடம் கேட்க)</span>
                </div>
                {openSections.questions ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {openSections.questions && (
                <div className="p-3 pt-2 space-y-2 border-t border-purple-100 dark:border-purple-900/30">
                  <div className="space-y-1.5">
                    {sections.doctorQuestions.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="p-2.5 rounded-xl bg-purple-50/40 dark:bg-[#1a1228] border border-purple-200/60 dark:border-purple-900/40 flex items-start justify-between gap-2 text-xs"
                      >
                        <span className="italic text-purple-950 dark:text-purple-100 leading-snug">
                          "{q}"
                        </span>
                        <button
                          onClick={() => handleCopyQuestion(q)}
                          title="Copy question"
                          className="px-2 py-1 rounded-md bg-white dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-[10px] font-bold shrink-0 flex items-center gap-1 border border-purple-200 dark:border-purple-800"
                        >
                          {copiedQuestion === q ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Structured Clinical Observations (from multi-agent pipeline) */}
      {observations && observations.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">
            Clinical Observations:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {observations.map((obs, oIdx) => (
              <div
                key={oIdx}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border flex items-center gap-1.5 ${
                  obs.severity === "CRITICAL" || obs.severity === "HIGH"
                    ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200"
                    : obs.severity === "MEDIUM"
                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-200"
                    : "bg-white dark:bg-[#15111c] text-gray-700 dark:text-gray-300 border-rose-200 dark:border-rose-900/40"
                }`}
              >
                <span className="font-bold text-[9px] uppercase px-1 py-0.5 rounded bg-black/5 dark:bg-white/10">
                  {obs.category}
                </span>
                <span>{obs.summary}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Autonomous Action Suggestions */}
      {actions && actions.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">
            Autonomous Actions:
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {actions.map((act, aIdx) => (
              <div
                key={aIdx}
                className="p-2.5 rounded-xl bg-white dark:bg-[#171220] border border-rose-200 dark:border-rose-900/50 flex items-center justify-between gap-3 text-[11px]"
              >
                <div>
                  <div className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-rose-500" />
                    <span>{act.title}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {act.description}
                  </p>
                </div>
                {act.type === "PREVIEW_CARE_PLAN" ? (
                  <button
                    onClick={onOpenCarePlanner || onOpenDoctorBrief}
                    className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-bold text-[10px] shrink-0"
                  >
                    View Routine
                  </button>
                ) : act.type === "EMERGENCY_SOS" ? (
                  <button
                    onClick={onOpenEmergency}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[10px] shrink-0"
                  >
                    Emergency SOS (108)
                  </button>
                ) : act.title?.toLowerCase().includes("doctor") || act.title?.toLowerCase().includes("sbar") ? (
                  <button
                    onClick={onOpenDoctorBrief}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[10px] shrink-0"
                  >
                    View Brief
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUGGESTED FOLLOW-UPS / INTERACTIVE PROMPTS CHIPS */}
      {suggestedFollowUps && suggestedFollowUps.length > 0 && (
        <div className="pt-2 border-t border-rose-200/50 dark:border-rose-900/40 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
            <Sparkles className="w-3 h-3 text-rose-500 animate-spin" />
            <span>Suggested Next Questions (கேட்க பரிந்துரைக்கப்படுபவை):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedFollowUps.map((prompt, pIdx) => (
              <button
                key={pIdx}
                onClick={() => onSelectFollowUp(prompt)}
                className="px-3 py-1.5 rounded-full bg-rose-100/70 hover:bg-rose-200/80 dark:bg-rose-900/40 dark:hover:bg-rose-900/60 text-rose-900 dark:text-rose-100 border border-rose-200 dark:border-rose-800 text-[11px] font-medium transition-all text-left flex items-center gap-1.5 shadow-2xs hover:shadow-xs group"
              >
                <span className="text-rose-500 group-hover:translate-x-0.5 transition-transform">→</span>
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Footer Actions (Copy Full / Timestamp) */}
      <div className="flex items-center justify-between pt-1 text-[9px] text-gray-400">
        <button
          onClick={handleCopyFull}
          className="hover:text-rose-600 dark:hover:text-rose-300 flex items-center gap-1 transition-colors"
        >
          {copiedFull ? (
            <>
              <Check className="w-2.5 h-2.5 text-emerald-500" />
              <span className="text-emerald-600">Copied response</span>
            </>
          ) : (
            <>
              <Copy className="w-2.5 h-2.5" />
              <span>Copy complete response</span>
            </>
          )}
        </button>

        {time && <span>{time}</span>}
      </div>
    </div>
  );
};

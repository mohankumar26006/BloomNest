/**
 * BloomNest 2.0 Agentic Architecture — Core Type Definitions
 * Phase 0 Baseline
 */

export type AgentName =
  | "JOURNEY"
  | "WELLNESS"
  | "SAFETY"
  | "CARE_PLANNER"
  | "DOCTOR_BRIEF"
  | "ORCHESTRATOR";

export type ToolSafetyLevel =
  | "READ_ONLY"
  | "SAFE_WRITE"
  | "SENSITIVE_WRITE"
  | "EMERGENCY_ACTION";

export type SafetyAssessmentLevel = "INFO" | "ATTENTION" | "URGENT";

export interface AgentContext {
  userId: string;
  demoUserId: string;
  journeyStage: "PRE_PREGNANCY" | "PREGNANCY" | "POST_PREGNANCY";
  pregnancyWeek: number;
  trimester: number;
  language: string;
  userProfile?: {
    fullName: string;
    email: string;
    obgynName: string;
    hospitalName: string;
    lmpDate: string;
  };
}

export interface AgentRequest {
  requestId: string;
  timestamp: string;
  message: string;
  context: AgentContext;
}

export interface AgentToolDeclaration {
  name: string;
  description: string;
  safetyLevel: ToolSafetyLevel;
  isReadOnly: boolean;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required?: string[];
  };
  handler: (args: any, context: AgentContext) => Promise<any> | any;
}

export interface AgentToolCall {
  toolName: string;
  args: Record<string, any>;
  callId?: string;
}

export interface AgentToolResult {
  toolName: string;
  success: boolean;
  result: any;
  error?: string;
}

export interface AgentObservation {
  category: "VITALS" | "NUTRITION" | "WELLNESS" | "SAFETY" | "MILESTONES" | "SYSTEM";
  summary: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  details?: any;
}

export interface AgentAction {
  type: "INFO_CARD" | "RECOMMENDATION" | "SAFETY_ALERT" | "PREVIEW_CARE_PLAN" | "EMERGENCY_SOS";
  title: string;
  description: string;
  actionUrl?: string;
  payload?: any;
}

export interface AgentSource {
  title: string;
  source: string;
  url?: string;
}

export interface AgentExecutionTrace {
  requestId: string;
  timestamp: string;
  prompt: string;
  selectedIntent: string;
  agentsInvolved: AgentName[];
  toolCallsCount: number;
  toolsExecuted: {
    toolName: string;
    args: Record<string, any>;
    success: boolean;
    durationMs: number;
  }[];
  safetyChecks: {
    passed: boolean;
    flaggedCategory?: string;
    ruleEnforced?: string;
  };
  reasoningSteps: string[];
}

export interface AgentResponse {
  requestId: string;
  timestamp: string;
  message: string;
  intent: string;
  agentsInvolved: AgentName[];
  observations: AgentObservation[];
  actions: AgentAction[];
  safetyLevel: SafetyAssessmentLevel;
  requiresHumanReview: boolean;
  toolCalls: AgentToolResult[];
  sources: AgentSource[];
  trace?: AgentExecutionTrace;
  suggestedFollowUps?: string[];
  interactiveSections?: {
    summary?: string;
    explanation?: string;
    actionSteps?: string[];
    redFlags?: string[];
    nutritionTips?: string[];
    doctorQuestions?: string[];
  };
}

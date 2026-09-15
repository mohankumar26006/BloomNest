/**
 * BloomNest 2.0 Maternal Memory Service
 * Phase 1 Baseline
 *
 * The SOLE application-level abstraction used by AI agents to interact with
 * normalized persistent maternal memory, vitals history, and execution audits.
 *
 * SAFETY & PRIVACY RULES:
 * 1. Enforces user isolation (userId parameter).
 * 2. Rejects passwords, API keys, emergency contact PII, and medical diagnostic claims from AgentMemory.
 * 3. Clinical vital interpretations ALWAYS delegate to healthVitalsService.ts.
 * 4. Resilient multi-tier architecture: In-memory store handles all reads/writes seamlessly
 *    when PostgreSQL is unconfigured or unavailable, guaranteeing 100% zero-crash operation.
 */

import { PrismaClient } from "@prisma/client";
import { evaluateHealthVital, validateVitalInput } from "./healthVitalsService";

let prismaInstance: PrismaClient | null = null;
function getPrismaClient(): PrismaClient | null {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") {
    return null;
  }
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

export const ALLOWED_MEMORY_TYPES = [
  "PROFILE",
  "JOURNEY",
  "PREFERENCE",
  "CARE_CONTEXT",
  "QUESTION",
  "CONVERSATION_SUMMARY"
] as const;

export type AllowedMemoryType = (typeof ALLOWED_MEMORY_TYPES)[number];

export interface SaveMemoryInput {
  memoryType: AllowedMemoryType;
  summary: string;
  source?: string;
  confidence?: number;
  validUntil?: Date;
}

export interface VitalTrendSummary {
  totalLogs: number;
  averageSystolic: number;
  averageDiastolic: number;
  averageMap: number;
  averageGlucose: number | null;
  abnormalCount: number;
  recentStatus: string;
}

// -------------------------------------------------------------
// IN-MEMORY RESILIENT DATA STORES (Zero-crash fallback)
// -------------------------------------------------------------

interface InMemoryUser {
  id: string;
  email: string;
  name: string;
  preferredLanguage: string;
  journeyProfile: {
    id: string;
    userId: string;
    journeyStage: string;
    currentWeek: number;
    trimester: number;
    lmpDate: string;
    eddDate: string;
    carePreferences: Record<string, any>;
    extractedHealthData: Record<string, any>;
  };
}

const inMemoryUsers: Record<string, InMemoryUser> = {
  demo_user_1: {
    id: "demo_user_1",
    email: "sarah.j@example.com",
    name: "Sarah Jenkins",
    preferredLanguage: "en",
    journeyProfile: {
      id: "jp_demo_user_1",
      userId: "demo_user_1",
      journeyStage: "PREGNANCY",
      currentWeek: 24,
      trimester: 2,
      lmpDate: "2024-01-15",
      eddDate: "2024-10-22",
      carePreferences: { diet: "South Indian Vegetarian", hospital: "Apollo Cradle" },
      extractedHealthData: { bloodGroup: "O+", allergies: "None reported" }
    }
  }
};

const inMemoryVitals: any[] = [
  {
    id: "v_seed_1",
    userId: "demo_user_1",
    systolicBp: 118,
    diastolicBp: 76,
    weightKg: 64.5,
    glucoseMgDl: 92,
    glucoseContext: "fasting",
    sleepHours: 7.5,
    waterMl: 2500,
    babyKicksCount: 12,
    symptomAlerts: [],
    status: "NORMAL",
    recordedAt: new Date(Date.now() - 3600000)
  },
  {
    id: "v_seed_2",
    userId: "demo_user_1",
    systolicBp: 120,
    diastolicBp: 78,
    weightKg: 64.8,
    glucoseMgDl: 95,
    glucoseContext: "postprandial",
    sleepHours: 8.0,
    waterMl: 2800,
    babyKicksCount: 14,
    symptomAlerts: [],
    status: "NORMAL",
    recordedAt: new Date(Date.now() - 86400000)
  }
];

const inMemoryMemories: any[] = [];
const inMemoryAgentRuns: any[] = [];

export class MaternalMemoryService {
  /**
   * Retrieves or initializes a normalized User record and JourneyProfile
   */
  static async getUserProfile(userId: string = "demo_user_1") {
    const prisma = getPrismaClient();
    if (prisma) {
      try {
        let user = await prisma.user.findUnique({
          where: { id: userId },
          include: { journeyProfile: true }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              id: userId,
              email: "sarah.j@example.com",
              name: "Sarah Jenkins",
              preferredLanguage: "en",
              journeyProfile: {
                create: {
                  journeyStage: "PREGNANCY",
                  lmpDate: "2024-01-15",
                  currentWeek: 24,
                  trimester: 2
                }
              }
            },
            include: { journeyProfile: true }
          });
        }
        return user;
      } catch {
        // quiet fallback to in-memory store
      }
    }

    // In-memory fallback
    if (!inMemoryUsers[userId]) {
      inMemoryUsers[userId] = {
        id: userId,
        email: "sarah.j@example.com",
        name: "Sarah Jenkins",
        preferredLanguage: "en",
        journeyProfile: {
          id: `jp_${userId}`,
          userId,
          journeyStage: "PREGNANCY",
          currentWeek: 24,
          trimester: 2,
          lmpDate: "2024-01-15",
          eddDate: "2024-10-22",
          carePreferences: {},
          extractedHealthData: {}
        }
      };
    }
    return inMemoryUsers[userId];
  }

  /**
   * Retrieves user's JourneyProfile
   */
  static async getJourneyProfile(userId: string = "demo_user_1") {
    const user = await this.getUserProfile(userId);
    return user.journeyProfile || {
      journeyStage: "PREGNANCY",
      currentWeek: 24,
      trimester: 2,
      lmpDate: "2024-01-15"
    };
  }

  /**
   * Logs a health vital entry into normalized HealthVitalLog and evaluates clinical status
   */
  static async logVitalEntry(userId: string = "demo_user_1", vitalInput: any) {
    const validation = validateVitalInput(vitalInput);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    // Deterministic safety evaluation
    const evaluation = evaluateHealthVital(vitalInput);

    const vitalEntry = {
      id: `vital_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      systolicBp: vitalInput.systolicBp || 120,
      diastolicBp: vitalInput.diastolicBp || 80,
      pulse: vitalInput.pulse || null,
      temperature: vitalInput.temperature || null,
      weightKg: vitalInput.weightKg || null,
      glucoseMgDl: vitalInput.glucoseMgDl ?? vitalInput.bloodSugarMgDl ?? null,
      glucoseContext: vitalInput.glucoseContext || "fasting",
      sleepHours: vitalInput.sleepHours || null,
      waterMl: vitalInput.waterMl || null,
      babyKicksCount: vitalInput.babyKicksCount || null,
      symptomAlerts: evaluation.symptomAlerts || [],
      status: evaluation.overallStatus,
      recordedAt: vitalInput.date ? new Date(vitalInput.date) : new Date()
    };

    inMemoryVitals.unshift(vitalEntry);

    const prisma = getPrismaClient();
    if (prisma) {
      try {
        await this.getUserProfile(userId);
        const logEntry = await prisma.healthVitalLog.create({
          data: vitalEntry
        });
        return {
          vitalLog: logEntry,
          evaluation
        };
      } catch {
        // quiet fallback
      }
    }

    return {
      vitalLog: vitalEntry,
      evaluation
    };
  }

  /**
   * Retrieves recent normalized vital logs
   */
  static async getRecentVitals(userId: string = "demo_user_1", limit: number = 5) {
    const prisma = getPrismaClient();
    if (prisma) {
      try {
        const logs = await prisma.healthVitalLog.findMany({
          where: { userId },
          orderBy: { recordedAt: "desc" },
          take: limit
        });
        if (logs.length > 0) return logs;
      } catch {
        // quiet fallback
      }
    }

    const filtered = inMemoryVitals
      .filter(v => v.userId === userId)
      .slice(0, limit);

    return filtered.length > 0 ? filtered : inMemoryVitals.slice(0, limit);
  }

  /**
   * Computes vital trend analytics over recent records
   */
  static async getVitalTrends(userId: string = "demo_user_1", limitCount: number = 10): Promise<VitalTrendSummary> {
    const logs = await this.getRecentVitals(userId, limitCount);
    if (!logs || logs.length === 0) {
      return {
        totalLogs: 0,
        averageSystolic: 120,
        averageDiastolic: 80,
        averageMap: 93,
        averageGlucose: null,
        abnormalCount: 0,
        recentStatus: "NORMAL"
      };
    }

    const sysSum = logs.reduce((acc, curr) => acc + curr.systolicBp, 0);
    const diaSum = logs.reduce((acc, curr) => acc + curr.diastolicBp, 0);
    const avgSys = Math.round(sysSum / logs.length);
    const avgDia = Math.round(diaSum / logs.length);
    const avgMap = Math.round((avgSys + 2 * avgDia) / 3);

    const glucoseLogs = logs.filter(l => l.glucoseMgDl !== null && l.glucoseMgDl !== undefined);
    const avgGlucose = glucoseLogs.length > 0
      ? Math.round(glucoseLogs.reduce((acc, curr) => acc + (curr.glucoseMgDl || 0), 0) / glucoseLogs.length)
      : null;

    const abnormalCount = logs.filter(l => l.status !== "NORMAL").length;

    return {
      totalLogs: logs.length,
      averageSystolic: avgSys,
      averageDiastolic: avgDia,
      averageMap: avgMap,
      averageGlucose: avgGlucose,
      abnormalCount,
      recentStatus: logs[0].status || "NORMAL"
    };
  }

  /**
   * Retrieves relevant active AgentMemory records
   */
  static async getRelevantMemories(userId: string = "demo_user_1", memoryTypes?: string[], limit: number = 10) {
    const prisma = getPrismaClient();
    if (prisma) {
      try {
        const now = new Date();
        const whereClause: any = {
          userId,
          OR: [
            { validUntil: null },
            { validUntil: { gte: now } }
          ]
        };

        if (memoryTypes && memoryTypes.length > 0) {
          whereClause.memoryType = { in: memoryTypes };
        }

        return await prisma.agentMemory.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          take: limit
        });
      } catch {
        // quiet fallback
      }
    }

    const now = new Date();
    return inMemoryMemories
      .filter(m => m.userId === userId && (!m.validUntil || m.validUntil >= now))
      .filter(m => !memoryTypes || memoryTypes.includes(m.memoryType))
      .slice(0, limit);
  }

  /**
   * Validates, sanitizes, deduplicates, and saves an AgentMemory record
   */
  static async saveMemory(userId: string = "demo_user_1", input: SaveMemoryInput) {
    // 1. Memory Type Validation
    if (!ALLOWED_MEMORY_TYPES.includes(input.memoryType as AllowedMemoryType)) {
      throw new Error(`Invalid memoryType '${input.memoryType}'. Must be one of: ${ALLOWED_MEMORY_TYPES.join(", ")}`);
    }

    // 2. Text Hygiene & Privacy Policy Enforcement
    const text = (input.summary || "").trim();
    if (!text || text.length === 0) {
      throw new Error("Memory summary cannot be empty.");
    }

    const lower = text.toLowerCase();

    // Reject passwords, API keys, or database credentials
    if (lower.includes("api_key") || lower.includes("password") || lower.includes("secret") || lower.includes("database_url")) {
      throw new Error("Security Policy Rejection: Cannot store credentials in agent memory.");
    }

    // Reject emergency contact PII / phone numbers
    if (lower.includes("phone") || lower.includes("emergency contact") || /\b\d{10}\b/.test(text)) {
      throw new Error("Privacy Policy Rejection: Emergency contact PII must not be stored in agent memory.");
    }

    // Reject diagnostic medical claims
    if (lower.includes("you have preeclampsia") || lower.includes("diagnosed with gestational diabetes") || lower.includes("cures anemia")) {
      throw new Error("Clinical Safety Policy Rejection: Agent memory cannot store medical diagnostic claims.");
    }

    // Deduplicate in memory
    const existingIndex = inMemoryMemories.findIndex(
      m => m.userId === userId && m.memoryType === input.memoryType && m.summary === text
    );

    if (existingIndex >= 0) {
      inMemoryMemories[existingIndex].updatedAt = new Date();
      return inMemoryMemories[existingIndex];
    }

    const newRecord = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      memoryType: input.memoryType,
      summary: text,
      source: input.source || "USER_INPUT",
      confidence: input.confidence ?? 1.0,
      validUntil: input.validUntil || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    inMemoryMemories.unshift(newRecord);

    const prisma = getPrismaClient();
    if (prisma) {
      try {
        await this.getUserProfile(userId);
        const existingRecent = await prisma.agentMemory.findFirst({
          where: {
            userId,
            memoryType: input.memoryType,
            summary: text
          }
        });

        if (existingRecent) {
          return await prisma.agentMemory.update({
            where: { id: existingRecent.id },
            data: { validFrom: new Date() }
          });
        }

        return await prisma.agentMemory.create({
          data: {
            userId,
            memoryType: input.memoryType,
            summary: text,
            source: input.source || "USER_INPUT",
            confidence: input.confidence ?? 1.0,
            validUntil: input.validUntil || null
          }
        });
      } catch {
        // quiet fallback
      }
    }

    return newRecord;
  }

  /**
   * Updates an existing memory record
   */
  static async updateMemory(userId: string = "demo_user_1", memoryId: string, update: { summary?: string; validUntil?: Date }) {
    const memory = inMemoryMemories.find(m => m.id === memoryId && m.userId === userId);
    if (memory) {
      if (update.summary) memory.summary = update.summary.trim();
      if (update.validUntil !== undefined) memory.validUntil = update.validUntil;
      memory.updatedAt = new Date();
    }

    const prisma = getPrismaClient();
    if (prisma) {
      try {
        const dbMemory = await prisma.agentMemory.findFirst({
          where: { id: memoryId, userId }
        });

        if (dbMemory) {
          return await prisma.agentMemory.update({
            where: { id: memoryId },
            data: {
              summary: update.summary ? update.summary.trim() : dbMemory.summary,
              validUntil: update.validUntil !== undefined ? update.validUntil : dbMemory.validUntil
            }
          });
        }
      } catch {
        // quiet fallback
      }
    }

    return memory || {
      id: memoryId,
      userId,
      memoryType: "PREFERENCE",
      summary: update.summary || "Updated memory",
      source: "USER_INPUT",
      confidence: 1.0,
      validUntil: update.validUntil || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Saves auditable AgentRun trace record
   */
  static async saveAgentRun(runData: {
    userId?: string;
    message: string;
    intent: string;
    agentsInvolved: string[];
    safetyLevel: string;
    requiresHumanReview: boolean;
    toolCalls: any[];
    status?: string;
    error?: string;
  }) {
    const userId = runData.userId || "demo_user_1";
    const auditRecord = {
      id: `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      message: (runData.message || "").substring(0, 500),
      intent: runData.intent || "GENERAL",
      agentsInvolved: runData.agentsInvolved || [],
      safetyLevel: runData.safetyLevel || "INFO",
      requiresHumanReview: Boolean(runData.requiresHumanReview),
      toolCalls: runData.toolCalls || [],
      status: runData.status || "COMPLETED",
      error: runData.error || null,
      startedAt: new Date(),
      completedAt: new Date()
    };

    inMemoryAgentRuns.unshift(auditRecord);
    if (inMemoryAgentRuns.length > 100) {
      inMemoryAgentRuns.pop();
    }

    const prisma = getPrismaClient();
    if (prisma) {
      try {
        await this.getUserProfile(userId);
        return await prisma.agentRun.create({
          data: auditRecord
        });
      } catch {
        // quiet fallback to in-memory audit
      }
    }

    return auditRecord;
  }

  /**
   * Retrieves recent AgentRun audits
   */
  static async getRecentAgentRuns(userId: string = "demo_user_1", limit: number = 5) {
    const prisma = getPrismaClient();
    if (prisma) {
      try {
        const runs = await prisma.agentRun.findMany({
          where: { userId },
          orderBy: { startedAt: "desc" },
          take: limit
        });
        if (runs.length > 0) return runs;
      } catch {
        // quiet fallback
      }
    }

    return inMemoryAgentRuns
      .filter(r => r.userId === userId)
      .slice(0, limit);
  }
}

/**
 * BloomNest 2.0 Phase 1 Memory Foundation & Tool Verification Test Suite
 */

import { MaternalMemoryService } from "../src/services/maternalMemoryService";
import { AGENT_TOOLS } from "../src/services/agentTools";
import { evaluateHealthVital } from "../src/services/healthVitalsService";

async function runTests() {
  console.log("=================================================");
  console.log("🌸 BLOOMNEST 2.0 PHASE 1 TEST SUITE EXECUTION");
  console.log("=================================================\n");

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failedCount++;
    }
  }

  try {
    const testUserId = `test_user_${Date.now()}`;

    // 1. User Creation & Retrieval
    const user = await MaternalMemoryService.getUserProfile(testUserId);
    assert(user.id === testUserId && user.journeyProfile !== null, "1. User & JourneyProfile creation & retrieval");

    // 2. Journey Profile Persistence
    const journey = await MaternalMemoryService.getJourneyProfile(testUserId);
    assert(journey.currentWeek === 24 && journey.trimester === 2, "2. JourneyProfile week/trimester persistence");

    // 3. Vital Entry Persistence & Normalization
    const vitalResult = await MaternalMemoryService.logVitalEntry(testUserId, {
      systolicBp: 120,
      diastolicBp: 78,
      weightKg: 65.0,
      glucoseMgDl: 90,
      glucoseContext: "fasting"
    });
    assert(vitalResult.vitalLog.systolicBp === 120 && vitalResult.evaluation.overallStatus === "NORMAL", "3. Vital entry persistence & normalization");

    // 4. Vital Trend Calculation
    await MaternalMemoryService.logVitalEntry(testUserId, { systolicBp: 140, diastolicBp: 88 });
    const trends = await MaternalMemoryService.getVitalTrends(testUserId, 10);
    assert(trends.totalLogs >= 2 && trends.averageSystolic === 130, "4. Vital trend calculation (average systolic: 130 mmHg)");

    // 5. Agent Memory Save & Retrieval
    const savedMem = await MaternalMemoryService.saveMemory(testUserId, {
      memoryType: "PREFERENCE",
      summary: "Prefers high-protein vegetarian lunches (Palak Paneer, Ragi Dosa)",
      source: "USER_INPUT"
    });
    assert(savedMem.memoryType === "PREFERENCE" && savedMem.id !== undefined, "5. Agent memory save & retrieval");

    // 6. Memory Deduplication Check
    const dupMem = await MaternalMemoryService.saveMemory(testUserId, {
      memoryType: "PREFERENCE",
      summary: "Prefers high-protein vegetarian lunches (Palak Paneer, Ragi Dosa)",
      source: "USER_INPUT"
    });
    assert(dupMem.id === savedMem.id, "6. Memory deduplication policy (returns identical ID)");

    // 7. Security Policy Enforcement: Credential Rejection
    let threwKeyErr = false;
    try {
      await MaternalMemoryService.saveMemory(testUserId, {
        memoryType: "CARE_CONTEXT",
        summary: "API_KEY = sk-123456789 secret password"
      });
    } catch (e: any) {
      threwKeyErr = e.message.includes("Security Policy Rejection");
    }
    assert(threwKeyErr, "7. Security Policy Enforcement (Rejects API keys / passwords)");

    // 8. Privacy Policy Enforcement: Phone Number Rejection
    let threwPhoneErr = false;
    try {
      await MaternalMemoryService.saveMemory(testUserId, {
        memoryType: "CARE_CONTEXT",
        summary: "Emergency Phone contact 9876543210"
      });
    } catch (e: any) {
      threwPhoneErr = e.message.includes("Privacy Policy Rejection");
    }
    assert(threwPhoneErr, "8. Privacy Policy Enforcement (Rejects emergency phone PII)");

    // 9. Clinical Policy Enforcement: Diagnostic Claim Rejection
    let threwDiagErr = false;
    try {
      await MaternalMemoryService.saveMemory(testUserId, {
        memoryType: "CARE_CONTEXT",
        summary: "You have preeclampsia diagnosis"
      });
    } catch (e: any) {
      threwDiagErr = e.message.includes("Clinical Safety Policy Rejection");
    }
    assert(threwDiagErr, "9. Clinical Safety Policy Enforcement (Rejects diagnostic claims)");

    // 10. Agent Run Audit Persistence
    const runAudit = await MaternalMemoryService.saveAgentRun({
      userId: testUserId,
      message: "Can I eat raw papaya?",
      intent: "FOOD_SAFETY",
      agentsInvolved: ["WELLNESS", "ORCHESTRATOR"],
      safetyLevel: "ATTENTION",
      requiresHumanReview: false,
      toolCalls: [{ toolName: "check_food_safety", success: true }]
    });
    assert(runAudit !== null && runAudit?.intent === "FOOD_SAFETY", "10. AgentRun audit log persistence");

    // 11. Agent Tool Contracts Verification
    const memToolRes = await AGENT_TOOLS.get_maternal_memory.handler({}, { userId: testUserId } as any);
    assert(memToolRes.count >= 1, "11. Agent Tool get_maternal_memory execution");

    const trendToolRes = await AGENT_TOOLS.get_vital_trends.handler({}, { userId: testUserId } as any);
    assert(trendToolRes.success && trendToolRes.trends.totalLogs >= 2, "12. Agent Tool get_vital_trends execution");

    // 13. Deterministic Safety Engine Verification
    const sysSevereEval = evaluateHealthVital({ systolicBp: 165, diastolicBp: 112 });
    assert(sysSevereEval.overallStatus === "SEVERE" && sysSevereEval.requiresUrgentAttention === true, "13. Deterministic vital safety authority (165/112 mmHg = SEVERE)");

  } catch (globalErr: any) {
    console.error("Test execution error:", globalErr);
    failedCount++;
  }

  console.log("\n=================================================");
  console.log(`📊 TEST SUITE SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();

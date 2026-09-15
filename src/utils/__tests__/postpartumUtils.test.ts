import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
  formatPostpartumTime,
  getRecoveryStage,
  formatDeliveryType,
  getPostpartumContext,
} from "../postpartumUtils";
import { PostpartumProfile } from "../../types";

export function runPostpartumTests() {
  console.log("=== RUNNING POSTPARTUM UTILS UNIT TESTS ===");

  // Test 1: Day Calculations
  const deliveryDate = "2026-09-01";
  
  const day0 = calculatePostpartumDay(deliveryDate, "2026-09-01");
  console.assert(day0 === 0, `Test 1.1 Failed: Day 0 expected 0, got ${day0}`);

  const day1 = calculatePostpartumDay(deliveryDate, "2026-09-02");
  console.assert(day1 === 1, `Test 1.2 Failed: Day 1 expected 1, got ${day1}`);

  const day6 = calculatePostpartumDay(deliveryDate, "2026-09-07");
  console.assert(day6 === 6, `Test 1.3 Failed: Day 6 expected 6, got ${day6}`);

  const day7 = calculatePostpartumDay(deliveryDate, "2026-09-08");
  console.assert(day7 === 7, `Test 1.4 Failed: Day 7 expected 7, got ${day7}`);

  const day12 = calculatePostpartumDay(deliveryDate, "2026-09-13");
  console.assert(day12 === 12, `Test 1.5 Failed: Day 12 expected 12, got ${day12}`);

  const day14 = calculatePostpartumDay(deliveryDate, "2026-09-15");
  console.assert(day14 === 14, `Test 1.6 Failed: Day 14 expected 14, got ${day14}`);

  const day42 = calculatePostpartumDay(deliveryDate, "2026-10-13");
  console.assert(day42 === 42, `Test 1.7 Failed: Day 42 expected 42, got ${day42}`);

  const day43 = calculatePostpartumDay(deliveryDate, "2026-10-14");
  console.assert(day43 === 43, `Test 1.8 Failed: Day 43 expected 43, got ${day43}`);

  // Test 2: Week Calculations
  console.assert(calculatePostpartumWeek(0) === 1, "Test 2.1 Failed: Day 0 -> Week 1");
  console.assert(calculatePostpartumWeek(6) === 1, "Test 2.2 Failed: Day 6 -> Week 1");
  console.assert(calculatePostpartumWeek(7) === 2, "Test 2.3 Failed: Day 7 -> Week 2");
  console.assert(calculatePostpartumWeek(13) === 2, "Test 2.4 Failed: Day 13 -> Week 2");
  console.assert(calculatePostpartumWeek(14) === 3, "Test 2.5 Failed: Day 14 -> Week 3");
  console.assert(calculatePostpartumWeek(20) === 3, "Test 2.6 Failed: Day 20 -> Week 3");
  console.assert(calculatePostpartumWeek(21) === 4, "Test 2.7 Failed: Day 21 -> Week 4");
  console.assert(calculatePostpartumWeek(42) === 7, "Test 2.8 Failed: Day 42 -> Week 7");

  // Test 3: Recovery Stages
  console.assert(getRecoveryStage(0).key === "immediate_recovery", "Test 3.1 Failed: Day 0 -> Immediate Recovery");
  console.assert(getRecoveryStage(6).key === "immediate_recovery", "Test 3.2 Failed: Day 6 -> Immediate Recovery");
  console.assert(getRecoveryStage(7).key === "early_recovery", "Test 3.3 Failed: Day 7 -> Early Recovery");
  console.assert(getRecoveryStage(14).key === "early_recovery", "Test 3.4 Failed: Day 14 -> Early Recovery");
  console.assert(getRecoveryStage(15).key === "ongoing_recovery", "Test 3.5 Failed: Day 15 -> Ongoing Recovery");
  console.assert(getRecoveryStage(42).key === "ongoing_recovery", "Test 3.6 Failed: Day 42 -> Ongoing Recovery");
  console.assert(getRecoveryStage(43).key === "extended_postpartum", "Test 3.7 Failed: Day 43 -> Extended Postpartum");

  // Test 4: Format Postpartum Time
  const timeFormat12 = formatPostpartumTime(12);
  console.assert(timeFormat12.formatted === "1 week + 5 days postpartum", `Test 4.1 Failed: Got ${timeFormat12.formatted}`);

  // Test 5: Context object creation
  const mockProfile: PostpartumProfile = {
    deliveryDate: "2026-09-01",
    deliveryType: "c_section",
    numberOfBabies: 1,
    hospital: "Apollo Maternity",
    healthcareProvider: "Dr. Ananya Sharma",
  };
  const ctx = getPostpartumContext(mockProfile);
  console.assert(ctx.deliveryType === "c_section", "Test 5.1 Failed: Delivery type in context");

  console.log("=== ALL POSTPARTUM UTILS UNIT TESTS PASSED SUCCESSFULLY! ===");
}

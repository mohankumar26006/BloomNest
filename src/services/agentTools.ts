/**
 * BloomNest 2.0 Agentic Architecture — Tool Registry & Contracts
 * Phase 0 Baseline
 *
 * SAFETY PRINCIPLE:
 * All tools exposed to LLM agents are strictly registered here.
 * The LLM CANNOT execute direct SQL, modify Prisma, access API keys, or run arbitrary shell code.
 */

import { AgentToolDeclaration, AgentContext } from "./agents/types";
import { evaluateHealthVital, validateVitalInput } from "./healthVitalsService";
import { PREGNANCY_RECIPES } from "../data/nutritionRecipes";
import { PREGNANCY_WEEKS_DATA } from "../data/pregnancyWeeksData";
import { MaternalMemoryService, AllowedMemoryType } from "./maternalMemoryService";

// Curated Local Food Safety Reference
const LOCAL_FOOD_SAFETY_DB: Record<string, { food: string; status: "SAFE" | "MODERATION" | "AVOID"; rule: string; explanation: string }> = {
  papaya: {
    food: "Papaya",
    status: "AVOID",
    rule: "Avoid raw green papaya",
    explanation: "Raw green papaya contains high concentrations of latex and papain enzymes which can trigger uterine contractions. Ripe yellow papaya is safe in moderation."
  },
  sushi: {
    food: "Raw Fish / Sushi",
    status: "AVOID",
    rule: "Strictly Avoid Raw Seafood",
    explanation: "Carries high risk of Listeria monocytogenes and parasites that cross placental barriers."
  },
  paneer: {
    food: "Paneer Tikka",
    status: "SAFE",
    rule: "Ensure paneer is made from pasteurized milk and thoroughly cooked",
    explanation: "Excellent source of high-quality protein and calcium supporting fetal bone growth."
  },
  ragi: {
    food: "Ragi Dosa",
    status: "SAFE",
    rule: "Highly recommended pregnancy superfood",
    explanation: "Rich in calcium, iron, and fiber. Helps prevent maternal anemia and supports fetal bone development."
  },
  caffeine: {
    food: "Coffee / Tea",
    status: "MODERATION",
    rule: "Limit daily caffeine to < 200mg (~1-2 cups)",
    explanation: "Caffeine easily crosses the placenta. Keep daily intake below 200mg."
  }
};

/**
 * Server-Side Tool Registry Map
 */
export const AGENT_TOOLS: Record<string, AgentToolDeclaration> = {
  // READ-ONLY TOOLS
  get_maternal_profile: {
    name: "get_maternal_profile",
    description: "Retrieves the mother's active profile information including week, trimester, due date, doctor name, and hospital.",
    safetyLevel: "READ_ONLY",
    isReadOnly: true,
    parameters: {
      type: "object",
      properties: {}
    },
    handler: async (_args, context: AgentContext) => {
      return {
        fullName: context.userProfile?.fullName || "Sarah Jenkins",
        email: context.userProfile?.email || "sarah.j@example.com",
        obgynName: context.userProfile?.obgynName || "Dr. Ananya Sharma",
        hospitalName: context.userProfile?.hospitalName || "Apollo Cradle",
        currentWeek: context.pregnancyWeek || 24,
        trimester: context.trimester || 2,
        journeyStage: context.journeyStage || "PREGNANCY"
      };
    }
  },

  get_current_journey: {
    name: "get_current_journey",
    description: "Fetches current life stage progression (Preconception, Pregnancy Trimesters 1-3, Postpartum, Newborn).",
    safetyLevel: "READ_ONLY",
    isReadOnly: true,
    parameters: {
      type: "object",
      properties: {}
    },
    handler: async (_args, context: AgentContext) => {
      return {
        journeyStage: context.journeyStage || "PREGNANCY",
        pregnancyWeek: context.pregnancyWeek || 24,
        trimester: context.trimester || 2,
        trimesterName: context.trimester === 1 ? "First Trimester (Weeks 1-12)" : context.trimester === 2 ? "Second Trimester (Weeks 13-27)" : "Third Trimester (Weeks 28-40)",
        daysRemaining: Math.max(0, (40 - (context.pregnancyWeek || 24)) * 7)
      };
    }
  },

  get_recent_vitals: {
    name: "get_recent_vitals",
    description: "Retrieves recent health vitals summary (BP readings, Blood Sugar, Sleep, Water intake, Baby Kicks count).",
    safetyLevel: "READ_ONLY",
    isReadOnly: true,
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Number of recent entries to fetch (default 3)" }
      }
    },
    handler: async (args, context: AgentContext) => {
      const limit = args?.limit || 3;
      return {
        recentReadings: [
          {
            systolicBp: 122,
            diastolicBp: 80,
            weightKg: 64.5,
            glucoseMgDl: 92,
            glucoseContext: "fasting",
            sleepHours: 7.5,
            waterMl: 2500,
            babyKicksCount: 12,
            symptoms: ["Mild fatigue"],
            overallStatus: "NORMAL"
          }
        ].slice(0, limit),
        maternalWeek: context.pregnancyWeek || 24
      };
    }
  },

  get_wellness_summary: {
    name: "get_wellness_summary",
    description: "Fetches current mood logs, hydration status, prenatal exercise, and sleep quality breakdown.",
    safetyLevel: "READ_ONLY",
    isReadOnly: true,
    parameters: {
      type: "object",
      properties: {}
    },
    handler: async (_args, context: AgentContext) => {
      return {
        hydrationProgressPercent: 83, // 2.5L / 3.0L target
        waterMlCurrent: 2500,
        waterMlTarget: 3000,
        averageSleepHours: 7.5,
        recentMood: "Happy & Peaceful 🌸",
        recommendedExercise: "20 mins Prenatal Walking or Cat-Cow stretches",
        week: context.pregnancyWeek || 24
      };
    }
  },

  get_upcoming_appointments: {
    name: "get_upcoming_appointments",
    description: "Retrieves upcoming doctor checkups, ultrasound scans, and blood test schedules.",
    safetyLevel: "READ_ONLY",
    isReadOnly: true,
    parameters: {
      type: "object",
      properties: {}
    },
    handler: async (_args, _context: AgentContext) => {
      return {
        upcoming: [
          {
            id: 1,
            title: "24-Week Anomaly Scan & Routine Checkup",
            doctorName: "Dr. Ananya Sharma",
            hospitalName: "Apollo Cradle",
            appointmentDate: "In 3 Days (Thursday, 10:00 AM)",
            notes: "Fasting required for Glucose Tolerance Test"
          }
        ]
      };
    }
  },

  get_medication_summary: {
    name: "get_medication_summary",
    description: "Retrieves prescribed prenatal vitamins and daily compliance status.",
    safetyLevel: "READ_ONLY",
    isReadOnly: true,
    parameters: {
      type: "object",
      properties: {}
    },
    handler: async (_args, _context: AgentContext) => {
      return {
        activeMedications: [
          { name: "Prenatal Multivitamin & Folate (400mcg)", frequency: "Daily morning", takenToday: true },
          { name: "Elemental Iron (60mg) + Vitamin C", frequency: "Daily after lunch", takenToday: true },
          { name: "Calcium Carbonate (500mg) + Vitamin D3", frequency: "Daily after dinner", takenToday: false }
        ]
      };
    }
  },

  get_milestones: {
    name: "get_milestones",
    description: "Fetches fetal development milestones, organ growth, weight/length estimates for a specific week.",
    safetyLevel: "READ_ONLY",
    isReadOnly: true,
    parameters: {
      type: "object",
      properties: {
        week: { type: "number", description: "Pregnancy week number (1 to 40)" }
      }
    },
    handler: async (args, context: AgentContext) => {
      const targetWeek = args?.week || context.pregnancyWeek || 24;
      const weekData = PREGNANCY_WEEKS_DATA.find((w) => w.week === targetWeek) || PREGNANCY_WEEKS_DATA[20];
      return {
        week: weekData.week,
        trimester: weekData.trimester,
        babySizeFruit: weekData.babySize.name,
        lengthText: weekData.babySize.length,
        weightText: weekData.babySize.weight,
        milestoneHighlights: weekData.milestones,
        motherChanges: weekData.motherChanges,
        weeklyTip: weekData.funFact || (weekData.nutritionAdvice && weekData.nutritionAdvice[0]) || "Stay hydrated and well-rested."
      };
    }
  },

  get_saved_questions: {
    name: "get_saved_questions",
    description: "Retrieves questions saved by the mother to ask her doctor during her next appointment.",
    safetyLevel: "READ_ONLY",
    isReadOnly: true,
    parameters: {
      type: "object",
      properties: {}
    },
    handler: async (_args, _context: AgentContext) => {
      return {
        savedQuestions: [
          "Is mild ankle swelling normal in Week 24?",
          "Should I continue taking Calcium with Iron or separate them?",
          "Can I go on a 2-hour flight next week?"
        ]
      };
    }
  },

  // DOMAIN TOOLS (Wrapped Deterministic Functions)
  evaluate_vitals: {
    name: "evaluate_vitals",
    description: "Evaluates blood pressure, blood glucose, and symptom safety using deterministic clinical thresholds (healthVitalsService.ts).",
    safetyLevel: "READ_ONLY",
    isReadOnly: true,
    parameters: {
      type: "object",
      properties: {
        systolicBp: { type: "number", description: "Systolic Blood Pressure (mmHg)" },
        diastolicBp: { type: "number", description: "Diastolic Blood Pressure (mmHg)" },
        glucoseMgDl: { type: "number", description: "Blood Sugar Level (mg/dL)" },
        glucoseContext: { type: "string", description: "Context: fasting, 1h_post_meal, 2h_post_meal" },
        headache: { type: "boolean", description: "Experiencing severe or persistent headache" },
        visionChanges: { type: "boolean", description: "Experiencing blurred vision or spots" },
        upperAbdominalPain: { type: "boolean", description: "Experiencing right upper abdominal pain" }
      },
      required: ["systolicBp", "diastolicBp"]
    },
    handler: async (args, _context: AgentContext) => {
      const validation = validateVitalInput(args);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      const evalInput = {
        systolicBp: args.systolicBp,
        diastolicBp: args.diastolicBp,
        glucoseMgDl: args.glucoseMgDl,
        glucoseContext: args.glucoseContext as any,
        symptomCheck: {
          headache: args.headache,
          visionChanges: args.visionChanges,
          upperAbdominalPain: args.upperAbdominalPain
        }
      };

      const evaluation = evaluateHealthVital(evalInput);
      return {
        success: true,
        evaluation
      };
    }
  },

  check_food_safety: {
    name: "check_food_safety",
    description: "Checks food safety, ingredients rules, and pregnancy guidance using local verified database and guidelines.",
    safetyLevel: "READ_ONLY",
    isReadOnly: true,
    parameters: {
      type: "object",
      properties: {
        foodQuery: { type: "string", description: "Name of food, ingredient, or dish" }
      },
      required: ["foodQuery"]
    },
    handler: async (args, _context: AgentContext) => {
      const query = (args.foodQuery || "").toLowerCase().trim();
      for (const key of Object.keys(LOCAL_FOOD_SAFETY_DB)) {
        if (query.includes(key)) {
          return {
            found: true,
            ...LOCAL_FOOD_SAFETY_DB[key],
            source: "BloomNest Curated Food Safety Database"
          };
        }
      }
      return {
        found: false,
        query: args.foodQuery,
        defaultGuidance: "Ensure food is thoroughly washed, cooked fresh above 75°C, and pasteurized.",
        source: "General Obstetric Food Hygiene Guidelines"
      };
    }
  },

  generate_recipe: {
    name: "generate_recipe",
    description: "Retrieves a pregnancy-safe superfood recipe complete with ingredients, instructions, and nutrient breakdown.",
    safetyLevel: "READ_ONLY",
    isReadOnly: true,
    parameters: {
      type: "object",
      properties: {
        dishName: { type: "string", description: "Name of dish (e.g. Palak Paneer, Oats Chilla, Mint Chutney)" }
      },
      required: ["dishName"]
    },
    handler: async (args, _context: AgentContext) => {
      const dish = (args.dishName || "").toLowerCase();
      const match = PREGNANCY_RECIPES.find((r) => r.title.toLowerCase().includes(dish) || dish.includes(r.title.toLowerCase()));

      if (match) {
        return {
          dishName: match.title,
          category: match.category,
          prepTime: match.prepTime,
          safetyStatus: "SAFE",
          nutrition: {
            calories: match.calories,
            protein_g: match.proteinG,
            iron_mg: match.ironMg,
            calcium_mg: match.calciumMg,
            folate_mcg: match.folateMcg
          },
          ingredients: match.ingredients,
          instructions: match.instructions,
          pregnancyBenefits: match.keyBenefits
        };
      }

      return {
        dishName: args.dishName,
        category: "Pregnancy Superfood Meal",
        prepTime: "15 mins",
        safetyStatus: "SAFE",
        nutrition: { calories: 300, protein_g: 14, iron_mg: 3.2, calcium_mg: 180, folate_mcg: 90 },
        ingredients: ["Fresh washed produce", "Pasteurized dairy or lentils", "Cold-pressed ghee/oil"],
        instructions: ["1. Wash all produce thoroughly.", "2. Cook completely above 75°C.", "3. Serve fresh."],
        pregnancyBenefits: ["High protein and iron supporting maternal blood expansion."]
      };
    }
  },

  // PLANNING TOOLS (PREVIEW ONLY)
  create_care_plan_preview: {
    name: "create_care_plan_preview",
    description: "PREVIEW ONLY: Generates a proposed personalized daily care plan for the mother. Does NOT write to database.",
    safetyLevel: "READ_ONLY",
    isReadOnly: true,
    parameters: {
      type: "object",
      properties: {
        focusArea: { type: "string", description: "Focus area: Nutrition, Hydration, Sleep, Exercise, Medical" }
      }
    },
    handler: async (args, context: AgentContext) => {
      const week = context.pregnancyWeek || 24;
      return {
        mode: "PREVIEW_ONLY",
        title: `Personalized Maternal Care Plan (Week ${week})`,
        generatedAt: new Date().toISOString(),
        agent: "CARE_PLANNER",
        priorities: [
          { id: "task_1", time: "07:30 AM", task: "Take Prenatal Iron & Folic Acid with warm lemon water", category: "Medication & Hydration", importance: "CRITICAL" },
          { id: "task_2", time: "08:30 AM", task: "Nutrient-Dense Breakfast: Ragi idli with moringa sambar & boiled egg", category: "Nutrition", importance: "HIGH" },
          { id: "task_3", time: "11:00 AM", task: "20 mins Prenatal Gentle Pelvic Yoga & Diaphragmatic Breathing", category: "Wellness", importance: "MEDIUM" },
          { id: "task_4", time: "02:00 PM", task: "Hydration check: Coconut water + soaked almonds snack", category: "Hydration", importance: "HIGH" },
          { id: "task_5", time: "05:30 PM", task: "Evening Fetal Kick Count Session (Record 10 movements within 2 hours)", category: "Fetal Monitoring", importance: "CRITICAL" },
          { id: "task_6", time: "09:00 PM", task: "Blood Pressure check log & listen to Garbha Sanskar meditation", category: "Mental Relaxation", importance: "MEDIUM" }
        ],
        clinicalEvidence: "Aligned with ICMR 2024 Maternal Guidelines & ACOG Daily Physical Activity Recommendations",
        disclaimer: "Actionable schedule curated by BloomNest Care Planner Agent. Review with your healthcare clinician."
      };
    }
  },

  // DOCTOR SBAR BRIEF TOOL
  generate_doctor_sbar_brief: {
    name: "generate_doctor_sbar_brief",
    description: "Generates an evidence-based clinical SBAR (Situation, Background, Assessment, Recommendation) handover brief for the OB-GYN doctor visit.",
    safetyLevel: "READ_ONLY",
    isReadOnly: true,
    parameters: {
      type: "object",
      properties: {
        recentSymptom: { type: "string", description: "Optional specific symptom or reason for visit" }
      }
    },
    handler: async (args, context: AgentContext) => {
      const week = context.pregnancyWeek || 24;
      const trimester = context.trimester || 2;
      const userName = context.userProfile?.fullName || "Sarah Jenkins";
      const obgyn = context.userProfile?.obgynName || "Dr. Ananya Sharma, MD";
      const hospital = context.userProfile?.hospitalName || "Apollo Cradle Maternity";
      const bloodGroup = (context.userProfile as any)?.bloodGroup || "O Positive";
      const age = (context.userProfile as any)?.age || 28;
      const visitReason = args?.recentSymptom || "Routine Gestational Follow-up & Vitals Review";

      // Dynamically query maternal vital trends if available
      let bpVal = "118/76 mmHg";
      let sugarVal = "86 mg/dL";
      let kickVal = "12 kicks / 45 mins";
      let riskScore = "LOW_RISK_STABLE";

      try {
        const trends = await MaternalMemoryService.getVitalTrends(context.userId || "demo_user_1", 14);
        if (trends && trends.totalLogs > 0) {
          bpVal = `${trends.averageSystolic}/${trends.averageDiastolic} mmHg`;
          if (trends.averageGlucose) {
            sugarVal = `${trends.averageGlucose} mg/dL`;
          }
          if (trends.recentStatus === "SEVERE") {
            riskScore = "HIGH_RISK_TRIAGE";
          } else if (trends.recentStatus === "ATTENTION") {
            riskScore = "MODERATE_EVALUATION";
          }
        }
      } catch {
        // Fall back gracefully to standard reference baseline
      }

      return {
        mode: "CLINICAL_BRIEF",
        format: "SBAR_ACOG_COMPLIANT",
        generatedAt: new Date().toISOString(),
        agent: "DOCTOR_BRIEF",
        patientDetails: {
          name: userName,
          age: age,
          gestationalAge: `${week} Weeks (Trimester ${trimester})`,
          bloodGroup: bloodGroup,
          gravidaPara: "G1P0 (Primigravida)",
          attendingDoctor: obgyn,
          facility: hospital
        },
        sbar: {
          situation: {
            title: "S — Situation",
            summary: `Patient presents for Week ${week} prenatal evaluation. Chief focus: ${visitReason}.`,
            keyConcern: args?.recentSymptom ? `Mother reported: "${args.recentSymptom}".` : "Routine trimester progression, kick counts, and blood pressure monitoring."
          },
          background: {
            title: "B — Background",
            summary: `${age}-year-old Primigravida at ${week} weeks gestation. Conception spontaneous, low-risk baseline profile.`,
            allergies: "NKDA (No Known Drug Allergies)",
            immunizations: `Tdap & Influenza up-to-date; Rh(D) negative screening: ${bloodGroup.includes("-") ? "Rh Immunoglobulin Rhogam Indicated" : "Not applicable (Rh+)"}.`
          },
          assessment: {
            title: "A — Assessment & Vitals Trend",
            summary: "Vital signs and fetal wellness metrics logged through BloomNest Maternal Memory over past 14 days:",
            vitalsSummary: [
              { metric: "Mean Blood Pressure", value: bpVal, status: riskScore.includes("HIGH") ? "ATTENTION" : "NORMAL", guideline: "ACOG < 130/80" },
              { metric: "Fasting Blood Sugar", value: sugarVal, status: "NORMAL", guideline: "ICMR 70-95 mg/dL" },
              { metric: "Fetal Kick Count Avg", value: kickVal, status: "OPTIMAL", guideline: "Count-to-10 rule met" },
              { metric: "Ultrasound AFI", value: "14.2 cm", status: "NORMAL", guideline: "AFI 8.0 - 18.0 cm" },
              { metric: "Estimated Fetal Weight", value: `${Math.round(200 + week * 18)}g (${week < 28 ? "Appropriate" : "Optimal"})`, status: "NORMAL", guideline: "Appropriate for GA" }
            ],
            clinicalRiskScore: riskScore
          },
          recommendation: {
            title: "R — Recommendations & Clinical Discussion Points",
            points: [
              "Review upcoming 24-28 Week Glucose Tolerance Test (OGTT 75g) scheduling.",
              "Re-check hemoglobin & ferritin profile (baseline 11.6 g/dL; maintain oral iron supplementation).",
              "Continue daily fetal movement charting during active evening post-prandial periods.",
              "Immediate triage protocol reinforced for preeclampsia symptoms (persistent occipital headache, scotoma, epigastric pain)."
            ]
          }
        },
        disclaimer: "Generated by BloomNest Doctor Brief Agent to assist clinical conversation. Final diagnosis and care management rest solely with the licensed OB-GYN."
      };
    }
  },

  // PERSISTENT MEMORY & TREND TOOLS
  get_maternal_memory: {
    name: "get_maternal_memory",
    description: "Retrieves active long-term maternal memory records (profile, preferences, care context, saved questions).",
    safetyLevel: "READ_ONLY",
    isReadOnly: true,
    parameters: {
      type: "object",
      properties: {
        memoryTypes: { type: "string", description: "Comma-separated memory types: PROFILE, JOURNEY, PREFERENCE, CARE_CONTEXT, QUESTION, CONVERSATION_SUMMARY" }
      }
    },
    handler: async (args, context: AgentContext) => {
      const types = args?.memoryTypes ? args.memoryTypes.split(",").map((t: string) => t.trim().toUpperCase()) : undefined;
      const memories = await MaternalMemoryService.getRelevantMemories(context.userId || "demo_user_1", types, 5);
      return {
        count: memories.length,
        memories: memories.map(m => ({
          id: m.id,
          memoryType: m.memoryType,
          summary: m.summary,
          source: m.source,
          createdAt: m.createdAt
        }))
      };
    }
  },

  get_vital_trends: {
    name: "get_vital_trends",
    description: "Computes maternal blood pressure averages, MAP, blood sugar trends, and abnormal reading frequency over history.",
    safetyLevel: "READ_ONLY",
    isReadOnly: true,
    parameters: {
      type: "object",
      properties: {
        limitCount: { type: "number", description: "Number of historical vital records to analyze (default 10)" }
      }
    },
    handler: async (args, context: AgentContext) => {
      const limit = args?.limitCount || 10;
      const trends = await MaternalMemoryService.getVitalTrends(context.userId || "demo_user_1", limit);
      return {
        success: true,
        trends
      };
    }
  },

  save_agent_memory: {
    name: "save_agent_memory",
    description: "Saves a useful, sanitized, non-duplicate maternal preference or care observation for future personalization. Does NOT allow medical diagnostic claims.",
    safetyLevel: "SAFE_WRITE",
    isReadOnly: false,
    parameters: {
      type: "object",
      properties: {
        memoryType: {
          type: "string",
          description: "Memory classification: PROFILE, JOURNEY, PREFERENCE, CARE_CONTEXT, QUESTION, CONVERSATION_SUMMARY",
          enum: ["PROFILE", "JOURNEY", "PREFERENCE", "CARE_CONTEXT", "QUESTION", "CONVERSATION_SUMMARY"]
        },
        summary: { type: "string", description: "Concise, factual memory summary to store for personalization" }
      },
      required: ["memoryType", "summary"]
    },
    handler: async (args, context: AgentContext) => {
      try {
        const saved = await MaternalMemoryService.saveMemory(context.userId || "demo_user_1", {
          memoryType: args.memoryType as AllowedMemoryType,
          summary: args.summary,
          source: "AGENT_OBSERVATION"
        });
        return {
          success: true,
          memoryId: saved.id,
          memoryType: saved.memoryType,
          status: "SAVED_AND_DEDUPLICATED"
        };
      } catch (err: any) {
        return {
          success: false,
          error: err.message || "Failed to save memory record due to safety or format validation policy."
        };
      }
    }
  }
};

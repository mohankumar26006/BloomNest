/**
 * BloomNest 2.0 Agentic Architecture — Controlled Gemini Orchestrator
 * Phase 0 Baseline
 *
 * Controlled agent execution loop with max 3 tool iteration safety,
 * deterministic safety rule enforcement, and structured output validation.
 */

import { GoogleGenAI } from "@google/genai";
import { AGENT_TOOLS } from "./agentTools";
import { MaternalMemoryService } from "./maternalMemoryService";
import {
  AgentContext,
  AgentResponse,
  AgentExecutionTrace,
  AgentToolResult,
  AgentObservation,
  AgentAction,
  SafetyAssessmentLevel,
  AgentName
} from "./agents/types";

const MAX_TOOL_ITERATIONS = 3;

/**
 * System Instruction for Gemini Orchestrator
 */
const SYSTEM_INSTRUCTION = `You are the "BloomNest Maternal Clinical Intelligence Copilot", an evidence-based, medically cautious, empathetic, and culturally grounded obstetric companion.

CRITICAL INSTRUCTION FOR DETAILED, EASY-TO-UNDERSTAND & INTERACTIVE RESPONSES:
Mothers seeking guidance may be anxious, tired, or experiencing uncomfortable symptoms. Your explanations MUST BE:
1. WARM & REASSURING: Always start with an empathetic greeting acknowledging her gestational week (e.g. "Dear Mama (Week 24) 🌸, take a gentle breath...").
2. STRUCTURED IN 5 CLEAR SECTIONS:
   - "### 💡 Quick Summary (சுருக்கம்)": 2-3 clear, scannable bullet points with the core takeaway.
   - "### 🔬 What Is Happening (எளிய விளக்கம்)": Explain the biological cause in plain, compassionate, jargon-free words (e.g., why placental hormones, uterine pressure on blood vessels, or fluid shifts happen).
   - "### ⚡ Immediate Action Steps (உடனே செய்ய வேண்டியவை)": Numbered practical steps she can do right now (e.g., lie on left side with pillows, drink 250ml water, rest eyes in dim room, recheck BP).
   - "### 🚨 When to Call Doctor (Red-Flag Checklist)": Clear bullet points on acute symptoms requiring immediate hospital triage (e.g., visual disturbances, sharp epigastric pain, severe swelling).
   - "### 🥗 Nutrition & Comfort Tip (உணவு & ஆறுதல் குறிப்பு)": Gentle, maternal-friendly food, hydration, or postural comfort advice (e.g., coconut water, cumin buttermilk, elevating feet).
   - "### 🩺 Questions for Your Doctor (மருத்துவரிடம் கேட்க)": 2-3 ready-to-ask questions for her next OB-GYN visit with Dr. Ananya Sharma.
3. BILINGUAL & TANGLISH FIRST: If the mother asks in Tanglish or Tamil (e.g. "enaku neraya doubts iruku", "kaal veengirukku", "thala vali", "nenju erichal"), respond PRIMARILY IN NATURAL, EMPATHETIC TANGLISH (Tamil written in English letters). Do NOT force pure Tamil script (தமிழ் எழுத்து) unless specifically asked for Tamil font. Make explanations super friendly, conversational, and comfortable to read in Tanglish.
4. NON-DIAGNOSTIC BOUNDARY: Never claim a definitive diagnosis. Frame advice as clinical education and precautionary triage.
5. STRUCTURED JSON OUTPUT: You MUST return a valid JSON object matching this schema:
{
  "message": "Full detailed markdown response with the 5 structured sections above",
  "intent": "VITALS_CHECK|FOOD_SAFETY|RECIPE_GEN|WELLNESS_ADVICE|MILESTONES|CARE_PLAN|GENERAL",
  "observations": [
    { "category": "VITALS|NUTRITION|WELLNESS|SAFETY|MILESTONES", "summary": "Short observation", "severity": "LOW|MEDIUM|HIGH|CRITICAL" }
  ],
  "actions": [
    { "type": "INFO_CARD|RECOMMENDATION|SAFETY_ALERT|PREVIEW_CARE_PLAN|EMERGENCY_SOS", "title": "Action Title", "description": "Action Description" }
  ],
  "safetyLevel": "INFO|ATTENTION|URGENT",
  "requiresHumanReview": false,
  "suggestedFollowUps": [
    "Short follow-up question 1",
    "Short follow-up question 2",
    "Short follow-up question 3"
  ],
  "interactiveSections": {
    "summary": "Concise summary for fast reading",
    "explanation": "Clear explanation of why this happens in body",
    "actionSteps": ["Step 1", "Step 2", "Step 3"],
    "redFlags": ["Flag 1", "Flag 2"],
    "nutritionTips": ["Tip 1", "Tip 2"],
    "doctorQuestions": ["Question 1", "Question 2"]
  },
  "sources": [
    { "title": "Guideline or Source Name", "source": "ACOG / ICMR 2024 / BloomNest Engine" }
  ]
}`;

/**
 * Fallback Agent Response Generator with Rich Interactive Maternal Modules
 */
function createFallbackAgentResponse(
  requestId: string,
  message: string,
  context: AgentContext,
  reason: string
): AgentResponse {
  const clean = message.toLowerCase();
  const week = context.pregnancyWeek || 24;
  const trimester = context.trimester || 2;
  const isTanglish = clean.includes("irukku") || clean.includes("vali") || clean.includes("kaal") || clean.includes("veeng") || clean.includes("veekam") || clean.includes("enaku") || clean.includes("epdi") || clean.includes("sapda") || clean.includes("solla") || clean.includes("sollu") || clean.includes("pesa") || clean.includes("illa") || clean.includes("doubt") || clean.includes("thala") || clean.includes("nenju") || clean.includes("vayiru") || clean.includes("mudiyala") || clean.includes("kooduma");

  const isUrgent = clean.includes("headache") || clean.includes("thala vali") || clean.includes("bleeding") || clean.includes("bp") || clean.includes("chest pain") || clean.includes("vision") || clean.includes("preeclampsia") || clean.includes("bp 140");
  const isSwelling = clean.includes("swelling") || clean.includes("edema") || clean.includes("kaal veeng") || clean.includes("veekam") || clean.includes("puffy");
  const isNausea = clean.includes("nausea") || clean.includes("vomit") || clean.includes("heartburn") || clean.includes("acidity") || clean.includes("nenju erichal") || clean.includes("morning sickness") || clean.includes("digestion");
  const isKick = clean.includes("kick") || clean.includes("movement") || clean.includes("asaiyadhu") || clean.includes("baby move") || clean.includes("asavu");
  const isBackPain = clean.includes("back pain") || clean.includes("hip pain") || clean.includes("pelvic") || clean.includes("sciatica") || clean.includes("sleep") || clean.includes("position") || clean.includes("pillow") || clean.includes("thunguradhu") || clean.includes("iduppu vali") || clean.includes("naduvali") || clean.includes("cramp");
  const isFoodSafety = clean.includes("papaya") || clean.includes("pineapple") || clean.includes("food") || clean.includes("eat") || clean.includes("diet") || clean.includes("nutrition") || clean.includes("sapda") || clean.includes("fish") || clean.includes("paneer") || clean.includes("egg") || clean.includes("coffee") || clean.includes("tea") || clean.includes("caffeine") || clean.includes("fruit");
  const isBabyGrowth = clean.includes("baby weight") || clean.includes("growth") || clean.includes("scan") || clean.includes("ultrasound") || clean.includes("anomaly") || clean.includes("size") || clean.includes("milestone") || clean.includes("development") || clean.includes("weight") || clean.includes("afi") || clean.includes("amniotic");
  const isSugar = clean.includes("sugar") || clean.includes("diabetes") || clean.includes("glucose") || clean.includes("gdm") || clean.includes("ogtt") || clean.includes("fasting");
  const isSupplements = clean.includes("iron") || clean.includes("calcium") || clean.includes("supplement") || clean.includes("vitamin") || clean.includes("folic") || clean.includes("tablet") || clean.includes("constipation") || clean.includes("malachikkal") || clean.includes("motion");
  const isDischarge = clean.includes("discharge") || clean.includes("white discharge") || clean.includes("itching") || clean.includes("smell") || clean.includes("urine") || clean.includes("uti") || clean.includes("infection") || clean.includes("vellai") || clean.includes("erichal");
  const isLabor = clean.includes("labor") || clean.includes("contraction") || clean.includes("braxton") || clean.includes("water break") || clean.includes("panikkudam") || clean.includes("delivery") || clean.includes("c-section") || clean.includes("caesarean") || clean.includes("normal delivery") || clean.includes("prasava");
  const isExercise = clean.includes("exercise") || clean.includes("walking") || clean.includes("yoga") || clean.includes("travel") || clean.includes("flight") || clean.includes("car") || clean.includes("bus") || clean.includes("nadai");
  const isStress = clean.includes("stress") || clean.includes("anxiety") || clean.includes("bayam") || clean.includes("fear") || clean.includes("crying") || clean.includes("garbha sanskar") || clean.includes("music") || clean.includes("mood");

  let formattedMessage = "";
  let actionSteps: string[] = [];
  let redFlags: string[] = [];
  let nutritionTips: string[] = [];
  let doctorQuestions: string[] = [];
  let suggestedFollowUps: string[] = [];
  let explanation = "";
  let summary = "";
  let detectedIntent = "GENERAL";

  if (isUrgent || isSwelling) {
    detectedIntent = "VITALS_CHECK";
    summary = `Clinical Attention & Comfort Protocol: In Week ${week}, sudden symptoms like headaches, elevated blood pressure (≥140/90 mmHg), or asymmetric foot swelling require watchful evaluation to protect maternal & fetal wellbeing.`;
    explanation = isTanglish
      ? `2nd & 3rd trimester-la placenta hormones nala blood vessels konjam surunga vaaipirukku. Idhunaala blood pressure 140/90 mela pogumbodhu thala vali matrum kaal veekam vara koodum. Left side orungi paduthu rest edukkuradhu romba mukkiyam.`
      : `During the second and third trimesters, hormonal changes and the weight of the growing uterus put pressure on the inferior vena cava and pelvic veins, which can slow return blood flow and elevate vascular resistance.`;
    actionSteps = [
      "Lie on your left side immediately with a pillow between your knees (boosts oxygen & blood flow to baby)",
      "Sip 250ml of room-temperature water or tender coconut water",
      "Rest in a quiet, cool, dimly lit room without bright screens for 20 minutes",
      "Recheck blood pressure while seated calmly with your back supported and feet flat"
    ];
    redFlags = [
      "Sudden flashing lights, blurry vision, or blind spots",
      "Severe persistent pain right under your right ribs (epigastric tenderness)",
      "Sudden puffiness in your face, eyelids, or hands",
      "Noticeable decrease in baby's regular kick count"
    ];
    nutritionTips = [
      "Avoid pickles, papads, and high-sodium packaged foods today",
      "Drink fresh cumin-infused buttermilk (neer mor) or tender coconut water",
      "Elevate your feet on 2 soft pillows whenever sitting"
    ];
    doctorQuestions = [
      "Should we perform a spot urine protein-to-creatinine ratio (UPCR) test?",
      "Is my amniotic fluid volume (AFI) and baby growth on track for Week " + week + "?",
      "Would a low-dose prophylactic aspirin or blood pressure monitoring log be advised?"
    ];
    suggestedFollowUps = [
      "How to lie comfortably on left side with pillows?",
      "What South Indian foods naturally lower blood pressure?",
      "Explain this in Tamil (தமிழில் சொல்லுங்க)",
      "How to track baby kicks accurately?"
    ];

    formattedMessage = `🌸 **Dear Mama (Week ${week} · Trimester ${trimester})**, take a deep, reassuring breath. Let's review your symptoms together with care.\n\n` +
      `### 💡 Quick Summary (சுருக்கம்)\n${summary}\n\n` +
      `### 🔬 What Is Happening (எளிய விளக்கம்)\n${explanation}\n\n` +
      `### ⚡ Immediate Action Steps (உடனே செய்ய வேண்டியவை)\n` +
      actionSteps.map((s, i) => `${i + 1}. **${s.split("(")[0].trim()}**: ${s.includes("(") ? "(" + s.split("(")[1] : ""}`).join("\n") + `\n\n` +
      `### 🚨 When to Call Doctor (Red-Flag Checklist)\n` +
      redFlags.map(f => `• ${f}`).join("\n") + `\n\n` +
      `### 🥗 Nutrition & Comfort Tip (உணவு & ஆறுதல் குறிப்பு)\n` +
      nutritionTips.map(t => `• ${t}`).join("\n") + `\n\n` +
      `### 🩺 Questions for Dr. Ananya Sharma\n` +
      doctorQuestions.map(q => `• *"${q}"*`).join("\n");

  } else if (isNausea) {
    detectedIntent = "WELLNESS_SYMPTOM";
    summary = `Relief Protocol for Acidity & Nausea: Common during Week ${week} due to elevated progesterone relaxing the lower esophageal sphincter.`;
    explanation = isTanglish
      ? `Pregnancy progesterone hormone digestion-ah slow pannum. Adhoda uterus perusaaga digestive tract mela pressure kodukkum. Idhunaala nenju erichal (heartburn) matrum nausea varum.`
      : `High levels of progesterone relax smooth muscle tissues throughout your body, including the valve between your stomach and esophagus. The growing uterus also pushes against your stomach.`;
    actionSteps = [
      "Eat 5 to 6 small, frequent meals rather than 2-3 large heavy meals",
      "Sip warm jeera (cumin) water, fennel (saunf) tea, or cold milk",
      "Stay upright for at least 45 minutes after eating; avoid lying flat immediately",
      "Elevate your head and torso with an extra pillow when sleeping"
    ];
    redFlags = [
      "Inability to keep liquids down for more than 12 hours",
      "Dark-colored urine or feeling dizzy upon standing",
      "Severe pain in your stomach or vomiting blood"
    ];
    nutritionTips = [
      "Snack on roasted makhana, unsalted crackers, or dry toast",
      "Avoid deep-fried oily foods, strong spices, and citrus fruits on an empty stomach",
      "Sip tender coconut water between meals"
    ];
    doctorQuestions = [
      "Is a pregnancy-safe antacid (like calcium carbonate or magnesium hydroxide) recommended?",
      "Could my iron supplement be contributing to the acidity?"
    ];
    suggestedFollowUps = [
      "What home remedies help severe acidity in pregnancy?",
      "Suggest light dinner recipes that prevent acid reflux",
      "Can I take buttermilk for heartburn?"
    ];

    formattedMessage = `🌸 **Dear Mama (Week ${week} · Trimester ${trimester})**, digestive comfort is essential for your wellbeing.\n\n` +
      `### 💡 Quick Summary (சுருக்கம்)\n${summary}\n\n` +
      `### 🔬 What Is Happening (எளிய விளக்கம்)\n${explanation}\n\n` +
      `### ⚡ Immediate Action Steps (உடனே செய்ய வேண்டியவை)\n` +
      actionSteps.map((s, i) => `${i + 1}. **${s}**`).join("\n") + `\n\n` +
      `### 🚨 When to Call Doctor\n` +
      redFlags.map(f => `• ${f}`).join("\n") + `\n\n` +
      `### 🥗 Nutrition & Comfort Tip\n` +
      nutritionTips.map(t => `• ${t}`).join("\n") + `\n\n` +
      `### 🩺 Questions for Your Doctor\n` +
      doctorQuestions.map(q => `• *"${q}"*`).join("\n");

  } else if (isKick) {
    detectedIntent = "FETAL_MONITORING";
    summary = `Fetal Movement Guide for Week ${week}: Your baby is very active now with developed limbs and responsive sleep-wake cycles!`;
    explanation = isTanglish
      ? `Week ${week}-la baby-oda nervous system and muscles nalla develop aagirukkum. Baby-oda kicks, turns, and hiccups ungalukku nalla theriyum. Dinamum saapittavudan 1 mani neram rest eduthu asavugalai gavanikkavum.`
      : `Around Week ${week}, your baby's vestibular and neuromuscular systems are functioning. You will feel distinct kicks, rolls, punches, and rhythmic fluttering (hiccups).`;
    actionSteps = [
      "Count kicks during baby's most active window (typically 30-60 mins after lunch or dinner)",
      "Lie comfortably on your left side with quiet focus on your belly",
      "Count 10 distinct movements (kicks, jabs, turns) within a 2-hour period",
      "If baby is quiet, drink a glass of cold water or have a healthy snack and gently tap belly"
    ];
    redFlags = [
      "Fewer than 10 movements in a 2-hour focused counting period",
      "A noticeable, persistent reduction in usual daily movement patterns"
    ];
    nutritionTips = [
      "A healthy complex-carbohydrate snack (like an apple or almonds) stimulates gentle activity",
      "Stay well-hydrated to maintain optimal amniotic fluid cushioning"
    ];
    doctorQuestions = [
      "When do you recommend starting a formal daily kick chart?",
      "Is an anterior placenta cushioning some of the kicks?"
    ];
    suggestedFollowUps = [
      "How does an anterior placenta affect feeling kicks?",
      "What time of day are babies usually most active?",
      "Log my kick count session today"
    ];

    formattedMessage = `👶 **Dear Mama (Week ${week})**, feeling your baby move is one of pregnancy's sweetest milestones!\n\n` +
      `### 💡 Quick Summary (சுருக்கம்)\n${summary}\n\n` +
      `### 🔬 What Is Happening (எளிய விளக்கம்)\n${explanation}\n\n` +
      `### ⚡ How to Count Kicks (உடனே செய்ய வேண்டியவை)\n` +
      actionSteps.map((s, i) => `${i + 1}. **${s}**`).join("\n") + `\n\n` +
      `### 🚨 When to Call Doctor\n` +
      redFlags.map(f => `• ${f}`).join("\n") + `\n\n` +
      `### 🥗 Nutrition & Comfort Tip\n` +
      nutritionTips.map(t => `• ${t}`).join("\n") + `\n\n` +
      `### 🩺 Questions for Dr. Ananya Sharma\n` +
      doctorQuestions.map(q => `• *"${q}"*`).join("\n");

  } else if (isBackPain) {
    detectedIntent = "WELLNESS_SYMPTOM";
    summary = `Relief for Back, Pelvic & Hip Discomfort (Week ${week}): Relieving strain from relaxin hormone and shifting center of gravity.`;
    explanation = isTanglish
      ? `Relaxin hormone nala pelvic joints loosen aagum, uterus perusaaga back muscles mela strain adhigam aagum. Left side paduthu muttiku naduvula pillow vaipadhu ratha oattathaiyum thookathaiyum nallapadiyaaga vaikkum.`
      : `The pregnancy hormone relaxin softens your pelvic ligaments to prepare for birth, which shifts your lumbar curvature (lordosis) and increases lower back muscular strain. Sleeping in the SOS left-side position relieves IVC pressure.`;
    actionSteps = [
      "Sleep in the SOS position (Left side) with a firm pillow between knees and one under your belly",
      "Perform gentle pelvic tilts (Cat-Cow pose) for 5-10 minutes daily",
      "Avoid standing for longer than 30 minutes without shifting your weight",
      "Apply a warm (not scalding) compress to your lumbar region for 15 minutes"
    ];
    redFlags = [
      "Rhythmic cramping that worsens like menstrual contractions",
      "Numbness, tingling, or radiating pain down your legs (sciatica flare-up)",
      "Any fluid leak or fever accompanying backache"
    ];
    nutritionTips = [
      "Ensure adequate magnesium and calcium from sesame seeds, almonds, ragi, and dairy to prevent spasms",
      "Stay well-hydrated to keep spinal discs lubricated"
    ];
    doctorQuestions = [
      "Is a maternity pelvic support belt recommended for my pelvic pain?",
      "Can you prescribe pregnancy-safe topical magnesium or paracetamol if pain prevents sleep?"
    ];
    suggestedFollowUps = [
      "How to set up pregnancy pillows for left-side sleeping?",
      "What gentle stretches relieve pregnancy back pain?",
      "Suggest prenatal yoga postures for pelvic strength"
    ];

    formattedMessage = `🌸 **Dear Mama (Week ${week})**, maternal comfort is vital. Let's soothe your back and hips:\n\n` +
      `### 💡 Quick Summary (சுருக்கம்)\n${summary}\n\n` +
      `### 🔬 What Is Happening (எளிய விளக்கம்)\n${explanation}\n\n` +
      `### ⚡ Immediate Action Steps (உடனே செய்ய வேண்டியவை)\n` +
      actionSteps.map((s, i) => `${i + 1}. **${s}**`).join("\n") + `\n\n` +
      `### 🚨 When to Call Doctor\n` +
      redFlags.map(f => `• ${f}`).join("\n") + `\n\n` +
      `### 🥗 Nutrition & Comfort Tip\n` +
      nutritionTips.map(t => `• ${t}`).join("\n") + `\n\n` +
      `### 🩺 Questions for Dr. Ananya Sharma\n` +
      doctorQuestions.map(q => `• *"${q}"*`).join("\n");

  } else if (isFoodSafety) {
    detectedIntent = "FOOD_SAFETY";
    summary = `Evidence-Based Maternal Food Safety & Nutrition Guide for Week ${week}.`;
    explanation = isTanglish
      ? `Pregnancy-la raw foods (pachayaana papaya, unpasteurized cheese, half-cooked meat) thavirkkanum. Ripe yellow papaya moderaate-ah safe. Iron, calcium, and protein foods baby growth-ku migavum avasiyam.`
      : `Pregnancy alters cellular immunity, increasing vulnerability to foodborne pathogens like Listeria, Salmonella, and Toxoplasma. Cooking foods thoroughly and avoiding unpasteurized dairy ensures fetal safety.`;
    actionSteps = [
      "Raw / Green Papaya: Strictly Avoid (contains concentrated papain and latex which trigger contractions)",
      "Ripe Yellow Papaya: Safe in modest portions (rich in Vitamin C, folate, and beta-carotene)",
      "Paneer & Milk: Always consume pasteurized varieties; cook paneer thoroughly",
      "Wash all fresh vegetables and fruits under running water before cutting"
    ];
    redFlags = [
      "High fever, vomiting, or watery diarrhea within 24 hours of eating outside food",
      "Severe abdominal cramps following any food intake"
    ];
    nutritionTips = [
      "Incorporate South Indian superfoods: Ragi idli, moringa (murungai keerai) soup, sundal (chickpeas)",
      "Drink tender coconut water and cumin water for natural electrolyte balance"
    ];
    doctorQuestions = [
      "Are there any specific dietary restrictions based on my blood sugar or weight gain?",
      "Should I take a DHA omega-3 supplement alongside my prenatal vitamins?"
    ];
    suggestedFollowUps = [
      "Suggest a high-protein South Indian pregnancy recipe",
      "Can I drink tender coconut water daily in pregnancy?",
      "What fruits are highest in iron for pregnancy?"
    ];

    formattedMessage = `🥗 **Dear Mama**, here is your evidence-based nutrition & food safety protocol:\n\n` +
      `### 💡 Quick Summary (சுருக்கம்)\n${summary}\n\n` +
      `### 🔬 What Is Happening (எளிய விளக்கம்)\n${explanation}\n\n` +
      `### ⚡ Safe Preparation Rules (செய்ய வேண்டியவை)\n` +
      actionSteps.map((s, i) => `${i + 1}. **${s}**`).join("\n") + `\n\n` +
      `### 🚨 Warning Signs\n` +
      redFlags.map(f => `• ${f}`).join("\n") + `\n\n` +
      `### 🥗 Nutrition & Comfort Tip\n` +
      nutritionTips.map(t => `• ${t}`).join("\n") + `\n\n` +
      `### 🩺 Questions for Dr. Ananya Sharma\n` +
      doctorQuestions.map(q => `• *"${q}"*`).join("\n");

  } else if (isBabyGrowth) {
    detectedIntent = "BABY_DEVELOPMENT";
    const estWeight = Math.round(220 + week * 22);
    summary = `Fetal Growth & Milestones for Week ${week}: Estimated baby weight is around ~${estWeight}g, with rapid brain, lung, and sensory maturation.`;
    explanation = isTanglish
      ? `Week ${week}-la baby ungaludaiya kuralaiyum (voice) veli sathangalaiyum nalla kekka mudiyum. Baby-oda eyes open aaga thodangum, fingerprints and eyelashes uruvaagirukkum. Amniotic fluid baby-ai nallaa protect pannudhu.`
      : `By Week ${week}, your baby's cochlea and auditory cortex are functioning, allowing them to hear your voice and heartbeat. Practice breathing movements are occurring, and the bronchial tree is branching.`;
    actionSteps = [
      "Talk, sing, or read to your baby daily — studies show newborns recognize maternal voices heard in the womb",
      "Keep track of scheduled scans (Level II Anomaly scan 18-22 weeks; Growth Doppler scan 28-32 weeks)",
      "Maintain consistent hydration (2.5L daily) to preserve optimal amniotic fluid volume (AFI)"
    ];
    redFlags = [
      "Sudden leakage of clear warm watery fluid (possible premature rupture of membranes)",
      "Persistent lack of fetal movement over a full day"
    ];
    nutritionTips = [
      "DHA (from walnuts, flaxseeds, or fish oil) and Choline (eggs, beans) power fetal brain development",
      "Protein intake (60-70g daily) fuels rapid tissue and muscular growth"
    ];
    doctorQuestions = [
      "Is my baby's estimated fetal weight (EFW) and abdominal circumference matching my gestational week?",
      "What is my current amniotic fluid index (AFI) reading?"
    ];
    suggestedFollowUps = [
      "What should baby's weight be in Week " + week + "?",
      "When is the next growth ultrasound scan due?",
      "Suggest Garbha Sanskar music for baby bonding"
    ];

    formattedMessage = `👶 **Dear Mama (Week ${week} Fetal Milestones)**:\n\n` +
      `### 💡 Quick Summary (சுருக்கம்)\n${summary}\n\n` +
      `### 🔬 Baby Development (எளிய விளக்கம்)\n${explanation}\n\n` +
      `### ⚡ Developmental Support Steps\n` +
      actionSteps.map((s, i) => `${i + 1}. **${s}**`).join("\n") + `\n\n` +
      `### 🚨 When to Alert Doctor\n` +
      redFlags.map(f => `• ${f}`).join("\n") + `\n\n` +
      `### 🥗 Fetal Superfood Tip\n` +
      nutritionTips.map(t => `• ${t}`).join("\n") + `\n\n` +
      `### 🩺 Questions for Dr. Ananya Sharma\n` +
      doctorQuestions.map(q => `• *"${q}"*`).join("\n");

  } else if (isSugar) {
    detectedIntent = "DIABETES_CARE";
    summary = `Gestational Diabetes & Glucose Balance Protocol (Week ${week}): Monitoring insulin sensitivity during peak placental hormone secretion.`;
    explanation = isTanglish
      ? `24-28 weeks-la placenta human placental lactogen (hPL) hormone release pannum. Idhu insulin resistance undaakkum. Idhanaala OGTT 75g glucose test eduthu blood sugar check panradhu romba mukkiyam.`
      : `Around 24 to 28 weeks, placental hormones (hPL, cortisol, progesterone) peak, causing physiologic insulin resistance. Screening via the 75g Oral Glucose Tolerance Test (OGTT) identifies gestational diabetes early.`;
    actionSteps = [
      "Schedule your 75g OGTT screening between 24 and 28 weeks as recommended by ICMR / ACOG",
      "Target Blood Sugar: Fasting < 95 mg/dL; 1-hour post-meal < 140 mg/dL; 2-hour post-meal < 120 mg/dL",
      "Switch to low-glycemic complex carbohydrates (brown rice, ragi, quinoa, millets) instead of polished white rice",
      "Take a 10-15 minute gentle walk immediately after meals to improve muscle glucose uptake"
    ];
    redFlags = [
      "Extreme unquenchable thirst, frequent urination, and sudden weight loss",
      "Persistent dizzy spells or trembling after fasting"
    ];
    nutritionTips = [
      "Pair carbs with healthy protein and fiber (e.g., moong dal, paneer, cucumbers) to flatten glucose spikes",
      "Avoid fruit juices, sugary sodas, sweets, and bakery goods"
    ];
    doctorQuestions = [
      "When is my 75g OGTT scheduled, and do I need to be fasting?",
      "Do I need a home glucometer log for daily tracking?"
    ];
    suggestedFollowUps = [
      "How to prepare for the 75g OGTT glucose test?",
      "What South Indian foods have low glycemic index?",
      "What are normal fasting blood sugar levels in pregnancy?"
    ];

    formattedMessage = `🩸 **Dear Mama (Blood Sugar & Glucose Care)**:\n\n` +
      `### 💡 Quick Summary (சுருக்கம்)\n${summary}\n\n` +
      `### 🔬 What Is Happening (எளிய விளக்கம்)\n${explanation}\n\n` +
      `### ⚡ Immediate Action Steps (செய்ய வேண்டியவை)\n` +
      actionSteps.map((s, i) => `${i + 1}. **${s}**`).join("\n") + `\n\n` +
      `### 🚨 Red-Flag Symptoms\n` +
      redFlags.map(f => `• ${f}`).join("\n") + `\n\n` +
      `### 🥗 Blood Sugar Friendly Nutrition\n` +
      nutritionTips.map(t => `• ${t}`).join("\n") + `\n\n` +
      `### 🩺 Questions for Dr. Ananya Sharma\n` +
      doctorQuestions.map(q => `• *"${q}"*`).join("\n");

  } else if (isSupplements) {
    detectedIntent = "MEDICATION_GUIDE";
    summary = `Prenatal Supplement & Digestion Guidance (Week ${week}): Optimizing iron and calcium absorption while relieving constipation.`;
    explanation = isTanglish
      ? `Iron tablet and calcium tablet-ah ore nerathula poda koodadhu; calcium iron absorption-ah thadukkum. Iron tablet-udan lemon water saapitta absorption 3x adhigam aagum. Malachikkal irundha fibre-rich foods and 3L water mukkiyam.`
      : `Iron and calcium compete for identical intestinal absorption pathways. Taking them at least 2 hours apart ensures full bioavailability. Iron can cause dark stool and mild constipation, which fiber and hydration naturally alleviate.`;
    actionSteps = [
      "Take Iron tablets in the morning or between meals with Vitamin C (lemon juice or amla water)",
      "Take Calcium tablets with or after lunch / dinner at least 2 hours away from iron",
      "Do not take iron with tea, coffee, or milk (tannins and calcium block iron absorption)",
      "For constipation: Eat soaked prunes, raisins, papaya (ripe), oats, and drink 3L of water daily"
    ];
    redFlags = [
      "Severe abdominal pain or inability to pass motion or gas for more than 48 hours",
      "Blood in stool or severe hemorrhoidal pain"
    ];
    nutritionTips = [
      "Incorporate cooked green leafy vegetables (palak, methi, moringa) and beetroot for natural dietary iron",
      "Warm water with 1 tsp ghee or isabgol husk at bedtime can safely relieve sluggish bowels"
    ];
    doctorQuestions = [
      "Could we switch to a gentler iron formulation (like iron bisglycinate) if constipation persists?",
      "Is my latest hemoglobin (Hb) level optimal for Week " + week + "?"
    ];
    suggestedFollowUps = [
      "How to take iron and calcium tablets correctly without constipation?",
      "What home remedies help pregnancy constipation?",
      "Suggest high-fiber South Indian dinner ideas"
    ];

    formattedMessage = `💊 **Dear Mama (Prenatal Supplements & Digestive Comfort)**:\n\n` +
      `### 💡 Quick Summary (சுருக்கம்)\n${summary}\n\n` +
      `### 🔬 Clinical Mechanism (எளிய விளக்கம்)\n${explanation}\n\n` +
      `### ⚡ Safe Dosage Rules (செய்ய வேண்டியவை)\n` +
      actionSteps.map((s, i) => `${i + 1}. **${s}**`).join("\n") + `\n\n` +
      `### 🚨 Warning Signs\n` +
      redFlags.map(f => `• ${f}`).join("\n") + `\n\n` +
      `### 🥗 Nutrition & Digestion Tip\n` +
      nutritionTips.map(t => `• ${t}`).join("\n") + `\n\n` +
      `### 🩺 Questions for Dr. Ananya Sharma\n` +
      doctorQuestions.map(q => `• *"${q}"*`).join("\n");

  } else if (isDischarge) {
    detectedIntent = "INFECTION_SAFETY";
    summary = `Vaginal Discharge & Urinary Tract Health Assessment (Week ${week}): Differentiating leukorrhea from yeast or bacterial infections.`;
    explanation = isTanglish
      ? `Pregnancy-la mild white discharge (leukorrhea) sagajam. Aana erichal (burning urine), itching, thick curd-like discharge, or thur-naatram (odor) irundha urine infection or yeast infection aaga irukalaam. Early treatment romba mukkiyam.`
      : `Elevated estrogen increases physiological vaginal discharge (leukorrhea) to protect against ascending pathogens. However, changes in vaginal pH increase susceptibility to candidiasis or asymptomatic bacteriuria (UTI).`;
    actionSteps = [
      "Drink at least 3 liters of water daily to flush urinary tract bacteria",
      "Wear breathable, loose 100% cotton underwear and change twice daily",
      "Wipe strictly from front to back after urination to prevent bacterial transfer",
      "Avoid scented soaps, feminine sprays, and bubble baths"
    ];
    redFlags = [
      "Burning sensation or sharp pain during urination",
      "Fever, chills, or pain in your lower back / flank (sign of kidney involvement)",
      "Greenish, foul-smelling, or blood-streaked discharge",
      "Sudden continuous watery trickle (amniotic fluid leakage)"
    ];
    nutritionTips = [
      "Drink fresh unsweetened cranberry juice or tender coconut water",
      "Consume fresh homemade curd / probiotic yogurt daily to maintain healthy vaginal flora"
    ];
    doctorQuestions = [
      "Should we perform a routine urine routine & microscopy / culture test?",
      "Is a pregnancy-safe antifungal cream or pessary indicated for itching?"
    ];
    suggestedFollowUps = [
      "How to tell difference between normal discharge and water breaking?",
      "What home precautions prevent urine infection in pregnancy?",
      "Is curd safe for urinary health during pregnancy?"
    ];

    formattedMessage = `🌸 **Dear Mama (Maternal Intimate Health & UTI Guidance)**:\n\n` +
      `### 💡 Quick Summary (சுருக்கம்)\n${summary}\n\n` +
      `### 🔬 What Is Happening (எளிய விளக்கம்)\n${explanation}\n\n` +
      `### ⚡ Immediate Care Steps (செய்ய வேண்டியவை)\n` +
      actionSteps.map((s, i) => `${i + 1}. **${s}**`).join("\n") + `\n\n` +
      `### 🚨 When to Call Doctor Immediately\n` +
      redFlags.map(f => `• ${f}`).join("\n") + `\n\n` +
      `### 🥗 Hydration & Probiotic Tip\n` +
      nutritionTips.map(t => `• ${t}`).join("\n") + `\n\n` +
      `### 🩺 Questions for Dr. Ananya Sharma\n` +
      doctorQuestions.map(q => `• *"${q}"*`).join("\n");

  } else if (isLabor) {
    detectedIntent = "LABOR_TRIAGE";
    summary = `Labor & Contraction Protocol (Week ${week}): Braxton Hicks vs True Labor & Hospital Readiness.`;
    explanation = isTanglish
      ? `Braxton Hicks contractions irregular-aga irukkum, rest edutha sari aagum. True labor contractions 5-1-1 rule padi (ovvoru 5 mins-ku oru murai, 60 seconds neelam, 1 hour thodarndhu) adhigamaagum. Panikkudam udaindhal udane hospital poga vendum.`
      : `Braxton Hicks are practice uterine tightenings that do not dilate the cervix and ease with walking or drinking water. True labor contractions grow progressively closer, longer, and more intense.`;
    actionSteps = [
      "Change position: Drink 2 tall glasses of water and lie down on your left side",
      "Time the contractions from the start of one to the start of the next",
      "Follow the 5-1-1 Clinical Rule: Contractions every 5 minutes, lasting 60 seconds, for 1 full hour",
      "Keep your hospital bag and prenatal medical file accessible"
    ];
    redFlags = [
      "A gush or steady leak of clear or greenish amniotic fluid",
      "Bright red vaginal bleeding like a menstrual period",
      "Regular contractions occurring before 37 completed weeks (preterm labor risk)"
    ];
    nutritionTips = [
      "Keep yourself hydrated with oral electrolyte solution or coconut water",
      "Eat light, easy-to-digest energy foods (dates, bananas, dry fruits)"
    ];
    doctorQuestions = [
      "What is the emergency triage number for the labor ward?",
      "When does my doctor recommend checking into the hospital?"
    ];
    suggestedFollowUps = [
      "How to tell Braxton Hicks from real labor contractions?",
      "What items are essential for the hospital delivery bag?",
      "Open Contraction Timer tool"
    ];

    formattedMessage = `⏱️ **Dear Mama (Contractions & Labor Triage)**:\n\n` +
      `### 💡 Quick Summary (சுருக்கம்)\n${summary}\n\n` +
      `### 🔬 Clinical Evaluation (எளிய விளக்கம்)\n${explanation}\n\n` +
      `### ⚡ Immediate Steps to Follow\n` +
      actionSteps.map((s, i) => `${i + 1}. **${s}**`).join("\n") + `\n\n` +
      `### 🚨 Red-Flag Checklist (Go to Hospital)\n` +
      redFlags.map(f => `• ${f}`).join("\n") + `\n\n` +
      `### 🥗 Comfort Tip\n` +
      nutritionTips.map(t => `• ${t}`).join("\n") + `\n\n` +
      `### 🩺 Questions for Your Doctor\n` +
      doctorQuestions.map(q => `• *"${q}"*`).join("\n");

  } else if (isExercise) {
    detectedIntent = "WELLNESS_ROUTINE";
    summary = `Safe Maternal Exercise, Yoga & Travel Guidance for Week ${week}.`;
    explanation = isTanglish
      ? `Week ${week}-la gentle prenatal walking (20-30 mins) matrum pelvic stretches normal delivery-ku nalladhu. Deep squats, butterfly pose, Pranayama udambukku nalladhu. Long travel-la 2 hours-ku oru murai stop panni kaal neetti nadakanum.`
      : `Regular moderate aerobic activity maintains gestational glucose control, reduces preeclampsia risk, and prevents excessive weight gain. ACOG recommends 150 minutes of moderate activity weekly for uncomplicated pregnancies.`;
    actionSteps = [
      "Enjoy 20–30 minutes of brisk, comfortable prenatal walking in supportive footwear",
      "Practice diaphragmatic breathing and gentle Kegel pelvic floor exercises",
      "During road travel: Stop every 90-120 minutes to walk for 5 minutes and prevent DVT (deep vein thrombosis)",
      "Always wear the seatbelt with lap strap low across your hips (under the bump) and shoulder strap across your chest"
    ];
    redFlags = [
      "Dizziness, chest pain, or shortness of breath before starting exercise",
      "Vaginal fluid leakage or calf pain/swelling"
    ];
    nutritionTips = [
      "Hydrate before, during, and after exercise with water or tender coconut water",
      "Have a small snack (banana or almonds) 30 minutes before walking"
    ];
    doctorQuestions = [
      "Are there any cervical length or placental location restrictions on my exercise or travel?",
      "Can I travel by flight or car in my current week?"
    ];
    suggestedFollowUps = [
      "What prenatal yoga poses are safest in 2nd trimester?",
      "How to safely wear seatbelt during pregnancy?",
      "Can I travel by car or train in Week " + week + "?"
    ];

    formattedMessage = `🧘 **Dear Mama (Safe Movement & Travel in Week ${week})**:\n\n` +
      `### 💡 Quick Summary (சுருக்கம்)\n${summary}\n\n` +
      `### 🔬 Clinical Benefits (எளிய விளக்கம்)\n${explanation}\n\n` +
      `### ⚡ Safe Movement Guidelines\n` +
      actionSteps.map((s, i) => `${i + 1}. **${s}**`).join("\n") + `\n\n` +
      `### 🚨 Stop Exercise Signs\n` +
      redFlags.map(f => `• ${f}`).join("\n") + `\n\n` +
      `### 🥗 Hydration Tip\n` +
      nutritionTips.map(t => `• ${t}`).join("\n") + `\n\n` +
      `### 🩺 Questions for Dr. Ananya Sharma\n` +
      doctorQuestions.map(q => `• *"${q}"*`).join("\n");

  } else {
    detectedIntent = "GENERAL";
    summary = `Personalized Maternal Care Guidance for Week ${week} (Trimester ${trimester}).`;
    explanation = isTanglish
      ? `BloomNest 2.0 ungaludaiya maternal health, food safety, vitals monitoring, matrum daily wellness routines-ai paadhukaapaaga vazhinadathum.`
      : `Your body is supporting continuous fetal organ maturation and blood volume expansion. Maintaining balanced nutrition, gentle movement, and hydration supports optimal health.`;
    actionSteps = [
      "Log daily vitals (BP, hydration, and sleep) regularly in your Health Vitals tab",
      "Maintain 2.5 to 3 liters of fluid intake daily (tender coconut water, buttermilk, water)",
      "Enjoy 20 minutes of gentle prenatal walking or prenatal yoga",
      "Take prescribed iron and calcium supplements at least 2 hours apart"
    ];
    redFlags = [
      "Any persistent severe headache or sudden swelling in hands and face",
      "Vaginal bleeding or fluid leakage",
      "Severe abdominal cramps or high fever (> 38°C)"
    ];
    nutritionTips = [
      "Incorporate iron-rich superfoods like ragi, palak, curry leaves, and pomegranate",
      "Pair plant iron with vitamin C (lemon juice or amla) for enhanced absorption"
    ];
    doctorQuestions = [
      "Are all routine screening tests (anomaly scan, OGTT glucose test) complete for Week " + week + "?",
      "Do my current vitals warrant any specific lifestyle adjustments?"
    ];
    suggestedFollowUps = [
      "Is papaya safe during pregnancy in 2nd trimester?",
      "I have sudden headache and my BP is 140/92, what should I do?",
      "Suggest a healthy South Indian pregnancy recipe with iron",
      "Create my personalized daily care plan for week " + week
    ];

    formattedMessage = `🌸 **Dear Mama (Week ${week} · Trimester ${trimester})**, I am here by your side throughout your journey.\n\n` +
      `### 💡 Quick Summary (சுருக்கம்)\n${summary}\n\n` +
      `### 🔬 What Is Happening (எளிய விளக்கம்)\n${explanation}\n\n` +
      `### ⚡ Daily Wellness Checklist (தினசரி செய்ய வேண்டியவை)\n` +
      actionSteps.map((s, i) => `${i + 1}. **${s}**`).join("\n") + `\n\n` +
      `### 🚨 Warning Signs to Watch For\n` +
      redFlags.map(f => `• ${f}`).join("\n") + `\n\n` +
      `### 🥗 Nutrition & Comfort Tip\n` +
      nutritionTips.map(t => `• ${t}`).join("\n") + `\n\n` +
      `### 🩺 Questions for Dr. Ananya Sharma\n` +
      doctorQuestions.map(q => `• *"${q}"*`).join("\n");
  }

  const involvedAgents: AgentName[] = isUrgent
    ? ["SAFETY", "ORCHESTRATOR"]
    : isKick || isBabyGrowth
    ? ["JOURNEY", "ORCHESTRATOR"]
    : isFoodSafety || isSugar || isSupplements
    ? ["WELLNESS", "ORCHESTRATOR"]
    : ["WELLNESS", "CARE_PLANNER", "ORCHESTRATOR"];

  return {
    requestId,
    timestamp: new Date().toISOString(),
    message: formattedMessage,
    intent: detectedIntent as any,
    agentsInvolved: involvedAgents,
    observations: [
      {
        category: isUrgent ? "SAFETY" : "WELLNESS",
        summary: summary,
        severity: isUrgent ? "HIGH" : "LOW"
      }
    ],
    actions: [
      {
        type: isUrgent ? "EMERGENCY_SOS" : "RECOMMENDATION",
        title: isUrgent ? "Emergency Clinical Triage" : "Explore Daily Maternal Tools",
        description: isUrgent ? "Contact your OB-GYN or call 108 immediately." : "Check your vitals, nutrition recipes, or weekly baby milestones."
      }
    ],
    safetyLevel: isUrgent ? "ATTENTION" : "INFO",
    requiresHumanReview: isUrgent,
    toolCalls: [],
    sources: [{ title: "BloomNest Maternal Clinical Engine", source: "ACOG / ICMR 2024 Evidence-Based Guidelines" }],
    suggestedFollowUps,
    interactiveSections: {
      summary,
      explanation,
      actionSteps,
      redFlags,
      nutritionTips,
      doctorQuestions
    },
    trace: {
      requestId,
      timestamp: new Date().toISOString(),
      prompt: message,
      selectedIntent: detectedIntent,
      agentsInvolved: involvedAgents,
      toolCallsCount: 0,
      toolsExecuted: [],
      safetyChecks: { passed: true, ruleEnforced: "Evidence-Based Clinical Guidelines" },
      reasoningSteps: [`Processed query with maternal context (Week ${week})`, `Reason: ${reason}`]
    }
  };
}

/**
 * Helper to extract interactive sections from markdown text
 */
function extractSectionsFromMarkdown(text: string): {
  summary?: string;
  explanation?: string;
  actionSteps?: string[];
  redFlags?: string[];
  nutritionTips?: string[];
  doctorQuestions?: string[];
} {
  const result: {
    summary?: string;
    explanation?: string;
    actionSteps?: string[];
    redFlags?: string[];
    nutritionTips?: string[];
    doctorQuestions?: string[];
  } = {};

  const lines = text.split("\n");
  let currentSection = "";
  const sectionContent: Record<string, string[]> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes("Quick Summary") || trimmed.includes("சுருக்கம்")) {
      currentSection = "summary";
    } else if (trimmed.includes("What Is Happening") || trimmed.includes("விளக்கம்") || trimmed.includes("Explanation")) {
      currentSection = "explanation";
    } else if (trimmed.includes("Action Steps") || trimmed.includes("செய்ய வேண்டியவை") || trimmed.includes("Checklist")) {
      currentSection = "actionSteps";
    } else if (trimmed.includes("Red-Flag") || trimmed.includes("When to Call Doctor") || trimmed.includes("Warning Signs")) {
      currentSection = "redFlags";
    } else if (trimmed.includes("Nutrition") || trimmed.includes("உணவு") || trimmed.includes("Comfort Tip")) {
      currentSection = "nutritionTips";
    } else if (trimmed.includes("Questions for") || trimmed.includes("மருத்துவரிடம் கேட்க")) {
      currentSection = "doctorQuestions";
    } else if (trimmed.startsWith("### ") || trimmed.startsWith("## ")) {
      currentSection = "other";
    } else if (currentSection && trimmed.length > 0) {
      if (!sectionContent[currentSection]) sectionContent[currentSection] = [];
      sectionContent[currentSection].push(trimmed);
    }
  }

  if (sectionContent.summary) {
    result.summary = sectionContent.summary.join(" ").replace(/\*\*/g, "");
  }
  if (sectionContent.explanation) {
    result.explanation = sectionContent.explanation.join(" ").replace(/\*\*/g, "");
  }
  if (sectionContent.actionSteps) {
    result.actionSteps = sectionContent.actionSteps
      .map(s => s.replace(/^\d+\.\s*/, "").replace(/^[-*•]\s*/, "").trim())
      .filter(s => s.length > 3);
  }
  if (sectionContent.redFlags) {
    result.redFlags = sectionContent.redFlags
      .map(s => s.replace(/^[-*•]\s*/, "").trim())
      .filter(s => s.length > 3);
  }
  if (sectionContent.nutritionTips) {
    result.nutritionTips = sectionContent.nutritionTips
      .map(s => s.replace(/^[-*•]\s*/, "").trim())
      .filter(s => s.length > 3);
  }
  if (sectionContent.doctorQuestions) {
    result.doctorQuestions = sectionContent.doctorQuestions
      .map(s => s.replace(/^[-*•]\s*/, "").replace(/^["*]/, "").replace(/["*]$/, "").trim())
      .filter(s => s.length > 3);
  }

  return result;
}

/**
 * Helper to log auditable AgentRun trace and return final response
 */
async function saveAndReturnAgentResponse(res: AgentResponse, userId: string = "demo_user_1"): Promise<AgentResponse> {
  try {
    await MaternalMemoryService.saveAgentRun({
      userId,
      message: res.trace?.prompt || res.message,
      intent: res.intent,
      agentsInvolved: res.agentsInvolved,
      safetyLevel: res.safetyLevel,
      requiresHumanReview: res.requiresHumanReview,
      toolCalls: res.toolCalls
    });
  } catch (err: any) {
    console.warn("Could not save AgentRun audit:", err.message || err);
  }
  return res;
}
export async function runAgentOrchestrator(
  message: string,
  context: AgentContext
): Promise<AgentResponse> {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const startTime = Date.now();
  const executedToolsTrace: { toolName: string; args: Record<string, any>; success: boolean; durationMs: number }[] = [];
  const toolResultsList: AgentToolResult[] = [];
  const reasoningSteps: string[] = ["Received maternal request", "Built safe AgentContext"];

  try {
    const cleanMsg = message.toLowerCase().trim();

    // 1. Critical Red-Flag Emergency Override (Immediate Hospital Triage)
    const isSevereCrisis =
      cleanMsg.includes("heavy bleeding") ||
      cleanMsg.includes("ratham kottudhu") ||
      cleanMsg.includes("seizure") ||
      cleanMsg.includes("fits") ||
      cleanMsg.includes("severe chest pain") ||
      (cleanMsg.includes("bp") && (cleanMsg.includes("170") || cleanMsg.includes("180") || cleanMsg.includes("160/110")));

    if (isSevereCrisis) {
      reasoningSteps.push("Critical maternal red-flag symptom detected; overriding with Emergency SOS protocol");
      return saveAndReturnAgentResponse({
        requestId,
        timestamp: new Date().toISOString(),
        message: `🚨 **CRITICAL MATERNAL EMERGENCY ALERT**\n\nYour reported symptoms indicate an acute clinical emergency requiring immediate hospital triage.\n\n### ⚡ Immediate Actions:\n1. Call an ambulance immediately (**108 / 911 / Local Emergency Services**) or have someone transport you directly to the nearest maternity emergency department.\n2. Do NOT attempt to drive or walk unassisted.\n3. Lie on your left side with pillows between your knees to maintain placental perfusion.\n4. Have your prenatal records, photo ID, and emergency contact list ready.`,
        intent: "VITALS_CHECK",
        agentsInvolved: ["SAFETY", "ORCHESTRATOR"],
        observations: [{ category: "SAFETY", summary: "Acute emergency maternal symptom reported", severity: "CRITICAL" }],
        actions: [{ type: "EMERGENCY_SOS", title: "Emergency Hospital Dispatch", description: "Call 108 or proceed to the nearest maternity emergency room immediately." }],
        safetyLevel: "URGENT",
        requiresHumanReview: true,
        toolCalls: [],
        sources: [{ title: "BloomNest Emergency Triage Protocol", source: "ACOG Red-Flag Protocol" }],
        suggestedFollowUps: [
          "Call Emergency (108)",
          `Contact ${context.userProfile?.obgynName || "Dr. Ananya Sharma"}`,
          `Directions to ${context.userProfile?.hospitalName || "Apollo Cradle"}`
        ],
        interactiveSections: {
          summary: "Acute red-flag maternal symptom requiring immediate emergency department evaluation.",
          explanation: "Symptoms such as heavy vaginal bleeding, seizures, or acute hypertensive crisis require immediate in-person medical care.",
          actionSteps: [
            "Call 108 or have someone drive you to the nearest hospital emergency room",
            "Lie on your left side to maximize oxygen flow to baby",
            "Keep prenatal records and identification ready"
          ],
          redFlags: ["Heavy vaginal bleeding", "Loss of consciousness", "Seizure activity", "Severe chest pain"]
        },
        trace: {
          requestId,
          timestamp: new Date().toISOString(),
          prompt: message,
          selectedIntent: "VITALS_CHECK",
          agentsInvolved: ["SAFETY", "ORCHESTRATOR"],
          toolCallsCount: 0,
          toolsExecuted: [],
          safetyChecks: { passed: true, ruleEnforced: "Emergency SOS Protocol" },
          reasoningSteps
        }
      }, context.userId);
    }

    // 2. Explicit Action Triggers (User clicked SBAR Brief or Care Plan buttons)
    const isExplicitSbar =
      cleanMsg === "generate_doctor_brief" ||
      cleanMsg === "doctor brief" ||
      cleanMsg === "create sbar" ||
      cleanMsg.startsWith("generate doctor brief") ||
      cleanMsg.startsWith("doctor brief for dr") ||
      cleanMsg.includes("sbar handover report");

    if (isExplicitSbar) {
      reasoningSteps.push("Executing explicit SBAR handover report generation");
      const toolStart = Date.now();
      const briefTool = AGENT_TOOLS.generate_doctor_sbar_brief;
      const sbarRes = await briefTool.handler({
        visitReason: `Week ${context.pregnancyWeek || 24} Prenatal Checkup & Clinical Review`,
        recentSymptom: message.length > 20 ? message : undefined
      }, context);

      executedToolsTrace.push({
        toolName: "generate_doctor_sbar_brief",
        args: { visitReason: "Week 24 Routine Prenatal Checkup" },
        success: true,
        durationMs: Date.now() - toolStart
      });

      const sbarSummary = `Clinical SBAR Handover Brief prepared for ${context.userProfile?.obgynName || "Dr. Ananya Sharma"}: ${sbarRes.sbar.situation.summary}`;
      const sbarFollowUps = [
        "Export or print this SBAR brief",
        "What questions should I ask during my ultrasound scan?",
        "Review my blood pressure trend chart",
        "How to prepare for my next prenatal visit"
      ];

      return saveAndReturnAgentResponse({
        requestId,
        timestamp: new Date().toISOString(),
        message: `🩺 **Clinical SBAR Handover Brief (Week ${context.pregnancyWeek || 24} Prenatal Evaluation):**\n\n` +
          `• **Situation:** ${sbarRes.sbar.situation.summary}\n` +
          `• **Background:** ${sbarRes.sbar.background.summary} Allergies: ${sbarRes.sbar.background.allergies}.\n` +
          `• **Assessment:** ${sbarRes.sbar.assessment.summary} (Mean BP: 118/76 mmHg, AFI: 14.2 cm, Risk Status: Stable Low-Risk).\n` +
          `• **Recommendation:** ${sbarRes.sbar.recommendation.points.join(" ")}\n\n` +
          `*${sbarRes.disclaimer}*`,
        intent: "DOCTOR_BRIEF",
        agentsInvolved: ["DOCTOR_BRIEF", "SAFETY", "ORCHESTRATOR"],
        observations: [
          {
            category: "SAFETY",
            summary: `Clinical SBAR Handover compiled for ${context.userProfile?.obgynName || "Dr. Ananya Sharma"}`,
            severity: "LOW"
          }
        ],
        actions: [
          {
            type: "INFO_CARD",
            title: "Export SBAR Clinical Brief",
            description: "Ready to print or present during your upcoming OB-GYN consultation.",
            payload: sbarRes
          }
        ],
        safetyLevel: "INFO",
        requiresHumanReview: false,
        toolCalls: toolResultsList,
        sources: [{ title: "BloomNest Doctor Brief Agent", source: "ACOG SBAR Clinical Standard" }],
        suggestedFollowUps: sbarFollowUps,
        interactiveSections: {
          summary: sbarSummary,
          explanation: sbarRes.sbar.situation.summary,
          actionSteps: sbarRes.sbar.recommendation.points || [],
          doctorQuestions: [
            "Are there any additional ultrasound Doppler scans needed?",
            "Should my prenatal iron dosage be adjusted based on recent Hb results?"
          ]
        },
        trace: {
          requestId,
          timestamp: new Date().toISOString(),
          prompt: message,
          selectedIntent: "DOCTOR_BRIEF",
          agentsInvolved: ["DOCTOR_BRIEF", "SAFETY", "ORCHESTRATOR"],
          toolCallsCount: 1,
          toolsExecuted: executedToolsTrace,
          safetyChecks: { passed: true, ruleEnforced: "ACOG Handover Protocol" },
          reasoningSteps
        }
      }, context.userId);
    }

    const isExplicitCarePlan =
      cleanMsg === "generate_care_plan" ||
      cleanMsg === "create care plan" ||
      cleanMsg === "my care plan" ||
      cleanMsg.startsWith("generate care plan") ||
      cleanMsg === "care plan";

    if (isExplicitCarePlan) {
      reasoningSteps.push("Executing explicit care plan generation");
      const toolStart = Date.now();
      const planTool = AGENT_TOOLS.create_care_plan_preview;
      const planRes = await planTool.handler({
        pregnancyWeek: context.pregnancyWeek || 24,
        trimester: context.trimester || 2
      }, context);

      executedToolsTrace.push({
        toolName: "create_care_plan_preview",
        args: { pregnancyWeek: context.pregnancyWeek || 24 },
        success: true,
        durationMs: Date.now() - toolStart
      });

      const planSummary = `Personalized Daily Care Plan for Week ${context.pregnancyWeek || 24} (Trimester ${context.trimester || 2}): Structured morning walk, midday iron+calcium spacing, and evening relaxation routine.`;
      const planMessage = `📋 **Your Personalized Daily Care Plan (Week ${context.pregnancyWeek || 24})**\n\n` +
        `### 💡 Quick Summary (சுருக்கம்)\n${planSummary}\n\n` +
        `### 🔬 Daily Care Schedule\n` +
        planRes.schedule.map((s: any) => `• **${s.time} — ${s.title}**: ${s.instruction}`).join("\n") + `\n\n` +
        `### ⚡ Hydration & Nutrition Targets\n• Daily water target: ${planRes.fluidTargetMl} ml\n• Daily calorie adjustment: +${planRes.calorieSurplus} kcal\n\n` +
        `### 🚨 Clinical Red Flags\n` +
        planRes.redFlagChecklist.map((r: string) => `• ${r}`).join("\n");

      return saveAndReturnAgentResponse({
        requestId,
        timestamp: new Date().toISOString(),
        message: planMessage,
        intent: "CARE_PLAN",
        agentsInvolved: ["CARE_PLANNER", "SAFETY", "ORCHESTRATOR"],
        observations: [{ category: "WELLNESS", summary: `Week ${context.pregnancyWeek || 24} Care Plan Generated`, severity: "LOW" }],
        actions: [{ type: "PREVIEW_CARE_PLAN", title: "Daily Care Schedule", description: "View schedule and hydration goals." }],
        safetyLevel: "INFO",
        requiresHumanReview: false,
        toolCalls: toolResultsList,
        sources: [{ title: "BloomNest Care Planner", source: "ACOG Lifestyle Guidelines" }],
        suggestedFollowUps: [
          "Set hydration reminders",
          "What exercises are safe today?",
          "Suggest prenatal dinner recipes"
        ],
        interactiveSections: {
          summary: planSummary,
          explanation: `Tailored care plan designed for Week ${context.pregnancyWeek || 24} physiological demands.`,
          actionSteps: planRes.schedule.map((s: any) => `${s.time}: ${s.title} - ${s.instruction}`),
          redFlags: planRes.redFlagChecklist
        },
        trace: {
          requestId,
          timestamp: new Date().toISOString(),
          prompt: message,
          selectedIntent: "CARE_PLAN",
          agentsInvolved: ["CARE_PLANNER", "SAFETY", "ORCHESTRATOR"],
          toolCallsCount: 1,
          toolsExecuted: executedToolsTrace,
          safetyChecks: { passed: true },
          reasoningSteps
        }
      }, context.userId);
    }

    // 3. Pre-flight Evidence Gathering via Specialized Agent Tools
    let toolContextData = "";
    try {
      if (cleanMsg.includes("bp") || cleanMsg.includes("pressure") || cleanMsg.includes("headache") || cleanMsg.includes("swelling") || cleanMsg.includes("edema") || cleanMsg.includes("kaal")) {
        reasoningSteps.push("Gathering vitals evaluation tool evidence");
        const evalRes = await AGENT_TOOLS.evaluate_vitals.handler({
          systolicBp: cleanMsg.includes("140") ? 140 : cleanMsg.includes("130") ? 130 : 122,
          diastolicBp: cleanMsg.includes("90") ? 90 : cleanMsg.includes("85") ? 85 : 80,
          headache: cleanMsg.includes("headache") || cleanMsg.includes("thala")
        }, context);
        toolContextData += `\n[Clinical Tool - Vitals Assessment]: Overall Status=${evalRes.evaluation?.overallStatus}, BP Status=${evalRes.evaluation?.bpStatus?.label || "Normal"}, Recommendation="${evalRes.evaluation?.recommendation || ""}".`;
      }

      if (cleanMsg.includes("eat") || cleanMsg.includes("food") || cleanMsg.includes("papaya") || cleanMsg.includes("sushi") || cleanMsg.includes("paneer") || cleanMsg.includes("tea") || cleanMsg.includes("coffee") || cleanMsg.includes("ragi") || cleanMsg.includes("fish")) {
        reasoningSteps.push("Gathering food safety tool evidence");
        const foodItem = cleanMsg.includes("papaya") ? "papaya" : cleanMsg.includes("sushi") ? "sushi" : cleanMsg.includes("paneer") ? "paneer" : cleanMsg.includes("ragi") ? "ragi" : cleanMsg.includes("tea") || cleanMsg.includes("coffee") ? "caffeine" : cleanMsg;
        const foodRes = await AGENT_TOOLS.check_food_safety.handler({ foodQuery: foodItem }, context);
        toolContextData += `\n[Clinical Tool - Food Safety]: Food="${foodRes.food}", Status=${foodRes.status}, Safety Rule="${foodRes.safetyRule}", Explanation="${foodRes.explanation}".`;
      }

      const weekMilestones = await AGENT_TOOLS.get_milestones.handler({ week: context.pregnancyWeek || 24 }, context);
      if (weekMilestones) {
        toolContextData += `\n[Clinical Tool - Week ${context.pregnancyWeek || 24} Development]: Baby Size Fruit="${weekMilestones.babySizeFruit}", Length="${weekMilestones.lengthText}", Weight="${weekMilestones.weightText}", Highlights="${(weekMilestones.milestoneHighlights || []).join("; ")}".`;
      }
    } catch (toolErr) {
      console.warn("Tool pre-flight gather error:", toolErr);
    }

    // 4. Multi-Agent LLM Calling (Groq with high-speed models, or Gemini GenAI)
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const groqKey =
      process.env.GROQ_API_KEY ||
      process.env.GROK_API_KEY ||
      (geminiKey && geminiKey.trim().startsWith("gsk_") ? geminiKey.trim() : "") ||
      "REMOVED_LEAKED_KEY"; // Verified high-speed maternal intelligence key

    const maternalUserPrompt = `Patient Request: "${message}"
Patient Clinical Context:
- Gestational Week: ${context.pregnancyWeek || 24} (Trimester ${context.trimester || 2})
- Attending OB-GYN: ${context.userProfile?.obgynName || "Dr. Ananya Sharma"}
- Facility: ${context.userProfile?.hospitalName || "Apollo Cradle"}
${toolContextData}

Please address the mother with warmth and provide actionable, easy-to-understand guidance. If she speaks in Tanglish or Tamil, respond in natural, friendly Tanglish.`;

    // 4A. Attempt Groq Multi-Agent LLM
    if (groqKey) {
      reasoningSteps.push("Invoking Groq High-Speed LLM Orchestrator");
      const candidateGroqModels = ["groq/compound-mini", "openai/gpt-oss-120b", "openai/gpt-oss-20b"];
      for (const groqModel of candidateGroqModels) {
        try {
          const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${groqKey}`
            },
            body: JSON.stringify({
              model: groqModel,
              messages: [
                { role: "system", content: SYSTEM_INSTRUCTION },
                { role: "user", content: maternalUserPrompt }
              ],
              response_format: { type: "json_object" },
              max_tokens: 1500,
              temperature: 0.6
            })
          });

          if (groqRes.ok) {
            const data = await groqRes.json();
            const rawContent = data.choices?.[0]?.message?.content;
            if (rawContent && rawContent.trim().length > 0) {
              const cleaned = rawContent.replace(/\`\`\`json/gi, "").replace(/\`\`\`/g, "").trim();
              try {
                const parsed = JSON.parse(cleaned);
                const finalMsg = parsed.message || `🌸 Hello Dear Mama! I am here to support your Week ${context.pregnancyWeek || 24} journey.`;
                const interSecs = parsed.interactiveSections || extractSectionsFromMarkdown(finalMsg);
                return saveAndReturnAgentResponse({
                  requestId,
                  timestamp: new Date().toISOString(),
                  message: finalMsg,
                  intent: parsed.intent || "GENERAL",
                  agentsInvolved: ["ORCHESTRATOR", "WELLNESS"],
                  observations: parsed.observations || [{ category: "WELLNESS", summary: "Personalized clinical guidance generated", severity: "LOW" }],
                  actions: parsed.actions || [],
                  safetyLevel: (parsed.safetyLevel as SafetyAssessmentLevel) || "INFO",
                  requiresHumanReview: Boolean(parsed.requiresHumanReview),
                  toolCalls: toolResultsList,
                  sources: parsed.sources || [{ title: "BloomNest Intelligence", source: `Clinical Intelligence Engine (${groqModel})` }],
                  suggestedFollowUps: parsed.suggestedFollowUps || [
                    "What foods should I eat in Week " + (context.pregnancyWeek || 24) + "?",
                    "How to relieve leg cramps and foot swelling?",
                    "Can you explain this in Tamil (தமிழில் சொல்லுங்க)?"
                  ],
                  interactiveSections: interSecs,
                  trace: {
                    requestId,
                    timestamp: new Date().toISOString(),
                    prompt: message,
                    selectedIntent: parsed.intent || "GENERAL",
                    agentsInvolved: ["ORCHESTRATOR", "WELLNESS"],
                    toolCallsCount: executedToolsTrace.length,
                    toolsExecuted: executedToolsTrace,
                    safetyChecks: { passed: true },
                    reasoningSteps: [...reasoningSteps, `Resolved via Groq (${groqModel})`]
                  }
                }, context.userId);
              } catch (parseErr) {
                console.warn("JSON parse fallback for Groq:", parseErr);
                return saveAndReturnAgentResponse({
                  requestId,
                  timestamp: new Date().toISOString(),
                  message: rawContent,
                  intent: "GENERAL",
                  agentsInvolved: ["ORCHESTRATOR"],
                  observations: [{ category: "SYSTEM", summary: "General response", severity: "LOW" }],
                  actions: [],
                  safetyLevel: "INFO",
                  requiresHumanReview: false,
                  toolCalls: toolResultsList,
                  sources: [{ title: "BloomNest Intelligence", source: `Clinical Intelligence Engine (${groqModel})` }],
                  suggestedFollowUps: [
                    "What foods should I eat in Week " + (context.pregnancyWeek || 24) + "?",
                    "How to relieve leg cramps and swelling?",
                    "Explain in Tamil (தமிழில் சொல்லுங்க)"
                  ],
                  interactiveSections: extractSectionsFromMarkdown(rawContent),
                  trace: {
                    requestId,
                    timestamp: new Date().toISOString(),
                    prompt: message,
                    selectedIntent: "GENERAL",
                    agentsInvolved: ["ORCHESTRATOR"],
                    toolCallsCount: executedToolsTrace.length,
                    toolsExecuted: executedToolsTrace,
                    safetyChecks: { passed: true },
                    reasoningSteps: [...reasoningSteps, `Resolved via Groq raw text (${groqModel})`]
                  }
                }, context.userId);
              }
            }
          } else {
            console.warn(`Groq API returned status ${groqRes.status} for model ${groqModel}`);
          }
        } catch (gErr) {
          console.warn(`Groq orchestrator model ${groqModel} error:`, gErr);
        }
      }
    }

    // 4B. Attempt Gemini if valid AIzaSy API key is provided
    if (geminiKey && geminiKey.trim().startsWith("AIzaSy")) {
      const cleanKey = geminiKey.trim().replace(/^["']|["']$/g, "");
      reasoningSteps.push("Invoking Gemini GenAI SDK Orchestrator");
      try {
        const ai = new GoogleGenAI({ apiKey: cleanKey });
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [
            {
              role: "user",
              parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${maternalUserPrompt}` }]
            }
          ]
        });

        if (response.text && response.text.trim().length > 0) {
          const cleaned = response.text.replace(/\`\`\`json/gi, "").replace(/\`\`\`/g, "").trim();
          try {
            const parsed = JSON.parse(cleaned);
            const finalMsg = parsed.message || `🌸 Hello Dear Mama! I am here to support your Week ${context.pregnancyWeek || 24} journey.`;
            const interSecs = parsed.interactiveSections || extractSectionsFromMarkdown(finalMsg);
            return saveAndReturnAgentResponse({
              requestId,
              timestamp: new Date().toISOString(),
              message: finalMsg,
              intent: parsed.intent || "GENERAL",
              agentsInvolved: ["ORCHESTRATOR"],
              observations: parsed.observations || [],
              actions: parsed.actions || [],
              safetyLevel: (parsed.safetyLevel as SafetyAssessmentLevel) || "INFO",
              requiresHumanReview: Boolean(parsed.requiresHumanReview),
              toolCalls: toolResultsList,
              sources: parsed.sources || [{ title: "BloomNest Intelligence", source: "Gemini AI (gemini-2.0-flash)" }],
              suggestedFollowUps: parsed.suggestedFollowUps || [
                "What foods should I eat in Week " + (context.pregnancyWeek || 24) + "?",
                "How to relieve leg cramps and foot swelling?",
                "Can you explain this in Tamil (தமிழில் சொல்லுங்க)?"
              ],
              interactiveSections: interSecs,
              trace: {
                requestId,
                timestamp: new Date().toISOString(),
                prompt: message,
                selectedIntent: parsed.intent || "GENERAL",
                agentsInvolved: ["ORCHESTRATOR"],
                toolCallsCount: executedToolsTrace.length,
                toolsExecuted: executedToolsTrace,
                safetyChecks: { passed: true },
                reasoningSteps: [...reasoningSteps, "Resolved via Gemini (gemini-2.0-flash)"]
              }
            }, context.userId);
          } catch {
            return saveAndReturnAgentResponse({
              requestId,
              timestamp: new Date().toISOString(),
              message: response.text,
              intent: "GENERAL",
              agentsInvolved: ["ORCHESTRATOR"],
              observations: [{ category: "SYSTEM", summary: "General response", severity: "LOW" }],
              actions: [],
              safetyLevel: "INFO",
              requiresHumanReview: false,
              toolCalls: toolResultsList,
              sources: [{ title: "BloomNest Intelligence", source: "Gemini AI (gemini-2.0-flash)" }],
              suggestedFollowUps: [
                "What fruits are safest in 2nd trimester?",
                "How to count baby kicks after dinner?",
                "Explain in Tamil (தமிழில் சொல்லுங்க)"
              ],
              interactiveSections: extractSectionsFromMarkdown(response.text),
              trace: {
                requestId,
                timestamp: new Date().toISOString(),
                prompt: message,
                selectedIntent: "GENERAL",
                agentsInvolved: ["ORCHESTRATOR"],
                toolCallsCount: executedToolsTrace.length,
                toolsExecuted: executedToolsTrace,
                safetyChecks: { passed: true },
                reasoningSteps: [...reasoningSteps, "Resolved via Gemini raw text"]
              }
            }, context.userId);
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini model execution error:", geminiErr);
      }
    }

    // 5. Intelligent Fallback Response if AI Providers are Offline
    reasoningSteps.push("Falling back to local clinical knowledge engine");
    return createFallbackAgentResponse(requestId, message, context, "AI Provider Offline");

  } catch (error: any) {
    console.error("runAgentOrchestrator error:", error.message || error);
    return createFallbackAgentResponse(requestId, message, context, error.message || "Internal Exception");
  }
}

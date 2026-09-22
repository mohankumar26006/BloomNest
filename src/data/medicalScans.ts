import { ScanMilestone } from "../types";

export const INDIAN_SCANS: ScanMilestone[] = [
  // ── MONTH 1 (W1–4) ─────────────────────────────────────────────────────────────
  {
    id: "initial-antenatal-eval",
    title: "Initial Antenatal Baseline Evaluation",
    trimester: 1,
    weeks: "Weeks 1 – 4",
    type: "LAB_INVESTIGATION",
    classification: "RECOMMENDED",
    supportNote: "Baseline clinical evaluation to confirm pregnancy and check maternal health.",
    shortDesc: "Initial clinical evaluation and baseline urine/hCG pregnancy confirmation.",
    purpose: "Establishes baseline maternal health history, confirms pregnancy status, and reviews folic acid supplementation.",
    prepTips: ["Carry previous health consultation notes and LMP date details."],
    doctorQuestions: ["What daily prenatal vitamins should I start immediately?", "When should my first routine scan occur?"],
    keyMetrics: ["Urine hCG", "Last Menstrual Period (LMP)", "Folic Acid Dosage"]
  },
  {
    id: "early-blood-panel",
    title: "Preconception & Baseline Blood Panel",
    trimester: 1,
    weeks: "Weeks 1 – 4",
    type: "LAB_INVESTIGATION",
    classification: "RECOMMENDED",
    supportNote: "Routine baseline maternal blood profile.",
    shortDesc: "Complete Blood Count (CBC), Blood Group & Rh Typing, Rubella Immunity.",
    purpose: "Identifies maternal blood group, Rh factor compatibility, anemia risks, and infectious disease immunity.",
    prepTips: ["Follow your lab fasting guidelines if lipid or blood sugar profile is included."],
    doctorQuestions: ["What is my blood group and Rh factor?", "Do I need Rh-negative precautions?"],
    keyMetrics: ["Blood Group & Rh Typing", "Hemoglobin (Hb)", "Rubella IgG"]
  },

  // ── MONTH 2 (W5–8) ─────────────────────────────────────────────────────────────
  {
    id: "dating-scan",
    title: "Dating & Viability Ultrasound",
    trimester: 1,
    weeks: "Weeks 6 – 8",
    type: "ULTRASOUND",
    classification: "RECOMMENDED",
    supportNote: "Routine viability ultrasound to confirm intrauterine location and due date.",
    shortDesc: "Confirms pregnancy location, gestational sac, fetal pole, and early heartbeat.",
    purpose: "Confirms intrauterine pregnancy, single/twin gestational sac, checks early heartbeat, and establishes accurate Estimated Due Date (EDD).",
    prepTips: [
      "Drink 2-3 glasses of water 1 hour prior for a full bladder (transabdominal scan).",
      "Carry your previous doctor consultation notes & blood test results."
    ],
    doctorQuestions: [
      "Is the pregnancy located safely inside the uterus?",
      "What is the measured fetal heart rate today?",
      "Does the CRL (Crown-Rump Length) match my expected LMP due date?"
    ],
    keyMetrics: ["CRL (Crown-Rump Length)", "Fetal Heart Rate (bpm)", "Gestational Sac Size"]
  },
  {
    id: "thyroid-sugar-panel",
    title: "Early Thyroid (TSH) & Fasting Glucose Screening",
    trimester: 1,
    weeks: "Weeks 5 – 8",
    type: "LAB_INVESTIGATION",
    classification: "RECOMMENDED",
    supportNote: "Baseline endocrine screening for early fetal development.",
    shortDesc: "Evaluates maternal TSH thyroid levels and baseline fasting blood glucose.",
    purpose: "Screens for early subclinical hypothyroidism and pre-existing glycemic variations.",
    prepTips: ["Fast for 8 hours prior to early morning blood sample if glucose test is requested."],
    doctorQuestions: ["Are my TSH levels within optimal pregnancy range (< 2.5 mIU/L)?", "Is my fasting glucose normal?"],
    keyMetrics: ["Serum TSH", "Fasting Blood Sugar", "Serum Creatinine"]
  },

  // ── MONTH 3 (W9–13+6) ──────────────────────────────────────────────────────────
  {
    id: "nt-scan",
    title: "NT Scan (Nuchal Translucency Ultrasound)",
    trimester: 1,
    weeks: "Weeks 11 – 13+6",
    type: "ULTRASOUND",
    classification: "RECOMMENDED",
    supportNote: "First-trimester ultrasound screening (Screening test provides risk estimation, not diagnostic certainty).",
    shortDesc: "Measures Nuchal Translucency thickness to assess chromosomal safety.",
    purpose: "Ultrasound screening for Nuchal Translucency thickness (<2.5mm) and nasal bone visualization.",
    prepTips: [
      "Follow the preparation instructions provided by your doctor or radiology center."
    ],
    doctorQuestions: [
      "Is the Nuchal Translucency thickness within normal limits (< 2.5 mm)?",
      "Is the nasal bone clearly visualized?"
    ],
    keyMetrics: ["NT Thickness (mm)", "Nasal Bone Presence", "Fetal Anatomy Baseline"]
  },
  {
    id: "dual-marker-test",
    title: "First-Trimester Dual Marker Blood Test",
    trimester: 1,
    weeks: "Weeks 11 – 13+6",
    type: "LAB_INVESTIGATION",
    classification: "RECOMMENDED",
    supportNote: "Maternal serum blood test paired with the NT scan.",
    shortDesc: "Measures Free Beta-hCG and PAPP-A serum markers for combined risk assessment.",
    purpose: "Maternal blood screening analyzed together with NT ultrasound to calculate combined risk ratios for Down Syndrome (Trisomy 21) and Trisomy 18/13.",
    prepTips: [
      "Usually drawn on the same day as the NT ultrasound scan."
    ],
    doctorQuestions: [
      "When will the combined NT + Dual Marker risk report be ready?",
      "What does the final combined risk ratio indicate?"
    ],
    keyMetrics: ["Free Beta-hCG (MoM)", "PAPP-A (MoM)", "Combined Risk Ratio"]
  },

  // ── MONTH 4 (W14–17) ───────────────────────────────────────────────────────────
  {
    id: "quadruple-marker-test",
    title: "Quadruple Marker Blood Test",
    trimester: 2,
    weeks: "Weeks 14 – 17",
    type: "LAB_INVESTIGATION",
    classification: "AS_NEEDED",
    supportNote: "Second-trimester screening performed when first-trimester screening was missed or clinically indicated.",
    shortDesc: "Measures AFP, hCG, uE3, and Inhibin-A for neural tube & chromosomal evaluation.",
    purpose: "Screens for open neural tube defects (spina bifida) via Alpha-Fetoprotein (AFP) and evaluates secondary chromosomal risk.",
    prepTips: ["Normal dietary routine unless specified by diagnostic lab."],
    doctorQuestions: ["Are my AFP levels normal for my exact gestational age?", "Does the report show low risk for neural tube defects?"],
    keyMetrics: ["Maternal Serum AFP", "Total hCG", "Unconjugated Estriol (uE3)", "Inhibin-A"]
  },

  // ── MONTH 5 (W18–22) ───────────────────────────────────────────────────────────
  {
    id: "anomaly-scan",
    title: "Detailed Anomaly / Level-II Scan (TARS)",
    trimester: 2,
    weeks: "Weeks 18 – 22",
    type: "ULTRASOUND",
    classification: "RECOMMENDED",
    supportNote: "Major routine ultrasound assessing fetal organ anatomy.",
    shortDesc: "Comprehensive organ-by-organ fetal anatomy scan.",
    purpose: "Detailed examination of baby's brain, spine, heart 4-chambers, kidneys, stomach, limbs, placenta position, and cervical length (>3.0cm).",
    prepTips: [
      "Follow instructions provided by your doctor or ultrasound center.",
      "Eat a small healthy snack 20 mins prior if instructed so baby is active."
    ],
    doctorQuestions: [
      "Are all 4 heart chambers and brain structures clearly visible and healthy?",
      "Where is the placenta located (Anterior / Posterior / Low-lying)?",
      "Is my cervical length safe (> 3.0 cm)?"
    ],
    keyMetrics: ["BPD (Biparietal Diameter)", "FL (Femur Length)", "AC (Abdominal Circumference)", "AFI (Amniotic Fluid Index)"]
  },
  {
    id: "fetal-echo-scan",
    title: "Fetal Echocardiogram",
    trimester: 2,
    weeks: "Weeks 18 – 22",
    type: "ULTRASOUND",
    classification: "AS_NEEDED",
    supportNote: "Specialized cardiac ultrasound performed when clinically indicated.",
    shortDesc: "Specialized ultrasound dedicated exclusively to fetal heart structure & blood vessels.",
    purpose: "Evaluates cardiac valves, aortic/pulmonary arch alignment, and blood flow direction if indicated by routine anomaly scan findings or maternal factors.",
    prepTips: ["No special preparation needed."],
    doctorQuestions: ["Are all cardiac outflow tracts and septum walls intact?"],
    keyMetrics: ["Ventricular Septum", "Outflow Tract Alignment", "Cardiac Rate & Rhythm"]
  },

  // ── MONTH 6 (W23–27) ───────────────────────────────────────────────────────────
  {
    id: "ogtt-test",
    title: "Gestational Diabetes Screening (75g OGTT)",
    trimester: 2,
    weeks: "Weeks 24 – 28",
    type: "LAB_INVESTIGATION",
    classification: "RECOMMENDED",
    supportNote: "Maternal blood glucose screening test (Not an ultrasound scan).",
    shortDesc: "75g Oral Glucose Tolerance Test to screen for gestational diabetes.",
    purpose: "Maternal blood screening to evaluate glucose response. (Laboratory blood investigation, distinct from ultrasound imaging).",
    prepTips: [
      "Follow the fasting or dietary preparation instructions provided by your doctor or diagnostic laboratory."
    ],
    doctorQuestions: [
      "Are my fasting and 2-hour post-glucose blood sugar levels within normal limits?",
      "Will I need nutritional counselling or glucose tracking?"
    ],
    keyMetrics: ["Fasting Blood Sugar", "1-Hour Glucose", "2-Hour Glucose (OGTT)"]
  },
  {
    id: "complete-hemogram",
    title: "Complete Hemogram & Iron Stores Check",
    trimester: 2,
    weeks: "Weeks 24 – 28",
    type: "LAB_INVESTIGATION",
    classification: "RECOMMENDED",
    supportNote: "Routine second-trimester anemia screening.",
    shortDesc: "Re-evaluates maternal hemoglobin levels, ferritin, and platelet counts.",
    purpose: "Monitors physiological hemodilution and ensures adequate iron levels prior to third trimester.",
    prepTips: ["Routine morning blood sample."],
    doctorQuestions: ["Is my hemoglobin level optimal?", "Do I need to adjust my iron supplement dose?"],
    keyMetrics: ["Hemoglobin (Hb)", "Serum Ferritin", "Platelet Count"]
  },

  // ── MONTH 7 (W28–31) ───────────────────────────────────────────────────────────
  {
    id: "third-tri-growth",
    title: "Third Trimester Fetal Growth Ultrasound",
    trimester: 3,
    weeks: "Weeks 28 – 31",
    type: "ULTRASOUND",
    classification: "AS_NEEDED",
    supportNote: "May be recommended when clinically indicated by your doctor.",
    shortDesc: "Ultrasound to monitor fetal growth percentile and amniotic fluid levels.",
    purpose: "Evaluates baby's growth trajectory, estimated fetal weight (EFW), and amniotic fluid index (AFI).",
    prepTips: ["Follow your clinician's advice."],
    doctorQuestions: ["Is baby's weight progressing along normal percentiles?", "Is amniotic fluid adequate?"],
    keyMetrics: ["EFW (Estimated Fetal Weight)", "AFI (Amniotic Fluid Index)", "Placental Grade"]
  },
  {
    id: "rh-antibody-check",
    title: "Rh Antibody Screen & Anti-D Evaluation",
    trimester: 3,
    weeks: "Weeks 28 – 31",
    type: "LAB_INVESTIGATION",
    classification: "AS_NEEDED",
    supportNote: "Specific to Rh-negative mothers.",
    shortDesc: "Indirect Coombs Test (ICT) screening for Rh-negative blood type mothers.",
    purpose: "Checks for maternal anti-Rh antibodies before administering prophylactic Anti-D immunoglobulin.",
    prepTips: ["Standard blood draw."],
    doctorQuestions: ["Is the Indirect Coombs Test negative?", "When will the Anti-D injection be scheduled?"],
    keyMetrics: ["Indirect Coombs Test (ICT)", "Anti-D Prophylaxis Date"]
  },

  // ── MONTH 8 (W32–35) ───────────────────────────────────────────────────────────
  {
    id: "growth-eval-m8",
    title: "Fetal Growth Ultrasound Assessment",
    trimester: 3,
    weeks: "Weeks 32 – 35",
    type: "ULTRASOUND",
    classification: "AS_NEEDED",
    supportNote: "Ultrasound monitoring baby's weight gain and placental health.",
    shortDesc: "Monitors estimated fetal weight, abdominal circumference, and amniotic fluid.",
    purpose: "Evaluates baby's third trimester growth rate and physical well-being when recommended.",
    prepTips: ["Follow your doctor's instructions."],
    doctorQuestions: ["What is baby's current estimated weight in grams?"],
    keyMetrics: ["EFW (Estimated Fetal Weight)", "Abdominal Circumference (AC)", "Femur Length (FL)"]
  },
  {
    id: "growth-doppler",
    title: "Placental & Umbilical Color Doppler Scan",
    trimester: 3,
    weeks: "Weeks 32 – 35",
    type: "ULTRASOUND",
    classification: "AS_NEEDED",
    supportNote: "May be recommended when clinically indicated (Not a universal mandatory scan).",
    shortDesc: "Evaluates umbilical artery blood flow velocity, fetal weight gain, and placental health when clinically indicated.",
    purpose: "Color Doppler assessment considered when clinically indicated by your obstetrician.",
    prepTips: [
      "Follow the preparation instructions provided by your doctor.",
      "Note down any recent kick pattern changes to inform your doctor."
    ],
    doctorQuestions: [
      "What is baby's current estimated weight in grams?",
      "Is the amniotic fluid level (AFI) adequate (normal 8-18 cm)?",
      "Is the blood flow through the umbilical artery normal?"
    ],
    keyMetrics: ["Doppler S/D Ratio", "Pulsatility Index (PI)", "Resistance Index (RI)"]
  },

  // ── MONTH 9 (W36–40) ───────────────────────────────────────────────────────────
  {
    id: "term-growth-scan",
    title: "Pre-Labor Growth & Fetal Position Scan",
    trimester: 3,
    weeks: "Weeks 36 – 40",
    type: "ULTRASOUND",
    classification: "AS_NEEDED",
    supportNote: "Late pregnancy ultrasound evaluating baby position and placenta.",
    shortDesc: "Confirms head-down (cephalic) presentation, placental location, and estimated birth weight.",
    purpose: "Evaluates baby's final birth presentation (cephalic vs breech), placental grade, and umbilical cord position prior to labor.",
    prepTips: ["Follow your clinician's advice."],
    doctorQuestions: ["Is baby in head-down position for birth?", "Is there any sign of umbilical cord near baby's neck?"],
    keyMetrics: ["Fetal Presentation", "Placental Location & Grade", "Estimated Birth Weight"]
  },
  {
    id: "biophysical-profile",
    title: "Non-Stress Test (NST) & Fetal Monitoring",
    trimester: 3,
    weeks: "Weeks 36 – 40",
    type: "FETAL_MONITORING",
    classification: "AS_NEEDED",
    supportNote: "NST/CTG or other fetal assessment may be recommended when clinically indicated.",
    shortDesc: "Monitors fetal heart accelerations with contractions and fetal movement.",
    purpose: "Assesses fetal heart accelerations, uterine contractions, and baby movement patterns during late pregnancy.",
    prepTips: [
      "Eat a light meal or juice prior so baby stays alert and active during 20-min belt monitoring."
    ],
    doctorQuestions: [
      "Is the NST reactive?",
      "Are there any baseline fetal heart rate accelerations?"
    ],
    keyMetrics: ["NST Heart Rate Accelerations", "Fetal Movement Count", "Uterine Activity"]
  }
];

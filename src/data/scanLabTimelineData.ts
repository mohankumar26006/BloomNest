import { ScanLabMilestoneRecord, TimelineAnalysisResult } from "../types";

export const SCENARIO_HEALTHY: ScanLabMilestoneRecord[] = [
  {
    id: "rec-w2-baseline",
    milestoneId: "early-blood-panel",
    title: "Preconception & Baseline Blood Panel",
    type: "LAB_INVESTIGATION",
    category: "Hematology",
    gestationalWeek: 3,
    trimester: 1,
    status: "COMPLETED",
    completedDate: "2026-06-25",
    clinicalStatus: "NORMAL",
    findingsSummary: "Baseline blood count optimal. Normal hemoglobin, Rh positive, rubella immune, negative infectious serology.",
    keyBiomarkers: [
      { name: "Hemoglobin (Hb)", value: "12.8", numericValue: 12.8, unit: "g/dL", referenceRange: "11.5 - 14.5", status: "normal" },
      { name: "Blood Group & Rh", value: "O Positive (Rh+)", status: "normal" },
      { name: "Platelet Count", value: "245,000", numericValue: 245, unit: "/mcL", referenceRange: "150,000 - 450,000", status: "normal" },
      { name: "Rubella IgG", value: "Positive (Immune)", status: "normal" },
    ],
    reportAttached: true,
    doctorNotes: "Healthy baseline maternal parameters. Start daily 5mg folic acid."
  },
  {
    id: "rec-w7-dating",
    milestoneId: "dating-scan",
    title: "Dating & Viability Ultrasound",
    type: "ULTRASOUND",
    category: "Ultrasound Imaging",
    gestationalWeek: 7,
    trimester: 1,
    status: "COMPLETED",
    completedDate: "2026-07-22",
    clinicalStatus: "NORMAL",
    findingsSummary: "Single intrauterine viable gestational sac. Regular embryonic cardiac activity visualized.",
    keyBiomarkers: [
      { name: "Crown-Rump Length (CRL)", value: "11.8", numericValue: 11.8, unit: "mm", referenceRange: "10.0 - 14.0", status: "normal" },
      { name: "Fetal Heart Rate (FHR)", value: "152", numericValue: 152, unit: "bpm", referenceRange: "120 - 165", status: "normal" },
      { name: "Gestational Sac (MSD)", value: "22.4", numericValue: 22.4, unit: "mm", status: "normal" },
      { name: "Yolk Sac", value: "Present, Normal (4.1 mm)", status: "normal" }
    ],
    reportAttached: true,
    doctorNotes: "CRL corresponds exactly to 7 weeks 2 days. EDD calibrated to Nov 20, 2026."
  },
  {
    id: "rec-w7-thyroid",
    milestoneId: "thyroid-sugar-panel",
    title: "Early Thyroid (TSH) & Fasting Glucose Screening",
    type: "LAB_INVESTIGATION",
    category: "Endocrine / Diabetes",
    gestationalWeek: 8,
    trimester: 1,
    status: "COMPLETED",
    completedDate: "2026-07-29",
    clinicalStatus: "NORMAL",
    findingsSummary: "Euthyroid status. Maternal TSH well within early pregnancy guidelines (< 2.5 mIU/L). Fasting glucose optimal.",
    keyBiomarkers: [
      { name: "Serum TSH", value: "1.74", numericValue: 1.74, unit: "mIU/L", referenceRange: "0.2 - 2.5", status: "normal" },
      { name: "Fasting Blood Sugar", value: "84", numericValue: 84, unit: "mg/dL", referenceRange: "70 - 92", status: "normal" },
      { name: "Serum Creatinine", value: "0.62", numericValue: 0.62, unit: "mg/dL", referenceRange: "0.4 - 0.8", status: "normal" }
    ],
    reportAttached: true
  },
  {
    id: "rec-w12-nt-scan",
    milestoneId: "nt-scan",
    title: "NT Scan (Nuchal Translucency Ultrasound)",
    type: "ULTRASOUND",
    category: "Chromosomal Screening",
    gestationalWeek: 12,
    trimester: 1,
    status: "COMPLETED",
    completedDate: "2026-08-28",
    clinicalStatus: "NORMAL",
    findingsSummary: "Normal nuchal translucency measurement. Nasal bone ossified and clearly present. Normal ductus venosus flow.",
    keyBiomarkers: [
      { name: "Nuchal Translucency (NT)", value: "1.4", numericValue: 1.4, unit: "mm", referenceRange: "< 2.5 mm", status: "normal", interpretation: "Well within reassuring threshold" },
      { name: "Nasal Bone", value: "Present & Ossified", status: "normal" },
      { name: "Crown-Rump Length (CRL)", value: "58.2", numericValue: 58.2, unit: "mm", status: "normal" },
      { name: "Fetal Heart Rate", value: "158", numericValue: 158, unit: "bpm", referenceRange: "140 - 170", status: "normal" }
    ],
    reportAttached: true,
    doctorNotes: "Low risk ultrasound features. Combined screening ratio calculated with Dual Marker serum."
  },
  {
    id: "rec-w12-dual-marker",
    milestoneId: "dual-marker-test",
    title: "First-Trimester Dual Marker Blood Test",
    type: "LAB_INVESTIGATION",
    category: "Chromosomal Screening",
    gestationalWeek: 12,
    trimester: 1,
    status: "COMPLETED",
    completedDate: "2026-08-28",
    clinicalStatus: "NORMAL",
    findingsSummary: "Combined first-trimester screening confirms very low risk for Trisomy 21, 18, and 13.",
    keyBiomarkers: [
      { name: "Free Beta-hCG", value: "1.08", numericValue: 1.08, unit: "MoM", referenceRange: "0.5 - 2.0 MoM", status: "normal" },
      { name: "PAPP-A", value: "1.14", numericValue: 1.14, unit: "MoM", referenceRange: "> 0.5 MoM", status: "normal" },
      { name: "Trisomy 21 Risk Ratio", value: "1 : 4,800", status: "normal", interpretation: "Low risk (Cutoff 1:250)" },
      { name: "Trisomy 18/13 Risk", value: "< 1 : 10,000", status: "normal", interpretation: "Screen negative" }
    ],
    reportAttached: true
  },
  {
    id: "rec-w20-anomaly",
    milestoneId: "anomaly-scan",
    title: "Detailed Anomaly / Level-II Scan (TARS)",
    type: "ULTRASOUND",
    category: "Ultrasound Imaging",
    gestationalWeek: 20,
    trimester: 2,
    status: "COMPLETED",
    completedDate: "2026-10-22",
    clinicalStatus: "NORMAL",
    findingsSummary: "Comprehensive structural survey unremarkable. 4-chamber heart, intracranial ventricles, midline posterior fossa, spine, kidneys, bladder, stomach bubble, and 3-vessel cord normal. Closed internal os.",
    keyBiomarkers: [
      { name: "Biparietal Diameter (BPD)", value: "48.2", numericValue: 48.2, unit: "mm", status: "normal" },
      { name: "Head Circumference (HC)", value: "176", numericValue: 176, unit: "mm", status: "normal" },
      { name: "Abdominal Circumference (AC)", value: "154", numericValue: 154, unit: "mm", referenceRange: "50th percentile", status: "normal" },
      { name: "Femur Length (FL)", value: "33.6", numericValue: 33.6, unit: "mm", status: "normal" },
      { name: "Estimated Fetal Weight (EFW)", value: "360", numericValue: 360, unit: "g", referenceRange: "50th percentile (320-410g)", status: "normal" },
      { name: "Amniotic Fluid Index (AFI)", value: "14.2", numericValue: 14.2, unit: "cm", referenceRange: "8.0 - 18.0", status: "normal" },
      { name: "Cervical Length", value: "3.8", numericValue: 3.8, unit: "cm", referenceRange: "> 3.0 cm", status: "normal" },
      { name: "Placental Location", value: "Fundal-Anterior, Grade I, Clear of os", status: "normal" }
    ],
    reportAttached: true,
    doctorNotes: "Normal fetal anatomy scan. Normal uterine artery Doppler bilaterally with no diastolic notch."
  },
  {
    id: "rec-w24-ogtt",
    milestoneId: "ogtt-test",
    title: "Gestational Diabetes Screening (75g OGTT)",
    type: "LAB_INVESTIGATION",
    category: "Endocrine / Diabetes",
    gestationalWeek: 24,
    trimester: 2,
    status: "COMPLETED",
    completedDate: "2026-11-18",
    clinicalStatus: "NORMAL",
    findingsSummary: "All three plasma glucose values are well below IADPSG/DIPSI diagnostic cutoffs. Normal glucose tolerance.",
    keyBiomarkers: [
      { name: "Fasting Plasma Glucose", value: "82", numericValue: 82, unit: "mg/dL", referenceRange: "< 92", status: "normal" },
      { name: "1-Hour Post-Glucose", value: "128", numericValue: 128, unit: "mg/dL", referenceRange: "< 180", status: "normal" },
      { name: "2-Hour Post-Glucose", value: "110", numericValue: 110, unit: "mg/dL", referenceRange: "< 153", status: "normal" }
    ],
    reportAttached: true,
    doctorNotes: "No evidence of gestational diabetes. Continue balanced Mediterranean-style pregnancy nutrition."
  },
  {
    id: "rec-w24-hemogram",
    milestoneId: "complete-hemogram",
    title: "Complete Hemogram & Iron Stores Check",
    type: "LAB_INVESTIGATION",
    category: "Hematology",
    gestationalWeek: 24,
    trimester: 2,
    status: "COMPLETED",
    completedDate: "2026-11-18",
    clinicalStatus: "NORMAL",
    findingsSummary: "Mild physiological hemodilution expected in mid-pregnancy. Hemoglobin stable at 11.4 g/dL; adequate ferritin stores.",
    keyBiomarkers: [
      { name: "Hemoglobin (Hb)", value: "11.4", numericValue: 11.4, unit: "g/dL", referenceRange: ">= 10.5 (Trimester 2)", status: "normal", interpretation: "Normal physiological hemodilution" },
      { name: "Serum Ferritin", value: "38", numericValue: 38, unit: "ng/mL", referenceRange: "15 - 150", status: "normal" },
      { name: "Platelet Count", value: "228,000", numericValue: 228, unit: "/mcL", referenceRange: "150,000 - 450,000", status: "normal" },
      { name: "Urine Routine & Albumin", value: "Nil / Negative", status: "normal" }
    ],
    reportAttached: true,
    doctorNotes: "Continue standard oral iron & calcium supplementation as prescribed."
  },
  {
    id: "rec-w28-growth",
    milestoneId: "third-tri-growth",
    title: "Third Trimester Fetal Growth Ultrasound",
    type: "ULTRASOUND",
    category: "Ultrasound Imaging",
    gestationalWeek: 28,
    trimester: 3,
    status: "DUE_NOW",
    clinicalStatus: "NORMAL",
    findingsSummary: "Scheduled growth ultrasound to evaluate third trimester weight gain velocity, biometry percentiles, and liquor volume.",
    keyBiomarkers: [
      { name: "Target EFW", value: "1,150 - 1,300", unit: "g", status: "normal" },
      { name: "Expected AFI", value: "10 - 18", unit: "cm", status: "normal" },
      { name: "Presentation Check", value: "Pending evaluation", status: "normal" }
    ],
    reportAttached: false,
    doctorNotes: "Scheduled for next antenatal clinic visit."
  },
  {
    id: "rec-w32-doppler",
    milestoneId: "growth-doppler",
    title: "Placental & Umbilical Color Doppler Scan",
    type: "ULTRASOUND",
    category: "Fetal Doppler",
    gestationalWeek: 32,
    trimester: 3,
    status: "UPCOMING",
    clinicalStatus: "NORMAL",
    findingsSummary: "Color Doppler assessment of umbilical artery and middle cerebral artery (MCA) pulsatility.",
    keyBiomarkers: [
      { name: "Umbilical Artery PI", value: "Target < 1.15", status: "normal" },
      { name: "Amniotic Fluid Index", value: "Target 8 - 18 cm", status: "normal" },
      { name: "EFW Percentile", value: "Target 10th - 90th %ile", status: "normal" }
    ],
    reportAttached: false
  },
  {
    id: "rec-w36-position",
    milestoneId: "term-growth-scan",
    title: "Pre-Labor Growth & Fetal Position Scan",
    type: "ULTRASOUND",
    category: "Ultrasound Imaging",
    gestationalWeek: 36,
    trimester: 3,
    status: "UPCOMING",
    clinicalStatus: "NORMAL",
    findingsSummary: "Evaluation of fetal presentation (cephalic vs breech), estimated term weight, and placental clearance.",
    keyBiomarkers: [
      { name: "Fetal Presentation", value: "Cephalic expected", status: "normal" },
      { name: "Placental Maturity", value: "Grade II / III", status: "normal" }
    ],
    reportAttached: false
  }
];

export const SCENARIO_GDM: ScanLabMilestoneRecord[] = [
  ...SCENARIO_HEALTHY.slice(0, 6),
  {
    id: "rec-w24-ogtt-gdm",
    milestoneId: "ogtt-test",
    title: "Gestational Diabetes Screening (75g OGTT)",
    type: "LAB_INVESTIGATION",
    category: "Endocrine / Diabetes",
    gestationalWeek: 24,
    trimester: 2,
    status: "COMPLETED",
    completedDate: "2026-11-18",
    clinicalStatus: "ATTENTION",
    findingsSummary: "Elevated 1-hour and 2-hour plasma glucose exceeding IADPSG diagnostic criteria. Confirms Gestational Diabetes Mellitus (GDM).",
    keyBiomarkers: [
      { name: "Fasting Plasma Glucose", value: "95", numericValue: 95, unit: "mg/dL", referenceRange: "< 92", status: "high", interpretation: "Mildly elevated fasting baseline" },
      { name: "1-Hour Post-Glucose", value: "194", numericValue: 194, unit: "mg/dL", referenceRange: "< 180", status: "high", interpretation: "Exceeds 180 mg/dL threshold" },
      { name: "2-Hour Post-Glucose", value: "168", numericValue: 168, unit: "mg/dL", referenceRange: "< 153", status: "high", interpretation: "Exceeds 153 mg/dL threshold" },
      { name: "HbA1c", value: "5.8", numericValue: 5.8, unit: "%", referenceRange: "< 5.5%", status: "borderline" }
    ],
    reportAttached: true,
    doctorNotes: "Diagnosed with Gestational Diabetes Mellitus (A1GDM). Initiate medical nutrition therapy, daily 4-point glucose monitoring, and serial growth scans."
  },
  {
    id: "rec-w24-hemogram-gdm",
    milestoneId: "complete-hemogram",
    title: "Complete Hemogram & Iron Stores Check",
    type: "LAB_INVESTIGATION",
    category: "Hematology",
    gestationalWeek: 24,
    trimester: 2,
    status: "COMPLETED",
    completedDate: "2026-11-18",
    clinicalStatus: "NORMAL",
    findingsSummary: "Normal hemoglobin and platelets. No proteinuria detected on spot dipstick.",
    keyBiomarkers: [
      { name: "Hemoglobin (Hb)", value: "11.6", numericValue: 11.6, unit: "g/dL", status: "normal" },
      { name: "Platelet Count", value: "240,000", unit: "/mcL", status: "normal" },
      { name: "Urine Glucose", value: "Trace (+)", status: "borderline" },
      { name: "Urine Protein", value: "Nil", status: "normal" }
    ],
    reportAttached: true
  },
  {
    id: "rec-w28-growth-gdm",
    milestoneId: "third-tri-growth",
    title: "Third Trimester Fetal Growth Ultrasound (GDM Surveillance)",
    type: "ULTRASOUND",
    category: "Ultrasound Imaging",
    gestationalWeek: 28,
    trimester: 3,
    status: "COMPLETED",
    completedDate: "2026-12-16",
    clinicalStatus: "BORDERLINE",
    findingsSummary: "Fetal growth accelerated with disproportionate abdominal circumference (AC 92nd percentile). Amniotic fluid volume high-normal (AFI 18.5 cm). Requires strict glycemic monitoring.",
    keyBiomarkers: [
      { name: "Abdominal Circumference (AC)", value: "258", numericValue: 258, unit: "mm", referenceRange: "92nd percentile", status: "high", interpretation: "Asymmetric fetal overgrowth indicator" },
      { name: "Estimated Fetal Weight (EFW)", value: "1,420", numericValue: 1420, unit: "g", referenceRange: "88th percentile", status: "high", interpretation: "Tracking high-normal" },
      { name: "Amniotic Fluid Index (AFI)", value: "18.5", numericValue: 18.5, unit: "cm", referenceRange: "8.0 - 18.0", status: "borderline", interpretation: "High-normal liquor volume" },
      { name: "Umbilical Artery S/D", value: "2.6", numericValue: 2.6, status: "normal" }
    ],
    reportAttached: true,
    doctorNotes: "Correlates directly with maternal hyperglycemia. Adjust dietary carbohydrate distribution; follow up in 3 weeks."
  }
];

export const SCENARIO_ANEMIA: ScanLabMilestoneRecord[] = [
  ...SCENARIO_HEALTHY.slice(0, 5),
  {
    id: "rec-w20-anomaly-anemia",
    milestoneId: "anomaly-scan",
    title: "Detailed Anomaly / Level-II Scan (TARS)",
    type: "ULTRASOUND",
    category: "Ultrasound Imaging",
    gestationalWeek: 20,
    trimester: 2,
    status: "COMPLETED",
    completedDate: "2026-10-22",
    clinicalStatus: "BORDERLINE",
    findingsSummary: "Normal fetal anatomy. Bilateral uterine artery Doppler reveals mild early diastolic notching. Fetal growth currently appropriate for gestational age.",
    keyBiomarkers: [
      { name: "Biparietal Diameter (BPD)", value: "47.5", numericValue: 47.5, unit: "mm", status: "normal" },
      { name: "Abdominal Circumference (AC)", value: "149", numericValue: 149, unit: "mm", status: "normal" },
      { name: "EFW", value: "340", numericValue: 340, unit: "g", status: "normal" },
      { name: "AFI", value: "13.0", numericValue: 13.0, unit: "cm", status: "normal" },
      { name: "Uterine Artery Notching", value: "Bilateral Mild Diastolic Notch", status: "borderline", interpretation: "Requires serial growth monitoring" }
    ],
    reportAttached: true,
    doctorNotes: "Mild bilateral uterine notch. Check maternal hemoglobin and blood pressure closely."
  },
  {
    id: "rec-w24-hemogram-anemia",
    milestoneId: "complete-hemogram",
    title: "Complete Hemogram & Iron Stores Check",
    type: "LAB_INVESTIGATION",
    category: "Hematology",
    gestationalWeek: 24,
    trimester: 2,
    status: "COMPLETED",
    completedDate: "2026-11-18",
    clinicalStatus: "ATTENTION",
    findingsSummary: "Microcytic hypochromic anemia confirmed. Hemoglobin fallen to 9.6 g/dL with depleted ferritin stores (11 ng/mL). Exceeds expected physiological dilution.",
    keyBiomarkers: [
      { name: "Hemoglobin (Hb)", value: "9.6", numericValue: 9.6, unit: "g/dL", referenceRange: ">= 10.5 (T2)", status: "low", interpretation: "Moderate maternal iron deficiency anemia" },
      { name: "Serum Ferritin", value: "11", numericValue: 11, unit: "ng/mL", referenceRange: "15 - 150", status: "low", interpretation: "Depleted iron reserves" },
      { name: "Mean Corpuscular Volume (MCV)", value: "72", numericValue: 72, unit: "fL", referenceRange: "80 - 100", status: "low" },
      { name: "Platelet Count", value: "285,000", unit: "/mcL", status: "normal" }
    ],
    reportAttached: true,
    doctorNotes: "Upgrade to dual iron formulation (oral elemental iron 100mg BID with Vitamin C). Recheck Hb in 4 weeks; evaluate for IV iron sucrose if tolerance is poor."
  },
  {
    id: "rec-w24-ogtt-anemia",
    milestoneId: "ogtt-test",
    title: "Gestational Diabetes Screening (75g OGTT)",
    type: "LAB_INVESTIGATION",
    category: "Endocrine / Diabetes",
    gestationalWeek: 24,
    trimester: 2,
    status: "COMPLETED",
    completedDate: "2026-11-18",
    clinicalStatus: "NORMAL",
    findingsSummary: "Normal blood sugar tolerance. Fasting 80 mg/dL, 2-hour 108 mg/dL.",
    keyBiomarkers: [
      { name: "Fasting Glucose", value: "80", unit: "mg/dL", status: "normal" },
      { name: "2-Hour OGTT", value: "108", unit: "mg/dL", status: "normal" }
    ],
    reportAttached: true
  }
];

export const INITIAL_TIMELINE_ANALYSIS: TimelineAnalysisResult = {
  clinicalSummary: "Patient Sarah Jenkins (Gestational Week 24, Trimester 2) demonstrates an exemplary, low-risk antenatal trajectory. All first and second-trimester ultrasound milestones (Dating scan at 7w, NT scan at 12w, Level-II Anomaly survey at 20w) show anatomically intact organogenesis, normal biometric growth along the 50th percentile, and normal amniotic fluid index (14.2 cm). Laboratory investigations verify reassuring endocrine, chromosomal, and hematologic baselines, with normal 75g OGTT results ruling out gestational diabetes and stable physiological hemoglobin.",
  overallRiskLevel: "LOW",
  gestationalTimingScore: 98,
  timingAdherenceNote: "All 7 scheduled scans and lab investigations to date were completed exactly within standard clinical ACOG/FOGSI gestational windows.",
  keyBiomarkerTrends: [
    {
      biomarker: "Hemoglobin (Hb)",
      category: "Hematology",
      currentValue: "11.4 g/dL",
      trend: "stable",
      clinicalSignificance: "Mild physiological dip from 12.8 -> 11.4 g/dL represents expected plasma volume expansion without pathology.",
      status: "optimal"
    },
    {
      biomarker: "Glucose Tolerance (OGTT)",
      category: "Metabolic",
      currentValue: "Fasting 82 / 2-hr 110 mg/dL",
      trend: "optimal",
      clinicalSignificance: "Strictly normal glycemic response eliminates gestational diabetes risk at current stage.",
      status: "optimal"
    },
    {
      biomarker: "Fetal Growth (EFW)",
      category: "Ultrasound Biometry",
      currentValue: "360g @ 20w (50th percentile)",
      trend: "stable",
      clinicalSignificance: "Symmetric fetal growth tracking precisely along standard population median curves.",
      status: "optimal"
    },
    {
      biomarker: "Amniotic Fluid Index (AFI)",
      category: "Placental & Fetal Health",
      currentValue: "14.2 cm",
      trend: "stable",
      clinicalSignificance: "Healthy normohydramnios (reference 8.0 - 18.0 cm) reflecting optimal fetal renal perfusion.",
      status: "optimal"
    },
    {
      biomarker: "Thyroid TSH",
      category: "Endocrine",
      currentValue: "1.74 mIU/L",
      trend: "optimal",
      clinicalSignificance: "Maternal thyroid function well within first/second trimester target (< 2.5 mIU/L).",
      status: "optimal"
    }
  ],
  crossModalCorrelations: [
    {
      id: "corr-1",
      title: "Glycemic Profile vs Fetal Abdominal Growth",
      labMarker: "75g OGTT: Fasting 82, 1-hr 128, 2-hr 110 mg/dL",
      scanFinding: "Fetal AC: 154 mm (50th percentile) on Week 20 Anomaly Scan",
      correlationAnalysis: "Optimal maternal glucose regulation correlates with balanced, non-macrosomic fetal abdominal circumference and normal amniotic fluid index (14.2 cm).",
      clinicalImplication: "No fetal hyperinsulinemia or excessive somatic growth detected.",
      severity: "normal"
    },
    {
      id: "corr-2",
      title: "Serum Dual Markers vs Nuchal Translucency Thickness",
      labMarker: "Free Beta-hCG 1.08 MoM & PAPP-A 1.14 MoM",
      scanFinding: "NT Thickness 1.4 mm (< 2.5 mm) & Ossified Nasal Bone",
      correlationAnalysis: "Both biochemical serum markers and ultrasound biophysical markers demonstrate concordant low-risk ratios (< 1:4,800) for major aneuploidies.",
      clinicalImplication: "Confirms screen-negative status for Trisomies 21, 18, and 13.",
      severity: "normal"
    },
    {
      id: "corr-3",
      title: "Maternal Blood Pressure vs Uterine Artery Doppler Flow",
      labMarker: "Average Systolic 118 / Diastolic 74 mmHg; Urine Albumin Nil",
      scanFinding: "Bilateral low-resistance uterine artery flow with absent early diastolic notch",
      correlationAnalysis: "Normotensive clinical profile matches healthy trophoblastic invasion and low uterine vascular resistance.",
      clinicalImplication: "Low risk for preeclampsia or early placental insufficiency.",
      severity: "normal"
    }
  ],
  watchlistItems: [
    {
      id: "watch-1",
      item: "Third Trimester Growth Ultrasound (Weeks 28 - 31)",
      detectedAtWeek: 24,
      rationale: "Routine evaluation to verify third-trimester growth velocity and placental maturation grade.",
      recommendedAction: "Confirm appointment slot with radiology clinic around Week 28.",
      urgency: "routine"
    },
    {
      id: "watch-2",
      item: "Third Trimester Repeat Hemoglobin Screen",
      detectedAtWeek: 24,
      rationale: "Peak physiological plasma expansion occurs between Weeks 28-32, increasing anemia vulnerability.",
      recommendedAction: "Maintain daily oral iron compliance with dietary vitamin C.",
      urgency: "routine"
    }
  ],
  suggestedDoctorQuestions: [
    "Does my Level-II scan placenta position (fundal-anterior) require any late third-trimester localization checks?",
    "When should my third trimester growth ultrasound (28-31 weeks) be scheduled?",
    "Should my daily iron and calcium dosage be adjusted as I enter the third trimester?"
  ],
  urgentWarningSigns: [
    "Persistent severe headache unresponsive to hydration, or visual disturbances (scotoma, blurring).",
    "Sudden swelling of face, hands, or feet accompanied by upper right abdominal pain.",
    "Noticeable decrease or cessation in regular fetal kick counts (> 10 kicks in 2 hours is normal).",
    "Any vaginal bleeding, fluid leakage, or rhythmic painful contractions prior to 37 weeks."
  ],
  analyzedAt: new Date().toISOString(),
  source: "CLINICAL_ALGORITHM"
};

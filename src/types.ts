export type LanguageCode = "en" | "hi" | "ta" | "te" | "mr" | "bn";

export type UiThemeOption = "soft-pastel-minimal" | "black-rosegold" | "serene-rose" | "midnight-lavender" | "botanical-sage" | "sunset-coral";

export type PageView =
  | "dashboard"
  | "digital-twin"
  | "garbha-wellness"
  | "timeline"
  | "baby-development"
  | "medical-timeline"
  | "baby-names"
  | "health-tracker"
  | "nutrition"
  | "yoga"
  | "medicine"
  | "mood-tracker"
  | "kick-counter"
  | "contraction-timer"
  | "journal"
  | "hospital-bag"
  | "partner"
  | "ai-assistant"
  | "emergency"
  | "emergency-contacts"
  | "reports"
  | "settings"
  | "theme-studio"
  | "admin"
  | "birth-plan"
  | "exercise-breathing"
  | "hospital-finder"
  | "medical-profile"
  | "birth-readiness"
  | "travel-safety"
  | "vaccinations"
  | "education-classes"
  | "cycle-journey"
  | "postpartum-care"
  | "diapers"
  | "diaper-monitoring"
  | "sleep-fatigue"
  | "mother-sleep"
  | "baby-sleep"
  | "infant-sleep"
  | "mood-wellbeing"
  | "mother-mood"
  | "nutrition-hydration"
  | "postpartum-nutrition"
  | "medication"
  | "postpartum-medication"
  | "appointments"
  | "postpartum-appointments"
  | "doctor-brief"
  | "postpartum-doctor-brief"
  | "trend-pattern"
  | "postpartum-trends"
  | "anomaly-detection"
  | "postpartum-anomalies"
  | "daily-plan"
  | "postpartum-daily-plan"
  | "context-reminders"
  | "postpartum-reminders"
  | "daily-checkin"
  | "postpartum-checkin"
  | "followup-continuity"
  | "postpartum-followup"
  | "postpartum-education"
  | "recovery-insight"
  | "postpartum-recovery-insight"
  | "baby-growth-milestones"
  | "baby-growth"
  | "baby-feeding"
  | "vaccination-tracking"
  | "ai-memory-history"
  | "patient-history"
  | "care-coordination"
  | "care-coordination-hub"
  | "safety"
  | "safety-shield"
  | "postpartum-safety"
  | "mother-recovery-ai"
  | "mother-recovery-agent"
  | "baby-care-ai"
  | "baby-care-agent"
  | "safety-care-coordination-ai"
  | "safety-care-coordination-agent";

export type JourneyStage = "PRE_PREGNANCY" | "PREGNANCY" | "POST_PREGNANCY";

export type PostpartumDeliveryType = "vaginal" | "c_section" | "assisted_vaginal" | "other";

export interface PostpartumProfile {
  id?: string;
  userId?: string;
  motherName?: string;
  deliveryDate: string; // YYYY-MM-DD
  deliveryType: PostpartumDeliveryType;
  babyBirthDate?: string; // YYYY-MM-DD
  numberOfBabies: number;
  deliveryLocation?: string;
  healthcareProvider?: string;
  hospital?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostpartumContext {
  deliveryDate: string;
  deliveryType: PostpartumDeliveryType;
  postpartumDay: number;
  postpartumWeek: number;
  recoveryStage: "immediate_recovery" | "early_recovery" | "ongoing_recovery" | "extended_postpartum";
  numberOfBabies: number;
  babyBirthDate?: string;
  deliveryLocation?: string;
  healthcareProvider?: string;
  hospital?: string;
  notes?: string;
}

export type PainScore = number; // 0–10
export type EnergyLevel = "Low" | "Medium" | "Good";
export type MobilityStatus = "Difficult" | "Moderate" | "Comfortable";
export type RestQuality = "Poor" | "Fair" | "Good";
export type OverallRecoveryStatus = "Worse" | "Same" | "Better";

export interface MotherRecoveryLog {
  id: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  postpartumDay: number;
  postpartumWeek: number;
  pain: PainScore;
  energy: EnergyLevel;
  mobility: MobilityStatus;
  rest: RestQuality;
  overallRecovery: OverallRecoveryStatus;
  notes?: string;
  createdAt: string;
}

export interface BabyProfileData {
  id?: string;
  userId?: string;
  babyName: string;
  gender?: "Boy" | "Girl" | "Surprise" | "Unspecified";
  birthWeightKg?: number;
  birthLengthCm?: number;
  notes?: string;
  updatedAt?: string;
}

export type SafetyStatusTier = "CLEAR" | "ATTENTION" | "URGENT";

export interface SafetyIssueItem {
  id: string;
  domain: "MOTHER" | "BABY";
  severity: "ATTENTION" | "URGENT";
  title: string;
  detected: string;
  whyItMatters: string;
  whatToDo: string;
}

export interface SafetyEvaluationResult {
  overallStatus: SafetyStatusTier;
  motherIssues: SafetyIssueItem[];
  babyIssues: SafetyIssueItem[];
  evaluatedAt: string;
}

export type BleedingAmount = "None" | "Light" | "Moderate" | "Heavy";
export type LochiaColor = "Red" | "Pink" | "Brown" | "Yellow/White" | "Other";
export type ClotStatus = "None" | "Small" | "Large";
export type BleedingTrend = "Improving" | "Same" | "Increasing";

export interface BleedingLog {
  id: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  postpartumDay: number;
  postpartumWeek: number;
  amount: BleedingAmount;
  color: LochiaColor;
  clots: ClotStatus;
  padCount?: number;
  trend: BleedingTrend;
  notes?: string;
  createdAt: string;
}

export type PainLocation =
  | "Abdomen"
  | "Pelvic area"
  | "Perineal area"
  | "Incision / wound area"
  | "Back"
  | "Breast"
  | "Head"
  | "Other";

export type PainType = "Aching" | "Cramping" | "Burning" | "Sharp" | "Throbbing" | "Other";
export type PainTiming = "Constant" | "Comes and goes";
export type PainRelief = "Rest" | "Position change" | "Medication" | "Heat/cold" | "Nothing" | "Other";
export type PainLogTrend = "Improving" | "Same" | "Worsening";

export interface PainLog {
  id: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  postpartumDay: number;
  postpartumWeek: number;
  pain: number; // 0-10
  location: PainLocation;
  type: PainType;
  timing: PainTiming;
  trend: PainLogTrend;
  whatHelped: PainRelief;
  notes?: string;
  createdAt: string;
}

export type WoundType =
  | "C-section incision"
  | "Episiotomy / perineal wound"
  | "Other delivery-related wound"
  | "Not applicable";

export type WoundAppearance =
  | "Looks normal / improving"
  | "Redness"
  | "Swelling"
  | "Bruising"
  | "Other visible changes";

export type WoundDischarge = "None" | "Small" | "Increasing" | "Unusual discharge";
export type WoundOpening = "No" | "Yes / concerning change";
export type WoundTenderness = "None" | "Mild" | "Moderate" | "Severe";
export type WoundHealingTrend = "Improving" | "Same" | "Worsening";

export interface WoundLog {
  id: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  postpartumDay: number;
  postpartumWeek: number;
  woundType: WoundType;
  appearance: WoundAppearance;
  discharge: WoundDischarge;
  opening: WoundOpening;
  tenderness: WoundTenderness;
  healingTrend: WoundHealingTrend;
  notes?: string;
  createdAt: string;
}

export type BreastUsed = "Left" | "Right" | "Both";
export type BreastfeedingExperience =
  | "Comfortable"
  | "Some discomfort"
  | "Difficult"
  | "Very difficult";

export type BreastSymptom =
  | "None"
  | "Soreness"
  | "Cracking"
  | "Engorgement/fullness"
  | "Other";

export type BreastfeedingRelief =
  | "Position change"
  | "Latch adjustment"
  | "Rest"
  | "Lactation consultant support"
  | "Cold/warm compress"
  | "Other";

export interface BreastfeedingLog {
  id: string;
  userId?: string;
  babyId?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "08:10 AM"
  postpartumDay: number;
  postpartumWeek: number;
  breastUsed: BreastUsed;
  durationMinutes: number;
  leftDurationMinutes?: number;
  rightDurationMinutes?: number;
  experience: BreastfeedingExperience;
  symptoms: BreastSymptom[];
  whatHelped?: BreastfeedingRelief[];
  notes?: string;
  createdAt: string;
}

export type PumpingMethod = "Electric Pump" | "Manual Pump" | "Hand Expression" | "Other";
export type MilkAction = "Stored" | "Used immediately" | "Discarded" | "Other";
export type PumpingExperience = "Comfortable" | "Mild Discomfort" | "Difficult" | "Very Difficult";
export type PumpingSymptom = "None" | "Soreness" | "Cracking" | "Engorgement / Fullness" | "Other";
export type PumpingRelief =
  | "Pump setting adjustment"
  | "Position change"
  | "Rest"
  | "Warm/cold compress"
  | "Lactation support"
  | "Other"
  | "Nothing";

export interface PumpingLog {
  id: string;
  userId?: string;
  babyId?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "08:30 AM"
  postpartumDay: number;
  postpartumWeek: number;
  method: PumpingMethod;
  breastUsed: BreastUsed;
  durationMinutes: number;
  leftDurationMinutes?: number;
  rightDurationMinutes?: number;
  leftVolumeMl?: number;
  rightVolumeMl?: number;
  totalVolumeMl: number;
  volumeUnit: "mL" | "oz";
  milkAction: MilkAction;
  experience: PumpingExperience;
  symptoms: PumpingSymptom[];
  whatHelped?: PumpingRelief[];
  notes?: string;
  createdAt: string;
}

export type BabyFeedingMethod = "Direct Breastfeeding" | "Expressed Breast Milk" | "Formula" | "Other";

export type BabyFeedingBehavior =
  | "Fed comfortably"
  | "Took breaks"
  | "Fussy during feeding"
  | "Difficulty staying latched"
  | "Fell asleep during feeding"
  | "Finished feeding"
  | "Stopped early"
  | "Other";

export type BabyFeedingResponse =
  | "Calm / satisfied"
  | "Still hungry"
  | "Sleepy"
  | "Fussy"
  | "Spit-up observed"
  | "Other";

export interface BabyFeedingLog {
  id: string;
  userId?: string;
  babyId?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "08:30 AM"
  postpartumDay: number;
  postpartumWeek: number;
  method: BabyFeedingMethod;
  
  // Direct Breastfeeding fields
  breastUsed?: BreastUsed;
  durationMinutes?: number;
  leftDurationMinutes?: number;
  rightDurationMinutes?: number;
  linkedBreastfeedingLogId?: string;

  // Bottle-based feeding fields (Expressed Milk / Formula)
  amountOfferedMl?: number;
  amountConsumedMl?: number;
  amountRemainingMl?: number;
  volumeUnit?: "mL" | "oz";
  linkedPumpingLogId?: string;

  behavior: BabyFeedingBehavior[];
  response?: BabyFeedingResponse;
  notes?: string;
  createdAt: string;
}

export type DiaperType = "Wet" | "Dirty" | "Wet + Dirty" | "Dry";

export type UrineAmount = "Light" | "Moderate" | "Heavy" | "Not assessed";

export type StoolColor =
  | "Meconium (Black/Tarry)"
  | "Green / Transitional"
  | "Yellow / Mustard"
  | "Brown"
  | "Red / Bloody"
  | "Pale / White / Clay"
  | "Other"
  | "Not assessed";

export type StoolConsistency =
  | "Loose / Liquid"
  | "Soft / Pasty"
  | "Seedy / Grainy"
  | "Thick / Formed"
  | "Hard / Pellets"
  | "Other"
  | "Not assessed";

export type DiaperChangeReason =
  | "Routine check"
  | "Fussy / Crying"
  | "Smell"
  | "Leaking"
  | "Before/After feeding"
  | "Other";

export type DiaperBabyBehavior = "Calm" | "Fussy" | "Crying" | "Sleepy";

export interface DiaperLog {
  id: string;
  userId?: string;
  babyId?: string;
  babyName?: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:15 AM"
  timestamp: number;
  postpartumDay: number;
  postpartumWeek: number;
  type: DiaperType;
  urineAmount?: UrineAmount;
  stoolColor?: StoolColor;
  stoolConsistency?: StoolConsistency;
  changeReason?: DiaperChangeReason;
  babyBehavior?: DiaperBabyBehavior;
  notes?: string;
  createdAt: string;
}

export type SleepType = "Night sleep" | "Daytime nap" | "Rest" | "Other";

export type SleepQuality = "Poor" | "Fair" | "Good" | "Very good";

export type InterruptionReason =
  | "Baby feeding"
  | "Diaper change"
  | "Baby crying"
  | "Pumping"
  | "Mother's discomfort/pain"
  | "Bathroom"
  | "Medication"
  | "Other"
  | "Unknown";

export type FatigueFunctionalImpact =
  | "Not affecting me"
  | "Slightly affecting me"
  | "Moderately affecting me"
  | "Significantly affecting me";

export interface MotherSleepLog {
  id: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "11:30 PM"
  endTime: string; // e.g. "02:00 AM"
  durationMinutes: number;
  type: SleepType;
  quality: SleepQuality;
  awakeningsCount: number;
  interruptionDurationMinutes?: number;
  interruptionReasons?: InterruptionReason[];
  notes?: string;
  postpartumDay: number;
  postpartumWeek: number;
  createdAt: string;
}

export interface MotherFatigueLog {
  id: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "02:30 PM"
  timestamp: number;
  fatigueScore: number; // 0 - 10 scale
  functionalImpact?: FatigueFunctionalImpact;
  notes?: string;
  postpartumDay: number;
  postpartumWeek: number;
  createdAt: string;
}

export type BabySleepType = "Night sleep" | "Daytime nap" | "Short nap" | "Other/rest";

export type BabySettlingEase = "Settled easily" | "Needed some soothing" | "Difficult to settle";

export type BabySleepBehavior = "Slept comfortably" | "Restless" | "Woke frequently" | "Other";

export type BabySleepOnsetMethod =
  | "Feeding"
  | "Rocking"
  | "Holding"
  | "Swaddling"
  | "Pacifier"
  | "Self-settled"
  | "Other";

export type BabyAwakeningReason =
  | "Feeding"
  | "Diaper change"
  | "Crying"
  | "Discomfort"
  | "Unknown"
  | "Other";

export type BabySleepEnvironment = "Bassinet" | "Crib" | "Bed" | "Other";

export type BabyWakingState = "Calm" | "Alert" | "Sleepy" | "Fussy" | "Crying" | "Other";

export interface BabySleepLog {
  id: string;
  userId?: string;
  babyId?: string;
  babyName?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "10:30 AM"
  endTime: string; // e.g. "11:45 AM"
  timestamp: number;
  durationMinutes: number;
  type: BabySleepType;
  settlingEase?: BabySettlingEase;
  sleepBehavior?: BabySleepBehavior;
  onsetMethod?: BabySleepOnsetMethod;
  awakeningsCount: number;
  awakeningReason?: BabyAwakeningReason;
  sleepEnvironment?: BabySleepEnvironment;
  wakingState?: BabyWakingState;
  notes?: string;
  postpartumDay: number;
  postpartumWeek: number;
  createdAt: string;
}

export type MotherMoodScore = 1 | 2 | 3 | 4 | 5;

export type MotherEmotionalState =
  | "Calm"
  | "Happy"
  | "Tired"
  | "Worried"
  | "Anxious"
  | "Irritable"
  | "Overwhelmed"
  | "Sad"
  | "Lonely"
  | "Frustrated"
  | "Confident"
  | "Supported"
  | "Other";

export type OverwhelmedRating = "Not at all" | "A little" | "Moderate" | "Very" | "Extremely";

export type FeltSupportedStatus = "Yes, very supported" | "Somewhat supported" | "Not much" | "Not at all";

export interface MotherMoodWellbeingLog {
  id: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:30 AM"
  timestamp: number;
  postpartumDay: number;
  postpartumWeek: number;
  recoveryStage: string;
  moodScore: MotherMoodScore;
  emotionalStates: string[];
  stressLevel: number; // 0 to 10
  worryLevel: number; // 0 to 10
  worryReasons?: string[];
  overwhelmedRating: OverwhelmedRating;
  feltSupported: FeltSupportedStatus;
  supportSources?: string[];
  positiveCoping?: string[];
  notes?: string;
  createdAt: string;
}

export type MotherMealType = "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Other";

export type MotherFoodGroup =
  | "Grains/Starches"
  | "Protein"
  | "Vegetables"
  | "Fruits"
  | "Dairy/Alternatives"
  | "Nuts/Seeds"
  | "Healthy Fats"
  | "Other";

export type PortionSize = "Small" | "Medium" | "Large";

export type AppetiteRating = "Very poor" | "Poor" | "Fair" | "Good" | "Very good";

export type EatingSymptom =
  | "Nausea"
  | "Reduced appetite"
  | "Difficulty eating"
  | "Difficulty drinking"
  | "Constipation"
  | "None"
  | "Other";

export type DrinkType =
  | "Water"
  | "Milk"
  | "ORS/Electrolyte"
  | "Juice"
  | "Tea/Coffee"
  | "Herbal Tea"
  | "Other";

export interface MotherMealLog {
  id: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "08:30 AM"
  timestamp: number;
  postpartumDay: number;
  postpartumWeek: number;
  recoveryStage: string;
  mealType: MotherMealType;
  description: string;
  foodGroups: MotherFoodGroup[];
  portionSize: PortionSize;
  appetite: AppetiteRating;
  symptoms?: EatingSymptom[];
  notes?: string;
  createdAt: string;
}

export interface MotherFluidLog {
  id: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:30 AM"
  timestamp: number;
  postpartumDay: number;
  postpartumWeek: number;
  drinkType: DrinkType;
  amountMl: number;
  volumeUnit: "mL" | "oz";
  notes?: string;
  createdAt: string;
}

// Feature 16: Mother Medication Management Types
export type MedicationType = "prescription" | "otc" | "supplement" | "other";
export type MedicationSchedule = "once_daily" | "twice_daily" | "three_times_daily" | "every_x_hours" | "as_needed" | "custom";
export type MedicationStatus = "active" | "completed" | "discontinued";
export type MedicationDoseStatus = "taken" | "skipped" | "missed" | "delayed" | "not_sure";
export type MedicationReactionSymptom = "nausea" | "dizziness" | "headache" | "stomach_discomfort" | "sleepiness" | "rash_skin_change" | "other" | "none";

export interface MotherMedicationItem {
  id: string;
  userId?: string;
  name: string;
  type: MedicationType;
  purpose?: string;
  prescribedBy?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD
  instructions: string; // Clinician/user recorded instructions
  doseAmount?: string;  // e.g. "500"
  unit?: string;        // e.g. "mg", "tablet", "capsule", "mL"
  frequency?: string;   // e.g. "Twice daily"
  route?: string;       // e.g. "Oral", "Topical"
  schedule: MedicationSchedule;
  scheduledTimes?: string[]; // e.g. ["08:00 AM", "08:00 PM"]
  isAsNeeded: boolean;
  status: MedicationStatus;
  createdAt: string;
}

export interface MotherMedicationLog {
  id: string;
  userId?: string;
  medicationId: string;
  medicationName: string;
  date: string; // YYYY-MM-DD
  scheduledTime?: string; // e.g. "08:00 AM"
  actualTime: string;    // e.g. "09:15 AM"
  timestamp: number;
  postpartumDay: number;
  postpartumWeek: number;
  doseStatus: MedicationDoseStatus;
  isPRN: boolean;
  preMedicationSymptom?: { symptom: string; score?: number };
  postMedicationEffect?: "better" | "same" | "worse" | "not_sure";
  postMedicationSymptomScore?: number;
  reportedReactions?: MedicationReactionSymptom[];
  notes?: string;
  createdAt: string;
}

// Feature 17: Mother & Baby Appointments Types
export type AppointmentTarget = "mother" | "baby" | "both";
export type AppointmentStatus = "upcoming" | "completed" | "cancelled" | "rescheduled" | "missed";
export type QuestionStatus = "open" | "answered" | "deferred";

export interface AppointmentQuestion {
  id: string;
  question: string;
  status: QuestionStatus;
  answerNote?: string;
}

export interface MotherBabyAppointment {
  id: string;
  userId?: string;
  target: AppointmentTarget;
  babyId?: string;
  babyName?: string;
  category: string; // e.g. "Postpartum Check-up", "Wound Follow-up", "Pediatric Visit", "Vaccination", etc.
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 AM"
  durationMinutes?: number;
  providerName?: string;
  clinicHospital?: string;
  location?: string;
  isInPerson: boolean;
  purpose: string;
  status: AppointmentStatus;
  questions: AppointmentQuestion[];
  notes?: string; // Post-visit clinician notes recorded by user
  followUpRequired: boolean;
  followUpDate?: string; // YYYY-MM-DD
  postpartumDay: number;
  postpartumWeek: number;
  createdAt: string;
}

// Feature 18: Doctor Brief Generator Types
export type DoctorBriefType =
  | "postpartum_recovery"
  | "lactation_consult"
  | "pediatric_checkup"
  | "wound_followup"
  | "medication_review"
  | "custom";

export interface DoctorBriefItem {
  id: string;
  userId?: string;
  appointmentId?: string;
  title: string;
  briefType: DoctorBriefType;
  target: "mother" | "baby" | "both";
  dateRange: { startDate: string; endDate: string };
  patientName: string;
  postpartumDay: number;
  postpartumWeek: number;
  recoveryStage: string;
  includedModules: string[];
  questions: string[];
  customNotes?: string;
  generatedAt: string;
}




export interface PrePregnancyDetails {
  lastPeriodDate?: string;
  cycleLengthDays?: number;
  isCycleRegular?: boolean;
  conceptionGoal?: string;
  wellnessFocus?: string[];
}

export interface PostpartumDetails {
  babyDob?: string;
  babyName?: string;
  babyGender?: "Boy" | "Girl" | "Surprise";
  recoveryGoals?: string[];
}

export interface ExtractedMedicalField {
  id: string;
  category: "lab" | "ultrasound" | "prescription" | "vitals";
  label: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  date?: string;
}

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  role: "user" | "admin";
  currentJourney?: JourneyStage;
  currentWeek: number;
  trimester: number;
  edd: string;
  lmpDate?: string;
  daysRemaining: number;
  age: number;
  avatarUrl?: string;
  doctorName?: string;
  hospitalName?: string;
  bloodGroup?: string;
  dueDate?: string;
  prePregnancyDetails?: PrePregnancyDetails;
  postpartumDetails?: PostpartumDetails;
  extractedMedicalFields?: ExtractedMedicalField[];
  hasCompletedOnboarding: boolean;
}

export type GlucoseContext = "fasting" | "1h_post_meal" | "2h_post_meal" | "postprandial";
export type VitalStatusLevel = "NORMAL" | "ATTENTION" | "HIGH" | "SEVERE";

export interface BpEvaluation {
  systolic: number;
  diastolic: number;
  map: number;
  status: VitalStatusLevel;
  statusText: string;
  isAbnormal: boolean;
  requiresUrgentAttention: boolean;
}

export interface GlucoseEvaluation {
  value: number;
  context: GlucoseContext;
  status: VitalStatusLevel;
  statusText: string;
  isAbnormal: boolean;
}

export interface SymptomSafetyCheck {
  headache?: boolean;
  visionChanges?: boolean;
  upperAbdominalPain?: boolean;
  breathingDifficulty?: boolean;
  unusualSwelling?: boolean;
}

export interface PulseEvaluation {
  bpm: number;
  status: VitalStatusLevel;
  statusText: string;
  isAbnormal: boolean;
}

export interface HealthVitalEvaluation {
  bp?: BpEvaluation;
  pulse?: PulseEvaluation;
  glucose?: GlucoseEvaluation;
  symptomAlerts?: string[];
  hasHighRiskSymptoms?: boolean;
  overallStatus: VitalStatusLevel;
  requiresUrgentAttention: boolean;
  playAlertSound: boolean;
}

export interface HealthVital {
  id: number | string;
  date: string;
  time?: string;
  timestamp?: string;
  weightKg: number;
  systolicBp: number;
  diastolicBp: number;
  pulseBpm?: number;
  bloodSugarMgDl?: number;
  glucoseMgDl?: number;
  glucoseContext?: GlucoseContext;
  temperatureC?: number;
  sleepHours: number;
  waterMl: number;
  symptoms: string[];
  symptomCheck?: SymptomSafetyCheck;
  energyLevel: number; // 1-10
  mood: string;
  babyKicksCount: number;
  notes?: string;
  evaluation?: HealthVitalEvaluation;
}

export interface Recipe {
  id: string;
  title: string;
  trimester: number | "All";
  category: "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Drink";
  prepTime: string;
  keyBenefits: string[];
  ironMg: number;
  calciumMg: number;
  proteinG: number;
  folateMcg: number;
  calories: number;
  ingredients: string[];
  instructions: string[];
  imageUrl: string;
}

export type NutritionAiStatus = "SAFE" | "MODERATION" | "AVOID" | "UNKNOWN";

export interface NutritionDetail {
  servingSize?: string;
  calories?: number;
  proteinG?: number;
  ironMg?: number;
  calciumMg?: number;
  folateMcg?: number;
  carbsG?: number;
  fiberG?: number;
}

export interface NutritionAiSource {
  title: string;
  source: string;
}

export interface NutritionAiResult {
  foodName: string;
  safetyStatus: NutritionAiStatus;
  summary: string;
  nutrition?: NutritionDetail | null;
  benefits: string[];
  considerations: string[];
  recommendation: string;
  foodSafety?: string;
  sources?: NutritionAiSource[];
}

export type RecipeAiSafetyStatus = "SAFE" | "MODERATION" | "AVOID" | "UNKNOWN";

export interface RecipeNutrition {
  calories?: number;
  protein_g?: number;
  iron_mg?: number;
  calcium_mg?: number;
  folate_mcg?: number;
  carbohydrates_g?: number;
  fiber_g?: number;
  isEstimated: boolean;
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
  notes?: string;
}

export interface RecipeAiResult {
  dishName: string;
  category?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  imageUrl?: string;
  safetyStatus: RecipeAiSafetyStatus;
  safetyMessage: string;
  nutrition: RecipeNutrition;
  ingredients: RecipeIngredient[];
  instructions: string[];
  pregnancyBenefits: string[];
  additionalInfo: string[];
  trimesterGuidance?: string;
  sourceType: "CURATED_LOCAL" | "AI_GENERATED";
  confidence?: "HIGH" | "MEDIUM" | "LOW";
}

export interface Medicine {
  id: number;
  name: string;
  dosage: string;
  time: string;
  frequency: string;
  notes?: string;
  isActive: boolean;
  isTakenToday: boolean;
}

export interface Appointment {
  id: number;
  doctorName: string;
  hospitalName: string;
  appointmentDate: string;
  time: string;
  purpose: string;
  notes?: string;
  reminderEnabled: boolean;
  status: "upcoming" | "completed" | "cancelled";
}

export interface KickSession {
  id: number;
  date: string;
  sessionStartTime: string;
  kickCount: number;
  durationMinutes: number;
  notes?: string;
}

export interface ContractionLog {
  id: number;
  date: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  intervalSeconds: number;
  intensity: "mild" | "moderate" | "severe";
  notes?: string;
}

export interface MoodLog {
  id: number;
  date: string;
  mood: string;
  intensityScore: number;
  sleepHours: number;
  sleepQuality: "poor" | "fair" | "good" | "excellent";
  notes?: string;
  tags: string[];
}

export interface JournalEntry {
  id: number;
  date: string;
  title: string;
  content: string;
  imageUrl?: string;
  mood?: string;
  weekNumber: number;
  isPrivate: boolean;
}

export interface HospitalBagItem {
  id: number;
  category: "mother" | "baby" | "partner" | "documents" | "essentials" | "medicine";
  item: string;
  isPacked: boolean;
  quantity: number;
}

export interface EmergencyContact {
  id: number;
  name: string;
  relation: string;
  phone: string;
  secondaryPhone?: string;
  address?: string;
  notes?: string;
  isPrimary: boolean;
}

export interface BabyName {
  id: string;
  name: string;
  script?: string;
  gender: "Girl" | "Boy" | "Unisex";
  origin: "Hindu" | "South Indian" | "Muslim" | "Sikh" | "Christian" | "Modern";
  meaning: string;
  pronunciation: string;
  rasi?: string;
  nakshatra?: string;
  luckyNumber?: number;
  isFavorite?: boolean;
}

export interface ScanMilestone {
  id: string;
  title: string;
  trimester: 1 | 2 | 3;
  weeks: string;
  shortDesc: string;
  purpose: string;
  prepTips: string[];
  doctorQuestions: string[];
  keyMetrics: string[];
  type?: "ULTRASOUND" | "LAB_INVESTIGATION" | "FETAL_MONITORING";
  classification?: "RECOMMENDED" | "AS_NEEDED" | "CLINICALLY_INDICATED" | "MANDATORY";
  supportNote?: string;
}

export interface ScanReportAttachment {
  id: string;
  scanId: string; // e.g. "anomaly-scan", "growth-doppler", "ogtt-test"
  fileName: string;
  fileType: "pdf" | "image";
  fileSize: string;
  fileDataUrl: string; // Base64 Data URL string for local preview & offline persistence
  uploadedAt: string;
  notes?: string;
}

export interface BiomarkerMetric {
  name: string;
  value: string | number;
  numericValue?: number;
  unit?: string;
  referenceRange?: string;
  status: "normal" | "low" | "high" | "borderline";
  interpretation?: string;
}

export interface ScanLabMilestoneRecord {
  id: string;
  milestoneId: string;
  title: string;
  type: "ULTRASOUND" | "LAB_INVESTIGATION" | "FETAL_MONITORING";
  category: "Ultrasound Imaging" | "Biochemical Lab" | "Hematology" | "Endocrine / Diabetes" | "Chromosomal Screening" | "Fetal Doppler";
  gestationalWeek: number;
  trimester: 1 | 2 | 3;
  status: "COMPLETED" | "DUE_NOW" | "UPCOMING";
  completedDate?: string;
  clinicalStatus: "NORMAL" | "BORDERLINE" | "ATTENTION";
  findingsSummary: string;
  keyBiomarkers: BiomarkerMetric[];
  reportAttached?: boolean;
  doctorNotes?: string;
}

export interface BiomarkerTrendItem {
  biomarker: string;
  category: string;
  currentValue: string;
  trend: "stable" | "increasing" | "decreasing" | "optimal" | "concerning";
  clinicalSignificance: string;
  status: "optimal" | "watch" | "action";
}

export interface CrossModalCorrelation {
  id: string;
  title: string;
  labMarker: string;
  scanFinding: string;
  correlationAnalysis: string;
  clinicalImplication: string;
  severity: "normal" | "borderline" | "concerning";
}

export interface TimelineWatchlistItem {
  id: string;
  item: string;
  detectedAtWeek: number;
  rationale: string;
  recommendedAction: string;
  urgency: "routine" | "soon" | "immediate";
}

export interface TimelineAnalysisResult {
  clinicalSummary: string;
  overallRiskLevel: "LOW" | "MODERATE" | "ATTENTION_REQUIRED";
  gestationalTimingScore: number; // 0 - 100
  timingAdherenceNote: string;
  keyBiomarkerTrends: BiomarkerTrendItem[];
  crossModalCorrelations: CrossModalCorrelation[];
  watchlistItems: TimelineWatchlistItem[];
  suggestedDoctorQuestions: string[];
  urgentWarningSigns: string[];
  analyzedAt: string;
  source: "GEMINI_AI" | "CLINICAL_ALGORITHM";
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: "reminder" | "milestone" | "health" | "system";
  time: string;
  isRead: boolean;
}

export interface BirthPlanPreference {
  deliveryType: "vaginal" | "c-section-medically-required" | "planned-c-section";
  painManagement: string[];
  birthPartnerName: string;
  birthPartnerRole: string;
  skinToSkin: "immediate" | "delayed" | "partner-if-c-section";
  cordClamping: "delayed-1-3-mins" | "immediate" | "cord-blood-banking";
  newbornProcedures: {
    vitaminK: "shot" | "oral" | "decline";
    eyeOintment: boolean;
    hepBVac: boolean;
    delayedBathing: boolean;
    breastfeedingSupport: boolean;
  };
  specialNotes: string;
}

export interface MedicalProfileData {
  bloodGroup: string;
  rhFactor: "Positive" | "Negative";
  rhOGAMNeeded: boolean;
  allergies: string[];
  gravidaCount: number;
  paraCount: number;
  previousCSection: boolean;
  previousCSectionNotes?: string;
  highRiskNotes: string[];
  emergencyContactName: string;
  emergencyContactPhone: string;
  obgynName: string;
  obgynPhone: string;
  hospitalName: string;
  hospitalAddress: string;
}

export interface VaccineRecord {
  id: string;
  name: string;
  recommendedWeeks: string;
  trimester: 1 | 2 | 3 | "Any";
  purpose: string;
  isCompleted: boolean;
  dateGiven?: string;
  notes?: string;
  isRhSpecific?: boolean;
}

export interface HospitalFacility {
  id: string;
  name: string;
  type: "Maternity Super-Specialty" | "Government Medical College" | "Tertiary Hospital";
  distanceKm: number;
  address: string;
  emergencyPhone: string;
  nicuLevel: "Level I" | "Level II" | "Level III (Specialized)" | "Level IV (Advanced)";
  bloodBankAvailable: boolean;
  pharmacy24x7: boolean;
  ambulanceAvailable: boolean;
  rating: number;
}

// ============================================================================
// FEATURE 19 — TREND & PATTERN DETECTION TYPES
// ============================================================================

export type TrendTimeRangeDays = 3 | 7 | 14 | 30 | 90;

export type DirectionalTrendType = "increasing" | "decreasing" | "stable" | "fluctuating" | "insufficient_data";

export type TrendConfidenceLevel = "strong" | "moderate" | "limited" | "insufficient";

export type PatternDomain =
  | "recovery"
  | "pain"
  | "bleeding"
  | "wound"
  | "breastfeeding"
  | "pumping"
  | "baby_feeding"
  | "diapers"
  | "mother_sleep"
  | "baby_sleep"
  | "mood"
  | "nutrition"
  | "medication";

export interface DataPointEntry {
  date: string;
  value: number | string | null;
  displayValue: string;
  isRecorded: boolean;
  notes?: string;
}

export interface SingleModuleTrend {
  id: string;
  domain: PatternDomain;
  title: string;
  metricName: string;
  trend: DirectionalTrendType;
  confidence: TrendConfidenceLevel;
  recordedCount: number;
  totalDaysInRange: number;
  startValueStr: string;
  endValueStr: string;
  summaryText: string;
  dataPoints: DataPointEntry[];
  sourceModule: string;
  sourceModulePage: PageView;
  explanation: string;
}

export interface CrossModulePattern {
  id: string;
  title: string;
  primaryDomain: PatternDomain;
  secondaryDomain: PatternDomain;
  confidence: TrendConfidenceLevel;
  daysObserved: number;
  summaryText: string;
  explanation: string;
  sourceModules: string[];
  supportingRecords: string[];
}

export interface RecoveryTrajectoryStage {
  stageName: string;
  postpartumRange: string;
  overallRecoveryTrend: DirectionalTrendType;
  painTrend: DirectionalTrendType;
  bleedingTrend: DirectionalTrendType;
  mobilityTrend: DirectionalTrendType;
  energyTrend: DirectionalTrendType;
  summaryText: string;
}

export interface OverallTrendAnalysisResult {
  timeRangeDays: TrendTimeRangeDays;
  startDate: string;
  endDate: string;
  totalRecordsAnalyzed: number;
  trajectory: RecoveryTrajectoryStage;
  singleModuleTrends: SingleModuleTrend[];
  crossModulePatterns: CrossModulePattern[];
  recentChangesSummary: string[];
  insufficientDataDomains: PatternDomain[];
  evaluatedAt: string;
}

// ==========================================
// FEATURE 20 — ANOMALY DETECTION TYPES
// ==========================================

export type AnomalyType = 
  | "sudden_value" 
  | "frequency" 
  | "timing" 
  | "duration" 
  | "cross_module" 
  | "sequence" 
  | "missing_pattern" 
  | "qualitative";

export type AnomalySeverity = "normal" | "possible" | "significant" | "safety_related";

export type AnomalyStatus = "new" | "viewed" | "reviewed" | "resolved";

export type AnomalyDomainCategory =
  | "physical_recovery"
  | "feeding_lactation"
  | "baby_output"
  | "sleep"
  | "emotional"
  | "nutrition"
  | "medication";

export interface AnomalyBaselineInfo {
  periodDays: number;
  baselineRangeStr: string;
  numericRange?: { min: number; max: number; average: number };
  dataPointsCount: number;
  confidence: "strong" | "limited" | "insufficient";
}

export interface DetectedAnomalyItem {
  id: string;
  detectedAt: string;
  domain: PatternDomain;
  category: AnomalyDomainCategory;
  title: string;
  sourceFeature: string;
  sourceModulePage: PageView;
  recordIds: string[];
  anomalyType: AnomalyType;
  severity: AnomalySeverity;
  observedValueStr: string;
  baseline: AnomalyBaselineInfo;
  differenceStr: string;
  explanation: string;
  whyDetectedBullets: string[];
  relatedSignals?: { name: string; value: string }[];
  requiresSafetyReview: boolean;
  status: AnomalyStatus;
  userNotes?: string;
  reviewedAt?: string;
}

export interface MultiSignalCoOccurrence {
  id: string;
  title: string;
  description: string;
  coOccurringAnomalies: string[];
  date: string;
}

export interface OverallAnomalyAnalysisResult {
  evaluatedAt: string;
  totalAnomaliesDetected: number;
  overallStatus: "normal" | "possible_anomaly" | "significant_deviation" | "safety_recommended";
  anomalies: DetectedAnomalyItem[];
  multiSignalCoOccurrences: MultiSignalCoOccurrence[];
  missingDataAlerts: { featureName: string; text: string }[];
}

// ==========================================
// FEATURE 21 — PERSONALIZED DAILY PLAN TYPES
// ==========================================

export type DailyPlanTaskPriority = "priority" | "recommended" | "optional";
export type DailyPlanTaskStatus = "suggested" | "available" | "started" | "completed" | "deferred";
export type DailyPlanTimeOfDay = "morning" | "afternoon" | "evening" | "rest_recovery";

export interface DailyPlanTaskItem {
  id: string;
  taskId: string;
  title: string;
  description: string;
  timeOfDay: DailyPlanTimeOfDay;
  priority: DailyPlanTaskPriority;
  sourceFeature: string;
  sourceModulePage: PageView;
  reason: string;
  dueTimeStr?: string;
  status: DailyPlanTaskStatus;
  completedAt?: string;
  targetBabyId?: string;
  requiresSafetyReview?: boolean;
}

export interface PersonalizedDailyPlanResult {
  generatedAt: string;
  planDate: string;
  postpartumDay: number;
  postpartumWeek: number;
  recoveryStage: string;
  totalTasks: number;
  completedCount: number;
  priorityCount: number;
  tasks: DailyPlanTaskItem[];
  focusSummaryText: string;
  safetyStatus: string;
  restOpportunityNote: string;
}

// ==========================================
// FEATURE 22 — CONTEXT-AWARE REMINDERS TYPES
// ==========================================

export type ReminderPriority =
  | "urgent_safety"
  | "medication_appointment"
  | "recovery"
  | "baby_care"
  | "wellbeing"
  | "routine";

export type ReminderStatus =
  | "scheduled"
  | "upcoming"
  | "triggered"
  | "snoozed"
  | "dismissed"
  | "completed"
  | "suppressed";

export type ReminderCategory =
  | "safety"
  | "medication"
  | "appointment"
  | "recovery"
  | "baby_care"
  | "wellbeing"
  | "doctor_brief";

export interface ContextAwareReminderItem {
  id: string;
  reminderId: string;
  sourceFeature: string;
  sourceTaskId?: string;
  sourceRecordIds?: string[];
  sourceModulePage: PageView;
  category: ReminderCategory;
  title: string;
  description: string;
  priority: ReminderPriority;
  scheduledTimeStr: string;
  triggerType: "fixed_time" | "task_relative" | "appointment_relative" | "safety_alert";
  status: ReminderStatus;
  whyThisReminder: string;
  snoozeUntil?: string;
  targetBabyId?: string;
  babyName?: string;
  createdAt: string;
  completedAt?: string;
  suppressedReason?: string;
}

export interface ReminderUserPreferences {
  notificationsEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  snoozeMinutes: number;
  groupNotifications: boolean;
  categoriesEnabled: Record<ReminderCategory, boolean>;
}

export interface ReminderEngineEvaluationResult {
  evaluatedAt: string;
  totalRemindersCount: number;
  upcomingCount: number;
  suppressedCount: number;
  completedCount: number;
  reminders: ContextAwareReminderItem[];
  userPreferences: ReminderUserPreferences;
}

// ==========================================
// FEATURE 23 — DAILY CHECK-IN TYPES
// ==========================================

export type DailyCheckInStep = "mother" | "baby" | "concerns" | "summary";

export interface BabyCheckInInput {
  babyId: string;
  babyName: string;
  feedingStatus: "Going well" | "Some difficulty" | "More difficult than usual" | "Concerned";
  diaperStatus: "As expected" | "Different today" | "Concerned" | "Haven't checked";
  sleepStatus: "Typical" | "More disrupted" | "More settled" | "Not sure";
}

export interface DailyCheckInSubmissionData {
  // Mother Section
  overallRecovery: OverallRecoveryStatus; // Worse | Same | Better
  painScore: number; // 0-10
  energy: EnergyLevel; // Low | Medium | Good
  sleepQuality: RestQuality | "Very good"; // Poor | Fair | Good | Very good
  mood: "Good" | "Okay" | "Low" | "Worried" | "Very low";
  bleedingStatus: "No change" | "Improving" | "Increased" | "Concerned";
  woundStatus: "No change" | "Improving" | "New change" | "Concerned";
  breastfeedingStatus: "Going well" | "Some difficulty" | "Very difficult" | "Not breastfeeding today";
  pumpingStatus: "Going well" | "Some difficulty" | "Difficult" | "Not pumping today";
  
  // Baby Section (supports multiple/twins)
  babyCheckIns: BabyCheckInInput[];

  // Concerns & Doctor Prep Section
  userNote?: string;
  addToDoctorBrief?: boolean;
}

export interface DailyCheckInEvent {
  checkInId: string;
  date: string; // YYYY-MM-DD
  completedAt: string;
  postpartumDay: number;
  postpartumWeek: number;
  recoveryStage: string;
  overallMotherStatus: string;
  overallBabyStatus: string;
  concernFlag: boolean;
  userNote?: string;
  addedToDoctorBrief?: boolean;
  linkedRecordIds: string[];
  completionStatus: "completed" | "partially_completed";
  submissionData: DailyCheckInSubmissionData;
}

export interface DailyCheckInResultSummary {
  event: DailyCheckInEvent;
  safetyStatus: SafetyEvaluationResult;
  trendsSummary?: string;
  anomaliesDetectedCount: number;
  planTasksCompletedCount: number;
  remindersAutoSuppressedCount: number;
  whatIsGoingWell: string[];
  whatChanged: string[];
  whatNeedsAttention: string[];
}

// ==========================================
// FEATURE 24 — FOLLOW-UP / CONTINUITY TYPES
// ==========================================

export type FollowUpType =
  | "monitor"
  | "recheck"
  | "appointment_followup"
  | "provider_question"
  | "recovery_followup"
  | "baby_care_followup"
  | "medication_followup"
  | "safety_followup";

export type FollowUpStatus =
  | "active"
  | "due"
  | "needs_review"
  | "safety_linked"
  | "resolved"
  | "cancelled";

export type FollowUpTrendOutcome =
  | "improving"
  | "same"
  | "worsening"
  | "no_recent_update"
  | "pending_review";

export interface FollowUpTimelineEntry {
  id: string;
  timestamp: string; // ISO
  dateStr: string; // YYYY-MM-DD
  postpartumDay: number;
  eventTitle: string;
  description: string;
  sourceModule: string;
  outcome?: FollowUpTrendOutcome;
  userNotes?: string;
}

export interface FollowUpThread {
  followUpId: string;
  createdAt: string;
  postpartumDay: number;
  postpartumWeek: number;
  sourceFeature: string;
  sourceRecordIds: string[];
  category: "MOTHER_RECOVERY" | "BABY_CARE" | "SAFETY" | "APPOINTMENT" | "MEDICATION" | "DOCTOR_BRIEF";
  type: FollowUpType;
  title: string;
  description: string;
  createdReason: string;
  startDate: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
  priority: "routine" | "important" | "urgent_safety";
  status: FollowUpStatus;
  currentOutcome: FollowUpTrendOutcome;
  targetBabyId?: string;
  babyName?: string;
  linkedAppointmentId?: string;
  linkedDoctorBriefQuestionId?: string;
  linkedSafetyReference?: string;
  userNotes?: string;
  timeline: FollowUpTimelineEntry[];
  lastReviewedAt?: string;
  resolvedAt?: string;
}

export interface FollowUpEngineEvaluationResult {
  evaluatedAt: string;
  totalThreadsCount: number;
  activeCount: number;
  dueCount: number;
  needsReviewCount: number;
  safetyLinkedCount: number;
  resolvedCount: number;
  threads: FollowUpThread[];
}

// ==========================================
// FEATURE 25 — POSTPARTUM EDUCATION TYPES
// ==========================================

export type EducationCategory =
  | "mother_recovery"
  | "baby_care"
  | "breastfeeding_lactation"
  | "sleep_fatigue"
  | "mood_wellbeing"
  | "nutrition_hydration"
  | "medication_safety"
  | "appointment_prep";

export interface EducationTopic {
  topicId: string;
  title: string;
  category: EducationCategory;
  summary: string;
  whySeeingThis: string; // Transparent rationale e.g., "Recommended because you're in Postpartum Week 2 and logged pain 7/10"
  applicableStages: string[];
  applicableBabyAgeDays?: { min: number; max: number };
  relatedFeatureName: string;
  relatedModulePage: PageView;
  whatItIs: string;
  whatYouMayNotice: string[];
  whatToKeepTrackOf: string[];
  whenToPayAttention: string[]; // Warning signs / Safety shield link
  questionsForDoctor: string[]; // Doctor Brief questions link
  readTimeMinutes: number;
  isSafetyRelated: boolean;
  contentSource: string;
}

export interface UserEducationHistoryItem {
  topicId: string;
  viewedAt: string;
  isSaved: boolean;
  isCompleted: boolean;
}

export interface PersonalizedEducationEvaluationResult {
  evaluatedAt: string;
  learnTodayTopics: EducationTopic[];
  basedOnRecordsTopics: EducationTopic[];
  motherRecoveryTopics: EducationTopic[];
  babyCareTopics: EducationTopic[];
  savedTopics: EducationTopic[];
  completedCount: number;
}

// ==========================================
// FEATURE 26 — PERSONALIZED RECOVERY INSIGHT TYPES
// ==========================================

export type InsightDomainStatus = "improving" | "stable" | "needs_attention" | "active" | "insufficient_data";

export interface RecoveryDomainOverview {
  domain: string;
  label: string;
  status: InsightDomainStatus;
  summaryText: string;
  sourceModule: string;
}

export interface InsightEvidencePoint {
  id: string;
  dateStr: string;
  featureName: string;
  observationText: string;
  valueStr: string;
}

export interface PersonalizedRecoveryInsightResult {
  generatedAt: string;
  timeRangeDays: number;
  postpartumDay: number;
  postpartumWeek: number;
  recoveryStage: string;
  overallNarrativeSummary: string;
  domainOverviews: RecoveryDomainOverview[];
  whatsGoingWell: string[];
  areasToWatch: string[];
  recentChanges: { domain: string; fromVal: string; toVal: string; trend: "improving" | "decreasing" | "stable" }[];
  safetyStatus: SafetyEvaluationResult;
  suggestedTodayActions: { title: string; targetPage: PageView; actionLabel: string }[];
  confidenceLevel: "strongly_supported" | "limited_data" | "insufficient_data";
  totalRecordsAnalyzed: number;
  evidencePoints: InsightEvidencePoint[];
}

// ==========================================
// FEATURE 27 — BABY GROWTH & MILESTONES TYPES
// ==========================================

export type GrowthMeasurementSource = "PEDIATRICIAN_VISIT" | "HOME_SCALE" | "CLINIC" | "OTHER";

export interface GrowthRecord {
  growthRecordId: string;
  babyId: string;
  recordedAt: string;
  measurementDate: string; // YYYY-MM-DD
  weightKg?: number;
  lengthCm?: number;
  headCircumferenceCm?: number;
  measurementSource: GrowthMeasurementSource;
  measurementLocation?: string;
  measurementNotes?: string;
  sourceAppointmentId?: string;
}

export type MilestoneCategory = "GROSS_MOTOR" | "FINE_MOTOR" | "COMMUNICATION" | "SOCIAL_EMOTIONAL" | "COGNITIVE";

export type MilestoneStatus =
  | "NOT_INTRODUCED"
  | "NOT_YET_OBSERVED"
  | "OBSERVED"
  | "CONSISTENTLY_OBSERVED"
  | "DISCUSS_WITH_PEDIA"
  | "NOT_APPLICABLE";

export interface MilestoneDefinition {
  milestoneId: string;
  title: string;
  category: MilestoneCategory;
  ageRangeWeeks: [number, number]; // e.g. [0, 8] for 0-8 weeks
  ageRangeLabel: string; // e.g. "0 - 2 Months"
  description: string;
  tipsForParents: string;
}

export interface MilestoneObservation {
  observationId: string;
  babyId: string;
  milestoneId: string;
  status: MilestoneStatus;
  firstObservedAt?: string;
  consistentlyObservedAt?: string;
  userNotes?: string;
  isFirstMemory?: boolean;
}

export interface BabyGrowthSummary {
  babyId: string;
  babyName: string;
  ageDays: number;
  ageWeeks: number;
  birthWeightKg?: number;
  birthLengthCm?: number;
  latestWeightKg?: number;
  latestLengthCm?: number;
  latestHeadCircumferenceCm?: number;
  latestMeasurementDate?: string;
  previousWeightKg?: number;
  recordedWeightChangeKg?: number;
  totalMeasurementsCount: number;
  observedMilestonesCount: number;
  pendingMilestonesCount: number;
  itemsToDiscussWithPediaCount: number;
}

// ==========================================
// FEATURE 28 — VACCINATION TRACKING TYPES
// ==========================================

export type VaccineVerificationSource =
  | "VACCINATION_CARD"
  | "HOSPITAL_RECORD"
  | "PEDIATRICIAN_CLINIC"
  | "DIGITAL_RECORD"
  | "PARENT_MEMORY"
  | "OTHER";

export type VaccineDoseStatus =
  | "COMPLETED"
  | "UPCOMING"
  | "DUE"
  | "NEEDS_VERIFICATION"
  | "SCHEDULED"
  | "CATCH_UP_PLAN";

export interface VaccineDefinition {
  vaccineId: string;
  code: string;
  name: string;
  fullTitle: string;
  targetDiseases: string[];
  recommendedAgeWeeks: number; // e.g. 0 for Birth, 6 for 6 weeks
  recommendedAgeLabel: string; // e.g. "Birth", "6 Weeks", "10 Weeks"
  doseNumber: number;
  totalDoses: number;
  description: string;
  isEssential: boolean;
}

export interface VaccinationRecord {
  vaccinationRecordId: string;
  babyId: string;
  vaccineId: string;
  doseNumber: number;
  administeredDate: string; // YYYY-MM-DD
  administeredTime?: string;
  provider?: string;
  clinicLocation?: string;
  batchLotNumber?: string;
  verificationSource: VaccineVerificationSource;
  verificationStatus: "VERIFIED" | "USER_REPORTED" | "NEEDS_VERIFICATION";
  notes?: string;
  sourceAppointmentId?: string;
}

export interface BabyVaccinationSummary {
  babyId: string;
  babyName: string;
  ageDays: number;
  ageWeeks: number;
  totalCompleted: number;
  totalUpcoming: number;
  totalDue: number;
  totalNeedsVerification: number;
  nextDueVaccine?: VaccineDefinition;
  nextDueDateStr?: string;
}

// ==========================================
// FEATURE 29 — AI MEMORY / PATIENT HISTORY TYPES
// ==========================================

export type MemoryType =
  | "PATIENT_CONTEXT"
  | "BABY_CONTEXT"
  | "IMPORTANT_EVENT"
  | "CONCERN"
  | "SYMPTOM_HISTORY"
  | "CARE_EVENT"
  | "APPOINTMENT_OUTCOME"
  | "TREND_HISTORY"
  | "SAFETY_EVENT"
  | "USER_PREFERENCE"
  | "USER_CONFIRMED_MEMORY";

export type MemoryConfidence =
  | "DIRECT_RECORDED"
  | "PROVIDER_VERIFIED"
  | "USER_ENTERED"
  | "CALCULATED"
  | "PATTERN_DETECTED"
  | "AI_INTERPRETATION";

export type MemoryVisibility = "PRIVATE" | "APP_ONLY" | "USER_SELECTED_FOR_DOCTOR";

export interface PatientMemoryItem {
  memoryId: string;
  createdAt: string;
  updatedAt: string;
  memoryType: MemoryType;
  category: "MOTHER" | "BABY" | "CARE_JOURNEY" | "PREFERENCE";
  title: string;
  summary: string;
  sourceFeature: string; // e.g. "Feature 01", "Feature 06", "Feature 18"
  sourceRecordIds?: string[];
  eventDate: string; // YYYY-MM-DD
  importance: "HIGH" | "MEDIUM" | "LOW";
  confidence: MemoryConfidence;
  status: "ACTIVE" | "RESOLVED" | "ARCHIVED" | "UNDER_MONITORING";
  userConfirmed: boolean;
  linkedAppointmentId?: string;
  linkedFollowUpId?: string;
  linkedDoctorBriefId?: string;
  linkedSafetyReference?: string;
  linkedTrendId?: string;
  visibility: MemoryVisibility;
  notes?: string;
}

export interface PatientHistorySummary {
  totalMemoriesCount: number;
  activeConcernsCount: number;
  resolvedConcernsCount: number;
  keyEventsCount: number;
  userPreferencesCount: number;
  latestEvent?: PatientMemoryItem;
}

// ==========================================
// FEATURE 30 — CARE COORDINATION TYPES
// ==========================================

export type CareCoordinationPriority = "URGENT" | "HIGH" | "MEDIUM" | "ROUTINE" | "INFORMATIONAL";

export type CareCoordinationStatus =
  | "DETECTED"
  | "NEEDS_REVIEW"
  | "ACTION_REQUIRED"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "AWAITING_OUTCOME"
  | "COMPLETED"
  | "RESOLVED_CLOSED";

export type CareActionType =
  | "PREPARE_DOCTOR_BRIEF"
  | "SCHEDULE_APPOINTMENT"
  | "COMPLETE_FOLLOW_UP"
  | "VERIFY_VACCINE_RECORD"
  | "LOG_GROWTH_CHECK"
  | "REVIEW_SAFETY_ALERT"
  | "GENERAL_CARE_TASK";

export interface CareTeamMember {
  memberId: string;
  name: string;
  role: "OBSTETRICIAN" | "PEDIATRICIAN" | "LACTATION_CONSULTANT" | "GYNECOLOGIST" | "PRIMARY_CARE" | "OTHER";
  specialty: string;
  clinicName: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface CareCoordinationItem {
  coordinationId: string;
  createdAt: string;
  updatedAt: string;
  personType: "MOTHER" | "BABY" | "FAMILY";
  personId?: string;
  category: "SAFETY" | "APPOINTMENT" | "FOLLOW_UP" | "VACCINATION" | "GROWTH" | "DOCTOR_BRIEF" | "GENERAL";
  title: string;
  description: string;
  priority: CareCoordinationPriority;
  status: CareCoordinationStatus;
  sourceFeature: string; // e.g. "Feature 04", "Feature 17", "Feature 24", "Feature 28"
  sourceRecordIds?: string[];
  actionType: CareActionType;
  dueDate?: string; // YYYY-MM-DD
  assignedTo?: string;
  careTeamMemberId?: string;
  linkedAppointmentId?: string;
  linkedFollowUpId?: string;
  linkedDoctorBriefId?: string;
  linkedSafetyReference?: string;
  linkedTrendId?: string;
  linkedAnomalyId?: string;
  relatedMemoryIds?: string[];
  userNotes?: string;
  completedAt?: string;
  outcome?: string;
}

export interface CareCoordinationSummary {
  totalItemsCount: number;
  needsAttentionCount: number;
  upcomingCount: number;
  inProgressCount: number;
  completedCount: number;
  urgentCount: number;
  careTeamMembersCount: number;
}

// ==========================================
// AGENT 1 — MOTHER & RECOVERY AI TYPES
// ==========================================

export type MotherAgentResponseType =
  | "SUMMARY"
  | "QUESTION_ANSWER"
  | "TREND_EXPLANATION"
  | "RECOVERY_INSIGHT"
  | "SAFETY_EXPLANATION"
  | "FEATURE_GUIDANCE"
  | "CARE_ROUTING"
  | "DOCTOR_PREPARATION"
  | "FOLLOW_UP_CONTEXT"
  | "INSUFFICIENT_DATA";

export type MotherAgentFactBadge =
  | "RECORDED_FACT"
  | "CALCULATED_OBSERVATION"
  | "DETECTED_PATTERN"
  | "SAFETY_ALERT"
  | "AI_SUGGESTION";

export interface MotherAgentFact {
  tag: MotherAgentFactBadge;
  label: string;
  text: string;
}

export interface MotherAgentAction {
  title: string;
  description: string;
  targetPage: PageView;
  buttonText: string;
}

export interface DataRationale {
  sourceFeatures: string[];
  dataPointsUsed: string[];
  timeRange: string;
}

export interface MotherRecoveryContext {
  postpartumDay: number;
  postpartumWeek: number;
  recoveryStage: string;
  deliveryType: string;
  hasSufficientData: boolean;
  safetyStatus: string;
  activeSafetyAlertsCount: number;
  urgentSafetyMessage?: string;
  recentRecoveryRating?: number;
  recentEnergyLevel?: number;
  recentPainScore?: number;
  recentPainLocation?: string;
  recentLochiaStage?: string;
  recentPadsIn2Hours?: number;
  woundAppearance?: string;
  breastfeedingMinutesToday?: number;
  pumpingVolumeMlToday?: number;
  sleepHours24h?: number;
  recentFatigueLevel?: number;
  recentMoodState?: string;
  waterMlToday?: number;
  medicationsTakenCount?: number;
  activeMedicationsCount?: number;
  activeTrendsCount?: number;
  activeAnomaliesCount?: number;
  openFollowUpsCount?: number;
  activeCareTasksCount?: number;
  queryMatchedMemoriesCount?: number;
  sanitizedSummaryText: string;
}

export interface MotherAgentResponse {
  answer: string;
  responseType: MotherAgentResponseType;
  facts: MotherAgentFact[];
  observations: string[];
  safetyStatus: "NO_CONCERNS" | "NEEDS_ATTENTION" | "URGENT_ATTENTION";
  recommendedActions: MotherAgentAction[];
  sourceFeatures: string[];
  whyAmISeeingThis: DataRationale;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  dataSufficiency: "FULL" | "PARTIAL" | "INSUFFICIENT";
  isUrgentOverride?: boolean;
}

// ==========================================
// AGENT 2 — BABY CARE AI AGENT TYPES
// ==========================================

export type BabyAgentResponseType =
  | "SUMMARY"
  | "QUESTION_ANSWER"
  | "FEEDING_SUMMARY"
  | "DIAPER_SUMMARY"
  | "SLEEP_SUMMARY"
  | "GROWTH_SUMMARY"
  | "MILESTONE_SUMMARY"
  | "VACCINATION_SUMMARY"
  | "TREND_EXPLANATION"
  | "ANOMALY_EXPLANATION"
  | "SAFETY_EXPLANATION"
  | "PEDIATRIC_PREPARATION"
  | "FOLLOW_UP_CONTEXT"
  | "CARE_ROUTING"
  | "INSUFFICIENT_DATA";

export type BabyAgentFactBadge =
  | "RECORDED_FACT"
  | "CALCULATED_OBSERVATION"
  | "DETECTED_PATTERN"
  | "SAFETY_ALERT"
  | "AI_SUGGESTION";

export interface BabyAgentFact {
  tag: BabyAgentFactBadge;
  label: string;
  text: string;
}

export interface BabyAgentAction {
  title: string;
  description: string;
  targetPage: PageView;
  buttonText: string;
}

export interface BabyDataRationale {
  sourceFeatures: string[];
  dataPointsUsed: string[];
  timeRange: string;
  babyId?: string;
  babyName?: string;
}

export interface BabyCareContext {
  selectedBabyId?: string;
  babyName: string;
  babyGender?: string;
  babyAgeDays: number;
  babyAgeFormatted: string;
  
  // Birth Measurements (from F3 Baby Profile)
  birthWeightKg?: number;
  birthLengthCm?: number;
  
  // Current Growth Measurements (from F27 Growth Records)
  latestWeightKg?: number;
  latestLengthCm?: number;
  latestHeadCircumferenceCm?: number;
  
  hasSufficientData: boolean;
  safetyStatus: "NO_CONCERNS" | "NEEDS_ATTENTION" | "URGENT_ATTENTION";
  activeSafetyAlertsCount: number;
  urgentSafetyMessage?: string;
  
  // F10 Feeding summary
  feedingSessions24h: number;
  totalFormulaMl24h: number;
  totalExpressedMl24h: number;
  directBreastfeedingMinutes24h: number;
  latestFeedingMethod?: string;
  
  // F11 Diaper summary
  diaperEvents24h: number;
  wetDiapers24h: number;
  dirtyDiapers24h: number;
  mixedDiapers24h: number;
  latestStoolColor?: string;
  
  // F13 Sleep summary
  sleepHours24h: number;
  sleepSessions24h: number;
  latestSleepQuality?: string;
  
  // F27 Milestones summary
  milestonesObservedCount: number;
  milestonesPendingCount: number;
  
  // F28 Vaccination summary (from F28 Schedule Engine authority)
  upcomingVaccinesCount: number;
  completedVaccinesCount: number;
  nextVaccineName?: string;
  nextVaccineDueDate?: string;
  
  // F19, F20, F24, F29 summaries
  activeTrendsCount: number;
  activeAnomaliesCount: number;
  openFollowUpsCount: number;
  queryMatchedMemoriesCount: number;
  sanitizedSummaryText: string;
}

export interface BabyAgentResponse {
  answer: string;
  responseType: BabyAgentResponseType;
  facts: BabyAgentFact[];
  observations: string[];
  safetyStatus: "NO_CONCERNS" | "NEEDS_ATTENTION" | "URGENT_ATTENTION";
  recommendedActions: BabyAgentAction[];
  sourceFeatures: string[];
  whyAmISeeingThis: BabyDataRationale;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  dataSufficiency: "FULL" | "PARTIAL" | "INSUFFICIENT";
  isUrgentOverride?: boolean;
}

// ==========================================
// AGENT 3 — SAFETY & CARE COORDINATION AI AGENT TYPES
// ==========================================

export type SafetyCoordinationResponseType =
  | "SAFETY_SUMMARY"
  | "PRIORITY_SUMMARY"
  | "FOLLOWUP_CONTINUITY"
  | "APPOINTMENT_PREP"
  | "CARE_COORDINATION"
  | "MOTHER_BABY_SUMMARY"
  | "VACCINATION_VERIFICATION"
  | "TREND_EXPLANATION"
  | "ANOMALY_EXPLANATION"
  | "QUESTION_ANSWER"
  | "INSUFFICIENT_DATA";

export type SafetyCoordinationFactBadge =
  | "RECORDED_FACT"
  | "CALCULATED_OBSERVATION"
  | "DETECTED_PATTERN"
  | "SAFETY_ALERT"
  | "AI_SUGGESTION";

export interface SafetyCoordinationFact {
  tag: SafetyCoordinationFactBadge;
  label: string;
  text: string;
}

export interface SafetyCoordinationAction {
  title: string;
  description: string;
  targetPage: PageView;
  buttonText: string;
}

export interface SafetyCoordinationRationale {
  sourceFeatures: string[];
  dataPointsUsed: string[];
  timeRange: string;
  scope: "MOTHER" | "BABY" | "BOTH";
  babyId?: string;
  babyName?: string;
}

export interface SafetyCoordinationContext {
  postpartumDay: number;
  postpartumWeek: number;
  recoveryStage: string;
  selectedBabyId?: string;
  babyName?: string;
  babyAgeFormatted?: string;
  
  // Authoritative Safety Assessment from F4 Safety Shield
  safetyStatus: "NO_CONCERNS" | "NEEDS_ATTENTION" | "URGENT_ATTENTION";
  urgentSafetyMessage?: string;
  activeSafetyAlertsCount: number;
  
  // F17 Appointments summary
  upcomingAppointmentsCount: number;
  nextAppointmentTitle?: string;
  nextAppointmentDate?: string;
  
  // F18 Doctor Brief summary
  hasDoctorBriefPrepared: boolean;
  
  // F19 & F20 summaries
  activeTrendsCount: number;
  activeAnomaliesCount: number;
  
  // F21 & F22 summaries
  dailyPlanTopPriority?: string;
  activeRemindersCount: number;
  
  // F24 Follow-up summary
  openFollowUpsCount: number;
  latestFollowUpTitle?: string;
  
  // F28 Vaccines summary
  nextVaccineName?: string;
  nextVaccineDueDate?: string;
  
  // F29 Memories & F30 Care Coordination
  matchedMemoriesCount: number;
  openCareTasksCount: number;
  
  hasSufficientData: boolean;
  sanitizedSummaryText: string;
}

export interface SafetyCoordinationAgentResponse {
  answer: string;
  responseType: SafetyCoordinationResponseType;
  facts: SafetyCoordinationFact[];
  observations: string[];
  safetyStatus: "NO_CONCERNS" | "NEEDS_ATTENTION" | "URGENT_ATTENTION";
  recommendedActions: SafetyCoordinationAction[];
  sourceFeatures: string[];
  whyAmISeeingThis: SafetyCoordinationRationale;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  dataSufficiency: "FULL" | "PARTIAL" | "INSUFFICIENT";
  isUrgentOverride?: boolean;
}

export * from "./types/digitalTwin";








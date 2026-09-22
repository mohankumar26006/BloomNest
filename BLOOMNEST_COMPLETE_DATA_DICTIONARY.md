# BLOOMNEST — COMPLETE APPLICATION DATA DICTIONARY

## EXECUTIVE OVERVIEW

This document is the **Authoritative Complete Data Dictionary** for the BloomNest maternal-health platform. It covers all data entities, attributes, user collection mechanisms, persistence requirements, AI accessibility, and lifecycle rules across the complete continuum:

`Preconception → Pregnancy → Birth Preparation → Postpartum → Newborn`

---

## 1. IDENTITY & ACCESS DOMAIN

### 1.1 User Identity (`User`)
* **Collected Information**: Full Name, Email, Password Hash, Role (`user` | `admin`), CreatedAt, UpdatedAt.
* **Displayed Information**: Account Profile header, Settings modal, Auth status bar.
* **User Actions**: Create (Sign-Up), Edit (Profile Settings).
* **Persistence Requirement**: Mandatory cross-device PostgreSQL persistence.
* **AI Access**: FULL (Name, ID used for personalization context).
* **Sensitivity**: HIGH (PII, Auth Credentials).

### 1.2 Authentication & Session (`AuthSession`)
* **Collected Information**: Email, Hashed Password (bcrypt), Auth Tokens, Login Timestamps.
* **Displayed Information**: Auth Status, Toast notifications ("Sign in successful").
* **User Actions**: Sign In, Sign Out, Password Reset (reset code verification).
* **Persistence Requirement**: Server-managed session / DB token store + HTTP-only cookies/tokens.
* **AI Access**: NONE (Security boundary).
* **Sensitivity**: CRITICAL.

### 1.3 User Preferences & Localization (`UserPreferences`)
* **Collected Information**: Preferred Language (`en`, `hi`, `ta`, `te`, `mr`, `bn`), Theme (`soft-pastel-minimal`, `black-rosegold`, `serene-rose`, `midnight-lavender`, `botanical-sage`, `sunset-coral`), Dark Mode Boolean, Mute Audio Boolean.
* **Displayed Information**: Active UI translations, CSS theme token classes, Mute toggles.
* **User Actions**: Switch Language, Toggle Theme, Toggle Dark Mode, Mute Alerts.
* **Persistence Requirement**: Primary PostgreSQL + Local cache for instant render.
* **AI Access**: PARTIAL (Language preference for localized AI responses).
* **Sensitivity**: LOW.

### 1.4 Onboarding State (`OnboardingState`)
* **Collected Information**: `hasCompletedOnboarding` (Boolean), Initial Selected Journey Stage, Initial LMP/EDD.
* **Displayed Information**: Onboarding Wizard vs Main Dashboard.
* **User Actions**: Complete Onboarding Flow.
* **Persistence Requirement**: PostgreSQL + Local Cache.
* **AI Access**: PARTIAL (Initial journey stage for welcoming).
* **Sensitivity**: LOW.

---

## 2. MATERNAL JOURNEY DOMAIN

### 2.1 Journey Profile (`JourneyProfile`)
* **Collected Information**: Current Journey Stage (`PRE_PREGNANCY`, `PREGNANCY`, `POST_PREGNANCY`), Last Menstrual Period Date (`lmpDate`), Estimated Due Date (`eddDate`), Current Gestational Week (1–42), Trimester (1, 2, 3), Pre-Pregnancy Details (cycle length, goals), Postpartum Details (baby DOB, gender, recovery goals).
* **Displayed Information**: Dashboard header widget, 3D Anatomical Viewport stage, Timeline week marker.
* **User Actions**: Update LMP/EDD, Switch Journey Stage, Recalculate Week.
* **Persistence Requirement**: Mandatory PostgreSQL canonical storage.
* **AI Access**: FULL (Crucial context for weekly medical safety checks and AI advice).
* **Sensitivity**: HIGH (PHI).

### 2.2 Pre-Pregnancy Journey Details (`PrePregnancyDetails`)
* **Collected Information**: Last Period Date, Cycle Length Days (default 28), Cycle Regularity (Boolean), Conception Goal, Wellness Focus tags.
* **Displayed Information**: Preconception Lab Header, Fertile Window predictor widget.
* **User Actions**: Input/update cycle length, toggle regularity, select wellness focus.
* **Persistence Requirement**: Canonical PostgreSQL (`JourneyProfile` extension or standalone table).
* **AI Access**: FULL (Used by AI for fertility window advice and preconception care).
* **Sensitivity**: HIGH (Reproductive health).

### 2.3 Postpartum Journey Details (`PostpartumDetails`)
* **Collected Information**: Baby Date of Birth, Baby Name, Baby Gender (`Boy`, `Girl`, `Surprise`), Delivery Notes, Recovery Goals.
* **Displayed Information**: Newborn Growth Tracker, Postpartum Wellness view.
* **User Actions**: Enter birth details post-delivery.
* **Persistence Requirement**: Canonical PostgreSQL.
* **AI Access**: FULL (Used for newborn feeding, vaccination, and postpartum depression checks).
* **Sensitivity**: HIGH.

---

## 3. PRECONCEPTION DOMAIN

### 3.1 Cycle Log (`PreconceptionCycleLog`)
* **Collected Information**: Log Date, Cervical Mucus Type (`dry`, `sticky`, `creamy`, `watery`, `eggwhite`), Ovulation Test Result (`negative`, `positive`, `peak`), Basal Body Temp (BBT in °F/°C), Intercourse/Conception Log (Boolean), Symptoms (cramps, bloating, mood changes), Daily Notes.
* **Displayed Information**: Preconception Cycle Lab timeline, 3D Cervical Mucus Visualizer, Fertile Calendar overlay.
* **User Actions**: Add/edit daily cycle observations, log LH test strip pictures/results.
* **Persistence Requirement**: Mandatory PostgreSQL table. Currently stored in `localStorage` (`bloom_pre_cycleLogs`).
* **AI Access**: FULL (Used for precision fertility prediction and cycle anomaly detection).
* **Sensitivity**: CRITICAL (Sensitive reproductive data).

### 3.2 Cycle Master Configuration (`PreconceptionCycleConfig`)
* **Collected Information**: Average Cycle Length Days (e.g. 28-35), Average Period Duration Days (e.g. 3-7), Last Period Start Date.
* **Displayed Information**: Fertile Window gauge, Ovulation Day countdown.
* **User Actions**: Update cycle parameters in Preconception Lab header.
* **Persistence Requirement**: PostgreSQL. Currently stored in `localStorage` (`bloom_pre_cycleLength`, `bloom_pre_periodDuration`, `bloom_pre_lastPeriodDate`).
* **AI Access**: FULL.
* **Sensitivity**: HIGH.

### 3.3 Folate & Preconception Supplement Adherence (`PreconceptionSupplementLog`)
* **Collected Information**: Date, Folate Taken (Boolean, 400mcg/800mcg), Folate Streak Count, Vitamin D/Iron Taken (Boolean).
* **Displayed Information**: 30-Day Folate Streak Ring, Neural Tube Defect Risk Reduction Gauge.
* **User Actions**: Tap "Mark Folate Taken Today".
* **Persistence Requirement**: PostgreSQL. Currently stored in `localStorage` (`bloom_pre_folateStreak`, `bloom_pre_folate_YYYY-MM-DD`).
* **AI Access**: FULL (Used for neural tube protection advice).
* **Sensitivity**: MEDIUM.

### 3.4 Preconception Hydration (`PreconceptionHydrationLog`)
* **Collected Information**: Date, Water Glasses Count (250ml each).
* **Displayed Information**: Hydration Progress Bar in Preconception Nutrition.
* **User Actions**: Increment water glass count.
* **Persistence Requirement**: PostgreSQL (aggregated daily vital log). Currently in `localStorage` (`bloom_pre_water_YYYY-MM-DD`).
* **AI Access**: PARTIAL.
* **Sensitivity**: LOW.

---

## 4. PREGNANCY DOMAIN

### 4.1 Health Vitals Log (`HealthVitalLog`)
* **Collected Information**: Log Timestamp, Systolic BP, Diastolic BP, Pulse (bpm), Temperature (°C), Weight (kg), Glucose (mg/dL), Glucose Context (`fasting`, `1h_post_meal`, `2h_post_meal`), Sleep Hours, Water Intake (mL), Energy Level (1-10), Mood, Baby Kicks Count, Symptom Safety Alerts (Headache, Vision Changes, Abdominal Pain, Breathing, Swelling), Overall Status (`NORMAL`, `ATTENTION`, `HIGH`, `SEVERE`), Urgent Attention Flag.
* **Displayed Information**: Vitals Graph, Clinical Status Badge, Urgent Red Banner.
* **User Actions**: Log new vital reading, run quick BP/Glucose evaluation.
* **Persistence Requirement**: Primary PostgreSQL (`HealthVitalLog` model exists).
* **AI Access**: FULL (Triggers clinical escalation algorithms).
* **Sensitivity**: CRITICAL (Vital health stats).

### 4.2 Blood Sugar Log (`BloodSugarLog`)
* **Collected Information**: Log Date/Time, Glucose Level (mg/dL), Context (`fasting`, `postprandial`), Insulin Administered (Units), Notes.
* **Displayed Information**: Gestational Diabetes Glucose Trend Chart.
* **User Actions**: Add glucose measurement.
* **Persistence Requirement**: PostgreSQL (`BloodSugarLog`).
* **AI Access**: FULL.
* **Sensitivity**: CRITICAL.

### 4.3 Fetal Kick Sessions (`KickSession`)
* **Collected Information**: Session Date, Start Time, Kick Count (target 10 kicks), Duration Minutes, Session Notes.
* **Displayed Information**: Fetal Kick History List, 2-Hour Kick Target Bar.
* **User Actions**: Start/Stop Kick Counter session, tap kick button.
* **Persistence Requirement**: PostgreSQL (`KickSession` table). Currently in IndexedDB (`kickSessions`).
* **AI Access**: FULL (Fetal well-being monitoring).
* **Sensitivity**: HIGH.

### 4.4 Contraction Timer Sessions (`ContractionLog`)
* **Collected Information**: Date, Start Time, End Time, Duration (seconds), Interval (seconds), Intensity (`mild`, `moderate`, `severe`), Notes.
* **Displayed Information**: Contraction Pattern Analyzer, "Go to Hospital" 5-1-1 Rule Alert.
* **User Actions**: Start/Stop contraction timer, record intensity.
* **Persistence Requirement**: PostgreSQL (`ContractionLog` table). Currently in IndexedDB (`contractions`).
* **AI Access**: FULL (Labor detection & triage).
* **Sensitivity**: HIGH.

### 4.5 Medication & Supplement Schedule (`Medication` & `MedicationLog`)
* **Collected Information**: Medicine Name, Dosage (e.g., 100mg), Time of Day, Frequency (`daily`, `twice_daily`), Prescribing Doctor, Active Status (Boolean), Adherence History (Taken / Missed per date).
* **Displayed Information**: Daily Medication Checklist, Pill Reminders.
* **User Actions**: Add medication, mark taken/untaken today.
* **Persistence Requirement**: Relational PostgreSQL (`Medication` and `MedicationAdherence`). Currently in IndexedDB (`medicines`).
* **AI Access**: FULL (Drug interaction & prenatal safety checks).
* **Sensitivity**: CRITICAL.

### 4.6 Prenatal Appointments (`Appointment`)
* **Collected Information**: Doctor Name, Hospital/Clinic Name, Appointment Date & Time, Purpose (e.g., Anomaly Scan, Routine Checkup), Doctor Notes, Reminder Enabled (Boolean), Status (`upcoming`, `completed`, `cancelled`).
* **Displayed Information**: Upcoming Visits Card, Calendar view.
* **User Actions**: Add appointment, mark completed, write visit notes.
* **Persistence Requirement**: Relational PostgreSQL (`Appointment`). Currently in IndexedDB (`appointments`).
* **AI Access**: FULL (Doctor brief generation).
* **Sensitivity**: HIGH.

### 4.7 Birth Plan Preferences (`BirthPlan`)
* **Collected Information**: Delivery Type (`vaginal`, `c-section-medically-required`, `planned-c-section`), Pain Management Preferences, Birth Partner Name & Role, Skin-to-Skin Contact Choice, Cord Clamping Choice, Newborn Procedures (Vitamin K, Eye Ointment, Hep B, Delayed Bathing), Special Cultural/Personal Notes.
* **Displayed Information**: Interactive Birth Plan PDF exporter / Viewer.
* **User Actions**: Customize birth plan selections.
* **Persistence Requirement**: PostgreSQL (`BirthPlan`). Currently in IndexedDB (`user.birthPlan`).
* **AI Access**: FULL (Hospital admission preparation & advocacy).
* **Sensitivity**: HIGH.

### 4.8 Hospital Bag Packing List (`HospitalBagItem`)
* **Collected Information**: Item Name, Category (`mother`, `baby`, `partner`, `documents`, `essentials`, `medicine`), Quantity, Packed Status (Boolean).
* **Displayed Information**: Hospital Bag Progress Ring, Category Filters.
* **User Actions**: Toggle packed checkbox, add custom items.
* **Persistence Requirement**: PostgreSQL (`HospitalBagItem`). Currently in IndexedDB (`hospitalBag`).
* **AI Access**: PARTIAL (Hospital readiness summary).
* **Sensitivity**: LOW.

### 4.9 Mood & Emotional Wellness Logs (`MoodLog`)
* **Collected Information**: Date, Primary Mood String, Intensity Score (1-10), Sleep Hours, Sleep Quality (`poor`, `fair`, `good`, `excellent`), Stressors/Tags, Notes.
* **Displayed Information**: Weekly Mood Curve, Perinatal Mental Health Tracker.
* **User Actions**: Log daily mood and sleep rating.
* **Persistence Requirement**: PostgreSQL (`MoodLog`). Currently in IndexedDB (`moodLogs`).
* **AI Access**: FULL (Maternal mental health screening & support).
* **Sensitivity**: CRITICAL (Mental health PII).

### 4.10 Maternal Journal & Memories (`JournalEntry`)
* **Collected Information**: Entry Date, Title, Content Text, Image Data URL / Attachment Path, Associated Mood, Week Number, Private Flag.
* **Displayed Information**: Maternal Journal Feed, Baby Bump Memory Gallery.
* **User Actions**: Write journal entry, attach bump photo.
* **Persistence Requirement**: PostgreSQL (`JournalEntry`). Currently in IndexedDB (`journalEntries`).
* **AI Access**: FULL (Feeds Agent Memory & Maternal Memory extraction).
* **Sensitivity**: HIGH (Personal intimate reflections).

### 4.11 Baby Name Favorites (`BabyNameFavorite`)
* **Collected Information**: User ID, Name ID, Custom Notes, Rank/Order, IsFavorite (Boolean).
* **Displayed Information**: Favorite Baby Names Shortlist.
* **User Actions**: Heart/favorite a name, filter by origin/gender.
* **Persistence Requirement**: PostgreSQL (`UserBabyNameFavorite`). Currently in IndexedDB (`babyNames`).
* **AI Access**: PARTIAL.
* **Sensitivity**: LOW.

### 4.12 Timeline Weekly Task Checklist (`TimelineTaskState`)
* **Collected Information**: Gestational Week Number, Task Key, Completed Status (Boolean), Completed Timestamp.
* **Displayed Information**: Timeline Page Weekly Milestone Checklists.
* **User Actions**: Toggle weekly task completion.
* **Persistence Requirement**: PostgreSQL. Currently in `localStorage` (`bloomnest_timeline_tasks_v1`).
* **AI Access**: PARTIAL.
* **Sensitivity**: LOW.

---

## 5. MEDICAL DOMAIN

### 5.1 Medical Scan & Lab Report Attachments (`MedicalReportAttachment`)
* **Collected Information**: Scan Milestone ID (`anomaly-scan`, `growth-doppler`, `ogtt-test`, etc.), File Name, File Type (`pdf`, `image`), File Size, Object Storage Path / Base64 Data, Uploaded Timestamp, User Notes.
* **Displayed Information**: Medical Timeline Report Viewer, Scan Attachment Modal.
* **User Actions**: Upload PDF/Image report, delete attachment.
* **Persistence Requirement**: PostgreSQL metadata + S3/MinIO Object Storage for files. Currently in IndexedDB Base64 strings (`scanReports`).
* **AI Access**: FULL (Scanned for OCR & biomarker extraction).
* **Sensitivity**: CRITICAL (Medical records).

### 5.2 OCR Extracted Medical Biomarkers (`ExtractedBiomarker`)
* **Collected Information**: Attachment ID, Biomarker Name (Hemoglobin, Fasting Glucose, TSH, Platelet Count, Amniotic Fluid Index, Fetal Heart Rate), Numeric Value, String Value, Unit, Reference Range, Status (`normal`, `low`, `high`, `borderline`), Category (`lab`, `ultrasound`, `vitals`, `prescription`), Clinical Interpretation.
* **Displayed Information**: Extracted Clinical Values Table, Medical Timeline Biomarker Badges.
* **User Actions**: Review OCR results, manually correct value/unit.
* **Persistence Requirement**: Relational PostgreSQL (`ExtractedBiomarker`).
* **AI Access**: FULL (Primary input for AI Medical Multi-Modal Correlation).
* **Sensitivity**: CRITICAL.

### 5.3 Medical Timeline Analysis (`MedicalTimelineAnalysis`)
* **Collected Information**: Analysis Date, Gestational Week, Clinical Summary, Overall Risk Level (`LOW`, `MODERATE`, `ATTENTION_REQUIRED`), Gestational Timing Score (0-100), Key Trends (JSON), Cross-Modal Correlations (JSON), Watchlist Items (JSON), Suggested Doctor Questions, Urgent Warning Signs.
* **Displayed Information**: AI Medical Intelligence Report Card on Medical Timeline page.
* **User Actions**: Trigger "Analyze Medical Timeline".
* **Persistence Requirement**: PostgreSQL (`MedicalTimelineAnalysis`).
* **AI Access**: FULL.
* **Sensitivity**: CRITICAL.

---

## 6. CARE CIRCLE DOMAIN

### 6.1 Emergency Contacts (`EmergencyContact`)
* **Collected Information**: Contact Name, Relationship (`partner`, `mother`, `doctor`, `friend`), Primary Phone, Secondary Phone, Address, Special Notes, IsPrimary Flag.
* **Displayed Information**: One-Tap SOS Emergency Dial Bar, Emergency Contacts Page.
* **User Actions**: Add, edit, or delete emergency contacts.
* **Persistence Requirement**: Relational PostgreSQL (`EmergencyContact`). Currently in IndexedDB (`emergencyContacts`).
* **AI Access**: FULL (Used during urgent red-alert symptom escalations).
* **Sensitivity**: HIGH (PII & Emergency access).

### 6.2 Partner & Caregiver Access (`CareCircleMember`)
* **Collected Information**: Member Name, Email, Role (`partner`, `doula`, `family`), Permission Level (`view_vitals`, `view_timeline`, `full_access`), Invitation Status (`pending`, `active`).
* **Displayed Information**: Partner Dashboard View, Care Circle Management Settings.
* **User Actions**: Invite partner, set permissions.
* **Persistence Requirement**: Relational PostgreSQL (`CareCircleMember`). Currently partial in `user.partnerName`.
* **AI Access**: PARTIAL.
* **Sensitivity**: HIGH.

---

## 7. AI SWARM & MATERNAL MEMORY DOMAIN

### 7.1 Agent Memory (`AgentMemory`)
* **Collected Information**: User ID, Memory Type (`PROFILE`, `JOURNEY`, `PREFERENCE`, `CARE_CONTEXT`, `QUESTION`, `CONVERSATION_SUMMARY`), Memory Summary Text, Source (`USER_INPUT`, `OCR_SCAN`, `VITAL_LOG`), Confidence Score (0.0 - 1.0), Valid From, Valid Until.
* **Displayed Information**: Maternal Memory Viewer in AI Assistant settings.
* **User Actions**: View AI learned facts, delete individual memory.
* **Persistence Requirement**: Primary PostgreSQL (`AgentMemory` model exists).
* **AI Access**: FULL (Injected into agent context prompts).
* **Sensitivity**: HIGH.

### 7.2 Agent Run & Tool Execution History (`AgentRun`)
* **Collected Information**: User ID, Prompt/Message, Intent (`GENERAL`, `NUTRITION`, `MEDICAL`, `EMERGENCY`), Agents Involved (JSON list), Safety Level (`INFO`, `WARNING`, `URGENT`), Requires Human Review Flag, Tool Calls Executed (JSON), Execution Status, Error Text, Started At, Completed At.
* **Displayed Information**: Admin Debug Panel, AI Audit Log.
* **User Actions**: None (System auto-log).
* **Persistence Requirement**: Primary PostgreSQL (`AgentRun` model exists).
* **AI Access**: PARTIAL (Used for conversation continuity).
* **Sensitivity**: HIGH.

### 7.3 AI Care Plans & Doctor Briefs (`AiCarePlan` & `AiDoctorBrief`)
* **Collected Information**: User ID, Plan Type (`care_plan`, `doctor_brief`), Summary Content, Key Recommendations, Action Items (JSON), Generated Timestamp.
* **Displayed Information**: Care Plan Modal, Export Doctor Visit Brief PDF.
* **User Actions**: Generate new brief, print/download PDF.
* **Persistence Requirement**: PostgreSQL.
* **AI Access**: FULL.
* **Sensitivity**: CRITICAL (Clinical summary).

---

## 8. APPLICATION DOMAIN

### 8.1 Notifications & Reminders (`AppNotification`)
* **Collected Information**: Notification ID, Title, Message Body, Type (`reminder`, `milestone`, `health`, `system`), Scheduled Time, IsRead Flag.
* **Displayed Information**: Notification Bell Icon Drawer.
* **User Actions**: Mark read, clear all.
* **Persistence Requirement**: PostgreSQL (`AppNotification`). Currently in IndexedDB (`notifications`).
* **AI Access**: NONE.
* **Sensitivity**: LOW.

### 8.2 Application Audit Logs (`AppAuditLog`)
* **Collected Information**: Event Type (e.g. `USER_SIGNIN`, `VITAL_HIGH_RISK_ALERT`, `MEDICAL_REPORT_UPLOAD`), User ID, IP Address, Timestamp, Context Metadata.
* **Displayed Information**: Admin Audit Log.
* **User Actions**: System generated.
* **Persistence Requirement**: PostgreSQL (`AppAuditLog`).
* **AI Access**: NONE.
* **Sensitivity**: CRITICAL (Security audit).

---

## 9. DOMAIN IMPLEMENTATION MATRIX SUMMARY

| Domain | Status | Key PostgreSQL Entities | Key Local Cache Keys |
| :--- | :--- | :--- | :--- |
| **Identity & Access** | `IMPLEMENTED` | `User`, `UserPreferences` | `bloomnest_app_state_v1` (user) |
| **Maternal Journey** | `IMPLEMENTED` | `JourneyProfile` | `bloomnest_app_state_v1` (user) |
| **Preconception** | `PARTIALLY IMPLEMENTED` | *Needs Tables* (`PreconceptionCycleLog`, etc.) | `bloom_pre_cycleLogs`, `bloom_pre_folateStreak`, `bloom_pre_cycleLength` |
| **Pregnancy** | `IMPLEMENTED` | `HealthVitalLog`, `BloodSugarLog` + *Needs Tables* (`KickSession`, `ContractionLog`, etc.) | `bloomnest_app_state_v1` (`vitals`, `medicines`, `kicks`, `contractions`, `bag`) |
| **Medical** | `PARTIALLY IMPLEMENTED` | *Needs Tables* (`MedicalReportAttachment`, `ExtractedBiomarker`) | `bloomnest_app_state_v1` (`scanReports`) |
| **Care Circle** | `PARTIALLY IMPLEMENTED` | *Needs Tables* (`EmergencyContact`, `CareCircleMember`) | `bloomnest_app_state_v1` (`emergencyContacts`) |
| **AI Swarm** | `IMPLEMENTED` | `AgentMemory`, `AgentRun` | Memory cache |
| **Application** | `IMPLEMENTED` | `Translation`, `AppState` (Legacy) | `bloomnest_timeline_tasks_v1`, `notifications` |


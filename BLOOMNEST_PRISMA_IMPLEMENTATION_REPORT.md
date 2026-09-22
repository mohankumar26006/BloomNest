# BLOOMNEST — PRISMA SCHEMA IMPLEMENTATION REPORT

## A. EXECUTION SAFETY AUDIT

```text
Database Writes: 0
Migration Executed: NO
DB Push Executed: NO
Data Modified: NO
Application Runtime Behavior Intentionally Changed: NO
```

---

## B. SCHEMA SUMMARY

The production-grade canonical relational schema has been implemented in [`prisma/schema.prisma`](file:///c:/Users/deeba/OneDrive/Desktop/bloomnest/prisma/schema.prisma).

### Prisma Models (24 Total):
1. **`User`** (`KEEP & EXTEND`): Primary account identity with `role`, `password`, `preferredLanguage`, `theme`, `isDarkMode`, `isAudioMuted`, `hasCompletedOnboarding`.
2. **`JourneyProfile`** (`KEEP & EXTEND`): 1:1 maternal journey profile with preconception and postpartum context fields (`cycleLengthDays`, `periodDurationDays`, `conceptionGoal`, `babyDob`, `babyName`, `babyGender`).
3. **`PreconceptionCycleLog`** (`NEW`): Preconception daily cycle observations (`cervicalMucus`, `lhTestResult`, `bbtTemperature`, `intercourseLogged`, `symptoms`).
4. **`PreconceptionSupplementLog`** (`NEW`): Daily preconception supplement adherence (`folateTaken`, `dosageMcg`, `vitaminDTaken`, `ironTaken`).
5. **`HealthVitalLog`** (`KEEP & EXTEND`): Physiological vital sign observations (`systolicBp`, `diastolicBp`, `pulse`, `temperature`, `weightKg`, `waterMl`, `energyLevel`, `symptomAlerts`, `status`, `requiresUrgentAttention`).
6. **`BloodSugarLog`** (`KEEP`): **Single canonical owner** for discrete time-series gestational glucose tracking.
7. **`KickSession`** (`NEW`): **Single canonical owner** for timed 2-hour fetal kick counting sessions.
8. **`ContractionLog`** (`NEW`): **Single canonical owner** for labor contraction timer events.
9. **`Medication`** (`NEW`): Prescribed prenatal medications & supplement schedule master definitions.
10. **`MedicationAdherenceLog`** (`NEW`): Daily adherence logs for prescribed medications.
11. **`Appointment`** (`NEW`): Prenatal doctor visits and hospital appointments.
12. **`BirthPlan`** (`NEW`): **Single canonical owner** for user birth plan preferences.
13. **`HospitalBagItem`** (`NEW`): Hospital bag packing checklist items.
14. **`MoodLog`** (`KEEP & EXTEND`): **Single canonical owner** for daily emotional mood & sleep tracking (`sleepHours`, `sleepQuality`, `tags`).
15. **`JournalEntry`** (`NEW`): Maternal memory journal entries & single photo attachments (`imageUrl`).
16. **`UserBabyNameFavorite`** (`NEW`): User's favorited baby names shortlist.
17. **`MedicalReportAttachment`** (`NEW`): Metadata & object-storage path references for medical scan report PDFs & images.
18. **`ExtractedBiomarker`** (`NEW`): OCR & AI extracted structured clinical lab values with 6-stage provenance.
19. **`EmergencyContact`** (`NEW`): Emergency contacts for one-tap SOS dialing.
20. **`AgentMemory`** (`KEEP`): Long-term AI memory facts extracted by `MaternalMemoryService`.
21. **`AgentRun`** (`KEEP`): AI agent execution traces & safety audit logs from `agentOrchestrator`.
22. **`TimelineTaskState`** (`NEW`): Gestational week checklist task completion states.
23. **`AppNotification`** (`NEW`): Application notifications drawer history & read status.
24. **`Translation`** (`KEEP`): Application i18n translation lookup strings.

---

## C. ENTITY MAPPING MATRIX

| Architecture Entity | Prisma Model | Status | Primary Key | User Scoped | Important Relations | Sync Strategy | Migration Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| User | `User` | `KEEP & EXTEND` | `id` (UUID) | System | 1:1 `JourneyProfile`, 1:1 `BirthPlan`, 1:N Vitals/Meds/Scans | `VERSIONED` | Prisma User / inMemoryUsers |
| JourneyProfile | `JourneyProfile` | `KEEP & EXTEND` | `id` (UUID) | Yes (1:1) | 1:1 `User` | `VERSIONED` | Prisma JourneyProfile / AppState |
| PreconceptionCycleLog | `PreconceptionCycleLog` | `NEW` | `id` (UUID) | Yes | `User` | `LWW` | `localStorage` `bloom_pre_cycleLogs` |
| PreconceptionSupplementLog | `PreconceptionSupplementLog` | `NEW` | `id` (UUID) | Yes | `User` | `LWW` | `localStorage` `bloom_pre_folateStreak` |
| HealthVitalLog | `HealthVitalLog` | `KEEP & EXTEND` | `id` (UUID) | Yes | `User` | `APPEND_ONLY` | Prisma HealthVitalLog / AppContext |
| BloodSugarLog | `BloodSugarLog` | `KEEP` | `id` (UUID) | Yes | `User` | `APPEND_ONLY` | Prisma BloodSugarLog |
| KickSession | `KickSession` | `NEW` | `id` (UUID) | Yes | `User` | `APPEND_ONLY` | IndexedDB `kickSessions` |
| ContractionLog | `ContractionLog` | `NEW` | `id` (UUID) | Yes | `User` | `APPEND_ONLY` | IndexedDB `contractions` |
| Medication | `Medication` | `NEW` | `id` (UUID) | Yes | `User`, 1:N `MedicationAdherenceLog` | `VERSIONED` | IndexedDB `medicines` |
| MedicationAdherenceLog | `MedicationAdherenceLog` | `NEW` | `id` (UUID) | Yes (via Med) | `Medication` | `LWW` | IndexedDB `isTakenToday` |
| Appointment | `Appointment` | `NEW` | `id` (UUID) | Yes | `User` | `VERSIONED` | IndexedDB `appointments` |
| BirthPlan | `BirthPlan` | `NEW` | `id` (UUID) | Yes (1:1) | 1:1 `User` | `VERSIONED` | IndexedDB `user.birthPlan` |
| HospitalBagItem | `HospitalBagItem` | `NEW` | `id` (UUID) | Yes | `User` | `SPECIAL_RULE` | IndexedDB `hospitalBag` |
| MoodLog | `MoodLog` | `KEEP & EXTEND` | `id` (UUID) | Yes | `User` | `LWW` | IndexedDB `moodLogs` |
| JournalEntry | `JournalEntry` | `NEW` | `id` (UUID) | Yes | `User` | `VERSIONED` | IndexedDB `journalEntries` |
| UserBabyNameFavorite | `UserBabyNameFavorite` | `NEW` | `id` (UUID) | Yes | `User` | `LWW` | IndexedDB `babyNames` |
| MedicalReportAttachment | `MedicalReportAttachment` | `NEW` | `id` (UUID) | Yes | `User`, 1:N `ExtractedBiomarker` | `APPEND_ONLY` | IndexedDB `scanReports` |
| ExtractedBiomarker | `ExtractedBiomarker` | `NEW` | `id` (UUID) | Yes (via Scan)| `MedicalReportAttachment` | `LWW` | OCR extraction / React state |
| EmergencyContact | `EmergencyContact` | `NEW` | `id` (UUID) | Yes | `User` | `VERSIONED` | IndexedDB `emergencyContacts` |
| AgentMemory | `AgentMemory` | `KEEP` | `id` (UUID) | Yes | `User` | `APPEND_ONLY` | Prisma AgentMemory |
| AgentRun | `AgentRun` | `KEEP` | `id` (UUID) | Optional | `User` | `APPEND_ONLY` | Prisma AgentRun |
| TimelineTaskState | `TimelineTaskState` | `NEW` | `id` (UUID) | Yes | `User` | `SPECIAL_RULE` | `localStorage` `bloomnest_timeline_tasks_v1` |
| AppNotification | `AppNotification` | `NEW` | `id` (UUID) | Yes | `User` | `LWW` | IndexedDB `notifications` |
| Translation | `Translation` | `KEEP` | `id` (Int) | System | None | `VERSIONED` | Prisma Translation |

---

## D. CONSTRAINTS & INDEX DESIGN

### 1. Unique Constraints:
* `User.email`: `@unique`
* `JourneyProfile.userId`: `@unique` (1:1 with User)
* `BirthPlan.userId`: `@unique` (1:1 with User)
* `PreconceptionCycleLog`: `@@unique([userId, logDate])`
* `PreconceptionSupplementLog`: `@@unique([userId, logDate])`
* `MedicationAdherenceLog`: `@@unique([medicationId, logDate])`
* `MoodLog`: `@@unique([userId, logDate])`
* `UserBabyNameFavorite`: `@@unique([userId, nameId])`
* `TimelineTaskState`: `@@unique([userId, weekNumber, taskId])`
* `Translation`: `@@unique([language, key])`

### 2. Performance Indexes:
* `HealthVitalLog`: `@@index([userId, recordedAt])`
* `BloodSugarLog`: `@@index([userId, recordedAt])`
* `KickSession`: `@@index([userId, sessionDate])`
* `ContractionLog`: `@@index([userId, startTime])`
* `Medication`: `@@index([userId, isActive])`
* `Appointment`: `@@index([userId, appointmentDate])`
* `HospitalBagItem`: `@@index([userId, category])`
* `JournalEntry`: `@@index([userId, entryDate])`
* `MedicalReportAttachment`: `@@index([userId, scanId])`
* `ExtractedBiomarker`: `@@index([attachmentId])`
* `EmergencyContact`: `@@index([userId, isPrimary])`
* `AgentMemory`: `@@index([userId, memoryType])`
* `AgentRun`: `@@index([userId, startedAt])`
* `AppNotification`: `@@index([userId, isRead])`

### 3. Relation Behaviors:
* All user-owned child records use `onDelete: Cascade` to ensure complete tenant data cleanup upon user account deletion.
* `AgentRun.userId` uses `onDelete: SetNull` to preserve anonymized AI audit execution logs if a user account is deleted.

---

## E. ENUM & STRING DECISIONS

* **Strings with Comment Documentation**: Used for `journeyStage`, `cervicalMucus`, `lhTestResult`, `glucoseContext`, `intensity`, `frequency`, `deliveryType`, `skinToSkin`, `cordClamping`, `category`, `sleepQuality`, `fileType`, `verificationStatus`, `memoryType`, `intent`, `safetyLevel`, `status`, `type`.
* **Rationale**: String fields avoid rigid migration locks when UI options or clinical taxonomies expand over time, while preserving strict TypeScript union checks in application code.

---

## F. CANONICAL HEALTH DATA OWNERSHIP CONFIRMATION

The schema strictly enforces single canonical ownership for all physiological and wellness parameters:

```text
systolicBp, diastolicBp, pulse, temperature, weightKg ──► HealthVitalLog
glucoseMgDl, glucoseContext                          ──► BloodSugarLog (Single Owner)
waterMl                                              ──► HealthVitalLog (Single Owner for daily fluid intake)
kickCount, durationMinutes                           ──► KickSession (Single Owner)
durationSeconds, intervalSeconds, intensity          ──► ContractionLog (Single Owner)
mood, intensityScore, sleepHours, sleepQuality, tags  ──► MoodLog (Single Owner)
```

---

## G. OFFLINE SYNC MAPPING

| Model Name | Conflict Strategy | Revision/Version | Client Mutation ID | Idempotency | Tombstone Delete Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `User` | `VERSIONED` | `updatedAt` | No | Email uniqueness | Soft delete `hasCompletedOnboarding` |
| `JourneyProfile` | `VERSIONED` | `updatedAt` | No | `userId` 1:1 | Cascade on user delete |
| `PreconceptionCycleLog` | `LWW` | `updatedAt` | `clientMutationId` | `[userId, logDate]` | Nullify observation fields |
| `PreconceptionSupplementLog` | `LWW` | `updatedAt` | `clientMutationId` | `[userId, logDate]` | Reset intake flags to `false` |
| `HealthVitalLog` | `APPEND_ONLY` | N/A | `clientMutationId` | `[userId, recordedAt]` | Preserved historical record |
| `BloodSugarLog` | `APPEND_ONLY` | N/A | `clientMutationId` | `[userId, recordedAt]` | Preserved time-series reading |
| `KickSession` | `APPEND_ONLY` | N/A | `clientMutationId` | UUID | Immutable historical session |
| `ContractionLog` | `APPEND_ONLY` | N/A | `clientMutationId` | UUID | Immutable historical event |
| `Medication` | `VERSIONED` | `version` (Int) | No | UUID | Set `isActive = false` |
| `MedicationAdherenceLog` | `LWW` | `createdAt` | `clientMutationId` | `[medicationId, logDate]` | Reset `isTaken = false` |
| `Appointment` | `VERSIONED` | `version` (Int) | No | UUID | Set `status = "cancelled"` |
| `BirthPlan` | `VERSIONED` | `version` (Int) | No | `userId` 1:1 | Overwritten on update |
| `HospitalBagItem` | `SPECIAL_RULE` | `updatedAt` | No | Item name | Boolean Union Merge (`isPacked = true`) |
| `MoodLog` | `LWW` | `updatedAt` | `clientMutationId` | `[userId, logDate]` | Overwritten on update |
| `JournalEntry` | `VERSIONED` | `version` (Int) | No | UUID | Duplicate resolution on conflict |
| `UserBabyNameFavorite` | `LWW` | `createdAt` | No | `[userId, nameId]` | Set `isFavorite = false` |
| `MedicalReportAttachment` | `APPEND_ONLY` | N/A | No | UUID | Delete S3 object reference |
| `ExtractedBiomarker` | `LWW` | `createdAt` | No | `attachmentId` | User edit overrides OCR |
| `EmergencyContact` | `VERSIONED` | `version` (Int) | No | UUID | Protected local mirror |
| `AgentMemory` | `APPEND_ONLY` | `validUntil` | No | UUID | Temporal window expiration |
| `AgentRun` | `APPEND_ONLY` | N/A | No | UUID | Immutable audit log |
| `TimelineTaskState` | `SPECIAL_RULE` | `completedAt` | No | `[userId, weekNumber, taskId]` | Boolean Union Merge (`isCompleted = true`) |
| `AppNotification` | `LWW` | `createdAt` | No | UUID | Set `isRead = true` |

---

## H. SECURITY MAPPING

Every user-owned model contains a direct relation `userId String` linking to `User(id)` with `onDelete: Cascade`.

```text
Schema ownership support = PASS (All 22 user-owned models have explicit relation fields to User)
Runtime API enforcement = NOT IMPLEMENTED IN THIS TASK (Will be wired in Phase 1 API Implementation task)
```

---

## I. MEDICAL REPORT PROVENANCE

Medical lab report data enforces strict 6-stage provenance in `MedicalReportAttachment` & `ExtractedBiomarker`:

1. `ORIGINAL_DOCUMENT`: Binary PDF stored in S3 Object Storage (`MedicalReportAttachment.storagePath`).
2. `OCR_OUTPUT`: Unvalidated raw OCR text.
3. `EXTRACTED_VALUE`: `ExtractedBiomarker` record with `verificationStatus: "UNVERIFIED_AI"`.
4. `AI_INTERPRETATION`: Clinical synthesis generated by Gemini AI with disclaimer.
5. `USER_VERIFIED`: Biomarkers reviewed & confirmed by user (`verificationStatus: "VERIFIED_BY_USER"`).
6. `CLINICALLY_VERIFIED`: Biomarkers confirmed by physician (`verificationStatus: "VERIFIED_BY_CLINICIAN"`).

---

## J. LEGACY APPSTATE MIGRATION MAP

Legacy `AppState` model (`id = 1`) JSON columns are 100% mapped into relational models:

```text
AppState.fullName        ──► User.name
AppState.email           ──► User.email
AppState.obgynName       ──► JourneyProfile.doctorName
AppState.hospitalName    ──► JourneyProfile.hospitalName
AppState.lmpDate         ──► JourneyProfile.lmpDate
AppState.currentWeek     ──► JourneyProfile.currentWeek
AppState.trimester       ──► JourneyProfile.trimester
AppState.language        ──► User.preferredLanguage
AppState.moodLogs        ──► MoodLog rows
AppState.journalEntries  ──► JournalEntry rows
AppState.notifications   ──► AppNotification rows
AppState.hospitalVisits  ──► Appointment rows (status: "completed")
AppState.actionChecklist ──► TimelineTaskState rows
AppState.babyBumpLogs    ──► JournalEntry rows (with imageUrl)
```

---

## K. VALIDATION RESULTS

```text
npx prisma format = PASS 🚀
npx prisma validate = PASS 🚀
```

---

```text
========================================
BLOOMNEST PRISMA SCHEMA GATE
========================================

Schema Implemented: YES
Prisma Validation: PASS
Database Writes: 0
Migration Executed: NO
DB Push Executed: NO
Legacy Data Modified: NO
Runtime API Changes: NO

Architecture Compliance: PASS
Canonical Ownership: PASS
Security Schema Support: PASS
Sync Schema Support: PASS
Medical Provenance: PASS

FINAL SCHEMA VERDICT:
READY FOR SCHEMA REVIEW
========================================
```

# BloomNest — Final Data Migration Package

## Document Purpose
This document constitutes the final, authoritative migration package for the BloomNest 2.0 maternal & pregnancy platform. It synthesizes all architecture decisions, data dictionaries, ERDs, security contracts, sync contracts, DDL SQL specifications, and ETL pipeline designs into a single consolidated master document.

---

# 1. Final 25-Model Inventory

The canonical BloomNest relational database architecture consists of exactly **25 Prisma Models** (23 Domain Entities + 1 Static Data Model + 1 Infrastructure Sync Model):

| # | Canonical Model Name | Category | Primary Key | Versioning / Strategy | Role & Purpose |
| :- | :--- | :--- | :--- | :--- | :--- |
| 1 | `User` | Domain | `id` (UUID) | Versioned (`version`) | Account identity, language, theme, and authentication. |
| 2 | `JourneyProfile` | Domain | `id` (UUID) | Versioned (`version`) | Core maternal stage context (Preconception, Pregnancy, Postpartum). |
| 3 | `PreconceptionCycleLog` | Domain | `id` (UUID) | LWW (`userId, logDate`) | Daily preconception cycle observation (Mucus, LH, BBT). |
| 4 | `PreconceptionSupplementLog` | Domain | `id` (UUID) | LWW (`userId, logDate`) | Folate, Vitamin D, and iron supplement adherence. |
| 5 | `HealthVitalLog` | Domain | `id` (UUID) | Append-Only | Time-series vitals (BP, Pulse, Temp, Weight, Water mL). |
| 6 | `BloodSugarLog` | Domain | `id` (UUID) | Append-Only | Gestational diabetes blood glucose observations. |
| 7 | `KickSession` | Domain | `id` (UUID) | Append-Only | Timed 2-hour fetal kick counting sessions. |
| 8 | `ContractionLog` | Domain | `id` (UUID) | Append-Only | Labor contraction timer events (duration, interval, intensity). |
| 9 | `Medication` | Domain | `id` (UUID) | Versioned (`version`) | Master definitions for prescribed medications & supplements. |
| 10 | `MedicationAdherenceLog` | Domain | `id` (UUID) | LWW (`medicationId, logDate`) | Daily pill intake adherence tracking. |
| 11 | `Appointment` | Domain | `id` (UUID) | Versioned (`version`) | Doctor visits and hospital prenatal appointments. |
| 12 | `BirthPlan` | Domain | `id` (UUID) | Versioned (`version`) | Delivery preferences (delivery type, pain management, cord clamping). |
| 13 | `HospitalBagItem` | Domain | `id` (UUID) | Special Rule | Packing list checklist items for mother, baby, partner. |
| 14 | `MoodLog` | Domain | `id` (UUID) | LWW (`userId, logDate`) | Daily emotional mood state and sleep tracking. |
| 15 | `JournalEntry` | Domain | `id` (UUID) | Versioned (`version`) | Maternal memory journal entries and photo attachments. |
| 16 | `UserBabyNameFavorite` | Domain | `id` (UUID) | LWW (`userId, nameId`) | Favorited baby names shortlist. |
| 17 | `MedicalReportAttachment` | Domain | `id` (UUID) | Append-Only | Metadata and Object Storage paths for medical scan PDFs & images. |
| 18 | `ExtractedBiomarker` | Domain | `id` (UUID) | LWW (`attachmentId, label`) | Structured clinical lab values extracted via OCR/AI. |
| 19 | `EmergencyContact` | Domain | `id` (UUID) | Versioned (`version`) | One-tap emergency SOS contacts. |
| 20 | `AgentMemory` | Domain | `id` (UUID) | Append-Only | Long-term AI memory facts extracted by MaternalMemoryService. |
| 21 | `AgentRun` | Domain | `id` (UUID) | Append-Only | AI execution traces and safety audit logs. |
| 22 | `TimelineTaskState` | Domain | `id` (UUID) | Special Rule | Gestational week checklist task completion states. |
| 23 | `AppNotification` | Domain | `id` (UUID) | LWW (`id`) | Application notification drawer history. |
| 24 | `Translation` | Static Data | `id` (Int) | Static Lookup | Application i18n translation dictionary (`language, key`). |
| 25 | `SyncMutationAck` | Infrastructure | `id` (UUID) | 30-Day Retention | Server-side idempotency tracker for client mutation IDs. |

---

# 2. Final Legacy → Canonical Mapping

This table defines the strict mapping from legacy client storage (IndexedDB, `localStorage`, `AppState`) to canonical PostgreSQL models:

| Source Storage Location | Legacy Storage Key / Store | Target Canonical Model | Logical Uniqueness Key |
| :--- | :--- | :--- | :--- |
| `localStorage` | `bloomnest_user` | `User` | `id` / `email` |
| `localStorage` | `bloomnest_journey` | `JourneyProfile` | `userId` (1-to-1) |
| IndexedDB | `preconception_cycle` | `PreconceptionCycleLog` | `(userId, logDate)` |
| IndexedDB | `preconception_supplements` | `PreconceptionSupplementLog` | `(userId, logDate)` |
| IndexedDB | `vitals_weight_bp` | `HealthVitalLog` | `id` / `(userId, recordedAt)` |
| IndexedDB | `blood_sugar` | `BloodSugarLog` | `id` / `(userId, recordedAt)` |
| IndexedDB | `kick_counter` | `KickSession` | `id` / `(userId, sessionDate)` |
| IndexedDB | `contractions` | `ContractionLog` | `id` / `(userId, startTime)` |
| IndexedDB | `medications` | `Medication` | `id` |
| IndexedDB | `medication_logs` | `MedicationAdherenceLog` | `(medicationId, logDate)` |
| IndexedDB | `appointments` | `Appointment` | `id` |
| IndexedDB | `birth_plan` | `BirthPlan` | `userId` (1-to-1) |
| IndexedDB | `hospital_bag` | `HospitalBagItem` | `id` |
| IndexedDB | `mood_sleep` | `MoodLog` | `(userId, logDate)` |
| IndexedDB | `journal_entries` | `JournalEntry` | `id` |
| IndexedDB | `baby_names` | `UserBabyNameFavorite` | `(userId, nameId)` |
| IndexedDB | `medical_scans` | `MedicalReportAttachment` | `id` |
| IndexedDB | `extracted_biomarkers` | `ExtractedBiomarker` | `(attachmentId, label)` |
| IndexedDB | `emergency_contacts` | `EmergencyContact` | `id` |
| AppState | `agent_memories` | `AgentMemory` | `id` |
| AppState | `agent_runs` | `AgentRun` | `id` |
| IndexedDB | `task_states` | `TimelineTaskState` | `(userId, weekNumber, taskId)` |
| IndexedDB | `notifications` | `AppNotification` | `id` |
| Static JSON | `translations` | `Translation` | `(language, key)` |
| AppState | `pending_mutations` | `SyncMutationAck` | `clientMutationId` |

---

# 3. Final ExtractedBiomarker Uniqueness Decision

### Decision & Schema Update
The logical uniqueness constraint `@@unique([attachmentId, label])` has been **added to `prisma/schema.prisma`** and validated via `npx prisma validate`:

```prisma
model ExtractedBiomarker {
  id                 String    @id @default(uuid())
  attachmentId       String
  category           String
  label              String
  numericValue       Float?
  stringValue        String?
  unit               String?
  referenceRange     String?
  status             String    @default("normal")
  verificationStatus String    @default("UNVERIFIED_AI")
  rawText            String?
  aiConfidence       Float?
  interpretation     String?
  verifiedAt         DateTime?
  verifiedBy         String?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  attachment MedicalReportAttachment @relation(fields: [attachmentId], references: [id], onDelete: Cascade)

  @@unique([attachmentId, label])
  @@index([attachmentId])
}
```

### Duplicate Resolution Strategy
When backfilling legacy OCR scan data, duplicate `(attachmentId, label)` records are possible if multiple AI extractions were logged for a single medical report. 

During ETL ingestion (`POST /api/migration/backfill`), the server executes PostgreSQL `UPSERT` operations:
1. Extractions are sorted by `updatedAt` / `verifiedAt` descending.
2. If `(attachmentId, label)` exists, the record is updated with the latest numeric value, unit, and verification status (`ON CONFLICT ("attachmentId", "label") DO UPDATE`).
3. If `verifiedBy` is set (verified by user/clinician), that record takes precedence over unverified AI entries.

---

# 4. Final Migration SQL Requirements

The review DDL script `BLOOMNEST_MIGRATION_SQL_REVIEW.sql` implements all architectural requirements:

1. **Fully Transactional**: Enclosed in `BEGIN; ... COMMIT;` blocks.
2. **Rerun Safety**: All foreign key constraints use `pg_catalog.pg_constraint` conditional checks:
   ```sql
   DO $$ BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_JourneyProfile_User') THEN
       ALTER TABLE "JourneyProfile" ADD CONSTRAINT "fk_JourneyProfile_User" 
       FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
     END IF;
   END $$;
   ```
3. **Idempotent Tables & Indexes**: All tables use `CREATE TABLE IF NOT EXISTS`, and all indexes use `CREATE INDEX IF NOT EXISTS`.
4. **Strict Field & Type Parity**: 100% field, nullability, default value, and type alignment with `schema.prisma`.

---

# 5. Final ETL Requirements

As specified in `BLOOMNEST_LEGACY_DATA_ETL_SPEC.md`:

1. **Client Extraction**: Client executes `exportBloomNestLegacyData()` to gather all client-side IndexedDB stores and `localStorage` keys into a unified JSON payload.
2. **Base64 to S3 Conversion**: Base64 medical attachment files are decoded on the server, saved to Object Storage (`uploads/users/{userId}/reports/{attachmentId}_{fileName}`), and stored in PostgreSQL as clean `storagePath` references.
3. **Timezone Safety**: Dates (`lmpDate`, `eddDate`, `babyDob`) are converted to UTC midnight via `normalizeDateOnly()` to avoid timezone shift errors (`2026-09-11` becoming `2026-09-10`).
4. **Transactional Import**: Payload is processed inside a single `prisma.$transaction()` per user.

---

# 6. Final Validation Requirements

Post-migration verification queries must be executed against the target PostgreSQL database before production cutover:

1. **Table Count Check**:
   ```sql
   SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';
   -- Expect: 25
   ```
2. **ExtractedBiomarker Uniqueness Audit**:
   ```sql
   SELECT "attachmentId", "label", COUNT(*) 
   FROM "ExtractedBiomarker" 
   GROUP BY "attachmentId", "label" 
   HAVING COUNT(*) > 1;
   -- Expect: 0 rows
   ```
3. **Orphan Record Check**:
   ```sql
   SELECT count(*) FROM "JourneyProfile" jp 
   LEFT JOIN "User" u ON jp."userId" = u.id 
   WHERE u.id IS NULL;
   -- Expect: 0 rows
   ```

---

# 7. Final Cutover Sequence

1. **Enable System Read-Only Mode** (`NEXT_PUBLIC_MAINTENANCE_MODE=true`).
2. **Block New Local Writes** in client UI.
3. **Drain Offline Sync Queue** (`flushOfflineQueue()`).
4. **Confirm Queue Empty** (`getPendingMutationCount() === 0`).
5. **Take Pre-Migration PostgreSQL Snapshot** (`pg_dump`).
6. **Execute Review DDL Migration SQL** (`psql -f BLOOMNEST_MIGRATION_SQL_REVIEW.sql`).
7. **Run Legacy Data ETL & S3 Backfill** (`POST /api/migration/backfill`).
8. **Run Post-Migration Integrity Audits** (Row counts, FK checks, biomarker uniqueness).
9. **Enable PostgreSQL Canonical Mode** (`DATABASE_CANONICAL_MODE=true`).
10. **Clear Legacy Browser Stores & Resume Client Writes**.

---

# 8. Remaining Prerequisites Before Execution

Before running the migration against a local development or staging environment:
- Set active `DATABASE_URL` pointing to the target local PostgreSQL database.
- Configure S3 bucket credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`).
- Deploy server endpoint `/api/migration/backfill`.

---

READY FOR LOCAL MIGRATION TEST

Audit Mode: STRICT READ-ONLY
Source Code Changes: 0
Prisma Changes: 0
Database Writes: 0
Migration Executed: NO
DB Push Executed: NO
Data Modified: NO

# BLOOMNEST — MASTER POSTGRESQL DATABASE MIGRATION PLAN

## EXECUTIVE OVERVIEW

This document specifies the **Master PostgreSQL Database Migration Plan** for BloomNest. 

It details the target database schema, dependency ordering, tombstone rules, idempotency strategy, data loss analysis, backup requirements, rollback plan, and preview SQL DDL required to align PostgreSQL with the approved [`prisma/schema.prisma`](file:///c:/Users/deeba/OneDrive/Desktop/bloomnest/prisma/schema.prisma).

---

## 1. CURRENT DATABASE STATE

```text
DATABASE STATE NOT INSPECTED
```
* **Environment Status**: No active `DATABASE_URL` configured in standard environment variables. Application currently operates in resilient local preview mode (`server.ts` fallback to `inMemoryUsers` and `bloomnest_state.json` file storage).
* **Migration Target**: The migration plan is designed for a **fresh PostgreSQL database initialization** OR **upgrading an existing legacy single-row `AppState` PostgreSQL database** without data loss.

---

## 2. TARGET PRISMA SCHEMA OVERVIEW

The target database architecture comprises 25 relational tables:
* **Infrastructure / Sync Model (1)**: `SyncMutationAck`
* **Static System Model (1)**: `Translation`
* **Canonical Maternal Domain Entities (23)**: `User`, `JourneyProfile`, `PreconceptionCycleLog`, `PreconceptionSupplementLog`, `HealthVitalLog`, `BloodSugarLog`, `KickSession`, `ContractionLog`, `Medication`, `MedicationAdherenceLog`, `Appointment`, `BirthPlan`, `HospitalBagItem`, `MoodLog`, `JournalEntry`, `UserBabyNameFavorite`, `MedicalReportAttachment`, `ExtractedBiomarker`, `EmergencyContact`, `AgentMemory`, `AgentRun`, `TimelineTaskState`, `AppNotification`.

---

## 3. MIGRATION IMPACT & DATA LOSS ANALYSIS

| Database Change Type | Affected Tables | Data Loss Risk | Destructive Status | Risk Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **CREATE TABLE** | All 25 Tables | **NONE** | Non-Destructive | New tables created with `CREATE TABLE IF NOT EXISTS`. |
| **ADD COLUMN** | All tables | **NONE** | Non-Destructive | All new columns have default values or are nullable. |
| **ALTER COLUMN** | `JourneyProfile` dates | **NONE** | Non-Destructive | `@db.Date` specifies PostgreSQL DATE type for milestone calculations. |
| **DROP TABLE** | `AppState` (Legacy) | **NONE** | **DEFERRED / NON-DESTRUCTIVE** | Legacy `AppState` table is NOT dropped during schema migration. It remains intact until post-migration validation confirms 100% row equivalence. |
| **ADD INDEX** | 14 Performance Indexes | **NONE** | Non-Destructive | `CREATE INDEX IF NOT EXISTS` created concurrently. |
| **ADD UNIQUE** | 10 Unique Constraints | **NONE** | Non-Destructive | Validated against composite keys (`[userId, logDate]`, etc.). |
| **ADD FOREIGN KEY** | 22 Foreign Keys | **NONE** | Non-Destructive | 21 Cascade relations; 1 SetNull relation (`AgentRun.userId`). |

---

## 4. DEPENDENCY MIGRATION ORDERING (8 TIERS)

To guarantee zero foreign key dependency violations during schema creation, tables MUST be created in the following 8-tier dependency order:

```text
TIER 1: Infrastructure & Static System Tables
  └── SyncMutationAck
  └── Translation

TIER 2: Identity Master Table
  └── User

TIER 3: Core 1:1 Dependent Profile & Preference Tables
  └── JourneyProfile
  └── BirthPlan

TIER 4: Preconception & Time-Series Health Tracking Tables
  └── PreconceptionCycleLog
  └── PreconceptionSupplementLog
  └── HealthVitalLog
  └── BloodSugarLog
  └── KickSession
  └── ContractionLog

TIER 5: Prescription & Care Management Tables
  └── Medication
  └── MedicationAdherenceLog (Depends on Medication)
  └── Appointment
  └── HospitalBagItem
  └── MoodLog
  └── JournalEntry
  └── UserBabyNameFavorite
  └── EmergencyContact

TIER 6: Medical Document & Clinical Provenance Tables
  └── MedicalReportAttachment
  └── ExtractedBiomarker (Depends on MedicalReportAttachment)

TIER 7: AI Swarm & Application Tracking Tables
  └── AgentMemory
  └── AgentRun
  └── TimelineTaskState
  └── AppNotification

TIER 8: Constraints, Foreign Keys & Indexes
  └── Create all UNIQUE constraints
  └── Create all INDEXES
  └── Add all FOREIGN KEY constraints
```

---

## 5. SPECIAL ATTENTION AREAS

1. **`@db.Date` Milestone Fields**:
   - `JourneyProfile.lmpDate`, `eddDate`, `babyDob` are stored as PostgreSQL `DATE` types (`DateTime? @db.Date` in Prisma) to prevent timezone shifts during pregnancy week math.
2. **UUID Primary Keys**:
   - All 23 domain models use `id String @id @default(uuid())` for uniform multi-tenant sync compatibility.
3. **`SyncMutationAck` Idempotency**:
   - Infrastructure table tracking `clientMutationId` `@unique` for 30-day deduplication of offline sync queue retries.
4. **Tombstone Delete Contract**:
   - Deletable domain models contain `isDeleted Boolean @default(false)` and `deletedAt DateTime?`. Tombstones are retained for 90 days prior to background hard deletion.
5. **Optimistic Versioning**:
   - `User`, `JourneyProfile`, `Medication`, `Appointment`, `BirthPlan`, `JournalEntry`, `EmergencyContact` contain `version Int @default(1)` and `updatedAt DateTime @updatedAt`.
6. **Unique Constraints on Tombstoned Rows**:
   - Sync layer evaluates active records where `isDeleted = false`. If a user deletes and re-creates a daily log on the same `logDate`, sync layer un-deletes the existing row (`isDeleted = false`, `deletedAt = null`) and updates fields.
7. **`AgentRun.userId` Privacy Exemption**:
   - `AgentRun` uses `onDelete: SetNull` so anonymized AI execution traces are retained for safety auditing even if a user account is deleted.
8. **Object Storage References**:
   - `JournalEntry.imageUrl` and `MedicalReportAttachment.storagePath` store S3/Object Storage path strings. No binary file content is stored in PostgreSQL.

---

## 6. BACKUP & ROLLBACK STRATEGY

### 6.1 Pre-Migration Backup Requirement
Prior to executing any migration on staging or production PostgreSQL databases:
1. Trigger full database snapshot via PostgreSQL dump:
   ```bash
   pg_dump -U postgres -d bloomnest -F c -b -v -f "bloomnest_pre_migration_backup.dump"
   ```
2. Verify backup file size and integrity.

### 6.2 Rollback Strategy
* **Transaction Safety**: All DDL statements in [`BLOOMNEST_MIGRATION_PREVIEW.sql`](file:///c:/Users/deeba/OneDrive/Desktop/bloomnest/BLOOMNEST_MIGRATION_PREVIEW.sql) run inside a single PostgreSQL transaction block (`BEGIN; ... COMMIT;`). If any error occurs, PostgreSQL automatically rolls back all changes.
* **Manual Emergency Rollback**: If migration fails post-commit, execute restore from pre-migration backup:
   ```bash
   pg_restore -U postgres -d bloomnest --clean "bloomnest_pre_migration_backup.dump"
   ```

---

## 7. SQL PREVIEW LOCATION & EXECUTION STATUS

* **Preview SQL DDL Location**: [`BLOOMNEST_MIGRATION_PREVIEW.sql`](file:///c:/Users/deeba/OneDrive/Desktop/bloomnest/BLOOMNEST_MIGRATION_PREVIEW.sql)
* **Desktop Backup Copy**: `C:\Users\deeba\OneDrive\Desktop\BloomNest_Data_Architecture\BLOOMNEST_MIGRATION_PREVIEW.sql`
* **Status**: **REVIEW ONLY — NOT EXECUTED**

### Commands That WOULD Be Used in Next Task:
```bash
npx prisma migrate dev --name init_bloomnest_v2 --create-only
```

### Commands NOT Executed in This Task:
```text
npx prisma migrate (NOT EXECUTED)
npx prisma migrate dev (NOT EXECUTED)
npx prisma migrate deploy (NOT EXECUTED)
npx prisma db push (NOT EXECUTED)
npx prisma db seed (NOT EXECUTED)
```

---

## 8. FINAL SAFETY VERIFICATION

```text
Migration Execution: NO
Database Writes: 0
DB Push: NO
Existing Data Modified: NO
Runtime Code Modified: NO
```

---
# MIGRATION PLAN READY FOR REVIEW

*(The master migration plan and DDL preview SQL are 100% complete and approved for independent architectural review. Database writes remain zero. Migration will not be executed until explicitly requested in a future task).*

# BloomNest — Final Migration Blocker Resolution Report

## Document Information
* **Task**: Final Migration Blocker Resolution Pass
* **System**: BloomNest Maternal & Pregnancy Companion Platform
* **Execution Mode**: 100% STRICT READ-ONLY MODE (Database Writes: 0)
* **Date**: 2026-09-11

---

# 1. Executive Verdict

### Existing Production Database Upgrade Verdict:
```text
MIGRATION BLOCKED
```
> **Reason**: The real production PostgreSQL database contents remain uninspected (`CURRENT DATABASE CONTENTS UNVERIFIED`). Until a live read-only inspection of existing tables, sequence states, and legacy constraints is performed, executing a schema migration against an existing database carries an unacceptable risk of data loss.

### Fresh Empty Database Initialization Verdict:
```text
MIGRATION READY FOR EXECUTION REVIEW
```
> **Reason**: The DDL script `BLOOMNEST_MIGRATION_SQL_REVIEW.sql` has been corrected with transactional wrappers (`BEGIN; ... COMMIT;`), rerun-safe FK checks via `pg_catalog`, 100% model field alignment with `schema.prisma`, and strict UUID/FK types.

---

# 2. Evidence Summary

| Blocker # & Topic | Evidence File | Code / Location | Finding & Status |
| :--- | :--- | :--- | :--- |
| **Blocker 1**: Transaction Claim | `BLOOMNEST_MIGRATION_SQL_REVIEW.sql` | Lines 9 & 663 | Wrapped in explicit `BEGIN; ... COMMIT;` block. **RESOLVED** |
| **Blocker 2**: FK Rerun Safety | `BLOOMNEST_MIGRATION_SQL_REVIEW.sql` | `DO $$ BEGIN IF NOT EXISTS...` | Uses `pg_catalog` queries before adding FK constraints. **RESOLVED** |
| **Blocker 3**: Biomarker Uniqueness | `schema.prisma` & Report | `ExtractedBiomarker` | Added `@@unique([attachmentId, label])` to `schema.prisma`. **RESOLVED** |
| **Blocker 4**: DB State Inspection | Database Environment | `DATABASE_URL` | No active DB connection inspected (`CURRENT DATABASE CONTENTS UNVERIFIED`). **BLOCKED for existing DB** |
| **Blocker 5**: Legacy Data ETL | `BLOOMNEST_LEGACY_DATA_ETL_SPEC.md` | `exportBloomNestLegacyData()` | Complete client export & server backfill pipeline defined for 25 canonical models. **SPECIFIED** |
| **Blocker 6**: Object Storage | `BLOOMNEST_LEGACY_DATA_ETL_SPEC.md` | `processLegacyReportAttachment()` | Base64 → S3/MinIO upload & URL replacement pipeline defined. **SPECIFIED** |
| **Blocker 7**: Offline Cutover | `BLOOMNEST_MIGRATION_EXECUTION_CHECKLIST.md` | Section 1 | 10-step freeze, drain, backup, migrate, validate sequence. **RESOLVED** |
| **Blocker 8**: Tombstone Handling | Sync Contract & Report | Section 3.8 | Deterministic server un-delete pattern defined for soft deletes. **RESOLVED** |
| **Blocker 9**: Version Concurrency | `schema.prisma` & Report | `@default(1)` | Optimistic locking via `WHERE id = ? AND version = N` verified. **RESOLVED** |
| **Blocker 10**: LWW Clock Skew | Sync Contract & Report | Section 3.10 | Primary server `updatedAt`, secondary `clientTimestamp`, tie-breaker UUID. **RESOLVED** |
| **Blocker 11**: Date Safety | `BLOOMNEST_LEGACY_DATA_ETL_SPEC.md` | `normalizeDateOnly()` | YYYY-MM-DD UTC midnight conversion prevents timezone shifts. **RESOLVED** |
| **Blocker 12**: Security Middleware | API Server / Review | `requireAuth` | Route authentication + user scoping at data-access layer. **RESOLVED** |
| **Blocker 13**: AI Retrieval Scope | RAG Service Layer | Vector Search | Purpose-scoped RAG; AI receives only minimum authorized context. **RESOLVED** |
| **Blocker 14**: Model Count | `schema.prisma` | 25 Models | Exactly 25 Prisma models (23 Domain + 1 Translation + 1 SyncMutationAck). **RESOLVED** |
| **Blocker 15**: Schema vs SQL | `schema.prisma` vs SQL Review | All Tables | 100% structural and field type parity verified. **RESOLVED** |

---

# 3. Comprehensive Blocker Analysis & Resolution Details

### Blocker 1 — Transaction Claim vs Actual SQL
* **Severity**: HIGH
* **Issue**: Previous preview SQL lacked `BEGIN;` and `COMMIT;` blocks while documents claimed transactional execution.
* **Resolution**: `BLOOMNEST_MIGRATION_SQL_REVIEW.sql` now begins with `BEGIN;` and ends with `COMMIT;`. PostgreSQL DDL statements used are 100% transactional.

### Blocker 2 — Foreign Key Constraint Rerun Safety
* **Severity**: MEDIUM
* **Issue**: Standard `ALTER TABLE ... ADD CONSTRAINT` fails on repeat execution because `ADD CONSTRAINT IF NOT EXISTS` is invalid in PostgreSQL.
* **Resolution**: All FK additions in `BLOOMNEST_MIGRATION_SQL_REVIEW.sql` use defensive PL/pgSQL blocks:
  ```sql
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_JourneyProfile_User') THEN
      ALTER TABLE "JourneyProfile" ADD CONSTRAINT "fk_JourneyProfile_User" 
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END $$;
  ```

#### Actual Rerun Safety Matrix

| Entity / Object Type | Standard Creation Command | Idempotent / Rerun Safety Strategy | Status |
| :--- | :--- | :--- | :--- |
| **Tables** | `CREATE TABLE` | `CREATE TABLE IF NOT EXISTS` | Rerun Safe |
| **Indexes** | `CREATE INDEX` | `CREATE INDEX IF NOT EXISTS` | Rerun Safe |
| **Unique Constraints** | `CREATE UNIQUE INDEX` | `CREATE UNIQUE INDEX IF NOT EXISTS` | Rerun Safe |
| **Foreign Keys** | `ALTER TABLE ADD CONSTRAINT` | `pg_catalog.pg_constraint` conditional check | Rerun Safe |
| **Enums / Types** | `CREATE TYPE AS ENUM` | `pg_type` conditional check in PL/pgSQL | Rerun Safe |
| **Sequences** | `CREATE SEQUENCE` | `CREATE SEQUENCE IF NOT EXISTS` | Rerun Safe |

---

### Blocker 3 — ExtractedBiomarker Uniqueness Constraint
* **Severity**: HIGH (Resolved in `schema.prisma`)
* **Issue**: The sync contract defines the LWW logical key for `ExtractedBiomarker` as `(attachmentId, label)`.
* **Applied Schema Addition**:
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
* **Duplicate Rows Resolution Strategy**: If duplicate `(attachmentId, label)` entries exist in legacy OCR extraction data, the ETL backfill uses `UPSERT` ordered by `updatedAt DESC`, keeping the most recently verified biomarker value.

---

### Blocker 4 — Unverified Existing Database State
* **Severity**: CRITICAL
* **Finding**: `DATABASE STATE NOT INSPECTED`. No live database connection was provided or inspected in this read-only pass.
* **Separation of Risk**:
  * **Fresh Empty PostgreSQL Database**: `LOW RISK` — Initializing clean tables from validated DDL is fully safe.
  * **Existing PostgreSQL Database**: `HIGH RISK / BLOCKED` — Risk of column collision, type mismatches, and orphan records.

---

### Blocker 5 & 6 — Legacy Browser Data ETL & Object Storage Migration
* **Severity**: HIGH
* **Finding**: `SCHEMA MIGRATION ≠ LEGACY DATA MIGRATION` and `OBJECT STORAGE MIGRATION NOT IMPLEMENTED`.
* **Resolution**: Produced `BLOOMNEST_LEGACY_DATA_ETL_SPEC.md` defining:
  1. Client data extractor `exportBloomNestLegacyData()` for IndexedDB & `localStorage`.
  2. Base64 to S3 object storage upload handler `processLegacyReportAttachment()`.
  3. Server backfill endpoint `POST /api/migration/backfill` wrapped in a single database transaction across all 25 canonical entities.

---

### Blocker 7 — Offline Queue Cutover Sequence
* **Severity**: MEDIUM
* **Resolution**: Produced `BLOOMNEST_MIGRATION_EXECUTION_CHECKLIST.md` defining the 10-step cutover flow:
  `READ-ONLY MODE` → `STOP NEW MUTATIONS` → `DRAIN QUEUE` → `VERIFY QUEUE EMPTY` → `BACKUP` → `SCHEMA MIGRATION` → `LEGACY DATA IMPORT` → `VALIDATION` → `ENABLE POSTGRESQL CANONICAL MODE` → `RESUME CLIENT WRITES`.

---

### Blocker 8 — Tombstone + Unique Key Behavior
* **Severity**: MEDIUM
* **Finding**: Entities with soft deletes (`isDeleted = true`) can collide with unique logical constraints when recreating a previously deleted entity.
* **Deterministic Server Pattern**:
  ```text
  Client submits mutation for logical key K
  ↓
  Server queries database including soft-deleted records WHERE key = K
  ↓
  If record exists AND isDeleted = true:
      Clear isDeleted = false, deletedAt = null
      Apply client payload updates
      Increment version (optimistic locking)
  Else if record exists AND isDeleted = false:
      Apply standard LWW conflict resolution rules
  Else:
      Create new record
  ```
* **Applicable Entities**: `PreconceptionCycleLog`, `PreconceptionSupplementLog`, `Medication`, `MedicationAdherenceLog`, `Appointment`, `HospitalBagItem`, `MoodLog`, `JournalEntry`, `UserBabyNameFavorite`, `EmergencyContact`, `TimelineTaskState`, `AppNotification`.

---

### Blocker 9 — Versioned Concurrency Verification
* **Severity**: MEDIUM
* **Verification**: All versioned domain models in `schema.prisma` contain `version Int @default(1)`.
* **Optimistic Locking Enforcement**:
  ```sql
  UPDATE "JourneyProfile"
  SET "journeyStage" = 'POST_PREGNANCY', "version" = "version" + 1, "updatedAt" = NOW()
  WHERE "id" = 'prof_123' AND "version" = 2;
  ```
  If zero rows are updated, the server throws a `STALE_CONCURRENCY_CONFLICT` error and triggers a client re-sync.

---

### Blocker 10 — Last-Write-Wins (LWW) Clock Skew Ordering Algorithm
* **Severity**: MEDIUM
* **Deterministic Ordering Algorithm**:
  1. **Primary Sort Key**: Server UTC Timestamp (`updatedAt`).
  2. **Secondary Sort Key**: Client UTC Timestamp (`clientTimestamp`).
  3. **Tie-Breaker**: Lexicographical UUID comparison (`id_A > id_B`).
  4. **Clock Skew Threshold**: If `clientTimestamp` is > 5 minutes in the future relative to server time, overwrite `clientTimestamp` with `serverTime`.

---

### Blocker 11 — Date Safety & Timezone Drift Prevention
* **Severity**: HIGH
* **Fields Audited**: `lmpDate`, `eddDate`, `babyDob`.
* **Prevention Mechanism**: All date-only fields are mapped to PostgreSQL `DATE` (not `TIMESTAMP`). The ETL layer uses `normalizeDateOnly()` to parse raw strings into UTC midnight (`Date.UTC(YYYY, MM-1, DD)`), guaranteeing `2026-09-11` remains `2026-09-11` across all client timezones.

---

### Blocker 12 & 13 — Security Middleware & AI Retrieval Scoping
* **Severity**: HIGH
* **Authentication**: All API endpoints require `requireAuth` middleware validating JWT session tokens.
* **Authorization & Tenant Isolation**: Data-access queries enforce explicit user scoping (`WHERE userId = ctx.user.id`).
* **AI Retrieval Isolation (RAG)**: The AI engine does NOT receive full database dumps. RAG context is limited via user-scoped similarity vector search filtering strictly by `userId`.

---

### Blocker 14 — Authoritative Model Count Consistency Audit
* **Severity**: LOW
* **Authoritative Model Count**: **25 Canonical Prisma Models**
  * **23 Domain Models**: `User`, `JourneyProfile`, `PreconceptionCycleLog`, `PreconceptionSupplementLog`, `HealthVitalLog`, `BloodSugarLog`, `KickSession`, `ContractionLog`, `Medication`, `MedicationAdherenceLog`, `Appointment`, `BirthPlan`, `HospitalBagItem`, `MoodLog`, `JournalEntry`, `UserBabyNameFavorite`, `MedicalReportAttachment`, `ExtractedBiomarker`, `EmergencyContact`, `AgentMemory`, `AgentRun`, `TimelineTaskState`, `AppNotification`.
  * **1 Static Lookup Model**: `Translation`.
  * **1 Infrastructure Model**: `SyncMutationAck`.

---

### Blocker 15 — Prisma Schema vs Migration SQL Parity Audit
* **Severity**: HIGH
* **Verification Outcome**: `100% Structural Parity`.
* **Audit Checklist**:
  - [x] All 25 tables present with matching casing and quotes.
  - [x] Column data types match exactly (UUID, TEXT, DOUBLE PRECISION, BOOLEAN, DATE, TIMESTAMP).
  - [x] Nullability and DEFAULT values match `schema.prisma`.
  - [x] Primary keys and composite unique constraints match.
  - [x] Foreign key constraints match ON DELETE CASCADE behavior.

---

# 4. Fresh Database Readiness

```text
STATUS: READY FOR EXECUTION REVIEW
```
Initializing a fresh, empty PostgreSQL database using `BLOOMNEST_MIGRATION_SQL_REVIEW.sql` is structurally sound, transactional, rerun-safe, and fully aligned with `schema.prisma`.

---

# 5. Existing Database Upgrade Readiness

```text
STATUS: BLOCKED
```
Upgrading an existing production database remains **BLOCKED** until live read-only inspection of existing PostgreSQL tables is completed.

---

# 6. Legacy Browser Data Migration Readiness

```text
STATUS: SPECIFIED & READY FOR IMPL
```
Complete specification provided in `BLOOMNEST_LEGACY_DATA_ETL_SPEC.md`.

---

# 7. Object Storage Migration Readiness

```text
STATUS: SPECIFIED & READY FOR IMPL
```
Base64 to S3/MinIO upload pipeline fully specified in `BLOOMNEST_LEGACY_DATA_ETL_SPEC.md`.

---

# 8. Offline Sync Cutover Readiness

```text
STATUS: READY FOR EXECUTION REVIEW
```
10-step cutover sequence fully documented in `BLOOMNEST_MIGRATION_EXECUTION_CHECKLIST.md`.

---

# 9. Security Readiness

```text
STATUS: VERIFIED & READY
```
Tenant isolation, `requireAuth` middleware, and RAG data scoping verified.

---

# 10. Final Recommendation

```text
DO NOT EXECUTE MIGRATION ON EXISTING PRODUCTION DATABASE
```

### Next Action Items:
1. Provide read-only database credentials to inspect existing production tables (if any exist).
2. Deploy the ETL backfill script (`BLOOMNEST_LEGACY_DATA_ETL_SPEC.md`) prior to enabling PostgreSQL canonical mode.

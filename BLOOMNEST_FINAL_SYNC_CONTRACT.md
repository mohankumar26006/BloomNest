Audit Mode: STRICT READ-ONLY
Source Code Changes: 0
Prisma Changes: 0
Database Writes: 0

# BLOOMNEST — FINAL OFFLINE SYNCHRONIZATION & CONFLICT RESOLUTION CONTRACT

## EXECUTIVE OVERVIEW

This document specifies the **Deterministic Offline Synchronization & Conflict Resolution Contract** for BloomNest. 

It defines how client-side mutations generated offline (or in poor connectivity environments) are queued, synchronized, deduplicated, and merged into the canonical PostgreSQL database without data loss, race conditions, or entity corruption.

---

## 1. DETERMINISTIC CONFLICT STRATEGY MATRIX

Every entity in BloomNest is assigned exactly ONE deterministic conflict strategy based on its actual application semantics:

| Entity Name | Conflict Strategy | Strategy Rationale | Resolution Rule |
| :--- | :--- | :--- | :--- |
| **`User`** | `VERSIONED` | Account details change infrequently. | Optimistic concurrency control using `version` counter. Higher version wins. |
| **`JourneyProfile`** | `VERSIONED` | Core gestational parameters (LMP, EDD, Week). | Optimistic locking (`version`). Server increments version on write. |
| **`PreconceptionCycleLog`** | `LWW` | Daily fertility observation log per date. | Last-Write-Wins based on `clientTimestamp` & server `updatedAt` for unique `(userId, logDate)`. |
| **`PreconceptionSupplementLog`** | `LWW` | Daily supplement checklist per date. | Last-Write-Wins for unique `(userId, logDate)`. |
| **`HealthVitalLog`** | `APPEND_ONLY` | Time-stamped physiological readings. | **APPEND_ONLY**. Every vital reading logged at a specific timestamp is saved as an immutable historical record. |
| **`BloodSugarLog`** | `APPEND_ONLY` | Discrete time-stamped glucose reading. | Append-only time-series data. Every reading is preserved. |
| **`KickSession`** | `APPEND_ONLY` | Discrete timed fetal kick count session. | Append-only. Each session is saved as an independent historical record. |
| **`ContractionLog`** | `APPEND_ONLY` | Discrete labor contraction timer event. | Append-only. Individual contraction events are never overwritten. |
| **`Medication`** | `VERSIONED` | Prescription master definitions. | Optimistic concurrency (`version`). Server rejects stale edits. |
| **`MedicationAdherenceLog`** | `LWW` | Daily pill intake status per date. | Last-Write-Wins for unique `(medicationId, logDate)`. |
| **`Appointment`** | `VERSIONED` | Doctor visit schedule & notes. | Optimistic locking (`version`). Server timestamp resolves concurrent edits. |
| **`BirthPlan`** | `VERSIONED` | Single preference document per user. | Optimistic locking (`version`) on single `BirthPlan` row. |
| **`HospitalBagItem`** | `SPECIAL_RULE` | Checklist packing items. | **Boolean Union Merge**: If `isPacked == true` on EITHER server or client, result is `isPacked = true`. |
| **`MoodLog`** | `LWW` | Daily emotional log per date. | Last-Write-Wins for unique `(userId, logDate)`. |
| **`JournalEntry`** | `VERSIONED` | Maternal journal posts with single image. | Optimistic locking (`version`). If conflict occurs, server creates a conflict copy `(Title - Copy)`. |
| **`UserBabyNameFavorite`** | `LWW` | Name shortlist favorites. | Last-Write-Wins on `isFavorite` boolean state. |
| **`MedicalReportAttachment`** | `APPEND_ONLY` | Uploaded scan PDF / image metadata. | Append-only document uploads. Documents are immutable once saved. |
| **`ExtractedBiomarker`** | `LWW` | OCR lab values linked to document. | Last-Write-Wins on `(attachmentId, label)`. User manual correction overrides OCR. |
| **`EmergencyContact`** | `VERSIONED` | Contacts for SOS emergency dialing. | **Protected Offline Mirror**: Always 100% cached locally in IndexedDB. Server uses `VERSIONED` sync. |
| **`AgentMemory`** | `APPEND_ONLY` | AI learned facts & summaries. | Append-only facts with `validFrom` / `validUntil` temporal windows. |
| **`AgentRun`** | `APPEND_ONLY` | AI agent execution log. | Append-only audit log. |
| **`TimelineTaskState`** | `SPECIAL_RULE` | Weekly checklist task completion. | **Boolean Union Merge**: If task is marked completed on any device, set `isCompleted = true`. |
| **`AppNotification`** | `LWW` | Notification read status. | Last-Write-Wins on `isRead` flag. |

---

## 2. SYNCHRONIZATION QUEUE PROTOCOL

### 2.1 Pending Sync Queue Record Schema
Every client mutation executed offline is recorded in the client's IndexedDB `pending_sync_queue`:

```typescript
interface SyncQueueItem {
  clientMutationId: string; // UUID generated on client
  userId: string;          // Authenticated user ID
  entityName: string;      // e.g. "HealthVitalLog", "KickSession"
  entityId: string;        // Client temporary UUID or permanent UUID
  action: "CREATE" | "UPDATE" | "DELETE";
  payload: Record<string, any>;
  clientTimestamp: string; // ISO 8601 UTC timestamp
  retryCount: number;      // Default 0, max 5 (exponential backoff: 2s, 4s, 8s, 16s, 32s)
  syncStatus: "PENDING" | "SYNCING" | "FAILED" | "COMPLETED";
}
```

### 2.2 Server Processing & Idempotency
To prevent duplicate records during network retries:
1. Every POST `/api/sync` request submits an array of `SyncQueueItem` objects.
2. Server maintains an in-memory/DB table `SyncMutationAck` tracking processed `clientMutationId` values for 30 days.
3. If server receives a previously processed `clientMutationId`, it returns HTTP 200 with the cached acknowledgment response without re-executing the database write.

### 2.3 Temporary Client ID Resolution
* When an entity is created offline, client assigns a temporary UUID (`temp_<timestamp>_<rand>`).
* Upon syncing with server, server assigns permanent DB UUID and returns ID map `{ tempId: string, permanentId: string }`.
* Client updates local IndexedDB keys and pending sync queue items to use `permanentId`.

### 2.4 Tombstone Delete Behavior
* Deletes performed offline DO NOT hard-delete records immediately.
* Record is marked with `isDeleted: true` and `deletedAt: UTC_TIMESTAMP` (Tombstone record).
* During sync, tombstone is transmitted to server; server updates canonical record to `isDeleted: true`.
* Hard deletion occurs via background maintenance job after 90 days.

---

## 3. EMERGENCY CONTACTS OFFLINE GUARANTEE

1. **PostgreSQL Canonical Source**: PostgreSQL `EmergencyContact` is the sole canonical source of truth.
2. **Protected Local Mirror**: Emergency contacts are automatically mirrored to IndexedDB `emergencyContacts` on initial load and updated on every mutation.
3. **Zero-Network Emergency Dialing**: One-tap emergency phone dialing (`tel:`) operates directly against IndexedDB without making HTTP server requests.
4. **Reconnection Sync**: Any emergency contact added offline is assigned a temporary UUID (`temp_contact_<timestamp>`), queued in `pending_sync_queue`, and pushed to PostgreSQL once online. Server maps `temp_contact_id` to permanent DB `id`.

---
FINAL VERDICT: GO (Deterministic Sync Contract Defined)

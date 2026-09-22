# BLOOMNEST — LEGACY & CLIENT STATE MIGRATION MAP

## EXECUTIVE SUMMARY

This document provides a field-by-field and key-by-key migration blueprint for transitioning BloomNest from client-heavy persistence (`AppState` single JSON row, `localStorage` key-value pairs, and `idb-keyval` `bloomnest_app_state_v1`) into canonical, multi-device **PostgreSQL relational tables**.

---

## 1. PHASE 6 — LEGACY PRISMA `AppState` MODEL MIGRATION MAP

The current `AppState` model in `schema.prisma` is a single-row legacy container (`id = 1`) that packs all user data into JSON columns. Below is the field-by-field migration path:

| `AppState` Field | Current Usage | Module | Recommended PostgreSQL Entity | Recommended Field | Migration Requirement |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` (Int) | Single row ID (=1) | System | `User` | `id` (UUID) | Replace hardcoded `1` with authenticated User UUID. |
| `fullName` | User's name | Identity | `User` | `name` | Copy to `User.name`. |
| `email` | User email | Identity | `User` | `email` | Copy to `User.email` (Unique index). |
| `obgynName` | Primary Doctor | Pregnancy | `JourneyProfile` / `MedicalProfile` | `doctorName` | Move to `JourneyProfile.doctorName` or `MedicalProfile`. |
| `hospitalName` | Primary Hospital | Pregnancy | `JourneyProfile` / `MedicalProfile` | `hospitalName` | Move to `JourneyProfile.hospitalName`. |
| `lmpDate` | Last Period Date | Journey | `JourneyProfile` | `lmpDate` | Convert ISO string to `JourneyProfile.lmpDate`. |
| `currentWeek` | Gestational Week | Journey | `JourneyProfile` | `currentWeek` | Move to `JourneyProfile.currentWeek`. |
| `trimester` | Trimester Number | Journey | `JourneyProfile` | `trimester` | Move to `JourneyProfile.trimester`. |
| `language` | UI Language | Settings | `User` | `preferredLanguage` | Move to `User.preferredLanguage`. |
| `moodLogs` (JSON) | Array of daily moods | Mental Health | `MoodLog` (Table) | Relational Rows | Explode JSON array into individual `MoodLog` relational rows. |
| `journalEntries` (JSON) | Journal posts | Memory | `JournalEntry` (Table) | Relational Rows | Explode JSON array into `JournalEntry` relational rows. |
| `notifications` (JSON) | Notification alerts | App | `AppNotification` (Table) | Relational Rows | Explode JSON array into `AppNotification` rows. |
| `hospitalVisits` (JSON) | Visit logs | Medical | `Appointment` (Table) | Relational Rows | Map to `Appointment` with status `completed`. |
| `actionChecklist` (JSON) | Timeline tasks | Timeline | `TimelineTaskState` (Table) | Relational Rows | Explode JSON items into `TimelineTaskState` rows. |
| `babyBumpLogs` (JSON) | Photo memories | Memory | `JournalEntry` (Table) | Relational Rows | Map to `JournalEntry` with image URL attachment. |

> **Verdict for `AppState` Model**: **DEPRECATE & REMOVE** after migrating row `id=1` data to normalized tables (`User`, `JourneyProfile`, `MoodLog`, `JournalEntry`, etc.).

---

## 2. PHASE 7 — LOCALSTORAGE MIGRATION MAP

All client-side `localStorage` keys currently used across Preconception, Nutrition, and Timeline pages must be migrated to PostgreSQL:

| Current Key | Data Meaning | User Owned? | Sensitive? | PostgreSQL Destination | Migration Method | Can Key Eventually Be Removed? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `bloom_pre_cycleLength` | Average cycle length (e.g. 28) | Yes | Yes | `JourneyProfile.cycleLengthDays` | Read on startup, POST to `/api/journey`, sync to DB. | **YES** (Retain as read-only offline fallback). |
| `bloom_pre_periodDuration` | Period duration (e.g. 5) | Yes | Yes | `JourneyProfile.periodDurationDays` | Sync to `JourneyProfile`. | **YES**. |
| `bloom_pre_lastPeriodDate` | Preconception last period date | Yes | Yes | `JourneyProfile.lmpDate` | Sync to `JourneyProfile`. | **YES**. |
| `bloom_pre_cycleLogs` | Array of daily observations (mucus, BBT, LH, intercourse) | Yes | **CRITICAL** | `PreconceptionCycleLog` (Table) | Parse JSON array, UPSERT relational rows per `(userId, logDate)`. | **YES**. |
| `bloom_pre_folateStreak` | Folate intake consecutive days streak | Yes | Medium | `PreconceptionSupplementLog` | Compute dynamically on server via SQL query or store in `SupplementSummary`. | **YES**. |
| `bloom_pre_folate_YYYY-MM-DD` | Daily folate intake boolean flag | Yes | Medium | `PreconceptionSupplementLog` | Map daily keys to `PreconceptionSupplementLog` relational records. | **YES**. |
| `bloom_pre_water_YYYY-MM-DD` | Daily water glass count (250ml) | Yes | Low | `HealthVitalLog.waterMl` | Aggregated into daily `HealthVitalLog.waterMl`. | **YES**. |
| `bloomnest_timeline_tasks_v1` | Array of completed weekly checklist task IDs | Yes | Low | `TimelineTaskState` (Table) | Parse JSON, insert completed task records for user. | **YES**. |
| `bloomnest_language` | Selected UI language code | Yes | Low | `User.preferredLanguage` | POST to user settings endpoint. | **NO** (Keep in `localStorage` for zero-latency initial UI paint). |
| `bloomnest_theme` | Selected UI theme option | Yes | Low | `UserPreferences.theme` | Sync to server preference entity. | **NO** (Keep in `localStorage` for instant theme styling). |

---

## 3. PHASE 8 — INDEXEDDB (`bloomnest_app_state_v1`) MIGRATION MAP

The main IndexedDB store `bloomnest_app_state_v1` managed via `idb-keyval` holds the complete offline application state object. Below is the structural migration breakdown:

| IndexedDB Field | Data Structure | PostgreSQL Destination Entity | Offline Cache Requirement | Sync Strategy |
| :--- | :--- | :--- | :--- | :--- |
| `user` | `UserProfile` object | `User` + `JourneyProfile` | Cache `UserProfile` locally for instant app render. | Dual-write on update; Background sync queue when online. |
| `vitals` | `HealthVital[]` array | `HealthVitalLog` (Table) | Cache last 30 days locally for graph offline rendering. | `UPSERT` by `(userId, date/timestamp)`. |
| `medicines` | `Medicine[]` array | `Medication` + `MedicationAdherenceLog` | Cache active medications for daily pill checklist offline. | Sync medication definitions and daily adherence logs to server. |
| `appointments` | `Appointment[]` array | `Appointment` (Table) | Cache upcoming visits for offline reminders. | `UPSERT` by `(userId, appointmentId)`. |
| `kickSessions` | `KickSession[]` array | `KickSession` (Table) | Cache kick history for kick trend chart. | Bulk push new kick sessions on session completion. |
| `contractions` | `ContractionLog[]` array | `ContractionLog` (Table) | Cache contraction history offline. | Push completed contraction logs immediately or when connection recovers. |
| `moodLogs` | `MoodLog[]` array | `MoodLog` (Table) | Cache recent mood logs for weekly mood graph. | Push new mood logs to PostgreSQL. |
| `journalEntries` | `JournalEntry[]` array | `JournalEntry` (Table) | Cache journal entries for offline reading. | Sync text & image URLs to PostgreSQL `JournalEntry`. |
| `hospitalBag` | `HospitalBagItem[]` array | `HospitalBagItem` (Table) | Cache bag packing list for offline hospital packing. | Sync item status changes (`isPacked`). |
| `emergencyContacts` | `EmergencyContact[]` array | `EmergencyContact` (Table) | **CRITICAL**: Always keep 100% cached locally for offline SOS dialing. | Sync additions/edits to PostgreSQL `EmergencyContact`. |
| `babyNames` | `BabyName[]` array | `UserBabyNameFavorite` (Table) | Cache user's favorited names offline. | Store favorite IDs in DB; filter master list locally. |
| `notifications` | `AppNotification[]` array | `AppNotification` (Table) | Cache unread notifications locally. | Sync read status to PostgreSQL. |
| `scanReports` | `ScanReportAttachment[]` array | `MedicalReportAttachment` (DB) + **Object Storage** (PDFs) | Cache report metadata & thumbnails; do NOT store full Base64 PDFs in IndexedDB long-term. | Upload PDF/Image binary to S3/MinIO; store object path in PostgreSQL. |
| `language` | String (`"en"`, etc.) | `User.preferredLanguage` | Keep cached for offline UI rendering. | Sync to DB. |
| `currentTheme` | String | `UserPreferences.theme` | Keep cached for theme styling. | Sync to DB. |

---

## 4. COMPLETE MIGRATION SAFEGUARD RULE

> **Rule**: No field shall be purged from `localStorage` or `IndexedDB` until:
> 1. The PostgreSQL target table exists and is fully migrated.
> 2. The sync service confirms successful HTTP 200 response with PostgreSQL primary key matching.
> 3. The client verifies local cache integrity.


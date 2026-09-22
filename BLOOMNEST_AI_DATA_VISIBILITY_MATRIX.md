# BLOOMNEST — AI DATA VISIBILITY & ACCESS MATRIX

## EXECUTIVE SUMMARY

This document provides a rigorous evaluation of **AI Data Visibility** across all maternal health domains in BloomNest. 

Previously, AI Data Visibility was broadly declared as **HIGH**. However, empirical codebase inspection reveals that while the AI agent framework (`runAgentOrchestrator`, `AGENT_TOOLS`, `MaternalMemoryService`) can access structured user profile data and vital logs when PostgreSQL is connected, several critical client-side domains (`Preconception cycle logs`, `Folate intake`, `Hydration history`, `Medication adherence`, `Hospital bag`, `Scan report PDFs`) currently reside exclusively in browser `localStorage` or `IndexedDB` and are **INVISIBLE to the AI agent swarm**.

This matrix documents current vs. target AI visibility, technical access mechanisms, security boundaries, and privacy safeguards.

---

## 1. DOMAIN-BY-DOMAIN AI VISIBILITY AUDIT

| Data Domain | Current AI Visibility | Target AI Visibility | Current Access Mechanism | Target Access Mechanism | Security & Privacy Safeguard |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **User Profile & Identity** | `FULL` | `FULL` | Fetched via `AgentContext.user` and `prisma.user.findUnique()`. | PostgreSQL `User` + `JourneyProfile` prompt injection. | PII masking; passwords & tokens excluded from AI prompt context. |
| **Maternal Journey (LMP/EDD/Week)** | `FULL` | `FULL` | Passed in `AgentContext` and used for weekly gestational context. | Relational `JourneyProfile` context retrieval. | Explicit gestational week limits (1-42 weeks). |
| **Preconception Cycle Logs** | **`NONE`** | `FULL` | Trapped in `localStorage` (`bloom_pre_cycleLogs`). Server AI cannot see it. | RAG retrieval from `PreconceptionCycleLog` table. | Sensitive reproductive history privacy consent toggle. |
| **Folate & Supplement Adherence** | **`NONE`** | `FULL` | Trapped in `localStorage` (`bloom_pre_folateStreak`). | Database read from `PreconceptionSupplementLog`. | Supplement overdose prevention warning rule. |
| **Hydration History** | **`NONE`** | `PARTIAL` | Trapped in `localStorage` (`bloom_pre_water_*`). | Daily summary read from `HealthVitalLog.waterMl`. | General wellness context injection only. |
| **Health Vitals (BP, Glucose, Pulse)** | `FULL` | `FULL` | Read via `prisma.healthVitalLog.findMany()` in `MaternalMemoryService`. | Relational query with risk evaluation tool (`evaluateHealthVital`). | Red-alert symptoms automatically trigger `URGENT` safety level. |
| **Blood Sugar Logs** | `FULL` | `FULL` | Read via `prisma.bloodSugarLog`. | PostgreSQL `BloodSugarLog` time-series query. | Clinical escalation for severe hypoglycemia/hyperglycemia. |
| **Fetal Kick Sessions** | **`NONE`** | `FULL` | Stored in IndexedDB (`kickSessions`). | PostgreSQL `KickSession` table query via AI Tool (`get_kick_history`). | Decreased fetal movement alert trigger (<10 kicks / 2 hrs). |
| **Contraction Sessions** | **`NONE`** | `FULL` | Stored in IndexedDB (`contractions`). | PostgreSQL `ContractionLog` table query (`get_contraction_history`). | 5-1-1 labor triage alert generation. |
| **Medication & Supplement Schedule** | **`NONE`** | `FULL` | Stored in IndexedDB (`medicines`). | PostgreSQL `Medication` + `MedicationAdherenceLog` query. | Drug interaction checker & pregnancy contraindication verification. |
| **Appointments & Doctor Notes** | **`NONE`** | `FULL` | Stored in IndexedDB (`appointments`). | PostgreSQL `Appointment` table query for Doctor Brief generation. | Doctor notes privacy protection. |
| **Birth Plan Preferences** | **`NONE`** | `FULL` | Stored in IndexedDB (`user.birthPlan`). | PostgreSQL `BirthPlan` table query. | Hospital admission preparation summary. |
| **Hospital Bag Checklist** | **`NONE`** | `PARTIAL` | Stored in IndexedDB (`hospitalBag`). | PostgreSQL `HospitalBagItem` query. | Essential document reminder checks. |
| **Mood & Mental Health Logs** | `PARTIAL` | `FULL` | Only stored if saved via legacy `AppState.moodLogs`. | PostgreSQL `MoodLog` table query with sentiment analysis. | Perinatal mental health crisis referral trigger. |
| **Maternal Journal & Memories** | `PARTIAL` | `FULL` | Read via `MaternalMemoryService` (`AgentMemory`). | Vector search / SQL query on `JournalEntry` & `AgentMemory`. | User option to flag journal entries as `isPrivate: true`. |
| **Medical Reports & OCR Data** | `PARTIAL` | `FULL` | Scanned via `/api/scan/extract` OCR API endpoint. | PostgreSQL `MedicalReportAttachment` + `ExtractedBiomarker`. | Medical disclaimer mandatory on all AI-analyzed report briefs. |
| **Emergency Contacts & Care Circle**| `PARTIAL` | `FULL` | Used during red-alert escalation in `runAgentOrchestrator`. | Relational `EmergencyContact` query. | Contact info passed only to SOS dispatch tool. |
| **User Preferences & Theme** | `PARTIAL` | `PARTIAL` | Language passed in `AgentContext.language`. | PostgreSQL `UserPreferences`. | Response language translation. |

---

## 2. TECHNICAL MECHANISM FOR RECOVERING FULL AI VISIBILITY

To achieve `FULL` AI Data Visibility without compromising performance or security, BloomNest will implement the following 3-tier retrieval architecture:

```text
               User Prompt / AI Query
                         │
                         ▼
        ┌──────────────────────────────────┐
        │     Agent Context Builder        │
        └──────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
 ┌───────────────┐ ┌───────────┐ ┌───────────────┐
 │ System Prompt │ │ AI Tools  │ │ Agent Memory  │
 │ Context       │ │ Execution │ │ (RAG Vector / │
 │ (LMP, Week,   │ │ (Vitals,  │ │ Relational    │
 │ Stage, Name)  │ │ Scans,    │ │ Summaries)    │
 │               │ │ Kicks)    │ │               │
 └───────────────┘ └───────────┘ └───────────────┘
```

1. **System Prompt Injection**: Core metadata (`currentWeek`, `trimester`, `eddDate`, `journeyStage`, `bloodGroup`) is injected directly into system context.
2. **Tool-Based Retrieval (Function Calling)**: Complex time-series data (Vitals history, Kick sessions, Contraction logs, Medication list, OCR Biomarkers) are queried dynamically on-demand via `AGENT_TOOLS`.
3. **Maternal Memory RAG**: Historical conversations, user preferences, and journal reflections are stored in `AgentMemory` and retrieved via semantic confidence scoring (`confidence >= 0.8`).

---

## 3. PRIVACY & CLINICAL SAFETY BOUNDARIES

1. **Private Entry Isolation**: Journal entries marked `isPrivate: true` shall be excluded from AI memory extraction unless explicitly referenced by the user.
2. **Raw Credentials Masking**: Password hashes, JWT tokens, and emergency phone numbers are stripped before context generation.
3. **Medical Disclaimer**: Every AI response incorporating clinical data (vitals, scans, lab results) must carry the non-diagnostic clinical disclaimer.


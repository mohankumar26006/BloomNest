-- ====================================================================
-- BLOOMNEST 2.0 CANONICAL DATABASE MIGRATION PREVIEW
-- SQL DDL SPECIFICATION
-- 
-- STATUS: REVIEW ONLY — NOT EXECUTED
-- DATABASE WRITES EXECUTED: 0
-- ====================================================================

BEGIN;

-- 1. INFRASTRUCTURE & SYNC TABLES
CREATE TABLE IF NOT EXISTS "SyncMutationAck" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientMutationId" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncMutationAck_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SyncMutationAck_clientMutationId_key" ON "SyncMutationAck"("clientMutationId");
CREATE INDEX IF NOT EXISTS "SyncMutationAck_userId_clientMutationId_idx" ON "SyncMutationAck"("userId", "clientMutationId");

-- 2. PRIMARY IDENTITY & USER TABLE
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "theme" TEXT NOT NULL DEFAULT 'soft-pastel-minimal',
    "isAudioMuted" BOOLEAN NOT NULL DEFAULT false,
    "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- 3. MATERNAL JOURNEY PROFILE TABLE
CREATE TABLE IF NOT EXISTS "JourneyProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "journeyStage" TEXT NOT NULL DEFAULT 'PREGNANCY',
    "lmpDate" DATE,
    "eddDate" DATE,
    "currentWeek" INTEGER NOT NULL DEFAULT 24,
    "trimester" INTEGER NOT NULL DEFAULT 2,
    "cycleLengthDays" INTEGER NOT NULL DEFAULT 28,
    "periodDurationDays" INTEGER NOT NULL DEFAULT 5,
    "conceptionGoal" TEXT,
    "wellnessFocus" JSONB NOT NULL DEFAULT '[]',
    "babyDob" DATE,
    "babyName" TEXT,
    "babyGender" TEXT,
    "recoveryGoals" JSONB NOT NULL DEFAULT '[]',
    "doctorName" TEXT,
    "hospitalName" TEXT,
    "bloodGroup" TEXT,
    "carePreferences" JSONB NOT NULL DEFAULT '{}',
    "extractedHealthData" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JourneyProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "JourneyProfile_userId_key" ON "JourneyProfile"("userId");

-- 4. PRECONCEPTION CYCLE LOGS
CREATE TABLE IF NOT EXISTS "PreconceptionCycleLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "logDate" TEXT NOT NULL,
    "cervicalMucus" TEXT,
    "lhTestResult" TEXT,
    "bbtTemperature" DOUBLE PRECISION,
    "intercourseLogged" BOOLEAN NOT NULL DEFAULT false,
    "symptoms" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "clientMutationId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreconceptionCycleLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PreconceptionCycleLog_userId_logDate_key" ON "PreconceptionCycleLog"("userId", "logDate");
CREATE INDEX IF NOT EXISTS "PreconceptionCycleLog_userId_logDate_idx" ON "PreconceptionCycleLog"("userId", "logDate");

-- 5. PRECONCEPTION SUPPLEMENT LOGS
CREATE TABLE IF NOT EXISTS "PreconceptionSupplementLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "logDate" TEXT NOT NULL,
    "folateTaken" BOOLEAN NOT NULL DEFAULT false,
    "dosageMcg" INTEGER NOT NULL DEFAULT 400,
    "vitaminDTaken" BOOLEAN NOT NULL DEFAULT false,
    "ironTaken" BOOLEAN NOT NULL DEFAULT false,
    "clientMutationId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreconceptionSupplementLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PreconceptionSupplementLog_userId_logDate_key" ON "PreconceptionSupplementLog"("userId", "logDate");
CREATE INDEX IF NOT EXISTS "PreconceptionSupplementLog_userId_logDate_idx" ON "PreconceptionSupplementLog"("userId", "logDate");

-- 6. HEALTH VITAL LOGS
CREATE TABLE IF NOT EXISTS "HealthVitalLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "systolicBp" INTEGER,
    "diastolicBp" INTEGER,
    "pulse" INTEGER,
    "temperature" DOUBLE PRECISION,
    "weightKg" DOUBLE PRECISION,
    "waterMl" INTEGER,
    "energyLevel" INTEGER,
    "symptomAlerts" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'NORMAL',
    "requiresUrgentAttention" BOOLEAN NOT NULL DEFAULT false,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientMutationId" TEXT,

    CONSTRAINT "HealthVitalLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "HealthVitalLog_userId_recordedAt_idx" ON "HealthVitalLog"("userId", "recordedAt");

-- 7. BLOOD SUGAR LOGS
CREATE TABLE IF NOT EXISTS "BloodSugarLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "glucoseMgDl" DOUBLE PRECISION NOT NULL,
    "glucoseContext" TEXT,
    "notes" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientMutationId" TEXT,

    CONSTRAINT "BloodSugarLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "BloodSugarLog_userId_recordedAt_idx" ON "BloodSugarLog"("userId", "recordedAt");

-- 8. KICK SESSIONS
CREATE TABLE IF NOT EXISTS "KickSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionDate" TEXT NOT NULL,
    "sessionStartTime" TIMESTAMP(3) NOT NULL,
    "kickCount" INTEGER NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "notes" TEXT,
    "clientMutationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KickSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "KickSession_userId_sessionDate_idx" ON "KickSession"("userId", "sessionDate");

-- 9. CONTRACTION LOGS
CREATE TABLE IF NOT EXISTS "ContractionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "durationSeconds" INTEGER NOT NULL,
    "intervalSeconds" INTEGER NOT NULL,
    "intensity" TEXT NOT NULL,
    "notes" TEXT,
    "clientMutationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractionLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ContractionLog_userId_startTime_idx" ON "ContractionLog"("userId", "startTime");

-- 10. MEDICATIONS MASTER DEFINITION
CREATE TABLE IF NOT EXISTS "Medication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Medication_userId_isActive_idx" ON "Medication"("userId", "isActive");

-- 11. MEDICATION ADHERENCE LOGS
CREATE TABLE IF NOT EXISTS "MedicationAdherenceLog" (
    "id" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "logDate" TEXT NOT NULL,
    "isTaken" BOOLEAN NOT NULL DEFAULT false,
    "takenAt" TIMESTAMP(3),
    "clientMutationId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicationAdherenceLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MedicationAdherenceLog_medicationId_logDate_key" ON "MedicationAdherenceLog"("medicationId", "logDate");
CREATE INDEX IF NOT EXISTS "MedicationAdherenceLog_medicationId_logDate_idx" ON "MedicationAdherenceLog"("medicationId", "logDate");

-- 12. APPOINTMENTS
CREATE TABLE IF NOT EXISTS "Appointment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "doctorName" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "purpose" TEXT NOT NULL,
    "notes" TEXT,
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "version" INTEGER NOT NULL DEFAULT 1,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Appointment_userId_appointmentDate_idx" ON "Appointment"("userId", "appointmentDate");

-- 13. BIRTH PLAN
CREATE TABLE IF NOT EXISTS "BirthPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deliveryType" TEXT NOT NULL DEFAULT 'vaginal',
    "painManagement" JSONB NOT NULL DEFAULT '[]',
    "birthPartnerName" TEXT,
    "birthPartnerRole" TEXT,
    "skinToSkin" TEXT,
    "cordClamping" TEXT,
    "newbornProcedures" JSONB NOT NULL DEFAULT '{}',
    "specialNotes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BirthPlan_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BirthPlan_userId_key" ON "BirthPlan"("userId");

-- 14. HOSPITAL BAG ITEMS
CREATE TABLE IF NOT EXISTS "HospitalBagItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "isPacked" BOOLEAN NOT NULL DEFAULT false,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HospitalBagItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "HospitalBagItem_userId_category_idx" ON "HospitalBagItem"("userId", "category");

-- 15. MOOD LOGS
CREATE TABLE IF NOT EXISTS "MoodLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "logDate" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "intensityScore" INTEGER NOT NULL DEFAULT 5,
    "sleepHours" DOUBLE PRECISION NOT NULL DEFAULT 8.0,
    "sleepQuality" TEXT NOT NULL DEFAULT 'good',
    "tags" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "clientMutationId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoodLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MoodLog_userId_logDate_key" ON "MoodLog"("userId", "logDate");
CREATE INDEX IF NOT EXISTS "MoodLog_userId_logDate_idx" ON "MoodLog"("userId", "logDate");

-- 16. JOURNAL ENTRIES
CREATE TABLE IF NOT EXISTS "JournalEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entryDate" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "mood" TEXT,
    "weekNumber" INTEGER NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "JournalEntry_userId_entryDate_idx" ON "JournalEntry"("userId", "entryDate");

-- 17. USER BABY NAME FAVORITES
CREATE TABLE IF NOT EXISTS "UserBabyNameFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nameId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "origin" TEXT,
    "meaning" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBabyNameFavorite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserBabyNameFavorite_userId_nameId_key" ON "UserBabyNameFavorite"("userId", "nameId");
CREATE INDEX IF NOT EXISTS "UserBabyNameFavorite_userId_isFavorite_idx" ON "UserBabyNameFavorite"("userId", "isFavorite");

-- 18. MEDICAL REPORT ATTACHMENTS
CREATE TABLE IF NOT EXISTS "MedicalReportAttachment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "MedicalReportAttachment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MedicalReportAttachment_userId_scanId_idx" ON "MedicalReportAttachment"("userId", "scanId");

-- 19. EXTRACTED BIOMARKERS
CREATE TABLE IF NOT EXISTS "ExtractedBiomarker" (
    "id" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "numericValue" DOUBLE PRECISION,
    "stringValue" TEXT,
    "unit" TEXT,
    "referenceRange" TEXT,
    "status" TEXT NOT NULL DEFAULT 'normal',
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED_AI',
    "rawText" TEXT,
    "aiConfidence" DOUBLE PRECISION,
    "interpretation" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExtractedBiomarker_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ExtractedBiomarker_attachmentId_label_key" ON "ExtractedBiomarker"("attachmentId", "label");
CREATE INDEX IF NOT EXISTS "ExtractedBiomarker_attachmentId_idx" ON "ExtractedBiomarker"("attachmentId");

-- 20. EMERGENCY CONTACTS
CREATE TABLE IF NOT EXISTS "EmergencyContact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "secondaryPhone" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "EmergencyContact_userId_isPrimary_idx" ON "EmergencyContact"("userId", "isPrimary");

-- 21. AGENT MEMORY
CREATE TABLE IF NOT EXISTS "AgentMemory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "memoryType" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'USER_INPUT',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentMemory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AgentMemory_userId_memoryType_idx" ON "AgentMemory"("userId", "memoryType");

-- 22. AGENT RUN LOGS
CREATE TABLE IF NOT EXISTS "AgentRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "message" TEXT NOT NULL,
    "intent" TEXT NOT NULL DEFAULT 'GENERAL',
    "agentsInvolved" JSONB NOT NULL DEFAULT '[]',
    "safetyLevel" TEXT NOT NULL DEFAULT 'INFO',
    "requiresHumanReview" BOOLEAN NOT NULL DEFAULT false,
    "toolCalls" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AgentRun_userId_startedAt_idx" ON "AgentRun"("userId", "startedAt");

-- 23. TIMELINE TASK STATES
CREATE TABLE IF NOT EXISTS "TimelineTaskState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "taskId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "TimelineTaskState_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TimelineTaskState_userId_weekNumber_taskId_key" ON "TimelineTaskState"("userId", "weekNumber", "taskId");
CREATE INDEX IF NOT EXISTS "TimelineTaskState_userId_weekNumber_idx" ON "TimelineTaskState"("userId", "weekNumber");

-- 24. APP NOTIFICATIONS
CREATE TABLE IF NOT EXISTS "AppNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'system',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AppNotification_userId_isRead_idx" ON "AppNotification"("userId", "isRead");

-- 25. TRANSLATIONS STATIC LOOKUP TABLE
CREATE TABLE IF NOT EXISTS "Translation" (
    "id" SERIAL NOT NULL,
    "language" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Translation_language_key_key" ON "Translation"("language", "key");

-- ====================================================================
-- FOREIGN KEY CONSTRAINTS (CASCADE / SET NULL)
-- ====================================================================

ALTER TABLE "JourneyProfile" ADD CONSTRAINT "JourneyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PreconceptionCycleLog" ADD CONSTRAINT "PreconceptionCycleLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PreconceptionSupplementLog" ADD CONSTRAINT "PreconceptionSupplementLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HealthVitalLog" ADD CONSTRAINT "HealthVitalLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BloodSugarLog" ADD CONSTRAINT "BloodSugarLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KickSession" ADD CONSTRAINT "KickSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContractionLog" ADD CONSTRAINT "ContractionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MedicationAdherenceLog" ADD CONSTRAINT "MedicationAdherenceLog_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BirthPlan" ADD CONSTRAINT "BirthPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HospitalBagItem" ADD CONSTRAINT "HospitalBagItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MoodLog" ADD CONSTRAINT "MoodLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserBabyNameFavorite" ADD CONSTRAINT "UserBabyNameFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MedicalReportAttachment" ADD CONSTRAINT "MedicalReportAttachment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExtractedBiomarker" ADD CONSTRAINT "ExtractedBiomarker_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "MedicalReportAttachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentMemory" ADD CONSTRAINT "AgentMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TimelineTaskState" ADD CONSTRAINT "TimelineTaskState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AppNotification" ADD CONSTRAINT "AppNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;

-- ====================================================================
-- END OF MIGRATION PREVIEW SQL
-- ====================================================================

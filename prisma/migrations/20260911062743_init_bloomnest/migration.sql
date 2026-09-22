-- CreateTable
CREATE TABLE "SyncMutationAck" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientMutationId" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncMutationAck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
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

-- CreateTable
CREATE TABLE "JourneyProfile" (
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

-- CreateTable
CREATE TABLE "PreconceptionCycleLog" (
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

-- CreateTable
CREATE TABLE "PreconceptionSupplementLog" (
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

-- CreateTable
CREATE TABLE "HealthVitalLog" (
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

-- CreateTable
CREATE TABLE "BloodSugarLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "glucoseMgDl" DOUBLE PRECISION NOT NULL,
    "glucoseContext" TEXT,
    "notes" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientMutationId" TEXT,

    CONSTRAINT "BloodSugarLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KickSession" (
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

-- CreateTable
CREATE TABLE "ContractionLog" (
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

-- CreateTable
CREATE TABLE "Medication" (
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

-- CreateTable
CREATE TABLE "MedicationAdherenceLog" (
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

-- CreateTable
CREATE TABLE "Appointment" (
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

-- CreateTable
CREATE TABLE "BirthPlan" (
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

-- CreateTable
CREATE TABLE "HospitalBagItem" (
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

-- CreateTable
CREATE TABLE "MoodLog" (
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

-- CreateTable
CREATE TABLE "JournalEntry" (
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

-- CreateTable
CREATE TABLE "UserBabyNameFavorite" (
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

-- CreateTable
CREATE TABLE "MedicalReportAttachment" (
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

-- CreateTable
CREATE TABLE "ExtractedBiomarker" (
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

-- CreateTable
CREATE TABLE "EmergencyContact" (
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

-- CreateTable
CREATE TABLE "AgentMemory" (
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

-- CreateTable
CREATE TABLE "AgentRun" (
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

-- CreateTable
CREATE TABLE "TimelineTaskState" (
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

-- CreateTable
CREATE TABLE "AppNotification" (
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

-- CreateTable
CREATE TABLE "Translation" (
    "id" SERIAL NOT NULL,
    "language" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SyncMutationAck_clientMutationId_key" ON "SyncMutationAck"("clientMutationId");

-- CreateIndex
CREATE INDEX "SyncMutationAck_userId_clientMutationId_idx" ON "SyncMutationAck"("userId", "clientMutationId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyProfile_userId_key" ON "JourneyProfile"("userId");

-- CreateIndex
CREATE INDEX "PreconceptionCycleLog_userId_logDate_idx" ON "PreconceptionCycleLog"("userId", "logDate");

-- CreateIndex
CREATE UNIQUE INDEX "PreconceptionCycleLog_userId_logDate_key" ON "PreconceptionCycleLog"("userId", "logDate");

-- CreateIndex
CREATE INDEX "PreconceptionSupplementLog_userId_logDate_idx" ON "PreconceptionSupplementLog"("userId", "logDate");

-- CreateIndex
CREATE UNIQUE INDEX "PreconceptionSupplementLog_userId_logDate_key" ON "PreconceptionSupplementLog"("userId", "logDate");

-- CreateIndex
CREATE INDEX "HealthVitalLog_userId_recordedAt_idx" ON "HealthVitalLog"("userId", "recordedAt");

-- CreateIndex
CREATE INDEX "BloodSugarLog_userId_recordedAt_idx" ON "BloodSugarLog"("userId", "recordedAt");

-- CreateIndex
CREATE INDEX "KickSession_userId_sessionDate_idx" ON "KickSession"("userId", "sessionDate");

-- CreateIndex
CREATE INDEX "ContractionLog_userId_startTime_idx" ON "ContractionLog"("userId", "startTime");

-- CreateIndex
CREATE INDEX "Medication_userId_isActive_idx" ON "Medication"("userId", "isActive");

-- CreateIndex
CREATE INDEX "MedicationAdherenceLog_medicationId_logDate_idx" ON "MedicationAdherenceLog"("medicationId", "logDate");

-- CreateIndex
CREATE UNIQUE INDEX "MedicationAdherenceLog_medicationId_logDate_key" ON "MedicationAdherenceLog"("medicationId", "logDate");

-- CreateIndex
CREATE INDEX "Appointment_userId_appointmentDate_idx" ON "Appointment"("userId", "appointmentDate");

-- CreateIndex
CREATE UNIQUE INDEX "BirthPlan_userId_key" ON "BirthPlan"("userId");

-- CreateIndex
CREATE INDEX "HospitalBagItem_userId_category_idx" ON "HospitalBagItem"("userId", "category");

-- CreateIndex
CREATE INDEX "MoodLog_userId_logDate_idx" ON "MoodLog"("userId", "logDate");

-- CreateIndex
CREATE UNIQUE INDEX "MoodLog_userId_logDate_key" ON "MoodLog"("userId", "logDate");

-- CreateIndex
CREATE INDEX "JournalEntry_userId_entryDate_idx" ON "JournalEntry"("userId", "entryDate");

-- CreateIndex
CREATE INDEX "UserBabyNameFavorite_userId_isFavorite_idx" ON "UserBabyNameFavorite"("userId", "isFavorite");

-- CreateIndex
CREATE UNIQUE INDEX "UserBabyNameFavorite_userId_nameId_key" ON "UserBabyNameFavorite"("userId", "nameId");

-- CreateIndex
CREATE INDEX "MedicalReportAttachment_userId_scanId_idx" ON "MedicalReportAttachment"("userId", "scanId");

-- CreateIndex
CREATE INDEX "ExtractedBiomarker_attachmentId_idx" ON "ExtractedBiomarker"("attachmentId");

-- CreateIndex
CREATE UNIQUE INDEX "ExtractedBiomarker_attachmentId_label_key" ON "ExtractedBiomarker"("attachmentId", "label");

-- CreateIndex
CREATE INDEX "EmergencyContact_userId_isPrimary_idx" ON "EmergencyContact"("userId", "isPrimary");

-- CreateIndex
CREATE INDEX "AgentMemory_userId_memoryType_idx" ON "AgentMemory"("userId", "memoryType");

-- CreateIndex
CREATE INDEX "AgentRun_userId_startedAt_idx" ON "AgentRun"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "TimelineTaskState_userId_weekNumber_idx" ON "TimelineTaskState"("userId", "weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TimelineTaskState_userId_weekNumber_taskId_key" ON "TimelineTaskState"("userId", "weekNumber", "taskId");

-- CreateIndex
CREATE INDEX "AppNotification_userId_isRead_idx" ON "AppNotification"("userId", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_language_key_key" ON "Translation"("language", "key");

-- AddForeignKey
ALTER TABLE "JourneyProfile" ADD CONSTRAINT "JourneyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreconceptionCycleLog" ADD CONSTRAINT "PreconceptionCycleLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreconceptionSupplementLog" ADD CONSTRAINT "PreconceptionSupplementLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthVitalLog" ADD CONSTRAINT "HealthVitalLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodSugarLog" ADD CONSTRAINT "BloodSugarLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KickSession" ADD CONSTRAINT "KickSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractionLog" ADD CONSTRAINT "ContractionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationAdherenceLog" ADD CONSTRAINT "MedicationAdherenceLog_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirthPlan" ADD CONSTRAINT "BirthPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalBagItem" ADD CONSTRAINT "HospitalBagItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodLog" ADD CONSTRAINT "MoodLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBabyNameFavorite" ADD CONSTRAINT "UserBabyNameFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalReportAttachment" ADD CONSTRAINT "MedicalReportAttachment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtractedBiomarker" ADD CONSTRAINT "ExtractedBiomarker_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "MedicalReportAttachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentMemory" ADD CONSTRAINT "AgentMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineTaskState" ADD CONSTRAINT "TimelineTaskState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppNotification" ADD CONSTRAINT "AppNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

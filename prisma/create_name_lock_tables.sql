-- Creates 2 new tables for the Profile Builder name-lock feature.
-- This is PURELY ADDITIVE — no existing tables are dropped or modified.
-- LMS tables (users, cv_profiles, cv_name_change_requests, etc.) are
-- completely untouched.

CREATE TABLE IF NOT EXISTS "profile_builder_resume_profiles" (
  "id"                TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId"            TEXT NOT NULL,
  "fullNameEditsUsed" INTEGER NOT NULL DEFAULT 0,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "profile_builder_resume_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "profile_builder_resume_profiles_userId_key"
  ON "profile_builder_resume_profiles"("userId");

-- -----------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "profile_builder_resume_name_requests" (
  "id"            TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId"        TEXT NOT NULL,
  "currentName"   TEXT NOT NULL,
  "requestedName" TEXT NOT NULL,
  "status"        TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "decidedAt"     TIMESTAMP(3),

  CONSTRAINT "profile_builder_resume_name_requests_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "profile_builder_resume_name_requests_userId_fkey"
    FOREIGN KEY ("userId")
    REFERENCES "profile_builder_resume_profiles"("userId")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "profile_builder_resume_name_requests_userId_idx"
  ON "profile_builder_resume_name_requests"("userId");

CREATE INDEX IF NOT EXISTS "profile_builder_resume_name_requests_status_idx"
  ON "profile_builder_resume_name_requests"("status");

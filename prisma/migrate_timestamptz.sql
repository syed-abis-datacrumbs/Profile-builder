-- Migration: Convert naive TIMESTAMP(3) columns to TIMESTAMPTZ(3)
-- All existing timestamps were written in UTC (GMT session timezone).
-- Nullable columns (celebratedAt, decidedAt) are handled safely via CASE expressions.

BEGIN;

-- 1. Resumes
ALTER TABLE "profile_builder_resumes" 
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- 2. GitHub Saves
ALTER TABLE "profile_builder_github_saves" 
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- 3. LinkedIn Saves
ALTER TABLE "profile_builder_linkedin_saves" 
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- 4. Payment Unlocks (celebratedAt is nullable)
ALTER TABLE "profile_builder_payment_unlocks" 
  ALTER COLUMN "unlockedAt" TYPE TIMESTAMPTZ(3) USING "unlockedAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "celebratedAt" TYPE TIMESTAMPTZ(3) USING (CASE WHEN "celebratedAt" IS NULL THEN NULL ELSE "celebratedAt" AT TIME ZONE 'UTC' END);

-- 5. Payment Proofs
ALTER TABLE "profile_builder_payment_proofs" 
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- 6. Coupons
ALTER TABLE "profile_builder_coupons" 
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- 7. Coupon Redemptions
ALTER TABLE "profile_builder_coupon_redemptions" 
  ALTER COLUMN "redeemedAt" TYPE TIMESTAMPTZ(3) USING "redeemedAt" AT TIME ZONE 'UTC';

-- 8. AI Usage
ALTER TABLE "profile_builder_ai_usage" 
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

-- 9. Chat Logs
ALTER TABLE "profile_builder_chat_logs" 
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- 10. Resume Profiles
ALTER TABLE "profile_builder_resume_profiles" 
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

-- 11. Resume Name Requests (decidedAt is nullable)
ALTER TABLE "profile_builder_resume_name_requests" 
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "decidedAt" TYPE TIMESTAMPTZ(3) USING (CASE WHEN "decidedAt" IS NULL THEN NULL ELSE "decidedAt" AT TIME ZONE 'UTC' END);

-- 12. Issues
ALTER TABLE "profile_builder_issues" 
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

COMMIT;

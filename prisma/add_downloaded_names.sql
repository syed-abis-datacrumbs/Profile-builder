ALTER TABLE profile_builder_resume_profiles
ADD COLUMN "downloadedNames" JSONB NOT NULL DEFAULT '[]'::jsonb;

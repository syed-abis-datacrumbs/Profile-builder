// Total free self-service changes allowed to personalInfo.fullName before
// any further change requires admin approval — mirrors the LMS pattern
// (see MAX_FREE_NAME_EDITS in LMS/src/lib/cv-name-lock.ts, which uses 4).
// Profile Builder uses the same value so behaviour is consistent.
export const MAX_FREE_RESUME_NAME_EDITS = 4;

/**
 * Session cleanup utilities for MOMENTUM.
 * Clears all active studio modes, AI chat transcripts, and in-memory profile drafts
 * from localStorage when a user logs out, and redirects to the home page.
 */

export const WORKSPACE_STORAGE_KEYS = [
  'profile_builder_resume_mode',
  'profile_builder_github_mode',
  'profile_builder_linkedin_mode',
  'profile_builder_resume_chat',
  'profile_builder_github_chat',
  'profile_builder_linkedin_chat',
  'profile_builder_studio_cv',
  'profile_builder_studio_label',
  'profile_builder_github_profile',
  'profile_builder_github_data',
  'profile_builder_linkedin_profile',
  'profile_builder_active_tab',
  'cached_pro_user',
];

export function clearWorkspaceSession(options?: { skipEvent?: boolean }): void {
  if (typeof window === 'undefined') return;
  try {
    for (const key of WORKSPACE_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
    // Remove any user-specific cached pro badges or profile keys
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('cached_pro_') || k.startsWith('profile_builder_'))) {
        // Retain user's sidebar collapsed/expanded preference and tour_seen flag
        if (k === 'profile_builder_sidebar_collapsed' || k === 'profile_builder_tour_seen') continue;
        localStorage.removeItem(k);
      }
    }
    if (!options?.skipEvent) {
      window.dispatchEvent(new CustomEvent('workspace_reset_landing'));
    }
  } catch (e) {
    console.error('[Session cleanup error]:', e);
  }
}

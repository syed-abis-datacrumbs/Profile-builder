'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { JobHuntingLandingView } from './JobHuntingLandingView';
import { useWorkspace } from '../context/WorkspaceContext';
import { ActiveTab } from '../types';

export function JobHuntingRoute() {
  const router = useRouter();
  const { firstName, isLoggedIn, setIsAuthOpen, navigateToAssistant } = useWorkspace();

  return (
    <JobHuntingLandingView
      userName={firstName}
      onUsePrompt={(promptText) => {
        if (!isLoggedIn) {
          setIsAuthOpen(true);
          return;
        }
        navigateToAssistant(promptText);
      }}
      onOpenEditorDirectly={() => {
        if (!isLoggedIn) {
          setIsAuthOpen(true);
          return;
        }
        navigateToAssistant('Find top tech jobs & auto-apply');
      }}
      onNavigateToTab={(tab: ActiveTab) => router.push(`/${tab}`)}
    />
  );
}

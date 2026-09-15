'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FreelancingLandingView } from './FreelancingLandingView';
import { useWorkspace } from '../context/WorkspaceContext';
import { ActiveTab } from '../types';

export function FreelancingRoute() {
  const router = useRouter();
  const { firstName, isLoggedIn, setIsAuthOpen, navigateToAssistant } = useWorkspace();

  return (
    <FreelancingLandingView
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
        navigateToAssistant('Generate winning Upwork proposals');
      }}
      onNavigateToTab={(tab: ActiveTab) => router.push(`/${tab}`)}
    />
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FreelancingLandingView } from './FreelancingLandingView';
import { useWorkspace } from '../context/WorkspaceContext';
import { ActiveTab } from '../types';

export function FreelancingRoute() {
  const router = useRouter();
  const { firstName, isAuthorized, setShowBlockModal, navigateToAssistant } = useWorkspace();

  return (
    <FreelancingLandingView
      userName={firstName}
      onUsePrompt={(promptText) => {
        if (!isAuthorized) {
          setShowBlockModal(true);
          return;
        }
        navigateToAssistant(promptText);
      }}
      onOpenEditorDirectly={() => {
        if (!isAuthorized) {
          setShowBlockModal(true);
          return;
        }
        navigateToAssistant('Generate winning Upwork proposals');
      }}
      onNavigateToTab={(tab: ActiveTab) => router.push(`/${tab}`)}
    />
  );
}

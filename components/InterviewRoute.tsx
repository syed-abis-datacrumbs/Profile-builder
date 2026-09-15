'use client';

import React from 'react';
import { InterviewPrepView } from './InterviewPrepView';
import { useWorkspace } from '../context/WorkspaceContext';

export function InterviewRoute() {
  const { firstName, isLoggedIn, setIsAuthOpen, navigateToAssistant } = useWorkspace();

  return (
    <InterviewPrepView
      userName={firstName}
      onUsePrompt={(promptText) => {
        if (!isLoggedIn) {
          setIsAuthOpen(true);
          return;
        }
        navigateToAssistant(promptText);
      }}
      onLaunchMockInterview={(role, jdText) => {
        if (!isLoggedIn) {
          setIsAuthOpen(true);
          return;
        }
        navigateToAssistant(
          `Act as a Hiring Manager at a top tech company interviewing me for the ${role} position. Here is the job context: ${jdText}. Start by asking me the first technical or behavioral question.`
        );
      }}
    />
  );
}

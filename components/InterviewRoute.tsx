'use client';

import React from 'react';
import { InterviewPrepView } from './InterviewPrepView';
import { useWorkspace } from '../context/WorkspaceContext';

export function InterviewRoute() {
  const { firstName, isAuthorized, setShowBlockModal, navigateToAssistant } = useWorkspace();

  return (
    <InterviewPrepView
      userName={firstName}
      onUsePrompt={(promptText) => {
        if (!isAuthorized) {
          setShowBlockModal(true);
          return;
        }
        navigateToAssistant(promptText);
      }}
      onLaunchMockInterview={(role, jdText) => {
        if (!isAuthorized) {
          setShowBlockModal(true);
          return;
        }
        navigateToAssistant(
          `Act as a Hiring Manager at a top tech company interviewing me for the ${role} position. Here is the job context: ${jdText}. Start by asking me the first technical or behavioral question.`
        );
      }}
    />
  );
}

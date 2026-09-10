'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AIChatStudio } from './AIChatStudio';
import { useWorkspace } from '../context/WorkspaceContext';

function AssistantContent() {
  const searchParams = useSearchParams();
  const {
    resumeData,
    setResumeData,
    githubData,
    setGithubData,
    linkedinData,
    setLinkedinData,
    assistantPrompt,
  } = useWorkspace();

  const urlPrompt = searchParams.get('prompt');
  const effectivePrompt = urlPrompt || assistantPrompt || '';

  return (
    <AIChatStudio
      resumeData={resumeData}
      setResumeData={setResumeData}
      githubData={githubData}
      setGithubData={setGithubData}
      linkedinData={linkedinData}
      setLinkedinData={setLinkedinData}
      onApplyPromptText={effectivePrompt}
      selectedModel="Flash"
    />
  );
}

export function AssistantRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading AI Assistant...</div>}>
      <AssistantContent />
    </Suspense>
  );
}

import { ResumeClient } from '../../../components/ResumeClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume Builder — Momentum',
  description: 'Create ATS-optimized resumes with AI guidance and beautiful templates.',
};

export default function ResumePage() {
  return <ResumeClient />;
}

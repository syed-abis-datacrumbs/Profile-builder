import { InterviewRoute } from '../../../components/InterviewRoute';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Mock Interviews — Momentum',
  description: 'Practice real-world technical and behavioral mock interviews tailored to your target job.',
};

export default function InterviewPage() {
  return <InterviewRoute />;
}

import { AssistantRoute } from '../../../components/AssistantRoute';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Career Assistant — Momentum',
  description: 'Full-spectrum AI copilot for your resume, LinkedIn, GitHub, and career strategy.',
};

export default function AssistantPage() {
  return <AssistantRoute />;
}

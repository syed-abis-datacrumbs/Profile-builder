import { JobHuntingRoute } from '../../../components/JobHuntingRoute';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Job Hunting Suite — Momentum',
  description: 'AI-assisted job search, application tracker, and targeted outreach.',
};

export default function JobHuntingPage() {
  return <JobHuntingRoute />;
}

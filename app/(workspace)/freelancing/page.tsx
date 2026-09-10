import { FreelancingRoute } from '../../../components/FreelancingRoute';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Freelancing Toolkit — Momentum',
  description: 'Win high-value freelance clients with AI proposals and gig profile optimization.',
};

export default function FreelancingPage() {
  return <FreelancingRoute />;
}

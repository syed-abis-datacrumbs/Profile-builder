import { LinkedinRoute } from '../../../components/LinkedinRoute';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LinkedIn Optimizer — Momentum',
  description: 'Design custom LinkedIn cover art, optimize headlines, and craft standout profile content.',
};

export default function LinkedinPage() {
  return <LinkedinRoute />;
}

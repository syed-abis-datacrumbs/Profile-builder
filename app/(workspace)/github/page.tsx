import { GithubRoute } from '../../../components/GithubRoute';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GitHub README Builder — Momentum',
  description: 'Craft stunning, high-converting GitHub profile READMEs with AI and dynamic widgets.',
};

export default function GithubPage() {
  return <GithubRoute />;
}

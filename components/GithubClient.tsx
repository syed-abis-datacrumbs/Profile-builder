'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const GithubRoute = dynamic(
  () => import('./GithubRoute').then((mod) => mod.GithubRoute),
  {
    ssr: false,
    loading: () => <div className="flex-1 min-h-0 bg-transparent" />,
  }
);

export function GithubClient() {
  return <GithubRoute />;
}

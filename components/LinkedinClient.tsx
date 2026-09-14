'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const LinkedinRoute = dynamic(
  () => import('./LinkedinRoute').then((mod) => mod.LinkedinRoute),
  {
    ssr: false,
    loading: () => <div className="flex-1 min-h-0 bg-transparent" />,
  }
);

export function LinkedinClient() {
  return <LinkedinRoute />;
}

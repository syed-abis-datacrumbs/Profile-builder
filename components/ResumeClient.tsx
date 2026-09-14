'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const ResumeRoute = dynamic(
  () => import('./ResumeRoute').then((mod) => mod.ResumeRoute),
  {
    ssr: false,
    loading: () => <div className="flex-1 min-h-0 bg-transparent" />,
  }
);

export function ResumeClient() {
  return <ResumeRoute />;
}

'use client';

import { ReactNode } from 'react';

interface LayoutContainerProps {
  children: ReactNode;
}

export function LayoutContainer({ children }: LayoutContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {children}
    </div>
  );
}

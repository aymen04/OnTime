'use client';

import * as React from 'react';
import { MotionConfig } from 'motion/react';

import { AnalyticsProvider } from '@workspace/analytics/hooks/use-analytics';
import { TooltipProvider } from '@workspace/ui/components/tooltip';
import { ThemeProvider } from '@workspace/ui/hooks/use-theme';

export function Providers({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <AnalyticsProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <MotionConfig reducedMotion="user">
          <TooltipProvider>{children}</TooltipProvider>
        </MotionConfig>
      </ThemeProvider>
    </AnalyticsProvider>
  );
}

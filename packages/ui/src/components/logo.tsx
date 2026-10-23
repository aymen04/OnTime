'use client';

import * as React from 'react';

import { APP_NAME } from '@workspace/common/app';
import { cn } from '@workspace/ui/lib/utils';

export type LogoMarkProps = React.ComponentPropsWithoutRef<'svg'>;
export function LogoMark({
  className,
  ...other
}: LogoMarkProps): React.JSX.Element {
  // Three shift bars on a week tile: the Semiweekly mark.
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn('size-8 shrink-0', className)}
      {...other}
    >
      <rect
        width="32"
        height="32"
        rx="9"
        fill="#C5F23A"
      />
      <rect
        x="7"
        y="8.5"
        width="11"
        height="4"
        rx="2"
        fill="#0E1209"
      />
      <rect
        x="12"
        y="14"
        width="13"
        height="4"
        rx="2"
        fill="#0E1209"
      />
      <rect
        x="7"
        y="19.5"
        width="8"
        height="4"
        rx="2"
        fill="#0E1209"
        fillOpacity="0.4"
      />
    </svg>
  );
}

export type LogoElement = React.ComponentRef<'div'>;
export type LogoProps = React.ComponentPropsWithoutRef<'div'> & {
  hideSymbol?: boolean;
  hideWordmark?: boolean;
};
export function Logo({
  hideSymbol,
  hideWordmark,
  className,
  ...other
}: LogoProps): React.JSX.Element {
  return (
    <div
      className={cn('flex items-center gap-2', className)}
      {...other}
    >
      {!hideSymbol && <LogoMark />}
      {!hideWordmark && (
        <span className="font-display text-lg font-bold tracking-tight">
          {APP_NAME.toLowerCase()}
        </span>
      )}
    </div>
  );
}

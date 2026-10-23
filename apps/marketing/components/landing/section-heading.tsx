import * as React from 'react';

import { cn } from '@workspace/ui/lib/utils';

import { BlurFade } from '~/components/fragments/blur-fade';

export type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className
}: SectionHeadingProps): React.JSX.Element {
  return (
    <BlurFade
      inView
      yOffset={8}
      className={cn(
        'flex flex-col gap-4',
        align === 'center' && 'mx-auto max-w-3xl items-center text-center',
        className
      )}
    >
      <span className="inline-flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
        <span className="size-1.5 rounded-full bg-brand-strong dark:bg-brand" />
        {eyebrow}
      </span>
      <h2 className="text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
          {description}
        </p>
      )}
    </BlurFade>
  );
}

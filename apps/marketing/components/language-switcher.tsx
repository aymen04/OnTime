'use client';

import * as React from 'react';
import Link from 'next/link';
import { GlobeIcon } from 'lucide-react';

import { cn } from '@workspace/ui/lib/utils';

import { getChromeDictionary } from '~/lib/i18n/chrome';
import { getHomePath, LOCALES } from '~/lib/i18n/config';
import { useLocale } from '~/lib/i18n/use-locale';

export type LanguageSwitcherProps = {
  className?: string;
};

export function LanguageSwitcher({
  className
}: LanguageSwitcherProps): React.JSX.Element {
  const locale = useLocale();
  const t = getChromeDictionary(locale);
  return (
    <div
      role="group"
      aria-label={t.language.label}
      className={cn(
        'flex items-center gap-0.5 rounded-xl border p-0.5 text-xs font-semibold',
        className
      )}
    >
      <GlobeIcon className="mx-1.5 size-3.5 text-muted-foreground" />
      {LOCALES.map((option) => (
        <Link
          key={option}
          href={getHomePath(option)}
          hrefLang={option}
          title={t.language.names[option]}
          aria-current={option === locale ? 'true' : undefined}
          className={cn(
            'rounded-lg px-2 py-1 uppercase transition-colors',
            option === locale
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option}
        </Link>
      ))}
    </div>
  );
}

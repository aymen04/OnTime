'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

import { getLocaleFromPathname, type Locale } from '~/lib/i18n/config';

export function useLocale(): Locale {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);

  // The root layout is shared by every locale, so keep <html lang> in sync here.
  React.useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return locale;
}

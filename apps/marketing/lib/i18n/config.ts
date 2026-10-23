export const LOCALES = ['en', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export function getLocaleFromPathname(pathname: string | null): Locale {
  return pathname === '/fr' || pathname?.startsWith('/fr/')
    ? 'fr'
    : DEFAULT_LOCALE;
}

/** Home path of a locale, optionally pointing at a section anchor. */
export function getHomePath(locale: Locale, anchor?: string): string {
  const base = locale === DEFAULT_LOCALE ? '/' : `/${locale}`;
  return anchor ? `${base}#${anchor}` : base;
}

export function format(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}

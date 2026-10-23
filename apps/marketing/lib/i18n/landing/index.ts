import { type Locale } from '~/lib/i18n/config';
import { en } from './en';
import { fr } from './fr';
import { type LandingDictionary } from './types';

export type { LandingDictionary, RosterStatus } from './types';

const LANDING: Record<Locale, LandingDictionary> = { en, fr };

export function getLandingDictionary(locale: Locale): LandingDictionary {
  return LANDING[locale];
}

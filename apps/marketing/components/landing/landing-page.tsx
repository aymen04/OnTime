import * as React from 'react';

import { Comparison } from '~/components/landing/comparison';
import { Features } from '~/components/landing/features';
import { FinalCta } from '~/components/landing/final-cta';
import { Hero } from '~/components/landing/hero';
import { HowItWorks } from '~/components/landing/how-it-works';
import { Industries } from '~/components/landing/industries';
import { LandingFaq } from '~/components/landing/landing-faq';
import { Pain } from '~/components/landing/pain';
import { Pricing } from '~/components/landing/pricing';
import { type Locale } from '~/lib/i18n/config';
import { getLandingDictionary } from '~/lib/i18n/landing';

export type LandingPageProps = {
  locale: Locale;
};

export function LandingPage({ locale }: LandingPageProps): React.JSX.Element {
  const t = getLandingDictionary(locale);
  return (
    <main>
      <Hero
        t={t.hero}
        demo={t.demo}
      />
      <Pain t={t.pain} />
      <HowItWorks t={t.steps} />
      <Features t={t.features} />
      <Comparison t={t.comparison} />
      <Industries t={t.industries} />
      <Pricing t={t.pricing} />
      <LandingFaq t={t.faq} />
      <FinalCta t={t.cta} />
    </main>
  );
}

import * as React from 'react';
import type { Metadata } from 'next';

import { LandingPage } from '~/components/landing/landing-page';
import { getLandingDictionary } from '~/lib/i18n/landing';

const t = getLandingDictionary('en');

export const metadata: Metadata = {
  title: { absolute: t.meta.title },
  description: t.meta.description,
  alternates: {
    canonical: '/',
    languages: { en: '/', fr: '/fr' }
  }
};

export default function IndexPage(): React.JSX.Element {
  return <LandingPage locale="en" />;
}

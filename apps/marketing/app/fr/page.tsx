import * as React from 'react';
import type { Metadata } from 'next';

import { APP_NAME } from '@workspace/common/app';
import { baseUrl } from '@workspace/routes';

import { LandingPage } from '~/components/landing/landing-page';
import { getLandingDictionary } from '~/lib/i18n/landing';

const t = getLandingDictionary('fr');

export const metadata: Metadata = {
  title: { absolute: t.meta.title },
  description: t.meta.description,
  alternates: {
    canonical: '/fr',
    languages: { en: '/', fr: '/fr' }
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: APP_NAME,
    title: t.meta.title,
    description: t.meta.description,
    url: `${baseUrl.Marketing}/fr`,
    images: {
      url: `${baseUrl.Marketing}/og-image`,
      width: 1200,
      height: 630,
      alt: APP_NAME
    }
  }
};

export default function FrenchIndexPage(): React.JSX.Element {
  return <LandingPage locale="fr" />;
}

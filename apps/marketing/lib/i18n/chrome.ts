import { type Locale } from '~/lib/i18n/config';

/** Strings of the site chrome (navbar, footer, cookie banner), shared by every page. */
export type ChromeDictionary = {
  nav: {
    links: { label: string; anchor: string }[];
    signIn: string;
    cta: string;
    toggleMenu: string;
  };
  footer: {
    tagline: string;
    groups: {
      product: string;
      company: string;
      legal: string;
    };
    contact: string;
    signIn: string;
    terms: string;
    privacy: string;
    cookies: string;
    rights: string;
  };
  language: {
    label: string;
    names: Record<Locale, string>;
  };
  theme: string;
  cookies: {
    message: string;
    policy: string;
    deny: string;
    accept: string;
  };
};

const en: ChromeDictionary = {
  nav: {
    links: [
      { label: 'How it works', anchor: 'how-it-works' },
      { label: 'Features', anchor: 'features' },
      { label: "Who it's for", anchor: 'industries' },
      { label: 'Pricing', anchor: 'pricing' },
      { label: 'FAQ', anchor: 'faq' }
    ],
    signIn: 'Sign in',
    cta: 'Start free trial',
    toggleMenu: 'Toggle menu'
  },
  footer: {
    tagline:
      'One-click staff scheduling for restaurants, shops and seasonal teams.',
    groups: {
      product: 'Product',
      company: 'Company',
      legal: 'Legal'
    },
    contact: 'Contact',
    signIn: 'Sign in',
    terms: 'Terms of Use',
    privacy: 'Privacy Policy',
    cookies: 'Cookie Policy',
    rights: 'All rights reserved.'
  },
  language: {
    label: 'Language',
    names: { en: 'English', fr: 'Français' }
  },
  theme: 'Theme',
  cookies: {
    message:
      'We use cookies for analytics and to improve your experience. By accepting, you agree to our use of cookies.',
    policy: 'Learn more',
    deny: 'Deny',
    accept: 'Accept'
  }
};

const fr: ChromeDictionary = {
  nav: {
    links: [
      { label: 'Comment ça marche', anchor: 'how-it-works' },
      { label: 'Fonctionnalités', anchor: 'features' },
      { label: 'Pour qui', anchor: 'industries' },
      { label: 'Tarifs', anchor: 'pricing' },
      { label: 'FAQ', anchor: 'faq' }
    ],
    signIn: 'Se connecter',
    cta: 'Essai gratuit',
    toggleMenu: 'Ouvrir le menu'
  },
  footer: {
    tagline:
      'Le planning en un clic pour les restaurants, les commerces et les équipes saisonnières.',
    groups: {
      product: 'Produit',
      company: 'Entreprise',
      legal: 'Légal'
    },
    contact: 'Contact',
    signIn: 'Se connecter',
    terms: "Conditions d'utilisation",
    privacy: 'Confidentialité',
    cookies: 'Cookies',
    rights: 'Tous droits réservés.'
  },
  language: {
    label: 'Langue',
    names: { en: 'English', fr: 'Français' }
  },
  theme: 'Thème',
  cookies: {
    message:
      "Nous utilisons des cookies pour mesurer l'audience et améliorer votre expérience. En acceptant, vous consentez à leur utilisation.",
    policy: 'En savoir plus',
    deny: 'Refuser',
    accept: 'Accepter'
  }
};

const CHROME: Record<Locale, ChromeDictionary> = { en, fr };

export function getChromeDictionary(locale: Locale): ChromeDictionary {
  return CHROME[locale];
}

'use client';

import * as React from 'react';
import Link from 'next/link';

import { APP_NAME } from '@workspace/common/app';
import { routes } from '@workspace/routes';
import { Logo } from '@workspace/ui/components/logo';
import { ThemeSwitcher } from '@workspace/ui/components/theme-switcher';

import { LanguageSwitcher } from '~/components/language-switcher';
import { getChromeDictionary } from '~/lib/i18n/chrome';
import { getHomePath } from '~/lib/i18n/config';
import { useLocale } from '~/lib/i18n/use-locale';

export function Footer(): React.JSX.Element {
  const locale = useLocale();
  const t = getChromeDictionary(locale);
  const groups = [
    {
      title: t.footer.groups.product,
      links: t.nav.links.map((link) => ({
        name: link.label,
        href: getHomePath(locale, link.anchor)
      }))
    },
    {
      title: t.footer.groups.company,
      links: [
        { name: t.footer.contact, href: routes.marketing.Contact },
        { name: t.footer.signIn, href: routes.dashboard.auth.SignIn }
      ]
    },
    {
      title: t.footer.groups.legal,
      links: [
        { name: t.footer.terms, href: routes.marketing.TermsOfUse },
        { name: t.footer.privacy, href: routes.marketing.PrivacyPolicy },
        { name: t.footer.cookies, href: routes.marketing.CookiePolicy }
      ]
    }
  ];
  return (
    <footer className="border-t px-2 pb-10 pt-16 sm:container">
      <h2 className="sr-only">Footer</h2>
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">
              {t.footer.tagline}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {groups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-foreground">
                  {group.title}
                </h3>
                <ul
                  role="list"
                  className="mt-5 space-y-2.5"
                >
                  {group.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}. {t.footer.rights}
          </p>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}

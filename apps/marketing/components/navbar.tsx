'use client';

import * as React from 'react';
import Link from 'next/link';

import { routes } from '@workspace/routes';
import { buttonVariants } from '@workspace/ui/components/button';
import { Logo } from '@workspace/ui/components/logo';
import { ThemeToggle } from '@workspace/ui/components/theme-toggle';
import { cn } from '@workspace/ui/lib/utils';

import { LanguageSwitcher } from '~/components/language-switcher';
import { MobileMenu } from '~/components/mobile-menu';
import { getChromeDictionary } from '~/lib/i18n/chrome';
import { getHomePath } from '~/lib/i18n/config';
import { useLocale } from '~/lib/i18n/use-locale';

export function Navbar(): React.JSX.Element {
  const locale = useLocale();
  const t = getChromeDictionary(locale);
  return (
    <section className="sticky inset-x-0 top-0 z-40 border-b bg-background/80 py-4 backdrop-blur-lg">
      <div className="container">
        <nav className="hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-x-8">
            <Link
              href={getHomePath(locale)}
              className="flex items-center gap-2"
            >
              <Logo />
            </Link>
            <ul className="flex items-center gap-1">
              {t.nav.links.map((link) => (
                <li key={link.anchor}>
                  <Link
                    href={getHomePath(locale, link.anchor)}
                    className="rounded-xl px-3 py-2 text-[15px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle className="rounded-xl border-none shadow-none" />
            <Link
              href={routes.dashboard.auth.SignIn}
              className={cn(buttonVariants({ variant: 'ghost' }), 'rounded-xl')}
            >
              {t.nav.signIn}
            </Link>
            <Link
              href={routes.dashboard.auth.SignUp}
              className={cn(
                buttonVariants({ variant: 'default' }),
                'rounded-xl bg-brand font-semibold text-brand-foreground hover:bg-brand/90'
              )}
            >
              {t.nav.cta}
            </Link>
          </div>
        </nav>
        <MobileMenu className="lg:hidden" />
      </div>
    </section>
  );
}

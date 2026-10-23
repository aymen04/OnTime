import * as React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';

import { routes } from '@workspace/routes';
import { buttonVariants } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

import { BlurFade } from '~/components/fragments/blur-fade';
import { type LandingDictionary } from '~/lib/i18n/landing';

const DECOR_SHIFTS = [
  'left-[6%] top-[18%] w-40 rotate-[-8deg]',
  'left-[12%] bottom-[14%] w-28 rotate-[6deg]',
  'right-[8%] top-[16%] w-32 rotate-[7deg]',
  'right-[14%] bottom-[18%] w-44 rotate-[-5deg]'
];

export type FinalCtaProps = {
  t: LandingDictionary['cta'];
};

export function FinalCta({ t }: FinalCtaProps): React.JSX.Element {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <BlurFade
          inView
          yOffset={12}
          className="relative isolate overflow-hidden rounded-[2rem] bg-brand px-6 py-20 text-center text-brand-foreground md:py-28"
        >
          {DECOR_SHIFTS.map((position) => (
            <span
              key={position}
              aria-hidden="true"
              className={cn(
                'absolute -z-10 hidden h-10 rounded-xl bg-brand-foreground/10 md:block',
                position
              )}
            />
          ))}
          <h2 className="mx-auto max-w-3xl text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-tight md:text-6xl">
            {t.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-brand-foreground/75">
            {t.description}
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={routes.dashboard.auth.SignUp}
              className={cn(
                buttonVariants({ size: 'lg' }),
                'group h-12 rounded-xl bg-brand-foreground px-6 text-base font-semibold text-white hover:bg-brand-foreground/90'
              )}
            >
              {t.primary}
              <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href={routes.marketing.Contact}
              className={cn(
                buttonVariants({ size: 'lg', variant: 'outline' }),
                'h-12 rounded-xl border-brand-foreground/20 bg-transparent px-6 text-base text-brand-foreground hover:bg-brand-foreground/5 hover:text-brand-foreground'
              )}
            >
              {t.secondary}
            </Link>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}

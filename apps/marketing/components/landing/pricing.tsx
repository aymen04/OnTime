'use client';

import * as React from 'react';
import Link from 'next/link';
import { CheckIcon, InfinityIcon, UsersIcon } from 'lucide-react';
import { motion } from 'motion/react';

import { routes } from '@workspace/routes';
import { buttonVariants } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

import { SectionHeading } from '~/components/landing/section-heading';
import { type LandingDictionary } from '~/lib/i18n/landing';

const POPULAR_PLAN_INDEX = 1;
const LIFETIME_PLAN_INDEX = 2;

export type PricingProps = {
  t: LandingDictionary['pricing'];
};

export function Pricing({ t }: PricingProps): React.JSX.Element {
  return (
    <section
      id="pricing"
      className="scroll-mt-20 border-t bg-muted/30 py-24 md:py-32"
    >
      <div className="container">
        <SectionHeading
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.description}
        />
        <div className="mx-auto mt-16 grid max-w-6xl items-stretch gap-4 lg:grid-cols-3">
          {t.plans.map((plan, index) => {
            const popular = index === POPULAR_PLAN_INDEX;
            const SeatsIcon =
              index === LIFETIME_PLAN_INDEX ? InfinityIcon : UsersIcon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: index * 0.1, duration: 0.45 }}
                className={cn(
                  'relative flex flex-col rounded-3xl border p-8',
                  popular
                    ? 'border-neutral-950 bg-neutral-950 text-white shadow-2xl shadow-brand/20 lg:-my-4 lg:py-12 dark:border-brand/50'
                    : 'bg-card'
                )}
              >
                {popular && (
                  <span className="absolute -top-3 left-8 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-foreground">
                    {t.popular}
                  </span>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-display text-5xl font-extrabold tracking-tight tabular-nums">
                    {plan.price}
                  </span>
                  <span
                    className={cn(
                      'text-sm',
                      popular ? 'text-white/60' : 'text-muted-foreground'
                    )}
                  >
                    {plan.period}
                  </span>
                </div>
                <div
                  className={cn(
                    'mt-6 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold',
                    popular ? 'bg-white/10' : 'bg-muted'
                  )}
                >
                  <SeatsIcon
                    className={cn(
                      'size-4',
                      popular
                        ? 'text-brand'
                        : 'text-brand-strong dark:text-brand'
                    )}
                  />
                  {plan.seats}
                </div>
                <p
                  className={cn(
                    'mt-3 text-sm',
                    popular ? 'text-white/60' : 'text-muted-foreground'
                  )}
                >
                  {plan.note}
                </p>
                <Link
                  href={routes.dashboard.auth.SignUp}
                  className={cn(
                    buttonVariants({
                      size: 'lg',
                      variant: popular ? 'default' : 'outline'
                    }),
                    'mt-8 h-12 w-full rounded-xl text-base font-semibold lg:mt-auto',
                    popular &&
                      'bg-brand text-brand-foreground hover:bg-brand/90'
                  )}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mx-auto mt-10 max-w-6xl rounded-3xl border bg-card p-8">
          <h3 className="text-sm font-semibold">{t.includedTitle}</h3>
          <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
            {t.included.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm"
              >
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-brand-strong dark:text-brand" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t.footnote}
        </p>
      </div>
    </section>
  );
}

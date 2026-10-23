'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRightIcon, CheckIcon, PlayCircleIcon } from 'lucide-react';
import { motion } from 'motion/react';

import { routes } from '@workspace/routes';
import { buttonVariants } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

import { ScheduleDemo } from '~/components/landing/schedule-demo';
import { type LandingDictionary } from '~/lib/i18n/landing';

export type HeroProps = {
  t: LandingDictionary['hero'];
  demo: LandingDictionary['demo'];
};

export function Hero({ t, demo }: HeroProps): React.JSX.Element {
  return (
    <section className="relative isolate overflow-hidden pb-20 pt-14 md:pb-28 md:pt-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-60 [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,#000_40%,transparent_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[38%] -z-10 h-[520px] w-[min(1100px,120vw)] -translate-x-1/2 rounded-full bg-brand/25 blur-[120px] dark:bg-brand/10"
      />
      <div className="container">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <motion.a
            href="#pricing"
            initial={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs font-medium shadow-xs backdrop-blur transition-colors hover:bg-accent sm:text-sm"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-strong opacity-60 dark:bg-brand" />
              <span className="relative inline-flex size-2 rounded-full bg-brand-strong dark:bg-brand" />
            </span>
            {t.badge}
            <ArrowRightIcon className="size-3.5 text-muted-foreground" />
          </motion.a>

          <motion.h1
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mt-7 text-balance font-display text-[44px] font-extrabold leading-[0.98] tracking-[-0.035em] sm:text-6xl md:text-7xl lg:text-[86px]"
          >
            {t.titleLead}
            <br />
            <span className="relative isolate inline-block whitespace-nowrap dark:text-brand">
              <motion.span
                aria-hidden="true"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.65, duration: 0.5, ease: 'easeOut' }}
                className="absolute inset-x-[-0.08em] bottom-[0.06em] -z-10 h-[0.45em] origin-left -skew-x-6 rounded-md bg-brand dark:hidden"
              />
              {t.titleHighlight}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.45 }}
            className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl"
          >
            {t.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.45 }}
            className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
          >
            <Link
              href={routes.dashboard.auth.SignUp}
              className={cn(
                buttonVariants({ size: 'lg' }),
                'group h-12 rounded-xl bg-brand px-6 text-base font-semibold text-brand-foreground shadow-lg shadow-brand/30 hover:bg-brand/90'
              )}
            >
              {t.primaryCta}
              <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#demo"
              className={cn(
                buttonVariants({ size: 'lg', variant: 'outline' }),
                'h-12 rounded-xl px-6 text-base'
              )}
            >
              <PlayCircleIcon className="size-4" />
              {t.secondaryCta}
            </a>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.45 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
          >
            {t.reassurance.map((item) => (
              <li
                key={item}
                className="flex items-center gap-1.5"
              >
                <CheckIcon className="size-4 text-brand-strong dark:text-brand" />
                {item}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          id="demo"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7, ease: 'easeOut' }}
          className="mx-auto mt-14 max-w-6xl scroll-mt-28 md:mt-16"
        >
          <ScheduleDemo t={demo} />
        </motion.div>
      </div>
    </section>
  );
}

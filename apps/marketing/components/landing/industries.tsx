'use client';

import * as React from 'react';
import {
  ArrowRightLeftIcon,
  BellIcon,
  CheckIcon,
  FingerprintIcon,
  PalmtreeIcon,
  StoreIcon,
  SunIcon,
  UtensilsCrossedIcon
} from 'lucide-react';
import { motion } from 'motion/react';

import { SectionHeading } from '~/components/landing/section-heading';
import { type LandingDictionary } from '~/lib/i18n/landing';

const ICONS = [UtensilsCrossedIcon, StoreIcon, SunIcon];

type EmployeeDictionary = LandingDictionary['industries']['employee'];

function PhoneMockup({
  t
}: {
  t: EmployeeDictionary['phone'];
}): React.JSX.Element {
  return (
    <div className="relative isolate mx-auto w-[290px]">
      <div
        aria-hidden="true"
        className="absolute -inset-10 -z-10 rounded-full bg-brand/25 blur-3xl dark:bg-brand/10"
      />
      <div className="rounded-[2.75rem] border-[6px] border-neutral-900 bg-background p-4 shadow-2xl dark:border-neutral-700">
        <div className="mx-auto mb-4 h-5 w-24 rounded-full bg-neutral-900 dark:bg-neutral-700" />
        <div className="text-lg font-semibold">{t.greeting}</div>
        <div className="mt-4 rounded-2xl bg-neutral-950 p-4 text-white dark:border dark:border-white/10">
          <div className="text-xs text-white/60">{t.nextShiftLabel}</div>
          <div className="mt-1 font-semibold">{t.nextShift}</div>
          <button
            type="button"
            tabIndex={-1}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-brand-foreground"
          >
            <FingerprintIcon className="size-4" />
            {t.clockIn}
          </button>
        </div>
        <div className="mt-3 rounded-2xl border p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t.hoursLabel}</span>
            <span className="font-semibold tabular-nums">{t.hoursValue}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '81%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full rounded-full bg-brand-strong dark:bg-brand"
            />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <span className="flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-medium">
            <ArrowRightLeftIcon className="size-3.5" />
            {t.swap}
          </span>
          <span className="flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-medium">
            <PalmtreeIcon className="size-3.5" />
            {t.timeOff}
          </span>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 22 }}
        className="absolute -right-5 -top-7 flex max-w-[220px] items-center gap-2 rounded-2xl border bg-background/95 px-3 py-2.5 text-xs font-medium shadow-lg backdrop-blur sm:-right-16"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
          <BellIcon className="size-3.5" />
        </span>
        {t.notification}
      </motion.div>
    </div>
  );
}

export type IndustriesProps = {
  t: LandingDictionary['industries'];
};

export function Industries({ t }: IndustriesProps): React.JSX.Element {
  return (
    <section
      id="industries"
      className="scroll-mt-20 border-t py-24 md:py-32"
    >
      <div className="container">
        <SectionHeading
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.description}
        />
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {t.items.map((item, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: index * 0.1, duration: 0.45 }}
                className="group flex flex-col rounded-3xl border bg-card p-7 transition-colors hover:border-brand-strong/40 dark:hover:border-brand/40"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong transition-colors group-hover:bg-brand group-hover:text-brand-foreground dark:text-brand">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.body}</p>
                <ul className="mt-6 space-y-2.5 border-t pt-6">
                  {item.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2 text-sm"
                    >
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-brand-strong dark:text-brand" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-24 grid items-center gap-16 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow={t.employee.eyebrow}
              title={t.employee.title}
              description={t.employee.description}
            />
            <ul className="mt-8 space-y-3">
              {t.employee.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
                    <CheckIcon className="size-3.5" />
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
          <PhoneMockup t={t.employee.phone} />
        </div>
      </div>
    </section>
  );
}

'use client';

import * as React from 'react';
import {
  AlertTriangleIcon,
  ArrowRightLeftIcon,
  CheckCircle2Icon,
  CheckIcon,
  DownloadIcon,
  FingerprintIcon,
  LockIcon,
  MapPinIcon,
  MoonStarIcon,
  PalmtreeIcon,
  TrendingDownIcon
} from 'lucide-react';
import { motion } from 'motion/react';

import { cn } from '@workspace/ui/lib/utils';

import { SectionHeading } from '~/components/landing/section-heading';
import { type LandingDictionary, type RosterStatus } from '~/lib/i18n/landing';

type FeaturesDictionary = LandingDictionary['features'];

type FeatureCardProps = React.PropsWithChildren<{
  title: string;
  body: string;
  className?: string;
  index: number;
}>;

function FeatureCard({
  title,
  body,
  className,
  index,
  children
}: FeatureCardProps): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: (index % 3) * 0.08, duration: 0.45 }}
      className={cn(
        'flex flex-col overflow-hidden rounded-3xl border bg-card',
        className
      )}
    >
      <div className="flex flex-1 items-center justify-center bg-muted/30 p-6">
        {children}
      </div>
      <div className="flex flex-col gap-1.5 border-t p-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
    </motion.div>
  );
}

function ClockVisual({
  t
}: {
  t: FeaturesDictionary['clock'];
}): React.JSX.Element {
  return (
    <div className="w-full max-w-[260px] rounded-[2rem] border-4 border-foreground/10 bg-background p-4 shadow-xl">
      <div className="text-center text-xs text-muted-foreground">{t.shift}</div>
      <div className="relative mx-auto my-5 flex size-40 items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle,var(--border)_1px,transparent_1px)] bg-[size:12px_12px]">
        <motion.span
          className="absolute size-28 rounded-full bg-brand/25"
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
        <span className="absolute size-28 rounded-full border-2 border-dashed border-brand-strong/60 dark:border-brand/60" />
        <MapPinIcon className="relative size-7 fill-brand text-brand-foreground" />
        <span className="absolute bottom-9 right-11 size-3 rounded-full border-2 border-background bg-sky-500 shadow" />
      </div>
      <button
        type="button"
        tabIndex={-1}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand font-semibold text-brand-foreground"
      >
        <FingerprintIcon className="size-5" />
        {t.button}
      </button>
      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs">
        <CheckCircle2Icon className="size-3.5 text-brand-strong dark:text-brand" />
        <span className="font-medium">{t.status}</span>
        <span className="text-muted-foreground">· {t.location}</span>
      </div>
    </div>
  );
}

const STATUS_STYLES: Record<RosterStatus, string> = {
  on: 'bg-brand-soft text-brand-strong dark:text-brand',
  late: 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300',
  upcoming: 'bg-muted text-muted-foreground'
};

function LiveVisual({
  t
}: {
  t: FeaturesDictionary['live'];
}): React.JSX.Element {
  const counters = [
    { label: t.scheduled, value: 9, className: '' },
    {
      label: t.onShift,
      value: 6,
      className: 'text-brand-strong dark:text-brand'
    },
    {
      label: t.late,
      value: 1,
      className: 'text-amber-600 dark:text-amber-300'
    }
  ];
  return (
    <div className="grid w-full gap-4 sm:grid-cols-[1fr_1.3fr]">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-1">
        {counters.map((counter) => (
          <div
            key={counter.label}
            className="rounded-2xl border bg-background px-4 py-3"
          >
            <div className="text-xs text-muted-foreground">{counter.label}</div>
            <div
              className={cn(
                'font-display text-3xl font-extrabold tabular-nums',
                counter.className
              )}
            >
              {counter.value}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border bg-background p-2">
        <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-red-500" />
          </span>
          {t.liveLabel}
        </div>
        <ul>
          {t.roster.map((person) => (
            <li
              key={person.name}
              className="flex items-center gap-3 rounded-xl px-2 py-2"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                {person.name.charAt(0)}
              </span>
              <div className="flex-1 leading-tight">
                <div className="text-sm font-medium">{person.name}</div>
                <div className="text-xs tabular-nums text-muted-foreground">
                  {person.time}
                </div>
              </div>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-medium',
                  STATUS_STYLES[person.status]
                )}
              >
                {t.statusLabels[person.status]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SwapsVisual({
  t
}: {
  t: FeaturesDictionary['swaps'];
}): React.JSX.Element {
  return (
    <div className="w-full max-w-[280px]">
      <ol className="relative flex flex-col gap-3 before:absolute before:bottom-4 before:left-[15px] before:top-4 before:w-px before:bg-border">
        {t.steps.map((step, index) => (
          <motion.li
            key={step}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + index * 0.25 }}
            className="relative flex items-center gap-3"
          >
            <span className="flex size-8 items-center justify-center rounded-full border bg-background">
              {index === 0 ? (
                <ArrowRightLeftIcon className="size-3.5" />
              ) : (
                <CheckIcon className="size-3.5 text-brand-strong dark:text-brand" />
              )}
            </span>
            <span className="text-sm font-medium">{step}</span>
          </motion.li>
        ))}
      </ol>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1 }}
        className="mt-4 rounded-xl bg-brand px-3 py-2 text-center text-xs font-semibold text-brand-foreground"
      >
        {t.done}
      </motion.div>
    </div>
  );
}

function TimeOffVisual({
  t
}: {
  t: FeaturesDictionary['timeOff'];
}): React.JSX.Element {
  return (
    <div className="w-full max-w-[280px] space-y-3">
      <div className="rounded-2xl border bg-background p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <PalmtreeIcon className="size-4 text-amber-600 dark:text-amber-300" />
            {t.request}
          </div>
          <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-strong dark:text-brand">
            {t.approved}
          </span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{t.dates}</div>
      </div>
      <div className="flex items-center gap-2 rounded-2xl border border-dashed border-amber-300/70 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/5 dark:text-amber-300">
        <LockIcon className="size-3.5" />
        {t.locked}
      </div>
    </div>
  );
}

const COST_BARS = [62, 58, 54, 66, 88, 100, 81];

function CostVisual({
  t
}: {
  t: FeaturesDictionary['cost'];
}): React.JSX.Element {
  return (
    <div className="grid w-full items-end gap-6 sm:grid-cols-[1fr_1.2fr]">
      <div className="space-y-4">
        <div>
          <div className="text-xs text-muted-foreground">{t.label}</div>
          <div className="font-display text-4xl font-extrabold tabular-nums">
            {t.amount}
          </div>
          <div className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-strong dark:text-brand">
            <TrendingDownIcon className="size-3.5" />
            {t.trend}
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-2xl border border-amber-300/70 bg-amber-50 px-3 py-2.5 dark:border-amber-400/20 dark:bg-amber-400/5">
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-300" />
          <div className="leading-tight">
            <div className="text-xs font-semibold text-amber-800 dark:text-amber-200">
              {t.alert}
            </div>
            <div className="text-xs text-amber-700/80 dark:text-amber-300/80">
              {t.alertDetail}
            </div>
          </div>
        </div>
      </div>
      <div className="flex h-36 items-end gap-2 rounded-2xl border bg-background p-3">
        {COST_BARS.map((height, index) => (
          <div
            key={index}
            className="flex flex-1 flex-col items-center gap-1.5"
          >
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${height * 0.85}px` }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.5 }}
              className={cn(
                'w-full rounded-md',
                index >= 4 ? 'bg-brand' : 'bg-foreground/15'
              )}
            />
            <span className="text-[10px] text-muted-foreground">
              {t.days[index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExportsVisual({
  t
}: {
  t: FeaturesDictionary['exports'];
}): React.JSX.Element {
  return (
    <div className="w-full max-w-[300px] overflow-hidden rounded-2xl border bg-background">
      <table className="w-full text-left text-xs">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            {t.columns.map((column) => (
              <th
                key={column}
                className="px-3 py-2 font-medium"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {t.rows.map((row) => (
            <tr
              key={row[0]}
              className="border-t"
            >
              {row.map((cell, index) => (
                <td
                  key={index}
                  className={cn('px-3 py-2', index === 0 && 'font-medium')}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end gap-2 border-t p-2">
        {['CSV', 'PDF'].map((type) => (
          <span
            key={type}
            className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium"
          >
            <DownloadIcon className="size-3" />
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}

export type FeaturesProps = {
  t: FeaturesDictionary;
};

export function Features({ t }: FeaturesProps): React.JSX.Element {
  return (
    <section
      id="features"
      className="scroll-mt-20 border-t py-24 md:py-32"
    >
      <div className="container">
        <SectionHeading
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.description}
        />
        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          <FeatureCard
            index={0}
            title={t.clock.title}
            body={t.clock.body}
            className="lg:row-span-2"
          >
            <ClockVisual t={t.clock} />
          </FeatureCard>
          <FeatureCard
            index={1}
            title={t.live.title}
            body={t.live.body}
            className="lg:col-span-2"
          >
            <LiveVisual t={t.live} />
          </FeatureCard>
          <FeatureCard
            index={2}
            title={t.swaps.title}
            body={t.swaps.body}
          >
            <SwapsVisual t={t.swaps} />
          </FeatureCard>
          <FeatureCard
            index={3}
            title={t.timeOff.title}
            body={t.timeOff.body}
          >
            <TimeOffVisual t={t.timeOff} />
          </FeatureCard>
          <FeatureCard
            index={4}
            title={t.cost.title}
            body={t.cost.body}
            className="lg:col-span-2"
          >
            <CostVisual t={t.cost} />
          </FeatureCard>
          <FeatureCard
            index={5}
            title={t.exports.title}
            body={t.exports.body}
          >
            <ExportsVisual t={t.exports} />
          </FeatureCard>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45 }}
            className="relative isolate flex flex-col gap-6 overflow-hidden rounded-3xl bg-neutral-950 p-8 text-white md:flex-row md:items-center md:justify-between lg:col-span-3 lg:p-10 dark:border"
          >
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-24 -z-10 size-72 rounded-full bg-brand/20 blur-3xl"
            />
            <div className="flex max-w-xl gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground">
                <MoonStarIcon className="size-6" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold">
                  {t.nights.title}
                </h3>
                <p className="mt-2 text-white/70">{t.nights.body}</p>
              </div>
            </div>
            <ul className="flex flex-wrap gap-2 md:max-w-sm md:justify-end">
              {t.nights.chips.map((chip) => (
                <li
                  key={chip}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm"
                >
                  {chip}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

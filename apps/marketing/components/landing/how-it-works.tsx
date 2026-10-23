'use client';

import * as React from 'react';
import {
  BellRingIcon,
  CheckIcon,
  MousePointer2Icon,
  SparklesIcon
} from 'lucide-react';
import { motion } from 'motion/react';

import { cn } from '@workspace/ui/lib/utils';

import { SectionHeading } from '~/components/landing/section-heading';
import { type LandingDictionary } from '~/lib/i18n/landing';

type Visuals = LandingDictionary['steps']['visuals'];

const AVAILABLE_DAYS = [true, true, false, true, true, true, false];

function AvailabilityVisual({ visuals }: { visuals: Visuals }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-1.5">
        {visuals.days.map((day, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 }}
            className={cn(
              'flex size-8 items-center justify-center rounded-lg text-xs font-semibold',
              AVAILABLE_DAYS[index]
                ? 'bg-brand text-brand-foreground'
                : 'border border-dashed text-muted-foreground line-through'
            )}
          >
            {day}
          </motion.span>
        ))}
      </div>
      <div className="w-full max-w-[220px]">
        <div className="relative h-2 rounded-full bg-muted">
          <div className="absolute inset-y-0 left-[38%] right-[4%] rounded-full bg-brand-strong dark:bg-brand" />
          <span className="absolute left-[38%] top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand-strong bg-background dark:border-brand" />
          <span className="absolute right-[4%] top-1/2 size-3.5 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-brand-strong bg-background dark:border-brand" />
        </div>
        <div className="mt-2 flex justify-between text-[11px] tabular-nums text-muted-foreground">
          <span>06:00</span>
          <span>14:00 → 23:00</span>
          <span>24:00</span>
        </div>
      </div>
    </div>
  );
}

const MINI_GRID = [
  [1, 1, 0, 1, 1, 0, 1],
  [0, 1, 1, 1, 0, 1, 1],
  [1, 0, 1, 1, 1, 1, 0]
];
const MINI_COLORS = ['bg-sky-400', 'bg-orange-400', 'bg-violet-400'];

function AutoScheduleVisual({ visuals }: { visuals: Visuals }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <span className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/30">
          <SparklesIcon className="size-4" />
          {visuals.button}
        </span>
        <motion.span
          aria-hidden="true"
          initial={{ x: 36, y: 30, opacity: 0 }}
          whileInView={{ x: 0, y: 14, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="absolute -bottom-2 right-3"
        >
          <MousePointer2Icon className="size-5 fill-foreground text-background" />
        </motion.span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {MINI_GRID.flatMap((row, rowIndex) =>
          row.map((filled, day) => (
            <motion.span
              key={`${rowIndex}-${day}`}
              initial={{ opacity: 0, scale: 0.4 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 + day * 0.07 + rowIndex * 0.03 }}
              className={cn(
                'h-3.5 w-6 rounded-[4px]',
                filled ? MINI_COLORS[rowIndex] : 'bg-muted'
              )}
            />
          ))
        )}
      </div>
      <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-strong dark:text-brand">
        <CheckIcon className="size-3.5" />
        {visuals.placed}
      </span>
    </div>
  );
}

function DragVisual({ visuals }: { visuals: Visuals }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex gap-2">
        {[0, 1].map((cell) => (
          <span
            key={cell}
            className="h-12 w-24 rounded-lg border border-dashed bg-muted/50"
          />
        ))}
        <motion.span
          aria-hidden="true"
          animate={{ x: [0, 0, 104, 104, 0], rotate: [0, -3, -3, 0, 0] }}
          transition={{
            duration: 3.2,
            times: [0, 0.15, 0.5, 0.65, 1],
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute left-1 top-1 flex h-10 w-[88px] flex-col justify-center rounded-md border border-sky-300/70 bg-sky-100 px-2 text-sky-950 shadow-md dark:border-sky-400/30 dark:bg-sky-400/20 dark:text-sky-100"
        >
          <span className="whitespace-nowrap text-[11px] font-semibold">
            10:00 – 16:00
          </span>
          <MousePointer2Icon className="absolute -bottom-2 right-1 size-4 fill-foreground text-background" />
        </motion.span>
      </div>
      <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium shadow-xs">
        <BellRingIcon className="size-3.5 text-brand-strong dark:text-brand" />
        {visuals.published}
      </span>
    </div>
  );
}

const VISUALS = [AvailabilityVisual, AutoScheduleVisual, DragVisual];

export type HowItWorksProps = {
  t: LandingDictionary['steps'];
};

export function HowItWorks({ t }: HowItWorksProps): React.JSX.Element {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 py-24 md:py-32"
    >
      <div className="container">
        <SectionHeading
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.description}
        />
        <ol className="mt-16 grid gap-6 md:grid-cols-3">
          {t.items.map((item, index) => {
            const Visual = VISUALS[index];
            return (
              <motion.li
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: index * 0.12, duration: 0.45 }}
                className="relative flex flex-col overflow-hidden rounded-3xl border bg-card"
              >
                <div className="flex h-52 items-center justify-center border-b bg-muted/30 px-6">
                  <Visual visuals={t.visuals} />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <span className="font-display text-sm font-bold text-brand-strong dark:text-brand">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.body}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

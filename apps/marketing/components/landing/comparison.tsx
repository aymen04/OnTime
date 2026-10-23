'use client';

import * as React from 'react';
import { CheckIcon, XIcon } from 'lucide-react';
import { motion } from 'motion/react';

import { LogoMark } from '@workspace/ui/components/logo';

import { SectionHeading } from '~/components/landing/section-heading';
import { type LandingDictionary } from '~/lib/i18n/landing';

export type ComparisonProps = {
  t: LandingDictionary['comparison'];
};

export function Comparison({ t }: ComparisonProps): React.JSX.Element {
  return (
    <section className="border-t bg-muted/30 py-24 md:py-32">
      <div className="container">
        <SectionHeading
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.description}
        />
        <div className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-3xl border bg-card">
          <div className="hidden grid-cols-[1fr_1.3fr_1.3fr] border-b text-sm font-semibold md:grid">
            <div className="px-6 py-4" />
            <div className="px-6 py-4 text-muted-foreground">{t.oldLabel}</div>
            <div className="flex items-center gap-2 bg-brand-soft px-6 py-4">
              <LogoMark className="size-5" />
              {t.newLabel}
            </div>
          </div>
          <ul>
            {t.rows.map((row, index) => (
              <motion.li
                key={row.topic}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.05 }}
                className="grid gap-3 border-b p-5 last:border-b-0 md:grid-cols-[1fr_1.3fr_1.3fr] md:gap-0 md:p-0"
              >
                <div className="font-semibold md:px-6 md:py-5">{row.topic}</div>
                <div className="flex items-start gap-2.5 text-muted-foreground md:px-6 md:py-5">
                  <XIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
                  {row.old}
                </div>
                <div className="flex items-start gap-2.5 font-medium md:bg-brand-soft md:px-6 md:py-5">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-brand-strong dark:text-brand" />
                  {row.new}
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

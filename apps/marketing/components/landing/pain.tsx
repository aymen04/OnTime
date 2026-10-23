'use client';

import * as React from 'react';
import {
  CalendarXIcon,
  FileSpreadsheetIcon,
  MessageSquareWarningIcon,
  ReceiptIcon
} from 'lucide-react';
import { motion } from 'motion/react';

import { cn } from '@workspace/ui/lib/utils';

import { SectionHeading } from '~/components/landing/section-heading';
import { type LandingDictionary } from '~/lib/i18n/landing';

const ICONS = [
  FileSpreadsheetIcon,
  MessageSquareWarningIcon,
  CalendarXIcon,
  ReceiptIcon
];

const AUTHOR_COLORS: Record<string, string> = {
  Tom: 'text-sky-600 dark:text-sky-300',
  Sofia: 'text-violet-600 dark:text-violet-300',
  Karim: 'text-orange-600 dark:text-orange-300',
  Léa: 'text-pink-600 dark:text-pink-300'
};

export type PainProps = {
  t: LandingDictionary['pain'];
};

export function Pain({ t }: PainProps): React.JSX.Element {
  const lastIndex = t.chat.messages.length - 1;
  return (
    <section className="overflow-hidden border-y bg-muted/30 py-24 md:py-32">
      <div className="container grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading
            align="left"
            eyebrow={t.eyebrow}
            title={t.title}
            description={t.description}
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {t.items.map((item, index) => {
              const Icon = ICONS[index % ICONS.length];
              return (
                <motion.li
                  key={item.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  className="flex flex-col gap-2"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.body}</p>
                </motion.li>
              );
            })}
          </ul>
        </div>

        <div className="relative isolate mx-auto w-full max-w-md">
          <div
            aria-hidden="true"
            className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-red-500/10 blur-3xl"
          />
          <div className="overflow-hidden rounded-3xl border bg-background shadow-xl">
            <div className="flex items-center gap-3 border-b px-5 py-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-orange-100 text-lg dark:bg-orange-400/15">
                🍳
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">{t.chat.group}</div>
                <div className="text-xs text-muted-foreground">
                  {t.chat.members}
                </div>
              </div>
              <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                47
              </span>
            </div>
            <div className="flex flex-col gap-3 bg-muted/40 px-4 py-5">
              {t.chat.messages.map((message, index) => {
                const own = index === lastIndex;
                return (
                  <motion.div
                    key={message.time}
                    initial={{ opacity: 0, y: 14, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ delay: 0.2 + index * 0.35, duration: 0.35 }}
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-xs',
                      own
                        ? 'self-end rounded-br-md bg-brand text-brand-foreground'
                        : 'self-start rounded-bl-md bg-background'
                    )}
                  >
                    {!own && (
                      <div
                        className={cn(
                          'text-xs font-semibold',
                          AUTHOR_COLORS[message.author]
                        )}
                      >
                        {message.author}
                      </div>
                    )}
                    <p>{message.text}</p>
                    <div
                      className={cn(
                        'mt-0.5 text-right text-[10px]',
                        own
                          ? 'text-brand-foreground/60'
                          : 'text-muted-foreground'
                      )}
                    >
                      {message.time}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

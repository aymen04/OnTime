import * as React from 'react';
import Link from 'next/link';

import { routes } from '@workspace/routes';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@workspace/ui/components/accordion';

import { SectionHeading } from '~/components/landing/section-heading';
import { type LandingDictionary } from '~/lib/i18n/landing';

export type LandingFaqProps = {
  t: LandingDictionary['faq'];
};

export function LandingFaq({ t }: LandingFaqProps): React.JSX.Element {
  return (
    <section
      id="faq"
      className="scroll-mt-20 border-t py-24 md:py-32"
    >
      <div className="container grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <div>
          <SectionHeading
            align="left"
            eyebrow={t.eyebrow}
            title={t.title}
            description={t.description}
          />
          <p className="mt-6 text-muted-foreground">
            {t.contactLead}{' '}
            <Link
              href={routes.marketing.Contact}
              className="font-medium text-foreground underline decoration-brand decoration-2 underline-offset-4"
            >
              {t.contactLink}
            </Link>
          </p>
        </div>
        <Accordion
          type="single"
          collapsible
          defaultValue="item-0"
          className="w-full"
        >
          {t.items.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`item-${index}`}
            >
              <AccordionTrigger className="py-5 text-left text-base font-semibold">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-base text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

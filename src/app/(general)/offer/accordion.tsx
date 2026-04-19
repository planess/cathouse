import { ChevronIcon } from '../registry/[animalId]/components/icons';

import Section from './section';

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  title: string;
  items: AccordionItem[];
}

export function Accordion({ items, title }: AccordionProps) {
  return (
    <Section title={title}>
      <div className="space-y-4">
        {items.map(({ question, answer }, index) => (
          <details
            className="group border-b border-gray-100 dark:border-[#2d3a52] pb-4"
            key={index}
          >
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <span className="font-bold">{question}</span>
              <span className="transition-transform group-open:rotate-180 text-slate-500 duration-200 size-5">
                <ChevronIcon />
              </span>
            </summary>

            <p className="mt-3 text-sm text-[#49659c] dark:text-[#a1b2d3]">
              {answer}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}

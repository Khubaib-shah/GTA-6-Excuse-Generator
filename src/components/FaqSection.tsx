import { ChevronDown } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

const FAQ_ITEMS = [
  {
    question: 'How does the GTA 6 Hinglish Sick Day Excuse Generator work?',
    answer:
      'Pick your persona (Student, Corporate, or Job Holder), choose WhatsApp, Email, or Telegram, select Casual, Professional, or GTA 6 Meme mode, optionally type your raw reason, and click Generate Excuse for an instant ready-to-send Hinglish message.',
  },
  {
    question:
      'Can I generate a serious office sick leave email without any gaming references?',
    answer:
      'Yes. Switching Expression to Professional mode automatically strips all emojis, removes gaming or GTA references, and rewrites your context into a clean, believable leave email with a proper subject line.',
  },
  {
    question: 'Which messaging apps and formats are supported?',
    answer:
      'Sick Day VI formats messages natively for WhatsApp chat bubbles, formal Email drafts with a dedicated Subject line, and Telegram messages with bold emphasis spans.',
  },
  {
    question: 'Can I export my generated excuse as a shareable image?',
    answer:
      'Yes. Click Share or Preview Share Card to render a high-resolution 1080px Leonida Sunset PNG postcard that you can download or share directly to WhatsApp Status, Instagram Stories, and group chats.',
  },
] as const;

export function FaqSection() {
  return (
    <ScrollReveal>
      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="mx-auto w-full max-w-6xl scroll-mt-20 px-3.5 pt-10 pb-4 sm:px-6 sm:pt-12"
      >
        <div className="border-t border-white/10 pt-10 sm:pt-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFB0C4]">
            QUICK ANSWERS
          </p>
          <h2
            id="faq-heading"
            style={{ fontFamily: 'var(--font-display)' }}
            className="mt-1 text-[clamp(1.7rem,5.2vw,2.4rem)] font-extrabold leading-[1.08] tracking-[-0.025em] text-white"
          >
            Frequently Asked Questions
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-white/10 bg-[#1A1528] p-4 transition-colors duration-150 open:border-[#FFB0C4]/45 sm:p-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFB0C4] sm:text-[15px]">
                  <span>{item.question}</span>
                  <ChevronDown
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-[#FFB0C4] transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-relaxed text-white/75 sm:text-sm">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}

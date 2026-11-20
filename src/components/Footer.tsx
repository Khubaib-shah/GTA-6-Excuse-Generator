import { ScrollReveal } from './ScrollReveal';

export function Footer() {
  return (
    <ScrollReveal>
      <footer className="mx-auto w-full max-w-6xl px-4 pt-10 pb-12 sm:px-6">
        {/* AdSense Footer Placeholder Slot */}
        <div
          id="ad-slot-footer"
          aria-label="Footer advertisement slot"
          className="mb-8 flex min-h-[84px] w-full items-center justify-center rounded-xl border border-dashed border-white/14 bg-[#1A1528]/60 px-4 text-center text-xs text-white/50"
        >
          Advertisement space
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-center text-xs text-white/62 sm:flex-row sm:text-left">
          <p>Sirf fun ke liye, apni zimmedari khud lena.</p>
          <p>
            Banaya hai{' '}
            <a
              href="https://thekhubaib.me"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white underline decoration-[#FFB0C4]/80 underline-offset-4 transition-colors duration-150 hover:text-[#FFB0C4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB0C4]"
            >
              thekhubaib.me
            </a>
          </p>
        </div>
      </footer>
    </ScrollReveal>
  );
}

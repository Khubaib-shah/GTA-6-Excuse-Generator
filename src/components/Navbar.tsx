import { useEffect, useState } from 'react';

interface NavbarProps {
  onStartClick: () => void;
  onNavigateSection: (sectionId?: string) => void;
}

export function Navbar({ onStartClick, onNavigateSection }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onScroll = () => {
      setScrolled(window.scrollY > 36);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 h-16 w-full transition-colors duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-[#110E1A]/90 backdrop-blur-md'
          : 'border-b border-transparent bg-gradient-to-b from-[#1A1026]/55 to-transparent'
      }`}
    >
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between gap-3 px-4 sm:gap-8 sm:px-6">
        {/* Zone 1: Flipped mascot logo + editorial brand wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigateSection();
          }}
          style={{ fontFamily: 'var(--font-display)' }}
          className="group inline-flex items-center gap-2.5 text-lg font-extrabold tracking-[0.03em] text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB0C4] sm:gap-3 sm:text-xl"
        >
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FAF7F4] ring-1 ring-[#FFB0C4]/60 shadow-[0_4px_14px_rgba(17,14,26,0.45)] transition-transform duration-200 group-hover:scale-105 sm:h-10 sm:w-10">
            <img
              src="/assets/aistudio/gta-v1-logo_c43a42aa.png"
              alt="Sick Day VI mascot logo"
              width={40}
              height={40}
              className="h-full w-full -scale-x-100 object-cover"
            />
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span>SICK DAY</span>
            <span className="text-[#FFB0C4]">VI</span>
          </span>
        </a>

        {/* Zone 2: Clean uppercase editorial navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.14em] text-white/85 md:flex"
        >
          <a
            href="/#generator"
            onClick={(e) => {
              e.preventDefault();
              onNavigateSection('generator');
            }}
            className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#FFB0C4] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFB0C4]"
          >
            Generator
          </a>
          <a
            href="/#modes"
            onClick={(e) => {
              e.preventDefault();
              onNavigateSection('modes');
            }}
            className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#FFB0C4] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFB0C4]"
          >
            Modes
          </a>
          <a
            href="/#share-card"
            onClick={(e) => {
              e.preventDefault();
              onNavigateSection('share-card');
            }}
            className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#FFB0C4] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFB0C4]"
          >
            Postcard
          </a>
        </nav>

        {/* Zone 3: Signature transparent glass-outline pill CTA */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onStartClick}
            className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-white/45 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md whitespace-nowrap shrink-0 transition-colors duration-150 hover:border-white/75 hover:bg-white/20 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB0C4] cursor-pointer sm:px-5 sm:text-sm"
          >
            Make Excuse
          </button>
        </div>
      </div>
    </header>
  );
}

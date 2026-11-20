import { useEffect, useState } from 'react';

interface NavbarProps {
  onStartClick: () => void;
}

export function Navbar({ onStartClick }: NavbarProps) {
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
        {/* Zone 1: Minimal crisp white editorial brand mark */}
        <a
          href="#top"
          style={{ fontFamily: 'var(--font-display)' }}
          className="inline-flex items-center gap-1.5 text-lg font-extrabold tracking-[0.03em] text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB0C4] sm:text-xl"
        >
          <span>SICK DAY</span>
          <span className="text-[#FFB0C4]">VI</span>
        </a>

        {/* Zone 2: Clean uppercase editorial navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.14em] text-white/85 md:flex"
        >
          <a
            href="#generator"
            className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#FFB0C4] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFB0C4]"
          >
            Generator
          </a>
          <a
            href="#modes"
            className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#FFB0C4] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFB0C4]"
          >
            Modes
          </a>
          <a
            href="#share-card"
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

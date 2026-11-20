import { useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import heroSunsetArt from '../assets/images/vice_sunset_hero_1795131903658.jpg';
import { HERO_MARQUEE_CONTEXTS } from '../types/excuse';
import { ViceEmblem } from './ViceEmblem';

interface ViceHeroProps {
  onJumpToGenerator: () => void;
  onJumpToModes: () => void;
  onSelectContext: (contextText: string) => void;
}

/**
 * Full-bleed Leonida Sunset Hero (min-h-[100svh]):
 * - Original painterly coastal sunset artwork with slow atmospheric drift + smooth inertia parallax
 * - Lower-left editorial lockup (original palm-filled VI emblem + bold Outfit headline + signature blush-pink & glass pill CTAs)
 * - Left-to-right funny short-context marquee anchored cleanly at the bottom with downward scroll cue
 */
export function ViceHero({
  onJumpToGenerator,
  onJumpToModes,
  onSelectContext,
}: ViceHeroProps) {
  const artLayerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let targetY = Math.min(window.scrollY, 960);
    let currentY = targetY;
    let rafId = 0;

    const applyParallax = (y: number) => {
      const progress = Math.min(y / 860, 1);

      if (artLayerRef.current) {
        const bgY = (y * 0.36).toFixed(2);
        const bgScale = (1 + progress * 0.08).toFixed(4);
        artLayerRef.current.style.transform = `translate3d(0, ${bgY}px, 0) scale(${bgScale})`;
      }

      if (contentRef.current) {
        const contentY = (-y * 0.16).toFixed(2);
        const contentOpacity = Math.max(0.45, 1 - progress * 0.55).toFixed(3);
        contentRef.current.style.transform = `translate3d(0, ${contentY}px, 0)`;
        contentRef.current.style.opacity = contentOpacity;
      }
    };

    const tick = () => {
      const delta = targetY - currentY;
      if (Math.abs(delta) < 0.25) {
        currentY = targetY;
        applyParallax(currentY);
        rafId = 0;
        return;
      }
      currentY += delta * 0.11;
      applyParallax(currentY);
      rafId = window.requestAnimationFrame(tick);
    };

    const handleScroll = () => {
      targetY = Math.min(window.scrollY, 960);
      if (!rafId) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    applyParallax(currentY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      id="top"
      data-testid="vice-hero"
      aria-label="Sick Day VI Leonida Sunset Hero"
      className="leonida-sunset-fallback relative isolate flex min-h-[100svh] w-full flex-col justify-between overflow-hidden pt-16"
    >
      {/* Full-bleed Painterly Leonida Sunset Artwork with inertia parallax & gentle Ken Burns drift */}
      <div
        ref={artLayerRef}
        data-testid="hero-parallax-art"
        aria-hidden="true"
        style={{ transform: 'translate3d(0, 0px, 0) scale(1)' }}
        className="pointer-events-none absolute inset-0 -z-20 will-change-transform"
      >
        <img
          src={heroSunsetArt}
          alt=""
          referrerPolicy="no-referrer"
          className="leonida-hero-drift h-full w-full object-cover object-center"
        />
      </div>

      {/* Measured multi-stop editorial scrim so sky stays vivid while lower-left lockup & navbar read crisply */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(24,14,38,0.42) 0%, rgba(28,16,44,0.14) 36%, rgba(17,14,26,0.62) 72%, #110E1A 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 75% 65% at 24% 76%, rgba(17,14,26,0.72) 0%, rgba(17,14,26,0.28) 55%, transparent 100%)',
        }}
      />

      {/* Spacer allowing the pastel coastal sunset art to breathe in upper viewport */}
      <div className="flex-1 min-h-[1rem] sm:min-h-[7rem]" aria-hidden="true" />

      {/* Lower-Left Editorial Lockup matching GTA VI showcase proportions */}
      <div
        ref={contentRef}
        data-testid="hero-parallax-content"
        className="mx-auto w-full max-w-6xl px-4 pb-5 pt-3 will-change-transform sm:px-6 sm:pb-12 sm:pt-6"
      >
        <div className="flex flex-col items-start gap-3.5 sm:gap-5 md:flex-row md:items-end md:gap-8">
          {/* Original palm-silhouetted VI Emblem */}
          <ViceEmblem className="h-16 w-auto shrink-0 drop-shadow-[0_12px_28px_rgba(17,14,26,0.65)] sm:h-28 md:h-36" />

          <div className="min-w-0 max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFB0C4] sm:text-sm">
              SICK DAY VI: LAUNCH DAY EDITION
            </p>

            <h1
              style={{ fontFamily: 'var(--font-display)' }}
              className="mt-1.5 text-[clamp(1.95rem,6.2vw,4.35rem)] font-extrabold leading-[1.03] tracking-[-0.025em] text-white [text-wrap:balance] drop-shadow-[0_4px_20px_rgba(17,14,26,0.5)] sm:mt-2"
            >
              Aaj Office Nahi, Vice City Jaana Hai
            </h1>

            <p className="mt-2.5 max-w-xl text-xs leading-relaxed text-white/88 sm:mt-3.5 sm:text-base sm:leading-7">
              12 saal wait kiya hai, aaj chhutti banti hai. Apna asli scene likh do.
              WhatsApp, Email, ya Telegram ke liye believable Hinglish bahana ya
              full GTA 6 meme excuse 2 taps mein ready.
            </p>

            {/* Iconic Leonida Twin Pill CTA Bar */}
            <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:mt-6 sm:gap-3.5">
              <button
                type="button"
                onClick={onJumpToGenerator}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#FFB0C4] px-6 py-2.5 text-sm font-bold text-[#110E1A] whitespace-nowrap shadow-[0_8px_28px_rgba(255,176,196,0.28)] transition-all duration-150 hover:bg-[#FFC5D4] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer sm:min-h-[48px] sm:px-8 sm:py-3 sm:text-base"
              >
                Generate Excuse
              </button>

              <button
                type="button"
                onClick={onJumpToModes}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/45 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md whitespace-nowrap transition-colors duration-150 hover:border-white/75 hover:bg-white/18 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB0C4] cursor-pointer sm:min-h-[48px] sm:px-7 sm:py-3 sm:text-base"
              >
                Explore Modes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Dock: Left-to-Right Funny Short Context Marquee + Scroll Chevron */}
      <div className="relative z-10 w-full">
        <div
          data-testid="hero-marquee"
          aria-label="Funny excuse context ticker"
          className="vice-marquee-container w-full border-t border-white/12 bg-[#110E1A]/82 py-3 backdrop-blur-md"
        >
          <div className="vice-marquee-mask w-full overflow-hidden">
            <div data-testid="hero-marquee-track" className="vice-marquee-track">
              {[0, 1].map((copyIndex) => (
                <div
                  key={copyIndex}
                  aria-hidden={copyIndex === 1}
                  className="flex shrink-0 items-center"
                >
                  {HERO_MARQUEE_CONTEXTS.map((line, itemIndex) => (
                    <div
                      key={`${copyIndex}-${itemIndex}`}
                      className="flex shrink-0 items-center"
                    >
                      <button
                        type="button"
                        tabIndex={copyIndex === 1 ? -1 : 0}
                        onClick={() => onSelectContext(line)}
                        className="px-4 py-1 text-xs font-medium tracking-wide text-white/88 whitespace-nowrap transition-colors duration-150 hover:text-[#FFB0C4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB0C4] cursor-pointer sm:px-5 sm:text-sm"
                      >
                        &ldquo;{line}&rdquo;
                      </button>
                      <span
                        aria-hidden="true"
                        className="select-none text-xs font-bold text-[#FFB0C4]/70"
                      >
                        /
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center bg-[#110E1A] py-2">
          <button
            type="button"
            onClick={onJumpToGenerator}
            aria-label="Scroll to Excuse Generator"
            className="leonida-chevron-float inline-flex h-8 w-10 items-center justify-center rounded-full text-[#FFB0C4]/85 transition-colors hover:text-[#FFB0C4] focus-visible:outline-2 focus-visible:outline-[#FFB0C4] cursor-pointer"
          >
            <ChevronDown className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

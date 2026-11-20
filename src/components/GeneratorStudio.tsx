import { useState } from 'react';
import {
  ArrowUp,
  Check,
  Copy,
  Image as ImageIcon,
  RefreshCw,
  X,
} from 'lucide-react';
import panelControllerArt from '../assets/images/panel_controller_dusk_1795131903542.jpg';
import panelOceanDriveArt from '../assets/images/panel_ocean_drive_1795131905536.jpg';
import panelViceBayArt from '../assets/images/panel_vice_bay_1795131903720.jpg';
import heroSunsetArt from '../assets/images/vice_sunset_hero_1795131903658.jpg';
import {
  CHANNEL_OPTIONS,
  CONTEXT_STARTERS,
  EXPRESSION_OPTIONS,
  PERSONA_OPTIONS,
  type Channel,
  type ExcuseResult,
  type Expression,
  type Persona,
} from '../types/excuse';
import {
  formatExcuseForClipboard,
  parseTelegramSegments,
} from '../utils/excuseEngine';
import { ScrollReveal } from './ScrollReveal';

interface GeneratorStudioProps {
  persona: Persona;
  channel: Channel;
  expression: Expression;
  recipientName: string;
  context: string;
  excuse: ExcuseResult;
  isGenerating: boolean;
  isExporting: boolean;
  onPersonaChange: (persona: Persona) => void;
  onChannelChange: (channel: Channel) => void;
  onExpressionChange: (expression: Expression) => void;
  onRecipientChange: (name: string) => void;
  onContextChange: (context: string) => void;
  onGenerate: () => void;
  onShare: () => void;
}

const MODE_PANEL_ART: Record<
  Expression,
  { src: string; alt: string; subtitle: string; example: string }
> = {
  casual: {
    src: panelOceanDriveArt,
    alt: 'Ocean Drive palm boulevard at warm coastal twilight',
    subtitle: 'EVERYDAY CHILL',
    example:
      '"Bhai kal nahi aa paunga 😅 thoda personal kaam aa gaya achanak, mera side dekh lena 🙏"',
  },
  professional: {
    src: panelViceBayArt,
    alt: 'Speedboat and flamingos crossing turquoise sunset bay',
    subtitle: 'ZERO LEAK FORMAL',
    example:
      '"Hi Rahul, I won\'t be able to make it in tomorrow due to a personal matter. I\'ll catch up once I\'m back."',
  },
  meme: {
    src: panelControllerArt,
    alt: 'Balcony gaming controller and closed laptop overlooking sunset palms',
    subtitle: 'WELCOME TO VICE CITY',
    example:
      '"Boss kal office cancel samjho 😅 12 saal baad Vice City se urgent bulawa aaya hai 🎮 Parso double kaam pakka 🙏"',
  },
};

export function GeneratorStudio({
  persona,
  channel,
  expression,
  recipientName,
  context,
  excuse,
  isGenerating,
  isExporting,
  onPersonaChange,
  onChannelChange,
  onExpressionChange,
  onRecipientChange,
  onContextChange,
  onGenerate,
  onShare,
}: GeneratorStudioProps) {
  const [copied, setCopied] = useState(false);

  const activePersona =
    PERSONA_OPTIONS.find((item) => item.id === persona) ?? PERSONA_OPTIONS[1];
  const activeChannel =
    CHANNEL_OPTIONS.find((item) => item.id === excuse.channel) ??
    CHANNEL_OPTIONS[0];
  const activeExpression =
    EXPRESSION_OPTIONS.find((item) => item.id === expression) ??
    EXPRESSION_OPTIONS[0];
  const resultExpression =
    EXPRESSION_OPTIONS.find((item) => item.id === excuse.expression) ??
    EXPRESSION_OPTIONS[0];

  const handleCopy = async () => {
    const textToCopy = formatExcuseForClipboard(excuse);
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectModeFromCard = (mode: Expression) => {
    onExpressionChange(mode);
    const el = document.getElementById('generator');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleGenerateClick = () => {
    onGenerate();
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      window.setTimeout(() => {
        const previewEl = document.getElementById('excuse-preview');
        previewEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  const handleBackToControls = () => {
    const el = document.getElementById('generator');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-3.5 sm:px-6">
      {/* Main 2-Column Generator Workspace */}
      <ScrollReveal>
        <section
          id="generator"
          aria-labelledby="generator-heading"
          className="scroll-mt-20 pt-2 pb-12 sm:pb-16"
        >
          <div className="mb-6 flex flex-col justify-between gap-2 sm:mb-8 sm:flex-row sm:items-end">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFB0C4]">
                EXCUSE STUDIO
              </p>
              <h2
                id="generator-heading"
                style={{ fontFamily: 'var(--font-display)' }}
                className="mt-1 text-[clamp(1.85rem,6.5vw,2.85rem)] font-extrabold leading-[1.06] tracking-[-0.025em] text-white"
              >
                Apna Launch Day Bahana Banao
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                Persona, channel, aur expression choose karo, ya apna asli scene likh do.
              </p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#F5C08D]">
              WhatsApp / Email / Telegram
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12 lg:gap-8">
            {/* Left Column: Controls Panel */}
            <div className="min-w-0 rounded-2xl border border-white/10 bg-[#1A1528] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:p-6 lg:col-span-6">
              <div className="space-y-4 sm:space-y-5">
                {/* Persona */}
                <fieldset className="min-w-0">
                  <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/65">
                    Persona
                  </legend>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {PERSONA_OPTIONS.map((option) => {
                      const selected = persona === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => onPersonaChange(option.id)}
                          className={`flex min-h-[44px] min-w-0 items-center justify-center rounded-xl border px-1.5 py-2 text-center text-[12px] leading-tight font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB0C4] cursor-pointer sm:px-3 sm:text-sm ${
                            selected
                              ? 'border-[#FFB0C4] bg-[#FFB0C4]/16 text-white'
                              : 'border-white/10 bg-[#110E1A]/90 text-white/70 hover:border-white/25 hover:text-white'
                          }`}
                        >
                          <span className="truncate">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Channel */}
                <fieldset className="min-w-0">
                  <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/65">
                    Channel
                  </legend>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {CHANNEL_OPTIONS.map((option) => {
                      const selected = channel === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => onChannelChange(option.id)}
                          className={`flex min-h-[44px] min-w-0 items-center justify-center rounded-xl border px-1.5 py-2 text-center text-[12px] leading-tight font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB0C4] cursor-pointer sm:px-3 sm:text-sm ${
                            selected
                              ? 'border-[#FFB0C4] bg-[#FFB0C4]/16 text-white'
                              : 'border-white/10 bg-[#110E1A]/90 text-white/70 hover:border-white/25 hover:text-white'
                          }`}
                        >
                          <span className="truncate">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Expression (Casual / Professional / GTA 6 Meme) */}
                <fieldset className="min-w-0">
                  <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/65">
                    Expression
                  </legend>
                  <div className="grid grid-cols-2 gap-1.5 min-[380px]:grid-cols-3 sm:gap-2">
                    {EXPRESSION_OPTIONS.map((option) => {
                      const selected = expression === option.id;
                      const spanOnTiny =
                        option.id === 'meme'
                          ? 'col-span-2 min-[380px]:col-span-1'
                          : '';
                      return (
                        <button
                          key={option.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => onExpressionChange(option.id)}
                          className={`flex min-h-[44px] min-w-0 items-center justify-center rounded-xl border px-2 py-2 text-center text-[12px] leading-tight font-semibold whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB0C4] cursor-pointer sm:px-3 sm:text-sm ${spanOnTiny} ${
                            selected
                              ? 'border-[#F5C08D] bg-[#F5C08D]/16 text-white'
                              : 'border-white/10 bg-[#110E1A]/90 text-white/70 hover:border-white/25 hover:text-white'
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-white/62">
                    {activeExpression.description}
                  </p>
                </fieldset>

                {/* Recipient (optional) */}
                <div>
                  <label
                    htmlFor="recipient-name"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/65"
                  >
                    Recipient (optional)
                  </label>
                  <div className="relative">
                    <input
                      id="recipient-name"
                      type="text"
                      value={recipientName}
                      onChange={(e) => onRecipientChange(e.target.value)}
                      placeholder={activePersona.inputPlaceholder}
                      maxLength={40}
                      autoComplete="off"
                      className="min-h-[46px] w-full rounded-xl border border-white/12 bg-[#110E1A] px-3.5 py-2.5 pr-11 text-sm text-white placeholder:text-white/40 focus:border-[#FFB0C4] focus:outline-none"
                    />
                    {recipientName.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onRecipientChange('')}
                        aria-label="Clear recipient name"
                        className="absolute top-1/2 right-1 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-white/55 transition-colors duration-150 hover:text-white focus-visible:outline-2 focus-visible:outline-[#FFB0C4] cursor-pointer"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-white/55">
                    Khaali chhodoge toh &ldquo;{activePersona.defaultRecipient}&rdquo; use hoga.
                  </p>
                </div>

                {/* Context (optional) + 1-Tap Context Starters */}
                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <label
                      htmlFor="context-input"
                      className="text-xs font-semibold uppercase tracking-[0.12em] text-white/65"
                    >
                      Context (optional)
                    </label>
                    <span className="text-[11px] font-medium text-[#FFB0C4]">
                      Quick starters:
                    </span>
                  </div>

                  <div className="mb-2.5 flex flex-wrap gap-1.5 sm:grid sm:grid-cols-3">
                    {CONTEXT_STARTERS.map((starter) => {
                      const isActive = context.trim() === starter.text.trim();
                      return (
                        <button
                          key={starter.id}
                          type="button"
                          onClick={() => onContextChange(starter.text)}
                          className={`inline-flex min-h-[38px] flex-1 items-center justify-center rounded-full border px-3 py-1.5 text-center text-xs font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#FFB0C4] cursor-pointer ${
                            isActive
                              ? 'border-[#FFB0C4] bg-[#FFB0C4]/18 text-[#FFB0C4]'
                              : 'border-white/12 bg-[#110E1A]/85 text-white/80 hover:border-[#FFB0C4]/60 hover:text-white'
                          }`}
                        >
                          {starter.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative">
                    <textarea
                      id="context-input"
                      rows={2}
                      value={context}
                      onChange={(e) => onContextChange(e.target.value)}
                      placeholder="Apna asli scene raw likh do, jaise: kal nahi aaunga game khelna hai"
                      maxLength={300}
                      className="min-h-[78px] w-full resize-none rounded-xl border border-white/12 bg-[#110E1A] px-3.5 py-2.5 pr-11 text-sm leading-6 text-white placeholder:text-white/40 focus:border-[#FFB0C4] focus:outline-none sm:min-h-[92px]"
                    />
                    {context.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onContextChange('')}
                        aria-label="Clear context"
                        className="absolute top-1.5 right-1.5 flex h-9 w-9 items-center justify-center rounded-lg text-white/55 transition-colors duration-150 hover:text-white focus-visible:outline-2 focus-visible:outline-[#FFB0C4] cursor-pointer"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/55">
                    Jo scene likhoge, AI usko chosen expression aur channel ke hisaab se rewrite karega.
                  </p>
                </div>

                {/* Signature Pastel Blush-Pink Pill Primary CTA */}
                <button
                  type="button"
                  onClick={handleGenerateClick}
                  disabled={isGenerating}
                  aria-busy={isGenerating}
                  className="inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-[#FFB0C4] px-6 py-3 text-base font-bold text-[#110E1A] whitespace-nowrap shadow-[0_8px_24px_rgba(255,176,196,0.22)] transition-all duration-150 hover:bg-[#FFC5D4] active:scale-[0.98] disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
                >
                  {isGenerating ? 'Bahana ban raha hai...' : 'Generate Excuse'}
                </button>
              </div>
            </div>

            {/* Right Column: Live Channel Preview Panel */}
            <div
              id="excuse-preview"
              className="min-w-0 scroll-mt-20 rounded-2xl border border-white/10 bg-[#1A1528] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:p-6 lg:sticky lg:top-20 lg:col-span-6"
            >
              <div className="mb-4 flex items-center justify-between gap-2 border-b border-white/10 pb-3.5">
                <div className="min-w-0">
                  <h3
                    style={{ fontFamily: 'var(--font-display)' }}
                    className="text-lg font-bold tracking-[-0.015em] text-white"
                  >
                    Aapka Message Ready Hai
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-white/62">
                    {activePersona.label} / {activeChannel.label} / {resultExpression.label}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={handleBackToControls}
                    className="inline-flex min-h-[34px] items-center gap-1 rounded-full border border-white/16 bg-[#110E1A] px-3 py-1 text-xs font-medium text-white/85 transition-colors duration-150 hover:border-[#FFB0C4] hover:text-[#FFB0C4] focus-visible:outline-2 focus-visible:outline-[#FFB0C4] cursor-pointer lg:hidden"
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Edit</span>
                  </button>
                  <span className="hidden text-xs font-semibold uppercase tracking-[0.1em] text-[#FFB0C4] sm:inline">
                    {excuse.channel === 'email' ? 'Email Draft' : 'Chat Preview'}
                  </span>
                </div>
              </div>

              {/* Channel-Specific Output Surface */}
              <div
                data-testid="channel-preview"
                data-channel={excuse.channel}
                data-expression={excuse.expression}
                data-loading={isGenerating ? 'true' : 'false'}
                aria-live="polite"
                className="min-h-[240px] rounded-xl border border-white/10 bg-[#110E1A]"
              >
                {isGenerating ? (
                  <div
                    className="space-y-3 p-5"
                    aria-label="Generating fresh Hinglish excuse"
                  >
                    <div className="h-3.5 w-32 animate-pulse rounded bg-white/15" />
                    <div className="h-3.5 w-full animate-pulse rounded bg-white/10" />
                    <div className="h-3.5 w-5/6 animate-pulse rounded bg-white/10" />
                    <div className="h-3.5 w-2/3 animate-pulse rounded bg-white/10" />
                  </div>
                ) : excuse.channel === 'email' ? (
                  <div className="divide-y divide-white/10 text-sm">
                    <div className="flex items-baseline gap-3 px-4 py-3">
                      <span className="w-14 shrink-0 text-xs font-medium text-white/55 sm:w-16">
                        To
                      </span>
                      <span className="min-w-0 break-words font-semibold text-white">
                        {excuse.recipientDisplay}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3 px-4 py-3">
                      <span className="w-14 shrink-0 text-xs font-medium text-white/55 sm:w-16">
                        Subject
                      </span>
                      <span
                        data-testid="excuse-subject"
                        className="min-w-0 break-words font-semibold text-[#FFB0C4]"
                      >
                        {excuse.subject}
                      </span>
                    </div>
                    <div className="p-4 sm:p-5">
                      <p
                        data-testid="excuse-message"
                        className="whitespace-pre-line break-words text-sm leading-7 text-white/95 sm:text-[15px]"
                      >
                        {excuse.message}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3 text-xs">
                      <span className="min-w-0 truncate font-semibold text-white">
                        To: {excuse.recipientDisplay}
                      </span>
                      <span className="shrink-0 font-medium text-[#D8B4E2]">
                        {excuse.channel === 'telegram' ? 'Telegram' : 'WhatsApp'}
                      </span>
                    </div>
                    <div className="p-3.5 sm:p-5">
                      <div
                        className={`rounded-2xl rounded-tl-sm border p-3.5 sm:p-4 ${
                          excuse.channel === 'whatsapp'
                            ? 'border-[#FFB0C4]/22 bg-[#231B34]'
                            : 'border-[#D8B4E2]/24 bg-[#261A38]'
                        }`}
                      >
                        <p
                          data-testid="excuse-message"
                          className="whitespace-pre-line break-words text-sm leading-7 text-white sm:text-[15px]"
                        >
                          {excuse.channel === 'telegram'
                            ? parseTelegramSegments(excuse.message).map(
                                (segment, idx) =>
                                  segment.bold ? (
                                    <strong
                                      key={idx}
                                      className="font-bold text-[#FFB0C4]"
                                    >
                                      {segment.text}
                                    </strong>
                                  ) : (
                                    <span key={idx}>{segment.text}</span>
                                  ),
                              )
                            : excuse.message}
                        </p>
                        <p className="mt-3 text-right text-[11px] text-white/50 tabular-nums">
                          {excuse.channel === 'telegram' ? '09:16' : '09:14 AM'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Pills: Copy full-width primary on mobile, balanced 3-up on sm+ */}
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`col-span-2 inline-flex min-h-[46px] min-w-0 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB0C4] cursor-pointer sm:col-span-1 ${
                    copied
                      ? 'border-[#F5C08D] bg-[#F5C08D] text-[#110E1A]'
                      : 'border-[#FFB0C4] bg-[#FFB0C4] text-[#110E1A] hover:bg-[#FFC5D4]'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onGenerate}
                  disabled={isGenerating}
                  aria-busy={isGenerating}
                  className="inline-flex min-h-[46px] min-w-0 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/8 px-3 py-2 text-sm font-semibold text-white whitespace-nowrap transition-colors duration-150 hover:border-white/55 hover:bg-white/14 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB0C4] cursor-pointer"
                >
                  <RefreshCw
                    className={`h-4 w-4 shrink-0 ${isGenerating ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                  <span>Regenerate</span>
                </button>

                <button
                  type="button"
                  onClick={onShare}
                  disabled={isExporting}
                  aria-busy={isExporting}
                  className="inline-flex min-h-[46px] min-w-0 items-center justify-center gap-2 rounded-full border border-[#FFB0C4]/50 bg-[#FFB0C4]/14 px-3 py-2 text-sm font-semibold text-white whitespace-nowrap transition-colors duration-150 hover:border-[#FFB0C4] hover:bg-[#FFB0C4]/24 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB0C4] cursor-pointer"
                >
                  <ImageIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{isExporting ? 'Saving...' : 'Share'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Framed Multi-Panel Illustrated Modes Showcase (#modes, inspired by Leonida panel grid) */}
      <ScrollReveal>
        <section
          id="modes"
          aria-labelledby="modes-heading"
          className="scroll-mt-20 border-t border-white/10 py-12 sm:py-16"
        >
          <div className="mb-6 flex flex-col justify-between gap-2 sm:mb-8 sm:flex-row sm:items-end">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFB0C4]">
                WELCOME TO LEONIDA MODES
              </p>
              <h2
                id="modes-heading"
                style={{ fontFamily: 'var(--font-display)' }}
                className="mt-1 text-[clamp(1.85rem,5.2vw,2.65rem)] font-extrabold leading-[1.06] tracking-[-0.025em] text-white [text-wrap:balance]"
              >
                Teen Modes, Har Situation Ke Liye
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/68">
              Ek hi raw context teen alag tones mein convert hota hai. Kisi bhi panel pe tap karke try karo.
            </p>
          </div>

          {/* Thick dark-gutter framed 3-panel artwork grid */}
          <div className="rounded-2xl border border-white/12 bg-[#0A0712] p-2.5 shadow-[0_24px_60px_rgba(0,0,0,0.5)] sm:p-3">
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3 sm:gap-3">
              {EXPRESSION_OPTIONS.map((mode, idx) => {
                const isCurrent = expression === mode.id;
                const art = MODE_PANEL_ART[mode.id];

                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => handleSelectModeFromCard(mode.id)}
                    className={`group relative flex min-h-[360px] min-w-0 flex-col justify-end overflow-hidden rounded-xl border text-left transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB0C4] cursor-pointer sm:min-h-[420px] ${
                      isCurrent
                        ? 'border-[#FFB0C4] ring-1 ring-[#FFB0C4]/50'
                        : 'border-white/10 hover:border-[#FFB0C4]/65'
                    }`}
                  >
                    {/* Original 4:3 Leonida illustration */}
                    <img
                      src={art.src}
                      alt={art.alt}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Deep editorial bottom scrim for effortless contrast */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(17,14,26,0.12) 0%, rgba(17,14,26,0.48) 44%, rgba(17,14,26,0.94) 78%, #110E1A 100%)',
                      }}
                    />

                    <div className="relative z-10 flex flex-col p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#FFB0C4]">
                        0{idx + 1}. {art.subtitle}
                      </p>
                      <h3
                        style={{ fontFamily: 'var(--font-display)' }}
                        className="mt-1 text-2xl font-extrabold tracking-[-0.02em] text-white"
                      >
                        {mode.label}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-white/82 sm:text-sm">
                        {mode.description}
                      </p>
                      <p className="mt-3.5 break-words border-t border-white/14 pt-3 text-xs leading-relaxed text-white/75">
                        {art.example}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Leonida Sunset Postcard Export Promo (#share-card) */}
      <ScrollReveal>
        <section
          id="share-card"
          aria-labelledby="share-card-heading"
          className="scroll-mt-20 py-4"
        >
          <div className="relative isolate overflow-hidden rounded-2xl border border-[#FFB0C4]/25 bg-[#1A1528] p-6 sm:p-10">
            <img
              src={heroSunsetArt}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-55"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background:
                  'linear-gradient(95deg, rgba(17,14,26,0.94) 0%, rgba(26,21,40,0.82) 55%, rgba(17,14,26,0.58) 100%)',
              }}
            />

            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="min-w-0 max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFB0C4]">
                  POSTCARD EXPORT
                </p>
                <h2
                  id="share-card-heading"
                  style={{ fontFamily: 'var(--font-display)' }}
                  className="mt-1 text-[clamp(1.75rem,6vw,2.6rem)] font-extrabold leading-[1.06] tracking-[-0.025em] text-white"
                >
                  Export as Leonida Sunset Postcard
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/82">
                  Apna generated excuse ek custom Leonida sunset PNG postcard mein
                  export karo, WhatsApp Status, group chats, aur Stories pe direct
                  share karne ke liye.
                </p>
              </div>
              <button
                type="button"
                onClick={onShare}
                disabled={isExporting}
                className="inline-flex min-h-[48px] w-full shrink-0 items-center justify-center rounded-full bg-[#FFB0C4] px-7 py-3 text-sm font-bold text-[#110E1A] whitespace-nowrap shadow-[0_8px_24px_rgba(255,176,196,0.25)] transition-all duration-150 hover:bg-[#FFC5D4] active:scale-[0.98] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer md:w-auto"
              >
                {isExporting ? 'Building Postcard...' : 'Preview Share Card'}
              </button>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}

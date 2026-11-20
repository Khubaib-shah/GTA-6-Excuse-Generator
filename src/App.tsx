import { useCallback, useEffect, useRef, useState } from 'react';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { GeneratorStudio } from './components/GeneratorStudio';
import { Navbar } from './components/Navbar';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { ScrollReveal } from './components/ScrollReveal';
import { ShareModal } from './components/ShareModal';
import { ViceHero } from './components/ViceHero';
import { fetchExcuseOrFallback } from './services/excuseClient';
import type {
  Channel,
  ExcuseResult,
  Expression,
  Persona,
} from './types/excuse';
import {
  generateTemplateExcuse,
  rehydrateTemplateRecipient,
} from './utils/excuseEngine';
import { isPrivacyPolicyPath, syncDocumentHead } from './utils/seoMeta';
import {
  renderShareCardPng,
  type RenderedShareCard,
} from './utils/shareCardRenderer';

export default function App() {
  const [pathname, setPathname] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/',
  );
  const [persona, setPersona] = useState<Persona>('corporate');
  const [channel, setChannel] = useState<Channel>('whatsapp');
  const [expression, setExpression] = useState<Expression>('casual');
  const [recipientName, setRecipientName] = useState<string>('');
  const [context, setContext] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [shareCard, setShareCard] = useState<RenderedShareCard | null>(null);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [excuse, setExcuse] = useState<ExcuseResult>(() =>
    generateTemplateExcuse('corporate', 'whatsapp', '', 'casual', undefined, () => 0),
  );

  const requestCounterRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const recentIdsRef = useRef<string[]>([]);

  const isPrivacyPage = isPrivacyPolicyPath(pathname);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    syncDocumentHead(document, window.location.origin, pathname);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      abortControllerRef.current?.abort();
    };
  }, []);

  const navigateToHome = useCallback(
    (sectionId?: string) => {
      if (typeof window === 'undefined') return;

      const wasPrivacy = isPrivacyPolicyPath(window.location.pathname);
      if (wasPrivacy) {
        const nextUrl = sectionId ? `/#${sectionId}` : '/';
        window.history.pushState({}, '', nextUrl);
        setPathname('/');
      }

      if (sectionId) {
        const scrollDelay = wasPrivacy ? 80 : 0;
        window.setTimeout(() => {
          const el = document.getElementById(sectionId);
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, scrollDelay);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [],
  );

  const navigateToPrivacyPolicy = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!isPrivacyPolicyPath(window.location.pathname)) {
      window.history.pushState({}, '', '/privacy-policy');
      setPathname('/privacy-policy');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const cancelInFlightRequest = useCallback(() => {
    requestCounterRef.current += 1;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsGenerating(false);
  }, []);

  const handleJumpToGenerator = useCallback(() => {
    navigateToHome('generator');
  }, [navigateToHome]);

  const handleJumpToModes = useCallback(() => {
    navigateToHome('modes');
  }, [navigateToHome]);

  const handleSelectMarqueeContext = useCallback((nextContext: string) => {
    setContext(nextContext);
    const el = document.getElementById('generator');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handlePersonaChange = useCallback(
    (nextPersona: Persona) => {
      cancelInFlightRequest();
      setPersona(nextPersona);
      setExcuse(
        generateTemplateExcuse(nextPersona, channel, recipientName, expression),
      );
    },
    [cancelInFlightRequest, channel, recipientName, expression],
  );

  const handleChannelChange = useCallback(
    (nextChannel: Channel) => {
      cancelInFlightRequest();
      setChannel(nextChannel);
      setExcuse(
        generateTemplateExcuse(persona, nextChannel, recipientName, expression),
      );
    },
    [cancelInFlightRequest, persona, recipientName, expression],
  );

  const handleExpressionChange = useCallback(
    (nextExpression: Expression) => {
      cancelInFlightRequest();
      setExpression(nextExpression);
      setExcuse(
        generateTemplateExcuse(persona, channel, recipientName, nextExpression),
      );
    },
    [cancelInFlightRequest, persona, channel, recipientName],
  );

  const handleRecipientChange = useCallback((nextName: string) => {
    setRecipientName(nextName);
    setExcuse((prev) => rehydrateTemplateRecipient(prev, nextName));
  }, []);

  const handleGenerate = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const currentRequestId = requestCounterRef.current + 1;
    requestCounterRef.current = currentRequestId;

    const excludeIds = Array.from(new Set([...recentIdsRef.current, excuse.id]));
    const hasCustomContext = context.trim().length > 0;

    if (hasCustomContext) {
      setIsGenerating(true);
    }

    try {
      const nextExcuse = await fetchExcuseOrFallback({
        persona,
        channel,
        recipientName,
        expression,
        context,
        excludeId: excludeIds,
        signal: controller.signal,
      });

      if (requestCounterRef.current === currentRequestId) {
        recentIdsRef.current = [...recentIdsRef.current.slice(-11), nextExcuse.id];
        setExcuse(nextExcuse);
      }
    } catch {
      // Aborted when user switched inputs mid-request; ignore silently
    } finally {
      if (requestCounterRef.current === currentRequestId) {
        setIsGenerating(false);
      }
    }
  }, [persona, channel, recipientName, expression, context, excuse.id]);

  const handleShare = useCallback(async () => {
    setIsExporting(true);
    try {
      const rendered = await renderShareCardPng(excuse);
      setShareCard(rendered);
      setIsShareOpen(true);
    } finally {
      setIsExporting(false);
    }
  }, [excuse]);

  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-[#110E1A] text-[#F7F4FA]">
      {/* Subtle 3.5% editorial film grain overlay */}
      <div
        aria-hidden="true"
        className="leonida-film-grain pointer-events-none fixed inset-0 z-50"
      />

      <Navbar
        onStartClick={handleJumpToGenerator}
        onNavigateSection={navigateToHome}
      />

      <main>
        {isPrivacyPage ? (
          <PrivacyPolicyPage onBackHome={navigateToHome} />
        ) : (
          <>
            <ViceHero
              onJumpToGenerator={handleJumpToGenerator}
              onJumpToModes={handleJumpToModes}
              onSelectContext={handleSelectMarqueeContext}
            />

            {/* AdSense Header Placeholder Slot */}
            <ScrollReveal>
              <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6">
                <div
                  id="ad-slot-header"
                  aria-label="Header advertisement slot"
                  className="flex min-h-[68px] w-full items-center justify-center rounded-xl border border-dashed border-white/14 bg-[#1A1528]/60 px-4 text-center text-xs text-white/50"
                >
                  Advertisement space
                </div>
              </div>
            </ScrollReveal>

            <GeneratorStudio
              persona={persona}
              channel={channel}
              expression={expression}
              recipientName={recipientName}
              context={context}
              excuse={excuse}
              isGenerating={isGenerating}
              isExporting={isExporting}
              onPersonaChange={handlePersonaChange}
              onChannelChange={handleChannelChange}
              onExpressionChange={handleExpressionChange}
              onRecipientChange={handleRecipientChange}
              onContextChange={setContext}
              onGenerate={handleGenerate}
              onShare={handleShare}
            />
            <FaqSection />
          </>
        )}
      </main>

      <Footer
        isPrivacyPage={isPrivacyPage}
        onOpenPrivacyPolicy={navigateToPrivacyPolicy}
        onGoHome={() => navigateToHome()}
      />

      <ShareModal
        isOpen={isShareOpen}
        card={shareCard}
        excuse={excuse}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}

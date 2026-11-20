import { ArrowLeft, ChevronRight, Lock, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBackHome: (sectionId?: string) => void;
}

const HIGHLIGHTS = [
  {
    icon: UserCheck,
    title: 'No Accounts or Sign-Up',
    description:
      'Use the Hinglish excuse generator right away with zero registration, login, or profile tracking.',
  },
  {
    icon: Lock,
    title: '288 Local JSON Templates',
    description:
      'Standard excuse generation runs locally in your browser without sending personal data to any server.',
  },
  {
    icon: Sparkles,
    title: 'Context-Only AI Processing',
    description:
      'Custom context text is sent to our server-side Gemini API route only when you type a personal scene.',
  },
  {
    icon: ShieldCheck,
    title: 'Browser-Only PNG Cards',
    description:
      'Leonida Sunset shareable PNG postcards are rendered locally via HTML5 Canvas and never uploaded.',
  },
] as const;

export function PrivacyPolicyPage({ onBackHome }: PrivacyPolicyPageProps) {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://gtavi.thekhubaib.me';

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: 'Privacy Policy | Sick Day VI Hinglish Excuse Generator',
        url: `${origin}/privacy-policy`,
        description:
          'Privacy policy for Sick Day VI (Chhutti 6), a free Hinglish excuse generator for believable office leave excuses and GTA 6 launch day funny excuses.',
        inLanguage: 'en',
        dateModified: '2026-11-19',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${origin}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Privacy Policy',
            item: `${origin}/privacy-policy`,
          },
        ],
      },
    ],
  };

  return (
    <article
      aria-labelledby="privacy-policy-heading"
      className="mx-auto w-full max-w-4xl px-4 pt-28 pb-12 sm:px-6 sm:pt-32 sm:pb-16"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Semantic Breadcrumb for SEO & Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-2 text-xs font-medium text-white/60"
      >
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onBackHome();
          }}
          className="transition-colors hover:text-[#FFB0C4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB0C4]"
        >
          Home
        </a>
        <ChevronRight className="h-3.5 w-3.5 text-white/35" aria-hidden="true" />
        <span aria-current="page" className="text-[#FFB0C4]">
          Privacy Policy
        </span>
      </nav>

      {/* Editorial Header */}
      <header className="border-b border-white/10 pb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFB0C4]">
          LEGAL &amp; DATA TRANSPARENCY
        </p>
        <h1
          id="privacy-policy-heading"
          style={{ fontFamily: 'var(--font-display)' }}
          className="mt-2 text-[clamp(2rem,6vw,3.25rem)] font-extrabold leading-[1.06] tracking-[-0.025em] text-white"
        >
          Privacy Policy for Sick Day VI
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
          Effective Date: <strong className="font-semibold text-white">November 19, 2026</strong>.
          This Privacy Policy explains how Sick Day VI (also known as Chhutti 6), our free
          Hinglish excuse generator for believable office leave excuses and GTA 6 launch day funny
          excuses, handles your information when you visit our website.
        </p>
      </header>

      {/* Privacy at a Glance Grid */}
      <section aria-label="Privacy summary" className="mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {HIGHLIGHTS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-[#1A1528] p-5"
            >
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFB0C4]/14 text-[#FFB0C4]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h2
                  style={{ fontFamily: 'var(--font-display)' }}
                  className="text-base font-bold text-white"
                >
                  {item.title}
                </h2>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-white/72 sm:text-sm">
                {item.description}
              </p>
            </div>
          );
        })}
      </section>

      {/* Detailed Policy Sections */}
      <div className="mt-10 space-y-8 text-sm leading-7 text-white/80 sm:text-[15px]">
        <section className="space-y-2.5">
          <h2
            style={{ fontFamily: 'var(--font-display)' }}
            className="text-xl font-bold tracking-[-0.015em] text-white sm:text-2xl"
          >
            1. Information We Do Not Collect
          </h2>
          <p>
            Sick Day VI is designed as a lightweight, zero-account web tool. You do not need to
            create an account, enter your email address, or share personal identification to create
            a WhatsApp leave text, a formal office leave excuse email, or a Telegram message. We do
            not maintain a user database and we do not store your generated messages on our servers.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2
            style={{ fontFamily: 'var(--font-display)' }}
            className="text-xl font-bold tracking-[-0.015em] text-white sm:text-2xl"
          >
            2. Local JSON Excuse Generation vs. Optional AI Context
          </h2>
          <p>
            When you use the generator without typing a custom note in the optional Context box,
            all selections (Student, Corporate, or Job Holder persona, WhatsApp, Email, or Telegram
            format, Casual, Professional, or GTA 6 Meme expression, and optional recipient name)
            are processed entirely inside your browser using our curated 288-template JSON library.
            Zero network requests are made to external AI APIs during standard template generation.
          </p>
          <p>
            If you choose to type a custom situation into the optional Context field (or pick a
            quick starter or hero ticker prompt) and click Generate Excuse, that short prompt along
            with your selected persona, channel, tone, and optional recipient name is sent over
            encrypted HTTPS to our server-side <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-[#FFB0C4]">/api/excuse</code> endpoint
            to generate a tailored Hinglish or formal office leave excuse via the Google Gemini API.
            Please avoid entering sensitive personal, medical, financial, or confidential workplace
            information into the Context box. We do not log or archive your submitted prompts in
            persistent storage.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2
            style={{ fontFamily: 'var(--font-display)' }}
            className="text-xl font-bold tracking-[-0.015em] text-white sm:text-2xl"
          >
            3. Shareable PNG Postcard Export
          </h2>
          <p>
            Our Leonida Sunset PNG postcard export runs strictly on your device using your
            browser&apos;s HTML5 Canvas API. Generated postcard images are never uploaded to our
            servers. When you click Download PNG or Share, the image is saved or shared directly
            through your device&apos;s native browser capabilities.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2
            style={{ fontFamily: 'var(--font-display)' }}
            className="text-xl font-bold tracking-[-0.015em] text-white sm:text-2xl"
          >
            4. Cookies, Log Data &amp; Google AdSense Advertising
          </h2>
          <p>
            Like most standard websites, our hosting provider (such as Vercel or Google Cloud) may
            automatically record basic server access metadata, including IP address, browser type,
            referring URL, and timestamp, solely for security, abuse prevention, and uptime
            monitoring.
          </p>
          <p>
            Sick Day VI may display third-party advertisements served by Google AdSense or partner
            ad networks. Third-party vendors, including Google, use cookies to serve ads based on a
            visitor&apos;s prior visits to this website or other websites on the internet. Google&apos;s
            use of advertising cookies enables it and its partners to serve relevant ads to users.
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-white/75">
            <li>
              You may opt out of personalized advertising at any time by visiting{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#FFB0C4] underline underline-offset-4 hover:text-[#FFC5D4]"
              >
                Google Ads Settings
              </a>
              .
            </li>
            <li>
              You can also manage third-party vendor cookies for personalized advertising through{' '}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#FFB0C4] underline underline-offset-4 hover:text-[#FFC5D4]"
              >
                aboutads.info
              </a>{' '}
              or disable cookies directly in your browser settings.
            </li>
          </ul>
        </section>

        <section className="space-y-2.5">
          <h2
            style={{ fontFamily: 'var(--font-display)' }}
            className="text-xl font-bold tracking-[-0.015em] text-white sm:text-2xl"
          >
            5. Third-Party Links &amp; Independent Parody Notice
          </h2>
          <p>
            This website may contain links to external sites, such as the creator&apos;s portfolio
            or ad-preference portals. We are not responsible for the privacy practices or content of
            external websites. Sick Day VI is an independent humor and utility project built for
            entertainment and is not affiliated with, endorsed by, or connected to Rockstar Games or
            Take-Two Interactive.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2
            style={{ fontFamily: 'var(--font-display)' }}
            className="text-xl font-bold tracking-[-0.015em] text-white sm:text-2xl"
          >
            6. Children&apos;s Privacy &amp; Your Data Rights
          </h2>
          <p>
            Sick Day VI does not knowingly collect personal information from children under 13 years
            of age. Because we do not create user accounts or persist personal profiles, there is no
            stored personal data tied to your identity on our servers. If you have questions about
            your privacy rights under GDPR, CCPA, or regional data protection laws, you may reach
            out using the contact link below.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2
            style={{ fontFamily: 'var(--font-display)' }}
            className="text-xl font-bold tracking-[-0.015em] text-white sm:text-2xl"
          >
            7. Updates &amp; Contact Information
          </h2>
          <p>
            We may update this Privacy Policy periodically to reflect new features, legal
            requirements, or advertising disclosures. Any revisions will be posted on this page with
            an updated Effective Date. For privacy inquiries, feedback, or takedown requests, please
            contact the creator at{' '}
            <a
              href="https://thekhubaib.me"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#FFB0C4] underline underline-offset-4 hover:text-[#FFC5D4]"
            >
              thekhubaib.me
            </a>
            .
          </p>
        </section>
      </div>

      {/* Internal Link CTA Back to Excuse Generator */}
      <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#FFB0C4]/25 bg-[#1A1528] p-6 sm:flex-row sm:items-center sm:p-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#F5C08D]">
            READY FOR YOUR DAY OFF?
          </p>
          <p className="mt-1 text-sm text-white/80">
            Generate a believable Hinglish office leave excuse or GTA 6 launch day funny excuse in 2
            taps.
          </p>
        </div>
        <a
          href="/#generator"
          onClick={(e) => {
            e.preventDefault();
            onBackHome('generator');
          }}
          className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-full bg-[#FFB0C4] px-6 py-2.5 text-sm font-bold text-[#110E1A] whitespace-nowrap transition-colors hover:bg-[#FFC5D4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Excuse Generator</span>
        </a>
      </div>
    </article>
  );
}

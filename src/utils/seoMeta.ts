export interface SeoMetaTag {
  attr: 'name' | 'property';
  key: string;
  content: string;
}

export interface RouteSeoMetadata {
  title: string;
  description: string;
  keywords: string;
  subject: string;
  topic: string;
}

export const SEO_TITLE =
  'Sick Day VI: Hinglish Excuse Generator for Office & GTA 6';

export const SEO_DESCRIPTION =
  'Free Hinglish excuse generator for believable office leave excuses or GTA 6 launch day funny excuses on WhatsApp, Email, and Telegram with PNG cards.';

export const SEO_KEYWORDS = [
  'Hinglish excuse generator',
  'Office leave excuse',
  'GTA 6 launch day funny excuse',
  'GTA 6 sick day excuse generator',
  'Hinglish sick leave message',
  'WhatsApp leave excuse maker',
  'office sick leave email generator',
  'college chhutti excuse Hinglish',
  'GTA VI launch day leave',
  'Sick Day VI',
  'Chhutti 6',
].join(', ');

export const PRIVACY_SEO_TITLE =
  'Privacy Policy | Sick Day VI Hinglish Excuse Generator';

export const PRIVACY_SEO_DESCRIPTION =
  'Read the Sick Day VI privacy policy covering zero-storage Hinglish excuse generation, optional Gemini AI context processing, cookies, and Google AdSense.';

export const PRIVACY_SEO_KEYWORDS = [
  'Sick Day VI privacy policy',
  'Hinglish excuse generator privacy',
  'Office leave excuse privacy policy',
  'GTA 6 launch day funny excuse app privacy',
  'no login excuse generator',
  'Google AdSense cookie policy',
  'Chhutti 6 privacy policy',
].join(', ');

export function isPrivacyPolicyPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '').toLowerCase();
  return normalized === '/privacy-policy';
}

export function getSeoMetadataForPath(pathname: string): RouteSeoMetadata {
  if (isPrivacyPolicyPath(pathname)) {
    return {
      title: PRIVACY_SEO_TITLE,
      description: PRIVACY_SEO_DESCRIPTION,
      keywords: PRIVACY_SEO_KEYWORDS,
      subject:
        'Privacy Policy for Sick Day VI Hinglish Excuse Generator and Office Leave Excuse Tool',
      topic:
        'Sick Day VI privacy policy, Hinglish excuse generator, Office leave excuse, GTA 6 launch day funny excuse',
    };
  }

  return {
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    keywords: SEO_KEYWORDS,
    subject:
      'Hinglish excuse generator for office leave excuse and GTA 6 launch day funny excuse',
    topic:
      'Hinglish excuse generator, Office leave excuse, GTA 6 launch day funny excuse',
  };
}

export function buildSeoMetaTags(origin: string, pathname: string): SeoMetaTag[] {
  const cleanOrigin = origin.replace(/\/+$/, '');
  const normalizedPath = isPrivacyPolicyPath(pathname)
    ? '/privacy-policy'
    : pathname.startsWith('/')
      ? pathname
      : `/${pathname}`;
  const canonicalUrl = `${cleanOrigin}${normalizedPath}`;
  const ogImageUrl = `${cleanOrigin}/og-image.jpg`;
  const meta = getSeoMetadataForPath(normalizedPath);

  return [
    { attr: 'name', key: 'description', content: meta.description },
    { attr: 'name', key: 'keywords', content: meta.keywords },
    { attr: 'name', key: 'subject', content: meta.subject },
    { attr: 'name', key: 'topic', content: meta.topic },
    { attr: 'name', key: 'application-name', content: 'Sick Day VI' },
    {
      attr: 'name',
      key: 'robots',
      content:
        'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    },
    { attr: 'property', key: 'og:type', content: 'website' },
    { attr: 'property', key: 'og:site_name', content: 'Sick Day VI' },
    { attr: 'property', key: 'og:url', content: canonicalUrl },
    { attr: 'property', key: 'og:title', content: meta.title },
    { attr: 'property', key: 'og:description', content: meta.description },
    { attr: 'property', key: 'og:image', content: ogImageUrl },
    { attr: 'name', key: 'twitter:card', content: 'summary_large_image' },
    { attr: 'name', key: 'twitter:title', content: meta.title },
    { attr: 'name', key: 'twitter:description', content: meta.description },
    { attr: 'name', key: 'twitter:image', content: ogImageUrl },
  ];
}

export type HeadDocument = Pick<
  Document,
  'title' | 'head' | 'querySelector' | 'createElement'
>;

export function syncDocumentHead(
  doc: HeadDocument,
  origin: string,
  pathname: string,
): void {
  const cleanOrigin = origin.replace(/\/+$/, '');
  const normalizedPath = isPrivacyPolicyPath(pathname)
    ? '/privacy-policy'
    : pathname.startsWith('/')
      ? pathname
      : `/${pathname}`;
  const canonicalUrl = `${cleanOrigin}${normalizedPath}`;
  const meta = getSeoMetadataForPath(normalizedPath);

  doc.title = meta.title;

  let canonicalEl = doc.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = doc.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    doc.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  const tags = buildSeoMetaTags(origin, normalizedPath);
  for (const tag of tags) {
    const selector = `meta[${tag.attr}="${tag.key}"]`;
    let el = doc.querySelector(selector);
    if (!el) {
      el = doc.createElement('meta');
      el.setAttribute(tag.attr, tag.key);
      doc.head.appendChild(el);
    }
    el.setAttribute('content', tag.content);
  }
}

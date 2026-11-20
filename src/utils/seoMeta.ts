export interface SeoMetaTag {
  attr: 'name' | 'property';
  key: string;
  content: string;
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

export function buildSeoMetaTags(origin: string, pathname: string): SeoMetaTag[] {
  const cleanOrigin = origin.replace(/\/+$/, '');
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const canonicalUrl = `${cleanOrigin}${normalizedPath}`;
  const ogImageUrl = `${cleanOrigin}/og-image.jpg`;

  return [
    { attr: 'name', key: 'description', content: SEO_DESCRIPTION },
    { attr: 'name', key: 'keywords', content: SEO_KEYWORDS },
    {
      attr: 'name',
      key: 'subject',
      content: 'Hinglish excuse generator for office leave excuse and GTA 6 launch day funny excuse',
    },
    {
      attr: 'name',
      key: 'topic',
      content: 'Hinglish excuse generator, Office leave excuse, GTA 6 launch day funny excuse',
    },
    { attr: 'name', key: 'application-name', content: 'Sick Day VI' },
    {
      attr: 'name',
      key: 'robots',
      content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    },
    { attr: 'property', key: 'og:type', content: 'website' },
    { attr: 'property', key: 'og:site_name', content: 'Sick Day VI' },
    { attr: 'property', key: 'og:url', content: canonicalUrl },
    { attr: 'property', key: 'og:title', content: SEO_TITLE },
    { attr: 'property', key: 'og:description', content: SEO_DESCRIPTION },
    { attr: 'property', key: 'og:image', content: ogImageUrl },
    { attr: 'name', key: 'twitter:card', content: 'summary_large_image' },
    { attr: 'name', key: 'twitter:title', content: SEO_TITLE },
    { attr: 'name', key: 'twitter:description', content: SEO_DESCRIPTION },
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
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const canonicalUrl = `${cleanOrigin}${normalizedPath}`;

  doc.title = SEO_TITLE;

  let canonicalEl = doc.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = doc.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    doc.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  const tags = buildSeoMetaTags(origin, pathname);
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

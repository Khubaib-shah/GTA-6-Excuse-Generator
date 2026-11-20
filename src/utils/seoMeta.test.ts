import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildSeoMetaTags,
  getSeoMetadataForPath,
  type HeadDocument,
  isPrivacyPolicyPath,
  PRIVACY_SEO_DESCRIPTION,
  PRIVACY_SEO_KEYWORDS,
  PRIVACY_SEO_TITLE,
  SEO_DESCRIPTION,
  SEO_KEYWORDS,
  SEO_TITLE,
  syncDocumentHead,
} from './seoMeta';

test('SEO titles and descriptions follow search snippet length guidelines and contain no em-dashes', () => {
  for (const title of [SEO_TITLE, PRIVACY_SEO_TITLE]) {
    assert.ok(
      title.length >= 30 && title.length <= 60,
      `Expected title length 30-60, got ${title.length} for "${title}"`,
    );
    assert.equal(title.includes('—'), false);
  }

  for (const desc of [SEO_DESCRIPTION, PRIVACY_SEO_DESCRIPTION]) {
    assert.ok(
      desc.length >= 120 && desc.length <= 160,
      `Expected description length 120-160, got ${desc.length} for "${desc}"`,
    );
    assert.equal(desc.includes('—'), false);
  }

  assert.equal(SEO_KEYWORDS.includes('—'), false);
  assert.equal(PRIVACY_SEO_KEYWORDS.includes('—'), false);
});

test('SEO meta tags explicitly target requested search keywords on Home and Privacy Policy routes', () => {
  const homeTags = buildSeoMetaTags('https://sickday6.thekhubaib.me', '/');
  const homeKeywords = homeTags.find(
    (t) => t.attr === 'name' && t.key === 'keywords',
  );
  const homeDesc = homeTags.find(
    (t) => t.attr === 'name' && t.key === 'description',
  );

  assert.ok(homeKeywords);
  assert.ok(homeDesc);
  assert.match(homeKeywords.content, /Hinglish excuse generator/i);
  assert.match(homeKeywords.content, /Office leave excuse/i);
  assert.match(homeKeywords.content, /GTA 6 launch day funny excuse/i);
  assert.match(homeDesc.content, /Hinglish excuse generator/i);
  assert.match(homeDesc.content, /office leave excuse/i);
  assert.match(homeDesc.content, /GTA 6 launch day funny excuse/i);

  assert.equal(isPrivacyPolicyPath('/privacy-policy'), true);
  assert.equal(isPrivacyPolicyPath('/privacy-policy/'), true);
  assert.equal(isPrivacyPolicyPath('/'), false);

  const privacyMeta = getSeoMetadataForPath('/privacy-policy');
  assert.equal(privacyMeta.title, PRIVACY_SEO_TITLE);
  assert.match(privacyMeta.keywords, /Sick Day VI privacy policy/i);
  assert.match(privacyMeta.keywords, /Hinglish excuse generator/i);
  assert.match(privacyMeta.keywords, /Office leave excuse/i);
  assert.match(privacyMeta.keywords, /GTA 6 launch day funny excuse/i);
});

test('syncDocumentHead updates cleanly across routes without creating duplicate meta tags', () => {
  interface MockEl {
    tagName: string;
    attrs: Record<string, string>;
    setAttribute(name: string, value: string): void;
  }

  const headChildren: MockEl[] = [];
  const createEl = (tagName: string): MockEl => ({
    tagName,
    attrs: {},
    setAttribute(name: string, value: string) {
      this.attrs[name] = value;
    },
  });

  const existingDesc = createEl('meta');
  existingDesc.setAttribute('name', 'description');
  existingDesc.setAttribute('content', 'old');
  headChildren.push(existingDesc);

  const existingCanonical = createEl('link');
  existingCanonical.setAttribute('rel', 'canonical');
  existingCanonical.setAttribute('href', 'https://old.example/');
  headChildren.push(existingCanonical);

  const mockDoc = {
    title: '',
    head: {
      appendChild(node: MockEl) {
        headChildren.push(node);
        return node;
      },
    },
    querySelector(selector: string): MockEl | null {
      if (selector === 'link[rel="canonical"]') {
        return (
          headChildren.find(
            (el) => el.tagName === 'link' && el.attrs.rel === 'canonical',
          ) ?? null
        );
      }
      const match = selector.match(/^meta\[(name|property)="(.+)"\]$/);
      if (!match) return null;
      const [, attr, key] = match;
      return (
        headChildren.find(
          (el) => el.tagName === 'meta' && el.attrs[attr] === key,
        ) ?? null
      );
    },
    createElement: createEl,
  };

  syncDocumentHead(
    mockDoc as unknown as HeadDocument,
    'https://sickday6.thekhubaib.me',
    '/',
  );
  const firstCount = headChildren.length;
  assert.equal(mockDoc.title, SEO_TITLE);
  assert.equal(existingCanonical.attrs.href, 'https://sickday6.thekhubaib.me/');

  // Navigating to /privacy-policy must update in-place with zero duplicate tags
  syncDocumentHead(
    mockDoc as unknown as HeadDocument,
    'https://sickday6.thekhubaib.me',
    '/privacy-policy',
  );
  assert.equal(headChildren.length, firstCount);
  assert.equal(mockDoc.title, PRIVACY_SEO_TITLE);
  assert.equal(existingDesc.attrs.content, PRIVACY_SEO_DESCRIPTION);
  assert.equal(
    existingCanonical.attrs.href,
    'https://sickday6.thekhubaib.me/privacy-policy',
  );
});

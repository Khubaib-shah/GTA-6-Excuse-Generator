import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildSeoMetaTags,
  type HeadDocument,
  SEO_DESCRIPTION,
  SEO_KEYWORDS,
  SEO_TITLE,
  syncDocumentHead,
} from './seoMeta';

test('SEO title and description follow search snippet length guidelines and contain no em-dashes', () => {
  assert.ok(
    SEO_TITLE.length >= 30 && SEO_TITLE.length <= 60,
    `Expected title length 30-60, got ${SEO_TITLE.length}`,
  );
  assert.ok(
    SEO_DESCRIPTION.length >= 120 && SEO_DESCRIPTION.length <= 160,
    `Expected description length 120-160, got ${SEO_DESCRIPTION.length}`,
  );
  assert.equal(SEO_TITLE.includes('—'), false);
  assert.equal(SEO_DESCRIPTION.includes('—'), false);
  assert.equal(SEO_KEYWORDS.includes('—'), false);
});

test('SEO meta tags explicitly target requested search keywords', () => {
  const tags = buildSeoMetaTags('https://sickday6.thekhubaib.me', '/');
  const keywordsTag = tags.find((t) => t.attr === 'name' && t.key === 'keywords');
  const descriptionTag = tags.find(
    (t) => t.attr === 'name' && t.key === 'description',
  );

  assert.ok(keywordsTag);
  assert.ok(descriptionTag);

  assert.match(keywordsTag.content, /Hinglish excuse generator/i);
  assert.match(keywordsTag.content, /Office leave excuse/i);
  assert.match(keywordsTag.content, /GTA 6 launch day funny excuse/i);

  assert.match(descriptionTag.content, /Hinglish excuse generator/i);
  assert.match(descriptionTag.content, /office leave excuse/i);
  assert.match(descriptionTag.content, /GTA 6 launch day funny excuse/i);
});

test('syncDocumentHead upserts existing tags without creating duplicates', () => {
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

  // Pre-seed two tags like index.html has
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

  // Calling a second time must be idempotent with zero duplicate nodes
  syncDocumentHead(
    mockDoc as unknown as HeadDocument,
    'https://sickday6.thekhubaib.me',
    '/',
  );

  assert.equal(headChildren.length, firstCount);
  assert.equal(mockDoc.title, SEO_TITLE);
  assert.equal(existingDesc.attrs.content, SEO_DESCRIPTION);
  assert.equal(existingCanonical.attrs.href, 'https://sickday6.thekhubaib.me/');

  const keywordsEl = headChildren.find(
    (el) => el.tagName === 'meta' && el.attrs.name === 'keywords',
  );
  assert.ok(keywordsEl);
  assert.match(keywordsEl.attrs.content, /Hinglish excuse generator/);
  assert.match(keywordsEl.attrs.content, /Office leave excuse/);
  assert.match(keywordsEl.attrs.content, /GTA 6 launch day funny excuse/);
});

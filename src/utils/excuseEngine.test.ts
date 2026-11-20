import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatExcuseForClipboard,
  generateTemplateExcuse,
  getTemplatesFor,
  parseTelegramSegments,
  rehydrateTemplateRecipient,
  sanitizeRecipientName,
} from './excuseEngine';
import { containsEmoji } from './llmParser';
import type { Channel, Expression, Persona } from '../types/excuse';

const PERSONAS: Persona[] = ['student', 'corporate', 'job_holder'];
const CHANNELS: Channel[] = ['whatsapp', 'email', 'telegram'];
const EXPRESSIONS: Expression[] = ['casual', 'professional', 'meme'];

test('casual JSON template pool has at least 12 templates for every persona + channel pair (108 minimum)', () => {
  let total = 0;
  for (const persona of PERSONAS) {
    for (const channel of CHANNELS) {
      const pool = getTemplatesFor(persona, channel, 'casual');
      assert.ok(
        pool.length >= 12,
        `Expected >= 12 casual templates for ${persona}/${channel}, got ${pool.length}`,
      );
      total += pool.length;
    }
  }
  assert.ok(total >= 108, `Expected >= 108 casual templates, got ${total}`);
});

test('professional JSON template pool has at least 10 templates per pair (90 minimum) with ZERO emojis', () => {
  let total = 0;
  for (const persona of PERSONAS) {
    for (const channel of CHANNELS) {
      const pool = getTemplatesFor(persona, channel, 'professional');
      assert.ok(
        pool.length >= 10,
        `Expected >= 10 professional templates for ${persona}/${channel}, got ${pool.length}`,
      );
      for (const tpl of pool) {
        assert.equal(
          containsEmoji(tpl.body),
          false,
          `Professional template ${tpl.id} must not contain emojis`,
        );
        if (tpl.subject) {
          assert.equal(
            containsEmoji(tpl.subject),
            false,
            `Professional subject ${tpl.id} must not contain emojis`,
          );
        }
      }
      total += pool.length;
    }
  }
  assert.ok(total >= 90, `Expected >= 90 professional templates, got ${total}`);
});

test('GTA 6 meme JSON template pool has at least 10 templates per pair (90 minimum)', () => {
  let total = 0;
  for (const persona of PERSONAS) {
    for (const channel of CHANNELS) {
      const pool = getTemplatesFor(persona, channel, 'meme');
      assert.ok(
        pool.length >= 10,
        `Expected >= 10 meme templates for ${persona}/${channel}, got ${pool.length}`,
      );
      total += pool.length;
    }
  }
  assert.ok(total >= 90, `Expected >= 90 meme templates, got ${total}`);
});

test('channel formatting invariants and zero em-dashes hold across all 288 JSON templates', () => {
  let total = 0;
  for (const expression of EXPRESSIONS) {
    for (const persona of PERSONAS) {
      for (const channel of CHANNELS) {
        const pool = getTemplatesFor(persona, channel, expression);
        total += pool.length;
        for (const tpl of pool) {
          assert.ok(
            tpl.body.includes('{name}'),
            `Template ${tpl.id} missing {name} placeholder`,
          );
          assert.equal(
            tpl.body.includes('—'),
            false,
            `Template ${tpl.id} must not contain em-dash`,
          );
          if (channel === 'email') {
            assert.ok(
              typeof tpl.subject === 'string' && tpl.subject.trim().length > 0,
              `Email template ${tpl.id} must have a non-empty subject`,
            );
            assert.equal(
              tpl.subject.includes('—'),
              false,
              `Email subject ${tpl.id} must not contain em-dash`,
            );
          } else {
            assert.equal(
              tpl.subject,
              null,
              `Non-email template ${tpl.id} must have subject = null`,
            );
          }
          if (channel === 'telegram') {
            assert.ok(
              /\*\*.+?\*\*/.test(tpl.body),
              `Telegram template ${tpl.id} should include markdown bold emphasis`,
            );
          }
        }
      }
    }
  }
  assert.ok(total >= 288, `Expected >= 288 total JSON templates, got ${total}`);
});

test('recipient name substitution uses custom name or persona default', () => {
  assert.equal(sanitizeRecipientName('  Rahul   Sir  ', 'corporate'), 'Rahul Sir');
  assert.equal(sanitizeRecipientName('   ', 'corporate'), 'Boss');
  assert.equal(sanitizeRecipientName('', 'student'), 'Sir');
  assert.equal(sanitizeRecipientName('', 'job_holder'), 'Sir');

  const excuse = generateTemplateExcuse('corporate', 'whatsapp', 'Priya', 'casual', undefined, () => 0);
  assert.equal(excuse.recipientDisplay, 'Priya');
  assert.ok(excuse.message.includes('Priya'));
  assert.equal(excuse.message.includes('{name}'), false);
});

test('generateTemplateExcuse avoids repeating excluded template IDs and cycles cleanly', () => {
  const seen: string[] = [];
  for (let i = 0; i < 10; i++) {
    const next = generateTemplateExcuse('student', 'telegram', 'Sharma Sir', 'meme', seen, () => 0);
    assert.equal(seen.includes(next.id), false, `Unexpected repeat ${next.id} on draw ${i}`);
    seen.push(next.id);
    assert.equal(next.expression, 'meme');
    assert.equal(next.channel, 'telegram');
  }
  // Once all 10 are exhausted, next draw should recycle without repeating the immediately previous ID
  const recycled = generateTemplateExcuse('student', 'telegram', 'Sharma Sir', 'meme', seen, () => 0);
  assert.notEqual(recycled.id, seen[seen.length - 1]);
});

test('rehydrateTemplateRecipient updates recipient name cleanly without changing template ID', () => {
  const initial = generateTemplateExcuse('job_holder', 'email', '', 'professional', undefined, () => 0);
  const updated = rehydrateTemplateRecipient(initial, 'Verma Ji');
  assert.equal(updated.id, initial.id);
  assert.equal(updated.recipientDisplay, 'Verma Ji');
  assert.ok(updated.message.includes('Verma Ji'));
});

test('formatExcuseForClipboard includes Subject only for email channel', () => {
  const emailExcuse = generateTemplateExcuse('corporate', 'email', 'Rahul', 'professional', undefined, () => 0);
  const emailText = formatExcuseForClipboard(emailExcuse);
  assert.ok(emailText.startsWith(`Subject: ${emailExcuse.subject}\n\n`));

  const waExcuse = generateTemplateExcuse('corporate', 'whatsapp', 'Rahul', 'casual', undefined, () => 0);
  assert.equal(formatExcuseForClipboard(waExcuse), waExcuse.message);
});

test('parseTelegramSegments splits bold markdown spans safely', () => {
  const segments = parseTelegramSegments('Boss, aaj **sir bhari** hai aur **kal fresh** aaunga.');
  assert.deepEqual(segments, [
    { text: 'Boss, aaj ', bold: false },
    { text: 'sir bhari', bold: true },
    { text: ' hai aur ', bold: false },
    { text: 'kal fresh', bold: true },
    { text: ' aaunga.', bold: false },
  ]);
});

test('hero marquee context messages are concise (4 to 9 words each)', async () => {
  const { HERO_MARQUEE_CONTEXTS } = await import('../types/excuse');
  assert.ok(
    HERO_MARQUEE_CONTEXTS.length >= 8,
    `Expected >= 8 marquee contexts, got ${HERO_MARQUEE_CONTEXTS.length}`,
  );
  for (const item of HERO_MARQUEE_CONTEXTS) {
    const wordCount = item.trim().split(/\s+/).filter(Boolean).length;
    assert.ok(
      wordCount >= 4 && wordCount <= 9,
      `Marquee message "${item}" has ${wordCount} words (expected 4-9)`,
    );
  }
});

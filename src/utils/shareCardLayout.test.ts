import test from 'node:test';
import assert from 'node:assert/strict';
import { buildShareFilename, wrapStyledLines } from './shareCardLayout';

const monoMeasure = (text: string, bold: boolean): number =>
  text.length * (bold ? 11 : 10);

test('wrapStyledLines wraps plain text within maxWidth and preserves explicit blank lines', () => {
  const lines = wrapStyledLines(
    'Boss aaj thoda sir bhari hai kal fresh aaunga\n\nDhanyavaad',
    false,
    220,
    monoMeasure,
  );

  assert.ok(lines.length >= 4);
  // Blank paragraph becomes empty line array
  assert.ok(lines.some((line) => line.length === 0));
  for (const line of lines) {
    const width = line.reduce((sum, tok) => sum + monoMeasure(tok.text, tok.bold), 0);
    assert.ok(width <= 240, `Line width ${width} exceeded expected bound`);
  }
  const reconstructed = lines
    .map((line) => line.map((t) => t.text).join(''))
    .join('\n');
  assert.ok(reconstructed.includes('Dhanyavaad'));
});

test('wrapStyledLines preserves Telegram bold flags across wrapped lines', () => {
  const lines = wrapStyledLines(
    'Sharma Sir, aaj **thoda feverish feel** ho raha hai kal **full energy** mein aaunga',
    true,
    260,
    monoMeasure,
  );

  const boldText = lines
    .flat()
    .filter((tok) => tok.bold)
    .map((tok) => tok.text)
    .join('')
    .trim();

  assert.ok(boldText.includes('thoda'));
  assert.ok(boldText.includes('feverish'));
  assert.ok(boldText.includes('full'));
  assert.ok(boldText.includes('energy'));
});

test('buildShareFilename produces clean persona and channel PNG names', () => {
  assert.equal(
    buildShareFilename('corporate', 'whatsapp'),
    'chhutti6-corporate-whatsapp.png',
  );
  assert.equal(
    buildShareFilename('job_holder', 'telegram'),
    'chhutti6-job_holder-telegram.png',
  );
  assert.equal(
    buildShareFilename('student', 'email'),
    'chhutti6-student-email.png',
  );
});

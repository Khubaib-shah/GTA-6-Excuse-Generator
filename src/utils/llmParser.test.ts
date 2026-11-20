import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSystemPrompt,
  buildUserPrompt,
  containsEmoji,
  generateExcuseWithFallback,
  parseAndValidateExcuseResponse,
} from './llmParser';

test('buildSystemPrompt includes rules for casual, professional, and GTA 6 meme expression', () => {
  const prompt = buildSystemPrompt();
  assert.ok(prompt.includes('expression=casual'));
  assert.ok(prompt.includes('expression=professional'));
  assert.ok(prompt.includes('expression=meme'));
  assert.ok(prompt.includes('ZERO emojis'));
  assert.ok(prompt.includes('Vice City'));
});

test('buildUserPrompt includes all 3 calibration examples plus live context and expression', () => {
  const prompt = buildUserPrompt(
    'corporate',
    'whatsapp',
    'Rahul',
    'meme',
    'kal nahi aaunga game khelna hai jo ukhadna hai ukhadle',
  );
  assert.ok(prompt.includes('Example 1 (professional):'));
  assert.ok(prompt.includes('Example 2 (casual):'));
  assert.ok(prompt.includes('Example 3 (meme):'));
  assert.ok(prompt.includes('expression: meme'));
  assert.ok(prompt.includes('recipient_name: "Rahul"'));
});

test('parseAndValidateExcuseResponse strips emojis and blocks gaming leaks in professional mode', () => {
  const cleanPro = parseAndValidateExcuseResponse(
    JSON.stringify({
      channel: 'email',
      subject: 'Leave request for tomorrow 😅',
      message:
        'Hi Rahul,\n\nI wanted to let you know I will not be able to make it in tomorrow due to an urgent personal matter 🙏 I will catch up once back.\n\nThanks.',
    }),
    'corporate',
    'email',
    'Rahul',
    'professional',
    'kal nahi aaunga game khelna hai jo ukhadna hai ukhadle',
  );
  assert.ok(cleanPro);
  assert.equal(containsEmoji(cleanPro.message), false);
  assert.equal(containsEmoji(cleanPro.subject ?? ''), false);

  const leakyPro = parseAndValidateExcuseResponse(
    JSON.stringify({
      channel: 'email',
      subject: 'Leave for GTA 6 launch',
      message:
        'Hi Rahul,\n\nI want to stay home and play GTA 6 in Vice City tomorrow.\n\nThanks.',
    }),
    'corporate',
    'email',
    'Rahul',
    'professional',
    'kal nahi aaunga game khelna hai jo ukhadna hai ukhadle',
  );
  assert.equal(leakyPro, null);
});

test('parseAndValidateExcuseResponse allows GTA 6 parody references and emojis in meme mode while blocking verbatim raw slang echo', () => {
  const validMeme = parseAndValidateExcuseResponse(
    JSON.stringify({
      channel: 'whatsapp',
      subject: null,
      message:
        'Boss kal office ka scene cancel samjho 😅 12 saal baad Vice City se urgent bulawa aaya hai 🎮 Parso double kaam nikaal dunga 🙏',
    }),
    'corporate',
    'whatsapp',
    'Rahul',
    'meme',
    'kal nahi aaunga game khelna hai jo ukhadna hai ukhadle',
  );
  assert.ok(validMeme);
  assert.equal(validMeme.expression, 'meme');
  assert.equal(containsEmoji(validMeme.message), true);

  const verbatimEcho = parseAndValidateExcuseResponse(
    JSON.stringify({
      channel: 'whatsapp',
      subject: null,
      message: 'Boss kal nahi aaunga game khelna hai jo ukhadna hai ukhadle 😅',
    }),
    'corporate',
    'whatsapp',
    'Rahul',
    'meme',
    'kal nahi aaunga game khelna hai jo ukhadna hai ukhadle',
  );
  assert.equal(verbatimEcho, null);
});

test('generateExcuseWithFallback skips AI completely when context is empty or whitespace', async () => {
  let aiCallCount = 0;
  const result = await generateExcuseWithFallback(
    {
      persona: 'corporate',
      channel: 'whatsapp',
      recipientName: 'Priya',
      expression: 'casual',
      context: '   ',
    },
    async () => {
      aiCallCount += 1;
      return JSON.stringify({
        channel: 'whatsapp',
        subject: null,
        message: 'Should never be called when context is empty',
      });
    },
  );

  assert.equal(aiCallCount, 0, 'AI provider must not be called when context is empty');
  assert.equal(result.source, 'template');
  assert.equal(result.persona, 'corporate');
  assert.equal(result.channel, 'whatsapp');
  assert.ok(result.message.includes('Priya'));
});

test('generateExcuseWithFallback invokes AI when custom context is provided and falls back silently on leak or failure', async () => {
  let aiCalls = 0;
  const customAi = await generateExcuseWithFallback(
    {
      persona: 'corporate',
      channel: 'email',
      recipientName: 'Rahul',
      expression: 'casual',
      context: 'gaadi puncture ho gayi aur saath mein GTA 6 launch bhi hai',
    },
    async (_p, _c, _r, _e, ctx) => {
      aiCalls += 1;
      assert.ok(ctx.includes('gaadi puncture'));
      return JSON.stringify({
        channel: 'email',
        subject: 'Running Late Today: Flat Tyre Issue',
        message:
          'Hi Rahul,\n\nSubah nikalte hi gaadi puncture ho gayi 😅 Aaj office aana mushkil lag raha hai, ghar se kaam sambhal lunga 🙏\n\nThanks',
      });
    },
  );

  assert.equal(aiCalls, 1);
  assert.equal(customAi.source, 'ai');
  assert.equal(customAi.channel, 'email');

  const proFallback = await generateExcuseWithFallback(
    {
      persona: 'corporate',
      channel: 'email',
      recipientName: 'Rahul',
      expression: 'professional',
      context: 'kal nahi aaunga game khelna hai jo ukhadna hai ukhadle',
    },
    async () =>
      JSON.stringify({
        channel: 'email',
        subject: 'Playing GTA 6 tomorrow',
        message: 'Hi Rahul, I am playing GTA 6 tomorrow on my PS5.',
      }),
  );

  assert.equal(proFallback.source, 'template');
  assert.equal(proFallback.expression, 'professional');
  assert.equal(containsEmoji(proFallback.message), false);

  const memeFallback = await generateExcuseWithFallback(
    {
      persona: 'student',
      channel: 'telegram',
      recipientName: 'Sharma Sir',
      expression: 'meme',
      context: 'controller kharab ho gaya naya lena hai',
    },
    async () => {
      throw new Error('Network error');
    },
  );

  assert.equal(memeFallback.source, 'template');
  assert.equal(memeFallback.expression, 'meme');
  assert.equal(memeFallback.channel, 'telegram');
  assert.ok(memeFallback.message.includes('Sharma Sir'));
});

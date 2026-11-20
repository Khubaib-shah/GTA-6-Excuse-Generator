import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../../api/excuse';

function createMockRes() {
  const headers: Record<string, string> = {};
  let statusCode = 0;
  let jsonBody: unknown = null;

  return {
    headers,
    get statusCode() {
      return statusCode;
    },
    get jsonBody() {
      return jsonBody;
    },
    setHeader(name: string, value: string) {
      headers[name] = value;
    },
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      jsonBody = payload;
    },
  };
}

test('Vercel /api/excuse handler rejects non-POST methods with 405', async () => {
  const res = createMockRes();
  await handler({ method: 'GET' }, res);

  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.Allow, 'POST');
  assert.equal(res.headers['Cache-Control'], 'no-store');
});

test('Vercel /api/excuse handler returns instant JSON template when context is empty', async () => {
  const res = createMockRes();
  await handler(
    {
      method: 'POST',
      body: {
        persona: 'corporate',
        channel: 'email',
        expression: 'professional',
        recipientName: 'Priya',
        context: '',
      },
    },
    res,
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['Cache-Control'], 'no-store');
  const payload = res.jsonBody as Record<string, unknown>;
  assert.equal(payload.source, 'template');
  assert.equal(payload.channel, 'email');
  assert.equal(payload.persona, 'corporate');
  assert.equal(payload.expression, 'professional');
  assert.equal(payload.recipientDisplay, 'Priya');
  assert.equal(typeof payload.subject, 'string');
  assert.equal(typeof payload.message, 'string');
});

test('Vercel /api/excuse handler parses JSON string body safely', async () => {
  const res = createMockRes();
  await handler(
    {
      method: 'POST',
      body: JSON.stringify({
        persona: 'student',
        channel: 'whatsapp',
        expression: 'meme',
        recipientName: 'Sir',
        context: '',
      }),
    },
    res,
  );

  assert.equal(res.statusCode, 200);
  const payload = res.jsonBody as Record<string, unknown>;
  assert.equal(payload.persona, 'student');
  assert.equal(payload.channel, 'whatsapp');
  assert.equal(payload.expression, 'meme');
  assert.equal(payload.subject, null);
});

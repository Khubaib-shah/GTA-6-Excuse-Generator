import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type { Channel, Expression, Persona } from './src/types/excuse';
import {
  buildSystemPrompt,
  buildUserPrompt,
  generateExcuseWithFallback,
} from './src/utils/llmParser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const GEMINI_MODEL = 'gemini-4-hydrogen';
const GEMINI_TIMEOUT_MS = 8500;

const VALID_PERSONAS: ReadonlySet<Persona> = new Set([
  'student',
  'corporate',
  'job_holder',
]);
const VALID_CHANNELS: ReadonlySet<Channel> = new Set([
  'whatsapp',
  'email',
  'telegram',
]);
const VALID_EXPRESSIONS: ReadonlySet<Expression> = new Set([
  'casual',
  'professional',
  'meme',
]);

function createGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const aiClient = createGeminiClient();

async function requestGeminiExcuse(
  persona: Persona,
  channel: Channel,
  recipientName: string,
  expression: Expression,
  context: string,
): Promise<string | null> {
  if (!aiClient) {
    return null;
  }

  const systemInstruction = buildSystemPrompt();
  const userPrompt = buildUserPrompt(
    persona,
    channel,
    recipientName,
    expression,
    context,
  );

  const timeoutPromise = new Promise<null>((_, reject) => {
    setTimeout(
      () => reject(new Error('Gemini request timeout')),
      GEMINI_TIMEOUT_MS,
    );
  });

  const generationPromise = aiClient.models
    .generateContent({
      model: GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            channel: {
              type: Type.STRING,
              enum: ['whatsapp', 'email', 'telegram'],
              description: 'The requested messaging channel.',
            },
            subject: {
              type: Type.STRING,
              nullable: true,
              description:
                'Email subject line when channel is email; null for whatsapp and telegram.',
            },
            message: {
              type: Type.STRING,
              description: 'The generated Hinglish excuse message body.',
            },
          },
          required: ['channel', 'message'],
        },
      },
    })
    .then((res) => res.text ?? null);

  return Promise.race([generationPromise, timeoutPromise]);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '32kb' }));

  app.post('/api/excuse', async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const persona: Persona = VALID_PERSONAS.has(body.persona as Persona)
      ? (body.persona as Persona)
      : 'corporate';
    const channel: Channel = VALID_CHANNELS.has(body.channel as Channel)
      ? (body.channel as Channel)
      : 'whatsapp';
    const expression: Expression = VALID_EXPRESSIONS.has(
      body.expression as Expression,
    )
      ? (body.expression as Expression)
      : 'casual';
    const recipientName =
      typeof body.recipientName === 'string' ? body.recipientName : '';
    const context =
      typeof body.context === 'string' ? body.context.slice(0, 300) : '';
    const excludeId =
      typeof body.excludeId === 'string' ? body.excludeId : undefined;

    const result = await generateExcuseWithFallback(
      { persona, channel, recipientName, expression, context, excludeId },
      requestGeminiExcuse,
    );

    res.status(200).json(result);
  });

  const resolvePublicOrigin = (req: express.Request): string => {
    const envUrl = process.env.APP_URL?.trim().replace(/\/+$/, '');
    if (envUrl) return envUrl;
    const proto = (req.get('x-forwarded-proto') || req.protocol || 'https')
      .split(',')[0]
      .trim();
    const host = req.get('x-forwarded-host') || req.get('host');
    return host ? `${proto}://${host}` : `http://localhost:${PORT}`;
  };

  app.get('/robots.txt', (req, res) => {
    const origin = resolvePublicOrigin(req);
    res
      .type('text/plain; charset=utf-8')
      .send(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`);
  });

  app.get('/sitemap.xml', (req, res) => {
    const origin = resolvePublicOrigin(req);
    const lastmod = new Date().toISOString().split('T')[0];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
    res.type('application/xml; charset=utf-8').send(xml);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

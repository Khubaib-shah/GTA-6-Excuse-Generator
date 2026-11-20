import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type {
  Channel,
  ExcuseResult,
  Expression,
  Persona,
} from '../types/excuse';
import {
  buildSystemPrompt,
  buildUserPrompt,
  generateExcuseWithFallback,
} from '../utils/llmParser';

const DEFAULT_GEMINI_MODEL = 'gemini-4-hydrogen';
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

let cachedClient: GoogleGenAI | null | undefined;
let cachedApiKey: string | undefined;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }

  if (cachedClient !== undefined && cachedApiKey === apiKey) {
    return cachedClient;
  }

  cachedApiKey = apiKey;
  cachedClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  return cachedClient;
}

async function requestGeminiExcuse(
  persona: Persona,
  channel: Channel,
  recipientName: string,
  expression: Expression,
  context: string,
): Promise<string | null> {
  const aiClient = getGeminiClient();
  if (!aiClient) {
    return null;
  }

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
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
      model,
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

/**
 * Shared request normalizer and excuse resolver used by both the Express server
 * (local dev / Cloud Run) and Vercel Serverless Functions (/api/excuse.ts).
 */
export async function resolveExcuseRequest(
  rawBody: Record<string, unknown>,
): Promise<ExcuseResult> {
  const persona: Persona = VALID_PERSONAS.has(rawBody.persona as Persona)
    ? (rawBody.persona as Persona)
    : 'corporate';
  const channel: Channel = VALID_CHANNELS.has(rawBody.channel as Channel)
    ? (rawBody.channel as Channel)
    : 'whatsapp';
  const expression: Expression = VALID_EXPRESSIONS.has(
    rawBody.expression as Expression,
  )
    ? (rawBody.expression as Expression)
    : 'casual';
  const recipientName =
    typeof rawBody.recipientName === 'string' ? rawBody.recipientName : '';
  const context =
    typeof rawBody.context === 'string' ? rawBody.context.slice(0, 300) : '';
  const excludeId =
    typeof rawBody.excludeId === 'string' ? rawBody.excludeId : undefined;

  return generateExcuseWithFallback(
    { persona, channel, recipientName, expression, context, excludeId },
    requestGeminiExcuse,
  );
}

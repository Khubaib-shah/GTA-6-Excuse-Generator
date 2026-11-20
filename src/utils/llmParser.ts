import type {
  Channel,
  ExcuseResult,
  Expression,
  Persona,
} from '../types/excuse';
import {
  generateTemplateExcuse,
  sanitizeRecipientName,
} from './excuseEngine';

const EMOJI_PATTERN = /\p{Extended_Pictographic}|\uFE0F|\u200D/gu;
const PROFESSIONAL_LEAK_PATTERN =
  /\b(gta|gta\s*6|vice\s*city|leonida|rockstar|gaming|video\s*game|game\s*khelna|khelna\s*hai|ps5|xbox|playstation|controller|ukhadna|ukhadle)\b/i;

export function stripEmojis(text: string): string {
  return text
    .replace(EMOJI_PATTERN, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

export function containsEmoji(text: string): boolean {
  return /\p{Extended_Pictographic}/u.test(text);
}

function getMaxLengthForChannel(channel: Channel): number {
  if (channel === 'email') return 600;
  return 280;
}

/**
 * 3-mode Hinglish system prompt supporting believable Casual, strict zero-emoji
 * Professional, and full GTA 6 launch-day parody Meme Mode.
 */
export function buildSystemPrompt(): string {
  return `You are a witty Hinglish copywriter who writes day-off excuse messages.

Inputs: persona (student|corporate|job_holder), channel (whatsapp|email|telegram), recipient_name (optional), context (optional, raw user text, possibly casual/slangy), expression (casual|professional|meme).

Rules:
1. If context is given, ALWAYS weave in or transform its underlying situation to fit the selected expression and channel. Never return raw slang or rude phrases verbatim.
2. Never mention gaming, GTA, Vice City, or anything implausible if expression is professional. Invent a plausible, vague cover reason instead.
3. If no context is given, invent a fitting excuse based on persona and expression.
4. expression=casual: natural spoken Hindi-Urdu-English mix common across both India and Pakistan (shared words like yaar, bhai/bro, thoda, bas, acha, shukriya/thanks, sorry yr). Avoid India-only Bollywood slang and avoid heavy formal Urdu. Believable everyday excuse with 1-3 everyday WhatsApp emojis (like 🙏😅🤒).
5. expression=professional: polished Hinglish leaning more English, ZERO emojis, no slang, respectful and plausible.
6. expression=meme: full GTA 6 launch-day parody energy in shared India/Pakistan Hinglish for friends and group chats! Playfully reference the 12-year wait, 150GB launch download, Vice City / Leonida urgent errands, or controller cramps, creatively spinning the user's context into a funny, light-hearted parody excuse with 1-3 fun emojis (🎮🌴😅🙏). Keep it witty, polite, and never offensive or rude.
7. Channel formatting rules always apply regardless of expression (WhatsApp/Telegram short 2-4 lines with subject=null; Telegram includes 2-3 **bold** spans; Email always has subject + greeting + 2-3 line body + sign-off).`;
}

export function buildUserPrompt(
  persona: Persona,
  channel: Channel,
  recipientName: string,
  expression: Expression = 'casual',
  context: string = '',
): string {
  const resolvedRecipient = sanitizeRecipientName(recipientName, persona);
  const cleanedContext = context.trim().slice(0, 300);

  const channelInstructions: Record<Channel, string> = {
    whatsapp:
      'Channel rules for WhatsApp: 2-4 short lines separated by newlines, subject MUST be null.',
    telegram:
      'Channel rules for Telegram: 2-4 short lines separated by newlines, include 2-3 **bold** phrases using double asterisks (**like this**) for emphasis, subject MUST be null.',
    email:
      'Channel rules for Email: Provide a realistic subject line in "subject". In "message", include a greeting addressing the recipient, 2-3 lines of body, and a polite sign-off.',
  };

  const strictLine: Record<Expression, string> = {
    professional:
      'STRICT: Zero emojis, zero slang, never mention gaming, GTA, or Vice City. Polished English-leaning Hinglish.',
    casual:
      'STRICT: Shared India/Pakistan casual Hinglish, believable everyday cover reason, 1-3 natural WhatsApp emojis (e.g. 🙏 😅 🤒), never echo raw slang/rude phrases verbatim.',
    meme:
      'STRICT: Full GTA 6 launch-day parody humor in shared India/Pakistan Hinglish, creatively incorporating the user context, 1-3 fun emojis (e.g. 🎮 🌴 😅), never echo rude phrases verbatim.',
  };

  return [
    'Calibration examples (match this exact style and boundary across casual, professional, and meme):',
    'Example 1 (professional):',
    'Input: context="kal nahi aaunga game khelna hai jo ukhadna hai ukhadle", expression=professional, channel=email',
    'Output: {"channel":"email","subject":"Leave request for tomorrow","message":"Hi [Name],\\n\\nI wanted to let you know I won\'t be able to make it in tomorrow due to a personal matter that needs my attention. I\'ll catch up on everything as soon as I\'m back.\\n\\nThanks for understanding."}',
    '',
    'Example 2 (casual):',
    'Input: context="kal nahi aaunga game khelna hai jo ukhadna hai ukhadle", expression=casual, channel=whatsapp',
    'Output: {"channel":"whatsapp","subject":null,"message":"Bhai kal nahi aa paunga 😅 thoda personal kaam aa gaya achanak, mera side thoda dekh lena 🙏"}',
    '',
    'Example 3 (meme):',
    'Input: context="kal nahi aaunga game khelna hai jo ukhadna hai ukhadle", expression=meme, channel=whatsapp',
    'Output: {"channel":"whatsapp","subject":null,"message":"Boss kal office ka scene cancel samjho 😅 12 saal baad Vice City se urgent bulawa aaya hai 🎮\\nParso fresh ho ke double kaam nikaal dunga, promise 🙏"}',
    '',
    'Now generate ONE fresh excuse for the following live request:',
    `persona: ${persona}`,
    `channel: ${channel}`,
    `recipient_name: "${resolvedRecipient}"`,
    `expression: ${expression}`,
    `context: ${cleanedContext ? JSON.stringify(cleanedContext) : 'null'}`,
    channelInstructions[channel],
    strictLine[expression],
    `Return strict JSON: { "channel": "${channel}", "subject": string | null, "message": string }.`,
  ].join('\n');
}

function stripCodeFences(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

/**
 * Validates and normalizes raw JSON text from Gemini into a safe ExcuseResult.
 * Enforces channel formatting rules, professional zero-emoji & anti-leak rules,
 * and ensures raw user context is never returned verbatim.
 */
export function parseAndValidateExcuseResponse(
  rawText: string,
  expectedPersona: Persona,
  expectedChannel: Channel,
  recipientName: string,
  expectedExpression: Expression = 'casual',
  rawContext: string = '',
): ExcuseResult | null {
  if (!rawText || typeof rawText !== 'string') {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFences(rawText));
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  const record = parsed as Record<string, unknown>;
  let message = typeof record.message === 'string' ? record.message.trim() : '';

  if (message.length < 15 || message.length > 900) {
    return null;
  }

  // Reject unreplaced placeholders
  if (message.includes('{name}') || message.includes('[Name]')) {
    return null;
  }

  // Reject verbatim raw context echoing
  const normalizedContext = rawContext.trim().toLowerCase();
  if (
    normalizedContext.length >= 12 &&
    message.toLowerCase().includes(normalizedContext)
  ) {
    return null;
  }

  let subject: string | null =
    typeof record.subject === 'string' ? record.subject.trim() : null;

  // Professional mode guarantees ZERO emojis and ZERO gaming/slang leakage
  if (expectedExpression === 'professional') {
    message = stripEmojis(message);
    if (subject) {
      subject = stripEmojis(subject);
    }
    if (
      PROFESSIONAL_LEAK_PATTERN.test(message) ||
      (subject && PROFESSIONAL_LEAK_PATTERN.test(subject))
    ) {
      return null;
    }
    if (message.length < 15) {
      return null;
    }
  }

  const recipientDisplay = sanitizeRecipientName(recipientName, expectedPersona);

  if (expectedChannel === 'email') {
    if (!subject || subject.length < 3 || subject.length > 140) {
      return null;
    }

    return {
      id: `ai-em-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      persona: expectedPersona,
      channel: 'email',
      expression: expectedExpression,
      subject,
      message,
      recipientDisplay,
      source: 'ai',
    };
  }

  const maxChatLength = getMaxLengthForChannel(expectedChannel) + 120;
  if (message.length > maxChatLength) {
    return null;
  }

  return {
    id: `ai-${expectedChannel.slice(0, 2)}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    persona: expectedPersona,
    channel: expectedChannel,
    expression: expectedExpression,
    subject: null,
    message,
    recipientDisplay,
    source: 'ai',
  };
}

export interface GenerateExcuseInput {
  persona: Persona;
  channel: Channel;
  recipientName?: string;
  expression?: Expression;
  context?: string;
  excludeId?: string;
}

/**
 * JSON-first server resolver:
 * - When context is empty or whitespace-only, returns directly from the local
 *   excuses.json pool without invoking the AI provider.
 * - When custom context is provided, calls the AI provider and silently falls
 *   back to the matching JSON pool on any failure, timeout, or leak violation.
 */
export async function generateExcuseWithFallback(
  input: GenerateExcuseInput,
  aiProvider: (
    persona: Persona,
    channel: Channel,
    recipientName: string,
    expression: Expression,
    context: string,
  ) => Promise<string | null>,
): Promise<ExcuseResult> {
  const recipientName = input.recipientName ?? '';
  const expression: Expression = input.expression ?? 'casual';
  const context = (input.context ?? '').trim();

  if (context.length === 0) {
    return generateTemplateExcuse(
      input.persona,
      input.channel,
      recipientName,
      expression,
      input.excludeId,
    );
  }

  try {
    const rawText = await aiProvider(
      input.persona,
      input.channel,
      recipientName,
      expression,
      context,
    );
    if (rawText) {
      const validated = parseAndValidateExcuseResponse(
        rawText,
        input.persona,
        input.channel,
        recipientName,
        expression,
        context,
      );
      if (validated) {
        return validated;
      }
    }
  } catch {
    // Silent fallback to local JSON pool
  }

  return generateTemplateExcuse(
    input.persona,
    input.channel,
    recipientName,
    expression,
    input.excludeId,
  );
}

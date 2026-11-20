import { EXCUSE_TEMPLATES } from '../data/templates';
import {
  PERSONA_OPTIONS,
  type Channel,
  type ExcuseResult,
  type ExcuseTemplate,
  type Expression,
  type Persona,
} from '../types/excuse';

export interface TextSegment {
  text: string;
  bold: boolean;
}

export function getDefaultRecipientName(persona: Persona): string {
  const found = PERSONA_OPTIONS.find((item) => item.id === persona);
  return found ? found.defaultRecipient : 'Boss';
}

export function sanitizeRecipientName(rawName: string, persona: Persona): string {
  const cleaned = rawName.trim().replace(/\s+/g, ' ').slice(0, 40);
  return cleaned.length > 0 ? cleaned : getDefaultRecipientName(persona);
}

export function applyRecipientName(
  templateText: string,
  recipientName: string,
  persona: Persona,
): string {
  const resolved = sanitizeRecipientName(recipientName, persona);
  return templateText.replaceAll('{name}', resolved);
}

export function getTemplatesFor(
  persona: Persona,
  channel: Channel,
  expression: Expression = 'casual',
): ExcuseTemplate[] {
  return EXCUSE_TEMPLATES.filter(
    (tpl) =>
      tpl.persona === persona &&
      tpl.channel === channel &&
      tpl.expression === expression,
  );
}

export function generateTemplateExcuse(
  persona: Persona,
  channel: Channel,
  recipientName: string = '',
  expression: Expression = 'casual',
  excludeId?: string | string[],
  rng: () => number = Math.random,
): ExcuseResult {
  const pool = getTemplatesFor(persona, channel, expression);
  if (pool.length === 0) {
    throw new Error(
      `No templates configured for ${persona} / ${channel} / ${expression}`,
    );
  }

  const excludedSet = new Set(
    Array.isArray(excludeId) ? excludeId : excludeId ? [excludeId] : [],
  );

  let candidates =
    excludedSet.size > 0
      ? pool.filter((tpl) => !excludedSet.has(tpl.id))
      : pool;

  if (candidates.length === 0) {
    const lastId = Array.isArray(excludeId)
      ? excludeId[excludeId.length - 1]
      : excludeId;
    candidates =
      lastId && pool.length > 1
        ? pool.filter((tpl) => tpl.id !== lastId)
        : pool;
  }

  const rawIndex = Math.floor(rng() * candidates.length);
  const safeIndex = Math.max(0, Math.min(candidates.length - 1, rawIndex));
  const chosen = candidates[safeIndex];
  const recipientDisplay = sanitizeRecipientName(recipientName, persona);

  return {
    id: chosen.id,
    persona,
    channel,
    expression,
    subject: chosen.subject,
    message: applyRecipientName(chosen.body, recipientName, persona),
    recipientDisplay,
    source: 'template',
  };
}

/**
 * Updates the recipient name inside an existing template-backed excuse
 * without rolling a brand-new random excuse while the user is typing.
 */
export function rehydrateTemplateRecipient(
  current: ExcuseResult,
  recipientName: string,
): ExcuseResult {
  const tpl = EXCUSE_TEMPLATES.find((item) => item.id === current.id);
  const recipientDisplay = sanitizeRecipientName(recipientName, current.persona);

  if (!tpl) {
    return {
      ...current,
      recipientDisplay,
    };
  }

  return {
    ...current,
    recipientDisplay,
    message: applyRecipientName(tpl.body, recipientName, current.persona),
  };
}

export function formatExcuseForClipboard(excuse: ExcuseResult): string {
  if (excuse.channel === 'email' && excuse.subject) {
    return `Subject: ${excuse.subject}\n\n${excuse.message}`;
  }
  return excuse.message;
}

/**
 * Safely parses Telegram **bold** markdown segments without using innerHTML.
 */
export function parseTelegramSegments(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        bold: false,
      });
    }
    segments.push({
      text: match[1],
      bold: true,
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      bold: false,
    });
  }

  return segments.length > 0 ? segments : [{ text, bold: false }];
}

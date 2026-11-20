import type {
  Channel,
  ExcuseResult,
  Expression,
  Persona,
} from '../types/excuse';
import { generateTemplateExcuse } from '../utils/excuseEngine';

export interface RequestExcuseParams {
  persona: Persona;
  channel: Channel;
  recipientName: string;
  expression: Expression;
  context: string;
  excludeId?: string | string[];
  signal?: AbortSignal;
}

const REQUEST_TIMEOUT_MS = 10_000;

function isValidExcusePayload(
  data: unknown,
  expectedPersona: Persona,
  expectedChannel: Channel,
  expectedExpression: Expression,
): data is ExcuseResult {
  if (!data || typeof data !== 'object') return false;
  const candidate = data as Record<string, unknown>;
  if (candidate.channel !== expectedChannel) return false;
  if (candidate.persona !== expectedPersona) return false;
  if (candidate.expression !== expectedExpression) return false;
  if (
    typeof candidate.message !== 'string' ||
    candidate.message.trim().length === 0
  ) {
    return false;
  }
  if (expectedChannel === 'email') {
    if (
      typeof candidate.subject !== 'string' ||
      candidate.subject.trim().length === 0
    ) {
      return false;
    }
  } else if (candidate.subject !== null) {
    return false;
  }
  return true;
}

/**
 * JSON-first excuse resolver:
 * - When no custom context is provided, serves instantaneously from the 288-entry
 *   local excuses.json pool with ZERO API calls.
 * - When the user provides custom context, calls server-side /api/excuse (Gemini AI)
 *   to tailor the message to that scene, silently falling back to JSON on error/timeout.
 */
export async function fetchExcuseOrFallback(
  params: RequestExcuseParams,
): Promise<ExcuseResult> {
  const { persona, channel, recipientName, expression, context, excludeId, signal } =
    params;

  const trimmedContext = context.trim();
  if (trimmedContext.length === 0) {
    return generateTemplateExcuse(
      persona,
      channel,
      recipientName,
      expression,
      excludeId,
    );
  }

  const lastExcludeId = Array.isArray(excludeId)
    ? excludeId[excludeId.length - 1]
    : excludeId;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  const onExternalAbort = () => controller.abort();
  signal?.addEventListener('abort', onExternalAbort, { once: true });

  try {
    const response = await fetch('/api/excuse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        persona,
        channel,
        recipientName,
        expression,
        context: trimmedContext,
        excludeId: lastExcludeId,
      }),
      signal: controller.signal,
    });

    if (response.ok) {
      const payload: unknown = await response.json();
      if (isValidExcusePayload(payload, persona, channel, expression)) {
        return payload;
      }
    }
  } catch (err) {
    if (signal?.aborted) {
      throw err;
    }
  } finally {
    window.clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onExternalAbort);
  }

  return generateTemplateExcuse(
    persona,
    channel,
    recipientName,
    expression,
    excludeId,
  );
}

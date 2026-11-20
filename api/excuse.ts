import { resolveExcuseRequest } from '../src/server/excuseHandler';

interface VercelLikeRequest {
  method?: string;
  body?: unknown;
}

interface VercelLikeResponse {
  setHeader(name: string, value: string): void;
  status(code: number): VercelLikeResponse;
  json(payload: unknown): void;
}

function parseRequestBody(body: unknown): Record<string, unknown> {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      const parsed: unknown = JSON.parse(body);
      return parsed && typeof parsed === 'object'
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }
  return typeof body === 'object' ? (body as Record<string, unknown>) : {};
}

export default async function handler(
  req: VercelLikeRequest,
  res: VercelLikeResponse,
): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const body = parseRequestBody(req.body);
  const result = await resolveExcuseRequest(body);
  res.status(200).json(result);
}

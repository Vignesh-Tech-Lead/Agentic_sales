import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleApiRequest } from './_backend';

export const config = { maxDuration: 10 };

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const result = await handleApiRequest(req.method ?? 'GET', req.url ?? '/api/health', (req as IncomingMessage & { body?: unknown }).body);
    Object.entries(result.headers).forEach(([key, value]) => res.setHeader(key, value));
    send(res, result.status, result.body);
  } catch (error) {
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.setHeader('cache-control', 'no-store');
    send(res, 200, {
      service: 'agentic-sales-api',
      redis: 'unavailable',
      redisLatencyMs: -1,
      redisDetail: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
      supabase: 'error: function exception',
      cacheKey: '',
      cacheTtlSeconds: 0,
    });
  }
}

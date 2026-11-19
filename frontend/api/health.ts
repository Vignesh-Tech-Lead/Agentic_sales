import { handleApiRequest } from '../server/backend';

export const config = { maxDuration: 10 };

export default async function handler(req: any, res: any) {
  try {
    const result = await handleApiRequest(req.method ?? 'GET', req.url ?? '/api/health', req.body);
    Object.entries(result.headers).forEach(([key, value]) => res.setHeader(key, value));
    res.status(result.status);
    res.send(typeof result.body === 'string' ? result.body : JSON.stringify(result.body));
  } catch (error) {
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.setHeader('cache-control', 'no-store');
    res.status(200);
    res.send(JSON.stringify({
      service: 'agentic-sales-api',
      redis: 'unavailable',
      redisLatencyMs: -1,
      redisDetail: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
      supabase: 'error: function exception',
      cacheKey: '',
      cacheTtlSeconds: 0,
    }));
  }
}

import type { IncomingMessage, ServerResponse } from 'node:http';

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  const results: Record<string, string> = {};
  for (const [name, load] of [
    ['seed', () => import('../src/lib/seed')],
    ['redis', () => import('ioredis')],
    ['supabase', () => import('@supabase/supabase-js')],
    ['backend', () => import('./_backend')],
  ] as const) {
    try {
      await load();
      results[name] = 'ok';
    } catch (error) {
      results[name] = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    }
  }
  res.statusCode = 200;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(results));
}

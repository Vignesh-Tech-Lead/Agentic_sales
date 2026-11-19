import { seed } from '../src/lib/seed';
import type { IncomingMessage, ServerResponse } from 'node:http';
export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  res.statusCode = 200;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ ok: true, modules: Object.keys(seed).length }));
}

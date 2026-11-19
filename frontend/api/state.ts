import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleApiRequest } from '../server/backend';

export const config = { maxDuration: 10 };

type VercelRequest = IncomingMessage & { body?: unknown };

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

async function readBody(req: VercelRequest): Promise<unknown> {
  if (req.body !== undefined) return req.body;
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export default async function handler(req: VercelRequest, res: ServerResponse) {
  try {
    const body = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH'
      ? await readBody(req)
      : undefined;
    const result = await handleApiRequest(req.method ?? 'GET', req.url ?? '/api/state', body);
    Object.entries(result.headers).forEach(([key, value]) => res.setHeader(key, value));
    send(res, result.status, result.body);
  } catch (error) {
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.setHeader('cache-control', 'no-store');
    send(res, 502, {
      error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
    });
  }
}

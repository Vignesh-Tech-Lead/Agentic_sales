import Redis from 'ioredis';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { seed } from '../src/lib/seed';

export type Row = Record<string, any> & { id: string };
export type DataMap = Record<string, Row[]>;

type ApiResult = {
  status: number;
  body: unknown;
  headers: Record<string, string>;
};

const CACHE_TTL_SECONDS = 180;

/** Read env at request time: Vite loads .env.local after this module is imported in dev. */
function config() {
  return {
    tenantId:
      process.env.VITE_SUPABASE_TENANT_ID ||
      process.env.SUPABASE_TENANT_ID ||
      '00000000-0000-0000-0000-000000000001',
    supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
    supabaseKey:
      process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
    redisUrl: process.env.REDIS_URL || '',
  };
}

function cacheKey() {
  return `agentic-sales:v2:${config().tenantId}:workspace-state`;
}

let cachedClient: SupabaseClient | null | undefined;
function getSupabase(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;
  const { supabaseUrl, supabaseKey } = config();
  cachedClient =
    supabaseUrl && supabaseKey
      ? createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
      : null;
  return cachedClient;
}

function json(status: number, body: unknown): ApiResult {
  return {
    status,
    body,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  };
}

/** Open a short-lived Redis connection. Serverless invocations should not leave sockets open. */
async function withRedis<T>(
  work: (client: Redis) => Promise<T>,
): Promise<{ ok: true; value: T } | { ok: false; error: string }> {
  const redisUrl = config().redisUrl;
  if (!redisUrl) return { ok: false, error: 'REDIS_URL is not configured' };

  let client: Redis | null = null;
  try {
    client = new Redis(redisUrl, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 4000,
      retryStrategy: () => null,
      ...(redisUrl.startsWith('rediss://') ? { tls: {} } : {}),
    });
    client.on('error', () => { /* handled by the await below */ });
    await client.connect();
    return { ok: true, value: await work(client) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Redis connection failed' };
  } finally {
    if (client) {
      try { client.disconnect(); } catch { /* ignore */ }
    }
  }
}

async function readCache(): Promise<DataMap | null> {
  const result = await withRedis((client) => client.get(cacheKey()));
  if (!result.ok || !result.value) return null;
  try {
    return JSON.parse(result.value) as DataMap;
  } catch {
    return null;
  }
}

async function writeCache(data: DataMap): Promise<boolean> {
  const result = await withRedis((client) =>
    client.set(cacheKey(), JSON.stringify(data), 'EX', CACHE_TTL_SECONDS),
  );
  return result.ok;
}

async function invalidateCache(): Promise<void> {
  await withRedis((client) => client.del(cacheKey()));
}

async function loadFromSupabase(): Promise<DataMap> {
  const client = getSupabase();
  if (!client) throw new Error('Supabase is not configured');

  const { data, error } = await client
    .from('workspace_records')
    .select('module, data')
    .eq('tenant_id', config().tenantId);

  if (error) throw new Error(error.message);

  const next: DataMap = {};
  (data ?? []).forEach((record) => {
    const module = String(record.module);
    const row = record.data as Row;
    if (row?.id) (next[module] ??= []).push(row);
  });

  if (Object.keys(next).length) return next;

  // Fresh project: seed once so every module has demo records.
  const payload = Object.entries(seed).flatMap(([module, records]) =>
    records.map((row) => ({ id: row.id, module, data: row, tenant_id: config().tenantId })),
  );
  const { error: seedError } = await client
    .from('workspace_records')
    .upsert(payload, { onConflict: 'id', ignoreDuplicates: true });
  if (seedError) throw new Error(seedError.message);
  return seed as DataMap;
}

async function getState() {
  const cached = await readCache();
  if (cached && Object.keys(cached).length) {
    return { data: cached, source: 'redis', cacheTtlSeconds: CACHE_TTL_SECONDS };
  }

  const data = await loadFromSupabase();
  const cachedWrite = await writeCache(data);
  return {
    data,
    source: cachedWrite ? 'supabase' : 'supabase-no-cache',
    cacheTtlSeconds: CACHE_TTL_SECONDS,
  };
}

type Mutation = {
  action: 'insert' | 'update' | 'delete';
  module: string;
  id: string;
  row?: Row;
  patch?: Partial<Row>;
};

function validName(value: unknown): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9-]{1,60}$/.test(value);
}

async function mutate(input: Partial<Mutation>) {
  const client = getSupabase();
  if (!client) throw new Error('Supabase is not configured');
  const { action, module, id } = input;
  if (!validName(module) || !validName(id)) throw new Error('Invalid module or record id');
  if (!action || !['insert', 'update', 'delete'].includes(action)) {
    throw new Error('Unsupported action');
  }

  const tenantId = config().tenantId;

  if (action === 'insert') {
    if (!input.row?.id) throw new Error('A row with an id is required');
    const { error } = await client.from('workspace_records').insert({
      id: input.row.id,
      module,
      data: input.row,
      tenant_id: tenantId,
    });
    if (error) throw new Error(error.message);
  }

  if (action === 'update') {
    if (!input.patch || typeof input.patch !== 'object') throw new Error('A patch is required');
    const { data: existing, error: readError } = await client
      .from('workspace_records')
      .select('data')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (readError) throw new Error(readError.message);

    const merged: Row = { ...((existing?.data as Row) ?? { id }), ...input.patch, id };
    const { error } = await client
      .from('workspace_records')
      .update({ data: merged, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', tenantId);
    if (error) throw new Error(error.message);
  }

  if (action === 'delete') {
    const { error } = await client
      .from('workspace_records')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    if (error) throw new Error(error.message);
  }

  await invalidateCache();
  return { ok: true, action, module, id, cacheInvalidated: true };
}

async function health() {
  const started = Date.now();
  const redis = await withRedis((client) => client.ping());
  const redisLatencyMs = Date.now() - started;

  const client = getSupabase();
  let supabaseStatus = 'unavailable';
  if (client) {
    const { error } = await client.from('workspace_records').select('id').limit(1);
    supabaseStatus = error ? `error: ${error.message}` : 'connected';
  }

  return json(200, {
    service: 'agentic-sales-api',
    redis: redis.ok && redis.value?.toUpperCase() === 'PONG' ? 'connected' : 'unavailable',
    redisLatencyMs,
    redisDetail: redis.ok ? undefined : redis.error,
    supabase: supabaseStatus,
    cacheKey: cacheKey(),
    cacheTtlSeconds: CACHE_TTL_SECONDS,
  });
}

async function parseBody(body: unknown): Promise<Partial<Mutation>> {
  if (!body) return {};
  if (typeof body === 'string') {
    try { return JSON.parse(body) as Partial<Mutation>; } catch { return {}; }
  }
  return body as Partial<Mutation>;
}

/** Shared by Vercel serverless functions and the Vite dev middleware. */
export async function handleApiRequest(
  method: string,
  url: string,
  rawBody?: unknown,
): Promise<ApiResult> {
  const path = new URL(url || '/', 'http://localhost').pathname.replace(/\/$/, '') || '/';

  if (method === 'OPTIONS') {
    return {
      status: 204,
      body: '',
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,POST,OPTIONS',
        'access-control-allow-headers': 'content-type',
      },
    };
  }

  if (path === '/api/health' && method === 'GET') {
    return health();
  }

  if (path === '/api/state') {
    if (method === 'GET') {
      try {
        return json(200, await getState());
      } catch (error) {
        return json(502, { error: error instanceof Error ? error.message : 'State load failed' });
      }
    }

    if (method === 'POST') {
      try {
        return json(200, await mutate(await parseBody(rawBody)));
      } catch (error) {
        return json(400, { error: error instanceof Error ? error.message : 'Mutation failed' });
      }
    }
  }

  return json(404, { error: 'Not found' });
}

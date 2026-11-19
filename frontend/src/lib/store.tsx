import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { seed } from './seed';
import { isSupabaseConfigured, supabase, TENANT_ID } from './supabase';
import type { Row, Toast } from './types';
import { uid } from './format';

type DataMap = Record<string, Row[]>;
type CacheSource = 'redis' | 'supabase' | 'local';

interface StoreValue {
  data: DataMap;
  get: (key: string) => Row[];
  add: (key: string, row: Row) => void;
  update: (key: string, id: string, patch: Partial<Row>) => void;
  remove: (key: string, id: string) => void;
  toasts: Toast[];
  notify: (title: string, message?: string, tone?: Toast['tone']) => void;
  dismiss: (id: number) => void;
  role: string;
  setRole: (role: string) => void;
  tenant: string;
  backend: 'supabase' | 'local';
  cache: CacheSource;
  loading: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreValue | null>(null);
const STORAGE_KEY = 'agentic-sales-ui-v1';

function localData(): DataMap {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length) return { ...seed, ...parsed };
    }
  } catch { /* fall back to seed */ }
  return seed;
}

const emptyMap = (): DataMap => Object.fromEntries(Object.keys(seed).map((key) => [key, []]));

/** Fetch through the Vercel API, which reads the Redis cache before Supabase. */
async function apiState(): Promise<{ data: DataMap; source: CacheSource } | null> {
  const response = await fetch('/api/state', { headers: { accept: 'application/json' }, cache: 'no-store' });
  if (!response.ok) throw new Error(`API returned ${response.status}`);
  const payload = await response.json();
  if (!payload?.data || typeof payload.data !== 'object') return null;
  return {
    data: payload.data as DataMap,
    source: payload.source === 'redis' ? 'redis' : 'supabase',
  };
}

async function apiMutate(payload: Record<string, unknown>): Promise<boolean> {
  try {
    const response = await fetch('/api/state', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DataMap>(isSupabaseConfigured ? seed : localData);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [role, setRole] = useState('Sales Manager');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [cache, setCache] = useState<CacheSource>('local');

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const notify = useCallback((title: string, message?: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, title, message, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4800);
  }, []);

  // API first; direct Supabase is a fallback if the API is unavailable.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const fromApi = await apiState();
        if (cancelled) return;
        if (fromApi) {
          setData(fromApi.data);
          setCache(fromApi.source);
          setLoading(false);
          return;
        }
      } catch { /* fall through to direct Supabase */ }

      const client = supabase;
      if (!client) {
        if (!cancelled) {
          setCache('local');
          setLoading(false);
        }
        return;
      }

      const { data: rows, error } = await client
        .from('workspace_records')
        .select('module, data')
        .eq('tenant_id', TENANT_ID);

      if (cancelled) return;
      if (error) {
        notify('Couldn’t load workspace data', 'We’ll show your last saved view while we reconnect.', 'danger');
        setCache('local');
        setLoading(false);
        return;
      }

      if (!rows?.length) {
        const payload = Object.entries(seed).flatMap(([module, records]) =>
          records.map((row) => ({ id: row.id, module, data: row, tenant_id: TENANT_ID })),
        );
        const { error: seedError } = await client
          .from('workspace_records')
          .upsert(payload, { onConflict: 'id', ignoreDuplicates: true });
        if (cancelled) return;
        if (seedError) notify('Couldn’t prepare your workspace', 'Please refresh in a moment.', 'danger');
        setData(seed);
        setCache('supabase');
        setLoading(false);
        return;
      }

      const next = emptyMap();
      rows.forEach((record) => {
        const module = String(record.module);
        const row = record.data as Row;
        if (row?.id) (next[module] ??= []).push(row);
      });
      setData(next);
      setCache('supabase');
      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [notify]);

  const saveLocal = (next: DataMap) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
  };

  const remoteError = (error: { message: string } | null, action: string) => {
    if (error) notify('Couldn’t save changes', 'Please try again in a moment.', 'danger');
  };

  /** If the API route fails, keep the previous direct-Supabase behaviour. */
  const directMutation = (
    action: 'insert' | 'update' | 'delete',
    key: string,
    id: string,
    row?: Row,
    merged?: Row,
  ) => {
    if (!supabase) return;
    if (action === 'insert' && row) {
      supabase.from('workspace_records')
        .insert({ id: row.id, module: key, data: row, tenant_id: TENANT_ID })
        .then(({ error }) => remoteError(error, 'Insert'));
    }
    if (action === 'update' && merged) {
      supabase.from('workspace_records')
        .update({ data: merged, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', TENANT_ID)
        .then(({ error }) => remoteError(error, 'Update'));
    }
    if (action === 'delete') {
      supabase.from('workspace_records')
        .delete().eq('id', id).eq('tenant_id', TENANT_ID)
        .then(({ error }) => remoteError(error, 'Delete'));
    }
  };

  const get = useCallback((key: string) => data[key] ?? [], [data]);

  const add = useCallback((key: string, row: Row) => {
    const next = { ...data, [key]: [row, ...(data[key] ?? [])] };
    setData(next);
    if (!supabase) {
      saveLocal(next);
      return;
    }
    apiMutate({ action: 'insert', module: key, id: row.id, row })
      .then((ok) => { if (!ok) directMutation('insert', key, row.id, row); });
  }, [data]);

  const update = useCallback((key: string, id: string, patch: Partial<Row>) => {
    const existing = (data[key] ?? []).find((r) => r.id === id);
    const merged = { ...(existing ?? { id }), ...patch };
    const next = { ...data, [key]: (data[key] ?? []).map((r) => (r.id === id ? merged : r)) };
    setData(next);
    if (!supabase) {
      saveLocal(next);
      return;
    }
    apiMutate({ action: 'update', module: key, id, patch })
      .then((ok) => { if (!ok) directMutation('update', key, id, undefined, merged); });
  }, [data]);

  const remove = useCallback((key: string, id: string) => {
    const next = { ...data, [key]: (data[key] ?? []).filter((r) => r.id !== id) };
    setData(next);
    if (!supabase) {
      saveLocal(next);
      return;
    }
    apiMutate({ action: 'delete', module: key, id })
      .then((ok) => { if (!ok) directMutation('delete', key, id); });
  }, [data]);

  const value = useMemo<StoreValue>(() => ({
    data, get, add, update, remove, toasts, notify, dismiss, role, setRole,
    tenant: 'Northstar Technologies',
    backend: isSupabaseConfigured ? 'supabase' : 'local',
    cache,
    loading,
    sidebarOpen, setSidebarOpen, paletteOpen, setPaletteOpen,
  }), [data, get, add, update, remove, toasts, notify, dismiss, role, cache, loading, sidebarOpen, paletteOpen]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useApp() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

export const newId = (prefix = 'NEW') => `${prefix}-${uid().toUpperCase()}`;

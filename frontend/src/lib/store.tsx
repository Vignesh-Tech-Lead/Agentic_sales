import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { seed } from './seed';
import { isSupabaseConfigured, supabase, TENANT_ID } from './supabase';
import type { Row, Toast } from './types';
import { uid } from './format';

type DataMap = Record<string, Row[]>;

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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DataMap>(isSupabaseConfigured ? seed : localData);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [role, setRole] = useState('Sales Manager');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const notify = useCallback((title: string, message?: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, title, message, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4800);
  }, []);

  // Load the workspace from Supabase. On a fresh database, seed it once.
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let cancelled = false;

    const load = async () => {
      const { data: rows, error } = await client
        .from('workspace_records')
        .select('module, data')
        .eq('tenant_id', TENANT_ID);

      if (cancelled) return;
      if (error) {
        notify('Supabase connection failed', error.message, 'danger');
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
        if (seedError) notify('Could not seed database', seedError.message, 'danger');
        setData(seed);
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
      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [notify]);

  const saveLocal = (next: DataMap) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
  };

  const remoteError = (error: { message: string } | null, action: string) => {
    if (error) notify(`${action} failed on server`, error.message, 'danger');
  };

  const get = useCallback((key: string) => data[key] ?? [], [data]);

  const add = useCallback((key: string, row: Row) => {
    const next = { ...data, [key]: [row, ...(data[key] ?? [])] };
    setData(next);
    if (supabase) {
      supabase.from('workspace_records')
        .insert({ id: row.id, module: key, data: row, tenant_id: TENANT_ID })
        .then(({ error }) => remoteError(error, 'Insert'));
    } else saveLocal(next);
  }, [data]);

  const update = useCallback((key: string, id: string, patch: Partial<Row>) => {
    const existing = (data[key] ?? []).find((r) => r.id === id);
    const merged = { ...(existing ?? { id }), ...patch };
    const next = { ...data, [key]: (data[key] ?? []).map((r) => (r.id === id ? merged : r)) };
    setData(next);
    if (supabase) {
      supabase.from('workspace_records')
        .update({ data: merged, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', TENANT_ID)
        .then(({ error }) => remoteError(error, 'Update'));
    } else saveLocal(next);
  }, [data]);

  const remove = useCallback((key: string, id: string) => {
    const next = { ...data, [key]: (data[key] ?? []).filter((r) => r.id !== id) };
    setData(next);
    if (supabase) {
      supabase.from('workspace_records')
        .delete().eq('id', id).eq('tenant_id', TENANT_ID)
        .then(({ error }) => remoteError(error, 'Delete'));
    } else saveLocal(next);
  }, [data]);

  const value = useMemo<StoreValue>(() => ({
    data, get, add, update, remove, toasts, notify, dismiss, role, setRole,
    tenant: 'Northstar Technologies',
    backend: isSupabaseConfigured ? 'supabase' : 'local',
    loading,
    sidebarOpen, setSidebarOpen, paletteOpen, setPaletteOpen,
  }), [data, get, add, update, remove, toasts, notify, dismiss, role, loading, sidebarOpen, paletteOpen]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useApp() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

export const newId = (prefix = 'NEW') => `${prefix}-${uid().toUpperCase()}`;

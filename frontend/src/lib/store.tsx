import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Row, Toast } from './types';
import { MODULE_KEYS } from './modules';
import { uid } from './format';

type DataMap = Record<string, Row[]>;
type CacheSource = 'redis' | 'supabase' | 'local';

interface StoreValue {
  data: DataMap;
  get: (key: string) => Row[];
  add: (key: string, row: Row) => Promise<void>;
  update: (key: string, id: string, patch: Partial<Row>) => Promise<void>;
  remove: (key: string, id: string) => Promise<void>;
  toasts: Toast[];
  notify: (title: string, message?: string, tone?: Toast['tone']) => void;
  dismiss: (id: number) => void;
  role: string;
  setRole: (role: string) => void;
  tenant: string;
  backend: 'api';
  cache: CacheSource;
  loading: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreValue | null>(null);
const emptyMap = (): DataMap => Object.fromEntries(MODULE_KEYS.map((key) => [key, []]));

async function apiState(): Promise<{ data: DataMap; source: CacheSource }> {
  const response = await fetch('/api/state', { headers: { accept: 'application/json' }, cache: 'no-store' });
  if (!response.ok) throw new Error(`Workspace API returned ${response.status}`);
  const payload = await response.json();
  if (!payload?.data || typeof payload.data !== 'object') throw new Error('Workspace API returned an invalid response');
  return { data: { ...emptyMap(), ...payload.data }, source: payload.source === 'redis' ? 'redis' : 'supabase' };
}

async function apiMutate(payload: Record<string, unknown>): Promise<void> {
  const response = await fetch('/api/state', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(result?.error ?? `Workspace API returned ${response.status}`);
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DataMap>(emptyMap);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [role, setRole] = useState('Sales Manager');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cache, setCache] = useState<CacheSource>('local');

  const dismiss = useCallback((id: number) => setToasts((items) => items.filter((item) => item.id !== id)), []);
  const notify = useCallback((title: string, message?: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((items) => [...items, { id, title, message, tone }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 4800);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const state = await apiState();
      setData(state.data);
      setCache(state.source);
    } catch {
      setData(emptyMap());
      setCache('local');
      notify('Workspace unavailable', 'Could not load records from the service. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { void refresh(); }, [refresh]);
  const get = useCallback((key: string) => data[key] ?? [], [data]);

  const add = useCallback(async (key: string, row: Row) => {
    try {
      await apiMutate({ action: 'insert', module: key, id: row.id, row });
      setData((current) => ({ ...current, [key]: [row, ...(current[key] ?? [])] }));
    } catch (error) {
      notify('Could not save record', error instanceof Error ? error.message : 'Please try again.', 'danger');
    }
  }, [notify]);

  const update = useCallback(async (key: string, id: string, patch: Partial<Row>) => {
    try {
      await apiMutate({ action: 'update', module: key, id, patch });
      setData((current) => ({
        ...current,
        [key]: (current[key] ?? []).map((row) => row.id === id ? { ...row, ...patch, id } : row),
      }));
    } catch (error) {
      notify('Could not save changes', error instanceof Error ? error.message : 'Please try again.', 'danger');
    }
  }, [notify]);

  const remove = useCallback(async (key: string, id: string) => {
    try {
      await apiMutate({ action: 'delete', module: key, id });
      setData((current) => ({ ...current, [key]: (current[key] ?? []).filter((row) => row.id !== id) }));
    } catch (error) {
      notify('Could not remove record', error instanceof Error ? error.message : 'Please try again.', 'danger');
    }
  }, [notify]);

  const value = useMemo<StoreValue>(() => ({
    data, get, add, update, remove, toasts, notify, dismiss, role, setRole,
    tenant: 'Workspace', backend: 'api', cache, loading,
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

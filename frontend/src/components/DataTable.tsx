import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import type { Column, Row } from '../lib/types';
import { cx, money, num } from '../lib/format';
import { EmptyState, StatusBadge } from './ui';

interface Props {
  rows: Row[];
  columns: Column[];
  onRowClick?: (row: Row) => void;
  filters?: { key: string; label: string; options: string[] }[];
  searchPlaceholder?: string;
  toolbar?: React.ReactNode;
  pageSize?: number;
  dense?: boolean;
  bulkActions?: { label: string; icon?: React.ReactNode; onClick: (ids: string[]) => void }[];
  rowActions?: (row: Row) => React.ReactNode;
}

export function DataTable({ rows, columns, onRowClick, filters = [], searchPlaceholder = 'Search records…', toolbar, pageSize = 8, dense, bulkActions, rowActions }: Props) {
  const [query, setQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let out = rows.filter((row) => {
      const q = query.toLowerCase().trim();
      const matchesQuery = !q || Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(q));
      const matchesFilters = Object.entries(filterValues).every(([key, value]) => !value || String(row[key]) === value);
      return matchesQuery && matchesFilters;
    });
    if (sort) out = [...out].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av ?? '').localeCompare(String(bv ?? ''));
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return out;
  }, [rows, query, filterValues, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * pageSize, (current + 1) * pageSize);
  const cols = columns.filter((c) => !c.hidden);

  const exportCsv = () => {
    const head = cols.map((c) => c.label);
    const lines = [head.join(','), ...filtered.map((r) => cols.map((c) => `"${String(r[c.key] ?? '').replace(/"/g, '""')}"`).join(','))];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'export.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const toggleAll = () => setSelected(selected.length === visible.length ? [] : visible.map((r) => r.id));
  const toggleOne = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} placeholder={searchPlaceholder}
            className="input w-full pl-9" />
        </div>
        {filters.length > 0 && (
          <button onClick={() => setShowFilters(!showFilters)} className={cx('btn-secondary btn-sm', showFilters && 'border-brand-300 bg-brand-50 text-brand-700')}>
            <SlidersHorizontal size={14} /> Filters {Object.values(filterValues).filter(Boolean).length > 0 && <span className="rounded-full bg-brand-600 px-1.5 text-[10px] text-white">{Object.values(filterValues).filter(Boolean).length}</span>}
          </button>
        )}
        <button onClick={exportCsv} className="btn-secondary btn-sm" title="Export current view"><Download size={14} /><span className="hidden sm:inline">Export</span></button>
        {toolbar}
      </div>

      {showFilters && filters.length > 0 && (
        <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3">
          {filters.map((f) => (
            <div key={f.key} className="min-w-[160px]">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">{f.label}</label>
              <select value={filterValues[f.key] ?? ''} onChange={(e) => { setFilterValues({ ...filterValues, [f.key]: e.target.value }); setPage(0); }} className="input py-2 text-xs">
                <option value="">All</option>
                {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <button onClick={() => setFilterValues({})} className="btn-ghost btn-sm"><X size={13} /> Clear</button>
        </div>
      )}

      {bulkActions && selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-brand-100 bg-brand-50 px-4 py-2.5 text-xs">
          <span className="font-semibold text-brand-800">{selected.length} selected</span>
          {bulkActions.map((a) => <button key={a.label} onClick={() => { a.onClick(selected); setSelected([]); }} className="btn-secondary btn-sm">{a.icon}{a.label}</button>)}
          <button onClick={() => setSelected([])} className="ml-auto text-brand-700 hover:underline">Clear</button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr>
              {bulkActions && <th className="th w-10"><input type="checkbox" checked={selected.length === visible.length && visible.length > 0} onChange={toggleAll} className="accent-brand-600" /></th>}
              {cols.map((c) => (
                <th key={c.key} className="th" style={{ width: c.width }}>
                  <button className="flex items-center gap-1 hover:text-brand-700" onClick={() => setSort((s) => s?.key === c.key ? { key: c.key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key: c.key, dir: 'asc' })}>
                    {c.label}
                    {sort?.key === c.key && (sort.dir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
                  </button>
                </th>
              ))}
              {rowActions && <th className="th w-12" />}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} className={cx('table-row', onRowClick && 'cursor-pointer')} onClick={() => onRowClick?.(row)}>
                {bulkActions && <td className="td" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggleOne(row.id)} className="accent-brand-600" /></td>}
                {cols.map((c) => {
                  const val = row[c.key];
                  let content: React.ReactNode;
                  if (c.badge) content = <StatusBadge value={val} />;
                  else if (c.type === 'currency') content = <span className="font-semibold tabular-nums">{money(val, row.currency)}</span>;
                  else if (c.type === 'number' || c.type === 'percent') content = <span className="tabular-nums">{c.type === 'percent' ? `${val}%` : num(val)}</span>;
                  else if (typeof val === 'boolean') content = <StatusBadge value={val ? 'Enabled' : 'Disabled'} />;
                  else if (Array.isArray(val)) content = <div className="flex flex-wrap gap-1">{val.map((x) => <span key={x} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">{x}</span>)}</div>;
                  else content = <span className={cx('line-clamp-2', c.key === 'id' && 'font-mono text-xs text-slate-500')}>{val ?? '—'}</span>;
                  return <td key={c.key} className={cx('td', dense && 'py-2.5')}>{content}</td>;
                })}
                {rowActions && <td className="td" onClick={(e) => e.stopPropagation()}>{rowActions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <EmptyState icon={Filter} title="No matching records" message="Adjust your search or filters, or create a new record." />}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
        <span>Showing <b className="text-slate-700">{filtered.length ? current * pageSize + 1 : 0}–{Math.min((current + 1) * pageSize, filtered.length)}</b> of <b className="text-slate-700">{filtered.length}</b></span>
        <div className="flex items-center gap-1">
          <button disabled={current === 0} onClick={() => setPage(current - 1)} className="btn-secondary btn-sm"><ChevronLeft size={14} /></button>
          <span className="px-2 font-semibold text-slate-700">{current + 1} / {pages}</span>
          <button disabled={current >= pages - 1} onClick={() => setPage(current + 1)} className="btn-secondary btn-sm"><ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}

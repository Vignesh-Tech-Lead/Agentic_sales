import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Command, Search, Bell, ChevronDown, ChevronRight, Sparkles, ShieldCheck,
  X, CheckCircle2, AlertCircle, Info, TriangleAlert, Menu, LayoutGrid, CornerDownLeft, ArrowUpDown,
} from 'lucide-react';
import { navModules, groups } from '../lib/nav';
import { useApp } from '../lib/store';
import { cx, initials } from '../lib/format';
import { Avatar } from './ui';

function Brand() {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate('/dashboard')} className="flex shrink-0 items-center gap-2.5" aria-label="Go to dashboard">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-teal-500 text-white shadow-lg shadow-brand-500/25">
        <Sparkles size={18} />
      </span>
      <span className="hidden text-left sm:block">
        <span className="block text-sm font-bold leading-tight text-slate-900">Agentic Sales</span>
        <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Revenue OS</span>
      </span>
    </button>
  );
}

function ModuleLinks({ onNavigate, compact = false }: { onNavigate: () => void; compact?: boolean }) {
  const location = useLocation();
  return (
    <div className={cx(compact ? 'space-y-4' : 'grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-4')}>
      {groups.map((group) => (
        <div key={group}>
          <p className="mb-1.5 px-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">{group}</p>
          <div className={compact ? 'space-y-0.5' : 'space-y-0.5'}>
            {navModules.filter((m) => m.group === group).map((m) => (
              <NavLink key={m.path} to={m.path} onClick={onNavigate}
                className={({ isActive }) => cx(
                  'flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium transition',
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )}>
                <m.icon size={14} className="shrink-0" />
                <span className="truncate">{m.title}</span>
                {location.pathname === m.path && <ChevronRight size={12} className="ml-auto shrink-0" />}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TopNavigation() {
  const location = useLocation();
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setOpen(null); setMobileOpen(false); }, [location.pathname]);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const activeGroup = groups.find((g) => navModules.some((m) => m.group === g && m.path === location.pathname));

  return (
    <div ref={navRef} className="flex min-w-0 items-center gap-1">
      <button onClick={() => setMobileOpen(!mobileOpen)}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Toggle navigation">
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>
      <div className="hidden items-center gap-0.5 lg:flex">
        {groups.map((group) => (
          <div key={group} className="relative">
            <button onClick={() => setOpen(open === group ? null : group)}
              onMouseEnter={() => setOpen(group)}
              className={cx('flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition',
                activeGroup === group ? 'text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')}>
              {group}
              <ChevronDown size={12} className={cx('transition-transform', open === group && 'rotate-180')} />
            </button>
            {open === group && (
              <div onMouseLeave={() => setOpen(null)}
                className="absolute left-0 top-full z-50 mt-2 w-[720px] card p-4 shadow-pop">
                <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <LayoutGrid size={14} className="text-brand-600" />
                  <p className="text-xs font-bold text-slate-800">{group}</p>
                  <span className="ml-auto text-[10px] text-slate-400">{navModules.filter((m) => m.group === group).length} modules</span>
                </div>
                <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-4">
                  {navModules.filter((m) => m.group === group).map((m) => (
                    <NavLink key={m.path} to={m.path} onClick={() => setOpen(null)}
                      className={({ isActive }) => cx('flex items-start gap-2 rounded-xl p-2.5 transition',
                        isActive ? 'bg-brand-50 ring-1 ring-brand-100' : 'hover:bg-slate-50')}>
                      <span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-lg',
                        location.pathname === m.path ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600')}><m.icon size={14} /></span>
                      <span className="min-w-0"><span className="block truncate text-[11px] font-bold leading-tight text-slate-800">{m.title}</span>
                        <span className="mt-0.5 block truncate text-[10px] text-slate-400">{m.short}</span></span>
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {mobileOpen && (
        <div className="absolute inset-x-0 top-16 z-50 max-h-[75vh] overflow-y-auto border-b border-slate-200 bg-white p-4 shadow-pop lg:hidden">
          <ModuleLinks compact onNavigate={() => setMobileOpen(false)} />
        </div>
      )}
    </div>
  );
}

function CommandPalette() {
  const { paletteOpen, setPaletteOpen } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const results = useMemo(() => navModules.filter((m) => `${m.title} ${m.short} ${m.group}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8), [query]);

  const openResult = (path: string) => { navigate(path); setPaletteOpen(false); setQuery(''); setActive(0); };

  useEffect(() => {
    if (!paletteOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setPaletteOpen(false); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && results[active]) openResult(results[active].path);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteOpen, results, active, navigate, setPaletteOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPaletteOpen]);

  if (!paletteOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-900/50 p-4 pt-[12vh] backdrop-blur-sm" onMouseDown={() => setPaletteOpen(false)}>
      <div className="w-full max-w-xl overflow-hidden card shadow-pop" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input autoFocus value={query} onChange={(e) => { setQuery(e.target.value); setActive(0); }} placeholder="Search modules, records, actions…" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
          <span className="code">ESC</span>
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-2">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Modules</p>
          {results.map((m, i) => (
            <button key={m.path} onMouseEnter={() => setActive(i)} onClick={() => openResult(m.path)}
              className={cx('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition', active === i ? 'bg-brand-50 ring-1 ring-brand-100' : 'hover:bg-slate-50')}>
              <span className={cx('grid h-8 w-8 place-items-center rounded-lg', active === i ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600')}><m.icon size={15} /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-800">{m.title}</span><span className="block truncate text-[11px] text-slate-500">{m.short}</span></span>
              <span className="text-[10px] text-slate-400">Module {m.spec}</span>
            </button>
          ))}
          {!results.length && <p className="px-3 py-8 text-center text-xs text-slate-500">No modules match “{query}”</p>}
        </div>
        <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><CornerDownLeft size={12} /> open</span>
          <span className="flex items-center gap-1"><ArrowUpDown size={12} /> navigate</span>
          <span className="ml-auto flex items-center gap-1"><Command size={11} /> K to open anywhere</span>
        </div>
      </div>
    </div>
  );
}


function Toasts() {
  const { toasts, dismiss } = useApp();
  const icons = { success: CheckCircle2, info: Info, warning: TriangleAlert, danger: AlertCircle };
  const colors = { success: 'text-emerald-600', info: 'text-brand-600', warning: 'text-amber-600', danger: 'text-rose-600' };
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[70] flex w-[340px] max-w-[calc(100vw-2.5rem)] flex-col gap-2">
      {toasts.map((t) => {
        const Icon = icons[t.tone];
        return (
          <div key={t.id} className="animate-slide-in pointer-events-auto flex gap-3 card p-3.5 shadow-pop">
            <Icon size={17} className={cx('mt-0.5 shrink-0', colors[t.tone])} />
            <div className="min-w-0 flex-1"><p className="text-xs font-bold text-slate-800">{t.title}</p>{t.message && <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{t.message}</p>}</div>
            <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-slate-700" aria-label="Dismiss"><X size={14} /></button>
          </div>
        );
      })}
    </div>
  );
}

function Topbar() {
  const { setPaletteOpen, role, setRole, tenant, loading, cache } = useApp();
  const location = useLocation();
  const [roleOpen, setRoleOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const current = navModules.find((m) => m.path === location.pathname);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:px-6">
        <Brand />
        <div className="mx-2 hidden h-6 w-px bg-slate-200 xl:block" />
        <TopNavigation />
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 2xl:flex">
            <span className="dot bg-emerald-500" />{tenant}
          </span>
          <button onClick={() => setPaletteOpen(true)} className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 transition hover:border-brand-300 hover:bg-white md:flex">
            <Search size={14} /> Search <span className="ml-3 flex items-center gap-0.5 rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 ring-1 ring-slate-200"><Command size={10} />K</span>
          </button>
          <button onClick={() => setPaletteOpen(true)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden" aria-label="Search"><Search size={18} /></button>
          <div className="relative" ref={notifRef}>
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications">
              <Bell size={18} /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-11 w-80 card p-4 shadow-pop">
                <p className="mb-3 text-xs font-bold text-slate-800">Notifications</p>
                {[
                  ['Approval requested', 'Proposal PRP-01 is awaiting commercial sign-off.', '9:58'],
                  ['Campaign approved', 'CMP-01 is scheduled for 20 Nov, 10:00 IST.', '8:41'],
                  ['Agent paused', 'Proposal Agent paused pending policy review.', '17 Nov'],
                ].map(([t, b, time]) => (
                  <div key={t} className="flex gap-2 border-b border-slate-100 py-2.5 last:border-0"><span className="mt-1.5 dot bg-brand-500" /><div className="min-w-0"><p className="text-xs font-semibold text-slate-800">{t}</p><p className="text-[11px] text-slate-500">{b}</p><p className="mt-0.5 text-[10px] text-slate-400">{time}</p></div></div>
                ))}
              </div>
            )}
          </div>
          <div className="relative" ref={roleRef}>
            <button onClick={() => setRoleOpen(!roleOpen)} className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 hover:bg-slate-100">
              <Avatar name="Ananya Rao" />
              <span className="hidden text-left lg:block"><span className="block text-[11px] font-bold text-slate-800">Ananya Rao</span><span className="block text-[10px] text-slate-500">{role}</span></span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            {roleOpen && (
              <div className="absolute right-0 top-12 w-56 card p-2 shadow-pop">
                <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Preview as role</p>
                {['Sales Manager', 'Sales Executive', 'Marketing Manager', 'Knowledge Manager', 'Analyst/Auditor', 'Organization Admin'].map((r) => (
                  <button key={r} onClick={() => { setRole(r); setRoleOpen(false); }} className={cx('flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition hover:bg-slate-50', role === r && 'bg-brand-50 font-semibold text-brand-700')}>
                    <ShieldCheck size={13} /> {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 bg-slate-50/60">
        <div className="mx-auto flex h-8 max-w-[1600px] items-center gap-2 px-4 text-[10px] text-slate-500 sm:px-6">
          <span className="font-medium">Workspace</span><ChevronRight size={11} />
          <span className="font-medium">{current?.group ?? 'Overview'}</span><ChevronRight size={11} />
          <span className="font-bold text-slate-700">{current?.title ?? 'Agentic Sales'}</span>
          <span className="ml-auto hidden items-center gap-1 sm:flex"><span className={cx("dot", loading ? "bg-amber-500 animate-pulse" : cache === "redis" ? "bg-emerald-500" : cache === "supabase" ? "bg-blue-500" : "bg-slate-400")} /> {loading ? "Syncing backend…" : cache === "redis" ? "Supabase + Redis connected" : cache === "supabase" ? "Supabase connected" : "Local preview data"}</span>
        </div>
      </div>
    </header>
  );
}

export function Layout() {
  return (
    <div className="min-h-screen bg-canvas">
      <Topbar />
      <main className="mx-auto w-full max-w-[1600px] flex-1 p-4 sm:p-6 lg:p-8"><Outlet /></main>
      <CommandPalette />
      <Toasts />
    </div>
  );
}

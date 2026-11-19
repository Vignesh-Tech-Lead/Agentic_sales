import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Command, Search, Bell, ChevronDown, Sparkles,
  X, CheckCircle2, AlertCircle, Info, TriangleAlert, Menu, CornerDownLeft, ArrowUpDown, LogOut,
} from 'lucide-react';
import { navModules, groups } from '../lib/nav';
import { useApp } from '../lib/store';
import { canAccessModule, useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { cx } from '../lib/format';
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

function TopNavigation() {
  const location = useLocation();
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const { role } = useAuth();
  const visibleModules = navModules.filter((module) => canAccessModule(role, module.path));
  const visibleGroups = groups.filter((group) => visibleModules.some((module) => module.group === group));
  const categoryRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeGroup = groups.find((group) => navModules.some((module) => module.group === group && module.path === location.pathname));

  useEffect(() => { setOpen(null); setMobileOpen(false); }, [location.pathname]);
  useEffect(() => {
    const closeOnOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) { setOpen(null); setMobileOpen(false); }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(null); setMobileOpen(false); }
      if (open && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
        const current = Math.max(0, visibleGroups.indexOf(open));
        const next = (current + (event.key === 'ArrowRight' ? 1 : visibleGroups.length - 1)) % visibleGroups.length;
        event.preventDefault();
        setOpen(visibleGroups[next]);
        categoryRefs.current[next]?.focus();
      }
    };
    document.addEventListener('mousedown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const chooseGroup = (group: string) => setOpen((current) => current === group ? null : group);

  return (
    <div ref={navRef} className="relative flex h-full min-w-0 flex-1 items-center justify-center">
      <button
        type="button"
        onClick={() => { setMobileOpen((value) => !value); setOpen(null); }}
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={mobileOpen}
        className="rounded-md p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 lg:hidden"
      >{mobileOpen ? <X size={19} /> : <Menu size={19} />}</button>

      <nav aria-label="Primary navigation" className="hidden h-full items-center gap-1 lg:flex">
        {visibleGroups.map((group, index) => {
          const expanded = open === group;
          const active = activeGroup === group;
          return <button
            key={group}
            ref={(element) => { categoryRefs.current[index] = element; }}
            type="button"
            onClick={() => chooseGroup(group)}
            aria-expanded={expanded}
            aria-controls="primary-mega-menu"
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
                if (event.key === 'ArrowDown') event.preventDefault();
                setOpen(group);
                requestAnimationFrame(() => document.querySelector<HTMLAnchorElement>('#primary-mega-menu a')?.focus());
              }
            }}
            className={cx(
              'flex h-full items-center gap-2 border-b-2 px-3 text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600',
              expanded || active ? 'border-brand-700 text-brand-800' : 'border-transparent text-slate-600 hover:text-slate-950',
            )}
          >{group}<ChevronDown size={13} className={cx('transition-transform', expanded && 'rotate-180')} /></button>;
        })}
      </nav>

      {open && <div id="primary-mega-menu" className="absolute left-0 right-0 top-full z-50 border-y border-slate-200 bg-white shadow-[0_10px_22px_rgba(15,23,42,.08)]">
        <div className="mx-auto max-w-[1440px] px-6 py-6">
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
            <div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-brand-700">Workspace</p><h2 className="mt-1 text-base font-semibold tracking-tight text-slate-950">{open}</h2></div>
            <span className="text-xs text-slate-500">{visibleModules.filter((module) => module.group === open).length} destinations</span>
          </div>
          <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-4">
            {visibleModules.filter((module) => module.group === open).map((module) => {
              const selected = location.pathname === module.path;
              return <NavLink key={module.path} to={module.path} onClick={() => setOpen(null)}
                className={cx('group border-l-2 px-3 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600', selected ? 'border-brand-700 bg-slate-50' : 'border-transparent hover:border-slate-300 hover:bg-slate-50')}>
                <span className={cx('block text-[13px] font-semibold', selected ? 'text-brand-800' : 'text-slate-800 group-hover:text-slate-950')}>{module.title}</span>
                {module.short && <span className="mt-1 block text-[11px] leading-relaxed text-slate-500">{module.short}</span>}
                {selected && <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-brand-700">Current page</span>}
              </NavLink>;
            })}
          </div>
        </div>
      </div>}

      {mobileOpen && <div className="absolute left-0 right-0 top-full z-50 max-h-[calc(100vh-64px)] overflow-y-auto border-y border-slate-200 bg-white shadow-[0_10px_22px_rgba(15,23,42,.08)] lg:hidden">
        <div className="divide-y divide-slate-200 px-4">
          {visibleGroups.map((group) => <section key={group} className="py-3">
            <button type="button" onClick={() => chooseGroup(group)} aria-expanded={open === group}
              className="flex w-full items-center justify-between py-2 text-left text-sm font-semibold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">
              {group}<ChevronDown size={15} className={cx('transition-transform', open === group && 'rotate-180')} />
            </button>
            {open === group && <div className="grid gap-1 sm:grid-cols-2">
              {visibleModules.filter((module) => module.group === group).map((module) => <NavLink key={module.path} to={module.path} onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cx('border-l-2 px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600', isActive ? 'border-brand-700 bg-slate-50 text-brand-800' : 'border-transparent text-slate-700 hover:bg-slate-50')}>
                <span className="block text-xs font-semibold">{module.title}</span><span className="mt-0.5 block text-[10px] text-slate-500">{module.short}</span>
              </NavLink>)}
            </div>}
          </section>)}
        </div>
      </div>}
    </div>
  );
}

function CommandPalette() {
  const { paletteOpen, setPaletteOpen } = useApp();
  const { role } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const results = useMemo(() => navModules.filter((m) => canAccessModule(role, m.path) && `${m.title} ${m.short} ${m.group}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8), [query, role]);

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
          <input autoFocus value={query} onChange={(e) => { setQuery(e.target.value); setActive(0); }} placeholder="Search pages, records and actions…" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
          <span className="code">ESC</span>
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-2">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Pages</p>
          {results.map((m, i) => (
            <button key={m.path} onMouseEnter={() => setActive(i)} onClick={() => openResult(m.path)}
              className={cx('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition', active === i ? 'bg-brand-50 ring-1 ring-brand-100' : 'hover:bg-slate-50')}>
              <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-800">{m.title}</span><span className="block truncate text-[11px] text-slate-500">{m.short}</span></span>

            </button>
          ))}
          {!results.length && <p className="px-3 py-8 text-center text-xs text-slate-500">No pages match “{query}”</p>}
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
  const { setPaletteOpen, tenant, role } = useApp();
  const { user } = useAuth();
  const displayName = String(user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? 'Account');
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-5 px-4 sm:px-6">
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
                  ['Helper paused', 'Proposal helper is paused until review finishes.', '17 Nov'],
                ].map(([t, b, time]) => (
                  <div key={t} className="flex gap-2 border-b border-slate-100 py-2.5 last:border-0"><span className="mt-1.5 dot bg-brand-500" /><div className="min-w-0"><p className="text-xs font-semibold text-slate-800">{t}</p><p className="text-[11px] text-slate-500">{b}</p><p className="mt-0.5 text-[10px] text-slate-400">{time}</p></div></div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <div className="hidden text-right lg:block"><p className="max-w-32 truncate text-[11px] font-semibold text-slate-800">{displayName}</p><p className="text-[10px] text-slate-500">{role}</p></div>
            <Avatar name={displayName} />
            <button type="button" title="Sign out" aria-label="Sign out" onClick={() => void supabase?.auth.signOut()} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"><LogOut size={15}/></button>
          </div>
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

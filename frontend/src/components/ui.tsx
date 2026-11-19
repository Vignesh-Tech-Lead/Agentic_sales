import React, { useEffect } from 'react';
import { X, ChevronRight, Sparkles, AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Field, Row, Tone } from '../lib/types';
import { cx, initials, toneFor } from '../lib/format';

export function Badge({ children, tone = 'slate', dot = false }: { children: React.ReactNode; tone?: Tone; dot?: boolean }) {
  return <span className={cx('badge', `badge-${tone}`)}>{dot && <span className="dot bg-current opacity-70" />}{children}</span>;
}

export function StatusBadge({ value }: { value: unknown }) {
  return <Badge tone={toneFor(value)} dot>{String(value ?? '—')}</Badge>;
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  return <span className={cx('avatar', size === 'sm' && 'h-6 w-6 text-[9px]')} title={name}>{initials(name)}</span>;
}

export function StatCard({ label, value, delta, icon: Icon, tone = 'brand', hint }: {
  label: string; value: React.ReactNode; delta?: string; icon?: LucideIcon; tone?: 'brand' | 'green' | 'amber' | 'purple' | 'rose' | 'teal'; hint?: string;
}) {
  const accents: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600', green: 'bg-emerald-50 text-emerald-600', teal: 'bg-teal-50 text-teal-600',
    amber: 'bg-amber-50 text-amber-600', purple: 'bg-violet-50 text-violet-600', rose: 'bg-rose-50 text-rose-600',
  };
  return (
    <div className="card p-4 transition hover:-translate-y-0.5 hover:shadow-lg sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        {Icon && <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl', accents[tone])}><Icon size={18} /></span>}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px]">
        {delta && <span className={cx('font-semibold', delta.startsWith('-') ? 'text-rose-600' : 'text-emerald-600')}>{delta}</span>}
        {hint && <span className="truncate text-slate-400">{hint}</span>}
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, icon: Icon, actions, breadcrumb }: {
  title: string; subtitle?: string; icon?: LucideIcon; actions?: React.ReactNode; breadcrumb?: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3">
        {Icon && <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-500/20"><Icon size={20} /></span>}
        <div>
          {breadcrumb && <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-brand-600">{breadcrumb}</p>}
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionTitle({ title, action, icon: Icon }: { title: string; action?: React.ReactNode; icon?: LucideIcon }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">{Icon && <Icon size={16} className="text-brand-600" />}{title}</h2>
      {action}
    </div>
  );
}

export function Drawer({ open, onClose, title, subtitle, children, footer, width = 'max-w-xl' }: {
  open: boolean; onClose: () => void; title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode; width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm" onMouseDown={onClose}>
      <div className={cx('animate-slide-in flex h-full w-full flex-col bg-white shadow-pop', width)} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0"><h3 className="truncate text-base font-bold text-slate-900">{title}</h3>{subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}</div>
          <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function Tabs({ items, value, onChange }: {
  items: { id: string; label: string; count?: number }[]; value: string; onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
      {items.map((item) => (
        <button key={item.id} onClick={() => onChange(item.id)}
          className={cx('whitespace-nowrap border-b-2 px-3.5 py-2.5 text-xs font-semibold transition',
            value === item.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800')}>
          {item.label}{item.count != null && <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{item.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon = Info, title, message, action }: {
  icon?: LucideIcon; title: string; message?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Icon size={22} /></span>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {message && <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ProgressBar({ value, tone = 'bg-brand-500' }: { value: number; tone?: string }) {
  return <div className="progress"><div className={cx('progress-fill', tone)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

export function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <span className="shrink-0 text-xs font-medium text-slate-500">{label}</span>
      <span className={cx('text-right text-xs font-semibold text-slate-800', mono && 'font-mono')}>{value ?? '—'}</span>
    </div>
  );
}

export function InfoCard({ title, rows, icon: Icon }: { title: string; rows: [string, React.ReactNode][]; icon?: LucideIcon }) {
  return (
    <div className="card-pad">
      <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">{Icon && <Icon size={14} className="text-brand-600" />}{title}</h3>
      {rows.map(([label, value]) => <InfoRow key={label} label={label} value={value} />)}
    </div>
  );
}

export function AiNote({ children, title = 'AI insight' }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="ai-note">
      <Sparkles size={15} className="mt-0.5 shrink-0 text-violet-600" />
      <div><p className="mb-0.5 font-bold">{title}</p><div className="opacity-90">{children}</div></div>
    </div>
  );
}

export function Notice({ tone = 'info', title, children }: { tone?: 'info' | 'warning' | 'danger' | 'success'; title?: string; children?: React.ReactNode }) {
  const styles = {
    info: 'border-blue-200 bg-blue-50 text-blue-900', warning: 'border-amber-200 bg-amber-50 text-amber-900',
    danger: 'border-rose-200 bg-rose-50 text-rose-900', success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  };
  const Icon = tone === 'danger' ? AlertCircle : tone === 'warning' ? TriangleAlert : tone === 'success' ? CheckCircle2 : Info;
  return (
    <div className={cx('flex gap-2.5 rounded-xl border p-3 text-xs leading-relaxed', styles[tone])}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <div>{title && <p className="font-bold">{title}</p>}<div className="opacity-90">{children}</div></div>
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={cx('relative h-5 w-9 rounded-full transition', checked ? 'bg-brand-600' : 'bg-slate-300')}>
        <span className={cx('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', checked ? 'left-[18px]' : 'left-0.5')} />
      </button>
      {label}
    </label>
  );
}

export function FieldControl({ field, value, onChange, error }: {
  field: Field; value: any; onChange: (v: any) => void; error?: string;
}) {
  const common = { id: `f-${field.key}`, className: cx('input', error && 'border-rose-400 focus:ring-rose-100'), disabled: field.readOnly };
  const v = value ?? (field.type === 'multiselect' ? [] : '');
  let control: React.ReactNode;
  switch (field.type) {
    case 'textarea':
      control = <textarea {...common} className={cx(common.className, 'textarea')} rows={3} value={v} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />;
      break;
    case 'select':
      control = (
        <select {...common} value={v} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {(field.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
      break;
    case 'multiselect':
      control = (
        <div className="flex flex-wrap gap-1.5">
          {(field.options ?? []).map((o) => {
            const active = Array.isArray(v) && v.includes(o);
            return <button type="button" key={o} onClick={() => onChange(active ? v.filter((x: string) => x !== o) : [...(v || []), o])}
              className={cx('rounded-lg border px-2.5 py-1.5 text-xs font-medium transition', active ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50')}>{o}</button>;
          })}
        </div>
      );
      break;
    case 'boolean':
      control = <Toggle checked={!!v} onChange={onChange} label={v ? 'Enabled' : 'Disabled'} />;
      break;
    case 'number': case 'currency': case 'percent':
      control = <div className="relative"><input {...common} type="number" value={v} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} placeholder={field.placeholder} />
        {field.type !== 'number' && <span className="pointer-events-none absolute right-3 top-2.5 text-xs font-semibold text-slate-400">{field.type === 'currency' ? '₹' : '%'}</span>}</div>;
      break;
    case 'date': case 'datetime':
      control = <input {...common} type={field.type === 'date' ? 'date' : 'datetime-local'} value={v} onChange={(e) => onChange(e.target.value)} />;
      break;
    default:
      control = <input {...common} type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'password' ? 'password' : 'text'} value={v} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />;
  }
  return (
    <div className={field.full ? 'sm:col-span-2' : ''}>
      <label htmlFor={`f-${field.key}`} className="label">{field.label}{field.required && <span className="ml-0.5 text-rose-500">*</span>}</label>
      {control}
      {field.help && <p className="mt-1 text-[11px] text-slate-400">{field.help}</p>}
      {error && <p className="mt-1 text-[11px] font-medium text-rose-600">{error}</p>}
    </div>
  );
}

export function FormGrid({ fields, values, onChange, errors = {} }: {
  fields: Field[]; values: Record<string, any>; onChange: (key: string, value: any) => void; errors?: Record<string, string>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.filter((f) => !f.readOnly).map((field) => (
        <FieldControl key={field.key} field={field} value={values[field.key]} onChange={(v) => onChange(field.key, v)} error={errors[field.key]} />
      ))}
    </div>
  );
}

export function validateFields(fields: Field[], values: Record<string, any>) {
  const errors: Record<string, string> = {};
  fields.forEach((f) => {
    const v = values[f.key];
    if (f.required && (v == null || v === '' || (Array.isArray(v) && !v.length))) errors[f.key] = `${f.label} is required`;
    if (f.type === 'email' && v && !/^\S+@\S+\.\S+$/.test(v)) errors[f.key] = 'Enter a valid email';
    if ((f.type === 'number' || f.type === 'currency') && v !== '' && v != null && Number(v) < 0) errors[f.key] = 'Must be non-negative';
  });
  return errors;
}

export function BreadcrumbLink({ label, onClick }: { label: string; onClick?: () => void }) {
  return <button onClick={onClick} className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-brand-600">{label}<ChevronRight size={12} /></button>;
}

export function KeyValueList({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return <dl className="grid grid-cols-2 gap-x-6 gap-y-3">{items.map((i) => (
    <div key={i.label}><dt className="text-[11px] font-medium text-slate-500">{i.label}</dt><dd className="mt-0.5 text-xs font-semibold text-slate-800">{i.value ?? '—'}</dd></div>
  ))}</dl>;
}

const timelineTones: Record<string, string> = {
  slate: 'bg-slate-500 ring-slate-100', green: 'bg-emerald-500 ring-emerald-100', blue: 'bg-blue-500 ring-blue-100',
  amber: 'bg-amber-500 ring-amber-100', rose: 'bg-rose-500 ring-rose-100', purple: 'bg-violet-500 ring-violet-100',
  teal: 'bg-teal-500 ring-teal-100', brand: 'bg-brand-500 ring-brand-100',
};

export function Timeline({ items }: { items: { title: string; meta?: string; body?: string; tone?: Tone }[] }) {
  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-3">
          <div className="flex flex-col items-center"><span className={cx('mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4', timelineTones[item.tone ?? 'brand'] || timelineTones.brand)} /><span className="mt-1 w-px flex-1 bg-slate-200" /></div>
          <div className="pb-2"><p className="text-xs font-semibold text-slate-800">{item.title}</p>{item.meta && <p className="mt-0.5 text-[11px] text-slate-400">{item.meta}</p>}{item.body && <p className="mt-1 text-xs text-slate-600">{item.body}</p>}</div>
        </div>
      ))}
    </div>
  );
}

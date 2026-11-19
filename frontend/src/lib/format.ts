import type { Tone } from './types';

export const money = (value?: number, currency = 'INR') =>
  value == null ? '—' : new Intl.NumberFormat('en-IN', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(value);

export const compact = (value?: number) =>
  value == null ? '—' : new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

export const num = (value?: number) =>
  value == null ? '—' : new Intl.NumberFormat('en-IN').format(value);

export const initials = (name = '') => name.split(/\s+/).slice(0, 2).map((p) => p[0] || '').join('').toUpperCase();

export const uid = () => `new-${Math.random().toString(36).slice(2, 8)}`;

export const toneFor = (value: unknown): Tone => {
  const s = String(value ?? '').toLowerCase();
  if (/^(active|healthy|approved|delivered|confirmed|indexed|published|converted|success|complete|completed|enabled|read|eligible|sent|opt-in|high|hot|positive|reviewed)$/.test(s)) return 'green';
  if (/^(new|open|draft|invited|pending|scheduled|in review|needs review|warm|medium|question|sending|extracting|tentative|prospect)$/.test(s)) return 'blue';
  if (/^(attention|overdue|cool|paused|nurturing|negative|caution|cautious|duplicate review)$/.test(s)) return 'amber';
  if (/^(disabled|disqualified|suppressed|blocked|failed|lost|rejected|archived|no fit)$/.test(s)) return 'rose';
  if (/^(qualified|recovered|negotiation|in progress|ai|human review|mandatory commercial)$/.test(s)) return 'purple';
  return 'slate';
};

export const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');

export const relative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
};

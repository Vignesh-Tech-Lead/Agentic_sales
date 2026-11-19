import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays, Plus, RefreshCw, Video, Users, Clock3, MapPin, CheckCircle2,
  ShieldCheck, FileText, ArrowLeft, ArrowRight, Sparkles, Pencil,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { cx, toneFor } from '../lib/format';
import { PageHeader, StatCard, Notice, Badge, Drawer, InfoCard, Timeline, AiNote } from '../components/ui';
import type { Row } from '../lib/types';

const days = [
  { name: 'Mon', date: '17' }, { name: 'Tue', date: '18' }, { name: 'Wed', date: '19' },
  { name: 'Thu', date: '20' }, { name: 'Fri', date: '21' }, { name: 'Sat', date: '22' }, { name: 'Sun', date: '23' },
];
const slots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export function CalendarPage() {
  const { get, update, notify } = useApp();
  const navigate = useNavigate();
  const meetings = get('calendar');
  const [detail, setDetail] = useState<Row | null>(null);
  const [connected, setConnected] = useState(true);

  const meetingAt = (day: string, hour: string) => meetings.filter((m) => m.date.includes(` ${day} `) && m.time.startsWith(hour));

  return (
    <div className="animate-fade-up">
      <PageHeader title="Calendar & Meetings" subtitle="Schedule authorized sales meetings with two-way calendar sync, CRM linkage and least-privilege access."
        icon={CalendarDays} breadcrumb="Module 19 of 25"
        actions={[
          <button key="sync" className="btn-secondary" onClick={() => { setConnected(true); notify('Calendar synced', 'Sync cursor advanced. Webhook replays are deduplicated.', 'info'); }}><RefreshCw size={15} /> Sync calendar</button>,
          <button key="new" className="btn-primary" onClick={() => navigate('/calendar/new')}><Plus size={15} /> Schedule meeting</button>,
        ]} />

      <div className="mb-4"><Notice tone="info"><span>Events are created only after a confirmed user action. Provider event IDs prevent duplicates across retries and webhook replays.</span></Notice></div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Meetings this week" value={meetings.length} icon={CalendarDays} hint="17–23 Nov 2026" />
        <StatCard label="Confirmed" value={meetings.filter((m) => m.status === 'Confirmed').length} icon={CheckCircle2} tone="green" hint="Provider synced" />
        <StatCard label="Tentative" value={meetings.filter((m) => m.status === 'Tentative').length} icon={Clock3} tone="amber" hint="Awaiting attendees" />
        <StatCard label="Calendar connection" value={connected ? 'Connected' : 'Offline'} icon={ShieldCheck} tone={connected ? 'purple' : 'rose'} hint="Google Calendar · read/write" />
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <div className="flex items-center gap-2"><button className="btn-secondary btn-sm"><ArrowLeft size={14} /></button><p className="text-sm font-bold text-slate-800">17 – 23 November 2026</p><button className="btn-secondary btn-sm"><ArrowRight size={14} /></button></div>
          <div className="flex items-center gap-2"><Badge tone="green">Asia/Kolkata · IST</Badge><Badge tone="blue">CRM links enabled</Badge></div>
        </div>
        <div className="grid min-w-[900px] grid-cols-[64px_repeat(7,minmax(0,1fr))]">
          <div className="border-b border-r border-slate-100 bg-slate-50" />
          {days.map((d, i) => <div key={d.name} className={cx('border-b border-r border-slate-100 bg-slate-50 p-2 text-center', i === 3 && 'bg-brand-50/60')}>
            <p className="text-[10px] font-semibold uppercase text-slate-400">{d.name}</p><p className={cx('text-sm font-bold', i === 3 ? 'text-brand-700' : 'text-slate-800')}>{d.date}</p>
          </div>)}
          {slots.map((slot) => (
            <React.Fragment key={slot}>
              <div className="border-b border-r border-slate-100 px-2 py-3 text-right text-[10px] text-slate-400">{slot}</div>
              {days.map((d, i) => {
                const items = meetingAt(d.date, slot);
                return <div key={`${slot}-${d.name}`} className={cx('min-h-[64px] border-b border-r border-slate-100 p-1', i === 3 && 'bg-brand-50/20')}>
                  {items.map((m) => (
                    <button key={m.id} onClick={() => setDetail(m)}
                      className={cx('mb-1 block w-full rounded-lg border-l-2 p-1.5 text-left transition hover:shadow-card',
                        m.status === 'Confirmed' ? 'border-l-brand-500 bg-brand-50' : 'border-l-amber-500 bg-amber-50')}>
                      <p className="line-clamp-2 text-[10px] font-bold leading-tight text-slate-800">{m.title}</p>
                      <p className="mt-0.5 text-[9px] text-slate-500">{m.time.split('–')[0]}</p>
                    </button>
                  ))}
                </div>;
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="card-pad xl:col-span-2">
          <p className="section-title mb-3">Upcoming meetings</p>
          <div className="space-y-2">
            {meetings.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 p-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">{m.type === 'Internal' ? <Users size={16} /> : <Video size={16} />}</span>
                <div className="min-w-[180px] flex-1"><p className="text-xs font-bold text-slate-800">{m.title}</p><p className="text-[10px] text-slate-500">{m.attendees} · {m.crm}</p></div>
                <span className="text-[11px] font-semibold text-slate-600">{m.date} · {m.time}</span>
                <Badge tone={toneFor(m.status)}>{m.status}</Badge>
                <button onClick={() => setDetail(m)} className="btn-ghost btn-sm">Details</button>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="card-pad">
            <p className="section-title mb-3">Sync health</p>
            <InfoCard title="Google Calendar" rows={[
              ['Connection', connected ? 'Connected' : 'Disconnected'], ['Scopes', 'events.readonly + events'],
              ['Sync cursor', '19 Nov, 10:42 IST'], ['Provider event IDs', 'Stored'],
              ['Conflict handling', 'Operator review'],
            ]} />
            <button className="btn-secondary mt-3 w-full btn-sm" onClick={() => { setConnected(!connected); notify(connected ? 'Connection paused' : 'Connection restored', 'Calendar adapter status changed and audited.', 'info'); }}>{connected ? 'Pause connection' : 'Restore connection'}</button>
          </div>
          <AiNote title="Scheduling assistant">Based on attendee availability and quiet hours, Thursday 11:00 IST is the best slot. Invitation will be created only after you confirm.</AiNote>
        </div>
      </div>

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.title ?? ''} subtitle={detail ? `${detail.id} · ${detail.date}` : ''}
        footer={detail && <>
          <button className="btn-secondary" onClick={() => { update('calendar', detail.id, { status: 'Cancelled' }); notify('Meeting cancelled', 'Cancellation synced to provider and CRM activity updated.'); setDetail(null); }}><ShieldCheck size={15} /> Cancel meeting</button>
          <button className="btn-secondary" onClick={() => navigate(`/calendar/${detail.id}/edit`)}><Pencil size={15} /> Edit details</button>
          <button className="btn-primary" onClick={() => notify('Notes opened', 'Meeting notes editor with source-linked summaries.', 'info')}><FileText size={15} /> Meeting notes</button>
        </>}>
        {detail && <div className="space-y-4">
          <div className="flex gap-2"><Badge tone={toneFor(detail.status)}>{detail.status}</Badge><Badge tone="slate">{detail.type}</Badge></div>
          <InfoCard title="Meeting details" rows={Object.entries(detail).map(([k, v]) => [k, String(v)])} />
          <Timeline items={[
            { title: 'Meeting proposed', meta: detail.attendees, tone: 'blue' },
            { title: 'Availability checked', meta: 'Timezone: Asia/Kolkata', tone: 'purple' },
            { title: 'Provider event created', meta: detail.provider, body: 'Provider event ID stored for idempotent sync.', tone: 'green' },
            { title: 'CRM activity linked', meta: detail.crm, tone: 'teal' },
          ]} />
        </div>}
      </Drawer>

    </div>
  );
}

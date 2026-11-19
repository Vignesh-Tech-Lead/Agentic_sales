import React, { useMemo, useState } from 'react';
import { Inbox, Search, Mail, Paperclip, Send, Sparkles, UserPlus, Archive, ShieldCheck, Ban, ListTodo, LockKeyhole } from 'lucide-react';
import { useApp } from '../lib/store';
import { cx, toneFor } from '../lib/format';
import { PageHeader, Badge, Avatar, Notice, AiNote, InfoCard } from '../components/ui';
import type { Row } from '../lib/types';

const folders = ['All', 'Open', 'Unassigned', 'Replied', 'Suppressed', 'Closed'];

export function InboxPage() {
  const { get, update, notify } = useApp();
  const threads = get('inbox');
  const [folder, setFolder] = useState('All');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(threads[0]?.id);
  const [draft, setDraft] = useState('');
  const [showDraft, setShowDraft] = useState(false);

  const visible = useMemo(() => threads.filter((t) =>
    (folder === 'All' || (folder === 'Unassigned' ? t.owner === 'Unassigned' : t.status === folder)) &&
    `${t.subject} ${t.contact} ${t.company}`.toLowerCase().includes(query.toLowerCase())), [threads, folder, query]);
  const active = threads.find((t) => t.id === activeId) ?? visible[0];

  const send = () => {
    if (!draft.trim()) return notify('Draft is empty', 'Write a reply or accept the AI-suggested draft first.', 'warning');
    if (active?.status === 'Suppressed') return notify('Send blocked', 'This contact has opted out. Suppression overrides all engagement signals.', 'danger');
    notify('Send requires approval', 'The draft was saved. An authorized reviewer must approve the exact payload before delivery.', 'info');
    setShowDraft(false); setDraft('');
  };

  return (
    <div className="animate-fade-up">
      <PageHeader title="Unified Inbox" subtitle="Inbound and outbound conversations with CRM context, intent detection and grounded reply suggestions."
        icon={Inbox} breadcrumb="Module 10 of 25"
        actions={[
          <button key="task" className="btn-secondary" onClick={() => notify('Task created', 'Follow-up task linked to this thread with preference checks enabled.', 'info')}><ListTodo size={15} /> Create task</button>,
          <button key="refresh" className="btn-primary" onClick={() => notify('Incremental sync complete', 'IMAP checkpoint advanced. No duplicate messages were stored.', 'success')}><Mail size={15} /> Sync mailbox</button>,
        ]} />

      <div className="mb-4"><Notice tone="warning" title="Untrusted content"><span>Email bodies are data, not instructions. AI suggestions cannot change tool permissions, reveal secrets, or send messages without approval.</span></Notice></div>

      <div className="card grid min-h-[680px] grid-cols-1 overflow-hidden lg:grid-cols-[300px_minmax(0,1fr)_280px]">
        {/* Thread list */}
        <div className="flex min-h-0 flex-col border-r border-slate-200">
          <div className="border-b border-slate-100 p-3">
            <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input py-2 pl-9 text-xs" placeholder="Search conversations…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
            <div className="mt-2 flex gap-1 overflow-x-auto">
              {folders.map((f) => <button key={f} onClick={() => setFolder(f)}
                className={cx('whitespace-nowrap rounded-lg px-2 py-1 text-[10px] font-semibold transition', folder === f ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}>{f}</button>)}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {visible.map((t) => (
              <button key={t.id} onClick={() => { setActiveId(t.id); setShowDraft(false); }}
                className={cx('w-full border-b border-slate-100 p-3 text-left transition hover:bg-brand-50/40', active?.id === t.id && 'bg-brand-50/70 ring-1 ring-inset ring-brand-100')}>
                <div className="flex items-center gap-2">
                  <Avatar name={t.contact} size="sm" />
                  <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">{t.contact}</p><p className="truncate text-[10px] text-slate-400">{t.company}</p></div>
                  <span className="text-[10px] text-slate-400">{t.updated}</span>
                </div>
                <p className="mt-2 truncate text-xs font-semibold text-slate-700">{t.subject}</p>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">{t.preview}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <Badge tone={toneFor(t.intent)}>{t.intent}</Badge>
                  <Badge tone={toneFor(t.status)}>{t.status}</Badge>
                  {t.unread > 0 && <span className="ml-auto rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">{t.unread}</span>}
                </div>
              </button>
            ))}
            {!visible.length && <p className="p-6 text-center text-xs text-slate-400">No conversations in this view.</p>}
          </div>
        </div>

        {/* Conversation */}
        <div className="flex min-h-0 flex-col bg-white">
          {active ? <>
            <div className="border-b border-slate-100 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><h2 className="text-sm font-bold text-slate-900">{active.subject}</h2><p className="mt-0.5 text-[11px] text-slate-500">{active.contact} · {active.company} · {active.messages} messages</p></div>
                <div className="flex gap-1.5">
                  <Badge tone={toneFor(active.intent)}>{active.intent}</Badge>
                  <Badge tone={toneFor(active.status)}>{active.status}</Badge>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-secondary btn-sm" onClick={() => notify('Thread assigned', `Assigned to Ananya Rao. Resource-level permission verified.`, 'info')}><UserPlus size={13} /> Assign</button>
                <button className="btn-secondary btn-sm" onClick={() => notify('Thread archived', `${active.id} moved to archive. Source message metadata preserved.`, 'info')}><Archive size={13} /> Archive</button>
                <select className="input w-auto py-1.5 text-xs" defaultValue={active.owner} onChange={(e) => { update('inbox', active.id, { owner: e.target.value }); notify('Owner updated', 'Thread assignment audited.', 'info'); }}>
                  {['Unassigned', 'Ananya Rao', 'Kabir Shah', 'Meera Iyer'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50/60 p-4">
              <MessageBubble from={active.contact} time="10:14" body={active.preview} />
              <MessageBubble from="Ananya Rao" time="10:22" body="Thanks for the note. I’ve shared a draft scope with your team and will confirm the phase-one timeline shortly." own />
              <MessageBubble from={active.contact} time="10:42" body={active.preview} />
              <div className="flex items-center justify-center gap-2 py-1 text-[10px] text-slate-400"><LockKeyhole size={11} /> HTML sanitized · attachments scanned · source metadata retained</div>
            </div>

            <div className="border-t border-slate-100 p-3">
              {showDraft ? <>
                <textarea className="textarea min-h-[110px] text-xs" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write your reply…" />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500">Draft only · exact payload will be bound to approval</span>
                  <div className="flex gap-2"><button className="btn-secondary btn-sm" onClick={() => setShowDraft(false)}>Cancel</button><button className="btn-primary btn-sm" onClick={send}><Send size={13} /> Submit for approval</button></div>
                </div>
              </> : <div className="flex flex-wrap gap-2">
                <button className="btn-primary" onClick={() => { setShowDraft(true); setDraft(`Hi ${active.contact.split(' ')[0]},\n\nThanks for your message. Based on our approved service scope, here's what I can confirm:\n\nRegards,\nAnanya`); }}
                  ><Sparkles size={15} /> AI-suggested reply</button>
                <button className="btn-secondary" onClick={() => { setShowDraft(true); setDraft(''); }}>Write from scratch</button>
                {active.status === 'Suppressed' && <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-600"><Ban size={13} /> Outbound blocked by suppression</span>}
              </div>}
            </div>
          </> : <div className="grid h-full place-items-center text-xs text-slate-400">Select a conversation</div>}
        </div>

        {/* Context panel */}
        <div className="min-h-0 overflow-y-auto border-l border-slate-200 bg-white p-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">CRM context</p>
          {active && <InfoCard title="Customer" rows={[
            ['Contact', active.contact], ['Company', active.company], ['Channel', active.channel],
            ['Owner', active.owner], ['Intent', active.intent], ['Messages', active.messages],
          ]} />}
          <div className="mt-4">{active && <AiNote title="Classification & next action">
            <p>{active.ai}.</p><p className="mt-2 opacity-80">Classification is schema-validated and based only on this authorized thread and approved internal knowledge.</p>
          </AiNote>}</div>
          <div className="mt-4 card-pad">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-800"><ShieldCheck size={14} className="text-teal-600" /> Communication policy</p>
            <ul className="space-y-2 text-[11px] text-slate-600">
              <li className="flex gap-2"><span className="dot mt-1.5 bg-emerald-500" /> Consent: opt-in recorded</li>
              <li className="flex gap-2"><span className="dot mt-1.5 bg-emerald-500" /> Suppression: not found</li>
              <li className="flex gap-2"><span className="dot mt-1.5 bg-amber-500" /> Approval: required for send</li>
              <li className="flex gap-2"><span className="dot mt-1.5 bg-brand-500" /> Quiet hours: 19:00–09:00 IST</li>
            </ul>
          </div>
          <div className="mt-4 card-pad">
            <p className="mb-2 text-xs font-bold text-slate-800">Linked records</p>
            <div className="space-y-1.5">{['Lead LD-2401', 'Opportunity OP-01', 'Task TASK-01'].map((x) => <button key={x} onClick={() => notify('Record opened', `${x} loaded in its module with tenant scope applied.`, 'info')} className="block w-full rounded-lg bg-slate-50 p-2 text-left text-[11px] font-semibold text-slate-700 hover:bg-brand-50">{x}</button>)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ from, time, body, own }: { from: string; time: string; body: string; own?: boolean }) {
  return (
    <div className={cx('flex gap-2.5', own && 'flex-row-reverse')}>
      <Avatar name={from} size="sm" />
      <div className={cx('max-w-[78%] rounded-2xl border p-3', own ? 'border-brand-100 bg-brand-50' : 'border-slate-200 bg-white')}>
        <p className="mb-1 text-[10px] font-semibold text-slate-500">{from} · {time}</p>
        <p className="text-xs leading-relaxed text-slate-700">{body}</p>
        <p className="mt-1.5 flex items-center gap-1 text-[9px] text-slate-400"><Paperclip size={9} /> Sanitized body · no external images loaded</p>
      </div>
    </div>
  );
}

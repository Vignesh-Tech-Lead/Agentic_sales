import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, Play, Pause, ShieldCheck, Activity, CircleDollarSign,
  Eye, Ban, Layers, Cpu,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { toneFor } from '../lib/format';
import { PageHeader, StatCard, Tabs, Notice, Badge, Drawer, InfoCard, AiNote, Timeline } from '../components/ui';
import { DataTable } from '../components/DataTable';
import type { Row } from '../lib/types';

const capabilities = [
  { id: 'Search documents', review: 'None', works: 'Approved documents' },
  { id: 'Find a lead', review: 'None', works: 'Your records' },
  { id: 'Create a task', review: 'Quick check', works: 'Assigned records' },
  { id: 'Draft an email', review: 'Quick check', works: 'Your conversations' },
  { id: 'Send an approved email', review: 'Approval required', works: 'Opted-in contacts' },
  { id: 'Suggest a stage', review: 'Suggestion only', works: 'Your pipeline' },
  { id: 'Draft a proposal', review: 'Quick check', works: 'Approved pricing' },
  { id: 'Check report figures', review: 'None', works: 'Published reports' },
];

export function AgentsPage() {
  const { get, update, notify } = useApp();
  const navigate = useNavigate();
  const agents = get('agents');
  const [tab, setTab] = useState('agents');
  const [detail, setDetail] = useState<Row | null>(null);
  const tasks = get('executions');

  useEffect(() => {
    const queued = tasks.find((task) => task.status === 'Queued');
    if (!queued) return;
    const timer = window.setTimeout(() => {
      update('executions', queued.id, { status: 'Completed', duration: '1.6 s', cost: '₹0.54' });
      notify('Task complete', 'The result is ready with notes attached.', 'success');
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [tasks, update, notify]);

  return (
    <div className="animate-fade-up">
      <PageHeader title="AI Helpers" subtitle="Let helpers handle routine work, with review before anything important is sent." breadcrumb="Intelligence & automation"
        actions={[
          <button key="guidelines" className="btn-secondary" onClick={() => setTab('guidelines')}><ShieldCheck size={15} /> Guidelines</button>,
          <button key="run" className="btn-primary" onClick={() => navigate('/agents/new')}><Play size={15} /> Start a task</button>,
        ]} />

      <div className="mb-4"><Notice tone="info"><span>Helpers use approved company information. Messages and proposals need approval before they are sent.</span></Notice></div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Available helpers" value={agents.length} icon={Bot} hint="Ready for your team" />
        <StatCard label="Tasks today" value="2,684" icon={Activity} tone="green" delta="+7.1%" hint="Completed today" />
        <StatCard label="Waiting for review" value="0" icon={ShieldCheck} tone="teal" hint="Nothing urgent" />
        <StatCard label="Cost per task" value="₹0.61" icon={CircleDollarSign} tone="purple" hint="Within your limits" />
      </div>

      <div className="card mb-6 overflow-hidden">
        <div className="px-4 pt-3"><Tabs value={tab} onChange={setTab} items={[
          { id: 'agents', label: 'Helpers', count: agents.length }, { id: 'tasks', label: 'Tasks', count: tasks.length },
          { id: 'capabilities', label: 'What they can do', count: capabilities.length }, { id: 'guidelines', label: 'Guidelines' },
        ]} /></div>
        <div className="p-4">
          {tab === 'agents' && <div className="grid gap-4 xl:grid-cols-2">
            {agents.map((agent) => (
              <div key={agent.id} className="card-pad transition hover:shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><Cpu size={18} /></span>
                    <div><p className="text-sm font-bold text-slate-900">{agent.name}</p><p className="text-[11px] text-slate-500">{agent.purpose}</p></div>
                  </div>
                  <Badge tone={toneFor(agent.status)} dot>{agent.status}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-y-3 text-[11px]">
                  <div><p className="text-slate-400">Tasks done</p><p className="font-semibold text-slate-700">{agent.runs}</p></div>
                  <div><p className="text-slate-400">Success rate</p><p className="font-semibold text-slate-700">{agent.success}</p></div>
                  <div><p className="text-slate-400">Approval</p><p className="font-semibold text-slate-700">{agent.approval}</p></div>
                  <div><p className="text-slate-400">Last task</p><p className="font-semibold text-slate-700">{agent.lastRun}</p></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">{String(agent.tools).split(', ').map((tool) => <span key={tool} className="badge-slate">{tool}</span>)}</div>
                <div className="mt-4 flex gap-2">
                  <button className="btn-secondary btn-sm" onClick={() => setDetail(agent)}><Eye size={13} /> View details</button>
                  <button className="btn-secondary btn-sm" onClick={() => {
                    const next = agent.status === 'Paused' ? 'Active' : 'Paused';
                    update('agents', agent.id, { status: next });
                    notify(next === 'Active' ? 'Helper enabled' : 'Helper paused', `${agent.name} has been updated.`, 'info');
                  }}>
                    {agent.status === 'Paused' ? <Play size={13} /> : <Pause size={13} />}{agent.status === 'Paused' ? 'Enable' : 'Pause'}
                  </button>
                </div>
              </div>
            ))}
          </div>}

          {tab === 'tasks' && <div>
            {tasks.some((task) => task.status === 'Queued') && <div className="mb-3 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3 text-xs text-brand-800"><span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" /> Your task is running…</div>}
            <DataTable rows={tasks} columns={[
              { key: 'id', label: 'Task' }, { key: 'agent', label: 'Helper' }, { key: 'entity', label: 'Record' },
              { key: 'status', label: 'Status', badge: true }, { key: 'duration', label: 'Time taken' }, { key: 'cost', label: 'Cost' },
            ]} onRowClick={(row) => setDetail(row)} />
          </div>}

          {tab === 'capabilities' && <div>
            <p className="mb-3 text-xs text-slate-500">A quick look at what each helper can do and when it asks for review.</p>
            <DataTable rows={capabilities} columns={[
              { key: 'id', label: 'Capability' },
              { key: 'review', label: 'Review needed', badge: true }, { key: 'works', label: 'Where it works' },
            ]} />
          </div>}

          {tab === 'guidelines' && <div className="grid gap-4 xl:grid-cols-2">
            <InfoCard title="How helpers work" rows={[
              ['Messages and documents', 'Treated as information only'],
              ['Important actions', 'Need your approval'],
              ['Information', 'Kept inside your workspace'],
              ['Results', 'Checked before they are used'],
              ['Notes', 'A short summary is included'],
            ]} />
            <InfoCard title="Starting a task" rows={[
              ['What you give it', 'A task and the record to work on'],
              ['Limits', 'Only the actions you have allowed'],
              ['Result', 'A clear summary and suggested next step'],
              ['Status', 'Queued, running or complete'],
            ]} />
            <div className="xl:col-span-2"><AiNote title="Good to know">Results are checked before they are used.</AiNote></div>
          </div>}
        </div>
      </div>

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.name ?? detail?.agent ?? ''} subtitle={detail ? `${detail.id} · ${detail.status}` : ''}
        footer={detail && <button className="btn-secondary" onClick={() => notify('Summary exported', 'Your task summary has been downloaded.', 'info')}><Layers size={15} /> Export summary</button>}>
        {detail && <div className="space-y-4">
          <div className="flex gap-2"><Badge tone={toneFor(detail.status)}>{detail.status}</Badge>{detail.version && <Badge tone="purple">{detail.version}</Badge>}</div>
          <InfoCard title="Task details" rows={[
            ['Helper', detail.name ?? detail.agent ?? '—'],
            ['What it does', detail.purpose ?? detail.task ?? '—'],
            ['Related record', detail.entity ?? '—'],
            ['Capabilities', detail.tools ?? '—'],
            ['Approval', detail.approval ?? 'Quick check'],
            ['Last task', detail.lastRun ?? detail.time ?? '—'],
          ]} />
          <AiNote title="Summary">This helper used only approved information and paused where review was needed.</AiNote>
          <Timeline items={[
            { title: 'Task queued', meta: `${detail.id} · Northstar workspace`, tone: 'blue' },
            { title: 'Guidelines applied', meta: 'Workspace rules', body: 'Only the allowed actions were available.', tone: 'purple' },
            { title: 'Documents checked', meta: 'Approved company knowledge', tone: 'teal' },
            { title: 'Result ready', meta: detail.success ?? 'Complete', tone: 'green' },
          ]} />
          <div className="flex gap-2"><button className="btn-secondary btn-sm" onClick={() => notify('Cancelled', 'The task has been cancelled.', 'info')}><Ban size={13} /> Cancel task</button></div>
        </div>}
      </Drawer>

    </div>
  );
}

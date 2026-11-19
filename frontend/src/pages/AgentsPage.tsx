import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, Play, Pause, ShieldCheck, Sparkles, Activity, CircleDollarSign, Timer,
  KeyRound, Eye, Ban, CheckCircle2, Layers, Cpu,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { toneFor, cx } from '../lib/format';
import { PageHeader, StatCard, Tabs, Notice, Badge, Drawer, InfoCard, AiNote, Timeline } from '../components/ui';
import { DataTable } from '../components/DataTable';
import type { Row } from '../lib/types';

const toolRegistry = [
  { id: 'knowledge.search', risk: 'Low', permission: 'knowledge.read', idempotent: 'Read-only', timeout: '4 s', scope: 'ACL-filtered' },
  { id: 'crm.get_lead', risk: 'Low', permission: 'lead.read', idempotent: 'Read-only', timeout: '3 s', scope: 'Tenant + owner' },
  { id: 'crm.create_task', risk: 'Medium', permission: 'task.create', idempotent: 'Key required', timeout: '8 s', scope: 'Assigned records' },
  { id: 'email.create_draft', risk: 'Medium', permission: 'email.draft', idempotent: 'Key required', timeout: '10 s', scope: 'Assigned threads' },
  { id: 'email.send_approved', risk: 'High', permission: 'email.send', idempotent: 'Approval hash', timeout: '15 s', scope: 'Suppression checked' },
  { id: 'funnel.propose_transition', risk: 'Medium', permission: 'funnel.read', idempotent: 'Advisory', timeout: '5 s', scope: 'Policy-gated' },
  { id: 'proposal.create_draft', risk: 'Medium', permission: 'proposal.draft', idempotent: 'Key required', timeout: '12 s', scope: 'Approved price books' },
  { id: 'report.query_metrics', risk: 'Low', permission: 'report.read', idempotent: 'Read-only', timeout: '6 s', scope: 'Allowlisted metrics' },
];

export function AgentsPage() {
  const { get, update, notify } = useApp();
  const navigate = useNavigate();
  const agents = get('agents');
  const [tab, setTab] = useState('agents');
  const [detail, setDetail] = useState<Row | null>(null);
  const executions = get('executions');

  useEffect(() => {
    const queued = executions.find((e) => e.status === 'Queued');
    if (!queued) return;
    const timer = window.setTimeout(() => {
      update('executions', queued.id, { status: 'Completed', duration: '1.6 s', cost: '₹0.54' });
      notify('Execution completed', 'Output validated against result schema. Evidence references attached.', 'success');
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [executions, update, notify]);

  return (
    <div className="animate-fade-up">
      <PageHeader title="Agent Orchestration" subtitle="Specialized agents with bounded tools, versioned policies, budgets and full execution traceability."
        icon={Bot} breadcrumb="Module 7 of 25"
        actions={[
          <button key="policy" className="btn-secondary" onClick={() => setTab('policies')}><ShieldCheck size={15} /> Policies</button>,
          <button key="run" className="btn-primary" onClick={() => navigate('/agents/new')}><Play size={15} /> Run agent</button>,
        ]} />

      <div className="mb-4"><Notice tone="info"><span>Agents cannot exceed granted tools, access other tenants, or perform external side effects without approval. Hidden chain-of-thought is never stored.</span></Notice></div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Registered agents" value={agents.length} icon={Bot} hint="Versioned definitions" />
        <StatCard label="Executions today" value="2,684" icon={Activity} tone="green" delta="+7.1%" hint="Across all agents" />
        <StatCard label="Tool-policy violations" value="0" icon={ShieldCheck} tone="teal" hint="Target zero" />
        <StatCard label="Avg. cost / execution" value="₹0.61" icon={CircleDollarSign} tone="purple" hint="Budget capped" />
      </div>

      <div className="card mb-6 overflow-hidden">
        <div className="px-4 pt-3"><Tabs value={tab} onChange={setTab} items={[
          { id: 'agents', label: 'Agents', count: agents.length }, { id: 'executions', label: 'Executions', count: executions.length },
          { id: 'tools', label: 'Tool registry', count: toolRegistry.length }, { id: 'policies', label: 'Policies' },
        ]} /></div>
        <div className="p-4">
          {tab === 'agents' && <div className="grid gap-4 xl:grid-cols-2">
            {agents.map((a) => (
              <div key={a.id} className="card-pad transition hover:shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><Cpu size={18} /></span>
                    <div><p className="text-sm font-bold text-slate-900">{a.name}</p><p className="text-[11px] text-slate-500">{a.purpose}</p></div>
                  </div>
                  <Badge tone={toneFor(a.status)} dot>{a.status}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-y-3 text-[11px]">
                  <div><p className="text-slate-400">Model</p><p className="font-semibold text-slate-700">{a.model}</p></div>
                  <div><p className="text-slate-400">Version / policy</p><p className="font-semibold text-slate-700">{a.version} · {a.policy}</p></div>
                  <div><p className="text-slate-400">Runs / success</p><p className="font-semibold text-slate-700">{a.runs} · {a.success}</p></div>
                  <div><p className="text-slate-400">Approval</p><p className="font-semibold text-slate-700">{a.approval}</p></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">{String(a.tools).split(', ').map((t) => <span key={t} className="code">{t}</span>)}</div>
                <div className="mt-4 flex gap-2">
                  <button className="btn-secondary btn-sm" onClick={() => setDetail(a)}><Eye size={13} /> Inspect</button>
                  <button className="btn-secondary btn-sm" onClick={() => { update('agents', a.id, { status: a.status === 'Paused' ? 'Active' : 'Paused' }); notify(a.status === 'Paused' ? 'Agent enabled' : 'Agent paused', `${a.name} status changed and feature flag recorded.`, 'info'); }}>
                    {a.status === 'Paused' ? <Play size={13} /> : <Pause size={13} />}{a.status === 'Paused' ? 'Enable' : 'Pause'}
                  </button>
                </div>
              </div>
            ))}
          </div>}

          {tab === 'executions' && <div>
            {executions.some((e) => e.status === 'Queued') && <div className="mb-3 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3 text-xs text-brand-800"><span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" /> Execution in progress — queued, then running and schema validation…</div>}
            <DataTable rows={executions} columns={[
              { key: 'id', label: 'Execution' }, { key: 'agent', label: 'Agent' }, { key: 'entity', label: 'Entity' },
              { key: 'status', label: 'Status', badge: true }, { key: 'model', label: 'Model' },
              { key: 'tools', label: 'Tools used' }, { key: 'duration', label: 'Duration' }, { key: 'cost', label: 'Cost' },
            ]} onRowClick={(row) => setDetail(row)} />
          </div>}

          {tab === 'tools' && <div>
            <p className="mb-3 text-xs text-slate-500">Every tool declares schema, permission, risk level, idempotency strategy, timeout and audit policy. Unknown tool names are rejected.</p>
            <DataTable rows={toolRegistry.map((t, i) => ({ ...t, key: `TOOL-${i + 1}` }))} columns={[
              { key: 'id', label: 'Tool ID' }, { key: 'permission', label: 'Required permission' },
              { key: 'risk', label: 'Risk', badge: true }, { key: 'scope', label: 'Scope' },
              { key: 'idempotent', label: 'Idempotency' }, { key: 'timeout', label: 'Timeout' },
            ]} />
          </div>}

          {tab === 'policies' && <div className="grid gap-4 xl:grid-cols-2">
            <InfoCard title="POL-2026.04 — Active policy" rows={[
              ['Untrusted content', 'Email, docs and customer text are data'],
              ['Tool authorization', 'Enforced outside the model'],
              ['High-risk actions', 'Exact payload approval required'],
              ['Data access', 'Tenant + resource ACL on every call'],
              ['Output', 'JSON schema validated'],
              ['Reasoning', 'Concise decision summary only'],
            ]} />
            <InfoCard title="Execution contract" rows={[
              ['Input', 'execution_id, tenant_id, actor, task_type, entity refs'],
              ['Controls', 'allowed_tools, knowledge_scope, policy_version'],
              ['Budget', 'deadline, max_tokens, max_cost'],
              ['Output', 'status, decision, rationale, evidence_refs'],
              ['State machine', 'queued, running, waiting_approval, completed'],
              ['Terminal states', 'rejected, failed, cancelled, timed_out'],
            ]} />
            <div className="xl:col-span-2"><AiNote title="Policy reminder">New tool permissions are a critical change requiring owner sign-off. A regression test must be added before an agent or tool is re-enabled after an incident.</AiNote></div>
          </div>}
        </div>
      </div>

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.name ?? detail?.agent ?? ''} subtitle={detail ? `${detail.id} · ${detail.status}` : ''}
        footer={detail && <button className="btn-secondary" onClick={() => notify('Execution trace exported', 'Redacted trace including tool calls and evidence references.', 'info')}><Layers size={15} /> Export trace</button>}>
        {detail && <div className="space-y-4">
          <div className="flex gap-2"><Badge tone={toneFor(detail.status)}>{detail.status}</Badge>{detail.version && <Badge tone="purple">{detail.version}</Badge>}{detail.model && <Badge tone="blue">{detail.model}</Badge>}</div>
          <InfoCard title="Execution contract" rows={Object.entries(detail).filter(([k]) => !['id', 'name', 'purpose', 'status', 'runs', 'success', 'lastRun'].includes(k)).map(([k, v]) => [k, String(v)])} />
          <AiNote title="Concise decision summary">The agent used only the supplied authorized evidence. Output matched the declared result schema; no disallowed tool was invoked and no hidden reasoning was persisted.</AiNote>
          <Timeline items={[
            { title: 'Execution queued', meta: `${detail.id} · tenant Northstar`, tone: 'blue' },
            { title: 'Policy resolved', meta: detail.policy ?? 'POL-2026.04', body: 'Tool allowlist and budget loaded from immutable version.', tone: 'purple' },
            { title: 'Evidence retrieved', meta: 'ACL-filtered internal knowledge', tone: 'teal' },
            { title: 'Output validated', meta: detail.success ?? 'Schema passed', tone: 'green' },
          ]} />
          <div className="flex gap-2"><button className="btn-secondary btn-sm" onClick={() => notify('Cancelled', 'Execution cancellation recorded without erasing prior attempts.', 'info')}><Ban size={13} /> Cancel execution</button></div>
        </div>}
      </Drawer>

    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Workflow, Plus, Play, Rocket, GitBranch, ShieldCheck, RotateCcw, Eye,
  Zap, GitCommitHorizontal, CheckCircle2, Ban, Clock3, Layers, Pencil, ArrowRight,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { toneFor, cx } from '../lib/format';
import { PageHeader, StatCard, Tabs, Notice, Badge, Drawer, InfoCard, AiNote, Timeline, FormGrid, validateFields } from '../components/ui';
import { DataTable } from '../components/DataTable';
import type { Row } from '../lib/types';

const nodeTypes = ['Trigger', 'Condition', 'Action', 'Approval', 'Delay', 'End'];
const mockNodes = [
  { id: 'n1', type: 'Trigger', label: 'Willingness score ≥ 75', detail: 'Event: willingness.score.changed' },
  { id: 'n2', type: 'Condition', label: 'Contact not suppressed', detail: 'Allows: consent = opt-in AND suppression = false' },
  { id: 'n3', type: 'Action', label: 'CRM.create_task', detail: 'Assign follow-up to lead owner · idempotent' },
  { id: 'n4', type: 'Approval', label: 'Approve outbound draft', detail: 'Binds exact recipient, subject hash and policy version' },
  { id: 'n5', type: 'Action', label: 'Email.send_approved', detail: 'Rate-limited · suppression re-check at send time' },
];
const execRows: Row[] = [
  { id: 'WX-9012', workflow: 'Hot lead to proposal fast-track', version: 'v4', status: 'Completed', steps: 5, duration: '3.4 s', time: '19 Nov, 10:12', error: '—' },
  { id: 'WX-9011', workflow: 'Inbound email triage', version: 'v9', status: 'Completed', steps: 7, duration: '2.1 s', time: '19 Nov, 10:38', error: '—' },
  { id: 'WX-9010', workflow: 'Overdue task escalation', version: 'v2', status: 'Failed', steps: 3, duration: '1.0 s', time: '19 Nov, 08:05', error: 'PROVIDER_TIMEOUT' },
  { id: 'WX-9009', workflow: 'Hot lead to proposal fast-track', version: 'v4', status: 'Retrying', steps: 5, duration: '—', time: '19 Nov, 07:44', error: 'RATE_LIMIT (attempt 2)' },
];

export function WorkflowsPage() {
  const { get, update, notify } = useApp();
  const navigate = useNavigate();
  const flows = get('workflows');
  const [tab, setTab] = useState('builder');
  const [selectedFlow, setSelectedFlow] = useState(flows[0]?.id);
  const [nodes, setNodes] = useState(mockNodes);
  const [selectedNode, setSelectedNode] = useState(mockNodes[0]);
  const [detail, setDetail] = useState<Row | null>(null);
  const flow = flows.find((f) => f.id === selectedFlow) ?? flows[0];

  const addNode = (type: string) => {
    const node = { id: `n${nodes.length + 1}`, type, label: `${type} step`, detail: 'Configure parameters in the inspector' };
    setNodes([...nodes, node]); setSelectedNode(node);
    notify('Node added', `${type} node added to the draft graph. Published versions remain immutable.`, 'info');
  };

  const publish = () => {
    if (!flow) return;
    const next = `v${Number(flow.version.replace('v', '')) + 1}`;
    update('workflows', flow.id, { status: 'Published', version: next });
    notify('Version published', `${flow.name} ${next} is now immutable. Previous versions are retained for replay.`);
  };

  return (
    <div className="animate-fade-up">
      <PageHeader title="Workflow Builder" subtitle="Configure event, condition and action automations with immutable published versions, traces and safe replay."
        icon={Workflow} breadcrumb="Module 14 of 25"
        actions={[
          <button key="test" className="btn-secondary" onClick={() => { setTab('builder'); notify('Dry-run complete', '5 steps simulated. No external side effects were performed.', 'info'); }}><Play size={15} /> Dry run</button>,
          <button key="new" className="btn-primary" onClick={() => navigate('/workflows/new')}><Plus size={15} /> New workflow</button>,
        ]} />

      <div className="mb-4"><Notice tone="warning" title="Immutability"><span>Published versions cannot be edited. Changes create a new version; replay uses the original version and step-level idempotency to avoid duplicate side effects.</span></Notice></div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Workflows" value={flows.length} icon={Workflow} hint="2 published · 1 draft" />
        <StatCard label="Executions today" value="1,560" icon={Zap} tone="green" delta="+4.3%" hint="Across all versions" />
        <StatCard label="Success rate" value="98.9%" icon={CheckCircle2} tone="purple" hint="Retried attempts excluded" />
        <StatCard label="Stuck executions" value="1" icon={Clock3} tone="amber" hint="Operator review needed" />
      </div>

      <div className="card mb-6 overflow-hidden">
        <div className="px-4 pt-3"><Tabs value={tab} onChange={setTab} items={[
          { id: 'builder', label: 'Visual builder' }, { id: 'workflows', label: 'All workflows', count: flows.length },
          { id: 'executions', label: 'Executions', count: execRows.length },
        ]} /></div>
        <div className="p-4">
          {tab === 'builder' && <div>
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-3">
              <label className="text-[11px] font-semibold text-slate-500">Workflow</label>
              <select className="input w-auto min-w-[260px] py-2 text-xs" value={selectedFlow} onChange={(e) => setSelectedFlow(e.target.value)}>
                {flows.map((f) => <option key={f.id} value={f.id}>{f.name} · {f.version}</option>)}
              </select>
              {flow && <><Badge tone={toneFor(flow.status)}>{flow.status}</Badge><Badge tone="slate">Trigger: {flow.trigger}</Badge>
                <button className="btn-secondary btn-sm" onClick={() => navigate(`/workflows/${flow.id}/edit`)}><Pencil size={13} /> Edit details</button>
                <button className="btn-primary btn-sm" onClick={publish}><Rocket size={13} /> Publish new version</button></>}
            </div>
            <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
              <div className="min-h-[480px] rounded-2xl border border-slate-200 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] p-6">
                <div className="flex flex-wrap items-start gap-3">
                  {nodes.map((node, i) => (
                    <React.Fragment key={node.id}>
                      <button onClick={() => setSelectedNode(node)}
                        className={cx('w-[170px] card border-2 p-3 text-left transition hover:-translate-y-0.5',
                          selectedNode?.id === node.id ? 'border-brand-500 ring-4 ring-brand-100' : 'border-slate-200')}>
                        <span className={cx('mb-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase',
                          node.type === 'Trigger' ? 'bg-blue-50 text-blue-700' : node.type === 'Condition' ? 'bg-amber-50 text-amber-700' :
                          node.type === 'Approval' ? 'bg-violet-50 text-violet-700' : node.type === 'End' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700')}>
                          {node.type === 'Trigger' ? <Zap size={10} /> : node.type === 'Condition' ? <GitBranch size={10} /> : node.type === 'Approval' ? <ShieldCheck size={10} /> : <GitCommitHorizontal size={10} />}{node.type}
                        </span>
                        <p className="text-[11px] font-bold leading-snug text-slate-800">{node.label}</p>
                        <p className="mt-1 line-clamp-2 text-[9px] leading-relaxed text-slate-500">{node.detail}</p>
                        <p className="mt-2 font-mono text-[9px] text-slate-400">{node.id}</p>
                      </button>
                      {i < nodes.length - 1 && <ArrowRight size={16} className="mt-10 text-slate-300" />}
                    </React.Fragment>
                  ))}
                </div>
                <div className="mt-8 border-t border-dashed border-slate-200 pt-4">
                  <p className="mb-2 text-[11px] font-semibold text-slate-500">Add a node</p>
                  <div className="flex flex-wrap gap-2">{nodeTypes.map((t) => <button key={t} onClick={() => addNode(t)} className="btn-secondary btn-sm"><Plus size={12} /> {t}</button>)}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="card-pad">
                  <p className="section-title mb-3 flex items-center gap-2"><Pencil size={14} className="text-brand-600" /> Node inspector</p>
                  {selectedNode ? <>
                    <label className="label">Step name</label>
                    <input className="input text-xs" value={selectedNode.label} onChange={(e) => { const updated = { ...selectedNode, label: e.target.value }; setSelectedNode(updated); setNodes(nodes.map((n) => n.id === updated.id ? updated : n)); }} />
                    <label className="label mt-3">Type</label>
                    <input className="input text-xs" value={selectedNode.type} readOnly />
                    <label className="label mt-3">Configuration</label>
                    <textarea className="textarea min-h-[80px] text-xs" value={selectedNode.detail} onChange={(e) => { const updated = { ...selectedNode, detail: e.target.value }; setSelectedNode(updated); setNodes(nodes.map((n) => n.id === updated.id ? updated : n)); }} />
                    <p className="mt-2 text-[10px] text-slate-400">Graph validated for cycles and max depth before publish.</p>
                  </> : <p className="text-xs text-slate-400">Select a node to inspect it.</p>}
                </div>
                <div className="card-pad">
                  <p className="section-title mb-2">Guardrails</p>
                  <ul className="space-y-2 text-[11px] text-slate-600">
                    <li className="flex gap-2"><span className="dot mt-1.5 bg-emerald-500" /> Idempotency per execution-step</li>
                    <li className="flex gap-2"><span className="dot mt-1.5 bg-violet-500" /> Approval gate for external sends</li>
                    <li className="flex gap-2"><span className="dot mt-1.5 bg-amber-500" /> Bounded loop depth & timeout</li>
                    <li className="flex gap-2"><span className="dot mt-1.5 bg-brand-500" /> Manual replay with trace</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>}

          {tab === 'workflows' && <DataTable rows={flows} columns={[
            { key: 'id', label: 'ID' }, { key: 'name', label: 'Workflow' }, { key: 'trigger', label: 'Trigger' },
            { key: 'steps', label: 'Steps', type: 'number' }, { key: 'version', label: 'Version' },
            { key: 'status', label: 'Status', badge: true }, { key: 'runs', label: 'Runs', type: 'number' },
            { key: 'success', label: 'Success' }, { key: 'owner', label: 'Owner' },
          ]} onRowClick={(r) => { setSelectedFlow(r.id); setTab('builder'); }} />}

          {tab === 'executions' && <DataTable rows={execRows} columns={[
            { key: 'id', label: 'Execution' }, { key: 'workflow', label: 'Workflow' }, { key: 'version', label: 'Version' },
            { key: 'status', label: 'Status', badge: true }, { key: 'steps', label: 'Steps', type: 'number' },
            { key: 'duration', label: 'Duration' }, { key: 'error', label: 'Error' }, { key: 'time', label: 'Time' },
          ]} onRowClick={(r) => setDetail(r)} rowActions={(r) => <button onClick={() => notify('Execution replayed', `${r.id} replayed with step-level idempotency; no duplicate side effects.`, 'info')} className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600" title="Retry"><RotateCcw size={15} /></button>} />}
        </div>
      </div>

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.id ?? ''} subtitle={detail ? `${detail.workflow} · ${detail.version}` : ''}
        footer={detail && <button className="btn-primary" onClick={() => { notify('Manual replay started', 'Failed steps will retry with idempotency keys.', 'info'); setDetail(null); }}><RotateCcw size={15} /> Replay from failed step</button>}>
        {detail && <div className="space-y-4">
          <div className="flex gap-2"><Badge tone={toneFor(detail.status)}>{detail.status}</Badge>{detail.error !== '—' && <Badge tone="rose">{detail.error}</Badge>}</div>
          <InfoCard title="Execution summary" rows={Object.entries(detail).map(([k, v]) => [k, String(v)])} />
          <AiNote title="Failure analysis">The timeout occurred after provider acceptance was ambiguous. The safe path is reconciliation via provider message ID, not an automatic resend.</AiNote>
          <Timeline items={[
            { title: 'Execution started', meta: `${detail.id} · version ${detail.version}`, tone: 'blue' },
            { title: 'Trigger validated', meta: 'Event matched published graph', tone: 'purple' },
            { title: `Step 3 of ${detail.steps} failed`, meta: detail.error, tone: 'rose' },
            { title: 'Operator visibility', meta: 'Failed-task queue', body: 'Correlation ID and tenant scope preserved for replay.', tone: 'amber' },
          ]} />
        </div>}
      </Drawer>

    </div>
  );
}

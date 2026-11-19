import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Workflow, Plus, Play, Rocket, GitBranch, ShieldCheck, RotateCcw, Eye,
  Zap, GitCommitHorizontal, CheckCircle2, Clock3, Pencil, ArrowRight,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { toneFor, cx } from '../lib/format';
import { PageHeader, StatCard, Tabs, Notice, Badge, Drawer, InfoCard, AiNote, Timeline } from '../components/ui';
import { DataTable } from '../components/DataTable';
import type { Row } from '../lib/types';

const stepTypes = ['Start', 'Check', 'Action', 'Approval', 'Wait', 'Finish'];
const exampleSteps: { id: string; type: string; label: string; detail: string }[] = [];
const recentRuns: Row[] = [];

export function WorkflowsPage() {
  const { get, update, notify } = useApp();
  const navigate = useNavigate();
  const automations = get('workflows');
  const runs = get('executions');
  const [tab, setTab] = useState('builder');
  const [selectedAutomation, setSelectedAutomation] = useState(automations[0]?.id);
  const [steps, setSteps] = useState(exampleSteps);
  const [selectedStep, setSelectedStep] = useState(exampleSteps[0]);
  const [detail, setDetail] = useState<Row | null>(null);
  const automation = automations.find((item) => item.id === selectedAutomation) ?? automations[0];

  const addStep = (type: string) => {
    const step = { id: `s${steps.length + 1}`, type, label: `${type} step`, detail: 'Describe what should happen here' };
    setSteps([...steps, step]);
    setSelectedStep(step);
    notify('Step added', `${type} step added to your draft.`, 'info');
  };

  const publish = () => {
    if (!automation) return;
    const next = `v${Number(automation.version.replace('v', '')) + 1}`;
    update('workflows', automation.id, { status: 'Published', version: next });
    notify('Automation published', `${automation.name} ${next} is now live. Earlier versions are kept for reference.`);
  };

  return (
    <div className="animate-fade-up">
      <PageHeader title="Automations" subtitle="Set up simple routines for follow-ups, reviews and reminders." breadcrumb="Intelligence & automation"
        actions={[
          <button key="check" className="btn-secondary" onClick={() => { setTab('builder'); notify('Check complete', 'We walked through the steps without sending anything.', 'info'); }}><Play size={15} /> Check steps</button>,
          <button key="new" className="btn-primary" onClick={() => navigate('/workflows/new')}><Plus size={15} /> New automation</button>,
        ]} />

      <div className="mb-4"><Notice tone="info" title="Safe to change"><span>Editing a live automation creates a draft. Your current version keeps running until you publish the changes.</span></Notice></div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Automations" value={automations.length} icon={Workflow} hint="Ready for routine work" />
        <StatCard label="Recorded runs" value={runs.length} icon={Zap} tone="green" hint="Backend records" />
        <StatCard label="Completed runs" value={runs.filter((run) => run.status === 'Completed').length} icon={CheckCircle2} tone="purple" hint="Backend records" />
        <StatCard label="Needs attention" value={runs.filter((run) => run.status === 'Needs attention').length} icon={Clock3} tone="amber" hint="Backend records" />
      </div>

      <div className="card mb-6 overflow-hidden">
        <div className="px-4 pt-3"><Tabs value={tab} onChange={setTab} items={[
          { id: 'builder', label: 'Steps' }, { id: 'automations', label: 'Automations', count: automations.length },
          { id: 'runs', label: 'Recent runs', count: recentRuns.length },
        ]} /></div>
        <div className="p-4">
          {tab === 'builder' && <div>
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-3">
              <label className="text-[11px] font-semibold text-slate-500">Automation</label>
              <select className="input w-auto min-w-[260px] py-2 text-xs" value={selectedAutomation} onChange={(event) => setSelectedAutomation(event.target.value)}>
                {automations.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.version}</option>)}
              </select>
              {automation && <><Badge tone={toneFor(automation.status)}>{automation.status}</Badge><Badge tone="slate">Starts when: {automation.trigger}</Badge>
                <button className="btn-secondary btn-sm" onClick={() => navigate(`/workflows/${automation.id}/edit`)}><Pencil size={13} /> Edit details</button>
                <button className="btn-primary btn-sm" onClick={publish}><Rocket size={13} /> Publish changes</button></>}
            </div>
            <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
              <div className="min-h-[480px] rounded-2xl border border-slate-200 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] p-6">
                <div className="flex flex-wrap items-start gap-3">
                  {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                      <button onClick={() => setSelectedStep(step)}
                        className={cx('w-[170px] card border-2 p-3 text-left transition hover:-translate-y-0.5',
                          selectedStep?.id === step.id ? 'border-brand-500 ring-4 ring-brand-100' : 'border-slate-200')}>
                        <span className={cx('mb-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase',
                          step.type === 'Start' ? 'bg-blue-50 text-blue-700' : step.type === 'Check' ? 'bg-amber-50 text-amber-700' :
                            step.type === 'Approval' ? 'bg-violet-50 text-violet-700' : step.type === 'Finish' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700')}>
                          {step.type === 'Start' ? <Zap size={10} /> : step.type === 'Check' ? <GitBranch size={10} /> : step.type === 'Approval' ? <ShieldCheck size={10} /> : <GitCommitHorizontal size={10} />}{step.type}
                        </span>
                        <p className="text-[11px] font-bold leading-snug text-slate-800">{step.label}</p>
                        <p className="mt-1 line-clamp-2 text-[9px] leading-relaxed text-slate-500">{step.detail}</p>
                      </button>
                      {index < steps.length - 1 && <ArrowRight size={16} className="mt-10 text-slate-300" />}
                    </React.Fragment>
                  ))}
                </div>
                <div className="mt-8 border-t border-dashed border-slate-200 pt-4">
                  <p className="mb-2 text-[11px] font-semibold text-slate-500">Add a step</p>
                  <div className="flex flex-wrap gap-2">{stepTypes.map((type) => <button key={type} onClick={() => addStep(type)} className="btn-secondary btn-sm"><Plus size={12} /> {type}</button>)}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="card-pad">
                  <p className="section-title mb-3 flex items-center gap-2"><Pencil size={14} className="text-brand-600" /> Step details</p>
                  {selectedStep ? <>
                    <label className="label">Step name</label>
                    <input className="input text-xs" value={selectedStep.label} onChange={(event) => {
                      const updated = { ...selectedStep, label: event.target.value };
                      setSelectedStep(updated);
                      setSteps(steps.map((step) => step.id === updated.id ? updated : step));
                    }} />
                    <label className="label mt-3">Type</label>
                    <input className="input text-xs" value={selectedStep.type} readOnly />
                    <label className="label mt-3">Description</label>
                    <textarea className="textarea min-h-[80px] text-xs" value={selectedStep.detail} onChange={(event) => {
                      const updated = { ...selectedStep, detail: event.target.value };
                      setSelectedStep(updated);
                      setSteps(steps.map((step) => step.id === updated.id ? updated : step));
                    }} />
                    <p className="mt-2 text-[10px] text-slate-400">You can change steps before publishing.</p>
                  </> : <p className="text-xs text-slate-400">Select a step to see its details.</p>}
                </div>
                <div className="card-pad">
                  <p className="section-title mb-2">Safety checks</p>
                  <ul className="space-y-2 text-[11px] text-slate-600">
                    <li className="flex gap-2"><span className="dot mt-1.5 bg-emerald-500" /> Avoids duplicate actions</li>
                    <li className="flex gap-2"><span className="dot mt-1.5 bg-violet-500" /> Approval before sending</li>
                    <li className="flex gap-2"><span className="dot mt-1.5 bg-amber-500" /> Simple, limited steps</li>
                    <li className="flex gap-2"><span className="dot mt-1.5 bg-brand-500" /> Review past runs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>}

          {tab === 'automations' && <DataTable rows={automations} columns={[
            { key: 'id', label: 'Reference' }, { key: 'name', label: 'Automation' }, { key: 'trigger', label: 'Starts when' },
            { key: 'steps', label: 'Steps', type: 'number' }, { key: 'version', label: 'Version' },
            { key: 'status', label: 'Status', badge: true }, { key: 'runs', label: 'Runs', type: 'number' },
            { key: 'success', label: 'Success' }, { key: 'owner', label: 'Owner' },
          ]} onRowClick={(row) => { setSelectedAutomation(row.id); setTab('builder'); }} />}

          {tab === 'runs' && <DataTable rows={recentRuns} columns={[
            { key: 'id', label: 'Run' }, { key: 'automation', label: 'Automation' }, { key: 'version', label: 'Version' },
            { key: 'status', label: 'Status', badge: true }, { key: 'steps', label: 'Steps', type: 'number' },
            { key: 'duration', label: 'Time taken' }, { key: 'note', label: 'Note' }, { key: 'time', label: 'Time' },
          ]} onRowClick={(row) => setDetail(row)} rowActions={(row) => <button onClick={() => notify('Run restarted', `${row.id} started again without sending duplicates.`, 'info')} className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600" title="Retry"><RotateCcw size={15} /></button>} />}
        </div>
      </div>

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.id ?? ''} subtitle={detail ? `${detail.automation} · ${detail.version}` : ''}
        footer={detail && <button className="btn-primary" onClick={() => { notify('Retry started', 'We’ll try the unfinished step again.', 'info'); setDetail(null); }}><RotateCcw size={15} /> Retry this step</button>}>
        {detail && <div className="space-y-4">
          <div className="flex gap-2"><Badge tone={toneFor(detail.status)}>{detail.status}</Badge>{detail.note !== '—' && <Badge tone="rose">{detail.note}</Badge>}</div>
          <InfoCard title="Run details" rows={[
            ['Automation', detail.automation], ['Version', detail.version], ['Status', detail.status],
            ['Steps', detail.steps], ['Time taken', detail.duration], ['When', detail.time],
          ]} />
          <AiNote title="What happened">The message took too long to send. We’ll check it before trying again.</AiNote>
          <Timeline items={[
            { title: 'Run started', meta: `${detail.id} · ${detail.version}`, tone: 'blue' },
            { title: 'Ready to begin', meta: 'The automation was matched to a record', tone: 'purple' },
            { title: `Step 3 of ${detail.steps} needs attention`, meta: detail.note, tone: 'rose' },
            { title: 'Ready to retry', meta: 'Nothing has been sent twice', body: 'You can safely try the unfinished step again.', tone: 'amber' },
          ]} />
        </div>}
      </Drawer>

    </div>
  );
}

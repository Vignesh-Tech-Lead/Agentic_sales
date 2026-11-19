import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Ban, Plus, Sparkles, ShieldCheck, Activity, Clock3, History, Download, Upload, CheckCircle2, LockKeyhole } from 'lucide-react';
import { resourceModules } from '../config/resourceModules';
import { navModules } from '../lib/nav';
import { useApp } from '../lib/store';
import { money, toneFor, cx } from '../lib/format';
import type { Row } from '../lib/types';
import { DataTable } from './DataTable';
import {
  PageHeader, StatCard, Notice, Badge, Drawer, Tabs, InfoCard, AiNote,
  Timeline, EmptyState,
} from './ui';

const attentionStates = ['Overdue', 'Attention', 'Pending review', 'Needs review', 'Blocked', 'Suppressed', 'Draft', 'In review', 'Paused', 'Disabled', 'Failed', 'Invited', 'Extracting'];

export function ResourcePage({ configKey }: { configKey: string }) {
  const cfg = resourceModules[configKey];
  const { get, update, notify, role } = useApp();
  const navigate = useNavigate();
  const rows = get(configKey);
  const [detail, setDetail] = useState<Row | null>(null);
  const [tab, setTab] = useState('overview');
  const readOnly = role === 'Analyst/Auditor';

  const stats = useMemo(() => {
    const moneyKey = ['budget', 'amount', 'value', 'pipeline'].find((k) => rows.some((r) => typeof r[k] === 'number'));
    const totalMoney = moneyKey ? rows.reduce((s, r) => s + (Number(r[moneyKey]) || 0), 0) : 0;
    return {
      total: rows.length,
      active: rows.filter((r) => ['green', 'blue', 'purple', 'teal'].includes(toneFor(r.status ?? r.eligibility))).length,
      attention: rows.filter((r) => attentionStates.includes(String(r.status ?? ''))).length,
      totalMoney, moneyKey,
    };
  }, [rows]);

  const openCreate = () => {
    if (readOnly) return notify('Read-only role', 'Switch to an editing role in the profile menu to make changes.', 'warning');
    navigate(`/${configKey}/new`);
  };
  const openEdit = (row: Row) => {
    if (readOnly) return notify('Read-only role', 'Editing is not permitted for this role.', 'warning');
    setDetail(null);
    navigate(`/${configKey}/${row.id}/edit`);
  };

  const setStatus = (row: Row, status: string) => {
    update(configKey, row.id, { status });
    notify('Status updated', `${row.id} is now ${status}.`, 'info');
  };

  const detailFields = detail ? cfg.fields.filter((f) => detail[f.key] !== undefined) : [];
  const aiField = detail ? ['signal', 'ai', 'summary', 'dimensions', 'evidence', 'risk', 'narrative', 'objections'].find((k) => detail[k]) : undefined;

  return (
    <div className="animate-fade-up">
      <PageHeader title={cfg.title} subtitle={cfg.subtitle} icon={cfg.icon} breadcrumb={`Module ${navModules.find((m) => m.path === `/${configKey}`)?.spec ?? '—'} of 25`}
        actions={[
          <button key="import" className="btn-secondary" onClick={() => notify('Import preview opened', 'Rows will be validated before any record is created. No partial writes occur.', 'info')}><Upload size={15} /> Import</button>,
          <button key="sync" className="btn-secondary" onClick={() => notify('View exported', 'Current filtered view exported with tenant-safe fields only.', 'info')}><Download size={15} /> Export</button>,
          <button key="new" className="btn-primary" onClick={openCreate}><Plus size={16} /> {cfg.createLabel ?? 'New record'}</button>,
        ]} />

      {readOnly && <div className="mb-4"><Notice tone="warning" title="Read-only session"><span>You are previewing as Analyst/Auditor. All mutation controls are disabled and data access remains tenant-scoped.</span></Notice></div>}
      {cfg.banner && <div className="mb-4"><Notice tone="info">{cfg.banner}</Notice></div>}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={`Total ${cfg.entity}s`} value={stats.total} icon={cfg.icon} hint="Tenant-scoped records" />
        <StatCard label="Active / healthy" value={stats.active} icon={CheckCircle2} tone="green" delta="+8.2%" hint="vs last period" />
        <StatCard label="Needs attention" value={stats.attention} icon={Clock3} tone="amber" hint="Review or pending state" />
        {stats.moneyKey
          ? <StatCard label="Portfolio value" value={money(stats.totalMoney)} icon={Sparkles} tone="purple" hint="From current view" />
          : <StatCard label="Policy controls" value={cfg.features?.length ?? 0} icon={LockKeyhole} tone="purple" hint="Active guardrails" />}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(cfg.features ?? []).map((f) => <span key={f} className="badge-slate"><ShieldCheck size={12} className="text-teal-600" />{f}</span>)}
      </div>

      <DataTable
        rows={rows} columns={cfg.columns} filters={cfg.filters}
        onRowClick={(row) => { setDetail(row); setTab('overview'); }}
        rowActions={(row) => (
          <div className="flex items-center gap-1">
            <button title="View detail" onClick={() => { setDetail(row); setTab('overview'); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600"><Eye size={15} /></button>
            <button title="Edit" onClick={() => openEdit(row)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Pencil size={15} /></button>
            <button title="Disable" onClick={() => setStatus(row, 'Disabled')} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Ban size={15} /></button>
          </div>
        )}
      />

      <Drawer
        open={!!detail} onClose={() => setDetail(null)}
        title={detail ? String(detail.name ?? detail.title ?? detail.company ?? detail.contact ?? detail.prospect ?? detail.lead ?? detail.meeting ?? detail.section ?? detail.id) : ''}
        subtitle={detail ? `${detail.id} · ${detail.status ?? detail.eligibility ?? 'Record detail'}` : ''}
        footer={detail && !readOnly ? (
          <>
            <button className="btn-secondary" onClick={() => setStatus(detail, 'Archived')}>Archive</button>
            <button className="btn-primary" onClick={() => openEdit(detail)}><Pencil size={15} /> Edit record</button>
          </>
        ) : undefined}
      >
        {detail && (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge tone={toneFor(detail.status ?? detail.eligibility)} dot>{detail.status ?? detail.eligibility ?? 'Active'}</Badge>
              {detail.owner && <Badge tone="slate">Owner: {detail.owner}</Badge>}
              {detail.model && <Badge tone="purple">{detail.model}</Badge>}
              {detail.version && <Badge tone="blue">Version {detail.version}</Badge>}
            </div>
            <Tabs value={tab} onChange={setTab} items={[
              { id: 'overview', label: 'Overview' }, { id: 'activity', label: 'Activity' },
              { id: 'ai', label: 'AI & evidence' }, { id: 'audit', label: 'Audit trail' },
            ]} />
            <div className="pt-5">
              {tab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {detailFields.map((f) => (
                      <div key={f.key} className={cx(f.full && 'sm:col-span-2')}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{f.label}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-800">
                          {f.type === 'currency' ? money(detail[f.key], detail.currency) : Array.isArray(detail[f.key]) ? detail[f.key].join(', ') : String(detail[f.key] ?? '—')}
                        </p>
                      </div>
                    ))}
                  </div>
                  <InfoCard title="Record metadata" icon={Activity} rows={[
                    ['Record ID', detail.id], ['Tenant', 'Northstar Technologies'],
                    ['Created', detail.created ?? '—'], ['Last updated', detail.updated ?? 'Today'],
                    ['Access scope', 'Tenant + resource ACL'],
                  ]} />
                </div>
              )}
              {tab === 'activity' && (
                <Timeline items={[
                  { title: 'Record created', meta: detail.created ?? 'Earlier this month', body: 'Created through an authorized tenant-scoped workflow.', tone: 'blue' },
                  { title: 'Owner assigned', meta: detail.owner ?? 'System assignment', body: 'Assignment validated against the same tenant.', tone: 'purple' },
                  ...(detail.score ? [{ title: 'Willingness score calculated', meta: detail.model ?? 'Model v3.2', body: `Score ${detail.score}/100 with stored evidence references.`, tone: 'green' as const }] : []),
                  ...(detail.approval ? [{ title: 'Approval state recorded', meta: detail.approval, body: 'Approval is bound to the exact payload and policy version.', tone: 'amber' as const }] : []),
                  { title: 'Record opened', meta: 'Just now', body: `Viewed by ${role}.`, tone: 'slate' },
                ]} />
              )}
              {tab === 'ai' && (
                <div className="space-y-4">
                  {aiField ? <AiNote title="Grounded insight"><p>{String(detail[aiField])}</p><p className="mt-2 opacity-80">Source: authorized first-party records and approved internal knowledge only. AI output is advisory and clearly distinguished from confirmed facts.</p></AiNote>
                    : <EmptyState icon={Sparkles} title="No AI insight yet" message="Run an agent from the intelligence modules to attach evidence-backed analysis to this record." />}
                  <InfoCard title="Evidence & governance" rows={[
                    ['Knowledge scope', 'ACL-filtered internal documents'],
                    ['Model output', 'Schema-validated, advisory only'],
                    ['Human review', detail.approval ?? 'Recommended before external action'],
                    ['Hidden reasoning', 'Not stored'],
                  ]} />
                  <button className="btn-secondary w-full" onClick={() => notify('AI analysis queued', 'Execution started in the ai-orchestration queue. Results will appear here.', 'info')}><Sparkles size={15} /> Run grounded analysis</button>
                </div>
              )}
              {tab === 'audit' && (
                <div>
                  <p className="mb-3 text-xs text-slate-500">Immutable events related to this module. Sensitive values are redacted.</p>
                  <Timeline items={get('audit').slice(0, 4).map((a) => ({
                    title: String(a.action), meta: `${a.time} · ${a.actor} · ${a.result}`, body: `${a.entity} — ${a.tenant} tenant`, tone: toneFor(String(a.result)),
                  }))} />
                </div>
              )}
            </div>
          </>
        )}
      </Drawer>

    </div>
  );
}

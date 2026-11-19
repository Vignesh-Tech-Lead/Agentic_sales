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
      review: rows.filter((r) => ['In review', 'Pending review', 'Needs review', 'Waiting approval'].includes(String(r.status ?? ''))).length,
      totalMoney, moneyKey,
    };
  }, [rows]);

  const openCreate = () => {
    if (readOnly) return;
    navigate(`/${configKey}/new`);
  };
  const openEdit = (row: Row) => {
    if (readOnly) return;
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
      <PageHeader title={cfg.title} subtitle={cfg.subtitle} breadcrumb={navModules.find((m) => m.path === `/${configKey}`)?.group ?? 'Workspace'}
        actions={[
          <button key="import" className="btn-secondary" onClick={() => notify('Import preview opened', 'Review each row before adding it to your workspace.', 'info')}><Upload size={15} /> Import</button>,
          <button key="sync" className="btn-secondary" onClick={() => notify('View exported', 'Your filtered view is ready to download.', 'info')}><Download size={15} /> Export</button>,
          <button key="new" className="btn-primary" onClick={openCreate}><Plus size={16} /> {cfg.createLabel ?? 'New record'}</button>,
        ]} />


      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={`Total ${cfg.entity}s`} value={stats.total} icon={cfg.icon} hint="In your workspace" />
        <StatCard label="Active / healthy" value={stats.active} icon={CheckCircle2} tone="green" hint="Backend records" />
        <StatCard label="Needs attention" value={stats.attention} icon={Clock3} tone="amber" hint="Needs a look" />
        {stats.moneyKey
          ? <StatCard label="Portfolio value" value={money(stats.totalMoney)} icon={Sparkles} tone="purple" hint="From current view" />
          : <StatCard label="In review" value={stats.review} icon={Clock3} tone="purple" hint="Awaiting a look" />}
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
              {detail.version && <Badge tone="blue">Version {detail.version}</Badge>}
            </div>
            <Tabs value={tab} onChange={setTab} items={[
              { id: 'overview', label: 'Overview' }, { id: 'activity', label: 'Activity' },
              { id: 'ai', label: 'Insights' }, { id: 'history', label: 'History' },
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
                    ['Reference', detail.id], ['Workspace', 'Northstar Technologies'],
                    ['Created', detail.created ?? '—'], ['Last updated', detail.updated ?? 'Today'],
                    ['Shared with', 'Your team'],
                  ]} />
                </div>
              )}
              {tab === 'activity' && (
                <Timeline items={[
                  { title: 'Record created', meta: detail.created ?? 'Earlier this month', body: 'Added to your workspace.', tone: 'blue' },
                  { title: 'Owner assigned', meta: detail.owner ?? 'System assignment', body: 'Assigned to the record owner.', tone: 'purple' },
                  ...(detail.score ? [{ title: 'Interest score updated', meta: 'Based on recent activity', body: `Interest score ${detail.score}/100.`, tone: 'green' as const }] : []),
                  ...(detail.approval ? [{ title: 'Approval state recorded', meta: detail.approval, body: 'Approval recorded for this version.', tone: 'amber' as const }] : []),
                  { title: 'Record opened', meta: 'Just now', body: 'Opened just now.', tone: 'slate' },
                ]} />
              )}
              {tab === 'ai' && (
                <div className="space-y-4">
                  {aiField ? <AiNote title="Insight"><p>{String(detail[aiField])}</p><p className="mt-2 opacity-80">Use this suggestion alongside your own judgement.</p></AiNote>
                    : <EmptyState icon={Sparkles} title="No insight yet" message="Use an AI helper to add a summary to this record." />}
                  <InfoCard title="About this insight" rows={[
                    ['Source', 'Approved company documents'],
                    ['Suggestion', 'For review, not final'],
                    ['Next step', detail.approval ?? 'Check before sharing externally'],
                    ['Last checked', 'Just now'],
                  ]} />
                  <button className="btn-secondary w-full" onClick={() => notify('Insight requested', 'We’re preparing a summary for this record.', 'info')}><Sparkles size={15} /> Prepare insight</button>
                </div>
              )}
              {tab === 'history' && (
                <div>
                  <p className="mb-3 text-xs text-slate-500">Recent changes to this record. Private values stay hidden.</p>
                  <Timeline items={get('audit').slice(0, 4).map((a) => ({
                    title: String(a.action), meta: `${a.time} · ${a.actor} · ${a.result}`, body: `${a.entity} · ${a.tenant}`, tone: toneFor(String(a.result)),
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

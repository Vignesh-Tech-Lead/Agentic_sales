import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings2, ShieldCheck, KeyRound, History, Flag, Database, Save, Eye,
  CircleCheck, Clock3, LockKeyhole, RotateCcw, Plus,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { toneFor } from '../lib/format';
import { PageHeader, StatCard, Tabs, Notice, Badge, InfoCard, Toggle, FormGrid, validateFields } from '../components/ui';
import { DataTable } from '../components/DataTable';
import type { Row } from '../lib/types';

const flagSeed = [
  { id: 'FF-01', name: 'agent_orchestration', status: 'Enabled', scope: 'All tenants', owner: 'Platform' },
  { id: 'FF-02', name: 'whatsapp_channel', status: 'Enabled', scope: 'Northstar', owner: 'Growth' },
  { id: 'FF-03', name: 'autonomous_send', status: 'Disabled', scope: 'Global', owner: 'Security' },
  { id: 'FF-04', name: 'meeting_transcription', status: 'Enabled', scope: 'Consented meetings', owner: 'Privacy' },
];
const secrets = [
  { id: 'SK-01', reference: 'ai-provider-key', provider: 'Model provider', rotated: '01 Nov 2026', scope: 'Worker only' },
  { id: 'SK-02', reference: 'imap-oauth-token', provider: 'Google Workspace', rotated: '18 Oct 2026', scope: 'Email worker' },
  { id: 'SK-03', reference: 'object-storage-key', provider: 'Private storage', rotated: '12 Sep 2026', scope: 'Document worker' },
];
const retention = [
  { data: 'Raw email', period: '24 months', basis: 'Business + legal review', derived: 'Attachments, threads, search index' },
  { data: 'Documents', period: '36 months', basis: 'Contract + policy', derived: 'Chunks, embeddings, versions' },
  { data: 'Agent executions', period: '12 months', basis: 'Audit + evaluation', derived: 'Traces, evidence refs' },
  { data: 'Audit logs', period: '7 years', basis: 'Statutory (TBD)', derived: 'Immutable event store' },
];

export function AdminPage() {
  const { get, notify } = useApp();
  const navigate = useNavigate();
  const settings = get('admin');
  const [tab, setTab] = useState('settings');
  const [flags, setFlags] = useState(flagSeed);

  return (
    <div className="animate-fade-up">
      <PageHeader title="Admin, Settings & Audit" subtitle="Centralize configuration, integration settings, secret references, feature flags and immutable audit history."
        icon={Settings2} breadcrumb="Module 25 of 25"
        actions={[
          <button key="rotate" className="btn-secondary" onClick={() => notify('Rotation workflow started', 'Secret references rotate without exposing values in responses or logs.', 'info')}><RotateCcw size={15} /> Rotate secrets</button>,
          <button key="new" className="btn-primary" onClick={() => navigate('/admin/new')}><Plus size={15} /> New setting</button>,
        ]} />

      <div className="mb-4"><Notice tone="warning" title="Privileged changes"><span>Require re-authentication, versioning and audit. Secrets are masked in every UI, API response and log stream.</span></Notice></div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Settings" value={settings.length} icon={Settings2} hint="Versioned configuration" />
        <StatCard label="Feature flags" value={flags.length} icon={Flag} tone="purple" hint="Staged rollout" />
        <StatCard label="Secret references" value={secrets.length} icon={KeyRound} tone="green" hint="Values masked" />
        <StatCard label="Audit events" value="4,821" icon={History} tone="teal" hint="Immutable · 7-year basis" />
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 pt-3"><Tabs value={tab} onChange={setTab} items={[
          { id: 'settings', label: 'Settings', count: settings.length }, { id: 'flags', label: 'Feature flags' },
          { id: 'secrets', label: 'Secret references' }, { id: 'audit', label: 'Audit log' }, { id: 'retention', label: 'Retention' },
        ]} /></div>
        <div className="p-4">
          {tab === 'settings' && <DataTable rows={settings} columns={[
            { key: 'id', label: 'ID' }, { key: 'section', label: 'Section' }, { key: 'scope', label: 'Scope' },
            { key: 'value', label: 'Value' }, { key: 'version', label: 'Version' },
            { key: 'owner', label: 'Owner' }, { key: 'status', label: 'Status', badge: true }, { key: 'environment', label: 'Env' },
          ]} rowActions={(r) => <button onClick={() => navigate(`/admin/${r.id}/edit`)} className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600" title="Edit setting"><Save size={15} /></button>} />}

          {tab === 'flags' && <div className="space-y-3">
            {flags.map((f) => (
              <div key={f.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 p-4">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600"><Flag size={16} /></span>
                <div className="min-w-[200px] flex-1"><p className="font-mono text-xs font-bold text-slate-800">{f.name}</p><p className="text-[10px] text-slate-500">{f.scope} · owner: {f.owner}</p></div>
                <Badge tone={toneFor(f.status)}>{f.status}</Badge>
                <Toggle checked={f.status === 'Enabled'} onChange={(v) => {
                  setFlags(flags.map((x) => x.id === f.id ? { ...x, status: v ? 'Enabled' : 'Disabled' } : x));
                  notify(v ? 'Flag enabled' : 'Flag disabled', `${f.name} changed. Incident rollback is one toggle away.`, 'info');
                }} label={f.status === 'Enabled' ? 'On' : 'Off'} />
              </div>
            ))}
          </div>}

          {tab === 'secrets' && <div>
            <div className="mb-3"><Notice tone="info" title="Envelope encryption"><span>Values live in a secret manager or are encrypted with KMS-managed keys. UI shows references only; access is logged.</span></Notice></div>
            <DataTable rows={secrets} columns={[
              { key: 'id', label: 'ID' }, { key: 'reference', label: 'Reference' }, { key: 'provider', label: 'Provider' },
              { key: 'rotated', label: 'Last rotated' }, { key: 'scope', label: 'Scope' },
            ]} rowActions={() => <button onClick={() => notify('Value masked', 'Secret values are never returned to the browser.', 'info')} className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600"><Eye size={15} /></button>} />
          </div>}

          {tab === 'audit' && <div>
            <div className="mb-3"><Notice tone="info">Immutable audit events include actor, action, entity, tenant and timestamp. Sensitive values are redacted.</Notice></div>
            <DataTable rows={get('audit')} columns={[
              { key: 'id', label: 'ID' }, { key: 'actor', label: 'Actor' }, { key: 'action', label: 'Action' },
              { key: 'entity', label: 'Entity' }, { key: 'tenant', label: 'Tenant' },
              { key: 'time', label: 'Time' }, { key: 'result', label: 'Result', badge: true },
            ]} filters={[{ key: 'result', label: 'Result', options: ['Success', 'Blocked', 'Failed'] }]} />
          </div>}

          {tab === 'retention' && <div className="grid gap-4 xl:grid-cols-2">
            <div className="card overflow-hidden"><table className="w-full text-left"><thead><tr><th className="th">Data</th><th className="th">Period</th><th className="th">Basis</th></tr></thead>
              <tbody>{retention.map((r) => <tr key={r.data} className="table-row"><td className="td font-semibold">{r.data}</td><td className="td">{r.period}</td><td className="td">{r.basis}</td></tr>)}</tbody></table></div>
            <InfoCard title="Deletion propagation" rows={retention.map((r) => [r.data, r.derived] as [string, React.ReactNode])} />
          </div>}
        </div>
      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings2, ShieldCheck, Link2, History, SlidersHorizontal, Save,
  Plus, RefreshCw,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { toneFor } from '../lib/format';
import { PageHeader, StatCard, Tabs, Notice, Badge, InfoCard } from '../components/ui';
import { DataTable } from '../components/DataTable';

const integrations = [
  { id: 'IN-01', name: 'AI assistant', status: 'Enabled', scope: 'Everyone', owner: 'Workspace team' },
  { id: 'IN-02', name: 'WhatsApp updates', status: 'Enabled', scope: 'Northstar', owner: 'Growth team' },
  { id: 'IN-03', name: 'Automatic sending', status: 'Disabled', scope: 'Everyone', owner: 'Security team' },
  { id: 'IN-04', name: 'Meeting notes', status: 'Enabled', scope: 'Consented meetings', owner: 'Privacy team' },
];

const connections = [
  { id: 'CN-01', name: 'Writing assistant', provider: 'Built-in service', updated: '01 Nov 2026', usedFor: 'Drafting messages' },
  { id: 'CN-02', name: 'Team mailbox', provider: 'Google Workspace', updated: '18 Oct 2026', usedFor: 'Email conversations' },
  { id: 'CN-03', name: 'Document storage', provider: 'Private storage', updated: '12 Sep 2026', usedFor: 'Knowledge library' },
];

const retention = [
  { data: 'Email conversations', period: '24 months', basis: 'Business and legal review' },
  { data: 'Documents', period: '36 months', basis: 'Contract and policy' },
  { data: 'Helper activity', period: '12 months', basis: 'Service improvement' },
  { data: 'Workspace activity', period: '7 years', basis: 'Compliance' },
];

export function AdminPage() {
  const { get, notify } = useApp();
  const navigate = useNavigate();
  const settings = get('admin');
  const [tab, setTab] = useState('settings');
  const [items, setItems] = useState(integrations);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Workspace settings"
        subtitle="Manage settings, connected tools and activity for your team."
        icon={Settings2}
        breadcrumb="Platform"
        actions={[
          <button key="refresh" className="btn-secondary" onClick={() => notify('Settings refreshed', 'Your workspace preferences are up to date.', 'info')}><RefreshCw size={15} /> Refresh</button>,
          <button key="new" className="btn-primary" onClick={() => navigate('/admin/new')}><Plus size={15} /> New setting</button>,
        ]}
      />

      <div className="mb-4">
        <Notice tone="info" title="About changes">
          <span>Important changes are recorded for your team. Sensitive values stay hidden.</span>
        </Notice>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Settings" value={settings.length} icon={Settings2} hint="Workspace preferences" />
        <StatCard label="Integrations" value={items.length} icon={Link2} tone="purple" hint="Available tools" />
        <StatCard label="Connected services" value={connections.length} icon={ShieldCheck} tone="green" hint="Securely connected" />
        <StatCard label="Activity events" value="4,821" icon={History} tone="teal" hint="Recent history" />
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 pt-3">
          <Tabs value={tab} onChange={setTab} items={[
            { id: 'settings', label: 'Settings', count: settings.length },
            { id: 'integrations', label: 'Integrations' },
            { id: 'connections', label: 'Connected services' },
            { id: 'activity', label: 'Activity' },
            { id: 'data', label: 'Data' },
          ]} />
        </div>
        <div className="p-4">
          {tab === 'settings' && (
            <DataTable
              rows={settings}
              columns={[
                { key: 'id', label: 'Reference' }, { key: 'section', label: 'Area' }, { key: 'scope', label: 'Applies to' },
                { key: 'value', label: 'Value' }, { key: 'version', label: 'Version' },
                { key: 'owner', label: 'Owner' }, { key: 'status', label: 'Status', badge: true },
              ]}
              rowActions={(r) => (
                <button onClick={() => navigate(`/admin/${r.id}/edit`)} className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600" title="Edit setting"><Save size={15} /></button>
              )}
            />
          )}

          {tab === 'integrations' && (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 p-4">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600"><SlidersHorizontal size={16} /></span>
                  <div className="min-w-[200px] flex-1">
                    <p className="text-xs font-bold text-slate-800">{item.name}</p>
                    <p className="text-[10px] text-slate-500">{item.scope} · Managed by {item.owner}</p>
                  </div>
                  <Badge tone={toneFor(item.status)}>{item.status}</Badge>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => {
                      const enabled = item.status === 'Enabled';
                      setItems(items.map((x) => x.id === item.id ? { ...x, status: enabled ? 'Disabled' : 'Enabled' } : x));
                      notify(enabled ? 'Integration paused' : 'Integration enabled', `${item.name} has been updated.`, 'info');
                    }}
                  >
                    {item.status === 'Enabled' ? 'Pause' : 'Enable'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'connections' && (
            <div>
              <div className="mb-3">
                <Notice tone="info" title="Stored securely">
                  <span>Sign-in details are kept in a secure vault. The workspace only shows the connection name.</span>
                </Notice>
              </div>
              <DataTable
                rows={connections}
                columns={[
                  { key: 'id', label: 'Reference' }, { key: 'name', label: 'Connection' }, { key: 'provider', label: 'Provider' },
                  { key: 'updated', label: 'Last updated' }, { key: 'usedFor', label: 'Used for' },
                ]}
              />
            </div>
          )}

          {tab === 'activity' && (
            <div>
              <div className="mb-3">
                <Notice tone="info">A simple record of important changes made in your workspace.</Notice>
              </div>
              <DataTable
                rows={get('audit')}
                columns={[
                  { key: 'id', label: 'Reference' }, { key: 'actor', label: 'User' }, { key: 'action', label: 'Action' },
                  { key: 'entity', label: 'Record' }, { key: 'tenant', label: 'Workspace' },
                  { key: 'time', label: 'Time' }, { key: 'result', label: 'Result', badge: true },
                ]}
                filters={[{ key: 'result', label: 'Result', options: ['Success', 'Blocked', 'Failed'] }]}
              />
            </div>
          )}

          {tab === 'data' && (
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="card overflow-hidden">
                <table className="w-full text-left">
                  <thead><tr><th className="th">Information</th><th className="th">Kept for</th><th className="th">Why</th></tr></thead>
                  <tbody>
                    {retention.map((r) => (
                      <tr key={r.data} className="table-row">
                        <td className="td font-semibold">{r.data}</td><td className="td">{r.period}</td><td className="td">{r.basis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <InfoCard
                title="What this covers"
                rows={[
                  ['Email conversations', 'Messages, attachments and search copies'],
                  ['Documents', 'Files, versions and search copies'],
                  ['Helper activity', 'Summaries and results'],
                  ['Workspace activity', 'Important changes and who made them'],
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

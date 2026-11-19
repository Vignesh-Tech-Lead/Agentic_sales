import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, UserPlus, KeyRound, LockKeyhole, Users, Fingerprint, MonitorSmartphone, Check, Minus,
  Eye, Pencil, UserX, CheckCircle2,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { toneFor } from '../lib/format';
import { PageHeader, StatCard, Tabs, Notice, Badge, Drawer, InfoCard, Avatar } from '../components/ui';
import { DataTable } from '../components/DataTable';
import type { Row } from '../lib/types';

const permissionMatrix = [
  { permission: 'View leads', manager: 'yes', executive: 'yes', marketer: 'Own audiences', auditor: 'yes' },
  { permission: 'Edit leads', manager: 'yes', executive: 'Own records', marketer: 'no', auditor: 'no' },
  { permission: 'Approve campaigns', manager: 'yes', executive: 'no', marketer: 'yes', auditor: 'no' },
  { permission: 'Approve proposals', manager: 'yes', executive: 'no', marketer: 'no', auditor: 'no' },
  { permission: 'Manage documents', manager: 'no', executive: 'no', marketer: 'no', auditor: 'no' },
  { permission: 'View activity', manager: 'Team scope', executive: 'no', marketer: 'no', auditor: 'yes' },
  { permission: 'Run AI helpers', manager: 'yes', executive: 'yes', marketer: 'yes', auditor: 'Read only' },
];

const cellIcon = (value: string) => value === 'yes' ? <Check size={14} className="text-emerald-600" /> : value === 'no' ? <Minus size={14} className="text-slate-300" /> : value;

export function IdentityPage() {
  const { get, update, notify, role } = useApp();
  const navigate = useNavigate();
  const users = get('identity');
  const [tab, setTab] = useState('users');
  const [detail, setDetail] = useState<Row | null>(null);

  const toggleStatus = (u: Row) => {
    const next = u.status === 'Disabled' ? 'Active' : 'Disabled';
    update('identity', u.id, { status: next });
    notify(next === 'Disabled' ? 'User disabled' : 'User enabled', `${u.email} access ${next === 'Disabled' ? 'revoked immediately' : 'restored'}.`, next === 'Disabled' ? 'warning' : 'success');
  };

  return (
    <div className="animate-fade-up">
      <PageHeader title="Team & Access" subtitle="Manage your team, roles and sign-in settings."
        icon={ShieldCheck} breadcrumb="Platform"
        actions={[
          <button key="signin" className="btn-secondary" onClick={() => setTab('policies')}><KeyRound size={15} /> Sign-in settings</button>,
          <button key="invite" className="btn-primary" onClick={() => navigate('/identity/new')}><UserPlus size={15} /> Invite user</button>,
        ]} />

      <div className="mb-4"><Notice tone="info"><span>People only see records relevant to their role. Changes to access take effect immediately.</span></Notice></div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={users.length} icon={Users} hint="In this workspace" />
        <StatCard label="Active" value={users.filter((u) => u.status === 'Active').length} icon={CheckCircle2} tone="green" hint="Can sign in" />
        <StatCard label="Privileged roles" value="3" icon={LockKeyhole} tone="purple" hint="Need extra verification" />
        <StatCard label="Automated accounts" value="1" icon={Fingerprint} tone="teal" hint="For routine tasks" />
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 pt-3"><Tabs value={tab} onChange={setTab} items={[
          { id: 'users', label: 'Users', count: users.length }, { id: 'roles', label: 'Roles' },
          { id: 'service', label: 'Automated accounts' }, { id: 'policies', label: 'Sign-in' },
        ]} /></div>
        <div className="p-4">
          {tab === 'users' && <DataTable rows={users} columns={[
            { key: 'id', label: 'Reference' }, { key: 'name', label: 'User' }, { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role' }, { key: 'team', label: 'Team' }, { key: 'status', label: 'Status', badge: true },
            { key: 'mfa', label: 'Verification', badge: true }, { key: 'lastLogin', label: 'Last login' },
          ]} onRowClick={(u) => setDetail(u)} rowActions={(u) => <div className="flex gap-1">
            <button title="View" onClick={() => setDetail(u)} className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600"><Eye size={15} /></button>
            <button title="Disable / enable" onClick={() => toggleStatus(u)} className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600"><UserX size={15} /></button>
          </div>} />}

          {tab === 'roles' && <div>
            <p className="mb-3 text-xs text-slate-500">Each role has a clear set of permissions, so people see only what they need.</p>
            <div className="grid gap-4 xl:grid-cols-2">
              <DataTable rows={get('identityRoles')} columns={[
                { key: 'id', label: 'Reference' }, { key: 'name', label: 'Role' }, { key: 'members', label: 'Members', type: 'number' },
                { key: 'permissions', label: 'Permissions', type: 'number' }, { key: 'scope', label: 'Scope' },
                { key: 'status', label: 'Type', badge: true },
              ]} />
              <div className="card overflow-hidden">
                <table className="w-full text-left"><thead><tr><th className="th">Permission</th><th className="th">Manager</th><th className="th">Executive</th><th className="th">Marketing</th><th className="th">Auditor</th></tr></thead>
                  <tbody>{permissionMatrix.map((p) => <tr key={p.permission} className="table-row"><td className="td font-mono text-[11px]">{p.permission}</td><td className="td">{cellIcon(p.manager)}</td><td className="td">{cellIcon(p.executive)}</td><td className="td">{cellIcon(p.marketer)}</td><td className="td">{cellIcon(p.auditor)}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          </div>}

          {tab === 'service' && <div className="grid gap-4 xl:grid-cols-2">
            <InfoCard title="Routine tasks account" rows={[
              ['Account type', 'Automated'], ['Sign-in', 'Not available'],
              ['Permissions', 'Task-specific'], ['Workspace', 'Assigned per task'],
              ['Sign-in details', 'Stored securely'], ['Recorded as', 'Routine tasks'],
            ]} />
            <InfoCard title="AI helper accounts" rows={[
              ['Access', 'Only assigned records'], ['Actions', 'Set by workspace rules'],
              ['Extra permissions', 'Not granted'], ['Information', 'Kept in your workspace'],
              ['Sign-in details', 'Never shown to helpers'], ['Access changes', 'Take effect immediately'],
            ]} />
          </div>}

          {tab === 'policies' && <div className="grid gap-4 xl:grid-cols-2">
            <InfoCard title="Sign-in policy" rows={[
              ['Passwords', 'Strong passwords required'],
              ['Privileged users', 'Two-step verification'],
              ['Session expiry', 'Ends after inactivity'],
              ['Remember me', 'Available on trusted devices'],
              ['Repeated attempts', 'Extra checks after failed sign-ins'],
              ['Activity', 'Important sign-ins recorded'],
            ]} />
            <InfoCard title="Your session" rows={[
              ['Current user', 'Ananya Rao'], ['Active role', role],
              ['Device', 'Chrome · Chennai, IN'], ['Verification', 'Enabled'],
              ['Access changes', 'Review required'], ['Disabled users', 'Access ends immediately'],
            ]} />
          </div>}
        </div>
      </div>

    </div>
  );
}

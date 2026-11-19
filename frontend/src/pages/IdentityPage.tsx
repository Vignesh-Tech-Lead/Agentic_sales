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
  { permission: 'lead.read', manager: 'yes', executive: 'yes', marketer: 'Own audiences', auditor: 'yes' },
  { permission: 'lead.write', manager: 'yes', executive: 'Own records', marketer: 'no', auditor: 'no' },
  { permission: 'campaign.approve', manager: 'yes', executive: 'no', marketer: 'yes', auditor: 'no' },
  { permission: 'proposal.approve', manager: 'yes', executive: 'no', marketer: 'no', auditor: 'no' },
  { permission: 'document.manage', manager: 'no', executive: 'no', marketer: 'no', auditor: 'no' },
  { permission: 'audit.read', manager: 'Team scope', executive: 'no', marketer: 'no', auditor: 'yes' },
  { permission: 'agent.execute', manager: 'yes', executive: 'yes', marketer: 'yes', auditor: 'Read only' },
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
      <PageHeader title="Identity & Access" subtitle="Users, roles, permissions and service identities with least privilege, MFA and resource-level authorization."
        icon={ShieldCheck} breadcrumb="Module 1 of 25"
        actions={[
          <button key="mfa" className="btn-secondary" onClick={() => setTab('policies')}><KeyRound size={15} /> MFA policy</button>,
          <button key="invite" className="btn-primary" onClick={() => navigate('/identity/new')}><UserPlus size={15} /> Invite user</button>,
        ]} />

      <div className="mb-4"><Notice tone="info"><span>Cross-tenant access returns 404/403 without data leakage. Privileged changes require re-authentication, and worker identities cannot log in interactively.</span></Notice></div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={users.length} icon={Users} hint="In this tenant" />
        <StatCard label="Active" value={users.filter((u) => u.status === 'Active').length} icon={CheckCircle2} tone="green" hint="MFA enforced" />
        <StatCard label="Privileged roles" value="3" icon={LockKeyhole} tone="purple" hint="Require re-auth" />
        <StatCard label="Service identities" value="1" icon={Fingerprint} tone="teal" hint="Task-scoped" />
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 pt-3"><Tabs value={tab} onChange={setTab} items={[
          { id: 'users', label: 'Users', count: users.length }, { id: 'roles', label: 'Roles & permissions' },
          { id: 'service', label: 'Service identities' }, { id: 'policies', label: 'Session policies' },
        ]} /></div>
        <div className="p-4">
          {tab === 'users' && <DataTable rows={users} columns={[
            { key: 'id', label: 'ID' }, { key: 'name', label: 'User' }, { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role' }, { key: 'team', label: 'Team' }, { key: 'status', label: 'Status', badge: true },
            { key: 'mfa', label: 'MFA', badge: true }, { key: 'lastLogin', label: 'Last login' },
          ]} onRowClick={(u) => setDetail(u)} rowActions={(u) => <div className="flex gap-1">
            <button title="View" onClick={() => setDetail(u)} className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600"><Eye size={15} /></button>
            <button title="Disable / enable" onClick={() => toggleStatus(u)} className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600"><UserX size={15} /></button>
          </div>} />}

          {tab === 'roles' && <div>
            <p className="mb-3 text-xs text-slate-500">Stable permission codes are assigned to roles. Resource-level checks run in addition to RBAC on every request.</p>
            <div className="grid gap-4 xl:grid-cols-2">
              <DataTable rows={get('identityRoles')} columns={[
                { key: 'id', label: 'ID' }, { key: 'name', label: 'Role' }, { key: 'members', label: 'Members', type: 'number' },
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
            <InfoCard title="worker.svc" rows={[
              ['Identity type', 'Service account'], ['Interactive login', 'Blocked'],
              ['Permissions', '9 task-scoped codes'], ['Tenant context', 'Inherited from execution'],
              ['Credentials', 'Secret reference · rotated'], ['Audit actor', 'worker.svc'],
            ]} />
            <InfoCard title="Agent identities" rows={[
              ['Agent execution', 'Short-lived scoped principal'], ['Tool access', 'Allowlist from policy version'],
              ['Elevation', 'Not permitted'], ['Data scope', 'Tenant + entity references'],
              ['Secrets', 'Never exposed to model'], ['Revocation', 'Feature flag, immediate'],
            ]} />
          </div>}

          {tab === 'policies' && <div className="grid gap-4 xl:grid-cols-2">
            <InfoCard title="Authentication policy" rows={[
              ['Password hashing', 'Argon2id / bcrypt (vetted library)'],
              ['Privileged users', 'MFA required'],
              ['Session expiry', 'Configurable · idle timeout'],
              ['CSRF', 'Enabled for cookie sessions'],
              ['Rate limits', 'Login + password reset'],
              ['Audit', 'Failed and successful privileged actions'],
            ]} />
            <InfoCard title="Active session safety" rows={[
              ['Current user', 'Ananya Rao'], ['Active role', role],
              ['Device', 'Chrome · Chennai, IN'], ['MFA', 'Enabled'],
              ['Self-escalation', 'Blocked'], ['Disabled user', 'Denied immediately'],
            ]} />
          </div>}
        </div>
      </div>

    </div>
  );
}

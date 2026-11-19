import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus, KeyRound, Users, Building2, UserCheck, UserX, CheckCircle2, Eye,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { toneFor } from '../lib/format';
import { PageHeader, StatCard, Tabs, Badge, Drawer, InfoCard, Avatar } from '../components/ui';
import { DataTable } from '../components/DataTable';
import type { Row } from '../lib/types';

export function IdentityPage() {
  const { get, update, notify } = useApp();
  const navigate = useNavigate();
  const users = get('identity');
  const [tab, setTab] = useState('people');
  const [detail, setDetail] = useState<Row | null>(null);

  const teams = Array.from(new Set(users.map((user) => user.team).filter(Boolean))).map((team) => ({
    id: String(team),
    name: team,
    members: users.filter((user) => user.team === team).length,
    lead: users.find((user) => user.team === team)?.name ?? '—',
  }));

  const toggleStatus = (user: Row) => {
    const next = user.status === 'Disabled' ? 'Active' : 'Disabled';
    update('identity', user.id, { status: next });
    notify(next === 'Disabled' ? 'Teammate deactivated' : 'Teammate activated', `${user.name} has been updated.`, 'info');
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Team"
        subtitle="Manage your teammates and the details they need to work."
        breadcrumb="Workspace"
        actions={[
          <button key="signin" className="btn-secondary" onClick={() => setTab('signin')}><KeyRound size={15} /> Sign-in settings</button>,
          <button key="invite" className="btn-primary" onClick={() => navigate('/identity/new')}><UserPlus size={15} /> Add teammate</button>,
        ]}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Teammates" value={users.length} icon={Users} hint="In your workspace" />
        <StatCard label="Active" value={users.filter((user) => user.status === 'Active').length} icon={CheckCircle2} tone="green" hint="Ready to work" />
        <StatCard label="Teams" value={teams.length} icon={Building2} tone="purple" hint="Across the workspace" />
        <StatCard label="Invitations" value={users.filter((user) => user.status === 'Invited').length} icon={UserCheck} tone="teal" hint="Awaiting a reply" />
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 pt-3"><Tabs value={tab} onChange={setTab} items={[
          { id: 'people', label: 'People', count: users.length },
          { id: 'teams', label: 'Teams', count: teams.length },
          { id: 'signin', label: 'Sign-in' },
        ]} /></div>
        <div className="p-4">
          {tab === 'people' && <DataTable rows={users} columns={[
            { key: 'id', label: 'Reference' }, { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' },
            { key: 'role', label: 'Position' }, { key: 'team', label: 'Team' }, { key: 'status', label: 'Status', badge: true },
            { key: 'lastLogin', label: 'Last activity' },
          ]} onRowClick={(user) => setDetail(user)} rowActions={(user) => <div className="flex gap-1">
            <button title="View" onClick={() => setDetail(user)} className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600"><Eye size={15} /></button>
            <button title="Change status" onClick={() => toggleStatus(user)} className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600"><UserX size={15} /></button>
          </div>} />}

          {tab === 'teams' && <DataTable rows={teams} columns={[
            { key: 'id', label: 'Reference' }, { key: 'name', label: 'Team' },
            { key: 'members', label: 'Members', type: 'number' }, { key: 'lead', label: 'Team lead' },
          ]} />}

          {tab === 'signin' && <div className="grid gap-4 xl:grid-cols-2">
            <InfoCard title="Sign-in settings" rows={[
              ['Passwords', 'Strong passwords required'],
              ['Two-step verification', 'Available for every teammate'],
              ['Sessions', 'End after inactivity'],
              ['New teammates', 'Invited by email'],
            ]} />
            <InfoCard title="Keeping details current" rows={[
              ['Profile changes', 'Saved with the teammate record'],
              ['Deactivation', 'Marks the teammate inactive'],
              ['Invitations', 'Resend from the People tab'],
            ]} />
          </div>}
        </div>
      </div>

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.name ?? ''} subtitle={detail ? `${detail.id} · ${detail.status}` : ''}>
        {detail && <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar name={String(detail.name)} />
            <Badge tone={toneFor(detail.status)} dot>{detail.status}</Badge>
          </div>
          <InfoCard title="Teammate details" rows={[
            ['Email', detail.email], ['Position', detail.role],
            ['Team', detail.team], ['Status', detail.status],
            ['Last activity', detail.lastLogin ?? '—'],
          ]} />
        </div>}
      </Drawer>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { ChartNoAxesCombined, Download, Send, Sparkles, CalendarDays, CheckCircle2, Clock3, ShieldCheck } from 'lucide-react';
import { useApp } from '../lib/store';
import { money, toneFor } from '../lib/format';
import { PageHeader, StatCard, Tabs, Notice, Badge, InfoCard, AiNote, FormGrid, validateFields } from '../components/ui';
import { DataTable } from '../components/DataTable';

const daily: { day: string; leads: number; replies: number; meetings: number }[] = [];
const weekly: { week: string; actual: number; weighted: number; pipeline: number }[] = [];

export function ReportsPage() {
  const { get, notify } = useApp();
  const navigate = useNavigate();
  const reports = get('reports');
  const [tab, setTab] = useState('overview');

  return (
    <div className="animate-fade-up">
      <PageHeader title="Reports" subtitle="Create reports and summaries that keep your team informed." breadcrumb="Engagement & reporting"
        actions={[
          <button key="generate" className="btn-secondary" onClick={() => notify('Report requested', 'Your report is being prepared.', 'info')}><Download size={15} /> Generate now</button>,
          <button key="new" className="btn-primary" onClick={() => navigate('/reports/new')}><ChartNoAxesCombined size={15} /> New report</button>,
        ]} />

      <div className="mb-4"><Notice tone="info"><span>Earned revenue, expected revenue and open pipeline are shown separately.</span></Notice></div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Reports" value={reports.length} icon={ChartNoAxesCombined} hint="All cadences" />
        <StatCard label="Scheduled" value={reports.filter((r) => r.status === 'Scheduled').length} icon={Clock3} tone="amber" hint="Next cycle" />
      </div>

      <div className="card mb-6 overflow-hidden">
        <div className="px-4 pt-3"><Tabs value={tab} onChange={setTab} items={[
          { id: 'overview', label: 'Overview' }, { id: 'definitions', label: 'Definitions', count: reports.length },
        ]} /></div>
        <div className="p-4">
          {tab === 'overview' && <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="card-pad">
                <p className="section-title mb-1">Daily operations — this week</p><p className="mb-4 text-[11px] text-slate-500">Leads, replies and meetings · Asia/Kolkata</p>
                <div className="h-60"><ResponsiveContainer width="100%" height="100%"><BarChart data={daily} margin={{ left: -22, right: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="leads" fill="#4466f5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="replies" fill="#0d9f8f" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="meetings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart></ResponsiveContainer></div>
              </div>
              <div className="card-pad">
                <p className="section-title mb-1">Revenue & pipeline — last 4 weeks</p><p className="mb-4 text-[11px] text-slate-500">₹ crore · earned, expected and open pipeline</p>
                <div className="h-60"><ResponsiveContainer width="100%" height="100%"><LineChart data={weekly} margin={{ left: -12, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e2e8f0' }} />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="weighted" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="pipeline" stroke="#4466f5" strokeWidth={2.5} dot={false} strokeDasharray="5 4" />
                </LineChart></ResponsiveContainer></div>
              </div>
            </div>
            <AiNote title="Summary check">All figures match the source data and use your selected time zone.</AiNote>
          </div>}

          {tab === 'definitions' && <DataTable rows={reports} columns={[
            { key: 'id', label: 'ID' }, { key: 'name', label: 'Report' }, { key: 'cadence', label: 'Cadence' },
            { key: 'period', label: 'Period' }, { key: 'status', label: 'Status', badge: true },
            { key: 'records', label: 'Records' }, { key: 'narrative', label: 'Narrative' }, { key: 'delivery', label: 'Delivery' },
          ]} rowActions={(r) => <button onClick={() => navigate(`/reports/${r.id}/edit`)} className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600" title="Edit definition"><Download size={15} /></button>} />}
        </div>
      </div>

    </div>
  );
}

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

const daily = [
  { day: 'Mon', leads: 12, replies: 8, meetings: 2 }, { day: 'Tue', leads: 18, replies: 11, meetings: 3 },
  { day: 'Wed', leads: 15, replies: 9, meetings: 2 }, { day: 'Thu', leads: 22, replies: 14, meetings: 4 },
  { day: 'Fri', leads: 19, replies: 12, meetings: 3 }, { day: 'Sat', leads: 6, replies: 3, meetings: 0 },
];
const weekly = [
  { week: 'W1', actual: 1.2, weighted: 3.4, pipeline: 8.1 }, { week: 'W2', actual: 1.8, weighted: 3.9, pipeline: 9.2 },
  { week: 'W3', actual: 1.1, weighted: 4.2, pipeline: 10.4 }, { week: 'W4', actual: 2.4, weighted: 4.7, pipeline: 11.1 },
];

export function ReportsPage() {
  const { get, notify } = useApp();
  const navigate = useNavigate();
  const reports = get('reports');
  const [tab, setTab] = useState('overview');

  return (
    <div className="animate-fade-up">
      <PageHeader title="Reporting Management" subtitle="Daily, weekly and monthly reports with reconciled figures, explicit timezones and recorded delivery."
        icon={ChartNoAxesCombined} breadcrumb="Module 24 of 25"
        actions={[
          <button key="generate" className="btn-secondary" onClick={() => notify('Generation queued', 'Report job started in the reporting worker pool.', 'info')}><Download size={15} /> Generate now</button>,
          <button key="new" className="btn-primary" onClick={() => navigate('/reports/new')}><ChartNoAxesCombined size={15} /> New definition</button>,
        ]} />

      <div className="mb-4"><Notice tone="info"><span>Actual, weighted and unweighted pipeline are reported separately. AI narratives cannot alter source metrics and are checked against the metric query version.</span></Notice></div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Report definitions" value={reports.length} icon={ChartNoAxesCombined} hint="All cadences" />
        <StatCard label="Delivered today" value="1" icon={CheckCircle2} tone="green" hint="08:00 IST digest" />
        <StatCard label="Scheduled" value={reports.filter((r) => r.status === 'Scheduled').length} icon={Clock3} tone="amber" hint="Next cycle" />
        <StatCard label="Reconciliation" value="100%" icon={ShieldCheck} tone="teal" hint="Narrative vs metrics" />
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
                <p className="section-title mb-1">Revenue & pipeline — last 4 weeks</p><p className="mb-4 text-[11px] text-slate-500">₹ crore · actual vs weighted vs unweighted</p>
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
            <div className="grid gap-6 xl:grid-cols-3">
              {[
                { title: 'Daily operations', meta: '19 Nov 2026 · 08:00 IST', body: '416 leads in cycle; 132 qualified; 13 proposals drafted; 4 agent failures.', icon: CalendarDays },
                { title: 'Weekly management', meta: '17–23 Nov 2026', body: 'Source performance led by owned forms (38%). Funnel conversion 12.4%; willingness trend up 4 points.', icon: ChartNoAxesCombined },
                { title: 'Monthly executive', meta: '01–30 Nov 2026', body: 'Actual revenue ₹0.72 Cr; weighted pipeline ₹1.86 Cr. CAC omitted — no approved cost data.', icon: Sparkles },
              ].map((r) => <div key={r.title} className="card-pad">
                <div className="mb-3 flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600"><r.icon size={15} /></span><div><p className="text-xs font-bold text-slate-800">{r.title}</p><p className="text-[10px] text-slate-400">{r.meta}</p></div></div>
                <p className="text-xs leading-relaxed text-slate-600">{r.body}</p>
                <button className="btn-secondary btn-sm mt-3" onClick={() => notify('Report preview opened', 'Narrative claims checked against metric queries.', 'info')}>Preview <Send size={12} /></button>
              </div>)}
            </div>
            <AiNote title="Narrative verification">All figures above reconcile to canonical queries with the configured timezone. Unsupported claims and invented CAC/ROI are blocked by the reporting policy.</AiNote>
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

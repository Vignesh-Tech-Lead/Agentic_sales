import React, { useState } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  Download, RefreshCw, Users, Target, CircleDollarSign, Clock3, Sparkles,
  ArrowUpRight, Bot, Megaphone, CheckCircle2, AlertTriangle, LayoutDashboard, ArrowRight,
} from 'lucide-react';
import { PageHeader, StatCard, SectionTitle, Badge, AiNote, Notice, Avatar, ProgressBar } from '../components/ui';
import { useApp } from '../lib/store';
import { money, compact, num, toneFor, cx } from '../lib/format';

const toneStyles: Record<string, string> = { brand: 'text-brand-600', green: 'text-emerald-600', teal: 'text-teal-600', purple: 'text-violet-600' };

const trend = [
  { week: 'W1', leads: 38, qualified: 12, won: 4 }, { week: 'W2', leads: 45, qualified: 16, won: 5 },
  { week: 'W3', leads: 41, qualified: 14, won: 6 }, { week: 'W4', leads: 58, qualified: 22, won: 8 },
  { week: 'W5', leads: 52, qualified: 19, won: 7 }, { week: 'W6', leads: 67, qualified: 28, won: 11 },
  { week: 'W7', leads: 61, qualified: 25, won: 10 }, { week: 'W8', leads: 74, qualified: 31, won: 13 },
];
const periodViews: Record<string, { points: typeof trend; leads: number; qualified: string; delta: string }> = {
  Today: {
    points: [
      { week: '08', leads: 6, qualified: 2, won: 0 }, { week: '09', leads: 11, qualified: 4, won: 1 },
      { week: '10', leads: 14, qualified: 6, won: 1 }, { week: '11', leads: 17, qualified: 7, won: 3 },
      { week: '12', leads: 9, qualified: 3, won: 1 }, { week: '14', leads: 12, qualified: 5, won: 2 },
      { week: '15', leads: 8, qualified: 3, won: 1 }, { week: '16', leads: 7, qualified: 3, won: 0 },
    ],
    leads: 84, qualified: '36.9%', delta: '+9.1%',
  },
  'Last 8 weeks': { points: trend, leads: 416, qualified: '31.8%', delta: '+12.4%' },
  'This quarter': {
    points: [
      { week: 'Sep', leads: 118, qualified: 42, won: 16 }, { week: 'Oct', leads: 142, qualified: 48, won: 19 },
      { week: 'Nov', leads: 156, qualified: 54, won: 22 },
    ],
    leads: 1248, qualified: '32.2%', delta: '+15.6%',
  },
};
const services = [
  { name: 'Cloud Migration', value: 12400000, leads: 42 }, { name: 'Data Platform', value: 8600000, leads: 28 },
  { name: 'Process Automation', value: 6400000, leads: 35 }, { name: 'Analytics Suite', value: 4200000, leads: 31 },
];
const stages = [
  { name: 'Discovery', value: 25, color: '#94a3b8' }, { name: 'Qualification', value: 32, color: '#4466f5' },
  { name: 'Proposal', value: 21, color: '#8b5cf6' }, { name: 'Negotiation', value: 14, color: '#0d9f8f' },
  { name: 'Closed won', value: 8, color: '#10b981' },
];
const campaigns = [
  { name: 'Q4 Modernisation', open: 44, click: 16 }, { name: 'Demo follow-up', open: 38, click: 11 },
  { name: 'Service refresh', open: 41, click: 14 }, { name: 'Seasonal', open: 29, click: 7 },
];

const tooltipStyle = { borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 12px 30px rgba(15,23,42,.12)' };

export function DashboardPage() {
  const { get, role, notify } = useApp();
  const [period, setPeriod] = useState('Last 8 weeks');
  const view = periodViews[period] ?? periodViews['Last 8 weeks'];
  const opportunities = get('funnel').slice(0, 5);
  const tasks = get('tasks').filter((t) => t.status === 'Overdue' || t.status === 'Open').slice(0, 4);

  return (
    <div className="animate-fade-up">
      <PageHeader title="Analytics Dashboard" subtitle="A clear view of leads, pipeline and priorities."
        icon={LayoutDashboard} breadcrumb="Overview"
        actions={[
          <div key="period" className="pill-tabs">{['Today', 'Last 8 weeks', 'This quarter'].map((label) => <button key={label} onClick={() => setPeriod(label)} className={`pill-tab ${period === label ? 'pill-tab-active' : ''}`}>{label}</button>)}</div>,
          <button key="refresh" className="btn-secondary" onClick={() => notify('Dashboard refreshed', 'Your latest numbers are ready.', 'info')}><RefreshCw size={15} /> Refresh</button>,
          <button key="export" className="btn-primary" onClick={() => notify('Report exported', 'Your dashboard is ready to download.', 'info')}><Download size={15} /> Export</button>,
        ]} />

      <div className="mb-4"><Notice tone="info">You’re viewing this as <b className="mx-1">{role}</b>. Numbers reflect the records you can access.</Notice></div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New leads" value={num(view.leads)} delta={view.delta} icon={Users} hint={period} />
        <StatCard label="Qualified rate" value={view.qualified} delta="+3.1%" icon={Target} tone="green" hint="Qualified / new leads" />
        <StatCard label="Pipeline value" value={money(42800000)} delta="+8.7%" icon={CircleDollarSign} tone="purple" hint="Open pipeline · INR" />
        <StatCard label="Median first response" value="42 min" delta="-18%" icon={Clock3} tone="amber" hint="During business hours" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="card-pad xl:col-span-2">
          <SectionTitle title="Lead volume & conversions" action={<div className="flex gap-3 text-[11px] text-slate-500"><span className="flex items-center gap-1"><span className="dot bg-brand-500" /> Leads</span><span className="flex items-center gap-1"><span className="dot bg-teal-500" /> Qualified</span><span className="flex items-center gap-1"><span className="dot bg-emerald-500" /> Won</span></div>} />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={view.points} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4466f5" stopOpacity={0.25} /><stop offset="100%" stopColor="#4466f5" stopOpacity={0} /></linearGradient>
                  <linearGradient id="qualFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0d9f8f" stopOpacity={0.22} /><stop offset="100%" stopColor="#0d9f8f" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="leads" stroke="#4466f5" strokeWidth={2.5} fill="url(#leadFill)" />
                <Area type="monotone" dataKey="qualified" stroke="#0d9f8f" strokeWidth={2.5} fill="url(#qualFill)" />
                <Area type="monotone" dataKey="won" stroke="#10b981" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-pad">
          <SectionTitle title="Pipeline by stage" />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stages} dataKey="value" nameKey="name" innerRadius={55} outerRadius={82} paddingAngle={3} stroke="none">
                  {stages.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="-mt-4 grid grid-cols-2 gap-y-1.5">
            {stages.map((s) => <div key={s.name} className="flex items-center gap-2 text-[11px] text-slate-600"><span className="dot" style={{ background: s.color }} /><span className="flex-1">{s.name}</span><b className="text-slate-800">{s.value}</b></div>)}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="card-pad xl:col-span-2">
          <SectionTitle title="Pipeline value by service" action={<span className="text-[11px] text-slate-400">Updated just now</span>} />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={services} layout="vertical" margin={{ left: 18, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tickFormatter={(v) => compact(v)} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => money(v)} contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#4466f5" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card-pad">
          <SectionTitle title="Campaign health" icon={Megaphone} />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaigns} margin={{ left: -24, right: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="open" name="Open %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="click" name="Click %" fill="#0d9f8f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="card-pad">
          <SectionTitle title="Top opportunities" action={<span className="flex items-center gap-1 text-[11px] font-semibold text-brand-600">View funnel <ArrowRight size={12} /></span>} />
          <div className="space-y-3">
            {opportunities.map((o) => (
              <div key={o.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600"><ArrowUpRight size={15} /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800">{o.title}</p><p className="text-[10px] text-slate-500">{o.stage} · {o.owner}</p></div>
                <div className="text-right"><p className="text-xs font-bold text-slate-800">{compact(o.value)}</p><p className="text-[10px] text-slate-400">{o.probability}%</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-pad">
          <SectionTitle title="My next actions" icon={CheckCircle2} />
          <div className="space-y-3">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-start gap-3 rounded-xl border border-slate-100 p-2.5">
                <span className={`mt-0.5 dot ${t.status === 'Overdue' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800">{t.title}</p><p className="text-[10px] text-slate-500">Due {t.due} · {t.related}</p></div>
                <Badge tone={toneFor(t.status)}>{t.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-pad">
            <SectionTitle title="Assistant activity" icon={Bot} />
            <div className="space-y-3">
              {[
                ['Tasks completed today', '2,684', '+7.1%', 'brand'],
                ['Helpful answer rate', '96.4%', '+0.8%', 'green'],
                ['Actions needing review', '0', 'Target zero', 'teal'],
                ['Edits by your team', '18.2%', 'Within target', 'purple'],
              ].map(([label, value, delta, tone]) => (
                <div key={String(label)} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                  <span className="text-xs text-slate-600">{label}</span>
                  <span className="text-right"><b className="block text-xs text-slate-900">{value}</b><span className={cx('text-[10px]', toneStyles[String(tone)] ?? 'text-slate-500')}>{delta}</span></span>
                </div>
              ))}
            </div>
          </div>
          <AiNote title="Today’s summary">
            Lead volume rose 12% and qualification improved to 31.8%. Expected pipeline stands at {money(18600000)}. One proposal is waiting for approval and three follow-ups need attention today.
          </AiNote>
        </div>
      </div>
    </div>
  );
}


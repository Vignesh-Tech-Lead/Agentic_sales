import React, { useState } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  Download, RefreshCw, Users, Target, CircleDollarSign, Clock3, Sparkles,
  ArrowUpRight, Bot, Megaphone, CheckCircle2, AlertTriangle, LayoutDashboard, ArrowRight,
} from 'lucide-react';
import { PageHeader, StatCard, SectionTitle, Badge, AiNote, Avatar, ProgressBar } from '../components/ui';
import { useApp } from '../lib/store';
import { money, compact, num, toneFor, cx } from '../lib/format';

const toneStyles: Record<string, string> = { brand: 'text-brand-600', green: 'text-emerald-600', teal: 'text-teal-600', purple: 'text-violet-600' };

const trend: { week: string; leads: number; qualified: number; won: number }[] = [];
const services: { name: string; value: number; leads: number }[] = [];
const stages: { name: string; value: number; color: string }[] = [];
const campaigns: { name: string; open: number; click: number }[] = [];

const tooltipStyle = { borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 12px 30px rgba(15,23,42,.12)' };

export function DashboardPage() {
  const { get, notify } = useApp();
  const leads = get('leads');
  const pipeline = get('funnel');
  const campaignsFromApi = get('campaigns');
  const qualifiedCount = leads.filter((lead) => lead.status === 'Qualified').length;
  const qualifiedRate = leads.length ? `${(qualifiedCount / leads.length * 100).toFixed(1)}%` : '—';
  const pipelineValue = pipeline.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0);
  const opportunities = pipeline.slice(0, 5);
  const tasks = get('tasks').filter((t) => t.status === 'Overdue' || t.status === 'Open').slice(0, 4);

  return (
    <div className="animate-fade-up">
      <PageHeader title="Analytics Dashboard" subtitle="A clear view of leads, pipeline and priorities." breadcrumb="Overview"
        actions={[
          <span key="period" className="text-xs text-slate-500">Live workspace data</span>,
          <button key="refresh" className="btn-secondary" onClick={() => notify('Dashboard refreshed', 'Your latest numbers are ready.', 'info')}><RefreshCw size={15} /> Refresh</button>,
          <button key="export" className="btn-primary" onClick={() => notify('Report exported', 'Your dashboard is ready to download.', 'info')}><Download size={15} /> Export</button>,
        ]} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New leads" value={num(leads.length)} icon={Users} hint="All backend records" />
        <StatCard label="Qualified rate" value={qualifiedRate} icon={Target} tone="green" hint="Qualified / all leads" />
        <StatCard label="Pipeline value" value={money(pipelineValue)} icon={CircleDollarSign} tone="purple" hint="From backend opportunities" />
        <StatCard label="Open tasks" value={num(tasks.length)} icon={Clock3} tone="amber" hint="Overdue or open" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="card-pad xl:col-span-2">
          <SectionTitle title="Lead volume & conversions" action={<div className="flex gap-3 text-[11px] text-slate-500"><span className="flex items-center gap-1"><span className="dot bg-brand-500" /> Leads</span><span className="flex items-center gap-1"><span className="dot bg-teal-500" /> Qualified</span><span className="flex items-center gap-1"><span className="dot bg-emerald-500" /> Won</span></div>} />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
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
                ['Tasks in workspace', num(get('tasks').length), 'Backend records', 'brand'],
                ['Automation runs', num(get('executions').length), 'Backend records', 'green'],
                ['Campaigns', num(campaignsFromApi.length), 'Backend records', 'teal'],
                ['Audit events', num(get('audit').length), 'Backend records', 'purple'],
              ].map(([label, value, delta, tone]) => (
                <div key={String(label)} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                  <span className="text-xs text-slate-600">{label}</span>
                  <span className="text-right"><b className="block text-xs text-slate-900">{value}</b><span className={cx('text-[10px]', toneStyles[String(tone)] ?? 'text-slate-500')}>{delta}</span></span>
                </div>
              ))}
            </div>
          </div>
          <AiNote title="Workspace summary">
            Dashboard totals are calculated from records currently returned by the backend. Empty modules remain empty until records are added.
          </AiNote>
        </div>
      </div>
    </div>
  );
}


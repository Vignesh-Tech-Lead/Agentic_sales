import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Columns3, Sparkles, ArrowRight, ShieldCheck, AlertCircle, TrendingUp, MoreHorizontal, CircleDollarSign } from 'lucide-react';
import { useApp } from '../lib/store';
import { money, compact, toneFor, cx } from '../lib/format';
import { PageHeader, StatCard, Badge, Notice, Drawer, AiNote, InfoCard, Timeline } from '../components/ui';
import type { Row } from '../lib/types';

const stages = ['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
const stageTone: Record<string, string> = {
  Discovery: 'border-t-slate-400', Qualification: 'border-t-brand-500', Proposal: 'border-t-violet-500',
  Negotiation: 'border-t-teal-500', 'Closed Won': 'border-t-emerald-500', 'Closed Lost': 'border-t-rose-500',
};

export function FunnelPage() {
  const { get, update, notify } = useApp();
  const navigate = useNavigate();
  const rows = get('funnel');
  const [detail, setDetail] = useState<Row | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const move = (row: Row, stage: string) => {
    if (row.stage === stage) return;
    if (stage === 'Closed Won' && row.probability < 90) {
      notify('Not quite ready', 'Add a win reason and raise the confidence score before closing this deal.', 'danger');
      return;
    }
    update('funnel', row.id, { stage, probability: stage === 'Closed Won' ? 100 : stage === 'Closed Lost' ? 0 : row.probability });
    notify('Stage updated', `${row.id} moved to ${stage}. The change has been saved.`, 'info');
  };

  const total = rows.reduce((s, r) => s + (r.value || 0), 0);
  const weighted = rows.reduce((s, r) => s + (r.value || 0) * (r.probability || 0) / 100, 0);
  const won = rows.filter((r) => r.stage === 'Closed Won').reduce((s, r) => s + r.value, 0);

  return (
    <div className="animate-fade-up">
      <PageHeader title="Sales Pipeline" subtitle="Move deals through your pipeline and keep every stage up to date." breadcrumb="Sales workspace"
        actions={[
          <button key="rules" className="btn-secondary" onClick={() => notify('Stage guide', 'Each stage has its own entry requirements before a deal can move forward.', 'info')}><ShieldCheck size={15} /> Transition rules</button>,
          <button key="new" className="btn-primary" onClick={() => navigate('/funnel/new')}><Plus size={16} /> New opportunity</button>,
        ]} />

      <div className="mb-4"><Notice tone="info">Drag cards between columns, or use the move buttons. Every change is saved in the deal’s history.</Notice></div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Opportunities" value={rows.length} icon={Columns3} hint="Active pipeline" />
        <StatCard label="Open pipeline" value={money(total)} icon={TrendingUp} tone="purple" hint="Across active stages" />
        <StatCard label="Weighted forecast" value={money(weighted)} icon={Sparkles} tone="green" hint="Amount × probability" />
        <StatCard label="Closed won actual" value={money(won)} icon={CircleDollarSign} tone="brand" hint="Separate from pipeline" />
      </div>

      <div className="grid gap-3 overflow-x-auto pb-3" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(230px, 1fr))` }}>
        {stages.map((stage) => {
          const items = rows.filter((r) => r.stage === stage);
          const sum = items.reduce((s, r) => s + (r.value || 0), 0);
          return (
            <div key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragId) { const row = rows.find((r) => r.id === dragId); if (row) move(row, stage); setDragId(null); } }}
              className={cx('flex min-h-[420px] flex-col rounded-2xl border border-t-4 border-slate-200 bg-slate-50/70 p-3', stageTone[stage])}>
              <div className="mb-3 flex items-center justify-between">
                <div><p className="text-xs font-bold text-slate-800">{stage}</p><p className="text-[10px] text-slate-500">{items.length} deals · {compact(sum)}</p></div>
                <button onClick={() => navigate('/funnel/new')} className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-brand-600"><Plus size={15} /></button>
              </div>
              <div className="flex-1 space-y-2.5">
                {items.map((row) => (
                  <div key={row.id} draggable onDragStart={() => setDragId(row.id)}
                    onClick={() => setDetail(row)}
                    className="cursor-pointer card p-3 transition hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold leading-snug text-slate-800">{row.title}</p>
                      <button onClick={(e) => e.stopPropagation()} className="text-slate-300 hover:text-slate-600"><MoreHorizontal size={15} /></button>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">{row.company} · {row.id}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{money(row.value, row.currency)}</span>
                      <Badge tone={row.score >= 75 ? 'green' : row.score >= 50 ? 'amber' : 'slate'}>{row.score ?? '—'} points</Badge>
                    </div>
                    <div className="mt-2.5"><div className="progress"><div className="progress-fill" style={{ width: `${row.probability}%` }} /></div></div>
                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{row.owner}</span><span>{row.probability}% · {row.age}d</span>
                    </div>
                    <div className="mt-2 flex gap-1">
                      {stages.filter((s) => s !== stage).slice(0, 3).map((s) => (
                        <button key={s} onClick={(e) => { e.stopPropagation(); move(row, s); }}
                          className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 hover:bg-brand-50 hover:text-brand-700"><ArrowRight size={10} /> {s.split(' ')[0]}</button>
                      ))}
                    </div>
                  </div>
                ))}
                {!items.length && <div className="grid place-items-center rounded-xl border border-dashed border-slate-200 py-8 text-[11px] text-slate-400">Drop opportunities here</div>}
              </div>
            </div>
          );
        })}
      </div>

      <Drawer open={!!detail} onClose={() => setDetail(null)}
        title={detail?.title ?? ''} subtitle={detail ? `${detail.id} · ${detail.stage}` : ''}
        footer={detail && <button className="btn-primary" onClick={() => { setDetail(null); notify('Proposal requested', 'We’ll prepare a proposal using your approved pricing.', 'info'); }}>Draft proposal</button>}>
        {detail && <div className="space-y-4">
          <div className="flex gap-2"><Badge tone={toneFor(detail.stage)}>{detail.stage}</Badge><Badge tone="slate">Owner: {detail.owner}</Badge><Badge tone="purple">Score {detail.score}</Badge></div>
          <InfoCard title="Opportunity details" rows={[
            ['Value', money(detail.value, detail.currency)], ['Probability', `${detail.probability}%`],
            ['Expected value', money(Math.round(detail.value * detail.probability / 100), detail.currency)],
            ['Expected close', detail.closeDate], ['Age', `${detail.age} days`], ['Company', detail.company],
          ]} />
          <AiNote title="Stage recommendation">
            This deal looks ready for the next step based on interest, engagement and its close date.
          </AiNote>
          <div>
            <p className="label">Move to stage</p>
            <div className="flex flex-wrap gap-2">{stages.filter((s) => s !== detail.stage).map((s) => (
              <button key={s} onClick={() => { move(detail, s); setDetail({ ...detail, stage: s }); }} className="btn-secondary btn-sm">{s}<ArrowRight size={12} /></button>
            ))}</div>
          </div>
          <InfoCard title="Stage history" icon={ShieldCheck} rows={[['Created', detail.closeDate ? 'Earlier this cycle' : '—'], ['Current stage', detail.stage], ['Last actor', detail.owner], ['Status', 'Saved']]} />
          <Timeline items={[
            { title: 'Opportunity created', meta: `${detail.id} · ${detail.owner}`, tone: 'blue' },
            { title: `Entered ${detail.stage}`, meta: 'Stage change saved', body: 'Stage change saved.', tone: 'purple' },
            { title: 'Forecast included', meta: 'Forecast updated', body: 'Forecast updated.', tone: 'green' },
          ]} />
        </div>}
      </Drawer>

    </div>
  );
}

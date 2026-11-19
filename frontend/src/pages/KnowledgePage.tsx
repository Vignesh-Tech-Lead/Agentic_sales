import { DataTable } from '../components/DataTable';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Search, Upload, RefreshCw, FileText, Sparkles, CheckCircle2,
  Eye, Layers,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { toneFor } from '../lib/format';
import { PageHeader, StatCard, Notice, Badge, Drawer, InfoCard, AiNote, Timeline, ProgressBar } from '../components/ui';
import type { Row } from '../lib/types';

const columns = [
  { key: 'id', label: 'Reference' }, { key: 'title', label: 'Document' }, { key: 'space', label: 'Space' },
  { key: 'type', label: 'Type' }, { key: 'version', label: 'Version' },
  { key: 'status', label: 'Status', badge: true }, { key: 'chunks', label: 'Sections', type: 'number' as const },
  { key: 'acl', label: 'Access' }, { key: 'updated', label: 'Updated' },
];

export function KnowledgePage() {
  const { get, update, notify } = useApp();
  const navigate = useNavigate();
  const docs = get('knowledge');
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState(false);
  const [detail, setDetail] = useState<Row | null>(null);

  const runSearch = () => {
    if (!query.trim()) return notify('Add a question', 'Ask about migration steps, services or pricing.', 'warning');
    setAnswer(true);
    notify('Answer ready', 'We found the most relevant documents.', 'success');
  };

  return (
    <div className="animate-fade-up">
      <PageHeader title="Knowledge Library" subtitle="Find trusted answers in your company’s documents." breadcrumb="Intelligence & automation"
        actions={[
          <button key="refresh" className="btn-secondary" onClick={() => notify('Refresh started', 'Your documents will be updated shortly.', 'info')}><RefreshCw size={15} /> Refresh</button>,
          <button key="upload" className="btn-primary" onClick={() => navigate('/knowledge/new')}><Upload size={15} /> Upload document</button>,
        ]} />

      <div className="mb-4"><Notice tone="info"><span>Answers come from your approved company documents.</span></Notice></div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Documents" value={docs.length} icon={FileText} hint="All versions" />
        <StatCard label="Ready to search" value={docs.filter((doc) => doc.status === 'Ready').length} icon={CheckCircle2} tone="green" hint="Available now" />
        <StatCard label="Sections" value={docs.reduce((sum, doc) => sum + (doc.chunks || 0), 0)} icon={Layers} tone="purple" hint="Across documents" />
        <StatCard label="Recently updated" value={docs.filter((doc) => String(doc.updated).includes("Nov")).length} icon={CheckCircle2} tone="teal" hint="This month" />
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="card-pad">
          <p className="section-title mb-1 flex items-center gap-2"><Search size={15} className="text-brand-600" /> Search knowledge</p>
          <p className="mb-4 text-xs text-slate-500">Ask a question and we’ll show the most useful documents.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input className="input flex-1" placeholder="e.g. What are the migration steps?" value={query} onChange={(event) => { setQuery(event.target.value); setAnswer(false); }} onKeyDown={(event) => event.key === 'Enter' && runSearch()} />
            <button className="btn-primary" onClick={runSearch}><Sparkles size={15} /> Ask</button>
          </div>
          {answer ? (
            <div className="mt-4 space-y-3">
              <AiNote title="Answer">
                For a smooth cutover, confirm readiness, complete the staged data transfer, check the results, and then switch over with a rollback window. Timeline commitments need a manager’s approval.
              </AiNote>
              <div className="flex flex-wrap gap-2">
                <Badge tone="blue">Cloud Migration Guide</Badge>
                <Badge tone="blue">Service Catalogue</Badge>
                <Badge tone="purple">2 documents used</Badge>
              </div>
            </div>
          ) : <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">Try asking about migration steps, service scope or approved pricing.</div>}
        </div>

        <div className="card-pad">
          <p className="section-title mb-3">Search options</p>
          <div className="space-y-2.5">
            {[
              ['Sources', 'Approved documents', 'green'],
              ['Matches', 'Most relevant first', 'blue'],
              ['Outdated files', 'Hidden from search', 'rose'],
            ].map(([label, value, tone]) => <div key={label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-[11px] text-slate-600">{label}</span><Badge tone={toneFor(tone)}>{value}</Badge></div>)}
          </div>
        </div>
      </div>

      <p className="section-title mb-3">Documents</p>
      <DataTable rows={docs} columns={columns} filters={[{ key: 'status', label: 'Status', options: ['Ready', 'Preparing', 'Archived'] }]}
        onRowClick={(row) => setDetail(row)}
        rowActions={(row) => <div className="flex gap-1">
          <button title="View" onClick={() => setDetail(row)} className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600"><Eye size={15} /></button>
          <button title="Refresh document" onClick={() => { update('knowledge', row.id, { status: 'Preparing' }); notify('Refresh started', `${row.id} will be updated shortly.`, 'info'); }} className="rounded-lg p-1.5 text-slate-400 hover:text-teal-600"><RefreshCw size={15} /></button>
        </div>} />

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.title ?? ''} subtitle={detail ? `${detail.id} · ${detail.version}` : ''}
        footer={detail && <button className="btn-primary" onClick={() => { update('knowledge', detail.id, { status: 'Ready' }); notify('Document refreshed', 'This document is ready to search again.'); setDetail(null); }}><RefreshCw size={15} /> Refresh document</button>}>
        {detail && <div className="space-y-4">
          <div className="flex gap-2"><Badge tone={toneFor(detail.status)}>{detail.status}</Badge><Badge tone="slate">{detail.type}</Badge><Badge tone="purple">{detail.space}</Badge></div>
          <InfoCard title="Document details" rows={[
            ['Version', detail.version], ['Pages', detail.pages], ['Sections', detail.chunks],
            ['Source', detail.checksum], ['Access', detail.acl], ['Owner', detail.owner],
            ['Language', 'English'], ['Times used', detail.retrieval],
          ]} />
          <div className="card-pad">
            <p className="mb-2 text-xs font-bold text-slate-800">Availability</p>
            <ProgressBar value={detail.status === 'Ready' ? 100 : detail.status === 'Preparing' ? 45 : 12} />
            <p className="mt-2 text-[11px] text-slate-500">{detail.status === 'Ready' ? 'Ready to search' : 'We’ll let you know when it’s ready.'}</p>
          </div>
          <AiNote title="Document note">“{detail.title}” is part of your company knowledge library.</AiNote>
          <Timeline items={[
            { title: 'Uploaded', meta: detail.owner, tone: 'blue' },
            { title: 'Check completed', meta: 'File verified', tone: 'green' },
            { title: 'Sections prepared', meta: `${detail.chunks} sections`, tone: 'purple' },
            { title: 'Ready to search', meta: detail.status, tone: detail.status === 'Ready' ? 'green' : 'amber' },
          ]} />
        </div>}
      </Drawer>

    </div>
  );
}

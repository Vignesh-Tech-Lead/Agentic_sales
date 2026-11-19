import { DataTable } from '../components/DataTable';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Search, Upload, RefreshCw, FileText, ShieldCheck, Sparkles, CheckCircle2,
  Ban, Eye, Layers, LockKeyhole, ArrowRight,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { cx, toneFor } from '../lib/format';
import { PageHeader, StatCard, Notice, Badge, Drawer, InfoCard, AiNote, Timeline, ProgressBar } from '../components/ui';
import type { Row } from '../lib/types';

const pipeline = ['Upload', 'Malware scan', 'Private storage', 'Extract / OCR', 'Chunk', 'Embed', 'Index'];
const columns = [
  { key: 'id', label: 'ID' }, { key: 'title', label: 'Document' }, { key: 'space', label: 'Space' },
  { key: 'type', label: 'Type' }, { key: 'version', label: 'Version' },
  { key: 'status', label: 'Status', badge: true }, { key: 'chunks', label: 'Chunks', type: 'number' as const },
  { key: 'acl', label: 'ACL' }, { key: 'updated', label: 'Updated' },
];

export function KnowledgePage() {
  const { get, update, notify } = useApp();
  const navigate = useNavigate();
  const docs = get('knowledge');
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState(false);
  const [scope, setScope] = useState('My authorized spaces');
  const [detail, setDetail] = useState<Row | null>(null);

  const runSearch = () => {
    if (!query.trim()) return notify('Enter a question', 'Ask about SOPs, services or approved pricing.', 'warning');
    if (/public|scrape|web search|external/i.test(query)) {
      setAnswer(true);
      notify('Abstained', 'No public-data enrichment is permitted. The question was declined politely.', 'info');
      return;
    }
    setAnswer(true);
    notify('Grounded answer ready', 'Retrieved 3 authorized passages with citations.', 'success');
  };

  return (
    <div className="animate-fade-up">
      <PageHeader title="Private Knowledge Base" subtitle="Approved company documents are scanned, chunked, embedded and retrieved with ACL enforcement. No public-data enrichment."
        icon={BookOpen} breadcrumb="Module 6 of 25"
        actions={[
          <button key="reindex" className="btn-secondary" onClick={() => notify('Re-index started', 'A new index generation will be swapped only after validation.', 'info')}><RefreshCw size={15} /> Re-index</button>,
          <button key="upload" className="btn-primary" onClick={() => navigate('/knowledge/new')}><Upload size={15} /> Upload document</button>,
        ]} />

      <div className="mb-4"><Notice tone="info"><span>Business facts come only from the organization’s approved corpus and authorized first-party interactions. Retrieval applies tenant and document ACL <b>before</b> context reaches a model.</span></Notice></div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Documents" value={docs.length} icon={FileText} hint="All versions" />
        <StatCard label="Indexed" value={docs.filter((d) => d.status === 'Indexed').length} icon={CheckCircle2} tone="green" hint="Retrieval eligible" />
        <StatCard label="Active chunks" value={docs.reduce((s, d) => s + (d.chunks || 0), 0)} icon={Layers} tone="purple" hint="Section-aware" />
        <StatCard label="ACL violations" value="0" icon={LockKeyhole} tone="teal" hint="Target zero" />
      </div>

      <div className="card-pad mb-6">
        <div className="mb-4 flex items-center justify-between"><p className="section-title">Ingestion pipeline</p><Badge tone="green">All stages monitored</Badge></div>
        <div className="flex flex-wrap items-center gap-2">
          {pipeline.map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex items-center gap-2 card px-3 py-2">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand-50 text-[10px] font-bold text-brand-600">{i + 1}</span>
                <span className="text-[11px] font-semibold text-slate-700">{step}</span>
                <CheckCircle2 size={13} className="text-emerald-500" />
              </div>
              {i < pipeline.length - 1 && <ArrowRight size={13} className="text-slate-300" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="card-pad">
          <p className="section-title mb-1 flex items-center gap-2"><Search size={15} className="text-brand-600" /> ACL-aware knowledge search</p>
          <p className="mb-4 text-xs text-slate-500">Answers are constrained to retrieved passages and include document, version and page citations.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select className="input sm:w-56" value={scope} onChange={(e) => setScope(e.target.value)}>
              {['My authorized spaces', 'Commercial only', 'Delivery SOPs', 'Compliance'].map((s) => <option key={s}>{s}</option>)}
            </select>
            <input className="input flex-1" placeholder="e.g. What is the migration cutover checklist?" value={query} onChange={(e) => { setQuery(e.target.value); setAnswer(false); }} onKeyDown={(e) => e.key === 'Enter' && runSearch()} />
            <button className="btn-primary" onClick={runSearch}><Sparkles size={15} /> Ask</button>
          </div>
          {answer ? (
            <div className="mt-4 space-y-3">
              {/public|scrape|web search|external/i.test(query) ? (
                <Notice tone="warning" title="Abstained by policy"><span>Only private, organization-approved knowledge is available. I can’t use public web sources or scraped data to answer this.</span></Notice>
              ) : (
                <>
                  <AiNote title="Grounded answer">
                    For a zero-downtime cutover, follow the migration runbook: confirm readiness checks, freeze schema changes, execute the staged data sync, run validation queries, then switch traffic with a documented rollback window. Timeline commitments require sales-manager approval.
                  </AiNote>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="blue">Citation 1 · Cloud Migration SOP · v4 · p.18</Badge>
                    <Badge tone="blue">Citation 2 · Service catalogue · v7 · §4.2</Badge>
                    <Badge tone="purple">ACL filter applied · 2 authorized spaces</Badge>
                  </div>
                </>
              )}
            </div>
          ) : <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">Try a question about internal SOPs, service scope or approved pricing — or ask for public data to see the abstention policy.</div>}
        </div>

        <div className="card-pad">
          <p className="section-title mb-3">Retrieval controls</p>
          <div className="space-y-2.5">
            {[
              ['Tenant filter', 'Forced · fail closed', 'green'],
              ['Document ACL', 'Evaluated pre-retrieval', 'green'],
              ['Relevance threshold', 'Minimum 0.72', 'blue'],
              ['Reranking', 'Enabled', 'blue'],
              ['Prompt injection defense', 'Untrusted data policy', 'purple'],
              ['Deleted/archived docs', 'Immediately excluded', 'rose'],
            ].map(([label, value, tone]) => <div key={label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-[11px] text-slate-600">{label}</span><Badge tone={toneFor(tone)}>{value}</Badge></div>)}
          </div>
        </div>
      </div>

      <p className="section-title mb-3">Documents</p>
      <DataTable rows={docs} columns={columns} filters={[{ key: 'status', label: 'Status', options: ['Indexed', 'Scanning', 'Extracting', 'Archived', 'Failed'] }]}
        onRowClick={(row) => setDetail(row)}
        rowActions={(row) => <div className="flex gap-1">
          <button title="View" onClick={() => setDetail(row)} className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600"><Eye size={15} /></button>
          <button title="Re-index" onClick={() => { update('knowledge', row.id, { status: 'Extracting', retrieval: '—' }); notify('Re-index queued', `${row.id} will use a new index generation.`, 'info'); }} className="rounded-lg p-1.5 text-slate-400 hover:text-teal-600"><RefreshCw size={15} /></button>
        </div>} />

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.title ?? ''} subtitle={detail ? `${detail.id} · ${detail.version}` : ''}
        footer={detail && <button className="btn-primary" onClick={() => { update('knowledge', detail.id, { status: 'Indexed' }); notify('Index refreshed', 'ACL and checksum verified before generation swap.'); setDetail(null); }}><RefreshCw size={15} /> Re-index version</button>}>
        {detail && <div className="space-y-4">
          <div className="flex gap-2"><Badge tone={toneFor(detail.status)}>{detail.status}</Badge><Badge tone="slate">{detail.type}</Badge><Badge tone="purple">{detail.space}</Badge></div>
          <InfoCard title="Document metadata" rows={[
            ['Version', detail.version], ['Pages', detail.pages], ['Chunks', detail.chunks],
            ['Checksum', detail.checksum], ['ACL', detail.acl], ['Owner', detail.owner],
            ['Embedding model', 'text-embedding-3-large · 1536 dims'], ['Retrievals', detail.retrieval],
          ]} />
          <div className="card-pad">
            <p className="mb-2 text-xs font-bold text-slate-800">Processing status</p>
            <ProgressBar value={detail.status === 'Indexed' ? 100 : detail.status === 'Extracting' ? 45 : 12} />
            <p className="mt-2 text-[11px] text-slate-500">{detail.status === 'Indexed' ? 'Available for authorized retrieval' : 'Partial chunks are never exposed as indexed'}</p>
          </div>
          <AiNote title="Sample indexed chunk"><p className="italic">“…confirm readiness checks, freeze schema changes, execute staged sync, validate, then switch traffic with rollback window.”</p><p className="mt-2 opacity-80">Source: {detail.title} {detail.version}, page 18 · ACL: {detail.acl}</p></AiNote>
          <Timeline items={[
            { title: 'Uploaded', meta: detail.owner, tone: 'blue' },
            { title: 'Malware scan passed', meta: 'SHA-256 checksum recorded', tone: 'green' },
            { title: 'Extracted & chunked', meta: `${detail.chunks} section-aware chunks`, tone: 'purple' },
            { title: 'Indexed', meta: detail.status, tone: detail.status === 'Indexed' ? 'green' : 'amber' },
          ]} />
        </div>}
      </Drawer>

    </div>
  );
}

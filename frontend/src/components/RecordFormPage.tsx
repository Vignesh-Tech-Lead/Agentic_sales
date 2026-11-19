import React, { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, ShieldCheck, Save, CheckCircle2, LockKeyhole, Clock3 } from 'lucide-react';
import { resourceModules } from '../config/resourceModules';
import { customForms, type FormPageConfig } from '../config/formPages';
import { navModules } from '../lib/nav';
import { useApp, newId } from '../lib/store';
import { PageHeader, FormGrid, validateFields, Notice } from './ui';

export function RecordFormPage() {
  const { module = '', id } = useParams();
  const navigate = useNavigate();
  const { get, add, update, notify, role } = useApp();

  const standard = resourceModules[module];
  const cfg: FormPageConfig | null = standard
    ? {
        storeKey: module,
        title: standard.entity,
        subtitle: standard.subtitle,
        back: `/${module}`,
        prefix: module.slice(0, 3).toUpperCase(),
        fields: standard.fields,
        defaults: { currency: 'INR' },
        notice: standard.banner,
      }
    : customForms[module] ?? null;

  const existing = cfg && id ? get(cfg.storeKey).find((r) => r.id === id) : null;
  const [form, setForm] = useState<Record<string, any>>({ ...(cfg?.defaults ?? {}), ...(existing ?? {}) });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const readOnly = role === 'Analyst/Auditor';

  if (!cfg) return <Navigate to="/dashboard" replace />;

  const isEdit = !!existing;
  const title = isEdit ? `Edit ${cfg.title}` : `New ${cfg.title}`;

  const save = () => {
    if (readOnly) {
      return;
    }
    const errs = validateFields(cfg.fields, form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      notify('Check required fields', 'Some fields need attention before this record can be saved.', 'warning');
      return;
    }
    if (existing) {
      update(cfg.storeKey, existing.id, form);
      notify(`${cfg.title} updated`, `${existing.id} was saved.`);
    } else {
      const recordId = newId(cfg.prefix);
      add(cfg.storeKey, {
        ...form,
        id: recordId,
        created: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        updated: 'Just now',
      });
      notify(`${cfg.title} created`, `${recordId} is now in your workspace.`);
    }
    navigate(cfg.back);
  };

  return (
    <div className="animate-fade-up">
      <PageHeader title={title} subtitle={cfg.subtitle}
        breadcrumb={`${isEdit ? 'Edit' : 'New'} · ${cfg.title}`}
        actions={
          <button className="btn-secondary" onClick={() => navigate(cfg.back)}>
            <ArrowLeft size={15} /> Back to {navModules.find((item) => item.path === cfg.back)?.title ?? 'records'}
          </button>
        } />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Record details</h2>
              <p className="mt-0.5 text-xs text-slate-500">Fields marked with an asterisk are required.</p>
            </div>
            <span className="badge-slate"><LockKeyhole size={12} className="text-teal-600" /> Shared with your team</span>
          </div>
          <div className="p-5">
            <FormGrid fields={cfg.fields} values={form} errors={errors}
              onChange={(key, value) => { setForm({ ...form, [key]: value }); setErrors({ ...errors, [key]: '' }); }} />
            {cfg.notice && <div className="mt-5"><Notice tone="warning">{cfg.notice}</Notice></div>}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4">
            <button className="btn-secondary" onClick={() => navigate(cfg.back)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={readOnly}><Save size={15} /> {isEdit ? 'Save changes' : `Create ${cfg.title.toLowerCase()}`}</button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><ShieldCheck size={16} className="text-brand-600" /> Before you save</h3>
            <div className="mt-4 space-y-3">
              {[
                [CheckCircle2, 'Complete details', 'Required fields are checked before saving.'],
                [Clock3, 'Change history', 'We keep a record of important updates.'],
                [ShieldCheck, 'Review first', 'External messages still need approval.'],
              ].map(([Icon, label, body]: any) => (
                <div key={label} className="flex gap-2.5">
                  <Icon size={15} className="mt-0.5 shrink-0 text-teal-600" />
                  <div><p className="text-xs font-semibold text-slate-800">{label}</p><p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{body}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-900">{isEdit ? 'Change history' : 'What happens next'}</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              {isEdit
                ? 'Earlier approvals may need a fresh review after meaningful changes.'
                : 'You’ll return to the record list. Any follow-up steps will appear on the record.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

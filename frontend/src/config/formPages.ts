import type { Field } from '../lib/types';

export interface FormPageConfig {
  storeKey: string;
  title: string;
  subtitle: string;
  back: string;
  prefix: string;
  fields: Field[];
  defaults?: Record<string, any>;
  notice?: string;
}

/** Dedicated form pages for modules that do not use the standard resource configuration. */
export const customForms: Record<string, FormPageConfig> = {
  funnel: {
    storeKey: 'funnel', title: 'Opportunity', back: '/funnel', prefix: 'OP',
    subtitle: 'Create an opportunity in the pipeline. Amounts and probabilities must come from approved commercial data.',
    notice: 'Closed Won requires probability ≥ 90% and a win reason. Transitions are validated server-side.',
    defaults: { stage: 'Discovery', probability: 20, currency: 'INR', owner: 'Ananya Rao' },
    fields: [
      { key: 'title', label: 'Opportunity title', type: 'text', required: true, full: true },
      { key: 'company', label: 'Company', type: 'text', required: true },
      { key: 'value', label: 'Amount', type: 'currency', required: true },
      { key: 'currency', label: 'Currency', type: 'select', options: ['INR', 'USD', 'EUR'] },
      { key: 'stage', label: 'Stage', type: 'select', required: true, options: ['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] },
      { key: 'probability', label: 'Probability (%)', type: 'percent' },
      { key: 'closeDate', label: 'Expected close', type: 'date' },
      { key: 'owner', label: 'Owner', type: 'select', options: ['Ananya Rao', 'Kabir Shah', 'Meera Iyer'] },
      { key: 'score', label: 'Willingness score', type: 'number' },
    ],
  },
  knowledge: {
    storeKey: 'knowledge', title: 'Document', back: '/knowledge', prefix: 'DOC',
    subtitle: 'Upload an approved internal document. It becomes retrievable only after scanning, extraction and indexing.',
    notice: 'Files are quarantined until malware scanning passes. Failed indexing is never exposed to retrieval.',
    defaults: { space: 'Delivery', acl: 'Sales + Delivery', type: 'PDF', status: 'Scanning' },
    fields: [
      { key: 'title', label: 'Document title', type: 'text', required: true, full: true },
      { key: 'space', label: 'Knowledge space', type: 'select', required: true, options: ['Delivery', 'Commercial', 'Compliance'] },
      { key: 'type', label: 'File type', type: 'select', options: ['PDF', 'DOCX', 'TXT', 'CSV', 'XLSX', 'PPTX', 'MD', 'HTML'] },
      { key: 'acl', label: 'Access scope', type: 'select', required: true, options: ['Sales + Delivery', 'Sales managers', 'All internal', 'Sales + Legal'] },
      { key: 'owner', label: 'Owner', type: 'select', options: ['Priya Sharma', 'Ananya Rao'] },
      { key: 'status', label: 'Initial status', type: 'select', options: ['Scanning', 'Draft'] },
      { key: 'version', label: 'Version', type: 'text' },
      { key: 'checksum', label: 'Checksum reference', type: 'text' },
    ],
  },
  agents: {
    storeKey: 'executions', title: 'Agent execution', back: '/agents', prefix: 'EX',
    subtitle: 'Queue a bounded agent execution. Tools, budgets and data scope are resolved from the immutable policy version.',
    notice: 'High-risk tools are unavailable in this run. Sends, proposals and pricing still require human approval.',
    defaults: { agent: 'Email Intelligence', task: 'Classify', maxTokens: 4000, status: 'Queued', policy: 'POL-2026.04', model: 'gpt-4.1-mini v2' },
    fields: [
      { key: 'agent', label: 'Agent', type: 'select', required: true, options: ['Email Intelligence', 'Lead Intelligence', 'Knowledge Agent', 'Reporting Agent'] },
      { key: 'entity', label: 'Entity reference', type: 'text', required: true, placeholder: 'e.g. LD-2401' },
      { key: 'task', label: 'Task', type: 'select', options: ['Classify', 'Summarize', 'Score', 'Explain'] },
      { key: 'maxTokens', label: 'Token budget', type: 'number' },
      { key: 'policy', label: 'Policy version', type: 'text' },
      { key: 'model', label: 'Model version', type: 'text' },
    ],
  },
  workflows: {
    storeKey: 'workflows', title: 'Workflow', back: '/workflows', prefix: 'WF',
    subtitle: 'Create a draft workflow. Publish it from the builder to create an immutable version.',
    notice: 'Graphs are validated for cycles, depth and side-effect policy before publishing.',
    defaults: { status: 'Draft', steps: 3, owner: 'Ananya Rao', approval: 'Send requires approval', version: 'v1' },
    fields: [
      { key: 'name', label: 'Workflow name', type: 'text', required: true, full: true },
      { key: 'trigger', label: 'Trigger event', type: 'select', required: true, options: ['Willingness score ≥ 75', 'Email received', 'Task overdue', 'Stage changed', 'Schedule'] },
      { key: 'steps', label: 'Step count', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['Draft', 'Published', 'Disabled'] },
      { key: 'owner', label: 'Owner', type: 'select', options: ['Ananya Rao', 'Kabir Shah', 'Meera Iyer'] },
      { key: 'approval', label: 'Side-effect policy', type: 'select', options: ['Send requires approval', 'None', 'Manual only'] },
    ],
  },
  calendar: {
    storeKey: 'calendar', title: 'Meeting', back: '/calendar', prefix: 'MTG',
    subtitle: 'Schedule a meeting with two-way calendar sync and CRM linkage.',
    notice: 'Events are created only after a confirmed action. Provider event IDs prevent duplicates on retries.',
    defaults: { date: '2026-11-20', status: 'Tentative', type: 'Video call', provider: 'Google Calendar' },
    fields: [
      { key: 'title', label: 'Meeting title', type: 'text', required: true, full: true },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'time', label: 'Time (IST)', type: 'text', required: true, placeholder: '11:00–12:00 IST' },
      { key: 'type', label: 'Type', type: 'select', options: ['Video call', 'Internal', 'On-site'] },
      { key: 'attendees', label: 'Attendees', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Tentative', 'Confirmed', 'Cancelled'] },
      { key: 'crm', label: 'CRM link', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea', full: true },
    ],
  },
  identity: {
    storeKey: 'identity', title: 'User', back: '/identity', prefix: 'U',
    subtitle: 'Invite a user with role-based and resource-scoped permissions.',
    notice: 'Privileged roles require MFA. Disabled users are denied immediately and self-escalation is blocked.',
    defaults: { status: 'Invited', mfa: 'Required', tenant: 'Northstar Technologies' },
    fields: [
      { key: 'name', label: 'Full name', type: 'text', required: true },
      { key: 'email', label: 'Work email', type: 'email', required: true },
      { key: 'role', label: 'Role', type: 'select', required: true, options: ['Sales Manager', 'Sales Executive', 'Marketing Manager', 'Marketing Executive', 'Knowledge Manager', 'Analyst/Auditor', 'Organization Admin'] },
      { key: 'team', label: 'Team', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Invited', 'Active', 'Disabled'] },
      { key: 'mfa', label: 'MFA', type: 'select', options: ['Required', 'Enabled', 'Pending'] },
    ],
  },
  admin: {
    storeKey: 'admin', title: 'Setting', back: '/admin', prefix: 'ST',
    subtitle: 'Add a versioned configuration setting. Never store secret values here.',
    notice: 'Privileged changes are audited. Secret values are masked in every UI, API response and log.',
    defaults: { status: 'Draft', environment: 'Staging', version: 'v1', owner: 'Organization Admin' },
    fields: [
      { key: 'section', label: 'Section', type: 'text', required: true },
      { key: 'scope', label: 'Scope', type: 'text', required: true },
      { key: 'value', label: 'Value', type: 'text' },
      { key: 'environment', label: 'Environment', type: 'select', options: ['Production', 'Staging', 'All'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Draft', 'Disabled'] },
      { key: 'owner', label: 'Owner', type: 'text' },
    ],
  },
  reports: {
    storeKey: 'reports', title: 'Report definition', back: '/reports', prefix: 'RP',
    subtitle: 'Define a report schedule with explicit period boundaries and timezone.',
    notice: 'AI narratives are checked against the metric query version and cannot change source figures.',
    defaults: { status: 'Draft', cadence: 'Daily · 08:00 IST', format: 'Dashboard + PDF' },
    fields: [
      { key: 'name', label: 'Report name', type: 'text', required: true },
      { key: 'cadence', label: 'Cadence', type: 'select', required: true, options: ['Daily · 08:00 IST', 'Weekly · Mon 09:00 IST', 'Monthly · 1st, 08:00 IST'] },
      { key: 'format', label: 'Format', type: 'select', options: ['Dashboard + PDF', 'PDF + email', 'PDF + slides'] },
      { key: 'owner', label: 'Owner', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Draft', 'Scheduled'] },
    ],
  },
};

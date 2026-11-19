import type { Field } from '../lib/types';

export interface FormPageConfig {
  storeKey: string;
  title: string;
  subtitle: string;
  back: string;
  prefix: string;
  fields: Field[];
  defaults?: Record<string, any>;
}

/** Dedicated form pages for modules that do not use the standard resource configuration. */
export const customForms: Record<string, FormPageConfig> = {
  funnel: {
    storeKey: 'funnel', title: 'Opportunity', back: '/funnel', prefix: 'OP',
    subtitle: 'Add a new opportunity to your pipeline.',
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
    subtitle: 'Add an approved document to your team’s knowledge library.',
    defaults: { space: 'Delivery', acl: 'Sales + Delivery', type: 'PDF', status: 'Preparing' },
    fields: [
      { key: 'title', label: 'Document title', type: 'text', required: true, full: true },
      { key: 'space', label: 'Knowledge space', type: 'select', required: true, options: ['Delivery', 'Commercial', 'Compliance'] },
      { key: 'type', label: 'File type', type: 'select', options: ['PDF', 'DOCX', 'TXT', 'CSV', 'XLSX', 'PPTX', 'MD', 'HTML'] },
      { key: 'acl', label: 'Who can view', type: 'select', required: true, options: ['Sales + Delivery', 'Sales managers', 'All internal', 'Sales + Legal'] },
      { key: 'owner', label: 'Owner', type: 'select', options: ['Priya Sharma', 'Ananya Rao'] },
      { key: 'status', label: 'Initial status', type: 'select', options: ['Preparing', 'Ready', 'Draft', 'Archived'] },
      { key: 'version', label: 'Version', type: 'text' },
    ],
  },
  agents: {
    storeKey: 'executions', title: 'Helper task', back: '/agents', prefix: 'EX',
    subtitle: 'Choose an AI helper and the task you want it to complete.',
    defaults: { agent: 'Email Intelligence', task: 'Sort messages', status: 'Queued' },
    fields: [
      { key: 'agent', label: 'Agent', type: 'select', required: true, options: ['Email Intelligence', 'Email Drafting', 'Lead Intelligence', 'Proposal Agent', 'Reporting Agent'] },
      { key: 'entity', label: 'Related record', type: 'text', required: true, placeholder: 'e.g. LD-2401' },
      { key: 'task', label: 'Task', type: 'select', options: ['Sort messages', 'Summarise', 'Score', 'Explain'] },
      { key: 'notes', label: 'Notes for the helper', type: 'textarea', full: true },
    ],
  },
  workflows: {
    storeKey: 'workflows', title: 'Workflow', back: '/workflows', prefix: 'WF',
    subtitle: 'Create an automated routine for a repeated task.',
    defaults: { status: 'Draft', steps: 3, owner: 'Ananya Rao', approval: 'Send requires approval', version: 'v1' },
    fields: [
      { key: 'name', label: 'Workflow name', type: 'text', required: true, full: true },
      { key: 'trigger', label: 'Start when', type: 'select', required: true, options: ['Interest score ≥ 75', 'Email received', 'Task overdue', 'Stage changed', 'Schedule'] },
      { key: 'steps', label: 'Step count', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['Draft', 'Published', 'Disabled'] },
      { key: 'owner', label: 'Owner', type: 'select', options: ['Ananya Rao', 'Kabir Shah', 'Meera Iyer'] },
      { key: 'approval', label: 'Ask for approval', type: 'select', options: ['Send requires approval', 'Before sending', 'Never', 'For every step'] },
    ],
  },
  calendar: {
    storeKey: 'calendar', title: 'Meeting', back: '/calendar', prefix: 'MTG',
    subtitle: 'Schedule a meeting and add it to your calendar.',
    defaults: { date: '2026-11-20', status: 'Tentative', type: 'Video call', provider: 'Google Calendar' },
    fields: [
      { key: 'title', label: 'Meeting title', type: 'text', required: true, full: true },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'time', label: 'Time (IST)', type: 'text', required: true, placeholder: '11:00–12:00 IST' },
      { key: 'type', label: 'Type', type: 'select', options: ['Video call', 'Internal', 'On-site'] },
      { key: 'attendees', label: 'Attendees', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Tentative', 'Confirmed', 'Cancelled'] },
      { key: 'crm', label: 'Related record', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea', full: true },
    ],
  },
  identity: {
    storeKey: 'identity', title: 'User', back: '/identity', prefix: 'U',
    subtitle: 'Add a teammate and their work details.',
    defaults: { status: 'Invited', mfa: 'Required' },
    fields: [
      { key: 'name', label: 'Full name', type: 'text', required: true },
      { key: 'email', label: 'Work email', type: 'email', required: true },
      { key: 'role', label: 'Role', type: 'select', required: true, options: ['Sales Manager', 'Sales Executive', 'Marketing Manager', 'Marketing Executive', 'Knowledge Manager', 'Analyst/Auditor', 'Organization Admin'] },
      { key: 'team', label: 'Team', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Invited', 'Active', 'Disabled'] },
      { key: 'mfa', label: 'Two-step verification', type: 'select', options: ['Required', 'Enabled', 'Pending'] },
    ],
  },
  admin: {
    storeKey: 'admin', title: 'Setting', back: '/admin', prefix: 'ST',
    subtitle: 'Add a setting for your team.',
    defaults: { status: 'Draft', version: 'v1', owner: 'Organization Admin' },
    fields: [
      { key: 'section', label: 'Section', type: 'text', required: true },
      { key: 'scope', label: 'Scope', type: 'text', required: true },
      { key: 'value', label: 'Value', type: 'text' },

      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'In review', 'Draft', 'Disabled'] },
      { key: 'owner', label: 'Owner', type: 'text' },
    ],
  },
  reports: {
    storeKey: 'reports', title: 'Report', back: '/reports', prefix: 'RP',
    subtitle: 'Choose what a report should include and when it should arrive.',
    defaults: { status: 'Draft', cadence: 'Daily · 08:00 IST', format: 'Dashboard + PDF' },
    fields: [
      { key: 'name', label: 'Report name', type: 'text', required: true },
      { key: 'cadence', label: 'Cadence', type: 'select', required: true, options: ['Daily · 08:00 IST', 'Weekly · Mon 09:00 IST', 'Monthly · 1st, 08:00 IST'] },
      { key: 'format', label: 'Format', type: 'select', options: ['Dashboard + PDF', 'PDF + email', 'PDF + slides'] },
      { key: 'owner', label: 'Owner', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Draft', 'Scheduled', 'Delivered', 'Failed'] },
    ],
  },
};

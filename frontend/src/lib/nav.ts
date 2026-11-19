import {
  LayoutDashboard, ShieldCheck, UserRound, ClipboardList, Building2, BookOpen, Bot,
  Mail, Megaphone, Inbox, Gauge, Columns3, ListTodo, Workflow, FileText, BrainCircuit,
  TrendingUp, Undo2, CalendarDays, MessageCircle, AudioLines, Gift, Languages,
  ChartNoAxesCombined, Settings2,
} from 'lucide-react';
import type { NavModule } from './types';

export const navModules: NavModule[] = [
  { path: '/dashboard', title: 'Analytics Dashboard', icon: LayoutDashboard, group: 'Overview', spec: 2, short: 'Role-filtered metrics' },
  { path: '/leads', title: 'Lead Management', icon: UserRound, group: 'Sales workspace', spec: 3, short: 'Prospects & activities' },
  { path: '/companies', title: 'Companies & Contacts', icon: Building2, group: 'Sales workspace', spec: 5, short: 'Accounts & preferences' },
  { path: '/forms', title: 'Website Lead Capture', icon: ClipboardList, group: 'Sales workspace', spec: 4, short: 'Public forms' },
  { path: '/inbox', title: 'Unified Inbox', icon: Inbox, group: 'Sales workspace', spec: 10, short: 'Conversations' },
  { path: '/email', title: 'Email Integration', icon: Mail, group: 'Sales workspace', spec: 8, short: 'IMAP / SMTP accounts' },
  { path: '/campaigns', title: 'Email Campaigns', icon: Megaphone, group: 'Sales workspace', spec: 9, short: 'Audiences & approval' },
  { path: '/tasks', title: 'Tasks & Follow-ups', icon: ListTodo, group: 'Sales workspace', spec: 13, short: 'Next actions' },
  { path: '/funnel', title: 'Sales Funnel', icon: Columns3, group: 'Sales workspace', spec: 12, short: 'Opportunities' },
  { path: '/proposals', title: 'Proposals & Quotations', icon: FileText, group: 'Sales workspace', spec: 15, short: 'Approved pricing' },
  { path: '/knowledge', title: 'Knowledge Base', icon: BookOpen, group: 'Intelligence & automation', spec: 6, short: 'Private RAG corpus' },
  { path: '/agents', title: 'Agent Orchestration', icon: Bot, group: 'Intelligence & automation', spec: 7, short: 'Bounded agents' },
  { path: '/willingness', title: 'Willingness Scoring', icon: Gauge, group: 'Intelligence & automation', spec: 11, short: 'Evidence-based score' },
  { path: '/predictive', title: 'Predictive Intelligence', icon: BrainCircuit, group: 'Intelligence & automation', spec: 16, short: 'Conversion propensity' },
  { path: '/forecasting', title: 'Revenue Forecasting', icon: TrendingUp, group: 'Intelligence & automation', spec: 17, short: 'Weighted pipeline' },
  { path: '/recovery', title: 'Lost Lead Recovery', icon: Undo2, group: 'Intelligence & automation', spec: 18, short: 'Re-engagement' },
  { path: '/meeting-intel', title: 'Meeting Intelligence', icon: AudioLines, group: 'Intelligence & automation', spec: 21, short: 'Summaries & actions' },
  { path: '/multilingual', title: 'Multilingual Communication', icon: Languages, group: 'Intelligence & automation', spec: 23, short: 'Reviewed translations' },
  { path: '/workflows', title: 'Workflow Builder', icon: Workflow, group: 'Intelligence & automation', spec: 14, short: 'Event → condition → action' },
  { path: '/calendar', title: 'Calendar & Meetings', icon: CalendarDays, group: 'Engagement & reporting', spec: 19, short: 'Scheduling' },
  { path: '/whatsapp', title: 'WhatsApp Business', icon: MessageCircle, group: 'Engagement & reporting', spec: 20, short: 'Official API channel' },
  { path: '/referrals', title: 'Referral Management', icon: Gift, group: 'Engagement & reporting', spec: 22, short: 'Attribution' },
  { path: '/reports', title: 'Reporting Management', icon: ChartNoAxesCombined, group: 'Engagement & reporting', spec: 24, short: 'Daily / weekly / monthly' },
  { path: '/identity', title: 'Identity & Access', icon: ShieldCheck, group: 'Platform', spec: 1, short: 'Users, roles, MFA' },
  { path: '/admin', title: 'Admin, Settings & Audit', icon: Settings2, group: 'Platform', spec: 25, short: 'Policies & audit log' },
];

export const groups = ['Overview', 'Sales workspace', 'Intelligence & automation', 'Engagement & reporting', 'Platform'];

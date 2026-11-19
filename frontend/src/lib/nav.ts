import {
  LayoutDashboard, ShieldCheck, UserRound, ClipboardList, Building2, BookOpen, Bot,
  Mail, Megaphone, Inbox, Gauge, Columns3, ListTodo, Workflow, FileText, BrainCircuit,
  TrendingUp, Undo2, CalendarDays, MessageCircle, AudioLines, Gift, Languages,
  ChartNoAxesCombined, Settings2,
} from 'lucide-react';
import type { NavModule } from './types';

export const navModules: NavModule[] = [
  { path: '/dashboard', title: 'Analytics Dashboard', icon: LayoutDashboard, group: 'Overview', short: 'Performance at a glance' },
  { path: '/leads', title: 'Lead Management', icon: UserRound, group: 'Sales workspace', short: 'People to follow up with' },
  { path: '/companies', title: 'Companies & Contacts', icon: Building2, group: 'Sales workspace', short: 'Customer accounts' },
  { path: '/forms', title: 'Lead Forms', icon: ClipboardList, group: 'Sales workspace', short: 'Capture new enquiries' },
  { path: '/inbox', title: 'Unified Inbox', icon: Inbox, group: 'Sales workspace', short: 'Customer conversations' },
  { path: '/email', title: 'Mailboxes', icon: Mail, group: 'Sales workspace', short: 'Connected mailboxes' },
  { path: '/campaigns', title: 'Campaigns', icon: Megaphone, group: 'Sales workspace', short: 'Campaign performance' },
  { path: '/tasks', title: 'Tasks & Follow-ups', icon: ListTodo, group: 'Sales workspace', short: 'Your to-do list' },
  { path: '/funnel', title: 'Sales Pipeline', icon: Columns3, group: 'Sales workspace', short: 'Deals in progress' },
  { path: '/proposals', title: 'Proposals & Quotations', icon: FileText, group: 'Sales workspace', short: 'Pricing and proposals' },
  { path: '/knowledge', title: 'Knowledge Library', icon: BookOpen, group: 'Intelligence & automation', short: 'Company documents' },
  { path: '/agents', title: 'AI Helpers', icon: Bot, group: 'Intelligence & automation', short: 'AI helpers' },
  { path: '/willingness', title: 'Interest Levels', icon: Gauge, group: 'Intelligence & automation', short: 'Interest levels' },
  { path: '/predictive', title: 'Lead Insights', icon: BrainCircuit, group: 'Intelligence & automation', short: 'Likely next wins' },
  { path: '/forecasting', title: 'Revenue Forecasts', icon: TrendingUp, group: 'Intelligence & automation', short: 'Revenue outlook' },
  { path: '/recovery', title: 'Lost Lead Recovery', icon: Undo2, group: 'Intelligence & automation', short: 'Second chances' },
  { path: '/meeting-intel', title: 'Meeting Notes', icon: AudioLines, group: 'Intelligence & automation', short: 'Meeting notes' },
  { path: '/multilingual', title: 'Translations', icon: Languages, group: 'Intelligence & automation', short: 'Localised messages' },
  { path: '/workflows', title: 'Automations', icon: Workflow, group: 'Intelligence & automation', short: 'Automated routines' },
  { path: '/calendar', title: 'Calendar & Meetings', icon: CalendarDays, group: 'Engagement & reporting', short: 'Appointments' },
  { path: '/whatsapp', title: 'WhatsApp', icon: MessageCircle, group: 'Engagement & reporting', short: 'Chat with customers' },
  { path: '/referrals', title: 'Referral Management', icon: Gift, group: 'Engagement & reporting', short: 'Referrals and rewards' },
  { path: '/reports', title: 'Reports', icon: ChartNoAxesCombined, group: 'Engagement & reporting', short: 'Insights and summaries' },
  { path: '/identity', title: 'Team & Access', icon: ShieldCheck, group: 'Platform', short: 'People and permissions' },
  { path: '/admin', title: 'Workspace Settings', icon: Settings2, group: 'Platform', short: 'Workspace preferences' },
];

export const groups = ['Overview', 'Sales workspace', 'Intelligence & automation', 'Engagement & reporting', 'Platform'];

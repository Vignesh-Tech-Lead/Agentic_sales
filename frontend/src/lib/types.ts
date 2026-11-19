import type { LucideIcon } from 'lucide-react';

export type Row = Record<string, any> & { id: string };
export type Tone = 'slate' | 'green' | 'blue' | 'amber' | 'rose' | 'purple' | 'teal';

export type FieldType =
  | 'text' | 'textarea' | 'number' | 'currency' | 'select' | 'multiselect'
  | 'date' | 'datetime' | 'boolean' | 'email' | 'url' | 'password' | 'percent';

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  help?: string;
  full?: boolean;
  readOnly?: boolean;
}

export interface Column {
  key: string;
  label: string;
  type?: FieldType;
  badge?: boolean;
  width?: string;
  hidden?: boolean;
}

export interface NavModule {
  path: string;
  title: string;
  icon: LucideIcon;
  group: string;
  short: string;
}

export interface ModuleConfig {
  key: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  group: string;
  entity: string;
  fields: Field[];
  columns: Column[];
  seed: Row[];
  filters?: { key: string; label: string; options: string[] }[];
  createLabel?: string;
  features?: string[];
  banner?: string;
  role?: string;
  detailSections?: string[];
}

export interface Toast {
  id: number;
  title: string;
  message?: string;
  tone: 'success' | 'info' | 'warning' | 'danger';
}

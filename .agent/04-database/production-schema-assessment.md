# Application Database Review and Target Structure

## Scope and source of truth

Reviewed the frontend data model (`frontend/src/lib/types.ts`, `seed.ts`, `config/resourceModules.ts`, `config/formPages.ts`, and `store.tsx`), the database design documents in this directory, and the live Supabase catalog and row counts for project `omivwezjvbmsgiacfxjg`.

## Current live database

The public schema currently has one application table: `public.workspace_records`.

| Column | PostgreSQL type | Null | Default / key | Current role |
|---|---|---:|---|---|
| `id` | `text` | No | Primary key | UI-generated record key, often human-readable (`LD-01`) |
| `tenant_id` | `uuid` | No | Defaults to `00000000-0000-0000-0000-000000000001` | Tenant partition marker |
| `module` | `text` | No | — | Names the frontend collection |
| `data` | `jsonb` | No | `{}` | Entire business record, including its `id`, in an unvalidated document |
| `created_at` | `timestamptz` | No | `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | No | `now()` | Last update timestamp |

The table has 112 records across 27 `module` values: `admin`, `agents`, `audit`, `calendar`, `campaigns`, `companies`, `email`, `executions`, `forecasting`, `forms`, `funnel`, `identity`, `identityRoles`, `inbox`, `knowledge`, `leads`, `meeting-intel`, `multilingual`, `predictive`, `proposals`, `recovery`, `referrals`, `reports`, `tasks`, `whatsapp`, `willingness`, and `workflows`. All currently belong to the single demo tenant.

RLS is enabled but not forced. Four `anon` policies allow select/insert/update/delete for the hard-coded demo tenant UUID. This is demo isolation, not authenticated per-user authorization or production-grade tenant isolation. There are no declared foreign keys, check constraints, module constraints, or useful secondary indexes reported for the table.

## Application model findings

- `Row` is effectively `Record<string, any> & { id: string }`; TypeScript does not enforce a record's module-specific fields or field types.
- Resource configs describe form fields (`text`, `textarea`, `number`, `currency`, `select`, `multiselect`, `date`, `datetime`, `boolean`, `email`, `url`, `password`, `percent`) but those descriptors are UI metadata, not database constraints.
- The store reads and writes whole JSON records through one table. Inserts and updates do not resolve references such as lead owner, company, pipeline stage, or campaign recipient to foreign keys.
- The same JSON column mixes relational facts, long-form text, statuses, dates, numeric amounts, and variable metadata. PostgreSQL cannot reliably enforce data types or relationships inside these arbitrary records.
- The UI uses readable text IDs. A normalized schema should use UUID primary keys and retain readable IDs as tenant-scoped `record_number`/`code` values during migration, so existing links and visible references continue to work.

## Recommended target model

Use standard relational tables for business entities and typed columns for searchable/filterable facts. Keep `jsonb` only for versioned user-defined form definitions, workflow/agent definitions, provider payload snapshots, and non-authoritative metadata. Do not use a generic `module + jsonb` record as the permanent source of truth.

### Platform and identity

- `tenants(id uuid, name, slug, status, timezone, created_at, updated_at)`
- `profiles(id uuid references auth.users, display_name, email, created_at, updated_at)`
- `tenant_memberships(tenant_id, user_id, status, joined_at)`
- `roles(id, tenant_id nullable for built-ins, name)`; `permissions(code)`; `user_roles`; `role_permissions`
- `audit_logs(id, tenant_id, actor_id, action, entity_type, entity_id, metadata jsonb, created_at)`

Application passwords and provider secrets must not be stored in ordinary records; use Supabase Auth and secret storage/envelope encryption.

### CRM and work

- `companies(id uuid, tenant_id, record_number text, name text, website text, industry text, country_code char(2), timestamps)`
- `contacts(id uuid, tenant_id, company_id uuid nullable, record_number text, name text, email citext nullable, phone text nullable, consent_status text, timestamps)`
- `leads(id uuid, tenant_id, contact_id uuid nullable, company_id uuid nullable, owner_id uuid nullable, source text, status text, requirement text, budget_amount numeric(15,2), currency char(3), timestamps)`
- `pipelines(id uuid, tenant_id, name text)` and `pipeline_stages(id uuid, tenant_id, pipeline_id, name text, position integer)`
- `opportunities(id uuid, tenant_id, lead_id uuid nullable, company_id uuid nullable, owner_id uuid nullable, pipeline_id uuid, stage_id uuid, amount numeric(15,2), currency char(3), probability numeric(5,2), expected_close_date date, timestamps)`
- `tasks(id uuid, tenant_id, owner_id uuid nullable, lead_id/opportunity_id uuid nullable, title text, due_at timestamptz, status text, priority text, timestamps)`
- `stage_transitions(id uuid, tenant_id, opportunity_id uuid, from_stage_id uuid nullable, to_stage_id uuid, actor_id uuid nullable, changed_at timestamptz)` (append-only history)

### Communications and automation

- `email_accounts`, `email_threads`, `email_messages`, `email_suppressions`; represent messages and recipients with relational/thread keys and typed timestamps, while retaining provider snapshots only where required.
- `campaigns`, `campaign_recipients`, `campaign_events`; separate consent/suppression and delivery events from campaign definitions.
- `knowledge_bases`, `documents`, `document_versions`, `document_chunks`; embeddings in a model-versioned vector table only if/when retrieval is used.
- `agent_definitions`, `agent_versions`, `agent_executions`, `agent_tool_calls`, `agent_approvals`; versioned definitions may use validated `jsonb`.
- `workflows`, `workflow_versions`, `workflow_executions`, `workflow_steps`; definitions and step payloads may use schema-validated `jsonb`, while status/timestamps/relationships remain typed.
- `proposals`, `proposal_versions`, `proposal_approvals`; money uses numeric, approvals bind to an immutable version/hash.
- `meetings`, `meeting_participants`, `meeting_summaries`; `willingness_scores`, `referrals`, `forecast_snapshots`, and `generated_reports` as typed, tenant-owned entities.
- `lead_forms` and `form_submissions`; form schemas and allowlisted submission payloads may be JSONB and must be versioned/idempotent.

The complete logical table catalogue and additional module-specific fields remain in `data-dictionary.md` and `ERD.mmd`; this review clarifies that those documents describe a target model, not the current live schema.

## Data type and constraint rules

- Primary/foreign keys: UUID. Keep current public IDs in a unique `(tenant_id, module, record_number)` migration mapping until the frontend switches to UUIDs.
- Every tenant-owned table: `tenant_id uuid not null`; unique `(tenant_id, id)`; tenant-aware composite foreign keys `(tenant_id, related_id)` to prevent cross-tenant references.
- Money: `numeric(15,2)` plus ISO 4217 `char(3)` currency; never floating point. Range checks for nonnegative values where domain rules require.
- Scores/probabilities: `numeric(5,2)` with `0 <= value <= 100`.
- Business-only dates: `date`; actual instants: `timestamptz`.
- Boolean flags: `boolean`; finite states: lookup tables or `check` constraints, not arbitrary free-form values.
- Emails: `citext` or normalized text with a deliberate uniqueness policy. Do not assume contact emails are globally unique.
- Variable document/configuration/provider payload: `jsonb`, with a version/schema validator. Core searchable facts should not remain JSONB.
- Standard timestamps: `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()`; update trigger required for `updated_at`.
- Index tenant-scoped FKs, common `(tenant_id, status)` filters, owner/due-date queries, and provider idempotency keys. Avoid blanket JSONB indexes.

## Migration / implementation plan

1. Keep `workspace_records` intact as the compatibility source while introducing normalized tables; do not drop, rewrite, or reinterpret existing data in place.
2. Add `tenants` and auth-backed memberships with trusted server-side tenant resolution. Do not use the current constant tenant UUID as a production authorization mechanism.
3. Add normalized CRM tables first (companies, contacts, leads, pipelines/stages, opportunities, tasks) with constraints, indexes, `updated_at` triggers, RLS policies, and cross-tenant FK guarantees.
4. Backfill using an explicit, reviewable mapping per current `module`; preserve source `id` in `record_number` and record mapping rows. Validate row counts, IDs, relationships, dates, numeric/currency fields, and unmapped JSON fields before switching reads.
5. Update API mutations/read paths to transact against typed tables; dual-write only during a bounded, monitored migration window. Compare API responses and totals against the compatibility table.
6. Migrate the remaining modules in bounded groups, then make `workspace_records` read-only, retain a rollback window, and remove it only after verified backups and acceptance checks.

## Implementation status

The CRM-core migration `create_normalized_crm_core` and module split migration `split_workspace_records_by_module` were applied to Supabase. The live database now has the normalized CRM foundation and 27 module-specific tables, `module_identity` through `module_audit`, in addition to `workspace_records`. The module tables have composite `(tenant_id, id)` primary keys, JSON-object/id consistency checks, status and updated-time indexes, and RLS enabled/forced. Rows were copied with original IDs and the legacy table is retained as a point-in-time pre-cutover snapshot. The verified 27 module row counts total 112, matching the source table at cutover. The snapshot is not dual-written, so it must not be used as a current rollback dataset after new module-table writes unless changes are synchronized back first.

The frontend and API were updated to read and write module-specific tables; the API cache namespace has been bumped to avoid stale cached state. Important limitation: module payload attributes remain in JSONB at this stage. This achieves physical module separation and adds indexes for status/update filtering, but it is not the final typed, relational schema. Next work should replace frequently queried JSON fields with module-specific typed columns, then add foreign keys between company/contact/lead/opportunity records and establish authenticated membership-based tenant policies. Current policies preserve the app's existing single-demo-tenant behavior; they are not a substitute for real user authentication.

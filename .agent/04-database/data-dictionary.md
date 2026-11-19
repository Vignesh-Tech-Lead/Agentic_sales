# Database Data Dictionary — PostgreSQL Baseline

## Conventions
- UUID primary keys (`UUID`, generated with `gen_random_uuid()` or application UUID).
- `tenant_id UUID NOT NULL` on tenant-owned rows.
- `TIMESTAMPTZ` for instants; `DATE` for business dates.
- `NUMERIC(15,2)` for money; never FLOAT/REAL for currency.
- `NUMERIC(5,2)` for percentages/scores where range 0–100.
- `CITEXT` or normalized `VARCHAR` for case-insensitive email.
- `JSONB` only for variable metadata/configuration, not core relational facts.
- `TEXT` for long content; avoid oversized VARCHAR without business reason.
- `BYTEA` only for encrypted binary material where secret manager reference is not used.
- All business entities should have `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`, `updated_at`, and actor columns as appropriate.
- Use `deleted_at` only where soft deletion is required; security/retention policy governs actual purge.

## Identity and tenancy
| Table | Column | Type | Null | Key/default | Restriction |
|---|---|---|---|---|---|
| tenants | id | UUID | NO | PK | generated |
| tenants | name | VARCHAR(200) | NO | | non-empty |
| tenants | slug | VARCHAR(100) | NO | UNIQUE | lowercase slug |
| tenants | status | VARCHAR(30) | NO | DEFAULT 'active' | CHECK status |
| tenants | timezone | VARCHAR(60) | NO | DEFAULT 'Asia/Kolkata' | valid IANA zone |
| users | id | UUID | NO | PK | generated |
| users | tenant_id | UUID | NO | FK tenants | tenant scoped |
| users | name | VARCHAR(150) | NO | | non-empty |
| users | email | CITEXT | NO | | UNIQUE (tenant_id,email) |
| users | password_hash | TEXT | YES | | Argon2id/bcrypt encoded; null for SSO-only |
| users | status | VARCHAR(30) | NO | DEFAULT 'active' | CHECK |
| roles | id | UUID | NO | PK | |
| roles | tenant_id | UUID | YES | FK tenants | null only for global built-in role |
| roles | name | VARCHAR(100) | NO | | unique within tenant |
| permissions | id | UUID | NO | PK | |
| permissions | code | VARCHAR(120) | NO | UNIQUE | stable permission identifier |
| user_roles | user_id | UUID | NO | FK users | composite PK with role_id |
| user_roles | role_id | UUID | NO | FK roles | |
| role_permissions | role_id | UUID | NO | FK roles | composite PK with permission_id |
| role_permissions | permission_id | UUID | NO | FK permissions | |
| audit_logs | id | UUID | NO | PK | |
| audit_logs | tenant_id | UUID | NO | FK tenants | |
| audit_logs | actor_id | UUID | YES | FK users | null for system actor |
| audit_logs | action | VARCHAR(120) | NO | | controlled action |
| audit_logs | entity_type | VARCHAR(100) | NO | | |
| audit_logs | entity_id | UUID | YES | | |
| audit_logs | metadata | JSONB | NO | DEFAULT '{}' | redact PII/secrets |

## CRM and lead capture
| Table | Column | Type | Null | Key/default | Restriction |
|---|---|---|---|---|---|
| companies | id | UUID | NO | PK | |
| companies | tenant_id | UUID | NO | FK tenants | |
| companies | name | VARCHAR(200) | NO | | trim/non-empty |
| companies | website | VARCHAR(500) | YES | | URL validation |
| companies | industry_id | UUID | YES | FK industries | same tenant |
| companies | country_code | CHAR(2) | YES | | ISO country code |
| contacts | id | UUID | NO | PK | |
| contacts | tenant_id | UUID | NO | FK tenants | |
| contacts | company_id | UUID | YES | FK companies | same tenant |
| contacts | name | VARCHAR(150) | NO | | |
| contacts | email | CITEXT | YES | | normalized |
| contacts | phone | VARCHAR(30) | YES | | normalized E.164 where possible |
| contacts | consent_status | VARCHAR(30) | NO | DEFAULT 'unknown' | controlled values |
| leads | id | UUID | NO | PK | |
| leads | tenant_id | UUID | NO | FK tenants | |
| leads | contact_id | UUID | NO | FK contacts | same tenant |
| leads | company_id | UUID | YES | FK companies | same tenant |
| leads | source_id | UUID | NO | FK lead_sources | same tenant |
| leads | service_id | UUID | YES | FK services | same tenant |
| leads | owner_id | UUID | YES | FK users | same tenant |
| leads | status | VARCHAR(30) | NO | DEFAULT 'new' | CHECK/lookup |
| leads | requirement | TEXT | YES | | size/policy limit |
| leads | budget_amount | NUMERIC(15,2) | YES | | CHECK >= 0 |
| leads | currency | CHAR(3) | YES | | ISO 4217 |
| lead_forms | id | UUID | NO | PK | |
| lead_forms | tenant_id | UUID | NO | FK tenants | |
| lead_forms | slug | VARCHAR(120) | NO | | UNIQUE (tenant_id,slug) |
| lead_forms | schema | JSONB | NO | | schema versioned |
| lead_forms | status | VARCHAR(20) | NO | | draft/published/disabled |
| form_submissions | id | UUID | NO | PK | |
| form_submissions | tenant_id | UUID | NO | FK tenants | |
| form_submissions | form_id | UUID | NO | FK lead_forms | |
| form_submissions | idempotency_key | VARCHAR(150) | NO | | UNIQUE (form_id,idempotency_key) |
| form_submissions | payload | JSONB | NO | | allowlisted fields only |

## Knowledge base
| Table | Column | Type | Null | Key/default | Restriction |
|---|---|---|---|---|---|
| knowledge_bases | id | UUID | NO | PK | |
| knowledge_bases | tenant_id | UUID | NO | FK tenants | |
| knowledge_bases | name | VARCHAR(150) | NO | | |
| knowledge_bases | access_scope | VARCHAR(30) | NO | | controlled scope |
| documents | id | UUID | NO | PK | |
| documents | tenant_id | UUID | NO | FK tenants | |
| documents | knowledge_base_id | UUID | NO | FK knowledge_bases | same tenant |
| documents | title | VARCHAR(250) | NO | | |
| documents | filename | VARCHAR(255) | NO | | original display name |
| documents | mime_type | VARCHAR(120) | NO | | sniffed MIME |
| documents | checksum | CHAR(64) | NO | | SHA-256 hex |
| documents | status | VARCHAR(30) | NO | | state machine |
| document_versions | id | UUID | NO | PK | |
| document_versions | document_id | UUID | NO | FK documents | |
| document_versions | version | INTEGER | NO | | UNIQUE(document_id,version), >0 |
| document_versions | storage_key | TEXT | NO | | private object key |
| document_versions | size_bytes | BIGINT | NO | | CHECK >= 0 |
| document_chunks | id | UUID | NO | PK | |
| document_chunks | document_version_id | UUID | NO | FK document_versions | |
| document_chunks | chunk_index | INTEGER | NO | | UNIQUE(version_id,chunk_index) |
| document_chunks | content | TEXT | NO | | protected content |
| document_chunks | page_number | INTEGER | YES | | CHECK > 0 if present |
| document_embeddings | chunk_id | UUID | NO | PK/FK | one or more model-specific rows if schema extended |
| document_embeddings | embedding | VECTOR(N) | NO | | N equals embedding model dimension |
| document_embeddings | model_name | VARCHAR(150) | NO | | model/version identifier |
| document_permissions | document_id | UUID | NO | FK documents | |
| document_permissions | role_id | UUID | NO | FK roles | composite unique |
| document_permissions | access_type | VARCHAR(30) | NO | | read/manage |

## Email and campaigns
| Table | Column | Type | Null | Key/default | Restriction |
|---|---|---|---|---|---|
| email_accounts | id | UUID | NO | PK | |
| email_accounts | tenant_id | UUID | NO | FK tenants | |
| email_accounts | email_address | CITEXT | NO | | UNIQUE within tenant/account policy |
| email_accounts | imap_host | VARCHAR(255) | YES | | |
| email_accounts | imap_port | INTEGER | YES | | CHECK 1..65535 |
| email_accounts | smtp_host | VARCHAR(255) | YES | | |
| email_accounts | smtp_port | INTEGER | YES | | CHECK 1..65535 |
| email_accounts | auth_type | VARCHAR(30) | NO | | password/oauth/provider |
| email_credentials | account_id | UUID | NO | PK/FK | |
| email_credentials | encrypted_secret | BYTEA | YES | | envelope encrypted |
| email_sync_states | id | UUID | NO | PK | |
| email_sync_states | account_id | UUID | NO | FK email_accounts | |
| email_sync_states | folder | VARCHAR(255) | NO | | |
| email_sync_states | uidvalidity | BIGINT | YES | | IMAP state |
| email_sync_states | last_uid | BIGINT | NO | DEFAULT 0 | |
| email_messages | id | UUID | NO | PK | |
| email_messages | thread_id | UUID | NO | FK email_threads | |
| email_messages | account_id | UUID | NO | FK email_accounts | |
| email_messages | provider_message_id | VARCHAR(255) | YES | | provider identity |
| email_messages | direction | VARCHAR(10) | NO | | inbound/outbound |
| email_messages | sender | CITEXT | NO | | |
| email_messages | recipients | JSONB | NO | | normalized structured addresses |
| email_messages | body_text | TEXT | YES | | retention/access policy |
| email_messages | body_html | TEXT | YES | | sanitized copy |
| email_suppressions | id | UUID | NO | PK | |
| email_suppressions | tenant_id | UUID | NO | FK tenants | |
| email_suppressions | email | CITEXT | NO | | UNIQUE(tenant_id,email) |
| campaigns | id | UUID | NO | PK | |
| campaigns | tenant_id | UUID | NO | FK tenants | |
| campaigns | name | VARCHAR(200) | NO | | |
| campaigns | status | VARCHAR(30) | NO | | state machine |
| campaign_recipients | id | UUID | NO | PK | |
| campaign_recipients | campaign_id | UUID | NO | FK campaigns | |
| campaign_recipients | contact_id | UUID | YES | FK contacts | |
| campaign_recipients | email | CITEXT | NO | | snapshot recipient |
| campaign_events | id | UUID | NO | PK | |
| campaign_events | recipient_id | UUID | NO | FK campaign_recipients | |
| campaign_events | event_type | VARCHAR(50) | NO | | delivered/bounce/complaint/unsubscribe etc |

## Sales, scoring and automation
| Table | Column | Type | Null | Key/default | Restriction |
|---|---|---|---|---|---|
| pipelines | id | UUID | NO | PK | |
| pipelines | tenant_id | UUID | NO | FK tenants | |
| pipeline_stages | id | UUID | NO | PK | |
| pipeline_stages | pipeline_id | UUID | NO | FK pipelines | |
| pipeline_stages | sequence | INTEGER | NO | | UNIQUE(pipeline_id,sequence) |
| opportunities | id | UUID | NO | PK | |
| opportunities | tenant_id | UUID | NO | FK tenants | |
| opportunities | lead_id | UUID | YES | FK leads | |
| opportunities | amount | NUMERIC(15,2) | NO | DEFAULT 0 | CHECK >= 0 |
| opportunities | probability | NUMERIC(5,2) | NO | DEFAULT 0 | CHECK 0..100 |
| opportunities | expected_close_date | DATE | YES | | |
| stage_transitions | id | UUID | NO | PK | append-only history |
| willingness_scores | id | UUID | NO | PK | |
| willingness_scores | contact_id | UUID | NO | FK contacts | |
| willingness_scores | score | NUMERIC(5,2) | NO | | CHECK 0..100 |
| willingness_scores | model_version | INTEGER | NO | | |
| willingness_scores | evidence | JSONB | NO | | source references |
| workflows | id | UUID | NO | PK | |
| workflow_versions | id | UUID | NO | PK | |
| workflow_versions | version | INTEGER | NO | | UNIQUE(workflow_id,version) |
| workflow_versions | definition | JSONB | NO | | validated graph |
| workflow_executions | id | UUID | NO | PK | |
| workflow_executions | status | VARCHAR(30) | NO | | state machine |
| workflow_steps | id | UUID | NO | PK | |
| workflow_steps | input | JSONB | YES | | reference/redacted data |
| workflow_steps | output | JSONB | YES | | reference/redacted data |

## AI, proposals, meetings and reporting
| Table | Column | Type | Null | Key/default | Restriction |
|---|---|---|---|---|---|
| agent_definitions | id | UUID | NO | PK | |
| agent_versions | id | UUID | NO | PK | |
| agent_versions | version | INTEGER | NO | | UNIQUE(agent_id,version) |
| agent_executions | id | UUID | NO | PK | |
| agent_executions | status | VARCHAR(30) | NO | | state machine |
| agent_executions | input_reference | JSONB | NO | | references, not secrets |
| agent_executions | output_reference | JSONB | YES | | schema-validated |
| agent_tool_calls | id | UUID | NO | PK | |
| agent_approvals | id | UUID | NO | PK | action/payload hash bound |
| proposals | id | UUID | NO | PK | |
| proposals | opportunity_id | UUID | NO | FK opportunities | |
| proposals | version | INTEGER | NO | | UNIQUE(opportunity_id,version) |
| proposals | total_amount | NUMERIC(15,2) | NO | | CHECK >= 0 |
| proposal_approvals | id | UUID | NO | PK | approved artifact hash |
| meetings | id | UUID | NO | PK | |
| meetings | starts_at | TIMESTAMPTZ | NO | | ends_at > starts_at |
| meeting_summaries | id | UUID | NO | PK | source reference |
| referrals | id | UUID | NO | PK | tenant scoped |
| generated_reports | id | UUID | NO | PK | |
| generated_reports | period_start | DATE | NO | | <= period_end |
| generated_reports | period_end | DATE | NO | | |
| forecast_snapshots | id | UUID | NO | PK | |
| forecast_snapshots | weighted_amount | NUMERIC(15,2) | NO | | currency/period defined |

## Mandatory database constraints and indexes
- Composite unique `(tenant_id, normalized_email)` where business rules permit; do not force contact email uniqueness if shared addresses are legitimate.
- Composite tenant-aware FKs: `(tenant_id, related_id)` references `(tenant_id, id)` on related tenant tables.
- Check constraints for scores/probability 0–100, amounts >= 0, positive sizes, valid date intervals.
- Unique `(account_id, folder, uidvalidity, uid)` for IMAP messages when UID identity is modeled.
- Unique `(form_id, idempotency_key)` for public submissions.
- Unique `(workflow_id, version)`, `(agent_id, version)`, `(document_id, version)`.
- Index foreign keys, tenant_id + status, tenant_id + created_at, owner_id + status, opportunity stage/date, email thread/date.
- GIN indexes for carefully selected JSONB fields.
- Full-text index for permitted text search.
- pgvector HNSW/IVFFlat selection based on volume and benchmark.
- RLS policy must use trusted transaction-local tenant context and fail closed if absent.

## Migration note
This is a logical data dictionary. Before production, generate complete SQLAlchemy models and Alembic migrations, validate all FK/unique/index definitions, and run migration tests against a clean and upgrade database.

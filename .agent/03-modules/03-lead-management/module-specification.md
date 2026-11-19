# Module Specification — Lead Management

## 1. Purpose
Create and maintain prospects from manual, owned form and approved imports.

## 2. Functional scope
- Lead create/edit/view/archive, owner assignment, source attribution, service interest, requirement notes, budget/timeline, activities and duplicate review.
- Normalize email/phone; potential duplicate detection; merge only with explicit authorized action; import preview and row-level error report.
- Lead lifecycle state is separate from opportunity pipeline stage.

## 3. Primary data entities
- `companies`
- `contacts`
- `leads`
- `lead_sources`
- `services`
- `lead_activities`
- `lead_duplicates`
- `import_jobs`

## 4. API surface (illustrative; finalize in OpenAPI)
- `GET/POST /api/v1/leads`
- `GET/PUT /api/v1/leads/{id}`
- `POST /api/v1/leads/{id}/assign`
- `POST /api/v1/leads/import`

## 5. Backend workflow
1. Authenticate caller or verify public endpoint policy.
2. Resolve trusted tenant and actor/service identity.
3. Validate request schema and business invariants.
4. Authorize action against role, resource and policy.
5. Load required records using tenant-scoped repositories.
6. Execute domain service inside transaction where records change.
7. Write audit and outbox event atomically.
8. Enqueue asynchronous work where needed; return operation/job ID.
9. Worker revalidates status, permissions and idempotency before side effect.
10. Persist result, emit completion event and notify relevant user.

## 6. Validation and restrictions
- Required contact/identity fields per configured form; valid email; phone normalization; nonnegative budget; supported currency; owner in same tenant; valid source/service; idempotency; duplicate warning.

## 7. Acceptance criteria
Valid lead persists once; duplicate candidates are flagged; cross-tenant relationships are rejected; audit and activity created.

## 8. Failure handling
- Validation errors: return field-level 4xx; do not create partial records.
- Authorization errors: deny and audit security-relevant attempts.
- Transient provider/network errors: bounded retry with exponential backoff and jitter.
- Permanent errors: mark failed, retain safe error code, expose operator remediation.
- Ambiguous external side effect: reconcile provider status before retry to avoid duplicates.
- Every asynchronous job has correlation ID, tenant scope, attempt count and terminal state.

## 9. Security and privacy
- Apply least privilege and tenant scoping to every read/write.
- Treat user-supplied text, uploaded files and inbound email as untrusted.
- Do not log secrets or unnecessary personal data.
- Respect retention and communication preference policies.
- Record audit metadata without copying credentials or full sensitive message bodies.

## 10. UI screens
Provide list/detail/create/edit screens as appropriate, loading/empty/error states, permission-aware actions, validation messages, activity history and responsive layout. Destructive actions require confirmation. AI recommendations must be visually distinguished from confirmed facts and human-approved actions.

## 11. Dependencies
- Identity and tenant context.
- Audit/event/outbox infrastructure.
- PostgreSQL repositories.
- Celery worker framework for asynchronous work.
- Notification service where applicable.

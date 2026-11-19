# Module Specification — Visual Workflow Automation Builder

## 1. Purpose
Let admins configure event-condition-action automations.

## 2. Functional scope
- Trigger, condition, action nodes; draft/test/publish/version/disable; execution trace; retry and manual replay; dry-run preview.
- Triggers include lead created, email received/classified, score changed, stage changed, task overdue and schedule.
- Actions include assign, task, draft, request approval, send approved message, update CRM and notify.

## 3. Primary data entities
- `workflows`
- `workflow_versions`
- `workflow_triggers`
- `workflow_executions`
- `workflow_steps`
- `workflow_events`

## 4. API surface (illustrative; finalize in OpenAPI)
- `POST /api/v1/workflows`
- `POST /api/v1/workflows/{id}/publish`
- `GET /api/v1/workflow-executions/{id}`
- `POST /api/v1/workflow-executions/{id}/retry`

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
- Published versions immutable; graph schema validated; no cycles or bounded loop; max depth/time; idempotency per execution-step; side-effect policy check.

## 7. Acceptance criteria
Workflow replay does not duplicate side effects; failures are visible and resumable; version used is recorded.

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

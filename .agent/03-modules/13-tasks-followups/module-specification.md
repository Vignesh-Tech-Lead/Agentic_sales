# Module Specification — Tasks and Follow-up Automation

## 1. Purpose
Ensure timely, preference-aware sales actions.

## 2. Functional scope
- Task types, owner, due date, reminders, recurring follow-up policy, overdue views, outcomes and next-action suggestions.
- Before sending/contacting, re-check contact preference, suppression, quiet hours, existing tasks and latest customer response.
- Task completion records outcome and optionally schedules next action.

## 3. Primary data entities
- `tasks`
- `task_comments`
- `task_reminders`
- `contact_preferences`
- `activity_logs`

## 4. API surface (illustrative; finalize in OpenAPI)
- `GET/POST /api/v1/tasks`
- `POST /api/v1/tasks/{id}/complete`
- `POST /api/v1/leads/{id}/schedule-followup`

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
- No duplicate active task unless override; timezone-aware scheduling; no contact after opt-out; revalidate before execution; owner in tenant.

## 7. Acceptance criteria
Tasks are not duplicated on event retry; overdue and completion reports match task states.

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

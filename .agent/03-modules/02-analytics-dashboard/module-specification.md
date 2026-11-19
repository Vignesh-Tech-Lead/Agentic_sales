# Module Specification — Analytics Dashboard

## 1. Purpose
Provide role-filtered operational and executive visibility.

## 2. Functional scope
- Executive, sales, marketing and AI operations dashboards; date filters; source/service/team breakdowns; drill-down to authorized records.
- Metrics: lead volume, qualification, response time, email outcomes, meetings, proposals, won/lost, pipeline, revenue, overdue tasks, agent failures, campaign health.
- Separate actual revenue, unweighted pipeline and weighted forecast; configurable timezone and period definitions.

## 3. Primary data entities
- `report_definitions`
- `report_schedules`
- `generated_reports`
- `forecast_snapshots`
- `metric_snapshots`

## 4. API surface (illustrative; finalize in OpenAPI)
- `GET /api/v1/reports/dashboard`
- `GET /api/v1/analytics/funnel`
- `GET /api/v1/analytics/campaigns`

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
- Validate date range and timezone; enforce user/team scope; exclude test/deleted records per policy; avoid double-counting opportunities; cached data must be invalidated/versioned.

## 7. Acceptance criteria
Dashboard aggregates reconcile to canonical transactional queries for an agreed test period.

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

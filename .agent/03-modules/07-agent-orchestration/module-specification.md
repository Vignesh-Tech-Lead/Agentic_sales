# Module Specification — Agent Orchestration Engine

## 1. Purpose
Coordinate specialized AI agents with bounded tools and explicit policy.

## 2. Functional scope
- Central orchestrator dispatches Lead Intelligence, Knowledge, Email, Qualification, Funnel, Follow-up, Proposal and Reporting agents.
- Each execution records agent/model/prompt version, task, tenant, input references, permitted tools, budget, timeout, evidence, output and approval state.
- Use structured outputs and finite state machines; optional LangGraph for stateful branching.

## 3. Primary data entities
- `agent_definitions`
- `agent_versions`
- `agent_executions`
- `agent_tool_calls`
- `agent_approvals`
- `agent_policies`

## 4. API surface (illustrative; finalize in OpenAPI)
- `POST /api/v1/agents/{id}/execute`
- `GET /api/v1/agent-executions/{id}`
- `POST /api/v1/agent-executions/{id}/cancel`

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
- Tool allowlist; tenant and actor re-check; execution timeout/token/cost budget; output schema; no arbitrary SQL/shell; approval required for high-risk side effects; idempotent actions.

## 7. Acceptance criteria
Agent cannot exceed its granted tools; execution is traceable; malformed/unsupported output is rejected or safely retried.

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

# Module Specification — Unified Customer Inbox

## 1. Purpose
Present inbound/outbound conversations with CRM context and AI assistance.

## 2. Functional scope
- Inbox folders, thread view, assignment, internal notes, attachments, AI summary/intent, suggested response, task creation and archive.
- Thread matching uses provider thread ID, Message-ID/In-Reply-To/References and contact match; uncertain matches are reviewable.
- Preserve source message metadata and sanitized body.

## 3. Primary data entities
- `email_threads`
- `email_messages`
- `email_attachments`
- `thread_assignments`
- `internal_notes`

## 4. API surface (illustrative; finalize in OpenAPI)
- `GET /api/v1/inbox`
- `GET /api/v1/inbox/threads/{id}`
- `POST /api/v1/inbox/threads/{id}/assign`
- `POST /api/v1/inbox/messages/{id}/draft-reply`

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
- Tenant ACL; HTML sanitization; attachment malware scan; thread association confidence; no automated reply until policy/approval allows; protect sensitive content.

## 7. Acceptance criteria
Conversation history is deduplicated, permission-scoped and correctly linked or marked for manual association.

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

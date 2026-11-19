# Module Specification — IMAP/SMTP Email Integration

## 1. Purpose
Connect organization-controlled mailboxes for incoming engagement and outbound communication.

## 2. Functional scope
- Account setup/test, IMAP folders, UID checkpoints, SMTP configuration, OAuth where supported, encrypted credentials, sync health and retry controls.
- IMAP incremental sync uses UIDVALIDITY + UID; persist message-id, references, provider thread IDs and dedupe identity.
- SMTP acceptance is distinct from delivered/opened; bounce/complaint/unsubscribe events stored separately.

## 3. Primary data entities
- `email_accounts`
- `email_credentials`
- `email_sync_states`
- `email_threads`
- `email_messages`
- `email_attachments`
- `email_events`
- `email_suppressions`

## 4. API surface (illustrative; finalize in OpenAPI)
- `POST /api/v1/email-accounts`
- `POST /api/v1/email-accounts/{id}/test`
- `POST /api/v1/email-accounts/{id}/sync`
- `GET /api/v1/email/threads`

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
- TLS; encrypted secrets/OAuth; folder checkpoint; dedupe; message size and attachment scanning; sender/recipient parsing; suppression check; no secrets in logs; provider timeout.

## 7. Acceptance criteria
Re-syncing same mailbox does not duplicate messages; invalid credentials are surfaced safely; no outbound send bypasses suppression.

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

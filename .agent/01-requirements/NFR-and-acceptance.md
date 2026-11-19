# Non-Functional Requirements and Acceptance Criteria

## Performance targets (initial, subject to load test)
| Area | Target |
|---|---|
| Standard CRM API | P95 < 500 ms under agreed baseline load |
| Dashboard | P95 < 2 seconds for cached standard views |
| Public lead capture | acknowledge < 1 second; processing async |
| Agent/document/email tasks | asynchronous; user sees status |
| Availability | 99.9% monthly target after production hardening |
| Recovery | RPO/RTO defined and approved before launch |
| Security | no unresolved critical/high findings at release |

## Reliability
- All externally visible side effects use idempotency keys or stable provider identifiers.
- Use transactional outbox for events emitted from database transactions.
- Retry transient failures with exponential backoff and jitter.
- Permanent failures go to failed-task queue with operator visibility.
- Never retry a send blindly if provider acceptance is ambiguous; reconcile using provider message ID or operator review.

## Security acceptance
- Cross-tenant access tests pass for API, background jobs, vector search and exports.
- Secrets are stored in secret manager or encrypted using managed keys.
- Email HTML is sanitized; attachments are scanned.
- All public endpoints are rate limited and abuse monitored.
- Prompt injection in email/document content cannot expand tool permissions.
- Approval is bound to exact action payload/version.

## AI acceptance
- Use an organization-approved gold dataset.
- Evaluate retrieval precision/recall, answer groundedness, abstention, classification precision/recall, score calibration and tool policy adherence.
- Every material generated business claim includes evidence reference or is clearly marked as an inference.
- No hidden chain-of-thought persistence; save concise decision summary and evidence only.

## Business acceptance
- Lead source and attribution are preserved.
- Customer preference and suppression apply across campaigns and one-to-one automated sends.
- Funnel transitions are validated server-side.
- Reports reconcile with source records and use configured timezone.
- Human approval and rejection are auditable.

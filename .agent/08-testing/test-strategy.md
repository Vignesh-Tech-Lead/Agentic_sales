# Test Strategy

## Test pyramid
- Unit: validators, scoring, transition rules, repository scoping, policy functions.
- Integration: Flask routes, SQLAlchemy, PostgreSQL, Redis/Celery, IMAP/SMTP sandbox, object storage and model adapter mocks.
- Contract: OpenAPI request/response, webhook signatures and provider adapter schemas.
- System: full lead-to-conversion and email-to-funnel workflows.
- Security: tenant escape, IDOR, injection, SSRF, XSS, CSRF, secret exposure, upload abuse, prompt injection.
- Performance: API load, queue throughput, vector retrieval, report aggregation and campaign pacing.
- AI evaluation: retrieval, groundedness, classification, score calibration, abstention and tool safety.
- UAT: sales, marketing, admin, knowledge manager and auditor.

## Mandatory negative tests
1. User A cannot access tenant B lead by guessed UUID.
2. Worker task with altered tenant ID cannot access another tenant.
3. RAG cannot return restricted document chunk.
4. Email content instructing agent to reveal secrets does not alter tool policy.
5. Unsubscribed recipient cannot be sent campaign or automated email.
6. SMTP timeout after provider acceptance does not trigger duplicate send without reconciliation.
7. Workflow replay does not duplicate task/email/proposal.
8. Proposal edited after approval cannot be sent as approved.
9. Missing willingness evidence does not produce false certainty.
10. Report AI narrative cannot change source metrics.

## Test data
Use synthetic or approved de-identified data in non-production. Never copy production mailbox credentials or sensitive documents into test environments.

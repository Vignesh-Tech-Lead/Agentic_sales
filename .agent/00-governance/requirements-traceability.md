# Requirements Traceability Matrix (starter)

| ID | Requirement | Module | Data entities | API/workflow | Acceptance |
|---|---|---|---|---|---|
| AUTH-001 | Secure login and MFA policy | Identity | users, roles, sessions | /auth | disabled user blocked; audit created |
| TEN-001 | Tenant isolation | Platform | all tenant-owned tables | request context/RLS | cross-tenant access denied |
| DASH-001 | Role-filtered analytics | Dashboard | report snapshots | /reports/dashboard | reconciles to source queries |
| LEAD-001 | Manual lead creation | Lead CRM | leads, contacts, companies | POST /leads | valid lead created once |
| LEAD-002 | Website form capture | Forms | forms, submissions, leads | public submit API | rate limited/idempotent |
| KB-001 | Upload internal documents | Knowledge | documents, versions | POST /documents | malware/type checks |
| KB-002 | ACL-aware retrieval | RAG | chunks, embeddings, permissions | /knowledge/search | unauthorized chunks never returned |
| MAIL-001 | IMAP synchronization | Email | accounts, sync states, messages | Celery task | UID checkpoint prevents duplicates |
| MAIL-002 | SMTP sending | Email | outbox, messages, events | send worker | suppression and approval enforced |
| MKT-001 | Campaign management | Campaigns | campaigns, recipients, events | campaign workflow | audience snapshot and suppression |
| INT-001 | Intent classification | AI | agent executions, email events | agent worker | structured output and evidence |
| WILL-001 | Willingness score | Scoring | models, scores, answers | scoring service | versioned explainable score |
| FUN-001 | Pipeline stage rules | Funnel | pipelines, stages, transitions | transition service | invalid transition rejected |
| WF-001 | Visual workflow execution | Automation | workflows, executions, steps | workflow worker | immutable version and idempotency |
| PROP-001 | Proposal drafting/approval | Proposal | proposals, approvals | proposal workflow | no unapproved send |
| REP-001 | Daily/weekly/monthly reports | Reporting | definitions, snapshots | scheduled jobs | time boundaries and totals verified |
| SEC-001 | Audit sensitive actions | Security | audit_logs | domain events | actor/action/entity captured |
| AI-001 | Agent tool permissions | ADLC | agent tools/approvals | tool gateway | disallowed tool blocked |

Add a row for every detailed requirement before development. Each row must link to implementation PR, migration, test case and UAT evidence.

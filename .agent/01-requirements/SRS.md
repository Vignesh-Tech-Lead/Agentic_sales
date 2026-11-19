# Software Requirements Specification (SRS)

## 1. System context
The platform is an internal sales operating system. It receives leads from user-entered data and owned forms; stores customer records and first-party communications; retrieves approved company knowledge; recommends and executes controlled sales workflows; and reports performance.

## 2. User classes
- Super Admin: platform configuration and tenant administration.
- Organization Admin: organization settings, users, integrations and policies.
- Sales Manager: team, pipeline, forecasts and approvals.
- Sales Executive: assigned leads, inbox, tasks and opportunities.
- Marketing Manager: campaign audiences, templates, approvals and analytics.
- Marketing Executive: drafts, segments and campaign operations within permissions.
- Knowledge Manager: document upload, classification, versioning and ACL.
- Analyst/Auditor: read-only reporting and audit access.
- Service identity: narrowly scoped worker/agent permissions.

## 3. Functional requirements
### Platform
- FR-PLAT-001: Authenticate users and enforce role/resource permissions.
- FR-PLAT-002: Isolate all tenant-owned records.
- FR-PLAT-003: Record audit events for sensitive actions.
- FR-PLAT-004: Support configurable company timezone, currency and locale.

### CRM
- FR-CRM-001: Create, view, update, assign and archive leads.
- FR-CRM-002: Maintain companies and contacts independently.
- FR-CRM-003: Record activities and communication history.
- FR-CRM-004: Detect likely duplicates without silent ambiguous merges.
- FR-CRM-005: Support authorized CSV/XLSX import with validation report.

### Lead capture
- FR-FORM-001: Admin can configure and publish lead forms.
- FR-FORM-002: Public form submissions pass bot, rate, schema and consent checks.
- FR-FORM-003: Submission endpoint supports idempotency.
- FR-FORM-004: Form submission creates lead and source attribution.

### Knowledge
- FR-KB-001: Upload approved document formats to private storage.
- FR-KB-002: Scan, extract, chunk, embed and index documents asynchronously.
- FR-KB-003: Maintain versions and processing status.
- FR-KB-004: Retrieval enforces tenant and document ACL.
- FR-KB-005: AI answers cite internal source document and page/section where available.
- FR-KB-006: AI abstains when evidence is inadequate.

### Email
- FR-MAIL-001: Configure IMAP/SMTP or supported OAuth integration.
- FR-MAIL-002: Synchronize messages incrementally and idempotently.
- FR-MAIL-003: Associate messages with contacts/threads with confidence and review path.
- FR-MAIL-004: Generate drafts using authorized internal knowledge.
- FR-MAIL-005: Enforce consent, suppression, rate limits and approvals before send.
- FR-MAIL-006: Record SMTP acceptance separately from delivery/bounce evidence.

### Sales intelligence
- FR-SALES-001: Maintain configurable pipelines and stages.
- FR-SALES-002: Enforce stage transition rules.
- FR-SALES-003: Maintain versioned willingness score with evidence.
- FR-SALES-004: Create and manage follow-up tasks.
- FR-SALES-005: Draft proposals using approved scope/pricing sources.

### Automation
- FR-AUTO-001: Configure event/condition/action workflows.
- FR-AUTO-002: Published workflow versions are immutable.
- FR-AUTO-003: Each step has status, input/output reference, retry count and error.
- FR-AUTO-004: Prevent loops, duplicate actions and unauthorized tool execution.

### Reporting
- FR-REP-001: Generate daily, weekly and monthly reports.
- FR-REP-002: Respect timezone and report-period boundaries.
- FR-REP-003: Separate actual, weighted pipeline and unweighted pipeline.
- FR-REP-004: Narrative claims must reconcile to metric queries.

## 4. Non-functional requirements
- Security: least privilege, encryption, secrets management, audit.
- Reliability: retries, idempotency, outbox, health checks.
- Performance: baseline targets in NFR document; load test required.
- Scalability: horizontally scalable Flask API and Celery workers.
- Maintainability: modular package structure, typed schemas, migration discipline.
- Observability: structured logs, metrics, traces and correlation IDs.
- Privacy: retention, access, export/deletion and consent controls.
- AI quality: groundedness, evaluation, abstention and model versioning.
- Accessibility: keyboard support, semantic labels and responsive UI.

## 5. External interfaces
- IMAP/SMTP or approved provider APIs.
- Object storage (S3-compatible).
- AI model and embedding provider.
- Calendar provider (optional release).
- WhatsApp Business API (future approved integration).
- Monitoring/alerting platform.

## 6. Constraints
- No public-data enrichment.
- Company knowledge is the primary source for business facts.
- No AI direct DB access; all reads/writes through scoped tools/services.
- No autonomous price, discount, legal or contractual commitment.
- Marketing send policy must be configurable and legally reviewed.

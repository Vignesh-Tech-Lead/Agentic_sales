# Deployment and Security Architecture

## Deployment topology
- TLS reverse proxy/load balancer.
- Multiple stateless Flask/Gunicorn replicas.
- Separate Celery worker pools by queue.
- PostgreSQL managed or hardened cluster.
- Redis managed or secured.
- Private object storage.
- Secret manager/KMS.
- Centralized logs, metrics and traces.
- Private network for database, Redis, workers and AI internal endpoints.

## Queue pools
`lead-processing`, `knowledge-processing`, `email-inbound`, `email-outbound`, `ai-orchestration`, `workflow-engine`, `campaigns`, `reporting`, `notifications`.

## Security controls
- TLS in transit; encryption at rest.
- RBAC plus resource-level authorization.
- Tenant isolation in app and DB.
- MFA for privileged users.
- Password hashing using Argon2id/bcrypt via vetted library.
- OAuth tokens/secrets encrypted with envelope encryption and KMS-managed keys.
- Key rotation and access logging.
- Upload malware scan, MIME sniffing and file size limits.
- HTML sanitization and attachment controls.
- SSRF protection for any document conversion or callback fetch; ideally no arbitrary URL fetch.
- CSRF protection for cookie-authenticated browser sessions.
- CORS allowlist.
- CSP and secure headers.
- Rate limiting and abuse detection.
- Dependency and container scanning.
- Backup encryption and restore drills.

## AI-specific controls
- Emails/documents are untrusted data, not instructions.
- System policy and tool allowlist are not modifiable by retrieved content.
- Tools validate tenant, actor, permission and payload on every call.
- Model output is schema-validated.
- Approval record binds action type, exact recipient, subject/body hash, attachments and policy version.
- Tool calls and outcomes are audited.
- No arbitrary SQL, shell, filesystem or unrestricted network tools.

## Privacy and communication
Store source, timestamp, collection method, purpose, lawful basis/consent state, preference, opt-out timestamp and evidence where applicable. Legal counsel must approve jurisdiction-specific communication and retention rules before launch.

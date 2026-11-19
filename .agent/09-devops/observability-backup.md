# Observability, Backup and Recovery

## Observability
Structured logs include timestamp, service, environment, request_id, trace_id, tenant_id (where safe), actor/service ID, job ID, module, operation, duration and result code. Avoid logging message bodies, credentials, tokens, prompts containing sensitive data or full documents.

Metrics:
- API request rate, latency and error rate.
- DB pool, query latency and locks.
- Redis queue depth and age.
- Celery task success/failure/retry/latency.
- IMAP sync lag and error.
- SMTP acceptance, bounce and complaint rates.
- Document indexing throughput/failures.
- RAG latency and retrieval quality.
- Agent token/cost/latency and policy denials.
- Workflow stuck/failed executions.
- Report generation and delivery.

## Alerts
Alert on queue backlog, repeated provider authentication failure, high bounce/complaint rate, unexpected send volume, cross-tenant authorization anomalies, failed backups, DB capacity, agent tool-policy violation and elevated AI cost.

## Backup
- Encrypted automated database backups.
- Point-in-time recovery where available.
- Versioned object storage backup/replication.
- Backup access separated from production admin.
- Documented RPO/RTO.
- Scheduled restoration drills.
- Verify database and object references are consistent.
- Include encryption keys and key recovery procedures in disaster recovery plan without storing keys beside backups.

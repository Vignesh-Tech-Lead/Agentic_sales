# Low-Level Design — Flask Backend

## 1. Proposed repository layout
```text
backend/
  app/
    __init__.py                 # create_app()
    config/
    extensions.py               # db, migrate, celery, limiter
    common/
      auth/ tenant/ errors/ pagination/ audit/ events/
    modules/
      identity/
      crm/
      lead_capture/
      knowledge/
      email/
      campaigns/
      sales_pipeline/
      willingness/
      tasks/
      workflow/
      proposals/
      meetings/
      referrals/
      reporting/
      integrations/
    api/
      v1/
        blueprints.py
    workers/
      document_tasks.py
      imap_tasks.py
      smtp_tasks.py
      ai_tasks.py
      workflow_tasks.py
      report_tasks.py
    ai/
      orchestrator/
      agents/
      retrieval/
      tools/
      policies/
      evaluations/
    models/
    repositories/
    services/
    schemas/
    events/
    utils/
  migrations/
  tests/
  scripts/
  wsgi.py
  celery_app.py
  pyproject.toml
  Dockerfile
```

## 2. Request lifecycle
1. Reverse proxy validates TLS and request size.
2. Flask request ID middleware creates correlation ID.
3. Authentication identifies principal.
4. Tenant resolver loads tenant context from trusted identity, not user-supplied arbitrary tenant ID.
5. Authorization checks permission and resource scope.
6. Schema validates body, query and path.
7. Service executes domain operation.
8. Repository performs scoped persistence.
9. Audit/event/outbox records are written transactionally.
10. Response schema serializes safe fields.

## 3. Flask factory
`create_app(config_name)` loads configuration, initializes extensions, registers blueprints, error handlers, middleware and health endpoints. Never create global mutable tenant/session state.

## 4. SQLAlchemy patterns
- Use explicit session scope per request/task.
- Use SQLAlchemy 2.x typed declarative models.
- Add `tenant_id` to tenant-owned tables.
- Apply tenant filter in repository layer and database RLS where practical.
- Use composite foreign keys to prevent cross-tenant references.
- Use transactions for multi-record operations.
- Do not return ORM objects directly; serialize via response schemas.

## 5. Worker patterns
Each task accepts IDs/references, not unbounded PII payloads. Worker re-loads records under service identity and tenant scope, re-checks status/permission, claims a lock, performs operation and persists outcome. Use idempotency keys for provider side effects.

## 6. Error handling
Standard error shape:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid",
    "fields": {"email": ["Invalid email address"]}
  },
  "meta": {"request_id": "uuid"}
}
```
Do not return stack traces, SQL, provider credentials or prompt contents.

## 7. Configuration
Use environment/secret manager for DB URL, Redis URL, encryption key references, AI credentials, email credentials and signing keys. Separate configuration by environment. Never commit `.env`.

## 8. Flask operational endpoints
- `/health/live`: process is alive.
- `/health/ready`: dependencies ready.
- `/metrics`: protected metrics endpoint.
- `/api/v1/...`: versioned application APIs.
- `/internal/...`: private service-to-service endpoints; network and service auth required.

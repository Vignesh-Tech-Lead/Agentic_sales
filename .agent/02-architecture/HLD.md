# High-Level Design (HLD)

## 1. Logical components
1. Web frontend: React/Next.js.
2. Flask API: authentication, CRM, configuration, APIs and orchestration requests.
3. Domain services: lead, account, funnel, campaign, task, reporting and approvals.
4. Worker tier: Celery workers for email, documents, AI, workflows and reports.
5. AI orchestration: Python module/service with agent graph, retrieval and tool gateway.
6. PostgreSQL: transactional system of record.
7. pgvector: embeddings and retrieval index.
8. Redis: broker/cache/locks (not source of truth).
9. Private object storage: originals, attachments, proposals and reports.
10. External adapters: IMAP/SMTP, model provider, calendar and WhatsApp Business.

## 2. Flask application structure
Use application factory and blueprints:
- `auth`
- `tenants`
- `users`
- `crm`
- `forms`
- `knowledge`
- `email`
- `campaigns`
- `sales`
- `automation`
- `proposals`
- `reports`
- `admin`
- `webhooks`

Keep route handlers thin. Validate input at boundary; call application service; use repository/SQLAlchemy; publish events through outbox.

## 3. Runtime flow
Synchronous request: reverse proxy → Flask WSGI server (Gunicorn) → auth/tenant context → schema validation → application service → PostgreSQL → response.
Asynchronous work: transactional outbox → dispatcher → Celery/Redis → worker → provider/AI/storage → result/event persisted → notification/UI polling or WebSocket/SSE.

## 4. Flask-specific implementation choices
- Flask 3.x (pin supported version).
- SQLAlchemy 2.x.
- Alembic or Flask-Migrate.
- Pydantic v2 or Marshmallow for request/response schemas.
- Flask-Limiter for rate limiting.
- Flask-JWT-Extended or secure session/OAuth implementation (choose one policy).
- Gunicorn for production WSGI.
- Celery for asynchronous tasks.
- Redis for broker and short-lived locks.
- pytest for tests.
- OpenAPI generated/maintained as contract.

## 5. Service boundaries
Do not call model provider, IMAP, SMTP, OCR, embeddings or large report jobs inside a request thread. Request handlers create jobs and return job/execution references. External adapters have timeouts, circuit breakers and bounded retries.

## 6. Data flow and trust boundaries
Public form traffic is untrusted. Email bodies and uploaded documents are untrusted content. Model output is untrusted until schema-validated. Only application tool gateway can perform side effects. Private knowledge retrieval applies ACL filters before context reaches the model.

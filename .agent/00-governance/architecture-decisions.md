# Architecture Decision Records

## ADR-001 — Python Flask backend
**Decision:** Use Flask for the application backend.  
**Rationale:** Python ecosystem alignment with AI/document processing, mature web framework, explicit modular design.  
**Consequences:** Team must enforce application factory, blueprints, service layer, schema validation, dependency injection conventions, migration discipline and async workers. Flask is synchronous by default; long tasks must run outside request workers.

## ADR-002 — Asynchronous execution
**Decision:** Celery + Redis for background jobs; PostgreSQL remains source of truth.  
**Rationale:** Document extraction, embedding, IMAP sync, campaign delivery, AI orchestration and reporting can exceed HTTP request lifetimes.  
**Controls:** retries with exponential backoff, idempotency, task timeouts, dead-letter/failure queue, task correlation IDs and transactional outbox.

## ADR-003 — Database
**Decision:** PostgreSQL with pgvector.  
**Rationale:** ACID transactions, relational integrity, JSONB metadata, full-text search and vector retrieval in one operational database.  
**Open item:** confirm embedding dimension and index type after model selection.

## ADR-004 — AI orchestration
**Decision:** Keep orchestration behind a dedicated internal interface/worker boundary. LangGraph may be used where multi-step stateful agent workflows justify it.  
**Rationale:** Separates model/tool execution from CRM request handling and allows provider/model replacement.  
**Controls:** allowlisted tools, strict schemas, budgets, timeouts, approvals and audit events.

## ADR-005 — Private knowledge only
**Decision:** The business knowledge source is the organization's approved document corpus and authorized first-party customer interactions. No public-data enrichment or public scraping.  
**Controls:** ACL-aware retrieval, source citations, tenant filtering, document lifecycle, prompt-injection defenses and abstention.

## ADR-006 — Human approval gates
**Decision:** Human approval required for external marketing sends at launch, pricing/discounts, proposals, contractual statements, bulk sends and sensitive customer actions.  
**Future:** Approval requirements may be relaxed only for explicitly authorized low-risk workflows with policy owner sign-off and monitoring.

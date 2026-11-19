# Workflow Catalog

All `.mmd` files in `diagrams/` are Mermaid source and should be treated as version-controlled engineering artifacts.

| Diagram | Purpose |
|---|---|
| system-context.mmd | Components and trust boundaries |
| lead-lifecycle.mmd | Enrollment to analysis |
| knowledge-ingestion.mmd | Document ingestion and indexing |
| rag-retrieval.mmd | ACL-aware internal knowledge retrieval |
| imap-processing.mmd | Incremental inbound email sync |
| smtp-campaign.mmd | Campaign eligibility, approval and delivery |
| willingness-scoring.mmd | Evidence-based willingness calculation |
| workflow-engine.mmd | Workflow state machine |
| proposal-approval.mmd | Proposal drafting and exact-version approval |
| report-generation.mmd | Daily/weekly/monthly report production |
| deployment-pipeline.mmd | CI/CD and rollback |
| tenant-isolation.mmd | Tenant security enforcement |

## Diagram change control
A diagram change that changes a state, event, permission or side effect must be reflected in the corresponding module specification, API contract, database migration and test case.

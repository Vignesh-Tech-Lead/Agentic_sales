# Change Management and Release Control

## Change request fields
- Change ID and requester.
- Business reason and priority.
- Affected modules and requirements.
- Database/API compatibility impact.
- Tenant/security/privacy impact.
- AI prompt/model/tool impact.
- Workflow and diagram impact.
- Test plan and rollback plan.
- Deployment window and approvers.

## Versioning
- API: semantic versioning and `/api/v1`.
- Database: Alembic migration sequence.
- Agents/prompts/tools: immutable version IDs and hashes.
- Workflows: immutable published versions.
- Documents: immutable document versions.
- Reports: metric query/version and period metadata.

## Release gate
No release without passing automated tests, migration checks, security scan, AI evaluation where relevant, UAT for material workflows, backup plan, monitoring and rollback readiness.

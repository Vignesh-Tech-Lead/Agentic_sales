# Project Charter

## 1. Product vision
Build an agentic sales automation platform that manages the lifecycle from lead intake through qualification, engagement, opportunity management, proposal, conversion and reporting. The system combines CRM, first-party email engagement, internal knowledge retrieval, workflow automation and controlled AI agents.

## 2. Business outcomes
- Centralize prospects, companies, contacts, conversations, activities and opportunities.
- Capture leads manually and through owned/public-facing company forms.
- Make company SOPs, service information and approved commercial documents searchable by AI.
- Assist sales and marketing with grounded email drafting and approved campaign execution.
- Measure customer willingness using explicit answers and observable first-party interaction evidence.
- Provide daily, weekly and monthly operational and management reports.
- Improve follow-up consistency and sales visibility without allowing uncontrolled autonomous commitments.

## 3. Product boundaries
### In scope
CRM, website form capture, private knowledge base, RAG, AI agents, IMAP/SMTP, campaign management, inbox, willingness scoring, sales pipeline, task automation, workflow builder, proposal drafting, reporting, RBAC, audit, calendar, meeting intelligence, referral tracking, multilingual content, WhatsApp Business API integration readiness, predictive analytics and revenue forecasting.

### Out of scope
Public-data enrichment, public web scraping, purchased third-party lead lists unless separately approved, autonomous contract execution, unapproved pricing/discount promises, bypassing unsubscribe/consent, arbitrary AI shell/database access.

## 4. Stakeholders
- Product owner/business owner: prioritizes requirements and approves policies.
- Sales manager: owns pipeline stages, qualification and sales processes.
- Marketing manager: owns campaign audience rules and communication policies.
- Knowledge manager: approves internal source documents and access scopes.
- System administrator: manages users, integrations and infrastructure.
- Security/privacy owner: approves retention, consent, access and incident controls.
- Engineering: implements services, APIs, data model and integrations.
- QA/UAT: validates acceptance criteria.

## 5. Key assumptions requiring confirmation
- Initial deployment is single organization, but schema is tenant-ready.
- PostgreSQL + pgvector is selected.
- Python Flask is the backend framework.
- React/Next.js is the frontend.
- Celery + Redis handles asynchronous jobs.
- AI provider/model is configurable and not hard-coded.
- Private object storage is used for source documents and generated files.
- Email accounts support IMAP/SMTP or provider-specific OAuth/API integration.
- Timezone, hosting region, data residency, expected user count and volume are TBD.

## 6. Success measures
Track lead capture reliability, duplicate rate, time-to-first-response, qualified-lead rate, stage conversion, proposal turnaround, follow-up completion, campaign bounce/complaint rates, AI groundedness, human edit/approval rate, workflow failure rate, report reconciliation and operational availability.

## 7. Governance
Every material scope change receives a change request with impact analysis for data model, APIs, security, AI behavior, tests, migration and cost. Published workflow and agent versions are immutable; changes create new versions.

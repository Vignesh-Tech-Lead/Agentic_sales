# Agentic Sales — UI / UX implementation

A React 18 + TypeScript + Vite + Tailwind CSS frontend implementing the **UI and UX for all 25 modules** described in `.agent/03-modules/`. It runs standalone with realistic, de-identified mock data; no backend or credentials are required for the preview.

## Run locally

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173  (binds 0.0.0.0 for live preview)
npm run build    # type-check + production build
```

Use `Ctrl/⌘ + K` to open the global module switcher. Navigation is a **top navbar** with grouped dropdown menus; there is no side navigation. The profile menu lets you preview role-based read-only behaviour (Analyst/Auditor).

## UI/UX rules applied
1. **One surface design** — every panel, card, list container and form uses the same `.card` border, radius and shadow. No competing box styles.
2. **No form popups** — all create/edit flows are dedicated routes (for example `/leads/new`, `/leads/LD-2401/edit`, `/funnel/new`, `/knowledge/new`, `/agents/new`). The modal component has been removed.
3. **One premium icon family** — Lucide icons only, with a consistent stroke weight. No emoji, glyph arrows, checkmarks or symbol shortcuts.
4. **Top navbar** — grouped horizontal navigation with mega-menu dropdowns and a compact mobile menu.

## Module coverage

| # | Module | Route | Experience |
|---|---|---|---|
| 1 | Identity & Access | `/identity` | Users, roles/permission matrix, service identities, session policy |
| 2 | Analytics Dashboard | `/dashboard` | KPI cards, lead/conversion trends, pipeline/campaign charts, AI operations |
| 3 | Lead Management | `/leads` | CRUD, duplicate/source/evidence fields, score, detail drawer |
| 4 | Website Lead Capture | `/forms` | Form builder list, publish states, consent and token controls |
| 5 | Company & Contact Mgmt | `/companies` | Accounts, contacts, consent/suppression, relationships |
| 6 | Knowledge Base | `/knowledge` | Ingestion pipeline, ACL-aware RAG search with citations, upload/re-index |
| 7 | Agent Orchestration | `/agents` | Agent cards, live execution console, tool registry, policies |
| 8 | Email Integration | `/email` | IMAP/SMTP accounts, sync health, encrypted secret references |
| 9 | Email Campaigns | `/campaigns` | Audience, A/B, approval, suppression and delivery metrics |
| 10 | Unified Inbox | `/inbox` | Three-pane conversation view, intent, grounded reply, policy panel |
| 11 | Willingness Scoring | `/willingness` | Versioned scores, dimension breakdown, evidence and overrides |
| 12 | Sales Funnel | `/funnel` | Drag-and-drop pipeline, guarded transitions, weighted forecast |
| 13 | Tasks & Follow-ups | `/tasks` | Owner/due/priority, preference checks, overdue views |
| 14 | Workflow Builder | `/workflows` | Visual node canvas, inspector, publish versioning, traces/replay |
| 15 | Proposals & Quotations | `/proposals` | Approved price sources, versioning, hash-bound approval states |
| 16 | Predictive Intelligence | `/predictive` | Propensity, fit, risk flags, model evaluation metadata |
| 17 | Revenue Forecasting | `/forecasting` | Actual vs weighted vs unweighted pipeline, scenarios |
| 18 | Lost Lead Recovery | `/recovery` | Eligibility, cooling-off, opt-out, attribution |
| 19 | Calendar & Meetings | `/calendar` | Week grid, scheduling, sync health, CRM linkage |
| 20 | WhatsApp Business | `/whatsapp` | Official API messages, templates, opt-in and delivery status |
| 21 | Meeting Intelligence | `/meeting-intel` | Source-linked summaries, actions, sentiment, review |
| 22 | Referral Management | `/referrals` | Referrer, consent, reward policy, attribution |
| 23 | Multilingual Communication | `/multilingual` | Translation drafts, glossary version, reviewer approval |
| 24 | Reporting Management | `/reports` | Daily/weekly/monthly reports, charts, reconciled narratives |
| 25 | Admin, Settings & Audit | `/admin` | Settings, flags, secret references, immutable audit, retention |

## Shared UX conventions (from the design package)

- Tenant-aware data everywhere; read-only role preview; audit metadata on mutations.
- Standard API response thinking surfaced in toasts and confirmations; async work shown as queued/job states.
- Idempotency, approval gates and suppression checks are visible in the relevant flows.
- AI suggestions are visually distinct from confirmed facts and always carry evidence/governance notes.
- Abstention for public-data questions in knowledge search; prompt injection and hidden-reasoning rules stated in-product.

## Structure

```
src/
  components/       # shell, design-system primitives, tables, generic CRUD page
  config/           # declarative configuration for the 15 standard modules
  lib/              # types, nav, seed data, formatting, app state (localStorage-backed)
  pages/            # 10 module-specific experiences
  App.tsx           # all 25 routes
```

## Supabase backend

The app now persists records in Supabase instead of browser storage:

- Project: `omivwezjvbmsgiacfxjg` (Tokyo region, PostgreSQL 17)
- Table: `public.workspace_records` — `{ id, tenant_id, module, data jsonb, created_at, updated_at }`
- Row Level Security is enabled with tenant-scoped policies on the demo tenant ID.
- On first load the demo dataset is seeded automatically; later loads read live rows.
- Create/update/delete operations call Supabase directly from `src/lib/store.tsx`.

Copy `.env.example` to `.env.local` for local development. The same two variables are configured on Vercel:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=<publishable key>
VITE_SUPABASE_TENANT_ID=<tenant uuid>
```

The publishable key is safe for a browser. The current RLS policies permit demo-tenant anon access so the preview works without Auth; before production, replace them with `auth.uid()`-based policies and add real sign-in.

## Vercel hosting

`vercel.json` rewrites all SPA routes to `index.html`. The Vercel project uses the `frontend` root directory, `npm run build`, and output directory `dist`.

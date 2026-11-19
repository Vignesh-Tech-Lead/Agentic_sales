# API Standards

## Base
`/api/v1`; JSON over HTTPS; UTF-8; ISO-8601 timestamps with timezone; UUID identifiers.

## Response envelope
Success:
```json
{"success":true,"data":{},"meta":{"request_id":"uuid"}}
```
Error:
```json
{"success":false,"error":{"code":"VALIDATION_ERROR","message":"Invalid request","fields":{"email":["Invalid"]}},"meta":{"request_id":"uuid"}}
```

## Required standards
- Authentication and permission checks on every private route.
- Tenant context resolved from authenticated principal.
- Pagination using cursor or bounded page size.
- Sort/filter allowlists; no raw SQL fragments from user.
- Idempotency-Key for create/send/execute operations.
- Optimistic concurrency (`version` or ETag) for sensitive edits.
- Rate limits on login, public forms, search and expensive operations.
- Request correlation ID.
- OpenAPI contract and backward compatibility policy.
- Do not expose internal IDs across tenants, secret values, stack traces or raw provider errors.

## API groups
- `/auth`, `/users`, `/roles`
- `/companies`, `/contacts`, `/leads`, `/lead-forms`
- `/knowledge-bases`, `/documents`, `/knowledge/search`
- `/email-accounts`, `/inbox`, `/campaigns`
- `/pipelines`, `/opportunities`, `/willingness`
- `/tasks`, `/workflows`, `/agent-executions`
- `/proposals`, `/meetings`, `/referrals`
- `/reports`, `/admin`, `/webhooks`

## Public form API
Public endpoint uses form-specific public token/slug, anti-bot and rate policy. It must not expose private CRM query endpoints. Return only submission receipt and generic confirmation.

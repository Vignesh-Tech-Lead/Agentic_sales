# Constraints, Indexes, Tenant Isolation and RLS

## Tenant-safe relational design
For each tenant-owned parent table, create a unique constraint on `(tenant_id, id)`. Child tables carry `tenant_id` and use composite FK `(tenant_id, parent_id)` → `(tenant_id, id)`. This prevents accidental cross-tenant relationships even if application code is defective.

## RLS baseline
Enable and FORCE ROW LEVEL SECURITY on selected tenant-owned tables. Set tenant context inside a transaction using a trusted server-side value, for example `SET LOCAL app.tenant_id = '<uuid>'`. Policies compare `tenant_id` to `current_setting('app.tenant_id', true)::uuid`. Missing context must deny access. Do not accept tenant ID directly from an untrusted request body as authority.

## Index strategy
- B-tree: tenant_id/status, tenant_id/created_at, foreign keys, owner/status, due_at/status.
- Unique: normalized identifiers and provider idempotency identities.
- GIN: JSONB fields only where query patterns justify them.
- Full text: tsvector for internal search where ACL can be applied.
- Vector: pgvector index selected after benchmark; apply ACL filters before returning results.
- Partial indexes: active records and pending queue state.

## State and check constraints
Use lookup tables or CHECK constraints for finite states. Avoid unconstrained free-form status strings. Use check constraints for score/probability range, nonnegative amounts, positive version/index and valid date ranges.

## Deletion
Soft delete is not equivalent to data erasure. Define a retention process that removes or anonymizes data where legally required, including embeddings, derived summaries, object storage versions, caches and search indexes. Audit records may have a separate retention basis.

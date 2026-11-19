# Operations Runbooks and Retention

## Runbook: IMAP sync failure
1. Check mailbox connection health and provider status.
2. Inspect safe error code and last successful UID checkpoint.
3. Confirm UIDVALIDITY; if changed, perform controlled folder rescan with dedupe.
4. Retry transient errors with bounded backoff.
5. Escalate auth failure to mailbox administrator.
6. Never reset checkpoint without documented reason.

## Runbook: SMTP ambiguous send
1. Mark message `delivery_unknown`, not failed.
2. Check provider response/message ID and provider event feed.
3. Reconcile status.
4. Retry only when evidence shows it was not accepted or a human approves safe resend.
5. Record resolution.

## Runbook: document indexing failure
1. Check file safety result and extraction error.
2. Confirm parser supports file format.
3. Retry idempotently if transient.
4. Reprocess into a new index generation.
5. Do not expose partial/failed chunks as indexed.
6. Escalate unsupported or corrupted document.

## Runbook: AI policy violation
1. Disable affected agent/tool/workflow using feature flag.
2. Preserve execution and audit references.
3. Determine tenant/data/action scope.
4. Revoke compromised credentials if needed.
5. Assess whether external communication occurred.
6. Notify incident owner and follow incident response/legal process.
7. Add regression test before re-enable.

## Retention policy matrix (values TBD by owner/legal review)
Define retention periods for raw email, attachments, documents, embeddings, agent logs, reports, audit logs, consent evidence and backups. Deletion must propagate to derived artifacts, vector indexes, caches and object versions. Legal hold and statutory requirements override routine purge.

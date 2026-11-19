# AI Evaluation, Safety and Monitoring

## Evaluation sets
- SOP question-answering with expected citations.
- Service fit and lead qualification.
- Inbound email intent and objection classification.
- Positive/negative/neutral reply classification.
- Willingness score cases including missing data.
- Funnel recommendation cases.
- Proposal completeness and price grounding.
- Report narrative numeric consistency.
- Prompt injection in email/document content.
- Cross-tenant retrieval denial.
- Unauthorized tool invocation.

## Metrics
- Retrieval Precision@K and Recall@K.
- Citation precision.
- Groundedness/unsupported claim rate.
- Correct abstention rate.
- Classification precision, recall, F1 and confusion matrix.
- Score calibration (Brier score/calibration curve where applicable).
- Human edit and approval rejection rate.
- Tool policy violation rate (target zero).
- Agent failure, timeout, latency and cost.

## Risk tiers
- Low: summarize authorized internal content; create internal draft.
- Medium: create task, classify lead, recommend stage.
- High: send external email, bulk campaign, modify customer-facing state, proposal or pricing.
- Critical: legal commitment, contract execution, payment, destructive data action. Not autonomous in initial release.

## Safety rules
1. No public-data access for enrichment.
2. No access outside tenant/resource ACL.
3. No autonomous legal/financial/commercial commitment.
4. No outbound message without consent/suppression check and required approval.
5. No model output is trusted without schema and policy validation.
6. No hidden chain-of-thought storage.
7. Unknown is not negative.
8. Customer preference overrides engagement score.
9. Human override requires reason and audit.
10. Incident can disable agent/tool/campaign immediately.

## Monitoring and rollback
Monitor task volume, errors, latency, cost, retrieval quality, unsupported claims, approval rejections, bounce/complaint rate and drift. Roll back model/prompt/tool configuration by version. Pause affected workflows if policy violation or provider anomaly occurs.

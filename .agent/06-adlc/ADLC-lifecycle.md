# AI Development Life Cycle (ADLC)

## 1. Lifecycle gates
1. Business problem and risk classification.
2. Data/knowledge inventory and permission review.
3. Use-case and agent boundary definition.
4. Model/provider selection and data handling review.
5. Retrieval, prompt and tool design.
6. Dataset preparation and evaluation design.
7. Offline evaluation and adversarial testing.
8. Human-in-the-loop pilot.
9. Controlled production rollout.
10. Continuous monitoring, incident review and re-evaluation.

## 2. Agent inventory
| Agent | Purpose | Allowed read scope | Allowed actions | Approval |
|---|---|---|---|---|
| Sales Orchestrator | Route tasks | task references and scoped context | invoke registered agents | policy-dependent |
| Knowledge Agent | Retrieve SOP/service facts | ACL-authorized knowledge | search only | none |
| Lead Intelligence | Analyze requirement fit | lead and approved KB | recommend classification | human review for disqualification |
| Email Intelligence | Classify incoming mail | assigned thread | classification, summary | none |
| Email Drafting | Draft replies/campaign copy | thread + authorized KB | create draft | send approval |
| Qualification | Score willingness | answers and first-party signals | create score proposal | override approval |
| Funnel Agent | Recommend next stage | lead/opportunity | propose transition | transition policy |
| Follow-up Agent | Plan next action | preference, activity, tasks | create task/draft | send policy |
| Proposal Agent | Draft proposal | approved service/pricing records | create draft | mandatory commercial approval |
| Reporting Agent | Explain metrics | authorized aggregates | create report narrative | report owner review for external distribution |

## 3. Agent execution contract
Input fields: execution_id, tenant_id, actor/service principal, task_type, entity references, allowed_tools, knowledge_scope, policy_version, model_config_version, deadline, max_tokens/cost budget.

Output fields: status, result_schema_version, decision, concise rationale, evidence_refs, proposed_actions, confidence/calibration metadata, risk_level, approval_required, errors.

Do not persist hidden chain-of-thought. Persist concise rationale, source evidence, tool calls, decision and outcome.

## 4. Agent state machine
queued → running → waiting_approval → completed | rejected | failed | cancelled | timed_out.
A retry creates an attempt record or increments a controlled attempt count; it does not erase previous attempts.

## 5. Model governance
- Register provider/model/version and data retention terms.
- Keep prompt, tool schema, retrieval settings and model config versioned.
- Test model changes against fixed evaluation set.
- Do not silently switch provider/model for sensitive tasks.
- Track token/cost/latency and failure rate.
- Maintain rollback to last approved version.

## 6. Human oversight
Approval required for outbound campaign send, bulk sends, proposals, price/discount/terms, legal statements, deletion/export of sensitive data and any new tool permission. Approval binds exact action payload hash and expires if payload changes.

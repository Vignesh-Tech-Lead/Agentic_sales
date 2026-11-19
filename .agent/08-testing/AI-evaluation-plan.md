# AI Evaluation Plan

## Evaluation dataset
Create a controlled dataset from approved internal documents and synthetic customer scenarios. Each case includes input, authorized context, expected classification/answer, supporting source references, expected abstention (if applicable), permitted tools and expected policy decision.

## Evaluation categories
- SOP and service knowledge retrieval.
- Pricing and scope grounding.
- Lead fit and qualification.
- Email intent, objection and sentiment.
- Willingness dimensions.
- Funnel recommendations.
- Proposal section completeness.
- Management report narrative.
- Prompt injection and data exfiltration.
- Tenant and ACL negative cases.

## Release gates
- Zero critical tool-policy bypass in adversarial suite.
- Zero cross-tenant retrieval in security suite.
- Citation correctness and groundedness meet thresholds approved by product/security owners.
- Classification performance meets per-class target, not only aggregate accuracy.
- Score calibration reviewed before score influences prioritization.
- Human approval rejection and edit rates reviewed.
- Model/prompt change must pass regression suite before rollout.

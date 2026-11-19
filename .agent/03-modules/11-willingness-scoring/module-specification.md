# Module Specification — Customer Willingness and Purchase Intent

## 1. Purpose
Estimate readiness from explicit questionnaire answers and supported first-party interaction signals.

## 2. Functional scope
- Configurable questionnaire, versioned dimensions/weights, response capture, evidence panel, score history, hot/warm/cold bands, override reason and recommended next action.
- Example dimensions: requirement fit, timeline, budget readiness, positive reply, consultation interest, decision-maker involvement, proposal request.
- Unknown evidence is distinct from negative evidence; opens alone are weak/unreliable signals.

## 3. Primary data entities
- `willingness_questionnaires`
- `questionnaire_responses`
- `scoring_models`
- `willingness_scores`
- `willingness_overrides`

## 4. API surface (illustrative; finalize in OpenAPI)
- `POST /api/v1/contacts/{id}/questionnaire-responses`
- `POST /api/v1/contacts/{id}/score`
- `GET /api/v1/contacts/{id}/score-history`

## 5. Backend workflow
1. Authenticate caller or verify public endpoint policy.
2. Resolve trusted tenant and actor/service identity.
3. Validate request schema and business invariants.
4. Authorize action against role, resource and policy.
5. Load required records using tenant-scoped repositories.
6. Execute domain service inside transaction where records change.
7. Write audit and outbox event atomically.
8. Enqueue asynchronous work where needed; return operation/job ID.
9. Worker revalidates status, permissions and idempotency before side effect.
10. Persist result, emit completion event and notify relevant user.

## 6. Validation and restrictions
- Score 0–100; weights total 100 or normalized; model version required; evidence references; missing values handled explicitly; manual override requires reason and actor.

## 7. Acceptance criteria
Same inputs/model version produce reproducible score; score explanation lists evidence and unknowns.

## 8. Failure handling
- Validation errors: return field-level 4xx; do not create partial records.
- Authorization errors: deny and audit security-relevant attempts.
- Transient provider/network errors: bounded retry with exponential backoff and jitter.
- Permanent errors: mark failed, retain safe error code, expose operator remediation.
- Ambiguous external side effect: reconcile provider status before retry to avoid duplicates.
- Every asynchronous job has correlation ID, tenant scope, attempt count and terminal state.

## 9. Security and privacy
- Apply least privilege and tenant scoping to every read/write.
- Treat user-supplied text, uploaded files and inbound email as untrusted.
- Do not log secrets or unnecessary personal data.
- Respect retention and communication preference policies.
- Record audit metadata without copying credentials or full sensitive message bodies.

## 10. UI screens
Provide list/detail/create/edit screens as appropriate, loading/empty/error states, permission-aware actions, validation messages, activity history and responsive layout. Destructive actions require confirmation. AI recommendations must be visually distinguished from confirmed facts and human-approved actions.

## 11. Dependencies
- Identity and tenant context.
- Audit/event/outbox infrastructure.
- PostgreSQL repositories.
- Celery worker framework for asynchronous work.
- Notification service where applicable.

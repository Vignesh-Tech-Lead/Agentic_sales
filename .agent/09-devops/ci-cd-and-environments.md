# DevOps, CI/CD and Environments

## Environments
- Local development: synthetic data, mock providers.
- Integration: shared test DB/Redis, provider sandbox.
- Staging: production-like topology, de-identified/synthetic data.
- Production: restricted network, managed secrets, monitored services.

## CI pipeline
1. Format/lint.
2. Static type checks.
3. Unit tests.
4. Migration up/down tests.
5. Dependency and secret scanning.
6. Container build and scan.
7. Integration tests.
8. AI evaluation suite.
9. Staging deployment.
10. UAT/security release gate.
11. Production approval and deploy.
12. Smoke test and monitor.

## Flask production
Run Flask behind Gunicorn and reverse proxy. Do not use Flask development server in production. Scale API and Celery worker pools independently. Configure worker concurrency based on CPU, memory, provider limits and task profile.

## Database migration
- One migration owner per release.
- Backward-compatible expand/migrate/contract for zero/minimal downtime.
- Backup before destructive migrations.
- Test migration against realistic volume.
- Do not manually alter production schema outside migration process.

## Configuration
Use environment variables for non-secret config and secret manager/KMS for secrets. Maintain separate keys and credentials per environment.

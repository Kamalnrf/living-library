# Partner inquiries Val

Private Val Town project backing the Partner With Us form and team dashboard.

- Val: `kamalnrf/partner-inquiries`
- Dashboard: `https://kamalnrf--71c0e50680fa11f193731607ee4eb77e.web.val.run/dashboard`
- Public endpoint: `POST /api/inquiries`

## Deployment

The website and Val deploy independently. From this directory, use `vt status`
to compare local source with Val Town and `vt push` to deploy Val changes. The
retry schedule is managed by the `retry.cron.ts` trigger in Val Town.

The project requires a high-entropy `OAUTH_STATE_ENCRYPTION_KEY` environment
variable. `DASHBOARD_ALLOWED_EMAILS` can optionally replace the default
comma-separated dashboard allowlist.

Scoped SQLite stores inquiries and the email outbox. Do not remove the retry
trigger without replacing its delivery-recovery behavior.

Email delivery is intentionally at-least-once. A process interruption after
Val Town accepts a message but before the outbox records that acceptance can
cause a retry and duplicate email. The built-in email API does not expose an
idempotency key, so exactly-once delivery cannot be guaranteed.

The origin allowlist is a browser integration control, not bot protection, and
the global submission quota is only a circuit breaker. Production submissions
must also use server-verified bot proof before launch.

# Troubleshooting

This document should become the fastest path from symptom to verified cause.

## First question: what is actually broken?

Classify the incident before changing anything.

### A. Entire application unavailable

Check, in order:

1. Can the client reach the host?
2. Is the application process healthy?
3. Is the reverse proxy/gateway healthy?
4. Is PostgreSQL reachable?
5. Did the latest deployment change runtime/configuration?

Do not start rotating platform credentials when the application itself is down.

### B. Application works but content/calendar data is missing

Treat as high priority.

1. Stop destructive changes.
2. Verify database connectivity.
3. Confirm the expected database/environment is loaded.
4. Inspect recent migrations/deployments.
5. Verify records directly through approved server-side tooling.
6. Restore only after identifying whether data is absent versus merely not rendered.

### C. One platform is stale or broken

Treat as an integration incident, not an application outage.

1. Check integration health/last successful sync.
2. Check authentication/expiry state.
3. Check upstream service status if applicable.
4. Check rate-limit or permission errors.
5. Preserve and display last known-good metrics.
6. Use the documented manual/import fallback if needed.

### D. One client looks broken

1. Compare another client/profile.
2. Check selected profile/override.
3. Check browser-specific state.
4. Verify server response before changing backend code.

### E. Wall display is broken but other clients work

Treat as a client/profile incident. Do not restart the production backend unless server health is actually failing.

## Diagnostic discipline

Before applying a fix, record:

- observed symptom
- first known occurrence
- affected clients/platforms
- deployed version
- recent changes
- relevant logs/error codes

Change one variable at a time when practical.

## After recovery

Document:

- root cause
- recovery steps
- downtime/user impact
- whether data was at risk
- prevention action
- SOP/runbook updates required

If the same incident can recur with no better diagnostic path, troubleshooting is incomplete.

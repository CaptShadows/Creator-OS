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

On the Windows production host, an administrator should run:

```powershell
.\deployment\windows\Manage-CreatorOS.ps1 -Action Status
.\deployment\windows\Manage-CreatorOS.ps1 -Action Health
.\deployment\windows\Manage-CreatorOS.ps1 -Action Logs
```

If the task is stopped, start it once. If it repeatedly stops, inspect logs rather than repeatedly clicking the desktop shortcut. Confirm the PostgreSQL Windows service is running. The desktop shortcut opens the browser only; it does not own or repair the background service.

### B. Application works but content/calendar data is missing

Treat as high priority.

1. Stop destructive changes.
2. Verify database connectivity.
3. Confirm the expected database/environment is loaded.
4. Inspect recent migrations/deployments.
5. Verify records directly through approved server-side tooling.
6. Restore only after identifying whether data is absent versus merely not rendered.

### Database health is unavailable

1. Call `/api/health` and distinguish `configuration_missing` from `connection_failed`.
2. For `configuration_missing`, verify the service environment contains `DATABASE_URL`; never paste it into browser tools or logs.
3. For `connection_failed`, run `npm run db:check` from the application host and verify PostgreSQL service/network access.
4. If connectivity works but the app fails, inspect migration state and the application logs before applying another migration.
5. Do not create a browser, SQLite, or alternate-database fallback. Restore PostgreSQL service or follow the documented restore procedure.

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
5. Reset the browser-only profile override by selecting `Auto`, or remove only the `creator-os-client-profile` localStorage key. Do not clear cookies unless authentication itself is the problem.

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
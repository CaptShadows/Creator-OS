# Deployment and Rollback

**Status: placeholder until hosting architecture is selected.**

Do not copy Netrunner OS deployment commands blindly. Creator OS may reuse proven patterns, but production host, service name, ports, DNS name, database location, and network policy must be explicitly selected and documented.

## Deployment requirements

Before Creator OS is considered production-ready, this document must specify:

- production host and OS
- Node/runtime version
- database host/version
- application service manager
- reverse proxy / LAN access model
- local hostname
- environment file location and permissions
- install/build/start commands
- health-check endpoint
- log location/commands
- database migration procedure
- backup prerequisite
- rollback procedure
- post-deploy acceptance checks

## Standard deployment template

1. Confirm current production version/commit.
2. Confirm recent backup when persistence changes are possible.
3. Fetch the approved code revision.
4. Install dependencies using the locked dependency set.
5. Run database migrations only after reviewing generated migration behavior.
6. Build the application.
7. Restart/reload the application service.
8. Run server health checks.
9. Verify Overview, Content Calendar, and database writes from a client.
10. Verify integrations independently; one failed integration should not invalidate core application health.
11. Record deployed version and result.

## Rollback requirements

Rollback must distinguish application rollback from database rollback.

Never automatically reverse database migrations simply because application code was rolled back. Destructive schema rollback requires a reviewed recovery plan.

A known-good application revision and compatible database state should be documented for each production deployment.

## Acceptance criteria

A deployment is not successful merely because the process is running. At minimum verify:

- authentication works
- existing content loads
- content can be created/edited
- calendar renders
- no unexpected migration/data loss occurred
- stale integrations are labeled rather than breaking the page
- target client profiles render acceptably

Exact commands will be added after infrastructure is selected.

# Creator OS Architecture

## Purpose

Creator OS is a local-first creator operations dashboard. The architecture should prioritize reliability, maintainability, recoverability, and a low-friction user experience over feature count.

## Architectural principles

1. **Creator data is authoritative locally.** Third-party platforms are external sources, not the application database.
2. **Integrations are adapters.** Platform-specific APIs and imports translate into internal contracts.
3. **Navigation does not define persistence.** Seven platform pages do not justify seven separate platform-specific content models.
4. **Historical metrics are snapshots.** Do not overwrite follower counts or publication metrics when history is useful.
5. **Secrets stay server-side.** Browsers never receive API credentials.
6. **Graceful degradation is mandatory.** A failed sync should not make the content calendar unusable.
7. **Client profiles are presentation concerns.** Mobile, tablet, desktop, and wall clients consume the same domain data.

## Logical layers

```text
UI / Routes
    |
Application services
    |
Creator domain
    |
Persistence + integration ports
    |                |
PostgreSQL        Platform adapters
                     |
          APIs / CSV / manual input
```

### UI / Routes

Owns navigation, responsive composition, forms, calendar views, platform views, and presentation state.

### Application services

Coordinates use cases such as creating content, scheduling a publication, importing metrics, updating campaign status, and producing overview summaries.

### Creator domain

Contains platform-independent concepts such as Content, Publication, PlatformAccount, Campaign, Product, and MetricSnapshot.

### Persistence

PostgreSQL is the planned authoritative datastore. Drizzle is the preferred TypeScript persistence layer based on the proven Netrunner OS approach, subject to implementation review.

### Integrations

Each external platform should have a narrow adapter. Adapters may use official APIs, approved exports, CSV imports, or manual entry. Adapter limitations must not leak into the core schema unnecessarily.

## Client profiles

- **Mobile:** quick capture, today's work, status checks.
- **Tablet:** operational content/calendar workflow.
- **Desktop:** full management and analytics experience.
- **Wall:** glanceable touch-first dashboard with large controls and reduced density.

Wall is not a separate backend or feature set.

## Failure boundaries

Integration failures should be isolated. Example: if Instagram metrics cannot refresh, Creator OS should show the last successful snapshot, mark it stale, expose the failed sync state, and continue serving content/calendar/campaign data normally.

## Initial non-goals

- Public SaaS hosting
- Multi-tenant creator accounts
- Automated posting to every platform
- Replacing third-party editing tools
- Making Viral Vue part of the tracked system
- Building AI features before reliable creator data exists

## Netrunner relationship

Netrunner OS is a reference implementation for infrastructure patterns, not a runtime dependency and not a domain template. Reuse proven ideas deliberately; do not inherit Netrunner-specific domains by default.

# Creator OS

Creator OS is a LAN-first creator command center for Tonya's content business. It uses the architectural lessons from Netrunner OS without copying Netrunner's personal domains or visual identity.

The goal is simple: make content operations easier to run, easier to understand, and easy to recover when something breaks.

## Product goals

Creator OS should help answer four questions quickly:

1. What needs to be posted next?
2. What content and campaigns need attention?
3. What is performing across platforms?
4. What should Tonya work on today?

Reliability and consistency are product requirements. If a feature cannot fail gracefully or creates repeated friction, it should not ship.

## Initial navigation

The current working navigation is ten primary pages:

- Overview
- Content Calendar
- Stats
- Instagram
- Facebook
- TikTok
- YouTube
- Amazon
- ShopMy
- Tribe

Navigation is not the domain model. Platform-specific pages are presentation surfaces over shared creator data.

## Tracked platforms

Creator OS currently plans to track:

- Instagram
- Facebook
- TikTok
- YouTube
- Amazon Influencer / Storefront
- ShopMy
- Tribe

TikTok may contain multiple accounts. TikTok Shop is treated as a TikTok commerce capability unless a future requirement justifies a separate top-level domain.

Viral Vue is intentionally out of scope.

## Core domains

Creator OS should be organized around reusable domain concepts rather than platform-specific tables:

- Content
- Publications / distribution
- Platform accounts
- Metric snapshots
- Campaigns
- Brands
- Products / affiliate items
- Creator settings
- Authentication / sessions / trusted devices
- Audit history

A single piece of content may publish to multiple platform accounts. Platform metrics should be stored as historical snapshots rather than overwriting one current value.

## Client profiles

Creator OS should preserve the responsive profile concept proven in Netrunner OS:

- Mobile
- Tablet
- Desktop
- Wall

The Wall profile is a first-class future target for a touch-enabled mounted display. It should emphasize glanceable information and large touch targets while using the same backend and data as other clients.

## Architecture direction

Current direction:

```text
Browser clients
Mobile · tablet · desktop · future wall display
                    |
                    v
              Creator OS
                    |
        -------------------------
        |           |           |
     Domain      Services    Adapters
        |           |           |
        -------- PostgreSQL -----
                    |
              External sources
```

External integrations must not own the core data model. Creator OS should be able to ingest data through official APIs, manual entry, CSV imports, or other approved adapters without changing the creator domain model.

## Reliability principles

- Preserve user-created content even when integrations fail.
- Never make a third-party API a single point of failure for the application.
- Prefer explicit sync state over silent failures.
- Keep server-side secrets out of browser code and Git.
- Back up authoritative local data.
- Document every production dependency and recovery step.
- Provide rollback procedures before risky upgrades.
- Degrade gracefully: stale metrics are preferable to a broken dashboard.
- Keep the UX predictable. Avoid surprising automation.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Data model](docs/DATA_MODEL.md)
- [UX principles](docs/UX_PRINCIPLES.md)
- [Platform integrations](docs/PLATFORM_INTEGRATIONS.md)
- [SOP index](docs/SOPS.md)
- [Deployment and rollback](docs/DEPLOYMENT.md)
- [Backup and recovery](docs/BACKUP_RECOVERY.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Roadmap](docs/ROADMAP.md)

## Development status

**Status: design / foundation**

No production implementation decisions should be considered permanent until the creator-specific data model and workflows are validated against Tonya's actual day-to-day usage.

## Security

This repository must never contain credentials, access tokens, session cookies, API secrets, private keys, production database dumps, or exported private platform data.

Use environment variables and ignored local configuration for secrets. If the repository remains public, documentation must assume that every committed line is internet-visible.

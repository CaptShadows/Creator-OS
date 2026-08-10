# Backup and Recovery

**Status: policy foundation; exact commands pending infrastructure selection.**

## Recovery objective

User-created creator data is more important than replaceable analytics snapshots. Recovery design should prioritize content, scripts, campaign records, calendar state, settings, and authentication ownership data.

## Data classes

### Critical

- Content records
- Scripts/captions/notes
- Publications and scheduling state
- Campaigns and deliverables
- Products/affiliate mappings created manually
- User/settings data

### Reconstructable but valuable

- Platform account metric snapshots
- Publication metric snapshots
- Sync history

### Replaceable

- Build artifacts
- dependency directories
- caches
- temporary imports

## Backup requirements

Production must eventually have:

- automated PostgreSQL backups
- documented retention
- off-host copy
- encrypted handling where backups contain private data
- periodic restore testing
- separate secure handling for environment secrets

A backup that has never been restored is not considered verified.

## Recovery order

1. Stabilize the host/environment.
2. Protect the latest available database backup.
3. Restore PostgreSQL to a known-good state.
4. Restore application configuration/secrets through the approved secret process.
5. Deploy a compatible known-good application revision.
6. Verify authentication and critical creator data.
7. Reconnect/refresh integrations after core data is confirmed healthy.

## RPO / RTO

Formal recovery point and recovery time objectives should be selected after actual usage begins. Initial target should favor simple, frequent backups over premature high-availability infrastructure.

## Restore testing

Restore tests should record:

- backup timestamp
- backup size
- application/database version
- restore environment
- restore duration
- verification results
- failures or manual corrections required

Any undocumented recovery step discovered during testing must be added here or to the relevant SOP.

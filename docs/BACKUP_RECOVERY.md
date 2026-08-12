# Backup and Recovery

**Status: PostgreSQL procedure defined; production schedule/retention pending host selection.**

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

## PostgreSQL backup procedure

Preconditions: `DATABASE_URL` is loaded in the administrator shell, PostgreSQL client tools match the production major version, and the destination is an encrypted/off-host-approved location.

```bash
mkdir -p backups
pg_dump --format=custom --no-owner --file="backups/creator-os-$(date +%Y%m%d-%H%M%S).dump" "$DATABASE_URL"
```

Verify the archive before copying it off host:

```bash
pg_restore --list backups/creator-os-YYYYMMDD-HHMMSS.dump >/dev/null
```

Never commit `backups/` or a database dump. Record the backup timestamp, size, application commit, and PostgreSQL version.

## Restore test procedure

Restore into a new, empty test database—never over the live database:

```bash
createdb creator_os_restore_test
pg_restore --exit-on-error --no-owner --dbname=creator_os_restore_test backups/creator-os-YYYYMMDD-HHMMSS.dump
DATABASE_URL='postgresql://.../creator_os_restore_test' npm run db:check
```

Start a compatible Creator OS revision against the restored test database, verify owner login and critical records, record the result, then destroy the isolated restore-test database only after validation. A failed restore blocks persistence-affecting production changes until understood.

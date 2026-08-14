# Backup and Recovery

## Production policy

`CreatorOS-Backup` runs daily at 2:00 AM and retains 14 days by default. Every run creates a timestamped directory under `C:\ProgramData\CreatorOS\backups` containing:

- `creator-os.dump`: PostgreSQL custom-format dump
- `attachments.zip`: matching attachment directory copy when configured
- `manifest.json`: timestamp, host, size, attachment inclusion, and application commit

The app task is paused while the dump and attachment archive are captured, then restarted in a `finally` block. This creates a coordinated pair without leaving uploads active between the database and filesystem copies. The dump is verified with `pg_restore --list` before success. A failed run removes its incomplete timestamp directory. Backups must never be committed to Git.

## Run and inspect a backup

```powershell
.\deployment\windows\Manage-CreatorOS.ps1 -Action Backup
Get-ScheduledTaskInfo -TaskName CreatorOS-Backup
Get-ChildItem C:\ProgramData\CreatorOS\backups | Sort-Object LastWriteTime -Descending
```

Copy verified backup directories to an approved encrypted off-host destination. A disk failure can destroy live data and same-disk backups together.

## Restore test

Never restore over the live database for a test. Create a new empty test database and use a test-only URL:

```powershell
.\deployment\windows\Restore-Test-CreatorOS.ps1 `
  -BackupDirectory "C:\ProgramData\CreatorOS\backups\YYYYMMDD-HHMMSS" `
  -TestDatabaseUrl "postgresql://creator_os:YOUR_PASSWORD@127.0.0.1:5432/creator_os_restore_test"
```

Start a compatible revision with the test database and test attachment directory. Verify owner login, content, campaigns, samples, calendar state, and several attachment downloads. Record the timestamp, dump size, application/PostgreSQL versions, duration, and outcome. Delete the isolated database only after recording results.

## Live recovery order

1. Stop `CreatorOS-App` and protect the newest backup.
2. Confirm whether data is absent or the app points to the wrong database.
3. Stabilize PostgreSQL and the host.
4. Restore the selected dump only after explicit review.
5. Restore its matching `attachments.zip` to the configured attachment path.
6. Restore `.env.local` through the approved secret process; it is not in data backups.
7. Deploy a database-compatible known-good application revision.
8. Start Creator OS and verify health, login, critical records, and downloads.

Application rollback and database restoration are separate decisions. Never automatically reverse migrations or overwrite live data because a build failed.

Protect manually created content, scripts, campaigns, deliverables, products, samples, publications, settings, authentication ownership, and attachments first. Integration snapshots are reconstructable. Build artifacts, dependencies, and caches are replaceable.
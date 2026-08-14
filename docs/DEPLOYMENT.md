# Windows Production Deployment and Rollback

## Supported production shape

- Host: dedicated Windows 11 computer
- Runtime: Node.js 22.x and the locked Next.js version
- Database: local PostgreSQL running as its normal automatic Windows service
- App manager: Task Scheduler task `CreatorOS-App`, running as `SYSTEM` at startup
- Backup manager: Task Scheduler task `CreatorOS-Backup`, daily at 2:00 AM
- Network: authenticated Creator OS on the intended LAN/Tailscale address; no public internet exposure
- App checkout: dedicated clean Git checkout
- Environment: `<AppRoot>\.env.local`, restricted to Administrators and SYSTEM
- Data root: `C:\ProgramData\CreatorOS`
- Attachments: absolute path from `ATTACHMENT_STORAGE_PATH`, outside Git
- Logs: `C:\ProgramData\CreatorOS\logs`
- Backups: `C:\ProgramData\CreatorOS\backups`
- Health: `/api/health`

Closing the browser or signing out does not stop Creator OS. The background task launches the production server, restarts it with bounded backoff after an exit, prevents duplicate task instances, and requires no interactive login.

## Preconditions

1. Install Git, Node.js 22.x, PostgreSQL, and matching PostgreSQL client tools.
2. Confirm PostgreSQL is configured to start automatically.
3. Clone `CaptShadows/Creator-OS` into a dedicated production directory.
4. Copy `.env.example` to `.env.local`, set real values, remove `OWNER_EMAIL`, `OWNER_DISPLAY_NAME`, and `OWNER_PASSWORD` after bootstrap, and never commit it. The installer refuses long-lived bootstrap credentials.
5. Set `ATTACHMENT_STORAGE_PATH` to an absolute directory outside the checkout.
6. Decide the URL Tonya will use: `http://localhost:3000` on the host or the approved Tailscale address from another client.
7. Open PowerShell as Administrator only for installation or maintenance.

## Initial install

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\deployment\windows\Install-CreatorOS.ps1 -PublicUrl "http://localhost:3000"
```

The installer validates configuration and Node 22, protects data and environment paths, installs locked dependencies, migrates and builds, registers both tasks, creates the public desktop shortcut, starts Creator OS, waits for healthy app/database status, and starts the first backup.

If PostgreSQL tools are not on `PATH`, add its `bin` directory to the machine PATH first. Do not copy database passwords into scripts.

## Administration

```powershell
.\deployment\windows\Manage-CreatorOS.ps1 -Action Status
.\deployment\windows\Manage-CreatorOS.ps1 -Action Health
.\deployment\windows\Manage-CreatorOS.ps1 -Action Restart
.\deployment\windows\Manage-CreatorOS.ps1 -Action Logs
.\deployment\windows\Manage-CreatorOS.ps1 -Action Backup
```

Tonya does not run these commands. They are administrator recovery commands.

## Update

The update refuses to continue if the production checkout has local changes.

```powershell
.\deployment\windows\Update-CreatorOS.ps1 -PublicUrl "http://localhost:3000"
```

It creates a verified backup, stops the app, fetches approved `main`, installs locked dependencies, applies forward migrations, builds, restarts, checks health, and records the previous commit as known-good.

## Application rollback

Rollback does not reverse database migrations.

```powershell
.\deployment\windows\Rollback-CreatorOS.ps1 -Commit "KNOWN_GOOD_COMMIT" -PublicUrl "http://localhost:3000"
```

Only roll back to a revision compatible with the current database. Database restoration is a separate explicit recovery decision.

## Remove background tasks

```powershell
.\deployment\windows\Uninstall-CreatorOSService.ps1 -RemoveShortcut
```

This removes tasks and the optional shortcut. It preserves the checkout, environment, PostgreSQL data, attachments, logs, and backups.

## Acceptance run before handoff

Record the date, computer, and deployed commit, then verify:

1. Cold-restart Windows without opening an administrator session; the shortcut works after startup.
2. Close the browser and sign out; Creator OS remains available.
3. Stop the Node child process; the runner restarts it and health returns.
4. Restart PostgreSQL; health reports the outage and then recovers.
5. Click the shortcut repeatedly; only one app task runs.
6. Create and edit test content, campaign, sample, and calendar records.
7. Run a backup and clean restore test.
8. Perform one update and application rollback.
9. Confirm logs contain no password, storage key, session token, or private content body.

Production is not accepted until every item passes on the actual computer.
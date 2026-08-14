param([switch]$RemoveShortcut)
. (Join-Path $PSScriptRoot "CreatorOS.Common.ps1")
Assert-Administrator
Stop-ScheduledTask -TaskName "CreatorOS-App" -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "CreatorOS-App" -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "CreatorOS-Backup" -Confirm:$false -ErrorAction SilentlyContinue
if ($RemoveShortcut) { Remove-Item -LiteralPath (Join-Path $env:PUBLIC "Desktop\Creator OS.lnk") -Force -ErrorAction SilentlyContinue }
Write-Host "Creator OS background tasks were removed. Application files, environment settings, PostgreSQL data, attachments, logs, and backups were preserved."